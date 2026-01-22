'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/lib/queries/useAuth';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Sign } from 'crypto';

const SignUpModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { signUp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSignUp = async () => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold">
            Create your Stonethrow account
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Get your ideas organized in minutes
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button
              label="Create account"
              overrides="w-full"
              disabled={loading}
              clickFn={handleSignUp}
            />
            <Button
              label="Cancel"
              variant="secondary"
              overrides="w-full"
              clickFn={onClose}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SignUpModal;
