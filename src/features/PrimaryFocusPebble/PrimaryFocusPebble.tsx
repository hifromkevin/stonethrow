import LocalHeading from '@/components/layout/LocalHeading';
import Button from '@/components/ui/Button';
import ScoreLabel from '@/components/ui/ScoreLabel/ScoreLabel';
import cleanTitle from '@/lib/urls/cleanTitle';
import { Pebble } from '@/types/pebble';
import type { Badge } from '@/types/scoring';

const BADGE_ICON: Record<string, string> = {
  positive: '✓',
  neutral: '•',
  negative: '✗',
};

const BADGE_COLOR: Record<string, string> = {
  positive: 'text-green-700',
  neutral: 'text-slate-500',
  negative: 'text-red-600',
};

const PrimaryFocusPebble = ({
  primaryFocusPebble,
  onDelete,
  badges = [],
  explanation,
  score,
}: {
  primaryFocusPebble: Pebble;
  onDelete: (pebbleId: string) => void;
  badges?: Badge[];
  explanation?: string;
  score?: number;
}) => (
  <div className="mx-auto my-10 w-full max-w-2xl">
    <LocalHeading label="If you only do one thing today..." bigger />

    <div className="rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur">
      <a
        className="mb-2 text-3xl leading-tight font-medium text-gray-900"
        href={primaryFocusPebble?.canonical_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {cleanTitle(primaryFocusPebble?.title)}
      </a>

      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <a
          className="block truncate text-sm text-slate-500"
          href={primaryFocusPebble?.canonical_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          ({primaryFocusPebble?.domain || primaryFocusPebble?.canonical_url})
        </a>
        {score !== undefined && <ScoreLabel score={score} />}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-[160px_1fr]">
        <figure className="relative h-[120px] w-full overflow-hidden rounded-xl bg-gray-100 sm:h-[110px]">
          <img
            src={primaryFocusPebble?.image_url}
            alt={
              primaryFocusPebble?.description ||
              primaryFocusPebble?.title ||
              'Pebble Image'
            }
            className="h-full w-full object-cover"
          />
        </figure>

        <div>
          <p className="mb-3 font-medium text-gray-900">Why this matters</p>
          <div className="border-l-4 border-[var(--color-primary)]">
            <p className="mb-4 ml-2 text-sm text-gray-900">
              {explanation ??
                'This was selected as your primary focus because it aligns with your goals.'}
            </p>
          </div>

          {/* <ul className="space-y-2 text-sm text-gray-600">
            {badges.map((badge) => (
              <li key={badge.name} className="flex gap-2">
                <span className={BADGE_COLOR[badge.category]}>
                  {BADGE_ICON[badge.category]}
                </span>
                {badge.name}
              </li>
            ))}
          </ul> */}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 flex justify-center">
        <Button
          type="submit"
          label="Work on this now"
          href={primaryFocusPebble?.canonical_url}
        />
      </div>
    </div>
  </div>
);
export default PrimaryFocusPebble;
