import { Pebble } from '@/types';

import { Focus } from 'lucide-react';
import FocusedPebblesRow from '@/features/FocusedPebbles/FocusedPebblesRow';
import NarrowComponent from '@/components/layout/NarrowComponent';

const FocusedPebbles = ({
  savedPebbles,
  onDelete,
}: {
  savedPebbles: Pebble[];
  onDelete: (pebbleId: string) => void;
}) => (
  <NarrowComponent>
    <div className="mt-1 rounded-t-xl border border-slate-200 bg-white">
      <div className="divide-y divide-slate-100">
        {savedPebbles.map((pebble) => (
          <FocusedPebblesRow
            key={pebble.id}
            pebble={pebble}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  </NarrowComponent>
);

export default FocusedPebbles;
