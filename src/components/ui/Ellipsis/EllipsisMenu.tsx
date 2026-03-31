'use client';

import { useEffect, useRef } from 'react';
import { Ellipsis } from 'lucide-react';
import Portal from '@/components/ui/Portal';

const EllipsisMenu = ({
  rect,
  isOpen,
  setIsOpen,
  url,
  onDelete,
  pebbleId,
}: {
  rect: DOMRect | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  url: string;
  onDelete: (pebbleId: string) => void;
  pebbleId: string;
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (isOpen && menuRef.current) {
      menuRef.current.focus();
    }

    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <Portal>
      <div
        id="ellipsis-menu"
        ref={menuRef}
        role="menu"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsOpen(false);
        }}
        onBlur={(e) => {
          const related = e.relatedTarget;
          setTimeout(() => {
            if (!menuRef.current?.contains(related as Node)) {
              setIsOpen(false);
            }
          }, 0);
        }}
        style={
          rect
            ? {
                top: rect.top - 8,
                left: rect.left + rect.width / 2,
              }
            : {}
        }
        className="fixed z-[100] w-64 -translate-x-1/2 -translate-y-full rounded-xl bg-white py-2 text-sm text-slate-800 shadow-xl ring-1 ring-black/5 focus:outline-none"
      >
        <a
          role="menuitem"
          onClick={() => setIsOpen(false)}
          className="flex w-full items-center px-4 py-2 text-left hover:bg-slate-100"
          href={url}
          target="_blank"
        >
          Go to link
        </a>

        {/* <button
          role="menuitem"
          onClick={() => {
            setIsOpen(false);
            //TODO: Pin to Top action
          }}
          className="flex w-full items-center gap-3 px-4 py-2 hover:bg-slate-100"
        >
          <span className="w-4 text-center text-slate-500">↑</span>
          <span>Pin to Top</span>
        </button>

        <button
          role="menuitem"
          onClick={() => {
            setIsOpen(false);
            //TODO: Mark Important action
          }}
          className="flex w-full items-center gap-3 px-4 py-2 hover:bg-slate-100"
        >
          <span className="w-4 text-center text-slate-500">☆</span>
          <span>Mark Important</span>
        </button>

        <div className="my-2 h-px bg-slate-200" />

        <button
          role="menuitem"
          onClick={() => {
            setIsOpen(false);
            //TODO: Mark Complete action
          }}
          className="flex w-full items-center gap-3 px-4 py-2 hover:bg-slate-100"
        >
          Mark complete
        </button> */}

        <button
          role="menuitem"
          onClick={() => {
            setIsOpen(false);
            onDelete(pebbleId);
          }}
          className="flex w-full items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50"
        >
          Remove
        </button>
      </div>
    </Portal>
  );
};

export default EllipsisMenu;
