import { useState } from 'react';
import { CircleQuestionMark } from 'lucide-react';

import EllipsisIcon from '@/components/ui/Ellipsis/EllipsisIcon';
import Tooltip from '@/components/ui/Tooltip/Tooltip';

import { Pebble } from '@/types';

import cleanTitle from '@/lib/urls/cleanTitle';

const OtherPebblesItemRow = ({ pebble }: { pebble: Pebble }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isStarSelected, setIsStarSelected] = useState(pebble.is_starred);

  return (
    <div className="relative pl-10 odd:bg-white even:bg-slate-50/40 hover:bg-slate-50/50">
      <div className="grid grid-cols-[1fr_220px_auto] items-center gap-3 px-4 py-2">
        <div className="min-w-0">
          <a
            className="truncate text-sm font-medium text-slate-900"
            href={pebble?.canonical_url}
            target="_blank"
          >
            {cleanTitle(pebble.title)}
          </a>
        </div>

        <a
          className="truncate text-sm text-slate-500"
          href={pebble?.canonical_url}
          target="_blank"
        >
          {pebble.notes || 'Good starting point'}
        </a>

        <div className="relative">
          <Tooltip content="This is where the AI response will appear">
            <CircleQuestionMark className="text-xs text-slate-500 hover:bg-slate-100" />
          </Tooltip>
          <EllipsisIcon url={pebble.canonical_url} onDelete={() => {}} pebbleId={pebble.id} />
        </div>
      </div>
    </div>
  );
};

export default OtherPebblesItemRow;
