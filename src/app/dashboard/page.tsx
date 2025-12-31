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

type Preview = {
  title: string;
  url: string;
};

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<Preview[]>([]);
  const [url, setUrl] = useState('');

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleNewPebble = (preview: Preview) => {
    setItems((prev) => [preview, ...prev]);
  };

  return (
    <>
      {console.log('Items:', items)}
      <div className="min-h-screen w-screen bg-slate-100">
        <Header />
        <CenteredComponent>
          <FocusCard />
        </CenteredComponent>
        <CenteredComponent>
          <FocusedPebbles />
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
        onSuccess={handleNewPebble}
      ></Modal>
    </>
  );
}
