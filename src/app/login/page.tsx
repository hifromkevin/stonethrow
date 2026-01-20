'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/lib/queries/useAuth';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CenteredComponent from '@/components/layout/CenteredComponent';
import Link from 'next/link';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push('/dashboard');
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    const { error } = await signUp(email, password);

    setLoading(false);

    if (error) {
      setError(error.message);
      console.error('Sign-up error:', error);
      return;
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-slate-100">
      <CenteredComponent>
        <Card className="m-10 w-full max-w-xl">
          <div className="flex flex-col items-center border-b border-slate-200 px-6 py-6 text-center">
            <img src="/logo.svg" alt="stonethrow" className="h-12" />

            <form className="mt-8 w-full space-y-4">
              <div className="space-y-2 text-left">
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Email"
                  className="mb-3 w-full rounded border px-3 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2 text-left">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  className="mb-4 w-full rounded border px-3 py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

              <Button
                label="Sign in"
                type="submit"
                overrides="w-full"
                clickFn={handleSignIn}
                disabled={loading}
              />
            </form>
            <div className="mt-6">
              <Link
                onClick={handleSignUp}
                href="#"
                className="flex-1 rounded border px-4 py-2"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </Card>
      </CenteredComponent>
    </div>
  );
}
