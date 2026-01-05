import Card from '@/components/ui/Card';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import { Pebble } from '@/types';
import decodeHtmlEntities from '@/lib/urls/decodeHtmlTitles';

const stripProtocol = (url: string) =>
  url ? url.replace(/^[a-zA-Z]+:\/\//, '').replace(/^www\./, '') : null;

const PrimaryFocusPebble = () => {
  return (
    <Card className="mt-3 mb-12 w-full max-w-6xl">
      <div className="group grid grid-cols-[12px_80px_1fr_auto] items-center gap-4 rounded-xl border border-3 border-slate-300 bg-white px-5 py-6 hover:bg-slate-50">
        {/* ☆ Star */}
        <div className="flex pt-1">
          <button
            className="text-slate-400 transition-colors hover:text-yellow-500"
            aria-label="Star"
          >
            ☆
          </button>
        </div>

        {/* Image */}
        <div className="h-18 w-18 overflow-hidden rounded-lg bg-slate-100">
          <img
            src="https://hips.hearstapps.com/hmg-prod/images/natashalyon-margate-living-room-681ce9cf8130d.jpeg?crop=0.748xw:1.00xh;0.163xw,0&resize=640:*"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        {/* Main content */}
        <div className="min-w-0">
          {/* Title row */}
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-l truncate font-semibold text-slate-900">
                Bigger Text for Title w/ Ellipses if Too Long Goes Right Here
              </p>

              <p className="mt-0.5 truncate text-sm text-slate-500">url.com</p>
            </div>

            {/* Why this matters */}
            <button className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">
              Why this matters
            </button>
          </div>

          {/* Badges row */}
          <div className="mt-2 flex flex-wrap gap-2">
            <div className="flex flex-wrap items-start gap-2 text-xs text-slate-500">
              <span>High ROI</span>
              <span className="text-slate-300">•</span>
              <span>Aligns with focus</span>
              <span className="text-slate-300">•</span>
              <span>Go here</span>
            </div>
          </div>
        </div>

        {/* Ellipsis menu */}
        <div className="flex pt-1">
          <button
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="More options"
          >
            …
          </button>
        </div>
      </div>
    </Card>
  );
};

export default PrimaryFocusPebble;
