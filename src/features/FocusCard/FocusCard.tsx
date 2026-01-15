'use client';
import { useRef, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TextArea from '@/components/ui/TextArea';

import Tooltip from '@/components/ui/Tooltip/Tooltip';
import LocalHeading from '@/components/layout/LocalHeading';
import { FocusState } from '@/types';

const FocusCard = ({
  focusStatus,
  setFocusStatus,
}: {
  focusStatus: string;
  setFocusStatus: Function;
}) => {
  const [focusText, setFocusText] = useState('');
  const isEditing = focusStatus === 'editing';
  const isCommitted = focusStatus === 'committed';
  const isEmpty = focusStatus === 'empty';

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <div className="m-8 w-full max-w-xl">
      <LocalHeading label="Current Focus" />
      {isEmpty && (
        <span className="w-2bg-red-400 ml-3 inline-block h-2 align-middle" />
      )}
      <div className="animate-focusPulse relative z-10 overflow-visible bg-white transition">
        <Card className="group/focusCard relative px-6 py-2">
          <div className="absolute inset-y-0 left-0 w-2 bg-[var(--color-primary)]" />

          <div
            className={`flex flex-col ${focusStatus !== 'editing' ? 'cursor-pointer' : ''}`}
            onClick={() =>
              focusStatus !== 'editing' && setFocusStatus('editing')
            }
          >
            <h1
              className={`text-3xl transition-all duration-300 ${isEditing ? 'translate-y-[-6px]' : ''} ${isCommitted ? 'font-semibold' : ''} ${isEditing ? 'hidden' : ''}`}
            >
              {isCommitted
                ? focusText || 'What matters most right now?'
                : 'What matters most right now?'}
            </h1>

            {/* SUBTITLE */}
            <h2
              className={`mt-1 text-xl text-slate-500 transition-all duration-300 ${isEditing ? 'opacity-40' : ''} `}
            >
              {isEditing
                ? ''
                : isCommitted
                  ? ''
                  : 'Set a focus to prioritize your day'}
            </h2>

            <div className="mt-2">
              {isEditing && (
                <div
                  className={`transform transition-all duration-500 ease-out ${
                    isEditing
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-4 opacity-0'
                  } `}
                >
                  {/* <textarea
                    autoFocus
                    value={focusText}
                    onChange={(e) => setFocusText(e.target.value)}
                    placeholder="Write your focus here…"
                    className="w-full resize-none bg-white px-3 text-3xl focus:border-slate-400 focus:outline-none"
                  /> */}
                  <TextArea
                    content={focusText}
                    setContent={setFocusText}
                    placeholderText="Write your focus here…"
                  />

                  <p className="mt-2 text-sm text-slate-400">
                    Anything works — clarity beats perfection
                  </p>

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
