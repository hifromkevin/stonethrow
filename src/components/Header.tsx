'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import useAuth from '../lib/queries/useAuth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { signOut } = useAuth();
  const [query, setQuery] = useState('');

  // const signOut = () => {
  //   const router = useRouter();
  //   console.log('Himom!');

  //   router.replace('/login');
  // };

  return (
    <header className="fixed inset-x-0 top-0 z-40 mx-auto flex w-full items-center justify-center border-b border-gray-200 bg-white px-8 py-2 shadow-sm">
      <div className="flex w-full max-w-5xl">
        <div className="flex flex-1 items-center space-x-6">
          <img src="/logo.svg" alt="stonethrow" className="h-8" />

          <div className="max-w-md flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search links..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input-field pl-10 focus-visible:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {}}
            className="btn-primary flex items-center space-x-2"
          >
            <div className="h-6 w-6 rounded-full bg-slate-300"></div>
          </button>

          <button onClick={() => signOut()} className="btn-secondary text-sm">
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
