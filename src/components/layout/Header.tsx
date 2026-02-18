'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import SignOutButton from '@/components/layout/SignOutButton';

const Header = () => {
  const [query, setQuery] = useState('');

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-5xl items-center px-8 py-2">
        <div className="flex items-center space-x-6">
          <a href="/" aria-label="Stonethrow home">
            <img src="/logo.svg" alt="Stonethrow logo" className="h-8" />
          </a>
        </div>

        <nav className="mx-6 flex flex-1 items-center" aria-label="Primary">
          <div className="relative w-full max-w-md">
            {/* <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <label htmlFor="search-pebbles" className="sr-only">
              Search Pebbles
            </label>

            <input
              id="search-pebbles"
              type="search"
              placeholder="Search Pebbles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field pl-10 focus-visible:outline-none"
            /> */}
          </div>
        </nav>

        <div className="flex items-center space-x-3">
          <button
            aria-label="Open profile menu"
            className="btn-primary flex items-center space-x-2"
          >
            {/* <div className="h-6 w-6 rounded-full bg-slate-300" /> */}
          </button>

          <SignOutButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
