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

## v2 merge — ambient aurora
Ported a subtle 3-blob drifting aurora background from the sibling Glass/Aurora design (design-d-glass-aurora), adapted to the Swiss-Terminal foundation:
- Added `.aurora-stage` (fixed, `z-index:-1`, `pointer-events:none`) holding three large blurred circular blobs behind all content. The flat near-black `--bg` still reads; the blobs only add a faint ambient glow.
- Blobs are tinted entirely from THIS design's single `--accent` token via `color-mix` (no foreign aurora tokens imported), so default = orange glow and they recolor live with the existing theme switcher (teal/rausch/violet/hyperlink/signal).
- Opacities tuned far lower than the source (0.10 / 0.07 / 0.06 vs ~0.34) to stay minimal/flat — ambient, not a wash. No `mix-blend-mode` to avoid lifting bg luminance.
- `prefers-reduced-motion: reduce` halts blob drift (static), matching the source.
- `body.machine-mode .aurora-stage { display:none }` keeps the terminal/machine view pure, exactly like the source hid its aurora.
