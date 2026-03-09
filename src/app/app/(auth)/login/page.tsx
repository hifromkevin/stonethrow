'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/lib/queries/useAuth';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CenteredComponent from '@/components/layout/CenteredComponent';
import SignUpModal from '@/components/auth/SignUpModal';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);

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

  return (
    <>
      <main className="flex min-h-screen w-screen items-center justify-center bg-slate-100">
        <CenteredComponent ariaLabel="login-card">
          <Card className="m-10 w-full max-w-xl">
            <div className="flex flex-col items-center px-6 py-6 text-center">
              {/* <img src="/logo.svg" alt="stonethrow" className="h-12" /> */}
              <h1 className="var(--font-afacad) var(--tracking-widest) text-2xl text-slate-800">
                stonethrow
              </h1>
              <form
                className="mt-8 w-full space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignIn();
                }}
              >
                <div className="space-y-2 text-left">
                  <label
                    className="block text-sm font-medium text-slate-700"
                    htmlFor="login-email"
                  >
                    Email
                  </label>

                  <input
                    id="login-email"
                    type="email"
                    placeholder="Email"
                    className="mb-3 w-full rounded border px-3 py-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label
                    className="block text-sm font-medium text-slate-700"
                    htmlFor="login-password"
                  >
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="Password"
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
                  label="Sign in"
                  type="submit"
                  overrides="w-full"
                  disabled={loading}
                />
              </form>
              <footer className="mt-6 w-full">
                <Button
                  label="Don't have a Stonethrow account? Sign up"
                  type="button"
                  variant="secondary"
                  overrides="w-full"
                  clickFn={() => setShowSignUp(true)}
                />
              </footer>
            </div>
          </Card>
        </CenteredComponent>
      </main>

      <SignUpModal open={showSignUp} onClose={() => setShowSignUp(false)} />
    </>
  );
}
