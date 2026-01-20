import { useState } from 'react';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import { Pebble } from '@/types';
import decodeHtmlEntities from '@/lib/urls/decodeHtmlTitles';
import { CircleQuestionMark } from 'lucide-react';
import EllipsisIcon from '@/components/ui/Ellipsis';
import StarIcon from '@/components/ui/StarIcon';

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
  const onDelete = (id: string) => console.log('delete', id);
  //TODO: handle data changes here
  const onStarChange = (id: string, isStarred: boolean) =>
    console.log('star change', id, isStarred);

  const handleMenu = (action: 'complete' | 'delete') => {
    setMenuOpen(false);
    if (action === 'complete') onComplete(pebble.id);
    if (action === 'delete') onDelete(pebble.id);
  };

  return (
    <div className="group grid grid-cols-[12px_50px_1fr_auto] items-center gap-4 border border-slate-200 bg-white px-2 py-2 hover:bg-slate-50">
      {/* ☆ Star */}
      <div className="flex pt-1">
        <StarIcon
          isStarSelected={isStarSelected}
          setIsStarSelected={setIsStarSelected}
        />
      </div>

      {/* Image */}
      <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
        <img
          src="https://hips.hearstapps.com/hmg-prod/images/natashalyon-margate-living-room-681ce9cf8130d.jpeg?crop=0.748xw:1.00xh;0.163xw,0&resize=640:*"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      {/* Main content */}
      <div className="min-w-0">
        {/* Title row */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-600">
              {pebble.title}
            </h3>

            <p className="mt-0.5 truncate text-sm text-slate-400">
              ({pebble.domain ? pebble.domain : pebble.canonical_url})
            </p>
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
        <EllipsisIcon />
      </div>
    </div>
  );
};
export default FocusedPebbleRow;
