'use client';
import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import LocalHeading from '@/components/layout/LocalHeading';

type FocusState = 'empty' | 'editing' | 'committed';
const FocusCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [focusStmt, setFocusStmt] = useState('');
  const [focusText, setFocusText] = useState('');

  const [focusStatus, setFocusStatus] = useState<FocusState>('empty');
  const isEditing = focusStatus === 'editing';
  const isCommitted = focusStatus === 'committed';
  const isEmpty = focusStatus === 'empty';

  return (
    <div className="m-8 w-full max-w-xl border-b border-slate-200">
      <LocalHeading label="Current Focus" />

      {isEmpty && (
        <span className="ml-3 inline-block h-2 w-2 rounded-full bg-red-400 align-middle" />
      )}
      <div
        className="animate-focusPulse relative z-10 overflow-visible rounded-xl bg-white transition"
        style={{ willChange: 'box-shadow, transform' }}
      >
        <Card className="group/focusCard relative bg-gradient-to-b from-white to-[var(--color-primary)]/8 px-6 py-2">
          <div className="absolute inset-y-0 left-0 w-2 rounded-l-2xl bg-[var(--color-primary)]" />

          <div
            className={`flex flex-col p-4 ${focusStatus !== 'editing' ? 'cursor-pointer' : ''}`}
            onClick={() =>
              focusStatus !== 'editing' && setFocusStatus('editing')
            }
          >
            <h1
              className={`text-center text-3xl transition-all duration-300 ${isEditing ? 'translate-y-[-6px]' : ''} ${isCommitted ? 'font-semibold' : ''} `}
            >
              {isEditing || isCommitted
                ? focusText || 'What matters most right now?'
                : 'What matters most right now?'}
            </h1>

            {/* SUBTITLE */}
            <h2
              className={`mt-1 text-center text-xl text-slate-500 transition-all duration-300 ${isEditing ? 'opacity-40' : ''} `}
            >
              {isEditing
                ? ''
                : isCommitted
                  ? ''
                  : 'Set a focus to prioritize your day'}
            </h2>

            {/* BODY */}
            <div className="mt-2">
              {/* EMPTY */}
              {/* {focusStatus === 'empty' && (
              <div className="flex justify-center">
                <Button
                  label="Set your focus"
                  type="button"
                  overrides="w-40 mt-4"
                  clickFn={() => setFocusStatus('editing')}
                />
              </div>
            )} */}

              {/* EDITING */}
              {isEditing && (
                <div
                  className={`mt-4 transform transition-all duration-500 ease-out ${
                    isEditing
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-4 opacity-0'
                  } `}
                >
                  <textarea
                    autoFocus
                    rows={2}
                    value={focusText}
                    onChange={(e) => setFocusText(e.target.value)}
                    placeholder="Write your focus here…"
                    className="mt-4 w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-base text-slate-600 shadow-inner focus:border-slate-400 focus:outline-none"
                  />

                  {/* <p className="mt-2 text-sm text-slate-400">
                  Anything works — clarity beats perfection
                </p> */}

                  <div className="mt-6 flex items-center justify-center gap-4">
                    <button
                      className="text-slate-500 hover:text-slate-700"
                      onClick={() => setFocusStatus('empty')}
                    >
                      Cancel
                    </button>
                    <Button
                      label="Save focus"
                      type="button"
                      overrides="w-40"
                      clickFn={() => {
                        if (!focusText.trim()) return;
                        setFocusStatus('committed');
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FocusCard;
