import NarrowComponent from '@/components/layout/NarrowComponent';
import DonePebbleRow from './DonePebbleRow';
import { Pebble } from '@/types';

const DoneQueue = ({
  pebbles,
  onDelete,
  onUndoComplete,
}: {
  pebbles: Pebble[];
  onDelete: (pebbleId: string) => void;
  onUndoComplete: (pebbleId: string) => void;
}) => {
  if (pebbles.length === 0) {
    return (
      <NarrowComponent adtlStyles="my-8">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm text-slate-500">
            Nothing done yet. Complete a pebble from your Active list and it&apos;ll
            show up here.
          </p>
        </div>
      </NarrowComponent>
    );
  }

  return (
    <NarrowComponent adtlStyles="my-8">
      <div className="divide-y divide-slate-100 border border-slate-200">
        {pebbles.map((pebble, idx) => (
          <DonePebbleRow
            key={`${pebble.id}-${idx}`}
            pebble={pebble}
            onDelete={onDelete}
            onUndoComplete={onUndoComplete}
          />
        ))}
      </div>
    </NarrowComponent>
  );
};

export default DoneQueue;
