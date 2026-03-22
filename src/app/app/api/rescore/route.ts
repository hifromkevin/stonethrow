import { NextResponse, after } from 'next/server';
import createClient from '@/lib/supabase/server';
import { scoreFocusBatch } from '@/lib/ai/scoring/focus-score';
import { backfillUserEmbeddings } from '@/lib/ai/embeddings/embed-pebble';
import { AIError } from '@/lib/ai/errors';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  // Get active focus
  const { data: focus, error: focusError } = await supabase
    .from('focus_statements')
    .select('id, statement')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (focusError || !focus) {
    return NextResponse.json(
      { ok: false, error: 'NO_ACTIVE_FOCUS' },
      { status: 400 }
    );
  }

  // Delete all existing focus scores for this focus so they get re-scored fresh
  const { error: deleteError } = await supabase
    .from('pebble_focus_scores')
    .delete()
    .eq('focus_id', focus.id);

  if (deleteError) {
    console.error('rescore: failed to clear focus scores:', deleteError);
    return NextResponse.json({ ok: false, error: 'DB_ERROR' }, { status: 500 });
  }

  // Kick off fresh scoring in the background:
  // 1. Backfill any missing pebble embeddings first (so they appear in similarity search)
  // 2. Then re-score all pebbles against the active focus
  after(async () => {
    try {
      await backfillUserEmbeddings(user.id);
    } catch (err) {
      console.error('rescore: embedding backfill failed:', err);
      // Continue to scoring even if backfill partially fails
    }

    try {
      await scoreFocusBatch(user.id, focus.id, focus.statement);
    } catch (err) {
      if (err instanceof AIError) {
        console.error(`rescore: scoring failed [${err.code}] ${err.message}`);
      } else {
        console.error('rescore: scoring failed:', err);
      }
    }
  });

  return NextResponse.json({ ok: true });
}
