import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* One Dark Vivid, literal. Thirteen values, no var() indirection and no
           derived shades — the same thirteen globals.css declares. If a colour is
           not on this list it does not belong in the UI. */
        bg: '#1E222A',
        surface: '#282C34',
        elevated: '#2C323C',
        border: '#3E4451',
        heading: '#E6E6E6',
        text: '#ABB2BF',
        muted: '#636D7E',
        accent: '#61AFEF',
        cyan: '#56B6C2',
        green: '#98C379',
        purple: '#C678DD',
        orange: '#E5C07B',
        red: '#E06C75',
        ring: '#61AFEF',
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
