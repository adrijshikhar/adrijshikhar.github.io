# 001 — Motion token scale and hover feel

**Files:** `src/styles/globals.css`, `src/components/SideRail.astro`
**Risk:** low — no layout or colour changes, no DOM changes.
**Why it matters:** the card hover is the site's highest-frequency interaction (every list
card on `/`, `/experience/`, `/archive/`, `/blogs/`), and it currently resolves in two
visible stages and travels below the perceptual threshold.

## Background the executor needs

`src/styles/globals.css:52-53` already defines two easing tokens:

```css
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-out: cubic-bezier(.32, .72, 0, 1);
```

`--ease-spring` overshoots (control point `1.56` exceeds 1). `--ease-out` is a hard
deceleration with no overshoot.

Measured across the site: **11 distinct durations** (`0.22s`, `0.28s`, `0.3s`, `0.4s`,
`0.45s`, `0.5s`, `120ms`, `150ms`, `400ms`, `500ms`, `2.4s` — note `0.5s` and `500ms` are
the same value written two ways) and **8 easings**. There is no duration token at all.

## Step 1 — add a duration scale

In `src/styles/globals.css`, immediately after the existing `--ease-*` declarations at
lines 52-53, add:

```css
  /* Four durations, one per interaction class. One element gets ONE duration across all
     of its animated properties — a second duration on the same element makes it resolve
     in two visible stages. */
  --dur-tap:   0.12s;  /* colour-only feedback on press/immediate hover */
  --dur-hover: 0.22s;  /* hover lift, cursor ring — must read as attached to the pointer */
  --dur-ui:    0.3s;   /* toggles, panels, discrete state changes */
  --dur-view:  0.5s;   /* full-view crossfades and scroll reveals only */
```

Do not delete any existing duration yet — later steps replace them individually.

## Step 2 — fix the card hover (two clocks → one)

**Current, `src/styles/globals.css:360-380`:**

```css
  .atelier-card {
    position: relative;
    border-radius: var(--card-radius);
    background: var(--card-core);
    box-shadow: 0 0 0 1px var(--rule);
    transition: transform 0.5s var(--ease-out),
                background-color 0.35s var(--ease-out),
                box-shadow 0.35s var(--ease-out);
  }
  @media (min-width: 1024px) {
    .group\/list-item:hover .atelier-card,
    .atelier-card:hover {
      transform: translateY(-2px);
      background: var(--surface-2);
      box-shadow: 0 0 0 1px var(--rule-hi), var(--card-shadow);
    }
  }
```

**Replace the `transition` declaration with:**

```css
    transition: transform var(--dur-hover) var(--ease-out),
                background-color var(--dur-hover) var(--ease-out),
                box-shadow var(--dur-hover) var(--ease-out);
```

**And change the hover travel from `-2px` to `-4px`:**

```css
      transform: translateY(-4px);
```

Rationale, both changes: `0.5s` is 25% slower than the slowest reposition duration Apple
ships (`0.4s`), and 2px of travel is below the threshold at which a viewer perceives a
state change. The two errors compound — the interaction reads as dead rather than subtle.
4px at 0.22s reads as attached to the cursor.

**Do not touch** the `@media (prefers-reduced-motion: reduce)` block at lines 377-380. Its
fallback (keep the background transition, drop the transform) is correct and deliberate.

## Step 3 — de-invert the button spring

**Current, `src/styles/globals.css:352-355`** (selector is `.atelier-btn`):

```css
    transition: transform 0.3s var(--ease-spring), background-color 0.3s ease;
  }
  .atelier-btn:hover { transform: translateY(-2px); background: color-mix(in srgb, var(--accent) 14%, var(--surface)); }
```

**Replace the `transition` declaration with:**

```css
    transition: transform var(--dur-hover) var(--ease-out), background-color var(--dur-hover) var(--ease-out);
```

Two defects in one line: `--ease-spring` overshoots by ~1.1px on a 2px lift — sub-pixel, so
the bounce is paid for and never delivered — and pairing `--ease-spring` with plain `ease`
puts two different easings on one element.

Overshoot is only correct when the gesture itself carried momentum (a flick, a drag
release). A hover carries none. **Reserve `--ease-spring` for the sky drag-release** and
nothing else; leave the token defined.

## Step 4 — replace the five hand-written beziers in SideRail

`src/components/SideRail.astro` hand-writes `cubic-bezier(0.32, 0.72, 0, 1)` — the literal
value of `--ease-out`, defined 60 lines away in `globals.css` — at exactly five places:

| Line | Current | Replace with |
|---|---|---|
| 115 | `transition: transform 0.6s cubic-bezier(0.32, 0.72, 0, 1);` | `transition: transform var(--dur-ui) var(--ease-out);` |
| 128 | `transition: opacity 0.6s cubic-bezier(0.32, 0.72, 0, 1);` | `transition: opacity var(--dur-ui) var(--ease-out);` |
| 140 | `transition: opacity 0.45s cubic-bezier(0.32, 0.72, 0, 1);` | `transition: opacity var(--dur-ui) var(--ease-out);` |
| 151 | `transition: color 0.6s cubic-bezier(0.32, 0.72, 0, 1);` | `transition: color var(--dur-ui) var(--ease-out);` |
| 162 | `transition: color 0.6s cubic-bezier(0.32, 0.72, 0, 1);` | `transition: color var(--dur-ui) var(--ease-out);` |

This also drops the rail's highlight from `0.6s` to `0.3s`. A 600ms nav highlight lags the
scroll that triggers it; the indicator should arrive with the section, not after it.

Note: `CLAUDE.md` records that the component-class system exists *because* six tracking
values once drifted into one label. The same drift has now happened in motion. Using the
token is the fix, not a preference.

## Scope boundary

Do **not**: change any colour token, change `--card-radius`, touch `render.ts` or any sky
code, alter the `prefers-reduced-motion` blocks, or convert CSS transitions to JS springs.
Do **not** consolidate the remaining durations found elsewhere in the file — plan 002
handles the loops, and anything not named above stays as-is for now.

## Verification

```bash
bun run build     # must stay green
```

Then, with the dev server running:

1. **Feel-check the card hover at 1024px+.** Hover a card on `/experience/`. It should read
   as one movement that arrives quickly, not as a lift followed by a colour change. If you
   can perceive two stages, a duration was missed.
2. **Confirm one clock programmatically:**
   ```js
   getComputedStyle(document.querySelector('.atelier-card')).transitionDuration
   // expect "0.22s, 0.22s, 0.22s" — three identical values
   ```
3. **Confirm the travel:** hover, then read
   `getComputedStyle(el).transform` → expect `matrix(1, 0, 0, 1, 0, -4)`.
4. **Confirm no overshoot on the button:** `.atelier-btn` hover must not exceed `-4px` at
   any point. Sample the transform every 30ms through the hover; the magnitude must increase
   monotonically to its target and stop.
5. **Reduced-motion still degrades correctly:** with `prefers-reduced-motion: reduce`, the
   card must change background and *not* translate.
6. **Zero remaining hand-written copies:**
   ```bash
   grep -rn "cubic-bezier(0.32, 0.72, 0, 1)" src/   # expect no matches
   grep -rn "cubic-bezier(.32, .72, 0, 1)" src/     # expect exactly 1 (the token definition)
   ```

Remember: verify motion with `page.emulateMedia({ reducedMotion: 'no-preference' })` — a
headless browser reports `reduce` by default and will silently exercise the static path.
