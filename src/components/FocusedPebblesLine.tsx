import { useState } from 'react';
import { Pebble } from '@/types';
import { supabase } from '@/lib/supabase';

const stripProtocol = (url: string) =>
  url.replace(/^[a-zA-Z]+:\/\//, '').replace(/^www\./, '');

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
  const onStarChange = (id: string, isStarred: boolean) =>
    console.log('star change', id, isStarred);

  const handleMenu = (action: 'complete' | 'delete') => {
    setMenuOpen(false);
    if (action === 'complete') onComplete(pebble.id);
    if (action === 'delete') onDelete(pebble.id);
  };

  // <div key={pebble.id} className="grid grid-cols-[auto_1fr_220px_auto] gap-4 px-3 py-3">
  //             <span className="pl-2"> </span>
  //             <span>{pebble.name}</span>
  //             <span>{pebble.reason}</span>
  //             {/* <span className="pr-4 text-right"> </span> */}
  //           </div>

  return (
    <div className="group relative odd:bg-white even:bg-slate-50/40">
      <div
        className="absolute top-0 left-0 h-full w-1.5"
        style={{ backgroundColor: pebble.group_color }}
      />

      <div>
        <div
          className={`grid ${COLUMN_SPACING} items-center gap-2 border-b border-slate-100 px-3 py-2 last:border-0`}
        >
          <button
            // onClick={async () => {
            //   const newVal = !isStarSelected;
            //   // optimistic UI
            //   setIsStarSelected(newVal);

            //   const { error } = await supabase
            //     .from('focused_pebbles')
            //     .update({ is_starred: newVal })
            //     .eq('id', pebble.id);

            //   if (error) {
            //     // rollback on error
            //     setIsStarSelected(!newVal);
            //     console.error('Failed to update star', error);
            //   } else {
            //     onStarChange(pebble.id, newVal);
            //   }
            // }}
            aria-pressed={isStarSelected}
            className="text-slate-500 hover:text-amber-500"
          >
            {isStarSelected ? '★' : '☆'}
          </button>

          <div className="min-w-0">
            <a
              // href={pebble.url}
              className="hover:text-brand block truncate text-sm leading-tight font-medium text-slate-900"
            >
              {pebble.title}
            </a>
            <p className="truncate text-xs leading-tight text-slate-500">
              ({stripProtocol(pebble.url)})
            </p>
          </div>

          <div className="text-sm leading-snug text-slate-500">
            {pebble.notes || 'This is foundational in learning how to ...'}
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
