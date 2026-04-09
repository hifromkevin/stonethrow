import { useState } from 'react';
import { CircleQuestionMark, Globe } from 'lucide-react';

import EllipsisIcon from '@/components/ui/Ellipsis/EllipsisIcon';
import ScoreLabel from '@/components/ui/ScoreLabel/ScoreLabel';
import Tooltip from '@/components/ui/Tooltip/Tooltip';

import { Pebble } from '@/types';
import type { Badge } from '@/types/scoring';

import cleanTitle from '@/lib/urls/cleanTitle';

const BADGE_COLOR: Record<string, string> = {
  positive: 'text-green-700',
  neutral: 'text-slate-500',
  negative: 'text-red-600',
};

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [isStarSelected, setIsStarSelected] = useState(pebble.is_starred);
  const onComplete = (id: string) => console.log('complete', id);
  //TODO: handle data changes here
  const onStarChange = (id: string, isStarred: boolean) =>
    console.log('star change', id, isStarred);

  const handleMenu = (action: 'complete' | 'delete') => {
    setMenuOpen(false);
    if (action === 'complete') onComplete(pebble.id);
  };

  const displayTitle =
    cleanTitle(pebble.title) || pebble.domain || pebble.canonical_url;

  return (
    <article className="group mb-2 grid grid-cols-[auto_1fr_auto] items-center gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
      <figure className="aspect-square w-14 shrink-0 overflow-hidden">
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

      <div className="min-w-0 p-2">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 py-1.5">
            <p className="truncate text-sm font-semibold text-slate-600">
              <a
                href={pebble?.canonical_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {displayTitle}
              </a>
            </p>

            <div className="flex items-center gap-2">
              <a
                className="truncate text-sm text-slate-400"
                href={pebble?.canonical_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                ({pebble.domain ? pebble.domain : pebble.canonical_url})
              </a>
              {rank !== undefined && <ScoreLabel rank={rank} />}
            </div>
            {/* {badges.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                <div className="flex flex-wrap items-start gap-2 text-xs">
                  {badges.map((badge, i) => (
                    <span key={badge.name}>
                      {i > 0 && <span className="mr-2 text-slate-300">•</span>}
                      <span className={BADGE_COLOR[badge.category]}>
                        {badge.name}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )} */}
          </div>

          <Tooltip content={explanation ?? 'Scoring in progress...'}>
            <CircleQuestionMark className="text-xs text-slate-500 hover:bg-slate-100" />
          </Tooltip>
        </div>
      </div>

      <div className="flex pt-1">
        <EllipsisIcon
          url={pebble?.canonical_url}
          onDelete={onDelete}
          pebbleId={pebble.id}
        />
      </div>
    </article>
  );
};
export default FocusedPebbleRow;
