import { useState } from 'react';
import { OtherPebbleGroup } from '@/types';

import OtherPebblesItemRow from '@/features/OtherPebbles/OtherPebblesItemRow';

const OtherPebblesGroup = ({
  pebbleGroup,
}: {
  pebbleGroup: OtherPebbleGroup;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="group my-1 overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow group-hover:bg-slate-50/50 group-hover:ring-1 group-hover:ring-slate-300/60">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
      >
        <span
          className={`transition-transform duration-500 ease-out ${open ? 'rotate-90' : ''} `}
        >
          ▸
        </span>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="truncate font-medium text-slate-900">
            {pebbleGroup.subject}
          </span>

          <span className="text-sm text-slate-500">
            ({pebbleGroup.items.length}{' '}
            {pebbleGroup.items.length === 1 ? 'pebble' : 'pebbles'})
          </span>
        </div>

        <p className="hidden text-sm text-slate-500 italic md:block">
          {pebbleGroup.reason}
        </p>
      </button>

      <div
        className={`border-t border-slate-100 transition-all duration-700 ease-out ${open ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} `}
      >
        {pebbleGroup.items.map((item, idx) => (
          <OtherPebblesItemRow key={`${item.id}-${idx}`} pebble={item} />
        ))}
      </div>
    </div>
  );
};
export default OtherPebblesGroup;
