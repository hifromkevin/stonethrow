-- ENUMS
CREATE TYPE pebble_source_type AS ENUM (
  'article',
  'video',
  'documentation',
  'product',
  'social',
  'unknown'
);

CREATE TYPE pebble_image_source AS ENUM (
  'og',
  'twitter',
  'youtube',
  'dom',
  'fallback'
);

CREATE TYPE pebble_status AS ENUM (
  'active',
  'completed',
  'archived'
);

-- TABLE
CREATE TABLE IF NOT EXISTS pebbles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  original_url text NOT NULL,
  canonical_url text NOT NULL UNIQUE,
  domain text,

  title text,
  description text,

  image_url text,
  image_source pebble_image_source,

  source_type pebble_source_type DEFAULT 'unknown',
  status pebble_status DEFAULT 'active',

  is_starred boolean DEFAULT false,
  is_upvoted boolean DEFAULT false,

  ai_summary text,
  ai_tags text[],

  notes text,
  feedback_rating integer CHECK (feedback_rating BETWEEN 1 AND 5),
  feedback_reason text,

  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  last_interacted_at timestamptz
);
