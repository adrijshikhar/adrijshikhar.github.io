import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic Swiss Terminal tokens (mapped to CSS vars)
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        text: 'var(--text)',
        heading: 'var(--heading)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        'accent-contrast': 'var(--accent-contrast)',
        border: 'var(--border-color)',
        ring: 'var(--accent)',
      },
      fontFamily: {
        sans: ['Geist Variable', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Geist Variable', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        none: '0',
        sm: '1px',
        DEFAULT: '2px',
        md: '2px',
        lg: '2px',
      },
      transitionTimingFunction: {
        snap: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      letterSpacing: {
        tightest: '-0.03em',
        tighter: '-0.02em',
      },
    },
  },
  plugins: [typography],
};
