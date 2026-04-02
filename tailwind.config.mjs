import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0a192f',
        'navy-light': '#112240',
        'navy-lighter': '#233554',
        slate: '#94a3b8',
        'slate-light': '#cbd5e1',
        'slate-lightest': '#e2e8f0',
        white: '#f1f5f9',
        accent: '#64ffda',
        border: 'oklch(var(--border))',
        ring: 'oklch(var(--ring))',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [typography],
};
