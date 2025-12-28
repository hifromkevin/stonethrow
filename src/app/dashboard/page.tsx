'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FocusCard from '@/components/FocusCard';
import FocusedPebbles from '@/components/FocusedPebbles';
import OtherPebbles from '@/components/OtherPebbles';
import Header from '@/components/Header';

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50">
      <Header searchQuery="" setSearchQuery={() => {}} onAddClick={() => {}} />
      <div className="flex w-full justify-center">
        <FocusCard />
      </div>
      <div className="flex w-full justify-center">
        <FocusedPebbles />
      </div>
      <div className="flex w-full justify-center">
        <OtherPebbles />
      </div>
    </div>
  );
}
