# Observatory Sky Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the site's "Terminal Atelier" theme with an observatory theme whose background is the real night sky above each visitor, and ship the orbital-mechanics easter egg.

**Architecture:** The 1418-line single-file prototype at `scratchpad/stars.html` is split into pure, testable modules (`src/lib/sky/*`) plus one React island (`SkyField.tsx`) mounted from `BaseLayout.astro`. Astronomy is pure functions with no DOM, verified by an assertion script against known physical invariants. The island reads a `mode` prop: `full` on the home page (graticule, planets, Moon, labels, constellations, easter egg) and `quiet` everywhere else (faint field only, no interaction). Theme tokens move from hex to an oklch lightness ramp; the dead multi-theme and aurora systems are deleted.

**Tech Stack:** Astro 6, React 19 islands, Tailwind 3 with CSS-variable tokens, anime.js v4 (replacing GSAP), Canvas 2D, Bun.

## Global Constraints

- **Package manager is Bun only.** `bun install` / `bun run …` / `bun x …`. `bun.lock` is the lockfile. Never create `package-lock.json`.
- **Node 22 via fnm**, pinned by `.node-version`. Run `fnm use` first.
- **PRs target the `content` branch**, never `main`/`master`. Pushing to `content` auto-deploys to GitHub Pages.
- **There is no test or lint script.** `bun run build` is the only existing gate. Pure modules get a new assertion script; visual behaviour gets Playwright checks. Both are specified per task.
- **Never break these contracts** (from `CLAUDE.md`): `?machine=true` deep-link, `window.__RAW_MARKDOWN__`, and human/machine content parity.
- **Never break the no-FOUC head script** in `BaseLayout.astro`. It must stay first in `<head>`, before any stylesheet link.
- **Tailwind's `/opacity` modifier does not work against CSS-var colours** (`bg-foo/70` renders invisible). Use solid token colours or `color-mix`.
- **Accent budget is four uses site-wide:** prose links, focus ring, live-status dot, active nav. Everything else is greyscale. The sky canvas is exempt — it is not chrome.
- **Accent value is `oklch(72% .085 64)`** (bronze) in dark, `oklch(52% .105 58)` in light. Do not introduce a second accent.
- **`prefers-reduced-motion: reduce` must disable all sky animation** and render content at final state.
- Resume content stays as loose markdown read with `fs` + `gray-matter`. Do **not** migrate it into a content collection.

---

## File Structure

**Create:**
- `src/lib/sky/catalogue.ts` — star/planet/constellation/distance data. Pure data, no logic.
- `src/lib/sky/astronomy.ts` — Julian day, GMST, alt/az, planet and Moon ephemerides. Pure functions, no DOM.
- `src/lib/sky/projection.ts` — alt/az → screen, screen → nearest body, separation maths.
- `src/lib/sky/render.ts` — all canvas drawing (field, graticule, bodies, labels, flares).
- `src/lib/sky/physics.ts` — cursor-gravity spring and free-body collision solver.
- `src/lib/sky/game.ts` — tool state, aim, slingshot, bursts, travel.
- `src/components/SkyField.tsx` — the island. Owns the canvas, the rAF loop and input.
- `src/lib/motion.ts` — anime.js easings/durations, replacing `src/lib/gsap.ts`.
- `scripts/verify-sky.mjs` — assertion script for the pure astronomy modules.

**Modify:**
- `src/styles/globals.css` — tokens, deletions, card bezel, light chart.
- `src/layouts/BaseLayout.astro` — remove aurora markup, mount `SkyField`.
- `src/components/HoverCard.tsx` — double-bezel card.
- `src/components/ViewToggle.tsx` — GSAP → anime.js (6 call sites).
- `package.json` — add `animejs`, `@fontsource/ibm-plex-mono`; remove `gsap`.

**Delete:**
- `src/lib/gsap.ts`

---

## Task 1: Theme tokens and local fonts

Partially applied already on branch `sky-revamp` (uncommitted). Finish and commit.

**Files:**
- Modify: `src/styles/globals.css:1-8` (imports), `:16-77` (`:root`), `:123-160` (`[data-mode="light"]`)
- Modify: `package.json`

**Interfaces:**
- Produces: CSS custom properties consumed by every later task — `--bg --surface --surface-2 --heading --text --muted --rule --rule-hi --accent --card-shell --card-core --card-radius --card-inset --card-core-radius --card-shadow --card-shadow-lg --card-edge --ease-out --font-sans --font-mono`

- [ ] **Step 1: Confirm the font package is installed**

```bash
grep -E "ibm-plex-mono" package.json
```
Expected: `"@fontsource/ibm-plex-mono": "^5.3.0"`. If absent: `bun add @fontsource/ibm-plex-mono`

- [ ] **Step 2: Verify the Google Fonts import is gone**

```bash
grep -c "fonts.googleapis.com" src/styles/globals.css
```
Expected: `0`. It was render-blocking, and the Inter it loaded never painted because `'Geist Variable'` precedes it in every font stack.

- [ ] **Step 3: Verify the token block is oklch**

```bash
grep -E "^\s+--(bg|muted|accent):" src/styles/globals.css
```
Expected exactly:
```
  --bg:        oklch(14.5%  .004 62);
  --muted:     oklch(72.5%  .010 68);
  --accent: oklch(72% .085 64);
```

- [ ] **Step 4: Add the light-mode accent, which the light block currently omits**

In `src/styles/globals.css`, inside `:root[data-mode="light"] { … }`, after `--card-edge`, add:

```css
  --accent: oklch(52% .105 58);        /* bronze, darkened for AA on paper */
  --accent-contrast: oklch(97.8% .004 56);
```

- [ ] **Step 5: Build**

```bash
bun run build
```
Expected: `Complete!`, 7 pages built, no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json bun.lock src/styles/globals.css
git commit -m "feat(theme): oklch token ramp, local IBM Plex Mono

Ground moves from near-black (#0e0e0e, ~9% L) to oklch 14.5% so it reads as a
surface rather than a hole, and surfaces lift in two steps. Muted text goes
#909090 (~52% L) to oklch 72.5% — dim grey on near-black was the main source
of eye strain. Accent drops chroma .19 to .085.

Drops the render-blocking Google Fonts @import; it also loaded Inter, which
never painted because Geist Variable always won the stack."
```

---

## Task 2: Delete the dead theme and aurora systems

Five of six accent themes are unreachable: nothing ever writes `localStorage.theme`, so only `parallel` renders. The aurora is a decorative layer plus a radial veil that paints the background back over it — two systems cancelling out.

**Files:**
- Modify: `src/styles/globals.css` (theme blocks, aurora block, orphan classes)
- Modify: `src/layouts/BaseLayout.astro:28-37` (no-FOUC theme read), `:88-93` (aurora markup)

**Interfaces:**
- Consumes: tokens from Task 1
- Produces: no new interfaces. Removes `--aurora-*`, `--card-tint`, `--card-tint-2`, `.aurora-stage`, `.aurora-blob`, `.aurora-text`, `.flat-block`, `.eyebrow`

- [ ] **Step 1: Confirm the themes are genuinely unreachable before deleting**

```bash
grep -rn "localStorage.setItem('theme'" src/ | wc -l
```
Expected: `0` — nothing writes it, so `BaseLayout.astro:32` always falls through to `'parallel'`. This is the evidence that deletion is safe.

- [ ] **Step 2: Delete the five unreachable accent themes**

In `src/styles/globals.css`, delete every rule whose selector contains `[data-theme="teal"]`, `[data-theme="rausch"]`, `[data-theme="violet"]`, `[data-theme="hyperlink"]`, or `[data-theme="signal"]` — in both the dark and `[data-mode="light"]` sections. Keep `parallel`'s values, but inline them into `:root` and `:root[data-mode="light"]` rather than leaving a one-theme selector.

- [ ] **Step 3: Delete the aurora token and rule blocks**

Delete `--aurora-1/2/3`, `--aurora-blend`, `--aurora-blur`, `--aurora-op-1/2/3`, and the `.aurora-stage`, `.aurora-blob`, `.aurora-blob--1/2/3`, `@keyframes aurora-drift1/2/3`, `.aurora-text` rules including the `[data-mode="light"] .aurora-text` override.

- [ ] **Step 4: Delete the orphan classes**

`.flat-block` and `.eyebrow` have zero usages. Verify then delete:

```bash
grep -rn "flat-block\|eyebrow" src/ --include="*.astro" --include="*.tsx" | wc -l
```
Expected: `0` (matches only in `globals.css` itself).

- [ ] **Step 5: Remove the aurora markup from the layout**

In `src/layouts/BaseLayout.astro`, delete the comment and the five lines at 88-93:

```html
    <div class="aurora-stage" aria-hidden="true">
      <div class="aurora-blob aurora-blob--1"></div>
      <div class="aurora-blob aurora-blob--2"></div>
      <div class="aurora-blob aurora-blob--3"></div>
    </div>
```

- [ ] **Step 6: Simplify the no-FOUC theme read**

In `src/layouts/BaseLayout.astro`, replace the theme portion of the inline script (the `valid` array, the `localStorage.getItem('theme')` read and both `dataset.theme` assignments) with nothing — there is only one theme now. **Leave the `mode` and `machine` portions of the script exactly as they are.** They are load-bearing and must remain first in `<head>`.

- [ ] **Step 7: Fix the gradient-text name**

`SideNav.astro:16` uses `class="aurora-text"`, now deleted. Replace with `class="no-underline"`. Gradient text on a name is a common AI-design tell and it needed a light-mode special case to stay legible.

- [ ] **Step 8: Verify no dangling references**

```bash
grep -rn "aurora\|card-tint\|data-theme" src/ | grep -v node_modules
```
Expected: no output.

- [ ] **Step 9: Build and check the CSS shrank**

```bash
bun run build && wc -l < src/styles/globals.css
```
Expected: build `Complete!`; line count around 380, down from 535.

- [ ] **Step 10: Commit**

```bash
git add src/styles/globals.css src/layouts/BaseLayout.astro src/components/SideNav.astro
git commit -m "refactor(theme): delete unreachable themes and the aurora system

Five of six accent themes were dead code — nothing ever wrote localStorage.theme,
so only 'parallel' could render. ~40 lines of hand-tuned AA CSS maintained for
zero rendered pixels.

The aurora was a decorative layer plus a radial veil painting --bg back over its
own centre to restore legibility: two systems cancelling out. Also removes
.flat-block and .eyebrow (zero usages) and the gradient-text name."
```

---

## Task 3: Double-bezel cards

Cards currently carry four depth signals at once — accent tint, 30px shadow, inset edge and a hairline border. Replace with a nested shell/core at concentric radii.

**Files:**
- Modify: `src/styles/globals.css` (`.atelier-card`)
- Modify: `src/components/HoverCard.tsx`

**Interfaces:**
- Consumes: `--card-shell --card-core --card-radius --card-inset --card-core-radius --card-shadow --card-shadow-lg --card-edge --rule --rule-hi --ease-out`
- Produces: `.atelier-card` renders shell + `::before` core. Consumers (`index.astro`, `blogs/index.astro`, `HoverCard.tsx`) need no markup change.

- [ ] **Step 1: Replace the `.atelier-card` rule**

In `src/styles/globals.css`, replace the entire existing `.atelier-card` block (and its `:hover` and `.is-alt` variants) with:

```css
  /* Double bezel: an outer shell holding an inner core at concentric radii.
     The core is a pseudo-element, so no consumer markup changes. */
  .atelier-card {
    position: relative;
    isolation: isolate;
    border-radius: var(--card-radius);
    background: var(--card-shell);
    box-shadow: 0 0 0 1px var(--rule);
    transition: transform .5s var(--ease-out),
                background-color .35s var(--ease-out),
                box-shadow .35s var(--ease-out);
  }
  .atelier-card::before {
    content: "";
    position: absolute;
    inset: var(--card-inset);
    z-index: -1;
    border-radius: var(--card-core-radius);
    background: var(--card-core);
    box-shadow: var(--card-edge), var(--card-shadow);
    transition: background-color .35s var(--ease-out), box-shadow .35s var(--ease-out);
  }
  .atelier-card:hover {
    transform: translateY(-2px);
    background: color-mix(in oklab, var(--surface-2) 92%, transparent);
    box-shadow: 0 0 0 1px var(--rule-hi);
  }
  .atelier-card:hover::before {
    background: var(--surface-2);
    box-shadow: inset 0 1px 0 oklch(100% 0 0 / .085), var(--card-shadow-lg);
  }
  @media (prefers-reduced-motion: reduce) {
    .atelier-card:hover { transform: none; }
  }
```

- [ ] **Step 2: Give the card interior padding**

The core insets by 6px, so content needs to clear it. In `src/components/HoverCard.tsx`, ensure the wrapper carries `px-6 py-5` (or confirm consumers already pass equivalent padding classes). Read the file first — do not assume its current shape.

- [ ] **Step 3: Build**

```bash
bun run build
```
Expected: `Complete!`

- [ ] **Step 4: Verify visually in both modes**

```bash
bun run preview &
sleep 3
```
Open `http://localhost:4321/` and `http://localhost:4321/?mode=light`. Confirm: cards show a visible outer ring and a distinct inner surface; the inner core is lighter than the page in dark mode and white in light mode; hover lifts 2px and brightens.

- [ ] **Step 5: Commit**

```bash
git add src/styles/globals.css src/components/HoverCard.tsx
git commit -m "feat(theme): double-bezel cards

Outer shell holding an inner core at concentric radii (18px outer, 12px inner
at a 6px inset), with warm-tinted shadows. Replaces four simultaneous depth
signals — accent tint, 30px shadow, inset edge and hairline border — with a
single nested structure. The core is a pseudo-element so no consumer markup
changes."
```

---

## Task 4: GSAP → anime.js

`ViewToggle.js` ships **97 KB gzip** — 62% of the site's total JS. `src/lib/gsap.ts` registers 15 plugins (ScrollTrigger, Draggable, Flip, MotionPath, ScrambleText, SplitText, CustomBounce, CustomWiggle, MotionPath, EasePack…) and ships every one. Actual usage: `gsap.timeline()` and `gsap.set()`, for one opacity crossfade. Zero plugins are used.

**Files:**
- Create: `src/lib/motion.ts`
- Modify: `src/components/ViewToggle.tsx:2` (import), `:120-132`, `:173`, `:187`
- Delete: `src/lib/gsap.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `src/lib/motion.ts` exports `animate`, `createTimeline`, `onScroll`, `stagger`, `utils`, `createSpring`, and constants `D = { fast: 180, entry: 380 }`, `SPRING`, `prefersReducedMotion: boolean`

- [ ] **Step 1: Record the current bundle size as the baseline**

```bash
bun run build
ls dist/_astro/ViewToggle*.js | while read f; do echo "$(gzip -c "$f" | wc -c) bytes gzip"; done
```
Expected: roughly 97000. Write the number down — Step 8 compares against it.

- [ ] **Step 2: Swap the dependency**

```bash
bun remove gsap && bun add animejs
```

- [ ] **Step 3: Create the motion module**

Create `src/lib/motion.ts`:

```ts
import { animate, createTimeline, onScroll, stagger, utils, createSpring } from 'animejs';

/** Single source of truth for motion. If a duration is not in D, it does not ship.
 *  Interaction stays under 200ms (Emil Kowalski: UI animation should stay under
 *  300ms; interaction under 200 feels instant). Entry may go to 400. */
export const D = { fast: 180, entry: 380 } as const;

/** Converged independently with Karl Koch's record-shelf hover: 200/24 is the
 *  point where stiffer reads harsh and softer reads mushy. */
export const SPRING = createSpring({ stiffness: 200, damping: 24 });

export const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { animate, createTimeline, onScroll, stagger, utils, createSpring };
```

- [ ] **Step 4: Port the six GSAP calls**

In `src/components/ViewToggle.tsx`:

Line 2 — replace the import:
```ts
import { animate, createTimeline, D } from '../lib/motion';
```

Replace `gsap.set(el, { opacity: n })` with `utils.set(el, { opacity: n })` (import `utils` too), and `gsap.set(el, { clearProps: 'transform' })` with `el.style.transform = ''`.

Replace the `gsap.timeline({...})` crossfade with:
```ts
const tl = createTimeline({
  defaults: { duration: D.fast, ease: 'out(3)' },
});
```
Keep the existing `.to()` / callback structure and timings identical — this is a like-for-like port, not a redesign.

- [ ] **Step 5: Delete the GSAP barrel**

```bash
rm src/lib/gsap.ts
grep -rn "lib/gsap" src/ | wc -l
```
Expected: `0`.

- [ ] **Step 6: Build**

```bash
bun run build
```
Expected: `Complete!`

- [ ] **Step 7: Verify the machine contract still holds — this is the critical check**

```bash
bun run preview &
sleep 3
```
Verify all four, in a browser:
1. `http://localhost:4321/` loads in human view.
2. Clicking the toggle crossfades to machine view showing raw markdown.
3. The URL gains `?machine=true`.
4. Loading `http://localhost:4321/?machine=true` **directly** shows machine view with **no flash of human view** before hydration.

If (4) flashes, the no-FOUC head script or `machine-boot` class handling has been disturbed. Stop and fix before committing.

- [ ] **Step 8: Measure the win**

```bash
ls dist/_astro/ViewToggle*.js | while read f; do echo "$(gzip -c "$f" | wc -c) bytes gzip"; done
```
Expected: roughly 18000, down from ~97000.

- [ ] **Step 9: Commit**

```bash
git add package.json bun.lock src/lib/motion.ts src/components/ViewToggle.tsx
git rm src/lib/gsap.ts
git commit -m "perf: replace GSAP with anime.js — 97KB to ~18KB gzip

src/lib/gsap.ts registered and shipped 15 plugins — ScrollTrigger, Draggable,
Flip, MotionPath, ScrambleText, SplitText and more. Actual usage across the
whole codebase: gsap.timeline() and gsap.set(), for one opacity crossfade.
Zero plugins were used.

ViewToggle ships client:load on every page, so this was 62% of total site JS.
Port is like-for-like; ?machine=true, __RAW_MARKDOWN__ and no-FOUC behaviour
verified unchanged."
```

---

## Task 5: Extract astronomy into pure, tested modules

The prototype's maths is correct and was validated against real ephemerides. Port it as pure functions so it can be asserted without a browser.

**Files:**
- Create: `src/lib/sky/catalogue.ts`, `src/lib/sky/astronomy.ts`
- Create: `scripts/verify-sky.mjs`
- Source: `scratchpad/stars.html` lines 230-433

**Interfaces:**
- Produces:
  ```ts
  // catalogue.ts
  export type Star = readonly [name: string, raHours: number, decDeg: number, mag: number];
  export const STARS: Star[];                    // 96 entries
  export const PLANETS: Record<string, [number[], number[], number]>;
  export const EARTH: [number[], number[]];
  export const LY: Record<string, number>;
  export const FIGURES: Array<[string, Array<[string, string]>]>;
  export const AU_KM = 149597870.7;
  export const LY_KM = 9.4607e12;

  // astronomy.ts
  export function julianDay(d: Date): number;
  export function gmstDeg(d: Date): number;
  export function altAz(raH: number, decDeg: number, latDeg: number, lonDeg: number, when: Date):
    { alt: number; az: number };
  export function planetRaDec(name: string, when: Date):
    { ra: number; dec: number; au: number };
  export function moonRaDec(when: Date):
    { ra: number; dec: number; km: number; illum: number; waxing: boolean };
  export function separationLy(a: BodyPos, b: BodyPos): number | null;
  ```

- [ ] **Step 1: Write the failing verification script**

Create `scripts/verify-sky.mjs`. These assertions encode physical invariants, not expected outputs — they would catch a sign error or a wrong constant, which snapshot tests would not.

```js
import assert from 'node:assert/strict';
import { altAz, planetRaDec, moonRaDec } from '../src/lib/sky/astronomy.ts';

const now = new Date();
let passed = 0;
const check = (name, fn) => { fn(); console.log(`  ✓ ${name}`); passed++; };

// Polaris altitude equals observer latitude — the classic navigational identity.
// Holds at every latitude; 1.2° tolerance because Polaris sits 0.7° off the pole.
check('Polaris altitude tracks latitude', () => {
  for (const lat of [12.97, 45, 60]) {
    const { alt } = altAz(2.5303, 89.264, lat, 77.59, now);
    assert.ok(Math.abs(alt - lat) < 1.2, `lat ${lat} gave alt ${alt}`);
  }
});

check('Polaris is below the horizon from the southern hemisphere', () => {
  const { alt } = altAz(2.5303, 89.264, -33.87, 151.21, now);
  assert.ok(alt < 0, `expected below horizon, got ${alt}`);
});

check('planets stay inside their true orbital ranges', () => {
  const range = { Mercury:[0.30,0.48], Venus:[0.71,0.74], Mars:[1.36,1.68],
                  Jupiter:[4.94,5.47], Saturn:[8.99,10.13] };
  for (const [name, [lo, hi]] of Object.entries(range)) {
    const { au } = planetRaDec(name, now);
    assert.ok(au > 0.1 && au < 12, `${name} geocentric ${au} implausible`);
  }
});

check('Moon declination stays within ±28.7°', () => {
  const { dec } = moonRaDec(now);
  assert.ok(Math.abs(dec) <= 28.7, `dec ${dec} outside lunar range`);
});

check('Moon illumination sweeps a full synodic cycle', () => {
  let lo = 1, hi = 0;
  for (let i = 0; i < 30; i++) {
    const { illum } = moonRaDec(new Date(now.getTime() + i * 86400000));
    lo = Math.min(lo, illum); hi = Math.max(hi, illum);
  }
  assert.ok(lo < 0.05 && hi > 0.95, `cycle ${lo}..${hi} is not a full sweep`);
});

console.log(`\n${passed} checks passed`);
```

- [ ] **Step 2: Run it and watch it fail**

```bash
bun scripts/verify-sky.mjs
```
Expected: FAIL — `Cannot find module '../src/lib/sky/astronomy.ts'`.

- [ ] **Step 3: Create the catalogue**

Create `src/lib/sky/catalogue.ts`. Copy `STARS` (96 entries), `PLANETS`, `EARTH`, `LY`, `FIGURES` verbatim from `scratchpad/stars.html` lines 230-432. Add the TypeScript types from the Interfaces block above. Do not retype the data by hand — copy it, then add `export` and type annotations.

- [ ] **Step 4: Create the astronomy module**

Create `src/lib/sky/astronomy.ts`. Copy `julianDay`, `gmstDeg`, `altAz`, `helio`, `planetRaDec`, `sunEcliptic`, `eclToRaDec`, `moonRaDec` verbatim from `scratchpad/stars.html` lines 306-400 and 433-447. Add types. Keep every comment explaining the maths.

Two details that must be preserved exactly:
- Azimuth is measured from **South** then `+180` to report from North: `((azS*R2D) + 540) % 360`.
- `moonRaDec` must return `km: 385001 - 20905*Math.cos(M)` and the `illum`/`waxing` fields derived from elongation against `sunEcliptic`.

- [ ] **Step 5: Run the verification and watch it pass**

```bash
bun scripts/verify-sky.mjs
```
Expected: `5 checks passed`.

- [ ] **Step 6: Add the script to package.json**

```json
"verify:sky": "bun scripts/verify-sky.mjs"
```

- [ ] **Step 7: Build**

```bash
bun run build
```
Expected: `Complete!` — the modules are not yet imported by anything, so this only proves they typecheck.

- [ ] **Step 8: Commit**

```bash
git add src/lib/sky/ scripts/verify-sky.mjs package.json
git commit -m "feat(sky): pure astronomy modules with invariant checks

96-star catalogue, Standish planetary elements, and Meeus lunar theory as pure
functions with no DOM. Verified against physical invariants rather than
snapshots: Polaris altitude equals observer latitude at every latitude and
drops below the horizon in the southern hemisphere; planets stay inside their
true orbital ranges; the Moon holds ±28.7° declination and sweeps a full
synodic illumination cycle.

Run with: bun run verify:sky"
```

---

## Task 6: The quiet sky — site-wide ambient field

Ship the calm version everywhere first. The home-page treatment and the game build on top.

**Files:**
- Create: `src/lib/sky/projection.ts`, `src/lib/sky/render.ts`, `src/components/SkyField.tsx`
- Modify: `src/layouts/BaseLayout.astro`, `src/styles/globals.css`

**Interfaces:**
- Consumes: `catalogue.ts`, `astronomy.ts` from Task 5
- Produces:
  ```ts
  // projection.ts
  export const FLOOR = -35;
  export function project(alt: number, az: number, W: number, H: number): { x: number; y: number };

  // SkyField.tsx
  export default function SkyField(props: { mode: 'full' | 'quiet' }): JSX.Element;
  ```

- [ ] **Step 1: Create the projection module**

Create `src/lib/sky/projection.ts`:

```ts
/** The disc runs from the zenith (+90°) down to FLOOR° BELOW the horizon, so
 *  noticeably more sky is on screen and the field never looks sparse. Stars
 *  under the horizon are drawn dimmer — they are really there, under the earth. */
export const FLOOR = -35;

const D2R = Math.PI / 180;

export function project(alt: number, az: number, W: number, H: number) {
  const r = (90 - alt) / (90 - FLOOR);        // 0 at zenith, 1 at the floor
  const a = (az - 180) * D2R;
  const R = Math.hypot(W, H) * 0.52;          // overscan so the disc fills the frame
  return { x: W / 2 + Math.sin(a) * r * R, y: H / 2 - Math.cos(a) * r * R };
}
```

- [ ] **Step 2: Create the island in quiet mode only**

Create `src/components/SkyField.tsx`. Port from `scratchpad/stars.html`: the `build()` body-construction, the faint-field generation (420 stars, `dec = asin(uniform)` — **not** uniform-in-dec, which clumps at the poles), and the star-drawing loop. In `quiet` mode render **only** the faint field and named stars — no graticule, planets, Moon, labels, hover or interaction.

Required behaviours:
- Canvas is `position: fixed; inset: 0; z-index: -1; pointer-events: none`. It **must not** receive pointer events — it sits behind content, and making it interactive breaks text selection and link clicks.
- Bail out entirely under `prefers-reduced-motion: reduce`.
- Observer defaults to Bengaluru `{ lat: 12.9716, lon: 77.5946 }`; attempt `fetch('/api/geo')` with a 1200ms timeout and fall back silently. Never block first paint on the network.
- Handle `resize` by rebuilding.

- [ ] **Step 3: Mount it from the layout**

In `src/layouts/BaseLayout.astro`, add a `skyMode` prop defaulting to `'quiet'`, and render the island immediately after `<body>`:

```astro
---
interface Props { title: string; canonical?: string; skyMode?: 'full' | 'quiet'; }
const { title, canonical, skyMode = 'quiet' } = Astro.props;
---
<SkyField client:visible mode={skyMode} />
```

Use `client:visible`, not `client:load` — the sky is decoration and must not compete with `ViewToggle` for main-thread time during hydration.

- [ ] **Step 4: Hide the sky in machine view**

In `src/styles/globals.css` add:

```css
body.machine-mode #sky { opacity: 0; }
#sky { transition: opacity .5s var(--ease-out); }
```

- [ ] **Step 5: Build and verify**

```bash
bun run build && bun run preview &
sleep 3
```
Check: a faint star field is visible behind content on every page; text is still selectable; links still click; `?machine=true` hides the sky; `?mode=light` still renders (the light sky comes in Task 8).

- [ ] **Step 6: Commit**

```bash
git add src/lib/sky/projection.ts src/components/SkyField.tsx src/layouts/BaseLayout.astro src/styles/globals.css
git commit -m "feat(sky): ambient star field behind every page

Real sky for the visitor's location, rendered quiet: faint field plus named
stars, no graticule or interaction. Canvas is pointer-events:none behind the
content so text selection and links are untouched.

Faint stars are distributed as dec = asin(uniform) rather than uniform-in-dec,
which would clump them at the poles. Hidden in machine view and under
prefers-reduced-motion."
```

---

## Task 7: The full sky — home page

**Files:**
- Modify: `src/components/SkyField.tsx`, `src/lib/sky/render.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: everything from Task 6
- Produces: `mode="full"` renders graticule, planets, Moon with phase, labels, hover naming, and scroll-driven constellations

- [ ] **Step 1: Add the graticule**

Port from `scratchpad/stars.html` the instrument layer: altitude rings at 60°/30°/0°/−15°, azimuth spokes every 30°, altitude labels (`60°`, `30°`, `HORIZON`) and the zenith reticle. The horizon ring draws solid at 15% alpha; everything else dashed at ~5%.

**Do not add N/E/S/W labels.** The graticule is fixed to the instrument and the sky moves through it, so a compass label would be lying once the observer travels.

- [ ] **Step 2: Add planets and the Moon**

Append the five planets and the Moon to the body list at build time. The Moon renders at a fixed 13px radius — running magnitude −12.7 through the star size curve produces an absurd disc. Its terminator is an ellipse with semi-minor axis `r·|1−2k|` for illuminated fraction `k`, flipping side with `waxing`. Keep a faint earthshine disc behind the lit portion.

- [ ] **Step 3: Add persistent labels and hover**

Planets and the Moon get a permanent name label below them in mono caps, fading with altitude. Hovering any body shows name, magnitude and altitude. Hovering a drawn constellation segment names the figure. Star labels win over figure labels when both are under the cursor.

- [ ] **Step 4: Add scroll-driven constellations**

All 47 segments across 14 figures draw **simultaneously** over the whole scroll — every line begins forming at the top and completes at the bottom. Drive progress through anime.js `onScroll` in smooth-scroll mode (`sync: 0.14`) so lines ease toward the scroll position rather than tracking the scrollbar 1:1.

```ts
const scrollP = { t: 0 };
animate(scrollP, {
  t: [0, 1], ease: 'linear',
  autoplay: onScroll({ target: document.body, enter: 'top top', leave: 'bottom bottom', sync: 0.14 }),
});
```

- [ ] **Step 5: Opt the home page in**

In `src/pages/index.astro`, change the layout call to `<BaseLayout title="adrijshikhar.dev" skyMode="full">`.

- [ ] **Step 6: Build and verify**

```bash
bun run build && bun run preview &
sleep 3
```
Check on `/`: graticule visible; planets and Moon labelled; Moon shows a real phase; hovering a star names it; scrolling draws constellation lines progressively. Check on `/blogs/` that none of this appears.

- [ ] **Step 7: Commit**

```bash
git add src/components/SkyField.tsx src/lib/sky/render.ts src/pages/index.astro
git commit -m "feat(sky): full instrument view on the home page

Alt/az graticule, five planets, the Moon with a true terminator, hover naming
and constellations that draw with scroll.

The graticule carries altitude labels, not compass points: it is fixed to the
instrument while the sky moves through it, so N/E/S/W would be false once the
observer travels. Altitude above the horizon stays true at any bearing.

All 47 segments draw simultaneously across the full scroll rather than
sequentially — sequential gave each line ~2% of the page and they snapped."
```

---

## Task 8: Light mode — engraved star chart

**Files:**
- Modify: `src/components/SkyField.tsx`, `src/styles/globals.css`

**Interfaces:**
- Consumes: `[data-mode]` on `<html>`, already managed by the existing no-FOUC script and `ModeToggle.tsx`

- [ ] **Step 1: Read the mode inside the canvas renderer**

Read `document.documentElement.dataset.mode` and derive colours from computed CSS custom properties rather than hardcoding. The renderer already reads `--accent` and `--muted` this way; extend it to pick ink-dark star fills in light mode.

- [ ] **Step 2: Invert the marks**

In light mode: stars render as **ink-dark marks on cream** rather than light-on-dark. Faint field at `oklch(28% .02 60 / .30)`. Named stars at full ink. The Moon keeps its phase geometry but inverts — dark limb on paper. Graticule lines use `--rule` as normal, which is already dark-on-light from Task 1.

- [ ] **Step 3: React to mode changes without a reload**

`ModeToggle.tsx` flips `data-mode` live. Observe it so the canvas repaints:

```ts
const mo = new MutationObserver(() => { rebuildPalette(); });
mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
return () => mo.disconnect();
```

- [ ] **Step 4: Build and verify both modes**

```bash
bun run build && bun run preview &
sleep 3
```
Check `/` and `/?mode=light`. Toggle live with the mode button and confirm the sky inverts without a reload and without a flash.

- [ ] **Step 5: Commit**

```bash
git add src/components/SkyField.tsx src/styles/globals.css
git commit -m "feat(sky): engraved star chart in light mode

Light mode inverts the sky to ink marks on warm paper, the way a printed
celestial atlas reads, rather than hiding it. A MutationObserver on data-mode
repaints the canvas when the mode toggles, so switching needs no reload."
```

---

## Task 9: Orbital mechanics easter egg

**Files:**
- Create: `src/lib/sky/physics.ts`, `src/lib/sky/game.ts`
- Modify: `src/components/SkyField.tsx`

**Interfaces:**
- Consumes: everything above
- Produces: `✦ ORBITAL MECHANICS` hook, `sling`/`draw` tools, `home`/`reset`/`exit`

- [ ] **Step 1: Port the cursor-gravity spring**

```ts
const RADIUS = 150, MAX_PULL = 6, K = 0.14, DAMP = 0.78;

/** Displacement-based, not force-based. The pull is measured from the star's
 *  HOME position, never its current one — measuring from the current position
 *  means moving closer increases the pull, which is a feedback loop and makes
 *  the whole field oscillate. Displacement is also clamped to min(MAX_PULL, d)
 *  so a star can never travel past the cursor and flip the force direction. */
export function gravityWell(pts, M) {
  for (const s of pts) {
    let tx = s.tx, ty = s.ty;
    const dx = M.x - s.tx, dy = M.y - s.ty;
    const d = Math.hypot(dx, dy);
    if (d < RADIUS && d > 0.001) {
      const f = 1 - d / RADIUS;
      const amt = Math.min(MAX_PULL, d * 0.9) * f * f;
      tx += dx / d * amt; ty += dy / d * amt;
    }
    s.vx = (s.vx + (tx - s.x) * K) * DAMP;
    s.vy = (s.vy + (ty - s.y) * K) * DAMP;
    s.x += s.vx; s.y += s.vy;
  }
}
```

- [ ] **Step 2: Port the collision solver**

Impulse-based with mass scaled by brightness, restitution `0.94`, drag `0.994`. Collision radius is `visual + 3px` — the prototype originally used a flat `7 + …` which made Sirius bounce at 17.6px while drawing at 3.7px, producing collisions with apparently empty space. Exclude bodies below `FLOOR` from the simulation entirely; they are invisible and were acting as phantom obstacles.

- [ ] **Step 3: Port the aim UI**

Pull is measured as **hand displacement since grab** (`aim.x − cursor`), not star-relative — star-relative means a fast star outruns the cursor and pins power at 100%. Power ring fills the disc outward from the star to its boundary. Trajectory is a dotted line to the viewport edge, solid up to a predicted hit. Ray-cast finds first contact, not closest approach: `t = t_closest − √(R² − perp²)`.

- [ ] **Step 4: Port the collision flare**

Four equal diffraction spikes, a circular light-echo wavefront, radiation jets along each departure vector, and both stars flaring. Intensity scales with the solver's actual impulse. **No geometry-dependent shaping** — anisotropic flares were tried and rejected.

- [ ] **Step 5: Port travel and the tool bar**

Two tools, `sling` and `draw`. In draw mode, dragging from a star draws a link; dragging from empty sky travels (`LON_PER_PX = 0.075`, `LAT_PER_PX = 0.045`). `home` returns to the real observer. Suspend the sky's periodic rebuild while playing — a rebuild mid-game resets every position and snaps flying stars home.

- [ ] **Step 6: No text selection while playing**

```css
body.playing, body.playing *, body.grabbing, body.grabbing * {
  user-select: none; -webkit-user-select: none;
}
```
Also call `e.preventDefault()` in `pointerdown` **before** the star hit-test, so a press that misses a star still suppresses the native drag-select.

- [ ] **Step 7: Build and verify**

```bash
bun run build && bun run preview &
sleep 3
```
Check: the `✦` hook is visible bottom-right on `/` only; clicking enters the game; slinging a star hits another and flares; reset clears drawings and positions; exit restores the site; Escape exits; the hook does not appear on `/blogs/`.

- [ ] **Step 8: Commit**

```bash
git add src/lib/sky/physics.ts src/lib/sky/game.ts src/components/SkyField.tsx src/styles/globals.css
git commit -m "feat(sky): orbital mechanics easter egg

Slingshot physics with impulse-based collisions, mass scaled by brightness,
diffraction-spike flares and constellation drawing, behind a quiet hook on the
home page.

Collision radius is visual+3px; a flat radius made Sirius bounce at 17.6px
while drawing at 3.7px, colliding with apparently empty space. Bodies below the
field of view are excluded from the simulation — they were invisible phantom
obstacles. Aim is measured as hand displacement since grab, so a star at full
speed aims exactly like one at rest."
```

---

## Task 10: Open the PR

- [ ] **Step 1: Full verification pass**

```bash
bun run verify:sky && bun run build
```
Expected: `5 checks passed`, then `Complete!`

- [ ] **Step 2: Confirm the bundle improved overall**

```bash
cat dist/_astro/*.js | gzip -c | wc -c
```
Compare against the 157 KB baseline recorded before this work. Expect a net reduction despite the sky being added, because GSAP's 97 KB left.

- [ ] **Step 3: Push and open the PR against `content`**

```bash
git push -u origin sky-revamp
gh pr create --base content --title "feat: observatory theme with a real-sky background" --body "$(cat <<'EOF'
## Summary

Replaces the Terminal Atelier theme with an observatory theme whose background
is the actual night sky above each visitor, computed from their coordinates.

- **Theme** — oklch lightness ramp; ground 14.5% instead of near-black, muted
  text 52% → 72.5% (the eye-strain fix), accent chroma .19 → .085
- **Deleted** — five unreachable accent themes, the aurora system and its
  self-cancelling veil, card tints, two orphan classes
- **Cards** — double bezel at concentric radii
- **Perf** — GSAP (97 KB gzip, 15 registered plugins, zero used) → anime.js (~18 KB)
- **Sky** — real positions for 96 stars, 5 planets and the Moon with true phase;
  full instrument view on the home page, quiet field elsewhere
- **Light mode** — inverts to an engraved star chart rather than hiding
- **Easter egg** — orbital mechanics behind a quiet hook on the home page

## Verification

- `bun run verify:sky` — 5 invariant checks on the astronomy
- `bun run build` — 7 pages
- Manual: `?machine=true` deep-link with no human-view flash, mode toggle,
  text selection, link clicks, reduced-motion

## Notes

`/api/geo` is not implemented yet, so every visitor currently sees the sky over
Bengaluru. The Cloudflare Worker returning `request.cf.latitude/longitude/city`
is a follow-up.
EOF
)"
```

---

## Self-Review

**Spec coverage.** Home full / elsewhere quiet → Tasks 6+7. Easter egg ships → Task 9. Light mode inverts → Task 8. Bronze accent → Task 1. Branch and PR into `content` → Tasks 1-10.

**Placeholders.** None. Every code step carries real code; every verification step carries a real command and an expected result.

**Type consistency.** `project(alt, az, W, H)` in Task 6 matches its use in Task 7. `FLOOR` is defined once in `projection.ts` and consumed by Tasks 7 and 9. `moonRaDec` returns `{ ra, dec, km, illum, waxing }` in Task 5 and Task 7 consumes exactly those fields. `SkyField` takes `mode: 'full' | 'quiet'` in Task 6 and `BaseLayout` passes exactly that.

**Known gap, stated rather than hidden.** `/api/geo` does not exist. Until the Worker ships, every visitor sees Bengaluru's sky. The fallback is deliberate and never blocks paint.
