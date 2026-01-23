import LocalHeading from '@/components/layout/LocalHeading';
import NarrowComponent from '@/components/layout/NarrowComponent';
import OtherPebblesGroup from '@/features/OtherPebblesOld/OtherPebblesGroup';
import { Pebbles } from '@/types';

const OtherPebbles = ({ pebbles }: { pebbles: Pebbles[] }) => (
  <NarrowComponent adtlStyles="my-8">
    <LocalHeading label="Other Pebbles" />
    <div className="mt-3 divide-y divide-slate-100">
      {pebbles.map((group, idx) => (
        <OtherPebblesGroup pebbleGroup={group} key={`${group.id}-${idx}`} />
      ))}
    </div>
  </NarrowComponent>
);

export default OtherPebbles;
