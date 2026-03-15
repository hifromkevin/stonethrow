import LocalHeading from '@/components/layout/LocalHeading';
import NarrowComponent from '@/components/layout/NarrowComponent';
import SinglePebble from '@/features/OtherPebbles/SinglePebble';
import { Pebble } from '@/types';
import type { Badge } from '@/types/scoring';

const OtherPebbles = ({
  pebbles,
  onDelete,
  badgesMap,
}: {
  pebbles: Pebble[];
  onDelete: (pebbleId: string) => void;
  badgesMap?: Map<string, { badges: Badge[]; explanation?: string; score?: number }>;
}) => (
  <NarrowComponent adtlStyles="my-8">
    <LocalHeading label="Other Pebbles" />
    <div className="mt-3 divide-y divide-slate-100 border border-slate-200">
      {pebbles?.map((pebble: Pebble, idx: number) => {
        const meta = badgesMap?.get(pebble.id);
        return (
          <SinglePebble
            pebble={pebble}
            key={`${pebble.id}-${idx}`}
            onDelete={onDelete}
            explanation={meta?.explanation}
          />
        );
      })}
    </div>
  </NarrowComponent>
);

export default OtherPebbles;
