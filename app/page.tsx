'use client';

import { redirect } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) redirect('/login');

  redirect('/dashboard');
}
