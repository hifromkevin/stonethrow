-- Reconcile schema drift caused by GUI-applied SQL not tracked in migrations.
-- This migration is intentionally idempotent so it can be applied safely to
-- environments that are partially up to date.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS vector;

-- ---------------------------------------------------------------------------
-- Enum alignment
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    WHERE t.typname = 'pebble_status'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'pebble_status'
        AND e.enumlabel = 'inbox'
    ) THEN
      ALTER TYPE pebble_status ADD VALUE 'inbox';
    END IF;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Pebbles table fixes
-- ---------------------------------------------------------------------------
ALTER TABLE pebbles DROP CONSTRAINT IF EXISTS pebbles_canonical_url_key;
ALTER TABLE pebbles DROP CONSTRAINT IF EXISTS pebbles_user_canonical_url_key;
ALTER TABLE pebbles ADD CONSTRAINT pebbles_user_canonical_url_key UNIQUE (user_id, canonical_url);

ALTER TABLE pebbles
  ADD COLUMN IF NOT EXISTS raw_text text,
  ADD COLUMN IF NOT EXISTS paywalled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_main_focus boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS main_focus_score double precision;

ALTER TABLE pebbles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own pebbles" ON pebbles;
CREATE POLICY "Users can view own pebbles"
  ON pebbles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own pebbles" ON pebbles;
CREATE POLICY "Users can insert own pebbles"
  ON pebbles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own pebbles" ON pebbles;
CREATE POLICY "Users can update own pebbles"
  ON pebbles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own pebbles" ON pebbles;
CREATE POLICY "Users can delete own pebbles"
  ON pebbles FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Focus statements
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS focus_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  statement text NOT NULL,
  is_active boolean DEFAULT true,
  is_safe boolean DEFAULT true,
  safety_rejection_reason text,
  safety_alternatives text[],
  embedding vector(1024),
  model_version text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_focus_active_per_user
  ON focus_statements (user_id)
  WHERE is_active = true;

ALTER TABLE focus_statements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own focus" ON focus_statements;
CREATE POLICY "Users can view own focus"
  ON focus_statements FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own focus" ON focus_statements;
CREATE POLICY "Users can insert own focus"
  ON focus_statements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own focus" ON focus_statements;
CREATE POLICY "Users can update own focus"
  ON focus_statements FOR UPDATE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Stage A scoring (focus-independent)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pebble_content_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pebble_id uuid NOT NULL REFERENCES pebbles(id) ON DELETE CASCADE,
  actionability real NOT NULL CHECK (actionability BETWEEN 0 AND 1),
  signal_to_noise real NOT NULL CHECK (signal_to_noise BETWEEN 0 AND 1),
  time_to_value real NOT NULL CHECK (time_to_value BETWEEN 0 AND 1),
  time_relevance real NOT NULL CHECK (time_relevance BETWEEN 0 AND 1),
  effort_friction real NOT NULL CHECK (effort_friction BETWEEN 0 AND 1),
  content_score real NOT NULL CHECK (content_score BETWEEN 0 AND 1),
  content_category text CHECK (content_category IN ('actionable', 'entertainment', 'reference', 'commercial')),
  confidence real CHECK (confidence BETWEEN 0 AND 1),
  evidence text,
  model_version text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pebble_id)
);

ALTER TABLE pebble_content_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own content scores" ON pebble_content_scores;
CREATE POLICY "Users can view own content scores"
  ON pebble_content_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pebbles
      WHERE pebbles.id = pebble_content_scores.pebble_id
        AND pebbles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own content scores" ON pebble_content_scores;
CREATE POLICY "Users can insert own content scores"
  ON pebble_content_scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pebbles
      WHERE pebbles.id = pebble_content_scores.pebble_id
        AND pebbles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own content scores" ON pebble_content_scores;
CREATE POLICY "Users can update own content scores"
  ON pebble_content_scores FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pebbles
      WHERE pebbles.id = pebble_content_scores.pebble_id
        AND pebbles.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Stage B scoring (focus-dependent)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pebble_focus_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pebble_id uuid NOT NULL REFERENCES pebbles(id) ON DELETE CASCADE,
  focus_id uuid NOT NULL REFERENCES focus_statements(id) ON DELETE CASCADE,
  focus_relevance real NOT NULL CHECK (focus_relevance BETWEEN 0 AND 1),
  momentum real NOT NULL CHECK (momentum BETWEEN 0 AND 1),
  contextual_readiness real NOT NULL CHECK (contextual_readiness BETWEEN 0 AND 1),
  difficulty_estimate real NOT NULL CHECK (difficulty_estimate BETWEEN 0 AND 1),
  difficulty_fit real CHECK (difficulty_fit BETWEEN 0 AND 1),
  momentum_adjusted real CHECK (momentum_adjusted BETWEEN 0 AND 1),
  contextual_readiness_adjusted real CHECK (contextual_readiness_adjusted BETWEEN 0 AND 1),
  relevance_score real NOT NULL CHECK (relevance_score BETWEEN 0 AND 1),
  final_score real NOT NULL CHECK (final_score BETWEEN 0 AND 100),
  badges text[] DEFAULT '{}',
  explanation text,
  bucket text CHECK (bucket IN ('primary', 'focused', 'collection', 'other')),
  confidence real CHECK (confidence BETWEEN 0 AND 1),
  evidence text,
  model_version text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pebble_id, focus_id)
);

ALTER TABLE pebble_focus_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own focus scores" ON pebble_focus_scores;
CREATE POLICY "Users can view own focus scores"
  ON pebble_focus_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pebbles
      WHERE pebbles.id = pebble_focus_scores.pebble_id
        AND pebbles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own focus scores" ON pebble_focus_scores;
CREATE POLICY "Users can insert own focus scores"
  ON pebble_focus_scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pebbles
      WHERE pebbles.id = pebble_focus_scores.pebble_id
        AND pebbles.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own focus scores" ON pebble_focus_scores;
CREATE POLICY "Users can update own focus scores"
  ON pebble_focus_scores FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pebbles
      WHERE pebbles.id = pebble_focus_scores.pebble_id
        AND pebbles.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Embeddings + similarity search
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pebble_embeddings (
  pebble_id uuid PRIMARY KEY REFERENCES pebbles(id) ON DELETE CASCADE,
  embedding vector(1024),
  model_version text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pebble_embeddings_embedding_idx
  ON pebble_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

DROP FUNCTION IF EXISTS match_pebbles(vector, uuid, float, int);
CREATE OR REPLACE FUNCTION match_pebbles(
  query_embedding vector(1024),
  match_user_id uuid,
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  pebble_id uuid,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    pe.pebble_id,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM pebble_embeddings pe
  INNER JOIN pebbles p ON p.id = pe.pebble_id
  LEFT JOIN pebble_content_scores pcs ON pcs.pebble_id = pe.pebble_id
  WHERE p.user_id = match_user_id
    AND COALESCE(pcs.content_score, 0.5) >= 0.3
    AND 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- ---------------------------------------------------------------------------
-- Grouping tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pebble_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  ai_generated_name text,
  ai_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pebble_groups_user_id_idx
  ON pebble_groups(user_id);

CREATE TABLE IF NOT EXISTS pebble_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pebble_id uuid NOT NULL REFERENCES pebbles(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES pebble_groups(id) ON DELETE CASCADE,
  confidence_score float DEFAULT 1.0,
  added_by text DEFAULT 'ai',
  ai_reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (pebble_id, group_id)
);

CREATE INDEX IF NOT EXISTS pebble_group_members_pebble_idx
  ON pebble_group_members(pebble_id);

CREATE INDEX IF NOT EXISTS pebble_group_members_group_idx
  ON pebble_group_members(group_id);

ALTER TABLE pebble_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE pebble_group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their groups" ON pebble_groups;
CREATE POLICY "Users can view their groups"
  ON pebble_groups FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create groups" ON pebble_groups;
CREATE POLICY "Users can create groups"
  ON pebble_groups FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their groups" ON pebble_groups;
CREATE POLICY "Users can update their groups"
  ON pebble_groups FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their groups" ON pebble_groups;
CREATE POLICY "Users can delete their groups"
  ON pebble_groups FOR DELETE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view memberships" ON pebble_group_members;
CREATE POLICY "Users can view memberships"
  ON pebble_group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM pebbles p
      WHERE p.id = pebble_group_members.pebble_id
        AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create memberships" ON pebble_group_members;
CREATE POLICY "Users can create memberships"
  ON pebble_group_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM pebbles p
      WHERE p.id = pebble_group_members.pebble_id
        AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete memberships" ON pebble_group_members;
CREATE POLICY "Users can delete memberships"
  ON pebble_group_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM pebbles p
      WHERE p.id = pebble_group_members.pebble_id
        AND p.user_id = auth.uid()
    )
  );

-- Keep updated_at in sync for pebble_groups rows.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pebble_groups_updated_at ON pebble_groups;
CREATE TRIGGER pebble_groups_updated_at
BEFORE UPDATE ON pebble_groups
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
