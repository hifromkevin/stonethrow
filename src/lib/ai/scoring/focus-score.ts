import { callLLM } from '@/lib/ai/callLLM';
import { MODELS } from '@/lib/ai/client';
import { AIError } from '@/lib/ai/errors';
import {
  FOCUS_SCORE_SYSTEM_PROMPT,
  buildFocusScoreUserPrompt,
} from '@/lib/ai/prompts/focus-score';
import createClient from '@/lib/supabase/server';
import type {
  ContentCategory,
  FocusBatchLLMResponse,
  FocusScoreLLMResponse,
  FocusScore,
} from '@/types/scoring';

const MAX_BATCH_SIZE = 20;

const clamp = (value: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, value));

const computeFocusScore = (
  raw: FocusScoreLLMResponse,
  contentScore: number
): FocusScore => {
  const focus_relevance = clamp(raw.focus_relevance);
  const momentum = clamp(raw.momentum);
  const contextual_readiness = clamp(raw.contextual_readiness);
  const difficulty_estimate = clamp(raw.difficulty_estimate);

  // Difficulty matching disabled — score purely on relevance, momentum, readiness
  const difficulty_fit = 1;
  const momentum_adjusted = momentum;
  const contextual_readiness_adjusted = contextual_readiness;

  const relevance_score =
    0.5 * focus_relevance +
    0.3 * momentum_adjusted +
    0.2 * contextual_readiness_adjusted;

  // Quality gate: content_score filters junk (< 0.3) but doesn't compete with relevance.
  // Passing content sinks with relevance_score alone.
  const quality_gate = contentScore >= 0.3 ? 1.0 : contentScore / 0.3;
  const final_score = quality_gate * relevance_score * 100;

  return {
    focus_relevance,
    momentum,
    contextual_readiness,
    difficulty_estimate,
    difficulty_fit,
    momentum_adjusted,
    contextual_readiness_adjusted,
    relevance_score,
    final_score,
    badges: raw.badges ?? [],
    explanation: raw.explanation ?? '',
    bucket: 'other', // assigned post-hoc
    confidence: clamp(raw.confidence),
    evidence: raw.evidence ?? '',
  };
};

type PebbleInput = {
  id: string;
  title: string | null;
  description: string | null;
  domain: string | null;
  paywalled: boolean;
  content_score?: number;
  content_category?: ContentCategory;
};

/**
 * Assign buckets to a fully sorted (descending final_score) array of scores.
 *
 * Rules:
 * 1. Rank-based: rank 1 → primary, ranks 2–ceil(n*0.15) → focused, rest → other.
 * 2. Relevance gate: if focus_relevance < 0.65, cap at 'other' regardless of rank.
 * 3. If NO pebble has focus_relevance >= 0.65, all buckets become 'other' — no
 *    Top/Strong badges shown at all, keeping labels consistent with coaching hints.
 */
const assignBuckets = (
  scores: Array<FocusScore & { pebble_id: string; focus_id: string }>
): void => {
  const total = scores.length;
  const focusedCutoff = Math.ceil(total * 0.15); // upper bound (exclusive) for 'focused' tier
  const hasAnyRelevant = scores.some((s) => s.focus_relevance >= 0.65);

  for (let i = 0; i < total; i++) {
    const score = scores[i];

    if (!hasAnyRelevant || score.focus_relevance < 0.65) {
      score.bucket = 'other';
      continue;
    }

    if (i === 0) {
      score.bucket = 'primary';
    } else if (i < focusedCutoff) {
      score.bucket = 'focused';
    } else {
      score.bucket = 'other';
    }
  }
};

async function persistFocusScores(
  scores: Array<FocusScore & { pebble_id: string; focus_id: string }>
): Promise<void> {
  const supabase = await createClient();

  for (const score of scores) {
    const { error } = await supabase.from('pebble_focus_scores').upsert(
      {
        pebble_id: score.pebble_id,
        focus_id: score.focus_id,
        focus_relevance: score.focus_relevance,
        momentum: score.momentum,
        contextual_readiness: score.contextual_readiness,
        difficulty_estimate: score.difficulty_estimate,
        difficulty_fit: score.difficulty_fit,
        momentum_adjusted: score.momentum_adjusted,
        contextual_readiness_adjusted: score.contextual_readiness_adjusted,
        relevance_score: score.relevance_score,
        final_score: score.final_score,
        badges: score.badges,
        explanation: score.explanation,
        bucket: score.bucket,
        confidence: score.confidence,
        evidence: score.evidence,
        model_version: MODELS.FOCUS_SCORE,
      },
      { onConflict: 'pebble_id,focus_id' }
    );

    if (error) {
      console.error('Failed to persist focus score:', error);
    }
  }
}

const processLLMScores = (
  llmResponse: FocusBatchLLMResponse,
  pebbleInputs: PebbleInput[],
  focusId: string
): Array<FocusScore & { pebble_id: string; focus_id: string }> => {
  const focusScores: Array<
    FocusScore & { pebble_id: string; focus_id: string }
  > = [];

  for (const rawScore of llmResponse.scores) {
    const pebbleInput = pebbleInputs.find((p) => p.id === rawScore.pebble_id);
    if (!pebbleInput) {
      console.warn(
        'LLM returned score for unknown pebble:',
        rawScore.pebble_id
      );
      continue;
    }

    const computed = computeFocusScore(
      rawScore,
      pebbleInput.content_score ?? 0.5
    );
    focusScores.push({
      ...computed,
      pebble_id: rawScore.pebble_id,
      focus_id: focusId,
    });
  }

  // Assign buckets
  if (focusScores.length > 0) {
    focusScores.sort((a, b) => b.final_score - a.final_score);
    assignBuckets(focusScores);
  }

  return focusScores;
};

/**
 * Score all of a user's pebbles against a focus statement in batches.
 */
export async function scoreFocusBatch(
  userId: string,
  focusId: string,
  focusStatement: string
): Promise<void> {
  const supabase = await createClient();

  // Fetch ALL pebbles with their content scores (no limit)
  // raw_text is intentionally omitted — content_score already encapsulates content quality
  const { data: pebbles, error: fetchError } = await supabase
    .from('pebbles')
    .select(
      `
      id, title, description, domain, paywalled,
      pebble_content_scores (content_score, content_category)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error('📦 scoreFocusBatch: fetch error:', fetchError);
    return;
  }
  if (!pebbles?.length) {
    console.warn('No pebbles to score');
    return;
  }

  const pebbleInputs: PebbleInput[] = pebbles.map((p: any) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    domain: p.domain,
    paywalled: p.paywalled ?? false,
    content_score: p.pebble_content_scores?.[0]?.content_score ?? 0.5,
    content_category:
      p.pebble_content_scores?.[0]?.content_category ?? undefined,
  }));

  // pre-filter based on quality and category
  const pebblesToScore = pebbleInputs.filter(
    (p) =>
      (p.content_score ?? 0) >= 0.3 &&
      p.content_category !== 'entertainment' &&
      p.content_category !== 'commercial'
  );
  const skippedPebbles = pebbleInputs.filter(
    (p) => !pebblesToScore.includes(p)
  );

  // Split remaining pebbles into batches
  const batches: PebbleInput[][] = [];
  for (let i = 0; i < pebblesToScore.length; i += MAX_BATCH_SIZE) {
    batches.push(pebblesToScore.slice(i, i + MAX_BATCH_SIZE));
  }

  console.log(
    `📦 Scoring ${pebbleInputs.length} pebbles in ${batches.length} batch(es) (parallel)`
  );

  // Track if we hit a non-retryable error that should stop all processing
  let criticalError: AIError | null = null;

  // Process all batches in parallel
  const batchResults = await Promise.all(
    batches.map(async (batch, index) => {
      // Skip if another batch hit a critical error
      if (criticalError) {
        console.warn(`⏭️ Skipping batch ${index + 1} due to critical error`);
        return [];
      }

      console.log(
        `🤖 Starting batch ${index + 1}/${batches.length} (${batch.length} pebbles)`
      );

      try {
        const llmResponse = await callLLM<FocusBatchLLMResponse>({
          model: MODELS.FOCUS_SCORE,
          systemPrompt: FOCUS_SCORE_SYSTEM_PROMPT,
          userPrompt: buildFocusScoreUserPrompt(focusStatement, batch),
          maxTokens: 8192,
          cacheSystemPrompt: true,
        });

        // Process scores for this batch (without bucket assignment yet)
        const batchScores: Array<
          FocusScore & { pebble_id: string; focus_id: string }
        > = [];
        const scoredPebbleIds = new Set<string>();

        for (const rawScore of llmResponse.scores) {
          const pebbleInput = batch.find((p) => p.id === rawScore.pebble_id);
          if (!pebbleInput) {
            console.warn(
              'LLM returned score for unknown pebble:',
              rawScore.pebble_id
            );
            continue;
          }

          scoredPebbleIds.add(rawScore.pebble_id);
          const computed = computeFocusScore(
            rawScore,
            pebbleInput.content_score ?? 0.5
          );
          batchScores.push({
            ...computed,
            pebble_id: rawScore.pebble_id,
            focus_id: focusId,
          });
        }

        // Handle pebbles that LLM skipped - assign default scores
        const skippedPebbles = batch.filter((p) => !scoredPebbleIds.has(p.id));
        if (skippedPebbles.length > 0) {
          console.warn(
            `⚠️ Batch ${index + 1}: LLM skipped ${skippedPebbles.length} pebble(s), assigning defaults`
          );
          for (const pebble of skippedPebbles) {
            const defaultScore: FocusScore & {
              pebble_id: string;
              focus_id: string;
            } = {
              focus_relevance: 0.3,
              momentum: 0.3,
              contextual_readiness: 0.3,
              difficulty_estimate: 0.5,
              difficulty_fit: 1,
              momentum_adjusted: 0.3,
              contextual_readiness_adjusted: 0.3,
              relevance_score: 0.3,
              final_score: (() => {
                const cs = pebble.content_score ?? 0.5;
                const qg = cs >= 0.3 ? 1.0 : cs / 0.3;
                return qg * 0.3 * 100;
              })(),
              badges: [],
              explanation:
                'Unable to fully analyze this pebble. It may need more context.',
              bucket: 'other',
              confidence: 0.3,
              evidence: '',
              pebble_id: pebble.id,
              focus_id: focusId,
            };
            batchScores.push(defaultScore);
          }
        }

        console.log(
          `✅ Batch ${index + 1} completed (${llmResponse.scores.length} scores, ${skippedPebbles.length} defaults)`
        );
        return batchScores;
      } catch (error) {
        // Handle AIError with proper classification
        if (error instanceof AIError) {
          console.error(
            `❌ Batch ${index + 1} failed: [${error.code}] ${error.message}`
          );

          // Stop all batches on non-retryable errors (billing, auth, etc.)
          if (!error.retryable) {
            criticalError = error;
            console.error(
              `🛑 Critical error - stopping all batches: ${error.code}`
            );
          }
        } else {
          console.error(`❌ Batch ${index + 1} failed:`, error);
        }
        return [];
      }
    })
  );

  // If we hit a critical error, throw it so the caller knows
  if (criticalError) {
    throw criticalError;
  }

  // Flatten all batch results into single array
  let allFocusScores = batchResults.flat();

  // Add default scores for pebbles we filtered out earlier
  if (skippedPebbles.length > 0) {
    const skippedDefaults = skippedPebbles.map((p) => {
      const base = {
        focus_relevance: 0.3,
        momentum: 0.3,
        contextual_readiness: 0.3,
        difficulty_estimate: 0.5,
        difficulty_fit: 1,
        momentum_adjusted: 0.3,
        contextual_readiness_adjusted: 0.3,
        relevance_score: 0.3,
        final_score: 10,
        badges: [],
        explanation:
          'Filtered out — content quality too low or not actionable.',
        bucket: 'other' as const,
        confidence: 0.3,
        evidence: '',
      };
      return {
        ...base,
        pebble_id: p.id,
        focus_id: focusId,
      };
    });
    allFocusScores = allFocusScores.concat(skippedDefaults);
  }

  // Assign buckets across ALL scores
  if (allFocusScores.length > 0) {
    allFocusScores.sort((a, b) => b.final_score - a.final_score);
    assignBuckets(allFocusScores);
  }

  // Persist all scores
  console.log(`💾 Persisting ${allFocusScores.length} focus scores`);
  await persistFocusScores(allFocusScores);
  console.log(`🎉 Finished scoring all ${allFocusScores.length} pebbles`);
}

/**
 * Score a single pebble against an active focus (used when adding a pebble while focus exists).
 */
export async function scoreFocusSingle(
  focusId: string,
  focusStatement: string,
  pebble: {
    id: string;
    title: string | null;
    description: string | null;
    domain: string | null;
    raw_text?: string | null; // accepted but not forwarded to prompt — content_score covers this
    paywalled: boolean;
  }
): Promise<void> {
  const supabase = await createClient();

  // Get content score for this pebble
  const { data: contentScoreData } = await supabase
    .from('pebble_content_scores')
    .select('content_score, content_category')
    .eq('pebble_id', pebble.id)
    .single();

  const pebbleInput: PebbleInput = {
    ...pebble,
    content_score: contentScoreData?.content_score ?? 0.5,
    content_category: contentScoreData?.content_category ?? undefined,
  };

  const llmResponse = await callLLM<FocusBatchLLMResponse>({
    model: MODELS.FOCUS_SCORE,
    systemPrompt: FOCUS_SCORE_SYSTEM_PROMPT,
    userPrompt: buildFocusScoreUserPrompt(focusStatement, [pebbleInput]),
    maxTokens: 1024,
    cacheSystemPrompt: true,
  });

  const focusScores = processLLMScores(llmResponse, [pebbleInput], focusId);

  // For a single pebble there's no rank context, so apply the relevance gate only.
  // It will compete for the primary slot at query time via embedding rank.
  if (focusScores.length > 0) {
    const score = focusScores[0];
    score.bucket = score.focus_relevance >= 0.65 ? 'focused' : 'other';
  }

  await persistFocusScores(focusScores);
}
