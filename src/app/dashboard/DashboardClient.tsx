'use client';
import { useState } from 'react';
import usePebbles from '@/lib/queries/client/usePebbles';

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
import FocusHeroCard from '@/features/PrimaryFocusPebble/FocusHeroCard';

const DashboardClient = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [focusStatus, setFocusStatus] = useState<FocusState>('empty');

  const {
    data: pebbles = [],
    isLoading: pebblesLoading,
    error: pebblesError,
  } = usePebbles();

  const hasPebbles = pebbles.length > 0;

  const deletePebble = useDeletePebble();
  const onDelete = (pebbleId: string) => {
    if (!confirm('Remove this Pebble?')) return;

    deletePebble.mutate(pebbleId);
  };

  console.log('himom!', pebbles);
  return (
    <>
      <main className="min-h-screen w-screen bg-white py-20">
        <Header />
        <CenteredComponent ariaLabel="focus-card">
          <FocusCard
            focusStatus={focusStatus}
            setFocusStatus={setFocusStatus}
          />
        </CenteredComponent>

        <CenteredComponent ariaLabel="polite">
          {pebblesLoading && <div>Loading...</div>}
          {pebblesError && <div>Failed to load pebbles</div>}
        </CenteredComponent>
        {!hasPebbles && !pebblesLoading && (
          <CenteredComponent ariaLabel="no-pebbles-state">
            <PebblesEmptyState
              hasFocus={focusStatus !== 'empty'}
              onAddPebble={() => setIsModalOpen(true)}
            />
          </CenteredComponent>
        )}
        {hasPebbles && (
          <>
            <CenteredComponent>
              {/* <NarrowComponent adtlStyles="mb-4  max-w-4xl"> */}
              <FocusHeroCard
                primaryFocusPebble={pebbles[0]}
                onDelete={onDelete}
              />
              {/* </NarrowComponent> */}
            </CenteredComponent>
            <CenteredComponent ariaLabel="focused-pebbles">
              <NarrowComponent>
                <LocalHeading label="Focused Pebbles" />
              </NarrowComponent>
            </CenteredComponent>

            <CenteredComponent ariaLabel="focused-pebbles-list">
              <FocusedPebbles
                savedPebbles={pebbles.slice(1)}
                onDelete={onDelete}
              />
            </CenteredComponent>

            <CenteredComponent ariaLabel="other-pebbles">
              <OtherPebbles pebbles={pebbles.slice(1)} onDelete={onDelete} />
            </CenteredComponent>
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
    </>
  );
};

export default DashboardClient;
