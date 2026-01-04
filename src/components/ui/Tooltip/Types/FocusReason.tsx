const AboutFocus = ({ reason }: { reason: string }) => (
  <div className="space-y-2 leading-snug text-pretty text-slate-700">
    <p className="mb-1 flex items-center gap-2 text-[11px] font-medium tracking-wide text-slate-500">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#5FA69A]" />
      Focus reason
    </p>

    <p className="text-sm leading-6 text-slate-700">
      {reason || 'Unable to get a good read on this Pebble.'}
    </p>
  </div>
);

export default AboutFocus;
