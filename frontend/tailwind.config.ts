import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'navy-950': '#0B1729',
        'navy-800': '#20354F',
        'teal-700': '#0B6D77',
        'teal-50': '#E9F8F7',
        'bg-canvas': '#F6F8FB',
        'border-subtle': '#E2E8F0',
        'text-strong': '#14253A',
        'text-muted': '#526176',
        surface: '#FFFFFF',
        'surface-dim': '#ccdbf4',
        'surface-bright': '#f8f9ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d4e4fd',
        'on-surface': '#0c1c2e',
        'on-surface-variant': '#3f484a',
        primary: {
          DEFAULT: '#0B6D77',
          hover: '#09565E',
          active: '#07454B',
          container: '#0B6D77',
          'on-container': '#9EECF7',
        },
        secondary: {
          DEFAULT: '#4B607C',
          container: '#C9DEFF',
          'on-container': '#4E627E',
        },
        success: {
          DEFAULT: '#167347',
          bg: '#E9F7EE',
        },
        warning: {
          DEFAULT: '#A15C07',
          bg: '#FFF5E2',
        },
        danger: {
          DEFAULT: '#B42318',
          bg: '#FFF0EE',
        },
      },
      fontFamily: {
        headline: ['var(--font-plus-jakarta-sans)', 'Plus Jakarta Sans', 'sans-serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      spacing: {
        gutter: '1.5rem',
        'gutter-mobile': '1rem',
        margin: '2rem',
        'margin-mobile': '1rem',
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '0.75rem',
        'space-lg': '1rem',
        'space-xl': '1.5rem',
        'space-2xl': '2rem',
        'space-3xl': '2.5rem',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        level1: '0px 1px 3px rgba(11, 23, 41, 0.05), 0px 1px 2px rgba(11, 23, 41, 0.03)',
        level2: '0px 4px 12px -2px rgba(11, 23, 41, 0.08), 0px 2px 6px -1px rgba(11, 23, 41, 0.04)',
        level3: '0px 12px 28px -4px rgba(11, 23, 41, 0.14), 0px 4px 10px -2px rgba(11, 23, 41, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;

