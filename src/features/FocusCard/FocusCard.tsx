'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextArea from '@/components/ui/TextArea';
import Tooltip from '@/components/ui/Tooltip/Tooltip';

import LocalHeading from '@/components/layout/LocalHeading';

import { CircleQuestionMark } from 'lucide-react';

import useFocus from '@/lib/queries/useFocus';
import useSetFocus from '@/lib/mutations/useSetFocus';

import type { FocusState } from '@/types/focusCard';

const FocusCard = ({
  focusStatus,
  setFocusStatus,
}: {
  focusStatus: FocusState;
  setFocusStatus: (status: FocusState) => void;
}) => {
  const [focusText, setFocusText] = useState('');
  const [focusDraft, setFocusDraft] = useState('');
  const [safetyError, setSafetyError] = useState<{
    reason: string;
    alternatives: string[];
  } | null>(null);

  const { data: persistedFocus } = useFocus();
  const setFocusMutation = useSetFocus();

  // Sync persisted focus into local state on load
  useEffect(() => {
    if (persistedFocus?.statement) {
      setFocusText(persistedFocus.statement);
      setFocusStatus('committed');
    }
  }, [persistedFocus, setFocusStatus]);

  const isEditing = focusStatus === 'editing';
  const isCommitted = focusStatus === 'committed';
  const isEmpty = focusStatus === 'empty';

  const handleSave = async () => {
    if (!focusDraft.trim()) {
      setFocusText('');
      setFocusStatus('empty');
      return;
    }

    setSafetyError(null);
    const result = await setFocusMutation.mutateAsync(focusDraft.trim());

    if (result.ok) {
      setFocusText(focusDraft.trim());
      setFocusStatus('committed');
    } else if (result.error === 'UNSAFE_FOCUS') {
      setSafetyError({
        reason: result.rejection_reason ?? 'Focus rejected.',
        alternatives: result.alternatives ?? [],
      });
    }
  };

  const handleAlternativeClick = (alt: string) => {
    setFocusDraft(alt);
    setSafetyError(null);
  };

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
              setSafetyError(null);
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

              {safetyError && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm font-medium text-red-700">
                    {safetyError.reason}
                  </p>
                  {safetyError.alternatives.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-red-600">Try one of these instead:</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {safetyError.alternatives.map((alt) => (
                          <button
                            key={alt}
                            className="rounded-full bg-white px-3 py-1 text-xs text-slate-700 shadow-sm hover:bg-slate-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlternativeClick(alt);
                            }}
                          >
                            {alt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                  label={setFocusMutation.isPending ? 'Saving...' : 'Save Focus'}
                  type="button"
                  overrides="w-28"
                  clickFn={handleSave}
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
