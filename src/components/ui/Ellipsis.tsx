'use client';

import { useEffect, useRef, useState } from 'react';
import { Ellipsis } from 'lucide-react';
import Portal from '@/components/ui/Portal';

const EllipsisIcon = ({
  isDefault = true,
  url,
  onDelete,
}: {
  isDefault?: boolean;
  url: string;
  onDelete: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const buttonSize = isDefault ? 'h-6 w-6' : 'h-10 w-10';
  const ellipsisSize = isDefault ? 'h-3 w-3' : 'h-5 w-5';

  // Open + measure
  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      setRect(buttonRef.current.getBoundingClientRect());
    }
    setIsOpen((v) => !v);
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

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
    <>
      {/* Trigger */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`flex ${buttonSize} items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700`}
      >
        <Ellipsis className={ellipsisSize} />
      </button>

      {/* Menu (PORTAL) */}
      {isOpen && rect && (
        <Portal>
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: 'fixed',
              top: rect.top - 8,
              left: rect.left + rect.width / 2,
              transform: 'translate(-50%, -100%)',
            }}
            className="z-[100] w-64 rounded-xl bg-white py-2 text-sm text-slate-800 shadow-xl ring-1 ring-black/5"
          >
            <a
              role="menuitem"
              className="flex w-full items-center px-4 py-2 text-left hover:bg-slate-100"
              href={url}
              target="_blank"
            >
              Go to link
            </a>

            <button
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-2 hover:bg-slate-100"
            >
              <span className="w-4 text-center text-slate-500">↑</span>
              <span>Pin to Top</span>
            </button>

            <button
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-2 hover:bg-slate-100"
            >
              <span className="w-4 text-center text-slate-500">☆</span>
              <span>Mark Important</span>
            </button>

            <div className="my-2 h-px bg-slate-200" />

            <button
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-2 hover:bg-slate-100"
            >
              Mark complete
            </button>

            <button
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50"
              onClick={onDelete}
            >
              Remove
            </button>
          </div>
        </Portal>
      )}
    </>
  );
};

export default EllipsisIcon;
