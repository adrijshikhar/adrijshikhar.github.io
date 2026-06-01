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
        // shadcn/ui primitive keys (src/components/ui/*) mapped onto the
        // Neo-Bauhaus tokens so their utilities resolve instead of no-op'ing.
        background: 'var(--surface)',
        foreground: 'var(--text)',
        card: 'var(--surface)',
        'card-foreground': 'var(--text)',
        popover: 'var(--surface)',
        'popover-foreground': 'var(--text)',
        primary: 'var(--accent)',
        'primary-foreground': 'var(--accent-contrast)',
        secondary: 'var(--bg)',
        'secondary-foreground': 'var(--ink)',
        'muted-foreground': 'var(--muted)',
        'accent-foreground': 'var(--accent-contrast)',
        input: 'var(--border)',
        destructive: '#d12222',
        'destructive-foreground': '#ffffff',
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
