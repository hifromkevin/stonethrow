-- Add done-queue columns to pebbles.
-- is_complete drives all active-list filters; completed_at is set together.
-- notes is free-form text attached to completed pebbles.

ALTER TABLE pebbles
  ADD COLUMN IF NOT EXISTS is_complete  BOOLEAN    NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS notes        TEXT                DEFAULT NULL;

-- Rebuild match_pebbles so completed pebbles never surface in AI ranking.
DROP FUNCTION IF EXISTS match_pebbles(vector, uuid, float, int);
CREATE OR REPLACE FUNCTION match_pebbles(
  query_embedding  vector(1024),
  match_user_id    uuid,
  match_threshold  float,
  match_count      int
)
RETURNS TABLE (
  pebble_id  uuid,
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
    AND p.is_complete = false
    AND COALESCE(pcs.content_score, 0.5) >= 0.3
    AND 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
