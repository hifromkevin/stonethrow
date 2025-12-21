interface ButtonProps {
  label: string;
  clickFn?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: 'primary' | 'secondary';
}

const base =
  'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none';

const variants = {
  primary:
    'bg-[var(--color-primary)] text-white focus:ring-[var(--color-primary)] transition-colors duration-1000 ease-out hover:bg-[var(--color-primary-hover)]',
  secondary:
    'text-slate-500 no-border transition-colors duration-1000 ease-out hover:text-slate-700',
};

const Button = ({ label, clickFn, variant = 'primary' }: ButtonProps) => {
  return (
    <button onClick={clickFn} className={`${base} ${variants[variant]}`}>
      {label}
    </button>
  );
};
export default Button;
