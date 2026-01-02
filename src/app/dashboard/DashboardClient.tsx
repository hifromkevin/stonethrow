'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Header from '@/components/layout/Header';
import FocusCard from '@/features/FocusedCard/FocusCard';
import FocusedPebbles from '@/features/FocusedPebbles/FocusedPebbles';
import OtherPebbles from '@/features/OtherPebbles/OtherPebbles';
import AddPebbleIcon from '@/features/AddPebbleIcon/AddPebbleIcon';
import Modal from '@/components/layout/Modal';
import CenteredComponent from '@/components/layout/CenteredComponent';

import addPebble from '@/app/actions/addPebble';
import { Pebble } from '@/types';

type Preview = {
  title: string;
  url: string;
};

export default function Dashboard({
  savedPebbles,
}: {
  savedPebbles: Pebble[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <div className="min-h-screen w-screen bg-slate-100 pt-12">
        <Header />
        <CenteredComponent>
          <FocusCard />
        </CenteredComponent>
        <CenteredComponent>
          <FocusedPebbles savedPebbles={savedPebbles} />
        </CenteredComponent>
        <CenteredComponent>
          <OtherPebbles />
        </CenteredComponent>
        <div className="fixed right-8 bottom-8 z-50 text-sm text-slate-500">
          <AddPebbleIcon
            handleClick={() => {
              setIsModalOpen(true);
            }}
          />
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={(shouldSaveAndClose: boolean) => {
          // shouldSaveAndClose ? router.refresh() : null;
          setIsModalOpen(false);
        }}
      ></Modal>
    </>
  );
}
