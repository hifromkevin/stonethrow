const EmptyState = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <h2>Nothing Here Yet</h2>
      <p className="max-w-sm text-center text-sm">
        Add a link, video, or article (a <em>Pebble</em>, as we like to call
        it). We'll help you decide what matters first.
      </p>
      <a
        onClick={() => {}}
        className="cursor-pointer text-[var(--color-primary)] underline hover:text-slate-600"
      >
        Add Your First Pebble!
      </a>{' '}
    </div>
  );
};

export default EmptyState;
