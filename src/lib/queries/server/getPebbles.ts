import createClient from '@/lib/supabase/server';
import requireUser from '@/lib/auth/server/requireUser';
import { Pebble } from '@/types';

const getPebbles = async (): Promise<Pebble[]> => {
  const user = await requireUser();

  const supabase = await createClient();

  if (!user) return [];

  const { data, error } = await supabase
    .from('pebbles')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_complete', false)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data ?? [];
};
export default getPebbles;
