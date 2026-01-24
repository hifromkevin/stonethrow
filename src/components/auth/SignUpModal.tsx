'use client';

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/lib/queries/useAuth';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const SignUpModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const titleId = useId();
  const errorId = useId();

  const { signUp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

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

    onClose();
    router.push('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <dialog
        open
        aria-labelledby={titleId}
        aria-describedby={error ? errorId : undefined}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="p-6">
          <header className="mb-6 text-center">
            <h2 id={titleId} className="text-xl font-semibold">
              Create your Stonethrow account
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Get your ideas organized in minutes
            </p>
          </header>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                required
                className="w-full rounded border px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                required
                className="w-full rounded border px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p id={errorId} role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <footer className="flex gap-2 pt-2">
              <Button
                label="Create account"
                type="submit"
                overrides="w-full"
                disabled={loading}
              />
              <Button
                label="Cancel"
                variant="secondary"
                overrides="w-full"
                type="button"
                clickFn={onClose}
              />
            </footer>
          </form>
        </Card>
      </dialog>
    </div>
  );
};

export default SignUpModal;
