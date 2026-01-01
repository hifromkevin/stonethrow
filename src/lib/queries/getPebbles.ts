import { createClient } from '@/lib/supabase/server';
import requireUser from '@/lib/auth/requireUser';

export async function getPebbles() {
  const supabase = await createClient();
  const user = await requireUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('pebbles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to fetch pebbles:', error);
    return [];
  }

  return data;
}
