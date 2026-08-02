# Observatory — design system

The site is a **scientific instrument you look through**, not a page with a
space background. Every rule below follows from that one sentence, and the
fastest way to settle an argument is to ask which reading it supports.

`CLAUDE.md` holds the mechanics (how theming works, which classes exist).
This file holds the **principles and the token contract** — what is allowed to
look like what. Roadmap and research live in `~/Projects/my-projects/projects/adrijshikhar.github.io/`.

---

## The three principles

**1. The instrument must not lie.**
Every value on screen is a true statement about the render. The sky is real
astronomy — J2000 catalogue positions, Standish orbital elements, live phase,
true apparent size — and that credibility is the whole argument. So: no
invented camera values, no readout that claims `geo` after a manual drag, no
`MAG n` label when a procedural field is drawn below the catalogue floor. If a
number cannot be computed, it does not get displayed. A count is always
available and always true; prefer it to a fabricated measurement.

**2. There are two registers, and they never blend.**
- **Content** — prose, cards, headings. Rounded, opaque, shadowed. Meant to be
  read and trusted.
- **Chrome** — the instrument. Square, hairline, unshadowed, micro-mono. Meant
  to be glanced at and believed.

A control that floats over the sky belongs to the chrome. Giving it a card's
radius and shadow makes it read as a widget stuck on top of the instrument
rather than a part of it.

**3. Legibility is measured, not eyeballed.**
Canvas alpha is sampled under every text rectangle and held under **169/255**.
Any change to the sky, the graticule, or the chrome requires re-measuring.
`bun run verify:sky` holds 14 physical invariants, in CI, because eyes cannot
catch a wrong orbital element or a bad distance.

---

## Token contract

**Never hand-roll a value that a token already covers.** Three different
alphas for the same hairline is how the floating controls drifted apart.

| Need | Use | Never |
|---|---|---|
| Hairline edge | `var(--rule)` | `rgb(var(--border)/0.14)`, any ad-hoc alpha |
| Brighter edge (hover, active) | `var(--rule-hi)` | a second hand-picked alpha |
| Card fill | `var(--card-core)` — **opaque** | a translucent wash |
| Chrome fill over sky | `color-mix(… var(--surface) 88%, transparent)` | a second percentage |
| Accent | `var(--accent)` | any literal bronze |
| Ground | `var(--bg)` | `#0e0e0e` and other stale neutrals |

Colour is authored in **oklch**. Tailwind's `/opacity` modifier does not
compile against CSS-var colours — `bg-foo/70` renders invisible. Use solid
token colours.

### Radius

| Surface | Radius |
|---|---|
| Content card | `var(--card-radius)` (12px) |
| Instrument chrome | **0** — square, like `.expo-cell` |
| Pill button (`.atelier-btn`) | full — content CTAs only |

Square corners are not an aesthetic preference. A machined readout has square
corners; a rounded glass pill is a different product.

### Type

Three voices, no fourth. See `CLAUDE.md` for the mechanics.

| Role | Face | Size |
|---|---|---|
| Display | Space Grotesk | `.display-hero` / `.display-page` |
| Prose | Familjen Grotesk | 1rem / 1.15rem |
| **All chrome and data** | IBM Plex Mono | **0.5625–0.6875rem**, uppercase, 0.16–0.22em |

Anything in the chrome that renders at 14px has left the register. The
instrument scale tops out at 11px.

### Elevation

Content cards get `var(--card-shadow)`. **Chrome gets none.** The viewfinder,
the expo cluster, the corner readouts and the rail carry no shadow, because a
drop shadow implies the element floats above the glass rather than being
etched into it.

---

## Motion

- `transform` and `opacity` only. Never width, height, top or left.
- Micro-interactions 150–300ms, easing `var(--ease-out)`.
- No `transition: all` — list the properties.
- Every animation carries meaning. The rail steps because a focal-length
  readout steps; the cursor ring lags because lag reads as mass.
- `prefers-reduced-motion` is honoured everywhere, and the fallback must still
  be *useful* — the rail degrades to a plain highlighted list, not a frozen
  one. A frozen indicator carries no information, which is worse than none.

---

## Hard contracts — do not break

- `?machine=true`, `window.__RAW_MARKDOWN__`, and human/machine content parity.
- The 169/255 legibility ceiling.
- `render.ts` stays DOM-blind so `verify-sky.mjs` can import it under Node.
- Sizes in `rem`, never `ch` — a `ch` is the width of the font's `0`, so a
  ch-based measure silently resizes when the body face changes.
- Absolute URLs for `og:image`. Every platform drops a relative one.

---

## What this is not

No purple gradients, no three-column feature grid, no icons in coloured
circles, no decorative blobs, no emoji as UI. The palette is one accent
(bronze) against cool neutrals; a second accent would need a reason stronger
than variety.

The one sanctioned exception: planet glyphs use the lineal-colour icon set in
light mode, because colour needs a light ground to read. They sit in their own
register and do not license colour elsewhere.
