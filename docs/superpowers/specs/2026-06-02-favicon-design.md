# Favicon redesign — Terminal Atelier mark

**Date:** 2026-06-02
**Branch:** `favicon-update`
**Status:** Implemented

## Goal

Replace the legacy `favicon.ico` with a brand-aligned icon set that reads cleanly
at 16px and matches the site's **Terminal Atelier** design language.

## Decision

**Option 1 — single "A" on a solid accent tile.**

- Solid rounded tile (10px-radius feel → `rx=20` on a 100×100 viewBox), filled with
  the brand accent **Parallel orange `#fb631b`**.
- White capital **"A"** in the brand heading font **Geist** (weight 700), traced from
  the actual font to a self-contained vector path (no runtime font dependency).
- Glyph fit: cap-height ≈ 52/100, optically centered.

### Why this over the alternatives

A two-tone **A + S** mark (A = orange box/white letter, S = white box/orange letter)
was the runner-up. It is the more distinctive *idea*, but two cells shrink the letters
at favicon size and the white cell leans on a hairline that vanishes at 16px. A single
bold glyph wins the 16px tab test — maximum mass and contrast — so Option 1 was chosen.

Earlier explorations (thin stroke-built letters; hairline-framed tiles) were rejected:
hairline borders and thin strokes do not survive 16px, which is where a favicon lives.

## Tab title

The browser tab title is set to **`adrijshikhar.dev`**.

- Home (`/`): `adrijshikhar.dev`
- Inner pages: `<Section> | adrijshikhar.dev` (e.g. `Resume | adrijshikhar.dev`)

## Deliverables (in `public/`)

| File | Purpose |
|------|---------|
| `favicon.svg` | SVG-first favicon (rounded tile). Modern browsers. |
| `favicon.ico` | Legacy fallback, multi-res 16/32/48 (PNG-embedded, ~2.5KB). |
| `apple-touch-icon.png` | 180×180, full-bleed opaque square (iOS applies its own mask). |
| `icon-192.png`, `icon-512.png` | PWA / maskable (full-bleed square, A inside safe zone). |
| `favicon-square.svg` | Source for the full-bleed raster set. |
| `site.webmanifest` | Name, icons, `theme_color`/`background_color` `#0e0e0e`. |

## Integration

`src/layouts/BaseLayout.astro` `<head>`: replaced the single `.ico` link with the
SVG-first set + `.ico` fallback + apple-touch + manifest + light/dark `theme-color`
meta tags. Page titles updated across all pages.

## Verification

- `bun run build` passes; all assets copied to `dist/`.
- Rendered mark confirmed: orange tile, crisp white Geist A, centered.
- Built `dist/index.html` carries the correct title and icon/theme-color tags.
