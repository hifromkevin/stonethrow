import { useState } from 'react';
import { CircleQuestionMark } from 'lucide-react';

import EllipsisIcon from '@/components/ui/Ellipsis';
import Tooltip from '@/components/ui/Tooltip/Tooltip';

import { Pebble } from '@/types';

import cleanTitle from '@/lib/urls/cleanTitle';

import useDeletePebble from '@/lib/mutations/useDeletePebble';

const stripProtocol = (url: string) =>
  url ? url.replace(/^[a-zA-Z]+:\/\//, '').replace(/^www\./, '') : null;

const FocusedPebbleRow = ({
  pebble,
  COLUMN_SPACING,
}: {
  pebble: Pebble;
  COLUMN_SPACING: string;
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

  const deletePebble = useDeletePebble();

  const onDelete = () => {
    if (!confirm('Remove this Pebble?')) return;

    deletePebble.mutate(pebble.id);
  };

  return (
    <div className="group grid grid-cols-[auto_1fr_auto] items-center gap-2 overflow-hidden bg-white hover:bg-slate-50">
      <div className="aspect-square w-22 shrink-0 overflow-hidden">
        <img
          src={pebble?.image_url}
          alt={pebble?.description}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 py-2">
            <p className="truncate text-base font-semibold text-slate-600">
              <a href={pebble?.canonical_url} target="_blank">
                {cleanTitle(pebble.title)}
              </a>
            </p>

            <a
              className="truncate text-sm text-slate-400"
              href={pebble?.canonical_url}
              target="_blank"
            >
              ({pebble.domain ? pebble.domain : pebble.canonical_url})
            </a>
            <div className="mt-2 flex flex-wrap gap-2">
              <div className="flex flex-wrap items-start gap-2 text-xs text-slate-600">
                <span>High ROI</span>
                <span className="text-slate-300">•</span>
                <span>Aligns with focus</span>
                <span className="text-slate-300">•</span>
                <span>Go here</span>
              </div>
            </div>
          </div>

          <Tooltip content="This is where the AI response will appear">
            <CircleQuestionMark className="text-xs text-slate-500 hover:bg-slate-100" />
          </Tooltip>
        </div>
      </div>

      {/* Ellipsis menu */}
      <div className="flex pt-1">
        <EllipsisIcon url={pebble?.canonical_url} onDelete={onDelete} />
      </div>
    </div>
  );
};
export default FocusedPebbleRow;
