import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';

import type { ReactNode } from 'react';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dm-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Save links. Set a focus. See what matters | Stonethrow',
  description:
    'Turn your saved links into a game plan. Save Pebbles, set a Focus, and see what matters.',
};

const MarketingLayout = ({ children }: { children: ReactNode }) => (
  <div className={`${dmSans.variable} ${dmSerif.variable} scroll-smooth`}>
    {children}
  </div>
);

export default MarketingLayout;
