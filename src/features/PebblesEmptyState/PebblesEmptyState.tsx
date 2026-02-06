type Props = {
  hasFocus: boolean;
  onAddPebble: () => void;
};

const PebblesEmptyState = ({ hasFocus, onAddPebble }: Props) => {
  return (
    <section
      aria-labelledby="empty-state-heading"
      className="mx-auto mt-8 max-w-lg rounded-xl border border-slate-200 bg-slate-50 p-8 text-center"
    >
      <h2 className="text-2xl font-semibold text-slate-800">
        Welcome to Stonethrow!
      </h2>

      <p className="mt-4 text-lg text-slate-600">
        Add all of your links and videos (we call them{' '}
        <span className="font-medium">Pebbles</span>) here
        {!hasFocus && ', then set a Focus'}, and we'll take care of the rest.
      </p>

      <button
        onClick={onAddPebble}
        className="mt-6 rounded-lg bg-[var(--color-primary)] px-6 py-3 text-white transition hover:opacity-90"
      >
        Add your first Pebble
      </button>
    </section>
  );
};

export default PebblesEmptyState;
