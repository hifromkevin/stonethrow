'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CircleQuestionMark } from 'lucide-react';

import EllipsisIcon from '@/components/ui/Ellipsis/EllipsisIcon';
import Tooltip from '@/components/ui/Tooltip/Tooltip';

import { Pebble } from '@/types';

import cleanTitle from '@/lib/urls/cleanTitle';

const SinglePebble = ({
  pebble,
  onDelete,
  explanation,
  onMarkComplete,
}: {
  pebble: Pebble;
  onDelete: (pebbleId: string) => void;
  explanation?: string;
  onMarkComplete?: (pebbleId: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const domainLabel = pebble.domain
    ? `(${pebble.domain})`
    : pebble.canonical_url;

  const handleMarkComplete = () => {
    setIsCompleting(true);
    setTimeout(() => {
      onMarkComplete?.(pebble.id);
    }, 200);
  };

  return (
    <div
      className={`relative cursor-pointer transition-all duration-200 odd:bg-white even:bg-slate-50/40 hover:bg-slate-50/50 md:cursor-default ${
        isCompleting ? 'opacity-0 -translate-y-1' : 'opacity-60 hover:opacity-100'
      }`}
      onClick={() => setIsExpanded((prev) => !prev)}
    >
      {/* grid-cols-[1fr_auto_auto]: content | info (? or ⌄) | ellipsis */}
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-slate-600">
            <a
              href={pebble?.canonical_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {cleanTitle(pebble.title)}
            </a>
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <a
              className="flex-shrink-0 whitespace-nowrap text-xs text-slate-400"
              href={pebble?.canonical_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {domainLabel}
            </a>
          </div>
        </div>

        {/* Info column: ? on desktop, chevron on mobile — same grid cell */}
        <div
          className="flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip content={explanation ?? 'Scoring in progress...'}>
            <CircleQuestionMark className="hidden text-xs text-slate-300 md:block" />
          </Tooltip>
          <ChevronDown
            className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-300 md:hidden ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <EllipsisIcon
            url={pebble?.canonical_url}
            onDelete={onDelete}
            pebbleId={pebble.id}
            onMarkComplete={onMarkComplete ? handleMarkComplete : undefined}
          />
        </div>
      </div>

      {/* Mobile only: expandable "Why this matters" panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
          isExpanded ? 'max-h-64' : 'max-h-0'
        }`}
      >
        <div className="px-4 pb-4 pt-1">
          <p className="mb-1.5 text-sm font-semibold text-gray-700">
            Why this matters
          </p>
          <div className="border-l-4 border-[var(--color-primary)] pl-3">
            <p className="text-sm leading-relaxed text-gray-600">
              {explanation ?? 'Scoring in progress...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePebble;
