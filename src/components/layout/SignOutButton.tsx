'use client';

import Button from '@/components/ui/Button';
import useSignOut from '@/lib/queries/useSignOut';

const SignOutButton = () => {
  const { signOut, loading } = useSignOut();

  return (
    <Button
      clickFn={signOut}
      disabled={loading}
      variant="secondary"
      label={loading ? 'Signing out…' : 'Sign Out'}
    />
  );
};

export default SignOutButton;
