const MarketingPage = () => {
  const appUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://app.stonethrow.io'
      : 'http://app.localhost:3000';

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
