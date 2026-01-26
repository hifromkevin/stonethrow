import { useState } from 'react';
import { CircleQuestionMark } from 'lucide-react';

import EllipsisIcon from '@/components/ui/Ellipsis/EllipsisIcon';
import Tooltip from '@/components/ui/Tooltip/Tooltip';

import { Pebble } from '@/types';

import cleanTitle from '@/lib/urls/cleanTitle';

const SinglePebble = ({
  pebble,
  onDelete,
}: {
  pebble: Pebble;
  onDelete: (pebbleId: string) => void;
}) => (
  <div className="relative odd:bg-white even:bg-slate-50/40 hover:bg-slate-50/50">
    <div className="grid grid-cols-[1fr_220px_auto_auto] items-center gap-3 px-4 py-2">
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

      <Tooltip content="This is where the AI response will appear">
        <CircleQuestionMark className="text-xs text-slate-500 hover:bg-slate-100" />
      </Tooltip>
    </div>

    <div className="flex pt-1">
      <EllipsisIcon
        url={pebble?.canonical_url}
        onDelete={onDelete}
        pebbleId={pebble.id}
      />
    </div>
  </div>
);

export default SinglePebble;
