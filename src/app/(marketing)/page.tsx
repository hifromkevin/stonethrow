import { headers } from 'next/headers';

async function getAppUrlFromRequest(): Promise<string> {
  const h = await headers();

  const host =
    h.get('x-forwarded-host') ??
    h.get('host') ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') ??
    '';

  const proto =
    h.get('x-forwarded-proto') ??
    (process.env.NODE_ENV === 'production' ? 'https' : 'http');

  if (!host) return 'http://app.localhost:3000';

  const [hostname, port] = host.split(':');
  const portSuffix = port ? `:${port}` : '';

  // If you’re already on the app subdomain, keep it as-is.
  if (hostname === 'app.localhost' || hostname === 'app.stonethrow.io') {
    return `${proto}://${hostname}${portSuffix}`;
  }

  // Local dev: `localhost:3001` -> `app.localhost:3001`
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${proto}://app.localhost${portSuffix}`;
  }

  // Production / staging:
  // Your app lives on a canonical host (`app.stonethrow.io`) regardless of
  // which marketing domain you land on (`stonethrow.io`, `getstonethrow.com`, etc).
  //
  // If you ever need a different target, use NEXT_PUBLIC_APP_URL to override.
  if (process.env.NODE_ENV === 'production') {
    return `${proto}://app.stonethrow.io${portSuffix}`;
  }

  // Fallback for any other non-local hostname during dev.
  return `${proto}://app.localhost${portSuffix}`;
}

const MarketingPage = async () => {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? (await getAppUrlFromRequest());

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="px-6 text-center">
        {/* <img src="/logo.svg" alt="Stonethrow" className="mx-auto mb-8 h-16" /> */}
        <h1 className="var(--font-afacad) var(--tracking-widest) text-2xl text-slate-800">
          stonethrow
        </h1>

        <h1 className="mb-4 text-4xl font-bold text-slate-900">
          Focus on what matters
        </h1>

        <p className="mb-8 max-w-md text-xl text-slate-600">
          Stonethrow helps you prioritize and take action on the content that
          aligns with your goals.
        </p>

        <div className="flex justify-center gap-4">
          <a
            href={`${appUrl}/login`}
            className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800"
          >
            Get Started
          </a>
          <a
            href={`${appUrl}/login`}
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-50"
          >
            Sign In
          </a>
        </div>
      </div>
    </main>
  );
};
export default MarketingPage;
