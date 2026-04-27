'use client';

import { useRef, useState } from 'react';
import EllipsisMenu from './EllipsisMenu';
import { Ellipsis } from 'lucide-react';

const EllipsisIcon = ({
  isDefault = true,
  url,
  onDelete,
  pebbleId,
  onMarkComplete,
  onUndoComplete,
}: {
  isDefault?: boolean;
  url: string;
  onDelete: (pebbleId: string) => void;
  pebbleId: string;
  onMarkComplete?: () => void;
  onUndoComplete?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const buttonSize = isDefault ? 'h-6 w-6' : 'h-10 w-10';
  const ellipsisSize = isDefault ? 'h-3 w-3' : 'h-5 w-5';

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      setRect(buttonRef.current.getBoundingClientRect());
    }
    setIsOpen((v) => !v);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="ellipsis-menu"
        className={`flex ${buttonSize} items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700`}
      >
        <Ellipsis className={ellipsisSize} />
      </button>

      {isOpen && rect && (
        <EllipsisMenu
          rect={rect}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          url={url}
          onDelete={onDelete}
          pebbleId={pebbleId}
          onMarkComplete={onMarkComplete}
          onUndoComplete={onUndoComplete}
        />
      )}
    </>
  );
};

export default EllipsisIcon;
