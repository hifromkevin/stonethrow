import { callLLM } from '@/lib/ai/callLLM';
import { MODELS } from '@/lib/ai/client';
import {
  CONTENT_SCORE_SYSTEM_PROMPT,
  buildContentScoreUserPrompt,
} from '@/lib/ai/prompts/content-score';
import createClient from '@/lib/supabase/server';
import type { ContentScoreLLMResponse, ContentScore } from '@/types/scoring';

const WEIGHTS = {
  actionability: 0.3,
  signal_to_noise: 0.25,
  time_to_value: 0.2,
  time_relevance: 0.15,
  effort_friction: 0.1,
} as const;

const clamp = (value: number, min = 0, max = 1): number =>
  Math.max(min, Math.min(max, value));

const computeWeightedScore = (metrics: ContentScoreLLMResponse): number =>
  WEIGHTS.actionability * metrics.actionability +
  WEIGHTS.signal_to_noise * metrics.signal_to_noise +
  WEIGHTS.time_to_value * metrics.time_to_value +
  WEIGHTS.time_relevance * metrics.time_relevance +
  WEIGHTS.effort_friction * metrics.effort_friction;

const sanitizeMetrics = (
  raw: ContentScoreLLMResponse
): ContentScoreLLMResponse => ({
  actionability: clamp(raw.actionability),
  signal_to_noise: clamp(raw.signal_to_noise),
  time_to_value: clamp(raw.time_to_value),
  time_relevance: clamp(raw.time_relevance),
  effort_friction: clamp(raw.effort_friction),
  confidence: clamp(raw.confidence),
  evidence: raw.evidence ?? '',
});

export async function scoreContent(pebble: {
  id: string;
  title: string | null;
  description: string | null;
  domain: string | null;
  raw_text: string | null;
  paywalled: boolean;
}): Promise<ContentScore> {
  const rawMetrics = await callLLM<ContentScoreLLMResponse>({
    model: MODELS.CONTENT_SCORE,
    systemPrompt: CONTENT_SCORE_SYSTEM_PROMPT,
    userPrompt: buildContentScoreUserPrompt(pebble),
    maxTokens: 512,
  });

  const metrics = sanitizeMetrics(rawMetrics);
  const content_score = computeWeightedScore(metrics);

  const result: ContentScore = {
    ...metrics,
    content_score,
  };

  // Persist to database
  const supabase = await createClient();
  const { error } = await supabase.from('pebble_content_scores').upsert(
    {
      pebble_id: pebble.id,
      ...result,
      model_version: MODELS.CONTENT_SCORE,
    },
    { onConflict: 'pebble_id' }
  );

  if (error) {
    console.error('Failed to persist content score:', error);
  }

  return result;
}
