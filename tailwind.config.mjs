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
        'heading-hi': 'var(--heading-hi)',
        rule: 'var(--rule)',
        'rule-hi': 'var(--rule-hi)',
        'card-fill': 'var(--card-fill)',
        'card-edge': 'var(--card-edge)',
        'card-edge-hi': 'var(--card-edge-hi)',
        /* Spectral ramp. One hue, one job — see globals.css. Reach for the
           semantic name (accent, heading) first; these are for the jobs that
           have no semantic token: syntax, tags, metrics. */
        'spectral-ob': 'var(--spectral-ob)',
        'spectral-a': 'var(--spectral-a)',
        'spectral-f': 'var(--spectral-f)',
        'spectral-g': 'var(--spectral-g)',
        'spectral-k': 'var(--spectral-k)',
        'spectral-m': 'var(--spectral-m)',
      },
      transitionDuration: {
        tap: '120ms',
        hover: '220ms',
        ui: '300ms',
        view: '500ms',
      },
      /* Point at the CSS tokens rather than repeating the stacks. These were
         hardcoded and drifted: font-mono still resolved to JetBrains Mono after
         the token moved to IBM Plex Mono, so the utility silently ignored it. */
      fontFamily: {
        sans: ['var(--font-sans)'],
        heading: ['var(--font-heading)'],
        mono: ['var(--font-mono)'],
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
