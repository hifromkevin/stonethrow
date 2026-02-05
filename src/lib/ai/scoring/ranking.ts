import createClient from '@/lib/supabase/server';
import { toBadges } from '@/lib/ai/scoring/badges';
import type {
  Pebble,
  RankedPebble,
  RankedPebblesResponse,
  FocusStatement,
} from '@/types';

export async function getRankedPebbles(
  userId: string,
  focusId?: string
): Promise<RankedPebblesResponse> {
  const supabase = await createClient();

  // Get active focus
  let focus: FocusStatement | null = null;
  if (focusId) {
    const { data } = await supabase
      .from('focus_statements')
      .select('*')
      .eq('id', focusId)
      .eq('user_id', userId)
      .single();
    focus = data;
  } else {
    const { data } = await supabase
      .from('focus_statements')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    focus = data;
  }

  // Fetch pebbles with scores
  const { data: pebbles, error } = await supabase
    .from('pebbles')
    .select(
      `
      *,
      pebble_content_scores (*),
      pebble_focus_scores (*)
    `
    )
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error || !pebbles) {
    console.error('Failed to fetch pebbles for ranking:', error);
    return { focus, primary: null, focused: [], other: [] };
  }

  // Build ranked pebbles
  const rankedPebbles: RankedPebble[] = pebbles.map((p: any) => {
    const contentScore = p.pebble_content_scores?.[0] ?? null;
    const focusScore = focus
      ? p.pebble_focus_scores?.find(
          (fs: any) => fs.focus_id === focus!.id
        ) ?? null
      : null;

    return {
      pebble: p as Pebble,
      content_score: contentScore,
      focus_score: focusScore,
      final_score:
        focusScore?.final_score ??
        (contentScore?.content_score ?? 0.5) * 100,
      bucket: (focusScore?.bucket as 'primary' | 'focused' | 'other') ?? 'other',
      badges: toBadges(focusScore?.badges ?? []),
      explanation: focusScore?.explanation ?? undefined,
    };
  });

  // Sort by final_score descending
  rankedPebbles.sort((a, b) => b.final_score - a.final_score);

  // When no focus, just put the top pebble as primary and everything else as other
  if (!focus) {
    return {
      focus: null,
      primary:
        rankedPebbles.length > 0
          ? { ...rankedPebbles[0], bucket: 'primary' }
          : null,
      focused: [],
      other: rankedPebbles.slice(1),
    };
  }

  // Partition into buckets based on stored bucket assignments
  const primary =
    rankedPebbles.find((r) => r.bucket === 'primary') ??
    (rankedPebbles.length > 0 ? rankedPebbles[0] : null);

  const focused = rankedPebbles.filter(
    (r) => r.bucket === 'focused' && r !== primary
  );

  const other = rankedPebbles.filter(
    (r) => r.bucket === 'other' && r !== primary
  );

  return {
    focus,
    primary: primary ? { ...primary, bucket: 'primary' } : null,
    focused,
    other,
  };
}
