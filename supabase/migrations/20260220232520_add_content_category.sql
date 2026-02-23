-- Add content_category to pebble_content_scores (Stage A output)
ALTER TABLE pebble_content_scores
  ADD COLUMN IF NOT EXISTS content_category text
    CHECK (content_category IN ('actionable', 'entertainment', 'reference', 'commercial'));

-- Update bucket constraint in pebble_focus_scores to include 'collection'
-- Drop existing check constraint if present, then re-add with 'collection' included.
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'pebble_focus_scores'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%bucket%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE pebble_focus_scores DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE pebble_focus_scores
  ADD CONSTRAINT pebble_focus_scores_bucket_check
    CHECK (bucket IN ('primary', 'focused', 'collection', 'other'));
