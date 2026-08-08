# 004 — Palette refinement (within the current bronze world)

**Files:** `src/styles/globals.css`, `src/lib/code-theme.mjs`
**Risk:** medium — touches foundation tokens that every surface reads from. No structural
or layout change; fully revertible in one commit.

**Scope boundary, stated up front:** this plan does **not** change the site's identity. It
keeps the bronze accent, the warm light family, the cool dark family, and every component
shape. It fixes four *measured* defects inside that world. Replacing the palette entirely
(the aviation-red / paper direction) is a separate fork awaiting a decision — see the
review artifact. Do not blend the two.

## The four defects, with measurements

All figures below were measured in a browser, not estimated. ΔL* is perceptual lightness
difference (CIE L*), which is what "can I see that this card is lifted?" actually depends
on — not contrast ratio.

1. **Light mode has no tonal architecture.** `DESIGN.md:36-41` claims the flatness was fixed
   and card views reached "a three-band spread." Measured, card views put **91.8% of pixels
   in two adjacent deciles**, and ground→card is only **ΔL* 9.8**. The reason the documented
   fix did not hold: the range it depends on comes from `body::before` radial gradients fixed
   to the *viewport*, and a viewport-fixed gradient cannot supply tonal structure to a
   scrolling page. Only a large-area, document-flow element can.

2. **Chroma drops as the surface lifts.** `--bg` carries chroma `.012`; `--surface` carries
   `.005`. So the warm paper family exists only in the gutters *between* cards, and the
   surface people actually read on is a neutral grey-white. Temperature should be invariant
   to elevation — only L moves.

3. **The accent is two different pigments.** `#e5a14b` (dark: HSV sat 0.66, 8.33:1 on card,
   *lighter* than its ground) versus `#8f3d00` (light: sat 0.98, 6.29:1, *darker* than its
   ground). Opposite polarity, and a **2.04** spread in contrast ratio between modes. One
   accent should be one pigment at two lightnesses.

4. **The dark card is nearly invisible and the text halates.** ground→card is **ΔL* 3.8**, so
   all structure rests on a single 11%-alpha hairline; meanwhile body text sits at **11.61:1**,
   above the level where thin type blooms on OLED.

## Step 1 — foundation tokens

In `src/styles/globals.css`, the dark set is at lines 32-37 and the light set at lines
85-90. Replace the listed values only. **Leave every other token alone.**

### Dark (`:root`, lines 32-37)

| Token | From | To |
|---|---|---|
| `--bg` | `oklch(14.5% .010 250)` | `oklch(21% .010 250)` |
| `--surface` | `oklch(19.2% .012 250)` | `oklch(28% .010 250)` |
| `--surface-2` | `oklch(24.8% .014 250)` | `oklch(34% .010 250)` |

Note chroma is now `.010` at all three levels — that is deliberate (defect 2).

### Light (`:root[data-mode="light"]`, lines 85-90)

| Token | From | To |
|---|---|---|
| `--bg` | `oklch(86% .012 76)` | `oklch(79% .012 76)` |
| `--surface` | `oklch(94.5% .005 78)` | `oklch(94.5% .012 76)` |
| `--surface-2` | `oklch(90.5% .007 72)` | `oklch(88% .012 76)` |
| `--text` | `oklch(37% .017 68)` | `oklch(34% .017 68)` |
| `--heading` | `oklch(26% .016 68)` | `oklch(22% .016 68)` |
| `--muted` | `oklch(44% .013 66)` | `oklch(42% .013 66)` |

Chroma is `.012` and hue `76` across all three light surfaces — same reason.

## Step 2 — accent symmetry

| Token | From | To |
|---|---|---|
| `--accent` (dark, line 44) | `oklch(76% .130 70)` | `oklch(74% .12 66)` |
| `--accent` (light, line 108) | `oklch(46% .148 62)` | `oklch(52% .12 62)` |

Chroma is now `.12` in both modes and hue within 4°, so the two modes carry the *same*
pigment at two lightnesses rather than champagne-gold and burnt-brick.

`globals.css:107-108` records that the light accent was darkened *specifically* so the
ground could drop to 86%. Step 1 drops the ground further, which buys back exactly the
headroom needed to lighten the accent — these two edits are one change and must land
together.

## Step 3 — give the accent one large-area job

`ExpCard.tsx:18` and `ProjectCard.tsx:16` both set `prose-strong:text-heading`, which denies
the accent to bold body runs — the quantified evidence (`2500%`, `15x`, `10x`) that is the
hardest content on a portfolio.

Change `prose-strong:text-heading` → `prose-strong:text-accent` in **both** files.

Leave article body copy alone: `blogs/[...slug].astro` deliberately uses weight for emphasis
in long prose, and colouring five bold runs per paragraph would out-rank the section
headings (a separate defect).

## Step 4 — remove the teal literal from the code theme

`src/lib/code-theme.mjs:20-37` assigns a **teal literal at hue 191** inside a palette
declared as hue 66–78, across hundreds of glyphs on the most code-heavy page. It also
assigns bronze to *keywords*, so the site's single accent means "SQL keyword" inside a
`<pre>` and "link" everywhere else.

Two changes:
- Literal colour → a warm low-chroma neutral in the family (e.g. `oklch(62% .04 70)` dark /
  `oklch(46% .05 70)` light). Verify against the pane background, not the page background.
- Keywords → ink plus bold weight, matching how the theme already handles entity names.
  Bronze belongs to links alone.

`bun run verify:code` exists and covers this theme — run it.

## What this plan does NOT fix

Be explicit so nobody thinks it did:

- **Accent asymmetry is reduced, not eliminated** — the spread goes from 2.04 to 1.35, and
  the two hexes are still different (`#de9b52` / `#995600`). One literal hex working on both
  substrates requires the aviation-red direction, which is the fork.
- **The 91.8% single-band measurement should be re-run after this lands.** ΔL* 18 predicts a
  real improvement, but the histogram is the actual claim in `DESIGN.md` and must be
  re-measured rather than assumed.
- **The viewport-fixed `body::before` gradients stay.** Making tonal range come from
  document-flow elements is a layout change and belongs with the redesign.

## Verification

```bash
bun run build
bun run verify:code    # covers the code theme
bun run verify:sky     # must stay green — sky reads --bg
```

Then measure, do not eyeball:

1. **ΔL* targets** — sample the rendered ground and card, convert to L*, and confirm
   light ≈ **18.0** (from 9.8) and dark ≈ **7.9** (from 3.8).
2. **No AA regressions.** Every pair must stay ≥4.5:1 for normal text. Expected after this
   change: light text on card **10.09**, light muted on card **7.21**, light accent on card
   **4.86**, dark text on card **9.25**, dark accent on card **6.21**. The lowest value in the
   set is 4.86, so there is real but not generous headroom — re-measure rather than trusting
   these numbers if you deviate from the values in Step 1–2.
3. **Dark body text must drop to ~9.25:1** (from 11.61). This is intentional: less OLED
   halation while remaining AAA (≥7).
4. **The 169/255 canvas-legibility ceiling still holds.** `DESIGN.md` makes this a hard
   contract, and raising `--bg` changes what sits under the text. Sample canvas alpha under
   every text rectangle and confirm none exceeds 169. **No script for this exists yet** — it
   is the one piece of verification tooling this repo is missing, and this plan is the change
   most likely to break the contract.
5. **Re-run the light-mode histogram** and record the new peak-band percentage in
   `DESIGN.md`, replacing the stale "three-band spread" claim with the measured figure.
6. **Check both modes at the system default**, not just `?mode=light` / `?mode=dark`. The
   un-stamped state (only `prefers-color-scheme` applying) was never tested in the review.
