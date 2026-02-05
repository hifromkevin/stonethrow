import type { Pebble } from '@/types/pebble';

// Badge system
export type BadgeCategory = 'positive' | 'neutral' | 'negative';

export type BadgeName =
  | 'Quick Win'
  | 'Actionable'
  | 'Beginner Friendly'
  | 'High ROI'
  | 'Strong Focus Match'
  | 'Builds Momentum'
  | 'Time Investment'
  | 'Advanced'
  | 'Reference Material'
  | 'Save for Later'
  | 'Paywalled'
  | 'Clickbait'
  | 'Off Focus'
  | 'Low Signal';

export type Badge = {
  name: BadgeName;
  category: BadgeCategory;
};

// Stage A: Content Score (focus-independent)
export type ContentScoreMetrics = {
  actionability: number;
  signal_to_noise: number;
  time_to_value: number;
  time_relevance: number;
  effort_friction: number;
};

export type ContentScore = ContentScoreMetrics & {
  content_score: number;
  confidence: number;
  evidence: string;
};

// Stage B: Focus Score (focus-dependent)
export type FocusScoreMetrics = {
  focus_relevance: number;
  momentum: number;
  contextual_readiness: number;
  difficulty_estimate: number;
};

export type FocusScore = FocusScoreMetrics & {
  difficulty_fit: number;
  momentum_adjusted: number;
  contextual_readiness_adjusted: number;
  relevance_score: number;
  final_score: number;
  badges: BadgeName[];
  explanation: string;
  bucket: 'primary' | 'focused' | 'other';
  confidence: number;
  evidence: string;
};

// LLM response shapes
export type ContentScoreLLMResponse = {
  actionability: number;
  signal_to_noise: number;
  time_to_value: number;
  time_relevance: number;
  effort_friction: number;
  confidence: number;
  evidence: string;
};

export type FocusScoreLLMResponse = {
  pebble_id: string;
  focus_relevance: number;
  momentum: number;
  contextual_readiness: number;
  difficulty_estimate: number;
  badges: BadgeName[];
  explanation: string;
  confidence: number;
  evidence: string;
};

export type FocusBatchLLMResponse = {
  scores: FocusScoreLLMResponse[];
};

// Focus statement
export type FocusStatement = {
  id: string;
  user_id: string;
  statement: string;
  is_active: boolean;
  is_safe: boolean;
  safety_rejection_reason: string | null;
  safety_alternatives: string[] | null;
  model_version: string | null;
  created_at: string;
  updated_at: string;
};

export type FocusSafetyResult = {
  is_safe: boolean;
  rejection_reason?: string;
  alternatives?: string[];
};

// Ranked pebble (what GET /api/pebbles?ranked=true returns per item)
export type RankedPebble = {
  pebble: Pebble;
  content_score?: ContentScore | null;
  focus_score?: FocusScore | null;
  final_score: number;
  bucket: 'primary' | 'focused' | 'other';
  badges: Badge[];
  explanation?: string;
};

// API response for ranked pebbles
export type RankedPebblesResponse = {
  focus: FocusStatement | null;
  primary: RankedPebble | null;
  focused: RankedPebble[];
  other: RankedPebble[];
};
