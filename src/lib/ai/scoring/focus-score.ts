import { callLLM } from '@/lib/ai/callLLM';
import { MODELS } from '@/lib/ai/client';
import { AIError } from '@/lib/ai/errors';
import {
  FOCUS_SCORE_SYSTEM_PROMPT,
  buildFocusScoreUserPrompt,
} from '@/lib/ai/prompts/focus-score';
import createClient from '@/lib/supabase/server';
import type {
  FocusBatchLLMResponse,
  FocusScoreLLMResponse,
  FocusScore,
} from '@/types/scoring';

const MAX_BATCH_SIZE = 20;

// MVP: assume general beginner-to-intermediate user
const USER_CAPABILITY_ESTIMATE = 0.5;

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

  // DifficultyFit: 1 when difficulty matches user capability, 0 at extremes
  const difficulty_fit =
    1 - Math.abs(difficulty_estimate - USER_CAPABILITY_ESTIMATE);

  // Scale from 0.7 to 1.0 based on difficulty fit
  const difficultyFitMultiplier = 0.7 + 0.3 * difficulty_fit;

  const momentum_adjusted = momentum * difficultyFitMultiplier;
  const contextual_readiness_adjusted =
    contextual_readiness * difficultyFitMultiplier;

  const relevance_score =
    0.5 * focus_relevance +
    0.3 * momentum_adjusted +
    0.2 * contextual_readiness_adjusted;

  // FinalScore on 0-100 scale
  const final_score = (0.45 * contentScore + 0.55 * relevance_score) * 100;

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
  raw_text: string | null;
  paywalled: boolean;
  content_score?: number;
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

  // Assign buckets: top 1 = primary, >= 70 = focused, rest = other
  if (focusScores.length > 0) {
    focusScores.sort((a, b) => b.final_score - a.final_score);
    focusScores[0].bucket = 'primary';

    for (let i = 1; i < focusScores.length; i++) {
      focusScores[i].bucket =
        focusScores[i].final_score >= 70 ? 'focused' : 'other';
    }
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
  const { data: pebbles, error: fetchError } = await supabase
    .from('pebbles')
    .select(
      `
      id, title, description, domain, raw_text, paywalled,
      pebble_content_scores (content_score)
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
    raw_text: p.raw_text,
    paywalled: p.paywalled ?? false,
    content_score: p.pebble_content_scores?.[0]?.content_score ?? 0.5,
  }));

  // Split into batches
  const batches: PebbleInput[][] = [];
  for (let i = 0; i < pebbleInputs.length; i += MAX_BATCH_SIZE) {
    batches.push(pebbleInputs.slice(i, i + MAX_BATCH_SIZE));
  }

  console.log(`📦 Scoring ${pebbleInputs.length} pebbles in ${batches.length} batch(es) (parallel)`);

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

      console.log(`🤖 Starting batch ${index + 1}/${batches.length} (${batch.length} pebbles)`);

      try {
        const llmResponse = await callLLM<FocusBatchLLMResponse>({
          model: MODELS.FOCUS_SCORE,
          systemPrompt: FOCUS_SCORE_SYSTEM_PROMPT,
          userPrompt: buildFocusScoreUserPrompt(focusStatement, batch),
          maxTokens: 8192,
        });

        // Process scores for this batch (without bucket assignment yet)
        const batchScores: Array<FocusScore & { pebble_id: string; focus_id: string }> = [];
        const scoredPebbleIds = new Set<string>();

        for (const rawScore of llmResponse.scores) {
          const pebbleInput = batch.find((p) => p.id === rawScore.pebble_id);
          if (!pebbleInput) {
            console.warn('LLM returned score for unknown pebble:', rawScore.pebble_id);
            continue;
          }

          scoredPebbleIds.add(rawScore.pebble_id);
          const computed = computeFocusScore(rawScore, pebbleInput.content_score ?? 0.5);
          batchScores.push({
            ...computed,
            pebble_id: rawScore.pebble_id,
            focus_id: focusId,
          });
        }

        // Handle pebbles that LLM skipped - assign default scores
        const skippedPebbles = batch.filter((p) => !scoredPebbleIds.has(p.id));
        if (skippedPebbles.length > 0) {
          console.warn(`⚠️ Batch ${index + 1}: LLM skipped ${skippedPebbles.length} pebble(s), assigning defaults`);
          for (const pebble of skippedPebbles) {
            const defaultScore: FocusScore & { pebble_id: string; focus_id: string } = {
              focus_relevance: 0.3,
              momentum: 0.3,
              contextual_readiness: 0.3,
              difficulty_estimate: 0.5,
              difficulty_fit: 1 - Math.abs(0.5 - USER_CAPABILITY_ESTIMATE),
              momentum_adjusted: 0.3,
              contextual_readiness_adjusted: 0.3,
              relevance_score: 0.3,
              final_score: (0.45 * (pebble.content_score ?? 0.5) + 0.55 * 0.3) * 100,
              badges: [],
              explanation: 'Unable to fully analyze this pebble. It may need more context.',
              bucket: 'other',
              confidence: 0.3,
              evidence: '',
              pebble_id: pebble.id,
              focus_id: focusId,
            };
            batchScores.push(defaultScore);
          }
        }

        console.log(`✅ Batch ${index + 1} completed (${llmResponse.scores.length} scores, ${skippedPebbles.length} defaults)`);
        return batchScores;
      } catch (error) {
        // Handle AIError with proper classification
        if (error instanceof AIError) {
          console.error(`❌ Batch ${index + 1} failed: [${error.code}] ${error.message}`);

          // Stop all batches on non-retryable errors (billing, auth, etc.)
          if (!error.retryable) {
            criticalError = error;
            console.error(`🛑 Critical error - stopping all batches: ${error.code}`);
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
  const allFocusScores = batchResults.flat();

  // Assign buckets across ALL scores: top 1 = primary, >= 70 = focused, rest = other
  if (allFocusScores.length > 0) {
    allFocusScores.sort((a, b) => b.final_score - a.final_score);
    allFocusScores[0].bucket = 'primary';

    for (let i = 1; i < allFocusScores.length; i++) {
      allFocusScores[i].bucket =
        allFocusScores[i].final_score >= 70 ? 'focused' : 'other';
    }
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
    raw_text: string | null;
    paywalled: boolean;
  }
): Promise<void> {
  const supabase = await createClient();

  // Get content score for this pebble
  const { data: contentScoreData } = await supabase
    .from('pebble_content_scores')
    .select('content_score')
    .eq('pebble_id', pebble.id)
    .single();

  const pebbleInput: PebbleInput = {
    ...pebble,
    content_score: contentScoreData?.content_score ?? 0.5,
  };

  const llmResponse = await callLLM<FocusBatchLLMResponse>({
    model: MODELS.FOCUS_SCORE,
    systemPrompt: FOCUS_SCORE_SYSTEM_PROMPT,
    userPrompt: buildFocusScoreUserPrompt(focusStatement, [pebbleInput]),
    maxTokens: 1024,
  });

  const focusScores = processLLMScores(llmResponse, [pebbleInput], focusId);

  // For a single pebble, we need to check existing scores to assign bucket correctly
  // The single pebble defaults to 'primary' from processLLMScores since it's the only one
  // Re-assign based on score threshold instead
  if (focusScores.length > 0) {
    const score = focusScores[0];
    score.bucket = score.final_score >= 70 ? 'focused' : 'other';
  }

  await persistFocusScores(focusScores);
}
