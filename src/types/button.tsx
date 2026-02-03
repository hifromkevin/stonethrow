export interface ButtonProps {
  clickFn?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  label: string;
  overrides?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
  href?: string;
  target?: '_self' | '_blank';
}
