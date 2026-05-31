# Generator State — Iteration 001 (Swiss Terminal)

## What Was Built
- Flat near-black warm-gray foundation (`--bg #0e0e0e`, `--surface #161616`, `--surface-2 #1c1c1c`), hairline borders `rgba(255,255,255,0.10)`, ~0 radius, no shadow.
- Semantic CSS-variable tokens in `globals.css`: `--bg --surface --surface-2 --text --heading --muted --border --accent --accent-contrast`, exposed as Tailwind semantic colors (`bg, surface, surface-2, text, heading, muted, accent, accent-contrast, border`).
- 6-accent theme switcher (`ThemeSwitcher.tsx`) — dot UI docked beside the human/machine toggle. `[data-theme="..."]` blocks override only `--accent`/`--accent-contrast`. Persists to `localStorage["theme"]`. No-FOUC inline `<script is:inline>` in `<head>` applies saved theme before paint.
- Geist headings (tight `-0.02em` tracking), JetBrains Mono eyebrows/indices, fast 120ms ease-out transitions.
- Terminal-Swiss motifs: `//` mono eyebrows with accent tick, mono section indices (`01 about`), hairline section dividers, accent-edge flat list cards (grows in on hover, no glow), `$ ls ./posts` empty state, terminal footer line.
- New `/resume` route (spec listed it; reuses content files, none modified).
- Spotlight retuned to live `--accent` at 0.06 alpha (subtle, stays flat); refreshes on theme change.
- Custom cursor recolored to accent on hover via CSS var.

## Files Changed
- `src/styles/globals.css` — token system, theme blocks, base layer, components layer
- `tailwind.config.mjs` — semantic colors, mono/heading fonts, ~0 radius, snap easing
- `src/layouts/BaseLayout.astro` — no-FOUC head script, token body classes, ThemeSwitcher island, accent cursor
- `src/components/ThemeSwitcher.tsx` — NEW, 6-dot accent switcher island
- `src/components/SideNav.astro` — mono nav with indices + accent indicator, token refactor
- `src/components/Section.astro` — mono index + hairline rule
- `src/components/HoverCard.tsx`, `ExpCard.tsx`, `ProjectCard.tsx`, `BlogCard.tsx` — flat bordered blocks, token refactor, dropped shadcn Card/glow
- `src/pages/index.astro` — human-view restyle, eyebrows, dividers, accent spotlight (rawMarkdown + `__RAW_MARKDOWN__` UNTOUCHED)
- `src/pages/experience.astro`, `archive.astro`, `blogs/index.astro`, `blogs/[...slug].astro` — full restyle
- `src/pages/resume.astro` — NEW
- `src/components/ViewToggle.tsx` — only the human-restore *visual chrome* (bg `#0e0e0e`, flat island colors); machine logic / deep-link / buildMachineHtml untouched
- `astro.config.mjs` — dev-only `vite.server.fs.allow` so worktree dev server can serve parent-repo deps (fixes island hydration in dev)

## Theme Switcher — how it works
1. `<head>` inline script reads `localStorage["theme"]` (validated against the 6 keys) and sets `document.documentElement.dataset.theme` before first paint → no FOUC.
2. `ThemeSwitcher` island reads current `data-theme` on mount, renders 6 swatch dots (radiogroup). Click sets `dataset.theme` + writes localStorage + updates active state. Only `--accent`/`--accent-contrast` change, so zero layout shift.
3. CSS `[data-theme="parallel|teal|rausch|violet|hyperlink|signal"]` blocks swap the two accent vars; everything accent-colored updates live.

## Machine view — untouched (verified)
- `machine.css`, `buildMachineHtml`, `startsInMachine`, `?machine=true` deep-link, `window.__RAW_MARKDOWN__`, and the `rawMarkdown` assembly in `index.astro` are unchanged.
- Verified via Playwright: `?machine=true` hydrates the terminal view (machine-pre present, 14.8KB content, human-view opacity 0, body.machine-mode). Screenshot matches the original parallel.ai terminal look.

## Accessibility / contrast (measured)
- heading `#e6e6e6`/bg = 15.47:1, text `#a8a8a8`/bg = 8.12:1, text/surface = 7.61:1.
- Bumped `--muted` from spec `#6f6f6f` (3.84:1) to `#828282` (5.02:1 bg / 4.71:1 surface) to clear AA.
- Accents on bg: parallel 6.35, teal 15.50, rausch 5.49, violet 5.95, hyperlink 6.32, signal 6.02 — all ≥4.5:1.
- Lightened violet/hyperlink/signal from the raw spec hex (pure `#0000ee` etc. fail badly on near-black) to AA-safe tints.
- `prefers-reduced-motion`: disables scroll-smooth, kills transitions/animations, and short-circuits the JS section-reveal so content is never stuck hidden. Visible accent focus rings via `:focus-visible`.

## Known Issues / Notes
- Dev only: React islands resolve `@astrojs/react/dist/client.js` to the PARENT repo node_modules; the worktree dev server's fs allow-list 403'd it. Added `vite.server.fs.allow` to fix. Production build bundles client + both islands correctly (not affected).
- Pre-existing harmless React hydration-mismatch warnings from `ViewToggle`/`Toggle` (`?machine=true` initial state + a `class` vs `className` attr in the shadcn Toggle). In constrained code; React patches up, no functional impact.

## Dev Server
- URL: http://localhost:4321
- Command: npm run dev
- Status: stopped after verification (restart with `npm run dev` in the worktree)
