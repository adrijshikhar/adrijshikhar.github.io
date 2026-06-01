import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic Neo-Bauhaus tokens (CSS variables)
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        text: 'var(--text)',
        heading: 'var(--heading)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        'accent-fill': 'var(--accent-fill)',
        'accent-contrast': 'var(--accent-contrast)',
        'block-1': 'var(--block-1)',
        'block-2': 'var(--block-2)',
        'block-3': 'var(--block-3)',
        border: 'var(--border)',
        ring: 'var(--ring)',
      },
      fontFamily: {
        sans: ['Geist Variable', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
    },
  },
  plugins: [typography],
};
