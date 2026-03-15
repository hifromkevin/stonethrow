'use client';

import { useEffect, useRef, useState } from 'react';
import { Lightbulb, UserCircle } from 'lucide-react';
import type { Pebble } from '@/types/pebble';
import type { CoachHintResponse } from '@/lib/ai/coaching/coach-hint';

type MissingPebblesProps = {
  variant?: 'missing-pebbles';
  focusStatement: string;
  pebbles: Pebble[];
  onAction?: never;
};

type BackgroundContextProps = {
  variant: 'background-context';
  focusStatement?: never;
  pebbles?: never;
  onAction?: () => void;
};

type CoachHintProps = MissingPebblesProps | BackgroundContextProps;

const CoachHint = (props: CoachHintProps) => {
  const [hint, setHint] = useState<CoachHintResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const isMissingPebbles = props.variant !== 'background-context';
  // Prevent re-fetching on every polling update — only fetch once per focus statement
  const hasFetched = useRef(false);
  const lastFocusStatement = useRef<string>('');

  useEffect(() => {
    if (!isMissingPebbles) return;
    if (!props.focusStatement || props.pebbles.length === 0) {
      setHint(null);
      return;
    }

    // Reset if the focus statement changed (user updated their focus)
    if (props.focusStatement !== lastFocusStatement.current) {
      hasFetched.current = false;
      lastFocusStatement.current = props.focusStatement;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchHint = async () => {
      setIsLoading(true);
      setErrorCode(null);

      try {
        const res = await fetch('/api/coach-hint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            focusStatement: props.focusStatement,
            pebbles: props.pebbles,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          setErrorCode(data.error ?? 'UNKNOWN_ERROR');
          return;
        }

        setHint(data.data);
      } catch (err) {
        console.error('Failed to fetch coach hint:', err);
        setErrorCode('NETWORK_ERROR');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHint();
  }, [isMissingPebbles, props.focusStatement, props.pebbles]);

  if (props.variant === 'background-context') {
    return (
      <div className="mx-auto my-6 max-w-2xl">
        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm">
          <div className="mb-3 flex items-start gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <UserCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">
                Your pebbles are on-topic — but we don&apos;t know your level
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                The scoring system sees what you want to achieve, but not where
                you&apos;re starting from. A seasoned engineer eyeing Staff is a
                very different story than someone starting out — and your scores
                should reflect that.
              </p>
            </div>
          </div>

          <div className="ml-12">
            <p className="mb-3 text-sm text-blue-800">
              Add a line about your background to your focus — even one sentence
              helps calibrate your scores significantly.
            </p>
            <button
              onClick={props.onAction}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800"
            >
              Update your focus
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  if (errorCode === 'BILLING_ERROR') {
    return (
      <div className="mx-auto my-6 max-w-2xl">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          AI credits are too low to generate suggestions. Add credits to restore this feature.
        </div>
      </div>
    );
  }

  if (errorCode) {
    return null;
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
