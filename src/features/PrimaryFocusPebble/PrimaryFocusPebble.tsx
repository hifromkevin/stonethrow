import Card from '@/components/ui/Card';
import LocalHeading from '@/components/layout/LocalHeading';
import Sidebar from '@/components/ui/Sidebar';
import { Pebble } from '@/types';
import EllipsisIcon from '@/components/ui/Ellipsis/EllipsisIcon';
import cleanTitle from '@/lib/urls/cleanTitle';
import useDeletePebble from '@/lib/mutations/useDeletePebble';

const PrimaryFocusPebble = ({
  primaryFocusPebble,
  onDelete,
}: {
  primaryFocusPebble: Pebble;
  onDelete: (pebbleId: string) => void;
}) => (
  <article className="mx-4 mb-4 w-full max-w-5xl">
    <Card className="relative w-full">
      <div className="group grid grid-cols-[auto_auto_1fr_auto] items-stretch gap-0 rounded-xl border border-2 border-slate-300 bg-[rgba(95,166,154,0.08)] shadow-[0_20px_25px_-20px_rgba(95,166,154,1)] transition-all duration-700 hover:bg-[rgba(95,166,154,0.25)]">
        <figure className="aspect-square w-44 shrink-0 overflow-hidden rounded-l-xl">
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

        <div className="mx-8 my-4">
          <span
            aria-hidden="true"
            className="block h-full w-1 rounded-xl bg-[var(--color-primary)]"
          />
        </div>

        <div className="mt-4 mr-8 mb-8 min-w-0">
          <LocalHeading label="Main Focus" />

          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="min-w-0">
              <a
                className="block truncate text-3xl font-semibold text-slate-900"
                href={primaryFocusPebble?.canonical_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {cleanTitle(primaryFocusPebble?.title)}
              </a>

              <a
                className="block truncate text-sm text-slate-500"
                href={primaryFocusPebble?.canonical_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                (
                {primaryFocusPebble?.domain ||
                  primaryFocusPebble?.canonical_url}
                )
              </a>
            </div>
          </div>

          <p className="mt-6 line-clamp-2 text-sm text-slate-700">
            This unlocks server-side rendering so the rest of today's work isn't
            blocked.
          </p>
        </div>

        <div className="flex items-center pr-4">
          <EllipsisIcon
            isDefault={false}
            url={primaryFocusPebble?.canonical_url}
            onDelete={onDelete}
            pebbleId={primaryFocusPebble.id}
          />
        </div>
      </div>
    </Card>
  </article>
);

export default PrimaryFocusPebble;
