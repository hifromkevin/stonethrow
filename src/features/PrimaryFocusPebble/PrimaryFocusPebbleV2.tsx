'use client';
import { useState } from 'react';
import NarrowComponent from '@/components/layout/NarrowComponent';
import Button from '@/components/ui/Button';
import EllipsisIcon from '@/components/ui/Ellipsis/EllipsisIcon';
import ScoreLabel from '@/components/ui/ScoreLabel/ScoreLabel';
import cleanTitle from '@/lib/urls/cleanTitle';
import { Pebble } from '@/types/pebble';
import type { Badge } from '@/types/scoring';
import { Globe } from 'lucide-react';

const PrimaryFocusPebbleV2 = ({
  primaryFocusPebble,
  onDelete,
  badges = [],
  explanation,
  rank,
  isScoring = false,
  nextPebble,
  onMarkComplete,
}: {
  primaryFocusPebble: Pebble;
  onDelete: (pebbleId: string) => void;
  badges?: Badge[];
  explanation?: string;
  rank?: number;
  isScoring?: boolean;
  nextPebble?: Pebble;
  onMarkComplete?: (pebbleId: string) => void;
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const title = cleanTitle(primaryFocusPebble?.title);
  const nextTitle = nextPebble
    ? cleanTitle(nextPebble.title) || nextPebble.domain
    : null;

  const handleMarkComplete = () => {
    setIsCompleting(true);
    setTimeout(() => {
      onMarkComplete?.(primaryFocusPebble.id);
    }, 200);
  };

  return (
    <NarrowComponent>
      <div
        className={`transition-all duration-200 ${isCompleting ? 'opacity-0 -translate-y-1' : ''}`}
      >
      <div className="ml-2 flex items-center gap-2 self-start">
        <div className="animate-badge-pulse h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]"></div>
        <p className="text-xs font-bold tracking-[0.05em] text-slate-400 uppercase md:tracking-[0.1em]">
          If you only do one thing today...
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur">
        <div className="p-5 pb-5 md:p-12 md:pb-10">
          <div className="mb-5 flex items-center justify-between">
            {rank !== undefined && <ScoreLabel rank={rank} size="md" />}
          </div>
          {/* Hero row: thumbnail + title/domain + CTA */}
          <div className="mb-6 flex items-center gap-4">
            <figure className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {primaryFocusPebble?.image_url ? (
                <img
                  src={primaryFocusPebble.image_url}
                  alt={
                    primaryFocusPebble.description || title || 'Pebble image'
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Globe className="h-6 w-6 text-slate-400" />
                </div>
              )}
            </figure>

            <div className="min-w-0 flex-1">
              <a
                href={primaryFocusPebble?.canonical_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xl leading-tight font-bold text-gray-900 hover:underline line-clamp-3 md:text-2xl md:line-clamp-none"
              >
                {title}
              </a>
              <a
                href={primaryFocusPebble?.canonical_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block truncate text-sm text-slate-400"
              >
                {primaryFocusPebble?.domain ||
                  primaryFocusPebble?.canonical_url}
              </a>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <EllipsisIcon
                url={primaryFocusPebble?.canonical_url}
                onDelete={onDelete}
                pebbleId={primaryFocusPebble.id}
                onMarkComplete={onMarkComplete ? handleMarkComplete : undefined}
              />
            </div>
          </div>

          {/* Why This Matters */}
          <div className="mb-6">
            <p className="mb-2 text-sm font-semibold text-gray-700">
              Why this matters
            </p>
            <div className="border-l-4 border-[var(--color-primary)] pl-3">
              <p className="text-sm leading-relaxed text-gray-600">
                {explanation ??
                  (isScoring
                    ? 'Ranking your pebbles against your focus...'
                    : 'No explanation available.')}
              </p>
            </div>
          </div>
          {/* <a
            href={primaryFocusPebble?.canonical_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(13,148,136,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-primary-hover)] hover:shadow-[0_6px_20px_rgba(13,148,136,0.35)]"
          >
            Start Now →
          </a> */}
          <Button
            clickFn={() =>
              window.open(primaryFocusPebble.canonical_url, '_blank')
            }
            label="Start Now →"
          />
        </div>

        {/* Up Next strip */}
        {nextPebble && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4">
            <p className="mb-2 text-xs font-bold tracking-[0.1em] text-slate-400 uppercase">
              Up Next
            </p>
            <div className="flex items-center gap-3">
              <figure className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                {nextPebble.image_url ? (
                  <img
                    src={nextPebble.image_url}
                    alt={nextTitle || 'Next pebble'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Globe className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </figure>
              <div className="min-w-0 flex-1">
                <a
                  href={nextPebble.canonical_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm font-semibold text-slate-600 hover:underline"
                >
                  {nextTitle}
                </a>
                <p className="truncate text-xs text-slate-400">
                  {nextPebble.domain}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </NarrowComponent>
  );
};

export default PrimaryFocusPebbleV2;
