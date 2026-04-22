'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuth from '@/lib/queries/useAuth';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CenteredComponent from '@/components/layout/CenteredComponent';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signUp(email, password);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <main className="flex min-h-screen w-screen items-center justify-center bg-slate-100">
      <CenteredComponent ariaLabel="signup-card">
        <Card className="m-10 w-full max-w-xl">
          <div className="flex flex-col items-center px-6 py-6 text-center">
            <h1 className="var(--font-afacad) var(--tracking-widest) text-2xl text-slate-800">
              stonethrow
            </h1>
            <p className="mt-1 text-sm text-slate-500">Create your account</p>
            <form className="mt-8 w-full space-y-4" onSubmit={handleSignUp}>
              <div className="space-y-2 text-left">
                <label
                  className="block text-sm font-medium text-slate-700"
                  htmlFor="signup-email"
                >
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="Email"
                  required
                  className="mb-3 w-full rounded border px-3 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2 text-left">
                <label
                  className="block text-sm font-medium text-slate-700"
                  htmlFor="signup-password"
                >
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="Password"
                  required
                  className="mb-4 w-full rounded border px-3 py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <p role="alert" className="mb-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <Button
                label="Create account"
                type="submit"
                overrides="w-full"
                disabled={loading}
              />
            </form>
            <footer className="mt-6 w-full text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link href="/login" className="text-slate-700 underline hover:text-slate-900">
                  Sign in
                </Link>
              </p>
            </footer>
          </div>
        </Card>
      </CenteredComponent>
    </main>
  );
}
