import { callLLM } from '@/lib/ai/callLLM';
import { MODELS } from '@/lib/ai/client';
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

const MAX_BATCH_SIZE = 50;

// MVP: assume general beginner-to-intermediate user
const USER_CAPABILITY_ESTIMATE = 0.5;

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function computeFocusScore(
  raw: FocusScoreLLMResponse,
  contentScore: number
): FocusScore {
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
  const final_score =
    (0.45 * contentScore + 0.55 * relevance_score) * 100;

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
}

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

function processLLMScores(
  llmResponse: FocusBatchLLMResponse,
  pebbleInputs: PebbleInput[],
  focusId: string
): Array<FocusScore & { pebble_id: string; focus_id: string }> {
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
}

/**
 * Score all of a user's active pebbles against a focus statement in a single batch LLM call.
 */
export async function scoreFocusBatch(
  userId: string,
  focusId: string,
  focusStatement: string
): Promise<void> {
  const supabase = await createClient();

  // Fetch active pebbles with their content scores
  const { data: pebbles, error: fetchError } = await supabase
    .from('pebbles')
    .select(
      `
      id, title, description, domain, raw_text, paywalled,
      pebble_content_scores (content_score)
    `
    )
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(MAX_BATCH_SIZE);

  if (fetchError || !pebbles?.length) {
    console.warn('No pebbles to score or fetch error:', fetchError);
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

  const llmResponse = await callLLM<FocusBatchLLMResponse>({
    model: MODELS.FOCUS_SCORE,
    systemPrompt: FOCUS_SCORE_SYSTEM_PROMPT,
    userPrompt: buildFocusScoreUserPrompt(focusStatement, pebbleInputs),
    maxTokens: 4096,
  });

  const focusScores = processLLMScores(llmResponse, pebbleInputs, focusId);
  await persistFocusScores(focusScores);
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

  const focusScores = processLLMScores(
    llmResponse,
    [pebbleInput],
    focusId
  );

  // For a single pebble, we need to check existing scores to assign bucket correctly
  // The single pebble defaults to 'primary' from processLLMScores since it's the only one
  // Re-assign based on score threshold instead
  if (focusScores.length > 0) {
    const score = focusScores[0];
    score.bucket = score.final_score >= 70 ? 'focused' : 'other';
  }

  await persistFocusScores(focusScores);
}
