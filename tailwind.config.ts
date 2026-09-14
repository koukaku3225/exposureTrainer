import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#fff8f0',
        ink: '#3a2a17',
        dim: '#b09378',
        dim2: '#d6b89e',
        coral: { DEFAULT: '#ff6f3c', dark: '#d84a1a' },
        amber: { DEFAULT: '#ffab3c', dark: '#d68414' },
        gold: '#ff9500',
        track: '#ffe0cc',
      },
      fontFamily: {
        rounded: ["'M PLUS Rounded 1c'", "'Hiragino Maru Gothic ProN'", 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
