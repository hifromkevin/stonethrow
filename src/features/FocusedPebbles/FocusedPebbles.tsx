import { prioritizedPebbles } from '@/lib/mockData';
import FocusedPebblesRow from './FocusedPebblesRow';
import FocusedPebble from '@/features/PebbleRow/FocusedPebble';
import { Focus } from 'lucide-react';
import PrimaryFocusPebble from '@/features/PebbleRow/PrimaryFocusPebble';

const FocusedPebbles = ({ savedPebbles }: { savedPebbles: any[] }) => {
  const COLUMN_SPACING = 'grid-cols-[32px_1fr_30px_40px]';

  return (
    <div className="mx-8 w-full max-w-5xl">
      <h2>If you only do one thing today, start here</h2>
      <PrimaryFocusPebble />

      <div className="mt-3 rounded-t-xl border border-slate-200 bg-white">
        <div
          className={`grid ${COLUMN_SPACING} gap-4 border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500`}
        >
          <span />
          <span className="tracking-[0.02em]">Pebble Name</span>
          <span>Why?</span>
          <span />
        </div>
        <div className="divide-y divide-slate-100">
          {/* Placeholder for focused pebbles */}
          {/* {prioritizedPebbles.map((pebble) => (
            <FocusedPebblesRow
              key={pebble.id}
              pebble={pebble}
              COLUMN_SPACING={COLUMN_SPACING}
            />
          ))} */}
          <FocusedPebble />
          <FocusedPebble />
          <FocusedPebble />
          <FocusedPebble />
          <FocusedPebble />
          {/* {savedPebbles.map((pebble) => (
            <FocusedPebblesRow
              key={pebble.id}
              pebble={pebble}
              COLUMN_SPACING={COLUMN_SPACING}
            />
          ))} */}
        </div>
      </div>
    </div>
  );
};

export default FocusedPebbles;
