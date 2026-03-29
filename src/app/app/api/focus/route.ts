import { NextResponse, after } from 'next/server';
import createClient from '@/lib/supabase/server';
import { AIError } from '@/lib/ai/errors';
import validateFocusSafety from '@/lib/ai/safety/focus-validator';
import { scoreFocusBatch } from '@/lib/ai/scoring/focus-score';
import {
  rankByEmbedding,
  storeFocusEmbedding,
  type EmbeddingRankResult,
} from '@/lib/ai/embeddings/embed-focus';
import { getRankedPebbles } from '@/lib/ai/scoring/ranking';
import { MODELS } from '@/lib/ai/client';

const focusStartTime = Date.now();
const logTime = (stage: string) => {
  const elapsed = Date.now() - focusStartTime;
  console.log(`[FOCUS_TIMING] ${stage}: ${elapsed}ms`);
};

export async function POST(req: Request) {
  logTime('FOCUS_START');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const body = await req.json();
  const statement = body?.statement;

  if (!statement || typeof statement !== 'string') {
    return NextResponse.json(
      { ok: false, error: 'INVALID_INPUT' },
      { status: 400 }
    );
  }

  const trimmed = statement.trim();

  // Step 1: Validate safety
  const safetyResult = await validateFocusSafety(trimmed);
  logTime('FOCUS_VALIDATED');

  if (!safetyResult.is_safe) {
    return NextResponse.json(
      {
        ok: false,
        error: 'UNSAFE_FOCUS',
        rejection_reason: safetyResult.rejection_reason,
        alternatives: safetyResult.alternatives,
      },
      { status: 422 }
    );
  }

  // Step 2: Deactivate any existing active focus
  await supabase
    .from('focus_statements')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('is_active', true);

  // Step 3: Insert new focus
  const { data: focus, error } = await supabase
    .from('focus_statements')
    .insert({
      user_id: user.id,
      statement: trimmed,
      is_active: true,
      is_safe: true,
      model_version: MODELS.FOCUS_VALIDATE,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to insert focus:', error);
    return NextResponse.json({ ok: false, error: 'DB_ERROR' }, { status: 500 });
  }

  // Step 4: Get embedding-based ranking immediately (FAST PATH)
  // This returns ranked results in ~200ms + embedding API call, no Haiku calls
  let rankedResults;
  let embeddingRanks: EmbeddingRankResult[] = [];
  let focusEmbedding: number[] | null = null;
  try {
    const result = await rankByEmbedding(focus.statement, user.id);
    embeddingRanks = result.ranks;
    focusEmbedding = result.embedding;
    logTime('EMBEDDING_RANKED');

    rankedResults = await getRankedPebbles(user.id, focus.id, embeddingRanks);
  } catch (err) {
    console.error('Failed to get embedding ranking, falling back:', err);
    rankedResults = await getRankedPebbles(user.id, focus.id);
  }

  logTime('RESULTS_RETURNED');

  // Step 5: Store the focus embedding in the background using the vector we already have
  // (avoids a second Voyage AI call)
  after(async () => {
    if (focusEmbedding) {
      await storeFocusEmbedding(focus.id, focusEmbedding);
    }
  });

  // Step 6: Kick off Haiku enrichment for top 15 in background (non-blocking)
  // User already has ranked results, this just enriches them with explanations/badges
  after(async () => {
    logTime('ENRICHMENT_START');
    try {
      await scoreFocusBatch(user.id, focus.id, focus.statement);
      logTime('ENRICHMENT_DONE');
    } catch (err) {
      if (err instanceof AIError) {
        console.error(
          `⚠️ Background enrichment degraded for focus: ${focus.id} [${err.code}] ${err.message}`
        );
      } else {
        console.error(
          '⚠️ Background enrichment degraded for focus:',
          focus.id,
          err
        );
      }
      // Don't fail the request — user already has rankings
    }
  });

  return NextResponse.json({ ok: true, data: rankedResults });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from('focus_statements')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found
    return NextResponse.json({ ok: false, error: 'DB_ERROR' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: data ?? null });
}
