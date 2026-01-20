'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Sidebar from '@/components/ui/Sidebar';
import TextArea from '@/components/ui/TextArea';

import LocalHeading from '@/components/layout/LocalHeading';

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
    <div className="m-8 w-full max-w-4xl">
      <LocalHeading label="Current Focus" />
      {isEmpty && (
        <span className="w-2bg-red-400 ml-3 inline-block h-2 align-middle" />
      )}
      <div className="animate-focusPulse relative z-10 overflow-visible bg-white">
        <Card className="group/focusCard relative px-6 py-2">
          <Sidebar />

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
              className={`text-2xl transition-all duration-300 ${isCommitted ? 'font-semibold' : ''} ${isEditing ? 'hidden' : ''}`}
            >
              {isCommitted
                ? focusText || 'What matters most right now?'
                : 'What matters most right now?'}
            </h1>

            {/* SUBTITLE */}
            <h2
              className={`text-md mt-1 text-slate-500 transition-all duration-300 ${isEditing ? 'opacity-40' : ''} `}
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
                  <TextArea
                    content={focusDraft}
                    setContent={setFocusDraft}
                    placeholderText="Write your focus here…"
                  />

                  <p className="mt-2 text-sm text-slate-400">
                    Enter what's on your mind! Anything works, but clarity beats
                    perfection
                  </p>

                  <div className="mt-6 flex items-center justify-center gap-4">
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
