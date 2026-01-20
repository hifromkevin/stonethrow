export type Topic = {
  id: string;
  label: string;
  confidence: number;
};

export type Pebble = {
  id: string;
  user_id: string;
  title: string;
  canonical_url: string;
  original_url: string;
  description?: string;
  domain: string;
  notes?: string;
  group_name: string;
  group_color: string;
  is_starred: boolean;
  is_archived: boolean;
  image_url?: string;

  created_at: string;
  source_type?: string;
  status: 'inbox' | 'active' | 'completed' | 'archived';
  ai_summary?: string;
  ai_tags: string[];
  feedback_rating?: number;
  feedback_reason?: string;
  completed_at?: string;
  last_interacted_at?: string;
  image_source?: 'og' | 'twitter' | 'youtube' | 'dom' | 'fallback';
  is_upvoted: boolean;
};

export type OtherPebbleGroup = {
  id: string;
  subject: string;
  reason: string;
  items: Pebble[];
};

// IntentContext {
//   urgency: 'low' | 'medium' | 'high'
//   duration: 'quick' | 'short' | 'session' | 'deep'
//   difficulty: 'low' | 'medium' | 'high'
//   mode: 'hands-on' | 'watch' | 'read' | 'explore'
//   energy: 'low' | 'normal' | 'high'
// }

// Readability
// {
// "content_access": "full" | "partial" | "none",
// "promo_score": 0.8,
// "actionability": 0.2,
// "specificity": 0.1,
// "signals": ["upsell", "vague claims", "personal story"]
// }
