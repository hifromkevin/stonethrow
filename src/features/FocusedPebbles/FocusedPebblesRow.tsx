import { useState } from 'react';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import { Pebble } from '@/types';
import decodeHtmlEntities from '@/lib/urls/decodeHtmlTitles';

const stripProtocol = (url: string) =>
  url ? url.replace(/^[a-zA-Z]+:\/\//, '').replace(/^www\./, '') : null;

const FocusedPebblesRow = ({
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
    <div className="group relative odd:bg-white even:bg-slate-50/40 hover:bg-slate-50/50">
      <div
        className="absolute top-0 left-0 h-full w-1.5"
        style={{ backgroundColor: pebble.group_color }}
      />

      <div>
        <div
          className={`grid ${COLUMN_SPACING} items-center gap-2 border-b border-slate-100 px-3 py-2 last:border-0`}
        >
          <button
            aria-pressed={isStarSelected}
            className="text-slate-500 hover:text-amber-500"
            onClick={() => {
              setIsStarSelected((props) => !props);
            }}
          >
            {isStarSelected ? '★' : '☆'}
          </button>

          <div className="min-w-0">
            <a
              // href={pebble.url}
              className="hover:text-brand block truncate text-sm leading-tight font-medium text-slate-900"
            >
              {decodeHtmlEntities(pebble.title)}
            </a>
            <p className="truncate text-xs leading-tight text-slate-500">
              ({stripProtocol(pebble.original_url)})
            </p>
          </div>

          <div className="text-sm leading-snug text-slate-500">
            <Tooltip
              side="top"
              type="basic"
              content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam blandit felis ut velit aliquet, id tincidunt risus tempus."
            >
              ⓘ
            </Tooltip>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
            >
              {/* <Ellipsis className="h-5 w-5" /> */}
              ...
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-36 rounded-xl border border-slate-200 bg-white shadow-lg">
                <button
                  onClick={() => handleMenu('complete')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                >
                  Complete
                </button>
                <button
                  onClick={() => handleMenu('delete')}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusedPebblesRow;
