'use client';

import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md card p-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Stonethrow
        </h1>
        <p className="text-slate-500 mt-2">Sign in to your account</p>

        <form className="mt-8 space-y-4">
          <div className="text-left space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              defaultValue="you@example.com"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
            />
          </div>

          <div className="text-left space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              defaultValue="password"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-brand text-white py-3 font-semibold shadow-sm hover:bg-brand/90 transition"
          >
            Sign in
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-4">
          For MVP, any credentials will work
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="text-sm text-brand hover:underline"
          >
            Skip to dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
