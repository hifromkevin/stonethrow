'use client';
import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip/Tooltip';

const handleFocusHeaderStyling = (isOpen: boolean) => {
  return isOpen
    ? 'rounded-xl bg-slate-200'
    : 'rounded-xl bg-slate-100 transition-colors duration-1000 ease-out hover:bg-slate-200 focus:ring-2 focus:ring-[#5FA69A]/40 focus:outline-none disabled:opacity-50';
};

const FocusCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [focusStmt, setFocusStmt] = useState('');

  return (
    <Card className="m-10 w-full max-w-4xl">
      <div className="border-b border-slate-200 px-6 py-2">
        <p className="text-xs font-semibold tracking-[0.05em] text-slate-500">
          CURRENT FOCUS
        </p>
        <h1>
          What are you focused on right now?{' '}
          <Tooltip side="right" type="focus-card">
            <span className="ml-1 inline-block text-slate-500 hover:text-slate-700">
              ⓘ
            </span>
          </Tooltip>
        </h1>
        <Card className="mt-4">
          <div
            className={`transition-all duration-500 ease-out ${handleFocusHeaderStyling(isOpen)}`}
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen((prev) => !prev);
                setDraft(focusStmt);
              }}
              aria-expanded={isOpen}
              aria-controls="focus-panel"
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <div className="flex items-stretch gap-3">
                <span className="w-1 rounded-xs bg-slate-700" />
                <p className="text-slate-900">
                  {focusStmt.length
                    ? focusStmt
                    : 'Click to add your focus statement'}
                </p>
              </div>
            </button>

            <div
              id="focus-panel"
              className={`overflow-hidden transition-all duration-500 ease-out ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'} `}
            >
              <div className="rounded-b-xl border-t border-slate-200 bg-white px-4 py-4">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition"
                  placeholder="Add your current focus..."
                />
                {/* TODO: If AI can't help (EX: bombastic question, or doesn't match 
                the scope of the selected Pebbles),
                gives a gentle "ⓘ This focus doesn’t match your saved Pebbles."
                OR: "You don't have any ___ pebbles saved yet."
                Followed by: If you want help prioritizing learning material, 
                add a few relevant links first."
                Maybe a small icon with tooltip: 
                ⓘ Why no results? */}
                <div className="mt-3 flex justify-end">
                  <div className="flex gap-2">
                    <Button
                      label="Cancel"
                      variant="secondary"
                      clickFn={() => {
                        setIsOpen(false);
                        setDraft('');
                      }}
                    />
                    <Button
                      label="Set Focus"
                      clickFn={() => {
                        setFocusStmt(draft);
                        setIsOpen(false);
                        setDraft('');
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Card>
  );
};
export default FocusCard;
