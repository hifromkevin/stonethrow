import type { Metadata } from 'next';
import { Afacad, DM_Serif_Display, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';

import Providers from './providers';

// @ts-ignore: side-effect import of CSS globals
import './globals.css';

const afacad = Afacad({
  subsets: ['latin'],
  variable: '--font-afacad',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dm-serif',
  display: 'swap',
});

const fonts = `${afacad.variable} ${inter.variable} ${dmSerif.variable}`;

export const metadata: Metadata = {
  title: 'Save links. Set a focus. See what matters | Stonethrow',
  description:
    'Turn your saved links into a game plan. Save Pebbles, set a Focus, and see what matters.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={fonts} lang="en">
      <body className={`antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
