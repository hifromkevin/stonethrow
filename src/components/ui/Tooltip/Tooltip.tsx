import { useId, useRef, useState } from 'react';
import TooltipArrow from '@/components/ui/Tooltip/TooltipArrow';
import AboutFocus from './Types/AboutFocus';
import Portal from '@/components/ui/Portal';

import { TooltipProps } from '@/types/tooltip';
import FocusReason from './Types/FocusReason';

const Tooltip = ({
  side = 'top',
  type = 'basic',
  content = '',
  children,
}: TooltipProps) => {
  const id = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const show = () => {
    setRect(triggerRef.current?.getBoundingClientRect() ?? null);
  };

  const hide = () => setRect(null);

  const getPosition = () => {
    if (!rect) return {};

    const spacing = 8;

    switch (side) {
      case 'top':
        return {
          top: rect.top - spacing,
          left: rect.left + rect.width / 2,
          transform: 'translate(-96%, -100%)',
        };
      case 'bottom':
        return {
          top: rect.bottom + spacing,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - spacing,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + spacing,
          transform: 'translateY(-50%)',
        };
    }
  };

  return (
    <>
      <span
        ref={triggerRef}
        tabIndex={0}
        aria-describedby={rect ? id : undefined}
        className="inline-flex cursor-help items-center focus:outline-none"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>

      {rect && (
        <Portal>
          <div
            id={id}
            role="tooltip"
            style={getPosition()}
            className="pointer-events-none fixed z-[100] w-[22rem] rounded-xl bg-slate-50 px-5 py-4 text-base leading-6 text-slate-900 shadow-lg"
          >
            {type === 'focus-card' ? (
              <AboutFocus />
            ) : (
              <FocusReason reason={content} />
            )}
            <TooltipArrow side={side} />
          </div>
        </Portal>
      )}
    </>
  );
};

export default Tooltip;
