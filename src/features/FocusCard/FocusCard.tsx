'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Sidebar from '@/components/ui/Sidebar';
import TextArea from '@/components/ui/TextArea';
import Tooltip from '@/components/ui/Tooltip/Tooltip';

import LocalHeading from '@/components/layout/LocalHeading';

import { CircleQuestionMark } from 'lucide-react';

const FocusCard = ({
  focusStatus,
  setFocusStatus,
}: {
  focusStatus: string;
  setFocusStatus: Function;
}) => {
  const [focusText, setFocusText] = useState('');
  const [focusDraft, setFocusDraft] = useState('');
  const isEditing = focusStatus === 'editing';
  const isCommitted = focusStatus === 'committed';
  const isEmpty = focusStatus === 'empty';

  return (
    <div
      className={`${isEmpty ? 'animate-focusGlow rounded-lg border-1 border-slate-200' : 'border-b border-slate-200'} w-full max-w-3xl bg-white/50 p-6`}
    >
      <header className="flex items-center gap-2">
        {isEmpty && (
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-red-400"
          />
        )}

        <LocalHeading label="Current Focus" />

        {!isCommitted && (
          <Tooltip type="focus-card" side="right">
            <CircleQuestionMark size={16} className="text-slate-500" />
          </Tooltip>
        )}
      </header>
      <Card className="relative pt-1">
        <div
          className={`flex flex-col ${focusStatus !== 'editing' ? 'cursor-pointer' : ''}`}
          onClick={() => {
            if (focusStatus !== 'editing') {
              setFocusDraft(focusText);
              setFocusStatus('editing');
            }
          }}
        >
          <h1
            className={`text-3xl font-bold tracking-[0.01em] transition-all duration-300 ${isEditing ? 'hidden' : 'mt-1'}`}
          >
            {isCommitted && focusText
              ? focusText
              : 'What matters most right now?'}
          </h1>

          <h2
            className={`text-md text-slate-500 transition-all duration-300 ${isEditing ? 'opacity-40' : ''} `}
          >
            {isEditing
              ? ''
              : isCommitted
                ? ''
                : 'Set a focus to prioritize your day'}
          </h2>

          {isEditing && (
            <div
              className={`transform transition-all duration-500 ease-out ${
                isEditing ? 'opacity-100' : 'opacity-0'
              } `}
            >
              <TextArea
                content={focusDraft}
                setContent={setFocusDraft}
                placeholderText="Write your focus here…"
              />

              <p className="mt-2 text-sm text-slate-400">
                Enter what's on your mind! Anything works, but clarity beats
                perfection
              </p>

              <footer className="mt-6 flex items-center justify-center gap-4">
                <button
                  className="text-slate-500 hover:text-slate-700"
                  onClick={() =>
                    focusText
                      ? setFocusStatus('committed')
                      : setFocusStatus('empty')
                  }
                >
                  Cancel
                </button>
                <Button
                  label="Save Focus"
                  type="button"
                  overrides="w-28"
                  clickFn={() => {
                    if (!focusDraft.trim()) {
                      setFocusText('');
                      setFocusStatus('empty');
                    } else {
                      setFocusText(focusDraft);
                      setFocusStatus('committed');
                    }
                  }}
                />
              </footer>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FocusCard;
