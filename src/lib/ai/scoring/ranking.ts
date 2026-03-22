import createClient from '@/lib/supabase/server';
import {
  rankByEmbedding,
  matchPebblesByEmbedding,
  type EmbeddingRankResult,
} from '@/lib/ai/embeddings/embed-focus';
import { toBadges } from '@/lib/ai/scoring/badges';
import type {
  Pebble,
  RankedPebble,
  RankedPebblesResponse,
  FocusStatement,
  ScoringStatus,
} from '@/types';

// Simple in-memory cache for embedding ranks during a focus session
// Key: `${userId}:${focusId}`, Value: embedding ranks
const embeddingRankCache = new Map<
  string,
  { ranks: EmbeddingRankResult[]; timestamp: number }
>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getRankedPebbles(
  userId: string,
  focusId?: string,
  precomputedEmbeddingRanks?: EmbeddingRankResult[],
  pollUpdatesOnly = false
): Promise<RankedPebblesResponse> {
  const supabase = await createClient();

  // Get active focus
  let focus: FocusStatement | null = null;
  if (focusId) {
    const { data } = await supabase
      .from('focus_statements')
      .select('*')
      .eq('id', focusId)
      .eq('user_id', userId)
      .single();
    focus = data;
  } else {
    const { data } = await supabase
      .from('focus_statements')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    focus = data;
  }

  // If no focus, return all pebbles with content scores (original behavior)
  if (!focus) {
    const { data: pebbles, error } = await supabase
      .from('pebbles')
      .select(
        `
        *,
        pebble_content_scores (*)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !pebbles) {
      console.error('Failed to fetch pebbles:', error);
      return {
        focus: null,
        primary: null,
        focused: [],
        collection: [],
        other: [],
        scoringStatus: {
          isScoring: false,
          scoringStuck: false,
          scoredCount: 0,
          totalCount: 0,
        },
      };
    }

    const rankedPebbles: RankedPebble[] = pebbles.map((p: any) => ({
      pebble: p as Pebble,
      content_score: p.pebble_content_scores?.[0] ?? null,
      focus_score: null,
      final_score: (p.pebble_content_scores?.[0]?.content_score ?? 0.5) * 100,
      bucket: 'other' as const,
      badges: [],
      explanation: undefined,
    }));

    const primary =
      rankedPebbles.length > 0
        ? { ...rankedPebbles[0], bucket: 'primary' as const }
        : null;

    return {
      focus: null,
      primary,
      focused: [],
      collection: [],
      other: rankedPebbles.slice(1),
      scoringStatus: {
        isScoring: false,
        scoringStuck: false,
        scoredCount: pebbles.length,
        totalCount: pebbles.length,
      },
    };
  }

  // ============================================
  // FOCUS IS SET: Use embeddings-first approach
  // ============================================

  try {
    // Step 1: Get embedding-based ranking (use precomputed, cache, or compute)
    let embeddingRanks = precomputedEmbeddingRanks;
    const cacheKey = focusId ? `${userId}:${focusId}` : null;

    if (!embeddingRanks && cacheKey) {
      // Check cache first (for polling requests)
      const cached = embeddingRankCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        embeddingRanks = cached.ranks;
        console.log(`[CACHE] Using cached embedding ranks for ${cacheKey}`);
      }
    }

    if (!embeddingRanks) {
      // For poll-only requests, skip re-embedding and fall back to Haiku ranking.
      // Embedding order doesn't change between polls — only focus_scores do.
      if (pollUpdatesOnly) {
        console.log(
          `[CACHE] Poll-only request with cold cache for ${cacheKey}, falling back to Haiku ranking`
        );
        return fallbackHaikuRanking(supabase, userId, focus);
      }

      // Use the stored focus embedding if available — avoids a Voyage AI call
      if (focus.embedding) {
        console.log(`[CACHE] Using stored focus embedding for ${cacheKey}`);
        embeddingRanks = await matchPebblesByEmbedding(focus.embedding, userId);
      } else {
        // No stored embedding yet — call Voyage AI
        const result = await rankByEmbedding(focus.statement, userId);
        embeddingRanks = result.ranks;
      }

      // Cache the results
      if (cacheKey) {
        embeddingRankCache.set(cacheKey, {
          ranks: embeddingRanks,
          timestamp: Date.now(),
        });
        console.log(`[CACHE] Cached embedding ranks for ${cacheKey}`);
      }
    }

    if (!embeddingRanks || embeddingRanks.length === 0) {
      console.warn(
        'No pebbles found by embedding ranking for focus:',
        focus.id,
        '— falling back to Haiku ranking'
      );
      return fallbackHaikuRanking(supabase, userId, focus);
    }

    // Step 2: Fetch full pebble data for ranked IDs
    const pebbleIds = embeddingRanks.map((r) => r.pebble_id);
    const fetchStartTime = Date.now();
    const { data: pebbles } = await supabase
      .from('pebbles')
      .select(
        `
        *,
        pebble_content_scores (*),
        pebble_focus_scores (*)
      `
      )
      .in('id', pebbleIds)
      .eq('user_id', userId);
    const fetchElapsed = Date.now() - fetchStartTime;
    console.log(
      `[RANKING_TIMING] Fetch pebble data for ${pebbleIds.length} pebbles: ${fetchElapsed}ms`
    );

    if (!pebbles) {
      console.error('Failed to fetch pebbles for ranked IDs');
      return {
        focus,
        primary: null,
        focused: [],
        collection: [],
        other: [],
        scoringStatus: {
          isScoring: false,
          scoringStuck: false,
          scoredCount: 0,
          totalCount: pebbleIds.length,
        },
      };
    }

    // Step 3: Build ranked results, maintaining embedding order
    // Also check for Haiku enrichment (focus_score) per pebble
    const rankedPebbles = embeddingRanks
      .map((rank, index) => {
        const pebble = pebbles.find((p: any) => p.id === rank.pebble_id);
        if (!pebble) return null;

        const contentScore = pebble.pebble_content_scores?.[0] ?? null;
        const focusScore =
          pebble.pebble_focus_scores?.find(
            (fs: any) => fs.focus_id === focus.id
          ) ?? null;

        // Primary sort: embedding similarity
        // Secondary: Haiku enrichment if available (for explanations/badges)
        const final_score = rank.similarity * 100;

        // Debug logging for bucket assignment
        if (index < 10) {
          console.log(
            `[BUCKET_DEBUG] Pebble ${index + 1}: similarity=${rank.similarity.toFixed(3)}, final_score=${final_score.toFixed(1)}, has_focus_score=${!!focusScore}`
          );
        }

        // Bucket assignment based on rank position + enrichment + similarity
        let bucket: 'primary' | 'focused' | 'collection' | 'other';
        if (index === 0) {
          bucket = 'primary';
        } else if (focusScore && focusScore.bucket) {
          // If Haiku enrichment exists, respect its bucket (may change during enrichment)
          bucket = focusScore.bucket;
        } else if (rank.similarity > 0.5) {
          // High similarity (50%+) even without Haiku enrichment
          bucket = 'focused';
        } else if (rank.similarity < 0.3) {
          // Low similarity - entertainment goes to collection, everything else to other
          const contentCategory = contentScore?.content_category;
          bucket = contentCategory === 'entertainment' ? 'collection' : 'other';
        } else {
          bucket = 'other';
        }

        return {
          pebble: pebble as Pebble,
          content_score: contentScore,
          focus_score: focusScore,
          final_score,
          bucket,
          badges: focusScore ? toBadges(focusScore.badges ?? []) : [],
          explanation: focusScore?.explanation ?? undefined,
          // Track if Haiku enrichment is still pending
          isEnriching: !focusScore,
        };
      })
      .filter((r) => r !== null) as RankedPebble[];

    // Step 4: Track scoring status
    // "Enriching" = waiting for Haiku explanations for pebbles that don't have focus_score yet
    const enrichedCount = rankedPebbles.filter((r) => r.focus_score).length;
    const isEnriching = enrichedCount < rankedPebbles.length;

    const SCORING_TIMEOUT_MS = 5 * 60 * 1000;
    const focusAge = Date.now() - new Date(focus.created_at).getTime();
    const scoringStuck = isEnriching && focusAge > SCORING_TIMEOUT_MS;

    const scoringStatus: ScoringStatus = {
      isScoring: isEnriching && !scoringStuck,
      scoringStuck,
      scoredCount: enrichedCount,
      totalCount: rankedPebbles.length,
    };

    // Step 5: Bucket sorting
    const primary =
      rankedPebbles.find((r) => r.bucket === 'primary') ??
      (rankedPebbles.length > 0 ? rankedPebbles[0] : null);

    const focused = rankedPebbles.filter(
      (r) => r.bucket === 'focused' && r !== primary
    );

    const collection = rankedPebbles.filter(
      (r) => r.bucket === 'collection' && r !== primary
    );

    const other = rankedPebbles.filter(
      (r) => r.bucket === 'other' && r !== primary
    );

    return {
      focus,
      primary: primary ? { ...primary, bucket: 'primary' } : null,
      focused,
      collection,
      other,
      scoringStatus,
    };
  } catch (err) {
    console.error(
      'Failed in rankByEmbedding, falling back to Haiku-only:',
      err
    );

    // Fallback: use Haiku scores only (no embeddings)
    // This is a graceful degradation if embedding API is down
    return fallbackHaikuRanking(supabase, userId, focus);
  }
}

/**
 * Fallback ranking when embeddings aren't available.
 * Uses Haiku focus_score as the primary sort.
 */
async function fallbackHaikuRanking(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  focus: FocusStatement
): Promise<RankedPebblesResponse> {
  const { data: pebbles, error } = await supabase
    .from('pebbles')
    .select(
      `
      *,
      pebble_content_scores (*),
      pebble_focus_scores (*)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !pebbles) {
    console.error('Fallback ranking failed:', error);
    return {
      focus,
      primary: null,
      focused: [],
      collection: [],
      other: [],
      scoringStatus: {
        isScoring: false,
        scoringStuck: false,
        scoredCount: 0,
        totalCount: 0,
      },
    };
  }

  let enrichedCount = 0;
  const rankedPebbles: RankedPebble[] = pebbles.map((p: any) => {
    const contentScore = p.pebble_content_scores?.[0] ?? null;
    const focusScore =
      p.pebble_focus_scores?.find((fs: any) => fs.focus_id === focus.id) ??
      null;

    if (focusScore) enrichedCount++;

    return {
      pebble: p as Pebble,
      content_score: contentScore,
      focus_score: focusScore,
      final_score:
        focusScore?.final_score ?? (contentScore?.content_score ?? 0.5) * 100,
      bucket:
        (focusScore?.bucket as
          | 'primary'
          | 'focused'
          | 'collection'
          | 'other') ?? 'other',
      badges: toBadges(focusScore?.badges ?? []),
      explanation: focusScore?.explanation ?? undefined,
    };
  });

  const totalCount = pebbles.length;
  const SCORING_TIMEOUT_MS = 5 * 60 * 1000;
  const focusAge = Date.now() - new Date(focus.created_at).getTime();
  const scoringStuck =
    enrichedCount < totalCount && focusAge > SCORING_TIMEOUT_MS;
  const isScoring =
    focus !== null && enrichedCount < totalCount && !scoringStuck;

  rankedPebbles.sort((a, b) => b.final_score - a.final_score);

  const primary =
    rankedPebbles.find((r) => r.bucket === 'primary') ??
    (rankedPebbles.length > 0 ? rankedPebbles[0] : null);

  const focused = rankedPebbles.filter(
    (r) => r.bucket === 'focused' && r !== primary
  );

  const collection = rankedPebbles.filter(
    (r) => r.bucket === 'collection' && r !== primary
  );

  const other = rankedPebbles.filter(
    (r) => r.bucket === 'other' && r !== primary
  );

  return {
    focus,
    primary: primary ? { ...primary, bucket: 'primary' } : null,
    focused,
    collection,
    other,
    scoringStatus: {
      isScoring,
      scoringStuck,
      scoredCount: enrichedCount,
      totalCount,
    },
  };
}
