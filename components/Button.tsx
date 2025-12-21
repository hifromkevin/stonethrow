interface ButtonProps {
  label: string;
  clickFn?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: 'primary' | 'secondary';
}

const base =
  'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none';

const variants = {
  primary:
    'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus:ring-[var(--color-primary)]',
  secondary: 'text-slate-700 no-border',
};

const Button = ({ label, clickFn, variant = 'primary' }: ButtonProps) => {
  return (
    <button onClick={clickFn} className={`${base} ${variants[variant]}`}>
      {label}
    </button>
  );
};
export default Button;
