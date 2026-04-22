-- focus_statements was missing a DELETE RLS policy, causing the delete of the
-- existing active focus to silently fail. This left the unique index constraint
-- (idx_focus_active_per_user) intact, causing the subsequent INSERT to fail
-- with a DB_ERROR 500 when users tried to set a new focus.

CREATE POLICY "Users can delete own focus"
  ON focus_statements FOR DELETE
  USING (auth.uid() = user_id);
