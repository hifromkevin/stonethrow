-- Fix match_pebbles: use LEFT JOIN so pebbles without content scores are not silently dropped.
-- COALESCE defaults content_score to 0.5 for unscored pebbles.
-- Drop first to clear any parameter defaults that block CREATE OR REPLACE.
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
  WHERE
    p.user_id = match_user_id
    AND COALESCE(pcs.content_score, 0.5) >= 0.3
    AND 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
