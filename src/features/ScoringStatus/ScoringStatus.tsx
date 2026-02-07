'use client';

import { useState, useEffect } from 'react';
import type { ScoringStatus as ScoringStatusType } from '@/types';

const LOADING_MESSAGES = [
  'Analyzing relevance to your focus',
  'Evaluating momentum signals',
  'Calculating readiness scores',
  'Prioritizing your pebbles',
  'Finding your best next steps',
];

type Props = {
  scoringStatus: ScoringStatusType;
};

const ScoringStatus = ({ scoringStatus }: Props) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!scoringStatus.isScoring) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [scoringStatus.isScoring]);

  if (!scoringStatus.isScoring) return null;

  const progress = scoringStatus.totalCount > 0
    ? Math.round((scoringStatus.scoredCount / scoringStatus.totalCount) * 100)
    : 0;

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-300 border-t-amber-600" />
          <span className="text-sm font-medium text-amber-800">
            {LOADING_MESSAGES[messageIndex]}...
          </span>
        </div>
        <span className="text-sm tabular-nums text-amber-600">
          {scoringStatus.scoredCount}/{scoringStatus.totalCount}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-amber-200">
        <div
          className="h-full rounded-full bg-amber-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ScoringStatus;
