'use client';

import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="card w-full max-w-md p-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Stonethrow
        </h1>
        <p className="mt-2 text-slate-500">Sign in to your account</p>

        <form className="mt-8 space-y-4">
          <div className="space-y-2 text-left">
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              defaultValue="you@example.com"
              className="focus:border-brand focus:ring-brand/20 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 transition focus:ring-2"
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              defaultValue="password"
              className="focus:border-brand focus:ring-brand/20 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 transition focus:ring-2"
            />
          </div>

          <button
            type="submit"
            className="bg-brand hover:bg-brand/90 w-full rounded-lg py-3 font-semibold text-white shadow-sm transition"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-500">
          For MVP, any credentials will work
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="text-brand text-sm hover:underline"
          >
            Skip to dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
