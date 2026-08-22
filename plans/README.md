# Fix plans — design review, 2026-08-08

Generated from a 12-lens design review plus five design-skill passes. Every finding in
these plans was re-read at its cited `file:line` and, where a number is quoted, measured
in a live browser rather than inferred.

Source report: the published review artifact, and `scratchpad/SYNTHESIS.md` for the full
30-defect list.

## Status: superseded by the Spectral implementation

**These plans are historical.** The design was signed off in OpenPencil
(`design/spectral.fig`, 14 surfaces) and implemented in one pass, so the plans were
absorbed rather than executed one by one:

| Plan | Outcome |
|---|---|
| 001 motion tokens | **Landed.** `--dur-*` scale added; the card's two clocks became one; the five hand-written beziers in `SideRail.astro` now use `--ease-out`. The `-4px` hover lift was *not* taken: the design carries state by colour, never motion. |
| 002 loops and reduced motion | **Partly landed** via the duration scale. The loop easings are untouched. |
| 003 critical defects | **Landed**, except §2 (sky keep-out). The prose collision was solved differently, by shielding the reading column, which the legibility verifier confirms at `0/n exposed`. |
| 004 palette refinement | **Obsolete.** It refined the bronze world; that world is gone. The fork it names as "a separate decision" is the one that was taken. |

Kept for the measurements and the reasoning, which are still the best record of why each
defect mattered. The original gate text follows.

## Gate — design approval comes first (historical)

**Nothing here is cleared to start.** The design must be signed off in Figma before any
code changes land. The board is:

**https://www.figma.com/design/eQvFTOvBoCAHx9qZvB91FW**

It carries two sections:

1. **Brand Board** — the five Realtime Colors slots as Figma variables (`text`,
   `background`, `primary`, `secondary`, `accent`), wired so the RTC plugin recolours every
   surface at once. Sections cover the hero, the content register (rounded, shadowed cards)
   and the chrome register (square, hairline, mono) — the pair a generic palette preview
   cannot test.
2. **Sky elements** — the retained pieces, as *real* captures rather than mockups: both full
   sky plates, the shipping `planets.webp` glyph sheet (both rows), and detail crops of the
   Sun glow, the star marks and the graticule in each mode.

Plan 004 in particular must not be applied before its values have been seen on that board.

## Execution order

| # | Plan | Scope | Depends on | Status |
|---|---|---|---|---|
| 001 | [Motion token scale and hover feel](001-motion-tokens-and-hover.md) | `globals.css`, `SideRail.astro` | — | BLOCKED on design sign-off |
| 002 | [Loop easing and reduced-motion coverage](002-loops-and-reduced-motion.md) | `globals.css`, `motion.ts`, `ViewToggle.tsx` | 001 (token names) | BLOCKED |
| 003 | [Critical defects](003-critical-defects.md) | `SideRail.astro`, `index.astro`, `render.ts`, layouts | — | BLOCKED |
| 004 | [Palette refinement](004-palette-refinement.md) | `globals.css`, `code-theme.mjs` | Figma sign-off | BLOCKED |

001 and 003 are independent of each other. 002 uses the duration tokens 001 introduces. 004
is independent of all three but is the one most likely to break the 169/255 canvas
legibility contract, so it should land alone and be measured on its own.

If the sign-off is only partial, 003 §1 (the nav AA failure), §4 (landmarks) and §5
(a phone number in a public repo) are defensible to land regardless — none of them depends
on a visual decision.

## What is deliberately NOT in these plans

- **Palette, type and layout *replacement*.** Plan 004 refines the existing bronze world by
  fixing measured defects. Swapping to a new visual world — the aviation-red / paper
  direction that scored best of the five design skills — is a fork, not a fix, and is the
  user's call. Do not blend the two: applying 004 and then switching direction wastes 004.
- **Content edits.** `PRODUCT.md` scopes content out. The exceptions in 003 §5 are a
  disclosure problem, not a copy preference.
- **Deleting `/experience`,** removing cards, collapsing to one grotesk, or reordering the
  home page. All forks awaiting a decision.

## Verification available to every plan

```bash
bun run dev          # localhost:4321 — note trailingSlash: 'always', so /experience/ not /experience
bun run build        # must stay green
bun run verify:sky   # 16 physical invariants, already in CI
```

Two traps when verifying in a headless browser, both hit during this review:

1. **Playwright's browser reports `prefers-reduced-motion: reduce` by default.** Any motion
   change must be verified with `page.emulateMedia({ reducedMotion: 'no-preference' })`, or
   you are exercising the static path.
2. **A `fullPage` screenshot does not scroll,** so the home page's IntersectionObserver
   never fires and every section stays at `opacity: 0`. Scroll the page first, or fix
   plan 003 §3 and the problem disappears.
