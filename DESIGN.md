# Design System — adrijshikhar.dev

Astro 6 + React 19 islands, Tailwind 4 (CSS-first), shadcn/ui. Dark only.

## 1. Atmosphere

An observatory instrument. A near-black ground with real computed astronomy behind
the content: 96 catalogued stars at true positions for the observer's coordinates,
plus the planets, Moon and Sun. The reading surface sits *in* the sky rather than on
top of it.

Restraint is the register. The chrome is small mono type, hairline rules and
rectangular panels. Nothing glows, nothing bounces, nothing is decorative.

## 2. Colour

**shadcn's default theme, `neutral` base, verbatim.** The full `:root` / `.dark`
oklch token pair from ui.shadcn.com, unmodified. `<html>` carries `.dark`.

`@theme inline` in `globals.css` maps those tokens to Tailwind utilities. There is
no `tailwind.config.mjs` — v4 is CSS-first.

**Rules:**

- Only shadcn tokens. No invented colours, no derived shades, no `color-mix()`.
- No fractional `opacity` for dimming — reach for a dimmer token. `opacity: 0` / `1`
  for show/hide is fine.
- A token **without** `-foreground` is a **SURFACE**. `--accent` and `--muted` are
  backgrounds, both `oklch(0.269 0 0)` in dark. Their ink counterparts are
  `--primary` and `--muted-foreground`. Using a surface token as ink is the single
  most expensive mistake made in this codebase: it painted the sky readout
  near-black on near-black, and a button hover near-white on near-white text.
- Tailwind's `/opacity` modifier does not compile against CSS-var colours
  (`bg-card/70` renders invisible). Use a solid token.

## 3. Typography

Three faces: **Space Grotesk** display (`--font-heading`), **Familjen Grotesk** prose
(`--font-sans`), **IBM Plex Mono** for all data (`--font-mono`) — dates, coordinates,
metrics, labels.

- Space Grotesk stays out of body copy; its straight-tailed single-storey `y` reads as
  noise at paragraph length.
- Familjen Grotesk ships `wght 400–700`. There are no weights below 400 — `font-light`
  silently renders at 400.
- Display tracking is `-0.03em` (`tracking-tightest`, defined in `@theme`).
- **Never size a measure in `ch`.** A `ch` is the width of the font's `0`, so it
  silently resizes when the body face changes. Use `rem`.
- **11px is the mono floor.**
- `CardTitle` ships `leading-none`, which collides the moment a title wraps. Pass
  `leading-snug`.

## 4. Components

Cards are **shadcn `Card`**. The files in `src/components/ui/` come from the shadcn
CLI — they are upstream, don't hand-edit them.

- `ExpCard`, `ProjectCard`, `BlogCard` compose `Card` / `CardHeader` / `CardTitle` /
  `CardDescription` / `CardContent`; tags are `Badge`.
- Hover: 2px lift, border to `--ring`, larger shadow, 200ms. Guarded with
  `motion-reduce:translate-none` — v4's `-translate-y-*` sets the `translate`
  property, so `transform-none` would not disable it.
- Preview cards (no body prose) stretch their link across the whole card with
  `after:absolute after:inset-0`, keeping exactly one link in the accessibility tree.
  Cards **with** prose do not — an overlay would swallow links in the body.
- Lists holding cards use `flex flex-col gap-5` or `grid gap-5 sm:grid-cols-2`, with
  each card in an `<li>`. **CSS columns split a shadcn `Card`** across the break,
  because `Card` is a flex container and `break-inside-avoid` does not hold on it.

## 5. Layout

Home is two columns: sticky rail (identity + scroll-spy, one entry per section) and a
scrolling `<main>`. Other routes are a single centred reading column.

The document scrollbar is hidden (`html { scrollbar-width: none }` plus the webkit
pseudo), scoped to `html` so inner scroll containers keep their bars.

## 6. The canvas contract

**Canvas alpha under text stays at or below 169/255.** Hard contract, enforced by
`verify:legibility`.

It is satisfied by the sky **yielding**, not by covering it. `applyKeepOut` in
`render.ts` uses `destination-out` to erase a fraction of the canvas's own ink. That
distinction is the mechanism: a translucent wash *adds* a layer and leaves canvas
alpha untouched, so text over it still fails; erasing genuinely lowers the sampled
alpha while leaving the graticule and stars readable behind the prose.

The keep-out covers the **reading column plus 72px**, feathered on all four sides —
not the viewport. Full width erased 45% of every mark on the canvas, including the
planet labels and hover readout out in the empty margins where there is no text to
protect.

`render.ts` must stay **DOM-blind** so `scripts/verify-sky.mjs` can import it under
Node. `KeepOut` is a plain `{x,y,w,h}` object, measured in `SkyField.tsx` and passed
as numbers.

**The chrome must not lie.** Every readout is a value from the frame just painted.
`STARS n` is a count of what is **drawn** — 59 in the ambient sky (constellation
members only), 96 with `[dark sky]` on. Anything that changes which stars are painted
must update that number in the same commit.

`05-chrome-inventory.png`, in the design companion dir (path in CLAUDE.md), is the design's own audit of all
fourteen readouts with a KEEP / MOVE / CUT verdict and a reason for each. Consult it
before adding or removing chrome.

**Pointer affordances are gated on the input device**, not the viewport: the
cursor-gravity wobble and hover-to-name are skipped when
`(hover: none), (pointer: coarse)` matches.

## 7. Banned

- **No glows.** No halos, no blooms, no earthshine, no ambient gradient. Bodies are
  discs and glyphs.
- **No unnameable marks.** Every dot is a catalogued object that can be hovered and
  named.
- **No decorative dots.** Only real semantic state earns one.
- **No duplicated section titles.** The number is the eyebrow; the word is the `h2`.
- **No opacity for state.** It broke the rail at 1.79:1 and the orbital-mechanics
  control at 1.55:1.
- **No accent on punctuation.**
- **No `ch` measures. No pure `#000000`. No emoji as UI. No custom cursors.**
- **No sub-11px mono.**
- **No multi-line regex to delete code.** It removed 188 lines of interaction wiring
  in one pass here — the rAF loop, every pointer listener and the whole game — while
  every gate stayed green, because no gate exercises those.

## 8. Verification

```bash
bun run build              # must stay green
bun run verify:sky         # 16 physical astronomy invariants, in CI
bun run verify:code        # code-block contrast, in CI
bun run verify:legibility  # the 169/255 ceiling, needs a browser, NOT in CI
```

**The gates do not cover behaviour.** They check the build, astronomy maths, contrast
and canvas alpha — not the rAF loop, not a pointer handler, not a click target. When
changing interaction, exercise it in a browser; a green gate run says nothing about it.

Two headless-browser traps, both hit in anger:

1. **Playwright reports `prefers-reduced-motion: reduce` by default.** Emulate
   `no-preference` or you exercise the static path.
2. **Never resize the viewport to full page height to capture a tall page.** It
   inflates every `min-h-screen` box — a 900px hero became 4464px — and looks like a
   broken layout that is not broken. Use CDP `captureBeyondViewport`.

Two measurement traps worth knowing:

3. **`innerWidth` includes the scrollbar; `documentElement.clientWidth` does not.**
   Using the wrong one makes fixed right-edge chrome look 10px off when it is correct.
4. **`scroll-behavior: smooth` means `scrollTo()` has not moved anything by the next
   synchronous read.** That reads as broken scrolling when nothing is broken.
