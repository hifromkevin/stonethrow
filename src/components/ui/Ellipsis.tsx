import { Ellipsis } from 'lucide-react';

const EllipsisIcon = ({ isDefault = true }: { isDefault?: boolean }) => {
  const buttonSize = isDefault ? 'h-6 w-6' : 'h-10 w-10';
  const ellipsisSize = isDefault ? 'h-3 w-3' : 'h-5 w-5';

  return (
    <span
      className={`flex ${buttonSize} items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700`}
      aria-label="More options"
    >
      <Ellipsis className={ellipsisSize} />
    </span>
  );
};

export default EllipsisIcon;
