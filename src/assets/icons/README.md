# Downloaded icon packs (Flaticon)

Source: flaticon.com, downloaded 2026-08-02 through an authenticated account.
512px PNG. **Confirm the licence tier before shipping any of these publicly** —
the free tier requires author attribution in the footer; Premium does not.

| folder | pack | style | n |
|---|---|---|---|
| `space-lineal/` | space-84 | Lineal, single colour | 36 |
| `space-detailed/` | space-328 | Detailed Outline, single colour | 50 |
| `space-lineal-color/` | space-86 | Lineal Color (same set as space-84) | 36 |

## What these are NOT for

The sky canvas. Planets there draw at 4-13px and need live phase and live
apparent size, both computed per frame from real geometry. Tested at true size:
every pack turns to mush below ~40px, and a raster cannot recolour for light
mode or invert on a dark page. `src/lib/sky/render.ts` draws those as canvas
paths and stays the right answer.

`space-lineal-color/` additionally breaks the single-accent palette lock.

## What they ARE good for

Large fixed rasters — apple-touch, android/maskable, OG. Not the favicon.

**Correction, 2026-08-02.** This file previously named `observatory` and
`telescope` as the site-mark candidates. Both were rendered at real favicon
sizes and both fail: at 16px they are an indistinct smudge, for the same reason
the packs fail on the canvas. A favicon renders *smaller* than the canvas
planets do, so it is the harshest test here, not the easiest.

Of the pack, only the simple radial forms survive 16px — `orbit`, `eclipse`,
`planet`. `orbit` is the closest to the site's own language (concentric rings,
bodies on them, a disc at centre — the graticule).

**What actually shipped** is a hand-drawn SVG of that idea rather than the
raster: `public/favicon.svg`, two rings plus two orbiting bodies on the ground
colour, with the accent baked to `#61AFEF`. Vector means it is exact at 16px
and at 512, and the whole size set rasterises from the one source. The pack
icon informed the concept; no pack pixels are in the shipped mark.

## Attribution (required)

Confirmed free tier on 2026-08-02: the account page showed the `0/100` daily
download counter and still offered "Go Premium". Anything shipped from these
packs needs a credit line, e.g. "Icons by Freepik from Flaticon".

## Recolouring without SVG

These are monochrome black-on-transparent, so they vanish on a dark page as
plain `<img>`. Do not trace them to SVG for this - CSS masking gives full token
control from the PNG:

```css
.icon {
  background: var(--planet);
  -webkit-mask: url(space-detailed/saturn.png) center / contain no-repeat;
          mask: url(space-detailed/saturn.png) center / contain no-repeat;
}
```

`mask-image` needs an HTTP origin; it silently fails under `file://`.
`space-lineal-color/` cannot be masked - masking discards the colour.

## Planned use (owner's direction, 2026-08-02)

Light mode should use `space-lineal-color/`. The light theme is an engraved
chart, so full-colour illustrations against cream read as a deliberate contrast
rather than as a palette break - and colour icons need a light ground to work,
which dark mode cannot give them. Dark mode uses the monochrome packs via CSS
masking to `--planet`.

This is the one context where the single-accent lock is intentionally relaxed,
because the icons sit in their own register rather than competing with the
accent for signal.
