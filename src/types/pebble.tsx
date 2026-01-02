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

  // TODO: Determine ALL fields required to make Pebbles useful

  //   user_signals {
  //   starred
  //   completed
  //   skipped_count
  //   open_count
  //   last_opened_at
  // }

  // source_type: 'video' | 'article' | 'image' | 'repo' | 'interactive/class' | 'audio' | 'other';
  // focus_state: 'focused' | 'unfocused';
  // topics: Topic[];

  // estimated_time:
  // | 'quick'        // ≤10 min
  // | 'short'        // 10–30 min
  // | 'session'      // 30–90 min
  // | 'deep'         // 1.5–3 hrs
  // | 'project'      // 3+ hrs

  // difficulty          // beginner | intermediate | advanced
  // intent_tags         // tutorial | reference | inspiration | overview | opinion [] // ex: [tutorial, reference]
  // topic_embeddings    // vector
  // freshness_score     // How risky is the content of being outdated. EX: Guitar: Decays slowly. React? Decays FAST. API Docs: Hard decay. Philosophy: Barely decays.
  // freshness_score = base_score * topic_decay_factor
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
