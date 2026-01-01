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
  notes?: string;
  group_name: string;
  group_color: string;
  is_starred: boolean;
  is_archived: boolean;
  created_at: string;

  // source_type: 'video' | 'article' | 'image' | 'repo' | 'other';
  // focus_state: 'focused' | 'unfocused';
  // topics: Topic[];

  // estimated_time      // 5–10 min | 30 min | 2 hrs
  // difficulty          // beginner | intermediate | advanced
  // intent_tags         // tutorial | reference | inspiration
  // topic_embeddings    // vector
  // freshness_score
  // user_signals        // starred, completed, skipped
  // content_access = 'full' | 'partial' | 'none'
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
