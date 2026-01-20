import { ReactNode } from 'react';

export type TooltipProps = {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'center' | 'start' | 'end';
  content?: string;
  type?: 'focus-card' | 'basic';
  children: ReactNode;
};
