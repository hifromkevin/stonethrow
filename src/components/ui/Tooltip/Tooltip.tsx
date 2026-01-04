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
    top: 'bottom-full left-1/4 mb-2 -translate-x-1/2',
    bottom: 'top-full left-1/4 mt-2 -translate-x-1/2',
    left: 'right-full ml-3',
    right: 'left-full ml-3',
  };

  return (
    <span className="group/tooltip relative inline-flex cursor-help items-center">
      {children}

      <div
        role="tooltip"
        className={`pointer-events-none absolute z-[100] w-[22rem] rounded-xl bg-slate-50 px-5 py-4 text-base leading-6 text-pretty text-slate-900 opacity-0 shadow-lg transition group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 ${positionClasses[side]} `}
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
