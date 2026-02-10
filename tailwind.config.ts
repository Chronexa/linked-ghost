import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#C1502E',
          light: '#E07A5F',
          dark: '#A13D22',
          text: '#B3401A',
        },
        success: {
          DEFAULT: '#52B788',
          dark: '#6B8E23',
        },
        warning: '#F97316',
        error: '#DC2626',
        background: '#FFFCF2',
        surface: '#FFFFFF',
        charcoal: {
          DEFAULT: '#1A1A1D',
          light: '#52525B',
        },
        border: {
          DEFAULT: '#E8E2D8',
          subtle: '#F5F0E8',
        },
      },
      boxShadow: {
        'warm': '0 2px 8px rgba(193, 80, 46, 0.08)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
export default config;
