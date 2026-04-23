import { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { CircleQuestionMark } from 'lucide-react';

import EllipsisIcon from '@/components/ui/Ellipsis/EllipsisIcon';
import ScoreLabel from '@/components/ui/ScoreLabel/ScoreLabel';
import Tooltip from '@/components/ui/Tooltip/Tooltip';

import { Pebble } from '@/types';
import type { Badge } from '@/types/scoring';

import cleanTitle from '@/lib/urls/cleanTitle';

const FocusedPebbleRow = ({
  pebble,
  onDelete,
  badges = [],
  explanation,
  rank,
}: {
  pebble: Pebble;
  onDelete: (pebbleId: string) => void;
  badges?: Badge[];
  explanation?: string;
  rank?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayTitle =
    cleanTitle(pebble.title) || pebble.domain || pebble.canonical_url;

  const domainLabel = pebble.domain
    ? `(${pebble.domain})`
    : pebble.canonical_url;

  return (
    <article
      className="group mb-2 overflow-hidden rounded-xl border border-slate-200 bg-white hover:bg-slate-50 md:cursor-default cursor-pointer"
      onClick={() => setIsExpanded((prev) => !prev)}
    >
      {/* Main row */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <figure className="aspect-square w-12 shrink-0 overflow-hidden md:w-14">
          {pebble.image_url ? (
            <img
              src={pebble.image_url}
              alt={pebble.description || pebble.title || 'Pebble Image'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100">
              <Globe className="h-6 w-6 text-slate-400" />
            </div>
          )}
        </figure>

        <div className="min-w-0 py-2 pl-1">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-600">
            <a
              href={pebble?.canonical_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {displayTitle}
            </a>
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <a
              className="flex-shrink-0 whitespace-nowrap text-xs text-slate-400"
              href={pebble?.canonical_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {domainLabel}
            </a>
            {rank !== undefined && <ScoreLabel rank={rank} />}
          </div>
        </div>

        <div
          className="flex items-center gap-1 pr-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Desktop only: ? tooltip */}
          <div className="hidden md:flex md:items-center">
            <Tooltip content={explanation ?? 'Scoring in progress...'}>
              <CircleQuestionMark className="text-xs text-slate-500 hover:bg-slate-100" />
            </Tooltip>
          </div>
          <EllipsisIcon
            url={pebble?.canonical_url}
            onDelete={onDelete}
            pebbleId={pebble.id}
          />
          {/* Mobile only: chevron */}
          <ChevronDown
            className={`md:hidden h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Mobile only: expandable "Why this matters" panel */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
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
    </article>
  );
};
export default FocusedPebbleRow;
