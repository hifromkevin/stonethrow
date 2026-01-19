import Card from '@/components/ui/Card';
import LocalHeading from '@/components/layout/LocalHeading';
import Sidebar from '@/components/ui/Sidebar';
import { Pebble } from '@/types';

const PrimaryFocusPebble = ({
  primaryFocusPebble,
}: {
  primaryFocusPebble: Pebble;
}) => {
  return (
    <div className="w-full max-w-5xl">
      {/* mx-8 my-10  */}
      <LocalHeading label="MAIN FOCUS" />
      <Card className="relative w-full max-w-6xl">
        <Sidebar size="large" />
        <div
          className={`absolute inset-y-0 left-0 w-['4px'] bg-[var(--color-primary)]`}
        />
        <div className="group grid grid-cols-[12px_80px_1fr_auto] items-center gap-4 bg-[rgba(95,166,154,0.12)] shadow-[0_20px_25px_-20px_rgba(95,166,154,1)] hover:bg-[rgba(95,166,154,0.25)]">
          <div className="flex pt-1">
            <button
              className="ml-2 text-slate-400 transition-colors hover:text-yellow-500"
              aria-label="Star"
            >
              ☆
            </button>
          </div>
          <div className="h-full w-full">
            <img
              src="https://hips.hearstapps.com/hmg-prod/images/natashalyon-margate-living-room-681ce9cf8130d.jpeg?crop=0.748xw:1.00xh;0.163xw,0&resize=640:*"
              alt=""
              className="h-full w-full"
            />
          </div>

          {/* Main content */}
          <div className="mx-8 my-10 min-w-0">
            {/* Title row */}
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="truncate text-2xl font-semibold text-slate-900">
                  {primaryFocusPebble?.title}
                </span>
                <span className="ml-10 truncate text-sm text-slate-500">
                  (
                  {primaryFocusPebble?.domain ||
                    primaryFocusPebble?.canonical_url}
                  )
                </span>
                <div className="mt-2 text-xs">
                  <span>
                    This unlocks server-side rendering so the rest of today's
                    work isn't blocked.
                  </span>
                </div>
              </div>
            </div>

            {/* <div className="mt-6 flex flex-wrap gap-2">
              <div className="flex flex-wrap items-start gap-2 text-xs text-slate-500">
                <span>
                  This unlocks server-side rendering so the rest of today's work
                  isn't blocked.
                </span>
              </div>
            </div> */}
          </div>
          {/* Ellipsis menu */}
          <div className="flex pt-1">
            <button
              className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="More options"
            >
              …
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PrimaryFocusPebble;
