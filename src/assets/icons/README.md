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

Favicon, apple-touch-icon and OG images, where the render size is 180-1024px
and a fixed raster is fine. `observatory` and `telescope` are the strongest
candidates for a site mark. Feed one to the `web-asset-generator` skill to
produce the full size set.

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
