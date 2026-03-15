import { Pebble } from '@/types';
import type { Badge } from '@/types/scoring';

import FocusedPebblesRow from '@/features/FocusedPebbles/FocusedPebblesRow';
import NarrowComponent from '@/components/layout/NarrowComponent';

const FocusedPebbles = ({
  savedPebbles,
  onDelete,
  badgesMap,
}: {
  savedPebbles: Pebble[];
  onDelete: (pebbleId: string) => void;
  badgesMap?: Map<string, { badges: Badge[]; explanation?: string; rank?: number }>;
}) => (
  <NarrowComponent>
    <div className="mt-1 rounded-t-xl border border-slate-200 bg-white">
      <div className="divide-y divide-slate-100">
        {savedPebbles.map((pebble) => {
          const meta = badgesMap?.get(pebble.id);
          return (
            <FocusedPebblesRow
              key={pebble.id}
              pebble={pebble}
              onDelete={onDelete}
              badges={meta?.badges}
              explanation={meta?.explanation}
              rank={meta?.rank}
            />
          );
        })}
      </div>
    </div>
  </NarrowComponent>
);

export default FocusedPebbles;
