'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function useSignOut() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signOut = async () => {
    setLoading(true);
    setError(null);

    const res = await fetch('/api/auth/signout', {
      method: 'POST',
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Sign out failed');
      return;
    }

    // Important: replace so user can't go "back"
    router.replace('/login');
  };

  return { signOut, loading, error };
}
