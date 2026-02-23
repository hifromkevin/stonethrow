'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import usePebbles from '@/lib/queries/client/usePebbles';
import useRankedPebbles from '@/lib/queries/client/useRankedPebbles';
import useFocus from '@/lib/queries/useFocus';

import CenteredComponent from '@/components/layout/CenteredComponent';
import Header from '@/components/layout/Header';
import AddPebbleModal from '@/components/layout/AddPebbleModal';
import NarrowComponent from '@/components/layout/NarrowComponent';

import AddPebbleIcon from '@/features/AddPebbleIcon/AddPebbleIcon';
import CoachHint from '@/features/CoachHint/CoachHint';
import FocusCard from '@/features/FocusCard/FocusCard';

import FocusedPebbles from '@/features/FocusedPebbles/FocusedPebbles';
import LocalHeading from '@/components/layout/LocalHeading';
import OtherPebbles from '@/features/OtherPebbles/OtherPebbles';
import PebblesEmptyState from '@/features/PebblesEmptyState/PebblesEmptyState';
import PrimaryFocusPebble from '@/features/PrimaryFocusPebble/PrimaryFocusPebble';

import useDeletePebble from '@/lib/mutations/useDeletePebble';
import {
  needsCoachHint,
  needsBackgroundHint,
} from '@/lib/scoring/score-labels';

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

  // Preserve the last fully-scored snapshot so the list doesn't jump to
  // newest-to-oldest while re-scoring (all pebbles default to score 50).
  const stableRankedRef = useRef<typeof rankedData>(undefined);
  const stableFocusIdRef = useRef<string | undefined>(undefined);

  const isCurrentlyScoring = rankedData?.scoringStatus?.isScoring ?? false;
  if (!isCurrentlyScoring && rankedData) {
    stableRankedRef.current = rankedData;
    stableFocusIdRef.current = focusId;
  }

  // Fall back to stable data only when re-scoring the same focus.
  // For a brand-new focus there's no stable data yet, so show live data.
  const displayRankedData =
    isCurrentlyScoring &&
    stableFocusIdRef.current === focusId &&
    stableRankedRef.current
      ? stableRankedRef.current
      : rankedData;

  const { data: flatPebbles = [], isLoading: flatLoading } = usePebbles();

  const isLoading = focusId ? rankedLoading : flatLoading;

  // Derive display data based on whether we have a focus
  const primaryPebble = focusId
    ? (displayRankedData?.primary?.pebble ?? null)
    : (flatPebbles[0] ?? null);

  const primaryBadges = focusId
    ? (displayRankedData?.primary?.badges ?? [])
    : [];
  const primaryExplanation = focusId
    ? displayRankedData?.primary?.explanation
    : undefined;
  const primaryScore = focusId
    ? displayRankedData?.primary?.final_score
    : undefined;

  const focusedPebblesList = focusId
    ? (displayRankedData?.focused ?? []).map((r) => r.pebble)
    : flatPebbles.slice(1);

  const focusedBadgesMap = focusId
    ? new Map(
        (displayRankedData?.focused ?? []).map((r) => [
          r.pebble.id,
          {
            badges: r.badges,
            explanation: r.explanation,
            score: r.final_score,
          },
        ])
      )
    : new Map();

  const otherPebblesList = focusId
    ? (displayRankedData?.other ?? []).map((r) => r.pebble)
    : flatPebbles.slice(1);

  const otherBadgesMap = focusId
    ? new Map(
        (displayRankedData?.other ?? []).map((r) => [
          r.pebble.id,
          {
            badges: r.badges,
            explanation: r.explanation,
            score: r.final_score,
          },
        ])
      )
    : new Map();

  const hasPebbles = focusId
    ? !!(
        displayRankedData?.primary ||
        (displayRankedData?.focused?.length ?? 0) > 0 ||
        (displayRankedData?.other?.length ?? 0) > 0
      )
    : flatPebbles.length > 0;

  const isScoring = rankedData?.scoringStatus?.isScoring ?? false;
  const scoringStuck = rankedData?.scoringStatus?.scoringStuck ?? false;

  // Collect all final scores to determine if coach hint should show
  const allScores = useMemo(() => {
    if (!focusId || !displayRankedData) return [];
    const scores: number[] = [];
    if (displayRankedData.primary?.final_score !== undefined) {
      scores.push(displayRankedData.primary.final_score);
    }
    displayRankedData.focused?.forEach((r) => scores.push(r.final_score));
    displayRankedData.other?.forEach((r) => scores.push(r.final_score));
    return scores;
  }, [focusId, displayRankedData]);

  // Collect focus sub-scores to detect when difficulty is the bottleneck
  const allSubScores = useMemo(() => {
    if (!focusId || !displayRankedData) return [];
    const ranked = [
      displayRankedData.primary,
      ...(displayRankedData.focused ?? []),
      ...(displayRankedData.other ?? []),
    ];
    return ranked
      .filter((r) => r?.focus_score != null)
      .map((r) => ({
        focus_relevance: r!.focus_score!.focus_relevance,
        contextual_readiness: r!.focus_score!.contextual_readiness,
      }));
  }, [focusId, displayRankedData]);

  // All pebbles for coach hint context
  const allPebbles = useMemo(() => {
    if (!focusId || !displayRankedData) return [];
    const pebbles = [];
    if (displayRankedData.primary)
      pebbles.push(displayRankedData.primary.pebble);
    displayRankedData.focused?.forEach((r) => pebbles.push(r.pebble));
    displayRankedData.other?.forEach((r) => pebbles.push(r.pebble));
    return pebbles;
  }, [focusId, displayRankedData]);

  const showBackgroundHint =
    focusId &&
    !isScoring &&
    allSubScores.length > 0 &&
    needsBackgroundHint(allSubScores);

  const showCoachHint =
    !showBackgroundHint &&
    focusId &&
    focus?.statement &&
    !isScoring &&
    allScores.length > 0 &&
    needsCoachHint(allScores);

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

        {scoringStuck && (
          <CenteredComponent ariaLabel="scoring-error">
            <div className="mx-auto my-4 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Sorting couldn&apos;t complete — AI credits may be too low. Add
              credits and re-save your focus to try again.
            </div>
          </CenteredComponent>
        )}

        {showBackgroundHint && (
          <CenteredComponent ariaLabel="coach-hint">
            <CoachHint
              variant="background-context"
              onAction={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </CenteredComponent>
        )}

        {showCoachHint && (
          <CenteredComponent ariaLabel="coach-hint">
            <CoachHint focusStatement={focus.statement} pebbles={allPebbles} />
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
                    score={primaryScore}
                    isScoring={isScoring}
                  />
                </CenteredComponent>
              )}

              {console.log('Focused Pebbles List:', focusedPebblesList)}
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
