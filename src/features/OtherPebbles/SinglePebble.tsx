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
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2">
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-slate-600">
          <a
            href={pebble?.canonical_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {cleanTitle(pebble.title)}
          </a>
        </p>

        <a
          className="truncate text-sm text-slate-400"
          href={pebble?.canonical_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          ({pebble.domain ? pebble.domain : pebble.canonical_url})
        </a>
      </div>

      <Tooltip content="This is where the AI response will appear">
        <CircleQuestionMark className="text-xs text-slate-500 hover:bg-slate-100" />
      </Tooltip>

      <EllipsisIcon
        url={pebble?.canonical_url}
        onDelete={onDelete}
        pebbleId={pebble.id}
      />
    </div>
  </div>
);

export default SinglePebble;
