'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

const scrollToId = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const getAppLoginUrl = () => {
  const { hostname, port, protocol } = window.location;
  const base = hostname.replace(/^www\./, '');
  const appHostname =
    hostname === 'localhost' ? 'app.localhost' : `app.${base}`;
  const portStr = port ? `:${port}` : '';
  return `${protocol}//${appHostname}${portStr}/login`;
};

const getAppSignUpUrl = () => {
  const { hostname, port, protocol } = window.location;
  const base = hostname.replace(/^www\./, '');
  const appHostname =
    hostname === 'localhost' ? 'app.localhost' : `app.${base}`;
  const portStr = port ? `:${port}` : '';
  return `${protocol}//${appHostname}${portStr}/sign-up`;
};

const MarketingLanding = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const btnPrimary =
    'px-8 py-[0.85rem] bg-[#3d9b8f] text-white border-0 rounded-full text-[0.95rem] font-semibold cursor-pointer [font-family:inherit] transition-all duration-[250ms] shadow-[0_2px_12px_rgba(61,155,143,0.25)] hover:bg-[#2e7d73] hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(61,155,143,0.3)]';

  const sectionEyebrow =
    'text-xs font-bold text-[#3d9b8f] uppercase tracking-[0.1em] mb-4';

  const sectionTitle =
    'font-dm-serif text-[clamp(2rem,3vw,2.75rem)] font-normal tracking-[-0.02em] mb-14 leading-[1.15]';

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fafaf8] text-[#1b1b1b] antialiased">
      {/* NAV */}
      <nav
        className="fixed top-0 right-0 left-0 z-[100] flex items-center justify-between border-b border-black/5 bg-[rgba(250,250,248,0.85)] px-10 py-4 backdrop-blur-[20px] backdrop-saturate-[180%] max-[960px]:px-5 max-[960px]:py-[0.85rem]"
        aria-label="Primary"
      >
        <Link
          href="/"
          className="flex items-center gap-[0.6rem] text-[#1b1b1b] no-underline"
        >
          <span className="text-[1.05rem] font-semibold tracking-[-0.02em]">
            stonethrow
          </span>
        </Link>
        <div className="flex items-center gap-7">
          <a
            href="#how"
            className="text-sm font-medium text-[#8a8a8a] no-underline transition-colors duration-200 hover:text-[#1b1b1b] max-[960px]:hidden"
          >
            How it works
          </a>
          <a
            href="#who"
            className="text-sm font-medium text-[#8a8a8a] no-underline transition-colors duration-200 hover:text-[#1b1b1b] max-[960px]:hidden"
          >
            Who it&apos;s for
          </a>
          <button
            type="button"
            className="cursor-pointer rounded-full border-0 bg-[#1b1b1b] px-[1.35rem] py-[0.55rem] [font-family:inherit] text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#333] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
            onClick={() => {
              window.location.href = getAppLoginUrl();
            }}
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="mx-auto grid min-h-[90vh] max-w-[1200px] grid-cols-2 items-center gap-16 px-10 pt-[8rem] pb-20 max-[960px]:min-h-0 max-[960px]:grid-cols-1 max-[960px]:gap-10 max-[960px]:px-6 max-[960px]:pt-[6.5rem] max-[960px]:pb-12"
        aria-labelledby="hero-heading"
      >
        <div className="max-w-[520px] max-[960px]:max-w-full">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[rgba(61,155,143,0.15)] px-[0.9rem] py-[0.35rem] text-xs font-semibold tracking-[0.03em] text-[#2e7d73]">
            <span className="animate-badge-pulse h-[5px] w-[5px] rounded-full bg-[#3d9b8f]" />
            Free to use
          </div>
          <h1
            id="hero-heading"
            className="font-dm-serif mb-6 text-[clamp(2.8rem,4.5vw,3.8rem)] leading-[1.1] font-normal tracking-[-0.02em] text-[#1b1b1b]"
          >
            Turn your saved links into a game plan.
          </h1>
          <p className="mb-10 text-[1.15rem] leading-[1.65] font-normal text-[#4a4a4a]">
            Every link you saved had a reason.{' '}
            <strong className="font-semibold text-[#1b1b1b]">
              Stonethrow remembers it.
            </strong>
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className={btnPrimary}
              onClick={() => {
                window.location.href = getAppSignUpUrl();
              }}
            >
              Sign Up — It&apos;s Free
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-full border border-[#e5e5e3] bg-transparent px-8 py-[0.85rem] [font-family:inherit] text-[0.95rem] font-medium text-[#4a4a4a] transition-all duration-[250ms] hover:border-[#8a8a8a] hover:text-[#1b1b1b]"
              onClick={() => scrollToId('how')}
            >
              See how it works
            </button>
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute top-1/2 left-1/2 [z-index:-1] h-4/5 w-4/5 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(61,155,143,0.15)_0%,transparent_70%)] blur-[40px]"
            aria-hidden
          />
          <div className="animate-float-up overflow-hidden rounded-2xl border border-[#e5e5e3] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)]">
            <Image
              src="/marketing/sample.png"
              alt="Stonethrow app showing links ranked by a Focus: planning a getaway to Honolulu"
              width={1200}
              height={780}
              priority
              sizes="(max-width: 960px) 100vw, 50vw"
              className="block h-auto w-full"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        className="border-t border-b border-[#f0f0ee] bg-white px-10 py-28 max-[960px]:px-6 max-[960px]:py-20"
        id="how"
      >
        <div className="mx-auto max-w-[1100px]">
          <div className={sectionEyebrow}>How it works</div>
          <h2 className={sectionTitle}>Three steps to clarity</h2>
          <div className="grid grid-cols-3 gap-8 max-[960px]:grid-cols-1">
            {[
              {
                n: '1',
                title: 'Save a Pebble',
                body: "Drop in any link — articles, videos, docs, tweets, tools. Don't organize. Just save.",
                example: (
                  <>
                    <strong className="text-[#1b1b1b] not-italic">
                      youtube.com
                    </strong>{' '}
                    &mdash; &quot;How to Plan a Trip to Oahu&quot;
                  </>
                ),
              },
              {
                n: '2',
                title: 'Set your Focus',
                body: "Write one sentence about what you're working toward right now. This is the lens everything gets ranked against.",
                example: (
                  <>
                    <strong className="text-[#1b1b1b] not-italic">
                      Focus:
                    </strong>{' '}
                    &quot;I am planning a getaway to Honolulu&quot;
                  </>
                ),
              },
              {
                n: '3',
                title: 'See what matters',
                body: 'Stonethrow scores every Pebble against your Focus. The most relevant links surface to the top — with an explanation of why.',
                example: (
                  <>
                    <strong className="text-[#1b1b1b] not-italic">
                      ★ Top Match
                    </strong>{' '}
                    &mdash; gohawaii.com, authoritative &amp; exhaustive
                  </>
                ),
              },
            ].map(({ n, title, body, example }) => (
              <div
                key={n}
                className="group fade-in rounded-[14px] border border-[#e5e5e3] bg-[#fafaf8] p-9 transition-all duration-300 hover:-translate-y-[3px] hover:border-[#3d9b8f] hover:shadow-[0_0_0_3px_rgba(61,155,143,0.15),0_8px_32px_rgba(0,0,0,0.04)]"
              >
                <div className="font-dm-serif mb-5 text-[3rem] leading-none text-[#e5e5e3] transition-colors duration-300 group-hover:text-[rgba(61,155,143,0.15)]">
                  {n}
                </div>
                <h3 className="mb-3 text-[1.15rem] font-bold tracking-[-0.01em]">
                  {title}
                </h3>
                <p className="text-[0.925rem] leading-[1.65] text-[#4a4a4a]">
                  {body}
                </p>
                <div className="mt-5 rounded-lg border border-[#f0f0ee] bg-white px-4 py-[0.85rem] text-[0.825rem] text-[#8a8a8a] italic">
                  {example}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section
        className="bg-[#fafaf8] px-10 py-28 max-[960px]:px-6 max-[960px]:py-20"
        id="who"
      >
        <div className="mx-auto max-w-[1100px]">
          <div className={sectionEyebrow}>Sound familiar?</div>
          <h2 className={sectionTitle}>You&apos;ve been here before</h2>
          <div className="grid grid-cols-2 gap-5 max-[960px]:grid-cols-1">
            {[
              {
                icon: '📑',
                title: 'The 200-bookmark graveyard',
                body: "You've got hundreds of saved links and no idea which ones are still useful. Everything's at the same priority level, so nothing gets done.",
              },
              {
                icon: '🌊',
                title: 'Drowning in tabs',
                body: "You're deep into researching something specific and have 40 tabs open. You need a way to know which ones actually matter for what you're trying to do.",
              },
              {
                icon: '⏳',
                title: 'The "save for later" trap',
                body: 'You save everything with good intentions. Later never comes. The good stuff sits buried under noise, and you forget why you saved it in the first place.',
              },
              {
                icon: '🎯',
                title: 'Busy but not productive',
                body: "You're consuming content that feels productive but isn't moving your actual goal forward. You need someone to tell you what deserves your attention right now.",
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                className="fade-in flex items-start gap-5 rounded-[14px] border border-[#e5e5e3] bg-white p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3d9b8f] hover:shadow-[0_0_0_3px_rgba(61,155,143,0.15)]"
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(61,155,143,0.06)] text-xl"
                  aria-hidden
                >
                  {icon}
                </div>
                <div>
                  <h3 className="mb-[0.4rem] text-base font-semibold tracking-[-0.01em]">
                    {title}
                  </h3>
                  <p className="text-sm leading-[1.55] text-[#4a4a4a]">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFFERENTIATOR */}
      <section className="border-t border-b border-[#f0f0ee] bg-white px-10 py-24 max-[960px]:px-6 max-[960px]:py-20">
        <div className="fade-in mx-auto max-w-[720px] text-center">
          <div className={sectionEyebrow}>Not another bookmark app</div>
          <p className="font-dm-serif mb-6 text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.35] font-normal text-[#1b1b1b]">
            Most bookmark tools are filing cabinets.
            <br />
            Stonethrow is{' '}
            <em className="text-[#3d9b8f] italic">a strategist.</em>
          </p>
          <p className="mx-auto max-w-[560px] text-[1.05rem] leading-[1.7] text-[#4a4a4a]">
            It reads what you save, understands what you&apos;re focused on, and
            tells you what deserves your attention right now. No folders. No
            tags. No organizing. Just answers.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        className="bg-[#161616] px-10 py-28 text-white max-[960px]:px-6 max-[960px]:py-20"
        id="cta"
      >
        <div className="fade-in mx-auto max-w-[640px] text-center">
          <div className="mb-6 text-xs font-bold tracking-[0.1em] text-[#3d9b8f] uppercase">
            Ready?
          </div>
          <h2 className="font-dm-serif mb-5 text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.1] font-normal tracking-[-0.02em]">
            Start turning links
            <br />
            into a game plan.
          </h2>
          <p className="mb-10 text-[1.1rem] leading-[1.6] text-white/50">
            Stonethrow is free. Sign up and start saving links in seconds.
          </p>
          <button
            type="button"
            className="cursor-pointer rounded-full border-0 bg-[#3d9b8f] px-[2.75rem] py-4 [font-family:inherit] text-[1.05rem] font-semibold text-white shadow-[0_2px_16px_rgba(61,155,143,0.3)] transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-[#2e7d73] hover:shadow-[0_8px_28px_rgba(61,155,143,0.4)]"
            onClick={() => (window.location.href = getAppSignUpUrl())}
          >
            Sign Up — It&apos;s Free
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="flex items-center justify-between border-t border-white/5 bg-[#161616] px-10 py-8 max-[960px]:flex-col max-[960px]:gap-3 max-[960px]:text-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-white/40 no-underline"
        >
          stonethrow
        </Link>
        <p className="text-[0.8rem] text-white/20">
          © {new Date().getFullYear()} Stonethrow. Built in the Bay Area.
        </p>
      </footer>
    </div>
  );
};

export default MarketingLanding;
