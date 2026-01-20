import { prioritizedPebbles } from '@/lib/mockData';
import { Pebble } from '@/types';

import { Focus } from 'lucide-react';
import FocusedPebblesRow from '@/features/FocusedPebbles/FocusedPebblesRow';
import LocalHeading from '@/components/layout/LocalHeading';

const FocusedPebbles = ({ savedPebbles }: { savedPebbles: Pebble[] }) => {
  const COLUMN_SPACING = 'grid-cols-[32px_1fr_30px_40px]';

  return (
    <div className="mx-8 w-full max-w-4xl">
      <div className="mt-3 rounded-t-xl border border-slate-200 bg-white">
        <div className="divide-y divide-slate-100">
          {savedPebbles.map((pebble) => (
            <FocusedPebblesRow
              key={pebble.id}
              pebble={pebble}
              COLUMN_SPACING={COLUMN_SPACING}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FocusedPebbles;
