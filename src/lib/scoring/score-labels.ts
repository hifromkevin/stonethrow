/**
 * Score label system for displaying match quality without raw numbers.
 * Bucket thresholds based on final_score (0-100).
 */

export type ScoreLabel =
  | 'Top Match'
  | 'Great Match'
  | 'Decent Match'
  | 'Loosely Related'
  | 'Low Relevance';

export type ScoreTier = 'high' | 'standard';

export type ScoreLabelInfo = {
  label: ScoreLabel;
  tier: ScoreTier; // 'high' for 85+, 'standard' for rest
  category: 'excellent' | 'good' | 'moderate' | 'low' | 'minimal';
};

/**
 * Convert a final_score (0-100) to a display label with tier info.
 * Never shows raw numbers in UI.
 */
export function getScoreLabel(score: number): ScoreLabelInfo {
  if (score >= 85) {
    return { label: 'Top Match', tier: 'high', category: 'excellent' };
  }
  if (score >= 75) {
    return { label: 'Top Match', tier: 'standard', category: 'excellent' };
  }
  if (score >= 65) {
    return { label: 'Great Match', tier: 'standard', category: 'good' };
  }
  if (score >= 50) {
    return { label: 'Decent Match', tier: 'standard', category: 'moderate' };
  }
  if (score >= 35) {
    return { label: 'Loosely Related', tier: 'standard', category: 'low' };
  }
  return { label: 'Low Relevance', tier: 'standard', category: 'minimal' };
}

/**
 * Threshold for triggering coach hint (no pebble above this = sparse collection)
 */
export const COACH_HINT_THRESHOLD = 55;

/**
 * Check if collection needs a coach hint (no pebble scores above threshold)
 */
export function needsCoachHint(scores: number[]): boolean {
  if (scores.length === 0) return false;
  return !scores.some((score) => score > COACH_HINT_THRESHOLD);
}

/**
 * Style mappings for score labels
 */
export const SCORE_LABEL_STYLES: Record<
  ScoreLabelInfo['category'],
  { bg: string; text: string; border?: string }
> = {
  excellent: {
    bg: 'bg-green-100',
    text: 'text-green-700',
  },
  good: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  moderate: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
  },
  low: {
    bg: 'bg-slate-100',
    text: 'text-slate-500',
  },
  minimal: {
    bg: 'bg-slate-50',
    text: 'text-slate-400',
  },
};
