-- pebble_embeddings was created without RLS policies, causing all writes to fail
-- with error 42501. This migration adds the missing policies, matching the pattern
-- used by pebble_content_scores and pebble_focus_scores.
--
-- pebble_embeddings has no user_id column, so policies join through pebbles.

ALTER TABLE pebble_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own embeddings"
  ON pebble_embeddings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pebbles WHERE id = pebble_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own embeddings"
  ON pebble_embeddings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pebbles WHERE id = pebble_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own embeddings"
  ON pebble_embeddings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pebbles WHERE id = pebble_id AND user_id = auth.uid()
    )
  );
