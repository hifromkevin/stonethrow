const LocalHeading = ({
  label,
  bigger = false,
}: {
  label: string;
  bigger?: boolean;
}) => (
  <h3
    className={`inline font-semibold tracking-[0.05em] text-slate-500 uppercase ${bigger ? 'text-sm' : 'text-xs'}`}
  >
    {label}
  </h3>
);

export default LocalHeading;
