import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      /* No `colors` key on purpose: Tailwind's stock palette applies untouched, so
         every class in the markup is a stock class (text-slate-300, bg-slate-800,
         text-blue-400 ...). globals.css holds the same stock values for the
         hand-written rules. */
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
