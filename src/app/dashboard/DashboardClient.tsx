'use client';
import { useState } from 'react';
import usePebbles from '@/lib/queries/client/usePebbles';

import Header from '@/components/layout/Header';
import FocusCard from '@/features/FocusedCard/FocusCard';
import FocusedPebbles from '@/features/FocusedPebbles/FocusedPebbles';
import OtherPebbles from '@/features/OtherPebbles/OtherPebbles';
import AddPebbleIcon from '@/features/AddPebbleIcon/AddPebbleIcon';
import Modal from '@/components/layout/Modal';
import CenteredComponent from '@/components/layout/CenteredComponent';

import { Pebble } from '@/types';

type Preview = {
  title: string;
  url: string;
};

const DashboardClient = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    data: pebbles = [],
    isLoading: pebblesLoading,
    error: pebblesError,
  } = usePebbles();
  if (pebblesLoading) return <div>Loading…</div>;
  if (pebblesError) return <div>Failed to load pebbles</div>;

  return (
    <>
      <div className="min-h-screen w-screen bg-white pt-12">
        <Header />
        <CenteredComponent>
          <FocusCard />
        </CenteredComponent>
        <CenteredComponent>
          {/* TODO: These will eventually be only focused/starred pebbles  */}
          <FocusedPebbles savedPebbles={pebbles} />
        </CenteredComponent>
        <CenteredComponent>
          <OtherPebbles />
        </CenteredComponent>
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
