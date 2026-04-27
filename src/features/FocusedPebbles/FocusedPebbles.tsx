import { Pebble } from '@/types';
import type { Badge } from '@/types/scoring';

import FocusedPebblesRow from '@/features/FocusedPebbles/FocusedPebblesRow';
import NarrowComponent from '@/components/layout/NarrowComponent';

const FocusedPebbles = ({
  savedPebbles,
  onDelete,
  badgesMap,
  onMarkComplete,
}: {
  savedPebbles: Pebble[];
  onDelete: (pebbleId: string) => void;
  badgesMap?: Map<
    string,
    { badges: Badge[]; explanation?: string; rank?: number }
  >;
  onMarkComplete?: (pebbleId: string) => void;
}) => (
  <NarrowComponent>
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
          onMarkComplete={onMarkComplete}
        />
      );
    })}
  </NarrowComponent>
);

export default FocusedPebbles;
