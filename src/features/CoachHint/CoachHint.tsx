'use client';

import { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import type { Pebble } from '@/types/pebble';
import type { CoachHintResponse } from '@/lib/ai/coaching/coach-hint';

type CoachHintProps = {
  focusStatement: string;
  pebbles: Pebble[];
};

const CoachHint = ({ focusStatement, pebbles }: CoachHintProps) => {
  const [hint, setHint] = useState<CoachHintResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!focusStatement || pebbles.length === 0) {
      setHint(null);
      return;
    }

    const fetchHint = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/app/api/coach-hint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ focusStatement, pebbles }),
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.message ?? 'Failed to generate hint');
        }

        setHint(data.data);
      } catch (err) {
        console.error('Failed to fetch coach hint:', err);
        setError('Unable to generate suggestions right now');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHint();
  }, [focusStatement, pebbles]);

  if (isLoading) {
    return (
      <div className="mx-auto my-6 max-w-2xl">
        <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-300 border-t-amber-600" />
          <span className="text-sm text-amber-700">
            Analyzing your collection...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Silently fail - don't block the UI
  }

  if (!hint) {
    return null;
  }

  return (
    <div className="mx-auto my-6 max-w-2xl">
      <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm">
        <div className="mb-3 flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-2">
            <Lightbulb className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900">
              You&apos;re close - here&apos;s what&apos;s missing
            </h3>
            <p className="mt-1 text-sm text-amber-700">{hint.acknowledgment}</p>
          </div>
        </div>

        <div className="ml-12">
          <p className="mb-2 text-sm text-amber-800">
            <span className="font-medium">Looking for:</span>{' '}
            {hint.missing_content_type}
          </p>

          <div className="mt-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-amber-600">
              Try adding content about:
            </p>
            <ul className="space-y-1.5">
              {hint.suggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-sm text-amber-800"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachHint;
