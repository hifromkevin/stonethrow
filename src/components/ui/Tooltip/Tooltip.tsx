import { ReactNode } from 'react';
import TooltipArrow from '@/components/ui/Tooltip/TooltipArrow';
import AboutFocus from './Types/AboutFocus';

import { TooltipProps } from '@/types/tooltip';
import FocusReason from './Types/FocusReason';

const Tooltip = ({
  side = 'top',
  type = 'basic',
  content = '',
  children,
}: TooltipProps) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
    left: 'right-full mr-3 top-1/2 -translate-y-1/2',
    right: 'left-full ml-3 top-1/2 -translate-y-1/2',
  };

  return (
    <span className="group/tooltip relative inline-flex cursor-help items-center">
      {children}

      <div
        role="tooltip"
        className={`pointer-events-none absolute z-[100] w-[22rem] rounded-xl bg-slate-50 px-5 py-4 text-base leading-6 text-slate-900 opacity-0 shadow-lg transition-opacity group-hover/tooltip:opacity-100 ${positionClasses[side]}`}
      >
        {type === 'focus-card' ? (
          <AboutFocus />
        ) : (
          <FocusReason reason={content} />
        )}
        <TooltipArrow side={side} />
      </div>
    </span>
  );
};

export default Tooltip;
