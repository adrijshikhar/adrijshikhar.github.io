# Design Direction A — "Swiss Terminal"

Full-site redesign of an Astro 6 developer portfolio. Synthesized from parallel.ai + eloqwnt design languages, aligned with the site's existing human/machine duality.

## Brief

Transform the human view into a **flat Swiss-minimal, near-black foundation** that feels like an extension of the existing `machine` (terminal) view — engineered, precise, high-contrast — while staying warm and readable. The machine view already nails parallel.ai's terminal aesthetic; the human view should feel like its designed sibling.

### Visual language
- **Foundation:** near-black base `#0e0e0e`, layered warm-gray surfaces (`#161616`, `#1c1c1c`), text `#e6e6e6` headings / `#a8a8a8` body / `#6f6f6f` muted. Warm gray, NOT blue-gray (kill the navy/slate cast).
- **Accent:** single hot accent. Default **Parallel orange `#fb631b`**. Used sparingly — links, active nav indicator, hover, focus ring.
- **Typography:** Geist (already bundled `@fontsource-variable/geist`) for headings, tight tracking (`-0.02em`), tighter type scale. JetBrains Mono for meta/labels/dates/eyebrows. Body Inter/Geist.
- **Radius:** near-zero (`2px` max). Sharp corners.
- **Borders:** hairline `1px` `rgba(255,255,255,0.10)`. Borders do the work, not shadows.
- **Shadows:** none / barely-there. Flat.
- **Motion:** fast and mechanical — 120ms transitions, ease-out. Section reveals subtle. Nav indicator slides crisply.
- **Eyebrows:** mono uppercase section labels with a leading `//` or `┌` terminal motif (subtle, tasteful — not gimmicky).

### Layout
Keep the two-column structure (sticky left identity/nav, right scrolling content) — it works. Sharpen it: tighter spacing rhythm, hairline section dividers, mono index numbers on sections (`01 / about`), flatten the cards (HoverCard/ExpCard/ProjectCard/BlogCard) to bordered flat blocks instead of soft hover-glow.

## Theme switcher (required, all directions)
Add a **6-accent theme switcher** layered on the foundation:
- Palettes: Parallel orange `#fb631b` (default), Teal `#64ffda`, Rausch `#ff385c`, Violet `#5241d4`, Hyperlink blue `#0000ee`, Signal red `#d12222`.
- CSS-variable **semantic tokens**: `--bg --surface --surface-2 --text --heading --muted --border --accent --accent-contrast`. Expose as Tailwind semantic colors; refactor literal `slate-*`/`accent` usages to tokens.
- `[data-theme="..."]` blocks override `--accent`/`--accent-contrast` only (foundation constant).
- Small **dot switcher** beside the existing human/machine ViewToggle. Persist to `localStorage["theme"]`. Inline **no-FOUC head script** applies saved theme before paint.

## Hard constraints (do NOT break)
- **Machine view is UNTOUCHED**: `src/styles/machine.css`, `ViewToggle.tsx`, `?machine=true` deep-link, `window.__RAW_MARKDOWN__`, `rawMarkdown` assembly in `index.astro`, and human/machine parity all stay exactly as-is.
- All routes restyled consistently: `/` (index), `/experience`, `/archive`, `/resume`, `/blogs`, `/blogs/[slug]`.
- Keep all content/data files unchanged (`src/content/*.md`, `content.config.ts`).
- Preserve scroll-spy nav, custom cursor (`cursor:none` on lg), section IDs, and the spotlight (retune its color to the accent, or drop if it clashes with flat aesthetic — justify).
- Accessibility: every text/bg pair ≥ 4.5:1 (AA). Respect `prefers-reduced-motion`. Visible focus rings.
- `npm run build` must pass. No new heavyweight deps.

## Definition of done
A cohesive, award-worthy flat Swiss-terminal portfolio where human and machine views feel like one design system, the orange accent is surgical, and the theme switcher swaps accents live with no layout shift and no FOUC.
