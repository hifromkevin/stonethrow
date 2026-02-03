import Link from 'next/link';
import { ButtonProps } from '@/types';

const base =
  'cursor-pointer inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none';

const variants = {
  primary:
    'bg-[var(--color-primary)] text-white focus:ring-[var(--color-primary)] transition-colors duration-1000 ease-out hover:bg-[var(--color-primary-hover)]',
  secondary:
    'text-slate-500 no-border transition-colors duration-1000 ease-out hover:text-slate-700',
};

const Button = ({
  clickFn,
  disabled = false,
  label,
  type = 'button',
  overrides,
  variant = 'primary',
  href,
  target = '_blank',
}: ButtonProps) => {
  const className = `${base} ${variants[variant]} ${overrides ?? ''}`;

  if (href) {
    return disabled ? (
      <button className={className} disabled>
        {label}
      </button>
    ) : (
      <Link href={href} className={className} target={target}>
        {label}
      </Link>
    );
  }

  return (
    <button
      className={className}
      onClick={clickFn}
      type={type}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
export default Button;
