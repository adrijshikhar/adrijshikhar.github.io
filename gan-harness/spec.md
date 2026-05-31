# Design Direction E — "Neo-Bauhaus Color-Block"

Full-site redesign of an Astro 6 developer portfolio. Bold geometric Bauhaus-inspired color-blocking: primary shapes, hard grids, oversized type, playful but disciplined.

## Brief

Reimagine the portfolio as a **Neo-Bauhaus composition**: a structured grid of bold color-blocked panels, primary-color accents (red/blue/yellow + black/white), geometric shapes (circles, quarter-arcs, bars), and confident oversized typography. Artful, energetic, design-forward — like a museum poster or a design studio's site. Distinct from the dark (A/B/D) and soft-pastel (C) directions.

### Visual language
- **Foundation:** warm off-white canvas `#f4f1ea` (paper) OR clean `#ffffff`, with ink-black `#111111` structure and type. High contrast.
- **Color-block panels:** major sections sit in bold solid color blocks — Bauhaus primaries: red `#e63946`/`#d1331f`, blue `#1d3fb5`/`#2b50e8`, yellow `#f4c20d`, plus black + white. Hard edges, NO rounded corners (or minimal). Blocks tile in an asymmetric structured grid.
- **Geometric motifs:** circles, half/quarter-circles, diagonal bars, dots — used as graphic accents and section markers (think Bauhaus poster geometry). Tasteful, not cluttered.
- **Typography:** oversized geometric grotesk headings (Geist, bundled), tight, confident. Strong scale jumps. Mono for small labels.
- **Borders:** thick black rules/frames around blocks (`2–4px solid #111`). The grid is visible and structural.
- **Motion:** snappy, geometric — blocks slide/wipe in, shapes rotate subtly on hover, hard cuts not soft fades. Respect reduced-motion.
- **Personality:** bold, playful, primary-color, artful, confident.

### Layout
Rework into a **structured color-block grid**: hero as a big composition (name in a black block, accent shapes around it), sections as color-blocked cards in an asymmetric but aligned grid. Keep all sections/content + in-page nav (can become a bold geometric index). Cards (HoverCard/ExpCard/ProjectCard/BlogCard) become framed color-block panels.

## Theme switcher (required)
6-accent switcher; accent recolors the PRIMARY block-color system lead:
- Palettes: Bauhaus red `#d1331f` (default), Parallel orange `#fb631b`, Blue `#1d3fb5`, Teal `#0c6f5c`, Violet `#5241d4`, Signal `#d12222`.
- CSS-variable semantic tokens: `--bg --surface --ink --block-1 --block-2 --block-3 --text --heading --muted --border --accent --accent-contrast`. Expose as semantic Tailwind colors; refactor literal `slate-*`/`accent` usages.
- `[data-theme]` overrides `--accent`/`--accent-contrast` (the lead primary); keep the supporting Bauhaus primaries as structural constants OR shift the palette tastefully — your call, but no layout shift.
- Dot switcher beside the human/machine ViewToggle. Persist `localStorage["theme"]`. Inline no-FOUC head script.
- Accents must hit AA (≥4.5:1) where used as text/links on the light canvas; on solid color blocks ensure text (black or white) meets AA against the block fill.

## Hard constraints (do NOT break)
- **Machine view UNTOUCHED**: `machine.css`, machine markup/logic, `ViewToggle` machine behavior, `?machine=true`, `window.__RAW_MARKDOWN__`, `rawMarkdown` assembly, human/machine parity — all unchanged. Machine view stays dark `#101010` (intentional). (Theme-dot UI may be added near the toggle.)
- Restyle ALL routes consistently: `/`, `/experience`, `/archive`, `/blogs`, `/blogs/[slug]`. (No `/resume` route — resume is a PDF download link.)
- Content/data files unchanged (`src/content/*.md`, `content.config.ts`).
- Preserve scroll-spy nav, section IDs, custom cursor, view toggle. Spotlight: retune to a geometric/accent treatment or drop (justify).
- Accessibility: every text/bg pair ≥ 4.5:1 AA (incl. text on color blocks). Respect `prefers-reduced-motion`. Visible focus rings. Content visible without JS (don't ship at opacity:0 with no fallback).
- `npm run build` must pass. Use `npm install --legacy-peer-deps`. No new heavyweight deps.

## Definition of done
A bold, artful Neo-Bauhaus portfolio — color-blocked grid, primary palette, geometric motifs, oversized type, thick black frames — with a live no-FOUC accent switcher and the dark machine view fully intact. Memorable and design-forward.
