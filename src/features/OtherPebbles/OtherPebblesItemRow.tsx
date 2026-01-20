import { useState } from 'react';
import { Pebble } from '@/types';
import StarIcon from '@/components/ui/StarIcon';

const OtherPebblesItemRow = ({ pebble }: { pebble: Pebble }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isStarSelected, setIsStarSelected] = useState(pebble.is_starred);

  return (
    <div className="relative pl-10 odd:bg-white even:bg-slate-50/40 hover:bg-slate-50/50">
      <div className="grid grid-cols-[auto_1fr_220px_auto] items-center gap-3 px-4 py-2">
        {/* STAR */}
        <StarIcon
          isStarSelected={isStarSelected}
          setIsStarSelected={setIsStarSelected}
        />

        {/* TITLE */}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">
            {pebble.title}
          </p>
        </div>

        {/* AI DESCRIPTION */}
        <p className="truncate text-sm text-slate-500">
          {pebble.notes || 'Good starting point'}
        </p>

        {/* MENU */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            ⋯
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-36 rounded-xl border bg-white shadow-lg">
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50">
                Complete
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtherPebblesItemRow;
