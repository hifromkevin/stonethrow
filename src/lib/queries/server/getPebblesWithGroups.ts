import createClient from '@/lib/supabase/server';

export type GroupedPebble = {
  id: string;
  name: string;
  pebbles: any[];
};

const getPebblesWithGroups = async (userId: string) => {
  const supabase = await createClient();

  const { data: pebbles, error } = await supabase
    .from('pebbles')
    .select(
      `
      *,
      pebble_group_members (
        confidence_score,
        pebble_groups (
          id,
          name
        )
      )
    `
    )
    .eq('user_id', userId);

  if (error) throw error;

  const grouped: Record<string, GroupedPebble> = {};
  const ungrouped: any[] = [];

  for (const pebble of pebbles ?? []) {
    const memberships = pebble.pebble_group_members;

    if (!memberships?.length) {
      ungrouped.push(pebble);
      continue;
    }

    for (const m of memberships) {
      const group = m.pebble_groups;
      if (!group) continue;

      if (!grouped[group.id]) {
        grouped[group.id] = {
          id: group.id,
          name: group.name,
          pebbles: [],
        };
      }

      grouped[group.id].pebbles.push(pebble);
    }
  }

  return {
    groupedPebbles: Object.values(grouped),
    otherPebbles: ungrouped,
  };
};

export default getPebblesWithGroups;
