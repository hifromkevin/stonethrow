import LocalHeading from '@/components/layout/LocalHeading';
import NarrowComponent from '@/components/layout/NarrowComponent';
import SinglePebble from '@/features/OtherPebbles/SinglePebble';
import { Pebble } from '@/types';

const OtherPebbles = ({
  pebbles,
  onDelete,
}: {
  pebbles: Pebble[];
  onDelete: (pebbleId: string) => void;
}) => (
  <NarrowComponent adtlStyles="my-8">
    <LocalHeading label="Other Pebbles" />
    <div className="mt-3 divide-y divide-slate-100">
      {pebbles?.map((pebble: Pebble, idx: number) => (
        <SinglePebble
          pebble={pebble}
          key={`${pebble.id}-${idx}`}
          onDelete={onDelete}
        />
      ))}
    </div>
  </NarrowComponent>
);

export default OtherPebbles;
