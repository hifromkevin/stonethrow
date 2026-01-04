import { useState } from 'react';

const FocusedPebbles = ({ pebble }: { pebble: any[] }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isStarSelected, setIsStarSelected] = useState(pebble.is_starred);

  const onComplete = (id: string) => console.log('complete', id);
  const onDelete = (id: string) => console.log('delete', id);
  //TODO: handle data changes here
  const onStarChange = (id: string, isStarred: boolean) =>
    console.log('star change', id, isStarred);

  const handleMenu = (action: 'complete' | 'delete') => {
    setMenuOpen(false);
    if (action === 'complete') onComplete(pebble.id);
    if (action === 'delete') onDelete(pebble.id);
  };

  const rowBase =
    'group relative grid items-center border-b border-slate-100 last:border-0 transition';
  const rowBg = 'odd:bg-white even:bg-slate-50/40 hover:bg-slate-50/60';
  const starButton = 'text-slate-400 transition hover:text-amber-500';
  const titleText =
    'block truncate text-sm font-medium leading-tight text-slate-900 hover:text-brand';
  const urlText = 'truncate text-xs leading-tight text-slate-500';
  const iconButton =
    'flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100';

  return (
    <div className="group relative">
      {/* Topic color bar */}
      <div
        className="absolute top-0 left-0 h-full w-1.5 rounded-l"
        style={{ backgroundColor: pebble.group_color }}
      />

      <div className={`grid ${COLUMN_SPACING} ${rowBase} ${rowBg} px-3 py-2`}>
        {/* Star */}
        <button
          aria-pressed={isStarSelected}
          className={starButton}
          onClick={() => setIsStarSelected((v) => !v)}
        >
          {isStarSelected ? '★' : '☆'}
        </button>

        {/* Title */}
        <div className="min-w-0">
          <p className={titleText}>{decodeHtmlEntities(pebble.title)}</p>
          <p className={urlText}>({stripProtocol(pebble.canonical_url)})</p>
        </div>

        {/* Why */}
        <Tooltip side="top" type="basic" content={pebble.focus_reason}>
          <span className="cursor-help text-sm text-slate-400">ⓘ</span>
        </Tooltip>

        {/* Menu */}
        <div className="relative">
          <button onClick={() => setMenuOpen((o) => !o)} className={iconButton}>
            …
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-36 rounded-xl border bg-white shadow-lg">
              <button className="menu-item">Complete</button>
              <button className="menu-item text-red-600">Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
