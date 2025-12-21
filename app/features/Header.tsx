'use client';

import { Search, Plus, Filter } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { HeaderProps } from '@/types/header';

export default function Header({
  searchQuery,
  setSearchQuery,
  onAddClick,
}: HeaderProps) {
  const { signOut } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-40 mx-auto flex w-full items-center justify-center border-b border-gray-200 bg-white px-8 py-4">
      <div className="flex w-full max-w-5xl">
        <div className="flex flex-1 items-center space-x-6">
          <h1 className="logo">stonethrow</h1>

          <div className="max-w-md flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onAddClick}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Link</span>
          </button>

          <button onClick={() => signOut()} className="btn-secondary text-sm">
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
