'use client';
import FocusCard from '@/app/features/FocusCard';
import Header from '@/app/features/Header';

export default async function Dashboard() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50">
      <Header searchQuery="" setSearchQuery={() => {}} onAddClick={() => {}} />
      <div className="flex w-full justify-center">
        <FocusCard />
      </div>
    </div>
  );
}
