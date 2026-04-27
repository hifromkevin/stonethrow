'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import EllipsisIcon from '@/components/ui/Ellipsis/EllipsisIcon';
import { Pebble } from '@/types';
import cleanTitle from '@/lib/urls/cleanTitle';
import useUpdatePebbleNotes from '@/lib/mutations/useUpdatePebbleNotes';

function formatCompletedAt(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const DonePebbleRow = ({
  pebble,
  onDelete,
  onUndoComplete,
}: {
  pebble: Pebble;
  onDelete: (pebbleId: string) => void;
  onUndoComplete: (pebbleId: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notesValue, setNotesValue] = useState(pebble.notes ?? '');
  const updateNotes = useUpdatePebbleNotes();

  const title = cleanTitle(pebble.title) || pebble.domain || pebble.canonical_url;
  const domainLabel = pebble.domain ? `(${pebble.domain})` : pebble.canonical_url;
  const dateLabel = pebble.completed_at ? formatCompletedAt(pebble.completed_at) : '';

  const handleNotesBlur = () => {
    if (notesValue !== (pebble.notes ?? '')) {
      updateNotes.mutate({ id: pebble.id, notes: notesValue });
    }
  };

  return (
    <div
      className="relative cursor-pointer odd:bg-white even:bg-slate-50/40 hover:bg-slate-50/50 md:cursor-default"
      onClick={() => setIsExpanded((prev) => !prev)}
    >
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-2 px-4 py-2.5">
        {/* Favicon / thumbnail */}
        <figure className="h-8 w-8 shrink-0 overflow-hidden rounded bg-slate-100">
          {pebble.image_url ? (
            <img
              src={pebble.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(pebble.domain)}&sz=32`}
              alt=""
              className="h-full w-full object-contain p-1"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </figure>

        {/* Title + domain */}
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-medium leading-snug text-slate-700 md:line-clamp-2">
            <a
              href={pebble.canonical_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {title}
            </a>
          </p>
          <p className="mt-0.5 text-xs text-slate-400">{domainLabel}</p>
        </div>

        {/* Completion timestamp — desktop only; shown in expanded panel on mobile */}
        {dateLabel && (
          <span className="hidden whitespace-nowrap text-xs text-slate-400 md:block">
            {dateLabel}
          </span>
        )}

        {/* Chevron */}
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />

        {/* Ellipsis */}
        <div onClick={(e) => e.stopPropagation()}>
          <EllipsisIcon
            url={pebble.canonical_url}
            onDelete={onDelete}
            pebbleId={pebble.id}
            onUndoComplete={() => onUndoComplete(pebble.id)}
          />
        </div>
      </div>

      {/* Expandable notes panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-48' : 'max-h-0'
        }`}
      >
        <div className="px-4 pb-4 pt-1">
          {dateLabel && (
            <p className="mb-2 text-xs text-slate-400 md:hidden">{dateLabel}</p>
          )}
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            Notes
          </label>
          <textarea
            className="w-full resize-none rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
            placeholder="Add a note..."
            value={notesValue}
            rows={3}
            onChange={(e) => setNotesValue(e.target.value)}
            onBlur={handleNotesBlur}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
};

export default DonePebbleRow;
