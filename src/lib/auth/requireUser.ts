import { createClient } from '@/lib/supabase/server';

const requireUser = async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('❌ auth.getUser error:', error);
    return null;
  }

  if (!user) {
    console.warn('⚠️ No authenticated user');
    return null;
  }

  return user;
};

export default requireUser;
