'use client';

import { useEffect, useRef, useState } from 'react';
import { Ellipsis } from 'lucide-react';

const EllipsisIcon = ({ isDefault = true }: { isDefault?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const buttonSize = isDefault ? 'h-6 w-6' : 'h-10 w-10';
  const ellipsisSize = isDefault ? 'h-3 w-3' : 'h-5 w-5';

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`flex ${buttonSize} items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700`}
      >
        <Ellipsis className={ellipsisSize} />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute bottom-full left-1/2 z-[100] mb-2 w-64 -translate-x-1/2 rounded-xl bg-white py-2 text-sm text-slate-800 shadow-xl ring-1 ring-black/5"
        >
          {/* Go to link */}
          <button
            role="menuitem"
            className="flex w-full items-center px-4 py-2 text-left hover:bg-slate-100"
          >
            Go to link
          </button>

          {/* Pin */}
          <button
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-2 hover:bg-slate-100"
          >
            <span className="w-4 text-center text-slate-500">↑</span>
            <span>Pin to Top</span>
          </button>

          {/* Important */}
          <button
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-2 hover:bg-slate-100"
          >
            <span className="w-4 text-center text-slate-500">☆</span>
            <span>Mark Important</span>
          </button>

          {/* Divider */}
          <div className="my-2 h-px bg-slate-200" />

          {/* Complete */}
          <button
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-2 hover:bg-slate-100"
          >
            <span>Mark complete</span>
          </button>

          {/* Remove */}
          <button
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50"
          >
            <span>Remove</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EllipsisIcon;
