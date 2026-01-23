import { ReactNode } from 'react';
const CenteredComponent = ({ children }: { children: ReactNode }) => (
  <section className="flex w-full justify-center">{children}</section>
);
export default CenteredComponent;
