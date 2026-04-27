'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

import usePebbles from '@/lib/queries/client/usePebbles';
import useRankedPebbles from '@/lib/queries/client/useRankedPebbles';
import useFocus from '@/lib/queries/useFocus';
import useCompletedPebbles from '@/lib/queries/client/useCompletedPebbles';

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
import PrimaryFocusPebble from '@/features/PrimaryFocusPebble/PrimaryFocusPebbleV2';
import DoneQueue from '@/features/DoneQueue/DoneQueue';

import useDeletePebble from '@/lib/mutations/useDeletePebble';
import useMarkComplete from '@/lib/mutations/useMarkComplete';
import useUndoComplete from '@/lib/mutations/useUndoComplete';
import { needsBackgroundHint } from '@/lib/scoring/score-labels';

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
  const [isRescoring, setIsRescoring] = useState(false);
  const [toast, setToast] = useState<{ pebbleId: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = (searchParams.get('view') ?? 'active') as
    | 'active'
    | 'done';

  const setView = (view: 'active' | 'done') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.replace(`?${params.toString()}`);
  };

  const { data: focus } = useFocus();
  const focusId = focus?.id;

  const { data: rankedData, isLoading: rankedLoading } =
    useRankedPebbles(focusId);

  console.log('Ranked Data:', rankedData); // Debug log for ranked data

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
  const { data: completedPebbles = [] } = useCompletedPebbles();

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
  // Rank 1 = primary pebble (always, when a focus is active)
  const primaryRank = focusId ? 1 : undefined;

  const fullFocused = focusId ? (displayRankedData?.focused ?? []) : [];
  const focusedRanked = fullFocused.slice(0, 7);
  const remainingFocused = fullFocused.slice(7);

  const focusedPebblesList = focusId
    ? focusedRanked.map((r) => r.pebble)
    : flatPebbles.slice(1, 8);

  // focusedRanked[0] = rank 2, [1] = rank 3, …, [6] = rank 8 (no badge)
  const focusedBadgesMap = focusId
    ? new Map(
        focusedRanked.map((r, i) => [
          r.pebble.id,
          {
            badges: r.badges,
            explanation: r.explanation,
            rank: i + 2,
          },
        ])
      )
    : new Map();

  const otherPebblesList = focusId
    ? [...remainingFocused, ...(displayRankedData?.other ?? [])].map(
        (r) => r.pebble
      )
    : flatPebbles.slice(8);

  // Other pebbles get no rank badge — just pass explanation for the tooltip
  const otherBadgesMap = focusId
    ? new Map([
        ...remainingFocused.map(
          (r) =>
            [
              r.pebble.id,
              {
                badges: r.badges,
                explanation: r.explanation,
              },
            ] as const
        ),
        ...(displayRankedData?.other ?? []).map(
          (r) =>
            [
              r.pebble.id,
              {
                badges: r.badges,
                explanation: r.explanation,
              },
            ] as const
        ),
      ])
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

  // Tab counts
  const activeCount = focusId
    ? (displayRankedData?.primary ? 1 : 0) +
      (displayRankedData?.focused?.length ?? 0) +
      (displayRankedData?.other?.length ?? 0)
    : flatPebbles.length;
  const doneCount = completedPebbles.length;

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

  // Fire as soon as pebbles are rendered — the coach hint fetches in the background
  // and fades in when ready, so no need to wait for enrichment or score thresholds.
  const showCoachHint =
    !showBackgroundHint && focusId && focus?.statement && hasPebbles;

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

  const handleRescore = async () => {
    if (isRescoring) return;
    setIsRescoring(true);
    try {
      await fetch('/api/rescore', { method: 'POST' });
      await queryClient.invalidateQueries({
        queryKey: ['pebbles', 'ranked', focusId],
      });
    } finally {
      setIsRescoring(false);
    }
  };

  const deletePebble = useDeletePebble();
  const onDelete = (pebbleId: string) => {
    if (!confirm('Delete this pebble? This can\'t be undone.')) return;
    deletePebble.mutate(pebbleId);
  };

  const markComplete = useMarkComplete();
  const undoComplete = useUndoComplete();

  const handleMarkComplete = useCallback(
    (pebbleId: string) => {
      markComplete.mutate(pebbleId);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToast({ pebbleId });
      toastTimerRef.current = setTimeout(() => setToast(null), 5000);
    },
    [markComplete]
  );

  const handleUndoMarkComplete = () => {
    if (!toast) return;
    undoComplete.mutate(toast.pebbleId);
    setToast(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };

  const handleUndoComplete = useCallback(
    (pebbleId: string) => {
      undoComplete.mutate(pebbleId);
    },
    [undoComplete]
  );

  return (
    <>
      <main className="bg-[linear-gradient(to_bottom_right,#f8fafc,rgba(239,246,255,0.3),rgba(250,245,255,0.2))] mt-18 mb-10 min-h-screen w-screen">
        <Header />
        <CenteredComponent ariaLabel="focus-card">
          <FocusCard
            focusStatus={focusStatus}
            setFocusStatus={setFocusStatus}
          />
        </CenteredComponent>

        {/* Tabs */}
        <CenteredComponent ariaLabel="view-tabs">
          <NarrowComponent>
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setView('active')}
                className={`px-5 py-3 text-sm font-medium transition-colors ${
                  currentView === 'active'
                    ? 'border-b-2 border-teal-600 text-teal-700'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Active{activeCount > 0 ? ` ${activeCount}` : ''}
              </button>
              <button
                onClick={() => setView('done')}
                className={`px-5 py-3 text-sm font-medium transition-colors ${
                  currentView === 'done'
                    ? 'border-b-2 border-teal-600 text-teal-700'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Done{doneCount > 0 ? ` ${doneCount}` : ''}
              </button>
            </div>
          </NarrowComponent>
        </CenteredComponent>

        {/* Done view */}
        {currentView === 'done' && (
          <CenteredComponent ariaLabel="done-queue">
            <DoneQueue
              pebbles={completedPebbles}
              onDelete={onDelete}
              onUndoComplete={handleUndoComplete}
            />
          </CenteredComponent>
        )}

        {/* Active view */}
        {currentView === 'active' && (
          <>
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

            {/* Loading indicator - shown only while waiting for initial ranked pebbles.
                Enrichment (badges/explanations) fills in silently once pebbles are visible. */}
            {isScoring && !hasPebbles && (
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
                <CoachHint
                  focusStatement={focus.statement}
                  pebbles={allPebbles}
                />
              </CenteredComponent>
            )}

            {/* Pebbles - always visible; enrichment updates badges/explanations in-place */}
            <div className="transition-opacity duration-300">
              {hasPebbles && (
                <>
                  {primaryPebble && (
                    <CenteredComponent>
                      <PrimaryFocusPebble
                        primaryFocusPebble={primaryPebble}
                        onDelete={onDelete}
                        badges={primaryBadges}
                        explanation={primaryExplanation}
                        rank={primaryRank}
                        isScoring={isScoring}
                        nextPebble={focusedPebblesList[0]}
                        onMarkComplete={handleMarkComplete}
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
                          onMarkComplete={handleMarkComplete}
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
                        onMarkComplete={handleMarkComplete}
                      />
                    </CenteredComponent>
                  )}

                  {focusId && (
                    <CenteredComponent ariaLabel="rescore">
                      <div className="flex justify-center pb-4">
                        <button
                          onClick={handleRescore}
                          disabled={isRescoring || isScoring}
                          className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-40"
                        >
                          {isRescoring ? 'Re-scoring…' : 'Re-score pebbles'}
                        </button>
                      </div>
                    </CenteredComponent>
                  )}
                </>
              )}
            </div>
          </>
        )}

        <div className="fixed right-6 bottom-6 xl:right-[calc(40%-40rem/2)]">
          <AddPebbleIcon handleClick={() => setIsModalOpen(true)} />
        </div>
      </main>

      <AddPebbleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Mark-complete toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-slate-800 px-4 py-3 text-sm text-white shadow-lg">
          <span>Moved to Done</span>
          <button
            onClick={handleUndoMarkComplete}
            className="font-semibold text-teal-300 hover:text-teal-100"
          >
            Undo
          </button>
        </div>
      )}
    </>
  );
};

export default DashboardClient;
