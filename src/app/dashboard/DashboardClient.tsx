'use client';
import { useState } from 'react';
import usePebbles from '@/lib/queries/client/usePebbles';

import CenteredComponent from '@/components/layout/CenteredComponent';
import Header from '@/components/layout/Header';
import Modal from '@/components/layout/Modal';

import AddPebbleIcon from '@/features/AddPebbleIcon/AddPebbleIcon';
import FocusCard from '@/features/FocusCard/FocusCard';

import FocusedPebbles from '@/features/FocusedPebbles/FocusedPebbles';
import LocalHeading from '@/components/layout/LocalHeading';
import OtherPebbles from '@/features/OtherPebbles/OtherPebbles';
import PebblesEmptyState from '@/features/PebblesEmptyState/PebblesEmptyState';
import PrimaryFocusPebble from '@/features/PrimaryFocusPebble/PrimaryFocusPebble';

import { FocusState } from '@/types';

const DashboardClient = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [focusStatus, setFocusStatus] = useState<FocusState>('empty');

  const {
    data: pebbles = [],
    isLoading: pebblesLoading,
    error: pebblesError,
  } = usePebbles();
  if (pebblesLoading) return <div>Loading…</div>;
  if (pebblesError) return <div>Failed to load pebbles</div>;

  const hasPebbles = pebbles.length > 0;

  return (
    <>
      <div className="min-h-screen w-screen bg-white pt-12">
        <Header />
        <CenteredComponent>
          <FocusCard
            focusStatus={focusStatus}
            setFocusStatus={setFocusStatus}
          />
        </CenteredComponent>

        {!hasPebbles && (
          <CenteredComponent>
            <PebblesEmptyState
              hasFocus={focusStatus !== 'empty'}
              onAddPebble={() => setIsModalOpen(true)}
            />
          </CenteredComponent>
        )}

        {hasPebbles && (
          <>
            <CenteredComponent>
              <div className="mb-4 w-full max-w-4xl">
                <LocalHeading label="Focused Pebbles" />
                <p className="text-xs tracking-[0.05em] text-slate-400">
                  If you do only one thing today, start here
                </p>
              </div>
            </CenteredComponent>
            <CenteredComponent>
              <PrimaryFocusPebble primaryFocusPebble={pebbles[3]} />
            </CenteredComponent>

            <CenteredComponent>
              <FocusedPebbles savedPebbles={pebbles.slice(1)} />
            </CenteredComponent>

            <CenteredComponent>
              <OtherPebbles />
            </CenteredComponent>
          </>
        )}

        <div className="fixed right-6 bottom-6 xl:right-[calc(40%-40rem/2)]">
          <AddPebbleIcon handleClick={() => setIsModalOpen(true)} />
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={(shouldSaveAndClose: boolean) => setIsModalOpen(false)}
      ></Modal>
    </>
  );
};

export default DashboardClient;
