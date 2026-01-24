import { ReactNode } from 'react';
const CenteredComponent = ({
  ariaLabel,
  children,
}: {
  ariaLabel?: string;
  children: ReactNode;
}) => (
  <section className="flex w-full justify-center" aria-labelledby={ariaLabel}>
    {children}
  </section>
);
export default CenteredComponent;
