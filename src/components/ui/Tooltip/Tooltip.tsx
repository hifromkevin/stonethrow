import { ReactNode } from 'react';
import TooltipArrow from '@/components/ui/Tooltip/TooltipArrow';
import FocusDescription from './Types/FocusDescription';

type TooltipProps = {
  // content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'center' | 'start' | 'end';
  children: ReactNode;
};

const Tooltip = ({ side = 'top', children }: TooltipProps) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
    left: 'right-full top-1/2 mr-2 -translate-y-1/2',
    right: 'left-full ml-3 top-1/2 -translate-y-1/2',
  };

  return (
    <span className="group relative inline-flex">
      {children}

      <div
        role="tooltip"
        className={`pointer-events-none absolute left-full z-[100] ml-3 w-[22rem] -translate-y-[45%] translate-y-1 rounded-xl bg-slate-50 px-5 py-4 text-base leading-6 text-pretty text-slate-900 opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100`}
      >
        {/* {content} */}
        <FocusDescription />
        <TooltipArrow side={side} />
      </div>
    </span>
  );
};

export default Tooltip;
