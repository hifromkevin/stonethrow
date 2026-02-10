'use client';
import { useState, useEffect } from 'react';
import usePebbles from '@/lib/queries/client/usePebbles';
import useRankedPebbles from '@/lib/queries/client/useRankedPebbles';
import useFocus from '@/lib/queries/useFocus';

import CenteredComponent from '@/components/layout/CenteredComponent';
import Header from '@/components/layout/Header';
import AddPebbleModal from '@/components/layout/AddPebbleModal';
import NarrowComponent from '@/components/layout/NarrowComponent';

import AddPebbleIcon from '@/features/AddPebbleIcon/AddPebbleIcon';
import FocusCard from '@/features/FocusCard/FocusCard';

import FocusedPebbles from '@/features/FocusedPebbles/FocusedPebbles';
import LocalHeading from '@/components/layout/LocalHeading';
import OtherPebbles from '@/features/OtherPebbles/OtherPebbles';
import PebblesEmptyState from '@/features/PebblesEmptyState/PebblesEmptyState';
import PrimaryFocusPebble from '@/features/PrimaryFocusPebble/PrimaryFocusPebble';

import useDeletePebble from '@/lib/mutations/useDeletePebble';

import { FocusState } from '@/types';

const LOADING_MESSAGES = [
  'Analyzing your pebbles',
  'Finding your best next step',
  'Prioritizing for your focus',
];

const DashboardClient = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [focusStatus, setFocusStatus] = useState<FocusState>('empty');
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const { data: focus } = useFocus();
  const focusId = focus?.id;

  // Use ranked pebbles when focus is active, flat list otherwise
  const { data: rankedData, isLoading: rankedLoading } =
    useRankedPebbles(focusId);

  const { data: flatPebbles = [], isLoading: flatLoading } = usePebbles();

  const isLoading = focusId ? rankedLoading : flatLoading;

  // Derive display data based on whether we have a focus
  const primaryPebble = focusId
    ? (rankedData?.primary?.pebble ?? null)
    : (flatPebbles[0] ?? null);

  const primaryBadges = focusId ? (rankedData?.primary?.badges ?? []) : [];
  const primaryExplanation = focusId
    ? rankedData?.primary?.explanation
    : undefined;

  const focusedPebblesList = focusId
    ? (rankedData?.focused ?? []).map((r) => r.pebble)
    : flatPebbles.slice(1);

  const focusedBadgesMap = focusId
    ? new Map(
        (rankedData?.focused ?? []).map((r) => [
          r.pebble.id,
          { badges: r.badges, explanation: r.explanation },
        ])
      )
    : new Map();

  const otherPebblesList = focusId
    ? (rankedData?.other ?? []).map((r) => r.pebble)
    : flatPebbles.slice(1);

  const otherBadgesMap = focusId
    ? new Map(
        (rankedData?.other ?? []).map((r) => [
          r.pebble.id,
          { badges: r.badges, explanation: r.explanation },
        ])
      )
    : new Map();

  const hasPebbles = focusId
    ? !!(
        rankedData?.primary ||
        (rankedData?.focused?.length ?? 0) > 0 ||
        (rankedData?.other?.length ?? 0) > 0
      )
    : flatPebbles.length > 0;

  const isScoring = rankedData?.scoringStatus?.isScoring ?? false;

  useEffect(() => {
    if (!isScoring) {
      setLoadingMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => prev + 1);
    }, 2500);

    return () => clearInterval(interval);
  }, [isScoring]);

  const deletePebble = useDeletePebble();
  const onDelete = (pebbleId: string) => {
    if (!confirm('Remove this Pebble?')) return;

    deletePebble.mutate(pebbleId);
  };

  return (
    <>
      <main className="mt-18 mb-10 min-h-screen w-screen bg-white">
        <Header />
        <CenteredComponent ariaLabel="focus-card">
          <FocusCard
            focusStatus={focusStatus}
            setFocusStatus={setFocusStatus}
          />
        </CenteredComponent>

        <CenteredComponent ariaLabel="polite">
          {isLoading && <div>Loading...</div>}
        </CenteredComponent>

        {!hasPebbles && !isLoading && (
          <CenteredComponent ariaLabel="no-pebbles-state">
            <PebblesEmptyState
              hasFocus={focusStatus !== 'empty'}
              onAddPebble={() => setIsModalOpen(true)}
            />
          </CenteredComponent>
        )}

        {/* Loading indicator - shown above pebbles */}
        {isScoring && (
          <CenteredComponent ariaLabel="scoring-loader">
            <div className="mx-auto flex max-w-2xl flex-col items-center py-6">
              <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              <span className="text-sm font-medium text-gray-600">
                {
                  LOADING_MESSAGES[
                    loadingMessageIndex % LOADING_MESSAGES.length
                  ]
                }
                ...
              </span>
            </div>
          </CenteredComponent>
        )}

        {/* Pebbles - dimmed when scoring */}
        <div
          className={
            isScoring
              ? 'opacity-50 transition-opacity duration-300'
              : 'transition-opacity duration-300'
          }
        >
          {hasPebbles && (
            <>
              {primaryPebble && (
                <CenteredComponent>
                  <PrimaryFocusPebble
                    primaryFocusPebble={primaryPebble}
                    onDelete={onDelete}
                    badges={primaryBadges}
                    explanation={primaryExplanation}
                  />
                </CenteredComponent>
              )}

              {focusedPebblesList.length > 0 && (
                <>
                  <CenteredComponent ariaLabel="focused-pebbles">
                    <NarrowComponent>
                      <LocalHeading label="On Your Radar" />
                    </NarrowComponent>
                  </CenteredComponent>

                  <CenteredComponent ariaLabel="focused-pebbles-list">
                    <FocusedPebbles
                      savedPebbles={focusedPebblesList}
                      onDelete={onDelete}
                      badgesMap={focusedBadgesMap}
                    />
                  </CenteredComponent>
                </>
              )}

              {otherPebblesList.length > 0 && (
                <CenteredComponent ariaLabel="other-pebbles">
                  <OtherPebbles
                    pebbles={otherPebblesList}
                    onDelete={onDelete}
                    badgesMap={otherBadgesMap}
                  />
                </CenteredComponent>
              )}
            </>
          )}
        </div>
        <div className="fixed right-6 bottom-6 xl:right-[calc(40%-40rem/2)]">
          <AddPebbleIcon handleClick={() => setIsModalOpen(true)} />
        </div>
      </main>
      <AddPebbleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default DashboardClient;
