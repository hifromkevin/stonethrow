'use client';
import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';

const FocusCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [focusStmt, setFocusStmt] = useState('');

  return (
    <Card className="m-8 w-full max-w-5xl">
      <div className="border-b border-slate-200 px-6 py-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">
          CURRENT FOCUS
        </p>
        <h1>What are you focused on right now?</h1>

        <Card className="mt-4">
          <div className="rounded-xl bg-slate-100">
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

            {isOpen && (
              <div className="rounded-b-xl border-t border-slate-200 bg-white px-4 py-4">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition"
                  placeholder="Describe your current focus. Shorter is better (roughly a sentence or two), but there's no wrong answer."
                />
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
                      label="Save"
                      clickFn={() => {
                        setFocusStmt(draft);
                        setIsOpen(false);
                        setDraft('');
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Card>
  );
};
export default FocusCard;
