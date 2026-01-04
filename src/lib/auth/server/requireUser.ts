import createClient from '@/lib/supabase/server';

const requireUser = async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user) console.error('⚠️ No authenticated user found in requireUser');

  if (error || !user) {
    console.warn('⚠️ Error fetching user in requireUser:', error);
    return null;
  }

  return user;
};

export default requireUser;
