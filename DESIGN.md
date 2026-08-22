# Design System: Spectral — adrijshikhar.dev

> Every colour value below was measured in a browser, not estimated. Where a ratio
> is quoted it came from `verify:legibility`, `verify:code`, or a canvas probe on
> the running site. If you change a value, re-measure rather than reasoning about it.
>
> This file was rewritten when the Spectral system shipped. The previous version
> described a bronze accent, a light mode, and oklch authoring — all three are gone.
> It is preserved in git history if you need the reasoning behind the old world.

## 1. Visual Theme & Atmosphere

An instrument, not a page. The background is real computed astronomy — true J2000
positions for the visitor's own coordinates — and the argument of the whole design
is that **every mark on screen is a true statement about the render.** That single
idea decides more than any aesthetic preference: values in the chrome are read off
the frame the canvas just painted, so they cannot drift from it, and anything that
could not be named or verified has been removed rather than styled.

Dense but unhurried. Structure comes from rules and planes rather than fills and
shadows, so the page reads as machined rather than soft. Dark only, and not as a
preference: see §2.

Dials: **variance 6, motion 4, density 5.** Motion sits deliberately low. The
contract is that state is carried by colour, never by opacity and never by
movement, so the interface stays still and legible while the sky does the moving.

## 2. Colour Palette & Roles

### Why dark only

A spectral ramp is a blackbody **emission** curve. To clear AA on a light ground
every warm hue has to be darkened until it turns brown — G falls to `#7e6013`, K
to `#9a5518` — and all six then compress into **5.5 L\*** of one another, so the
ramp stops being a ramp. Light mode was deleted rather than retuned. Do not
reintroduce it without solving that.

### Substrate

Blue, and committed to it. Every substrate value was solved for a target L\* in one
blue family rather than picked, so the elevation steps are perceptible (ΔL\* ≥ 3 is
the floor; below that a raised plane does not read as raised) and the temperature
never fluctuates. Substrate saturation is ~58%: a dark UI whose neutrals sit near
greyscale reads as dull no matter how good the accents are.

| Name | Hex | L\* | Role |
|---|---|---|---|
| Ground | `#080B14` | 3.2 | The page. |
| Panel | `#101626` | 7.4 | Footers, telemetry strips. ΔL\* +4.2. |
| Pane | `#12182A` | 8.6 | Fenced code only. |
| Ink | `#C2CEE4` | — | Body copy. 12.40:1 on ground, 15% sat. |
| Heading | `#EDF2FC` | — | 17.51:1 on ground. |
| Muted | `#8795AF` | — | Labels, metadata. 6.50:1, 23% sat. |
| Rule | `#1F2B4A` | — | Minor hairline **on the ground** — 1.40:1. |
| Rule High | `#425C9E` | — | Major rule on the ground — 3.04:1. |

Text is tinted from the substrate hue, never grey. `--heading` was warm `#edebe6`
against a cool ground once; warm type on a cool ground neutralises both, and that
is what "dull" looks like numerically.

### The spectral ramp — one hue, one job

Six hues taken from stellar classification. They are **derived, not picked**: each
names a real surface temperature, so they track a blackbody curve and cannot clash.
Each owns exactly one job. Reusing a hue for a second job is the failure mode this
system exists to prevent.

Chroma is deliberate. The first version of this ramp was too washed to register —
measured on the rendered page, only 25.3% of visible text carried any chroma and
the warm hues appeared on exactly one element. Saturation was raised across the
board and every hue re-verified against ground, card **and** pane.

| Class | Hex | Sat | On ground | Job | Named for |
|---|---|---|---|---|---|
| O/B | `#5C9BFF` | 64% | 7.10:1 | links, active nav | Rigel, Spica |
| A | `#A8C8FF` | 34% | 11.58:1 | types, infra tags, planets | Sirius, Vega |
| F | `#EDF2FC` | 6% | 17.51:1 | headings, bright stars | Procyon |
| G | `#FFD166` | 60% | 13.63:1 | strings, Sun values, the Sun | the Sun, Capella |
| K | `#FF9F4A` | 71% | 9.65:1 | numbers, **dates**, language tags | Arcturus |
| M | `#FF6B5C` | 64% | 7.03:1 | **errors only** | Betelgeuse |

Dates take K because a date is a number, and that single assignment is what moved
the page from 25.3% to 41.3% chromatic. A ramp of six hues is worth nothing if
five of them never appear.

`--accent` is an alias for O/B. There is one accent. The other five are role
colours, not accents, which is why six hues does not mean six accents.

### Card plane

Ground tokens do **not** transfer to a raised plane. `--rule` measures 1.42:1 on
the ground but only **1.18:1** on a card, so a card using it loses its outline at
the moment it gains a fill. The card carries its own pair, every figure measured
against the card fill rather than the ground:

| Name | Hex | Measurement |
|---|---|---|
| Card fill | `#161F35` | L\* 12.0, ΔL\* **+8.8** above ground |
| Card fill high | `#1E2A48` | L\* 17.5, +5.5 above rest. Hover **lifts**. |
| Card edge | `#35476B` | 1.85:1 on the fill |
| Card edge high | `#4E6AAE` | 2.72:1 on the fill |

Cards carry a shadow with a real offset and a soft blur, tinted to the ground hue
(`0 1px 2px`, `0 12px 32px -8px`). A zero-offset coloured halo is decoration; an
offset plus blur is depth.

ΔL\* below ~3 is the threshold where a plane stops reading as a plane at all. An
earlier translucent fill measured 2.65 and looked like a smudge because
perceptually it was one.

Text on the card fill: heading 14.35:1, ink 9.94:1, muted 5.15:1. All AA.

## 3. Typography Rules

Three voices, no fourth.

| Role | Face | Notes |
|---|---|---|
| Display | Space Grotesk | Space Mono's proportional sibling, so display rhymes with the all-mono chrome. Tracking **-0.03em**; the -0.04em an ultra-black face wants collides here. |
| Prose | Familjen Grotesk | Ships `wght 400-700`. There are **no weights below 400** — `font-light` and `font-thin` silently render at 400. |
| Data | IBM Plex Mono | Every date, coordinate, metric, label. **11px is the floor.** Nothing smaller, anywhere. |

Space Grotesk stays **out of body copy**: its straight-tailed single-storey `y`
reads as noise at paragraph length.

**Never size a measure in `ch`.** A `ch` is the width of the font's `0`, so a
`ch`-based max-width silently resizes when the body face changes. Use `rem`.

Every heading and label uses a **component class** from the `@layer components`
block in `globals.css` — `.display-hero`, `.display-page`, `.display-section`,
`.title-entry`, `.label-data`, `.meta-data`, `.link-back`, `.channel`. Repeating
utilities inline is what let six different tracking values drift into one label.

## 4. Component Behaviours

**Cards.** Border at rest, border promotes on hover, fill lifts. Radius 2px, from
the repo's `--radius` scale, so cards, inputs and buttons share one shape system.
No shadows — a card is defined by its border and fill, not by floating. A card that
is transparent at rest and grows an unbordered fill on hover is a half-card, and
reads as one.

**Buttons.** Square, mono, uppercase, 11px, accent text on a `--rule-hi` outline.
No lift, no spring. `--ease-spring` is reserved for the **sky drag-release** and
nothing else: overshoot is only honest when the gesture carried momentum, and a
hover carries none.

**Tags.** Hue-coded by category using hues the ramp already owns — K for language,
A for infra, G for data. Unrecognised tags stay muted **on purpose**: a wrong
colour is a false statement about the tag, while grey is merely silent, and silence
is the right default when the classifier does not know.

**Links.** O/B, and always with a non-colour indicator. Colour alone fails WCAG
1.4.1. Prose links underline, including links nested in raw HTML inside MDX where
the `prose-a:*` utilities do not reach.

**The rail.** Wayfinding, not a dial: all six destinations visible, active marked
by colour. It previously rendered `--muted` at `opacity: 0.4` for **1.79:1** on the
only in-page navigation the site has, and its window hid 4 of 6 links while letting
focus land outside the visible run.

**Motion.** Four durations, one per interaction class: tap `0.12s`, hover `0.22s`,
ui `0.3s`, view `0.5s`. **One element gets one duration** across all its animated
properties; a second duration on the same element makes it resolve in two visible
stages.

## 5. Layout Principles

8px spacing scale. Section rhythm is a consistent 112px. Content column ~46rem,
centred, with the rail in the left gutter.

**Reveals must default to visible.** The home page once set `opacity: 0` on every
section in JS and relied on an IntersectionObserver to lift it, so print,
save-as-PDF, reader mode and any non-scrolling capture rendered a blank page. A CSS
rewrite using `animation: … both` on a `view()` timeline reproduced the same bug,
because `both` holds the `from` state outside the range. There is now no reveal at
all: a per-section fade was decoration, not hierarchy.

Full-height uses `min-h-[100dvh]`, never `h-screen`.

## 6. The Canvas Contract

**Canvas alpha under text stays at or below 169/255.** This is a hard contract and
`verify:legibility` enforces it.

It is satisfied by the sky **yielding**, not by covering it. `applyKeepOut` in
`render.ts` uses `destination-out` to erase a fraction of the canvas's own ink
inside the reading rectangle. That distinction is the whole mechanism: a
translucent wash *adds* a layer and leaves canvas alpha untouched, so text over it
still fails; erasing genuinely lowers the sampled alpha while leaving the graticule
and stars readable behind the prose. Edges feather over 96px, because a hard
rectangle of erased sky is an opaque plane again with extra steps, and that seam is
exactly what read as a floating card.

Measured with every opaque plane removed: `/experience` and `/archive` went from
**193/169 and 172/169 failing** to **25/169**, fully exposed. `/` sits at 117/169
and stays exposed on purpose — the hero is meant to be *in* the sky.

`render.ts` must stay **DOM-blind** so `scripts/verify-sky.mjs` can import it under
Node. `KeepOut` is a plain `{x,y,w,h}` object, measured in `SkyField.tsx` and passed
as numbers.

**The chrome must not lie.** Every readout is a value from the frame just painted.
When the Sun glow was removed, the `SUN` readout stopped claiming to drive it,
because that sentence had become false. When the 420 procedural faint stars were
removed, the footer stopped calling the field "representative". `STARS 96` is a
count, and now that nothing is drawn below the catalogue's mag 3.35 floor it is the
whole truth.

## 7. Anti-Patterns (banned)

- **No glows.** The Sun's halo, core and pulsing bloom, the Moon's earthshine disc,
  and the radial bloom on bright bodies are all removed. Bodies are discs and glyphs.
- **No unnameable marks.** 420 procedural stars were deleted because they could not
  be hovered, named or looked up. At 1px they read as dust on the display.
- **No decorative dots.** A coloured dot before a nav item, a section label or a
  list row is a tell. Only real semantic state earns one.
- **No duplicated section titles.** `01 ABOUT` above a 48px `ABOUT` printed the same
  word twice. The number is the eyebrow and the rail's anchor; the word is the h2.
- **No opacity for state.** It broke the rail at 1.79:1, the orbital-mechanics
  control at 1.55:1, and footer text at 3.4:1.
- **No accent on punctuation.** Bullet markers took O/B, spending the accent budget
  on list glyphs.
- **No `ch` measures. No pure `#000000`. No emoji as UI. No custom cursors.**
- **No sub-11px mono.** The rail shipped 8px and 10px labels.
- **Tailwind's `/opacity` modifier does not compile against CSS-var colours**
  (`bg-surface/70` renders invisible). Use `color-mix` or a solid token.

## 8. Verification

```bash
bun run build              # must stay green
bun run verify:sky         # 16 physical astronomy invariants, in CI
bun run verify:code        # dual-theme code contrast, in CI
bun run verify:legibility  # the 169/255 ceiling, needs a browser, NOT in CI
```

Two headless-browser traps, both hit in anger:

1. **Playwright reports `prefers-reduced-motion: reduce` by default.** Emulate
   `no-preference` or you exercise the static path.
2. **Never resize the viewport to full page height to capture a tall page.** It
   inflates every `min-h-screen` box — a 900px hero became 4464px — and the result
   looks like a broken layout that is not broken. Use CDP `captureBeyondViewport`.
