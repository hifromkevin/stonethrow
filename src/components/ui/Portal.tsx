import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children }: { children: ReactNode }) => {
  if (typeof window === 'undefined') return null;
  return createPortal(children, document.body);
};

export default Portal;
