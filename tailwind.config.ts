import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        focusPulse: {
          // '0%': { boxShadow: '0 0 0 0 rgba(72,173,156,0.35)' },
          // '70%': { boxShadow: '0 0 0 16px rgba(72,173,156,0.12)' },
          // '100%': { boxShadow: '0 0 0 24px rgba(72,173,156,0)' },
          '0%': { transform: 'scale(1)', backgroundColor: 'red' },
          '50%': { transform: 'scale(1.2)', backgroundColor: 'lime' },
          '100%': { transform: 'scale(1)', backgroundColor: 'blue' },
        },
        halo: {
          '0%': {
            transform: 'scale(1)',
            opacity: '0.35',
          },
          '100%': {
            transform: 'scale(1.12)',
            opacity: '0',
          },
        },
      },
      animation: {
        halo: 'halo 1200ms ease-out infinite',
        focusPulse: 'focusPulse 1.4s ease-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
