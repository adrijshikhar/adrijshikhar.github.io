# 002 — Loop easing and reduced-motion coverage

**Files:** `src/styles/globals.css`, `src/lib/motion.ts`, `src/components/ViewToggle.tsx`
**Depends on:** plan 001 (introduces the `--dur-*` tokens used here)
**Risk:** low.

## Step 1 — stop the infinite loops from snapping

Two animations loop forever using a hard-deceleration curve. `--ease-out` is
`cubic-bezier(.32, .72, 0, 1)`: it decelerates to a stop, so on `infinite` the value
hard-snaps back to its start every cycle. `SkyField.tsx:636-645` contains a comment
explaining precisely why `linear` exists to avoid this — the CSS did not follow it.

**`src/styles/globals.css:851`**

```css
    animation: cue-run 2.4s var(--ease-out) infinite;
```
→
```css
    animation: cue-run 2.4s linear infinite;
```

**`src/styles/globals.css:923`**

```css
  .live { animation: live-pulse 2.4s var(--ease-out) infinite; }
```
→
```css
  .live { animation: live-pulse 2.4s ease-in-out infinite; }
```

`live-pulse` is a symmetric breathe, so `ease-in-out` is the correct curve — it returns to
its start value with zero velocity and therefore has no seam.

Note: `.live` is separately flagged as a *truthfulness* defect — it is attached to a
hardcoded `BENGALURU` string, so a visitor whose geo resolves elsewhere sees a pulsing city
name that disagrees with the `OBSERVER` coordinates 700px away. Fixing the easing does not
fix that. See plan 003 §5.

## Step 2 — a duration helper that respects reduced-motion

`src/lib/motion.ts` is currently only a re-export:

```ts
import { animate, createTimeline, createTimer, onScroll, utils } from 'animejs';

export { animate, createTimeline, createTimer, onScroll, utils };
```

Add a helper so every anime.js tween inherits the reduced-motion check. The blanket CSS
override cannot reach JS-driven animation, which is why `ViewToggle` currently ignores it.

```ts
import { animate, createTimeline, createTimer, onScroll, utils } from 'animejs';

/**
 * Duration for anime.js tweens, gated on prefers-reduced-motion.
 *
 * The global CSS reduced-motion override cannot reach animation driven by JS, so every
 * anime.js duration must pass through here. Returns 0 (an instant cut, not a frozen
 * half-state) when the user asked for reduced motion.
 *
 * SSR-safe: returns the full duration when there is no window to query.
 */
export function duration(ms: number): number {
  if (typeof window === 'undefined' || !window.matchMedia) return ms;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms;
}

export { animate, createTimeline, createTimer, onScroll, utils };
```

## Step 3 — route the ViewToggle crossfade through it

**`src/components/ViewToggle.tsx`**, around lines 118-141. Current:

```ts
    // ONE clock: outgoing 1→0 and incoming 0→1, identical duration/ease — perfectly in sync.
    const DURATION = 400;
```

Change to:

```ts
    // ONE clock: outgoing 1→0 and incoming 0→1, identical duration/ease — perfectly in sync.
    // duration() returns 0 under prefers-reduced-motion; the CSS override cannot reach
    // anime.js, so the check has to live here.
    const DURATION = duration(400);
```

and add `duration` to the existing import from `../lib/motion`.

Do **not** restructure the timeline. `onComplete` still fires at duration 0, so the
finalisation block (display, pointer-events, opacity) runs identically — the crossfade
becomes an instant cut, which is the correct reduced-motion behaviour for a full-view swap.

Also note `400` / `inOutQuad` are the 11th duration and 8th easing on the site. Leaving them
outside the token scale is acceptable *only* because a full-view crossfade is its own
interaction class; if plan 001's `--dur-view` (0.5s) is ever applied here, change both the
CSS and this constant together.

## Step 4 — cursor dot: scale, don't reflow

`src/styles/globals.css:610-614` declares the dot:

```css
  #sky-cursor-dot {
    width: 4px;
    height: 4px;
    margin: -2px 0 0 -2px;
    background: var(--muted);
    transition: background-color 0.22s var(--ease-out);
```

and `:630` changes its box per state:

```css
  body.cur-ui #sky-cursor-dot {
    background: var(--accent);
    width: 3px;
    height: 3px;
    margin: -1.5px 0 0 -1.5px;
  }
```

Two problems at once: `width`/`height`/`margin` are layout properties being changed on the
node that a `requestAnimationFrame` loop repositions every frame — and they are **not in the
transition list**, so they snap instantly. The reflow cost is paid and no tween is delivered.
A comment 30 lines above (`:596-599`) forbids exactly this and the ring already does it
correctly via a registered `--ring-s` custom property.

Mirror the ring's approach:

1. Register `--dot-s` alongside the existing `--ring-s` registration (find it with
   `grep -n "property --ring-s" src/styles/globals.css`), same `syntax: "<number>"`,
   `inherits: false`, `initial-value: 1`.
2. On `#sky-cursor-dot`: keep a single fixed `width: 4px; height: 4px; margin: -2px 0 0 -2px`,
   set `--dot-s: 1`, and add `--dot-s var(--dur-hover) var(--ease-out)` to the transition list.
3. In each `body.cur-*` state rule, replace the `width`/`height`/`margin` triplet with a
   `--dot-s` value (`cur-ui` was 3px of 4px → `--dot-s: 0.75`).
4. In the rAF that positions the dot, compose `scale(var(--dot-s))` into the transform the
   same way the ring composes `--ring-s`. Find it with
   `grep -n "sky-cursor-dot" src/components/SkyField.tsx`.

## Verification

```bash
bun run build
```

1. **Loops have no seam.** Watch `.live` and the scroll cue through three full 2.4s cycles.
   Neither may visibly jump at the cycle boundary. This is a feel-check — it cannot be
   verified from the CSS.
2. **Reduced-motion cuts the crossfade.** With `prefers-reduced-motion: reduce`, toggle
   human↔machine: the swap must be instant, and *both* views must end in the correct final
   state (the incoming view visible, the outgoing `display: none`). A half-applied state here
   is worse than the animation.
3. **`?machine=true` still deep-links correctly** in both motion preferences — it is a hard
   contract in `CLAUDE.md`.
4. **No layout properties left on the dot:**
   ```bash
   grep -n "cursor-dot" -A5 src/styles/globals.css | grep -E "width|height|margin"
   # expect only the single base declaration, not per-state overrides
   ```
5. **Dot still tracks the pointer at 60fps** after the transform change — record a
   performance trace over ~3s of cursor movement and confirm no layout events on that node.

Verify all motion with `page.emulateMedia({ reducedMotion: 'no-preference' })` — a headless
browser reports `reduce` by default.
