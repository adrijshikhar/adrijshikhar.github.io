# Observatory — design system

The site is a **scientific instrument you look through**, not a page with a
space background. Every rule below follows from that one sentence, and the
fastest way to settle an argument is to ask which reading it supports.

`CLAUDE.md` holds the mechanics (how theming works, which classes exist).
This file holds the **principles and the token contract** — what is allowed to
look like what. Roadmap and research live in `~/Projects/my-projects/projects/adrijshikhar.github.io/`.

---

## The principles

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

**3. Brightness is a contrast problem, not a lightness problem.**
A page reads as glare when its pixels all sit in one luminance band, not when
its lightest value is high. Light mode once had **88% of every rendered pixel
inside a single decile** — dimming the ground only slid that band down, it
never added range. The fix is range, and only a **large-area** element can
supply it: the ground gradient (warm bloom top-left, cool counter top-right,
vignette settling the edges) plus opaque cards floating above it. That took the
hero's peak band to 57% and gave card views a three-band spread.

The sky **cannot** do this work. It is line art over less than 1% of the frame,
so boosting the graticule and stars moves the histogram by fractions of a
percent while pushing straight through the legibility ceiling — measured: a
2.6x graticule boost moved the peak band 88.7 → 88.4 and broke text legibility
to 216 against the 169 bar. The engraved multipliers (`K = 1.35`, `dust = 1.2`
in `render.ts`) exist only so ink-on-paper reads at the same *strength* as
light-on-black. They are not a brightness control. Do not raise them.

**4. Legibility is measured, not eyeballed.**
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

**Light mode is one warm family — hue 66–78.** Ground, both surfaces, heading,
text and muted all sit there, alongside the bronze accent and the hairlines
(which were always warm). It drifted once: the foundation tokens were authored
at hue 250–255 while the hairlines and accent stayed at 60, so cool blue-grey
paper carried warm bronze marks and the page read as a palette at war with
itself. Cards at `97%` made it worse by adding a cold near-white on top. If a
light-mode neutral needs a hue, it is warm. Dark mode stays cool (250) — a
night sky should be.

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

## The Sun is the only ambient light

There is no decorative glow anywhere. The page's warmth comes from
`drawSunGlow`, anchored to the Sun's real computed position and faded by its
real altitude on the standard twilight bands — full with the Sun up, out
entirely at **−18°**, where astronomical night begins. Below that the page is
black because it should be. What this replaced was a fixed warm blob pinned to
the top-left corner (the last survivor of the old three-blob aurora): a light
source the sky could not account for.

The two modes state it with the mark each one already uses, exactly as stars
are discs on black and open rings on paper:

- **Dark emits** — a steady halo plus a tight core. No pulse. Sunlight does not
  breathe, and animating it turns the whole page into a slow throb.
- **Light engraves** — dashed rings spreading from the disc and fading, on
  anime.js's clock with `outCubic` so they decelerate as a real ripple does.

Ring geometry is **measured off the sprite, never guessed**. The sheet blits
into a `2r` box, so in painted-radius units the glyph is: disc to 0.53, dashed
rings at 0.58 / 0.77 / 0.96, outermost ink at 1.01, ink about ¾ of each step.
The ripple continues that spacing. Getting these in viewport units instead of
`vr` is what once left a dead band around the Sun.

**Do not add travelling rings to dark mode.** Tried twice, ugly twice: rings
over a continuous glow read as a bullseye, because the glow already fills the
space they cross, so each band lands as a hard edge inside it rather than a
wave over empty ground. That is the shape failing, not the timing — easing it
or moving it to anime.js changes nothing. Light mode gets away with it
precisely because it has no glow: there the rings cross bare paper.

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
