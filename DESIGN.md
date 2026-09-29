# Design System — adrijshikhar.dev

Astro 6 + React 19 islands, Tailwind 4 (CSS-first), shadcn/ui. Dark only. The shipped design is the approved **Spectral** palette: near-black surfaces, white reading ink, observatory blue interactions, warm data accents, and subdued sky chrome. Design is an **observatory instrument**: a near-black ground with real computed astronomy behind the content.

## 1. Atmosphere

An observatory instrument. A near-black ground (`#0B0F14`) with real computed astronomy behind
the content: 96 catalogued stars at true positions for the observer's coordinates,
plus the planets, Moon and Sun. The reading surface sits *in* the sky rather than on
top of it.

Restraint is the register. The chrome is small mono type, hairline rules and
rectangular panels. Nothing glows, nothing bounces, nothing is decorative.

## 2. Colour (Final Approved Spectral Palette)

The approved Spectral palette ships in `.dark`: near-black surfaces, white reading
ink, blue interactions, warm data accents and subdued sky labels. Upstream `:root`
light tokens remain intact for compatibility. `<html>` carries `.dark`.

`@theme inline` in `globals.css` maps those tokens to Tailwind utilities. There is
no `tailwind.config.mjs` — v4 is CSS-first.

### Token Architecture

| Semantic Role | Token | Hex | Usage & Contract |
|---|---|---|---|
| **Ground** | `--background` | `#0B0F14` | Deepest near-black ground behind canvas and base layers |
| **Prose Ink** | `--foreground` | `#F0F6FC` | Primary reading ink, high contrast against ground |
| **Reading Shield** | `.reading-plane` | `#0B0F14` | Column plane shield enforcing the $\le 169/255$ canvas-alpha ceiling |
| **Elevated Surface** | `--card`, `--popover` | `#11161D` | Discrete card containers, floating toolbars, elevated chrome |
| **Surface Base** | `--muted`, `--accent` | `#161B22` | **SURFACES ONLY**. Never use as ink |
| **Structural Hairline** | `--border` | `#21262D` | Hairline panel rules, card boundaries at rest |
| **Hover Rule** | `--input` | `#30363D` | Interactive card and button border on pointer hover |
| **Focus Ring** | `--ring` | `#7FA8F5` | WAI-ARIA keyboard navigation focus ring |
| **Interactive Action** | `--primary` | `#7FA8F5` | Observatory blue for active links, buttons, reticle highlights |
| **Interactive Inverse** | `--primary-foreground` | `#0B0F14` | Deep contrast text over primary-filled buttons |
| **Secondary Ink** | `--muted-foreground` | `#8B949E` | Dates, section labels, telemetry keys, secondary copy |
| **Warm Accent** | `--secondary-foreground` | `#E3B341` | Live status indicator dot, coordinates, warm telemetry metrics |
| **Celestial Chrome** | `--sky-label` | `#484F58` | Graticule altitude/azimuth lines and star hover labels |

### Rules

- **Surface vs Ink Contract:** A token **without** `-foreground` is a **SURFACE**. `--accent` and `--muted` are
  backgrounds (`#161B22`). Their ink counterparts are `--primary` and `--muted-foreground`. Using a surface token
  as ink is the single most expensive mistake made in this codebase: it painted the sky readout near-black on
  near-black, and a button hover near-white on near-white text.
- No derived shades or `color-mix()`.
- No fractional `opacity` for dimming — reach for a dimmer token. `opacity: 0` / `1`
  for show/hide is fine.
- Tailwind's `/opacity` modifier does not compile against CSS-var colours
  (`bg-card/70` renders invisible). Use a solid token.

## 3. Typography & Units

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
- **11px (`0.6875rem`) is the mono floor.** Nothing smaller, anywhere.
- `CardTitle` ships `leading-none`, which collides the moment a title wraps. Pass
  `leading-snug`.
- Every heading and label uses a component class from `@layer components` in
  `globals.css`: `.display-hero`, `.display-page`, `.title-entry`, `.label-data`,
  `.meta-data`, `.link-back`, `.channel`.

### Strict REM Units Contract

- All layout dimensions, container widths, margins, paddings, blur filters, typography,
  and translate transforms must use **`rem`** exclusively (1rem = 16px baseline).
- **Arbitrary pixel sizing (`px`) is banned** across layout components, tracks, cards,
  and view wrappers.
- The only permitted uses of `px` are **hardware hairlines** (`1px`, `1.5px`, `1.75px`)
  for physical screen borders and divider lines where integer device pixels prevent raster blur.

## 4. Components & Layout

Cards are **shadcn `Card`**. The files in `src/components/ui/` come from the shadcn
CLI — they are upstream, don't hand-edit them.

- `ExpCard`, `ProjectCard`, `BlogCard` compose `Card` / `CardHeader` / `CardTitle` /
  `CardDescription` / `CardContent`; tags are `Badge`.
- Hover: 2px lift (`-translate-y-0.5`), neutral input border (`--input`), no shadow, 200ms.
  Keyboard focus uses the blue ring (`--ring`). Guarded with
  `motion-reduce:translate-none` — v4's `-translate-y-*` sets the `translate`
  property, so `transform-none` would not disable it.
- Preview cards (no body prose) stretch their link across the whole card with
  `after:absolute after:inset-0`, keeping exactly one link in the accessibility tree.
  Cards **with** prose do not — an overlay would swallow links in the body.
- The project archive uses two CSS columns above 640px and one below, with cards in
  indivisible `<li>` wrappers (`ProjectMasonry.astro`) to keep each card intact.

### Layout Geometry & Viewport Balancing

- **Home (`index.astro`):** Two columns — sticky `SideRail.astro` (identity + scroll-spy nav,
  one entry per section) on the left, scrolling `<main>` on the right.
- **Containing Block Isolation:** `<SideRail />` sits outside `.human-view` as a direct sibling,
  ensuring optical blur and breathing scale transforms on `.human-view` never create a new
  containing block that would displace the fixed-positioned navigation rail.
- **Balanced Final Frame:** Section 07 (Interests) and the footer are unified in a single
  viewport frame (`min-h-[calc(100dvh-6rem)] flex flex-col justify-between` with `mt-auto` on the footer).
  This eliminates awkward empty voids and keeps Section 07 and the footer balanced at the bottom of the page.
- **Scrollbar Suppression:** Document scrollbar is hidden (`html { scrollbar-width: none }` plus
  WebKit pseudo-elements), scoped to `html` so inner scroll containers keep native bars.

## 5. Viewfinder & Instrument Chrome

The sky is real computed astronomy, and that is the design's entire argument. Every value in
the chrome has to be a true statement about the render, not camera-flavoured decoration.

- **Viewfinder Framing Brackets (`.viewfinder i`):** Four corner brackets (`1.125rem` square) inset
  at `0.875rem` (14px) from the viewport edges. Measurement ticks on the viewfinder are suppressed in
  human view to maintain instrument clarity.
- **Top Telemetry Strip (`.sky-telemetry`):** Fixed at `top-[0.875rem]` (14px), horizontally centered.
  Displays `ALT +90…−35°` (the projection's real altitude span), a live star count (`STARS n`),
  live Julian Date (`JD`), and local sidereal time (`LST`). Below `sm` only `ALT` is shown.
- **Count What is Drawn:** `STARS n` is a count of what is drawn, not of the catalogue: 59 in ambient
  sky (constellation members only) and 96 with `[dark sky]` on. Anything changing star visibility must
  update this counter in the same commit.
- **Corner Readouts:**
  - Top-left: `SUN` altitude and twilight band, `MOON` illuminated fraction, `PLANETS` live count.
  - Bottom-left: Observer latitude/longitude, local sidereal time, and coordinates source (`DEFAULT` vs `GEO`).
  - Read directly off the painted canvas frame to guarantee zero drift.

## 6. Precision Optical Reticle Cursor

The cursor replaces the OS arrow on fine-pointer devices with a calibrated optical reticle,
scoped to `(hover: hover) and (pointer: fine)`:

- **Resting Sky Reticle:** An outer ring (`2.125rem` / 34px) with a center indicator dot (`0.3125rem` / 5px)
  in `--foreground` white.
- **Interactive Hover (`cur-ui`):** Squeezes ring to 65% scale over links, cards, and interactive controls,
  switching border and dot to `--primary` observatory blue.
- **Focal Hover Reticle (`cur-focal`):** Over the focal switcher track and labels, displays precision wire
  chevrons pointing in the adjustment axis with `--primary` active indicator.
- **Focal Drag Reticle (`cur-focal-dragging`):** Tightens during active dragging with a concentrated
  photonic bloom halo (`box-shadow: 0 0 12px rgba(127, 168, 245, 0.55)`).
- **Safety Fallback:** Cursor styling (`cursor-custom`) is only applied once the rAF loop confirms running;
  touchscreens (`(hover: none)`) and script failures safely preserve native interaction.

## 7. Optical Focal Switcher (Human ↔ Machine View Rack)

A continuous optical focal length instrument replaces the legacy binary toggle button:

- **Mounting & Responsive Layout:**
  - **Desktop:** Mounted on the right rail (`fixed lg:right-9 lg:top-1/2 -translate-y-1/2 z-[1100]`), oriented vertically.
  - **Mobile:** Fixed at bottom center (`fixed bottom-4 left-1/2 -translate-x-1/2 z-[1100]`), oriented horizontally.
- **Expandable Monogram Labels:**
  - Resting: Compact, unobtrusive monograms (`H` and `M`).
  - Hover / Focus: Smoothly expands leftward to `5.25rem` (84px), revealing the stacked labels
    `24MM HUMAN` and `48MM MACHINE` with high-contrast active state.
- **Rolling Knurled Cylinder Track:**
  - Textured scale markings with a moving highlight indicator line tracking focal progression $p \in [0.0, 1.0]$.
  - Knurled barrel translates smoothly via Anime.js transforms, scaling with dynamic root rem sizing.
- **Continuous Optical Bokeh Rack:**
  - Defocus rack: As focal length increases from 24mm to 48mm, `.human-view` racks up to `0.875rem` (14px)
    optical blur before dissolving, while `.machine-view` emerges from bokeh defocus down to crisp `0rem` focus.
  - Viewfinder zoom expansion: Corner brackets radially expand outward by up to `1.5rem` (`shift = p * 1.5rem`).
  - Sky field FOV zoom: Canvas gently scales (`1 + p * 0.08`) during focus transit.
  - Zero Blur Residue: When transit settles at $p=0.0$ or $p=1.0$, all inline blur filters and transforms
    are explicitly purged, guaranteeing zero performance penalty or residual blur.
- **Input Coordination & Parity:**
  - Track wheel scrub normalized to prevent document scroll hijacking.
  - Pointer events with `setPointerCapture` and drag-to-settle physics.
  - Keyboard accessible slider navigation (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Home`, `End`).
  - Deep-link `?machine=true` initializes instantaneously at $p=1.0$ with zero FOUC and zero human flash.
  - Machine view matches markdown content parity from `window.__RAW_MARKDOWN__`.

## 8. The Canvas & Legibility Contract

**Canvas alpha under text stays at or below 169/255.** Hard contract, enforced by
`verify:legibility`.

It is satisfied by the sky **yielding**, not by covering it. `applyKeepOut` in
`render.ts` uses `destination-out` to erase a fraction of the canvas's own ink. That
distinction is the mechanism: a translucent wash *adds* a layer and leaves canvas
alpha untouched, so text over it still fails; erasing genuinely lowers the sampled
alpha while leaving the graticule and stars readable behind the prose.

The keep-out covers the reading column (`.reading-plane`), feathered on all four sides —
not the viewport. Full width erased 45% of every mark on the canvas, including the
planet labels and hover readout out in the empty margins where there is no text to
protect.

The hero title and introduction also receive a measured keep-out at strength 0.55,
ending at the introduction without added padding.

`render.ts` must stay **DOM-blind** so `scripts/verify-sky.mjs` can import it under
Node. `KeepOut` is a plain `{x,y,w,h}` object, measured in `SkyField.tsx` and passed
as numbers.

## 9. Shipped Artefacts that Carry Copy

Three things state what this site is about, and they must stay synchronized:

- **The positioning line lives in `src/lib/site.ts`.** `BaseLayout` takes its default
  `description` from it (feeding `<meta>`, `og:` and `twitter:`), the hero paragraph
  renders it, and `public/site.webmanifest` repeats it.
- **`public/og-image.jpg` and `public/twitter-image.jpg` are design exports.** Frames
  14 and 15 of `spectral.fig` (authored in `build-spectral.js` in the design companion dir),
  exported to PNG and converted to progressive JPEG. Re-export when `site.ts` changes.
- **`public/assets/resume.pdf` is generated** by `bun run gen:resume` from
  `scripts/resume-print.html`. Mirrors the `hevo-senior` chunk of `experience.md`.

## 10. Banned

- **No ambient glows.** No halos, no blooms, no earthshine, no ambient gradients. Bodies are discs and glyphs.
- **No unnameable marks.** Every dot is a catalogued object that can be hovered and named.
- **No decorative dots.** Only real semantic state earns one.
- **No duplicated section titles.** The number is the eyebrow; the word is the `h2`.
- **No opacity for state.** It breaks contrast ratios.
- **No accent on punctuation.**
- **No `ch` measures. No pure `#000000`. No emoji as UI.**
- **No raw `px` values for layout sizing, containers, padding, margins, or blur filters.** Use `rem`.
- **No sub-11px mono.**
- **No surface tokens used as ink.** `--accent` and `--muted` are backgrounds.
- **No multi-line regex to delete code.**

## 11. Verification

```bash
bun run build              # must stay green
bun run verify:sky         # 16 physical astronomy invariants, in CI
bun run verify:code        # dual-theme code contrast (>= 4.5:1), in CI
bun run verify:legibility  # the 169/255 alpha ceiling, needs a browser, NOT in CI
```

**The gates do not cover behaviour.** They check the build, astronomy maths, contrast
and canvas alpha — not the rAF loop, not a pointer handler, not a click target. When
changing interaction, exercise it in a browser; a green gate run says nothing about it.

### Browser Testing Invariants

1. **Playwright reports `prefers-reduced-motion: reduce` by default.** Emulate
   `no-preference` or you exercise the static path.
2. **Never resize the viewport to full page height to capture a tall page.** It
   inflates every `min-h-screen` box — a 900px hero became 4464px — and looks like a
   broken layout that is not broken. Use CDP `captureBeyondViewport`.
3. **`innerWidth` includes the scrollbar; `documentElement.clientWidth` does not.**
   Using the wrong one makes fixed right-edge chrome look off when it is correct.
4. **`scroll-behavior: smooth` means `scrollTo()` has not moved anything by the next
   synchronous read.**
