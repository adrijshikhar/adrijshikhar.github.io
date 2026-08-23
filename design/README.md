# Spectral — the design, complete

Dark-only redesign of adrijshikhar.dev. Every colour value was measured in a browser;
none are estimated. Source of truth for intent is the published spec artifact; source of
truth for geometry is `spectral.fig`.

## Files

| Path | What |
|---|---|
| `spectral.fig` | The design. 1 page, 14 frames, 548 nodes. Open in OpenPencil. |
| `build.sh` | Rebuilds `spectral.fig` from the script below. Two passes — see RECOVERY.md. |
| `build-spectral.js` | The whole design as code. Edit this, not the `.fig`. |
| `exports-spectral/` | One PNG per surface, exported from the built file. |
| `RECOVERY.md` | Tooling findings, retractions, and the id-pool rule. Read before authoring. |
| `jsx/00-tokens.md` | The locked token set, as text. |

## The 14 surfaces

| # | Frame | Covers |
|---|---|---|
| 00 | DESIGN SYSTEM | 8 foundation swatches, the 6-hue ramp with star/ratio/job, 5 type steps, 6 contracts |
| 01 | HERO | corner readouts, HUMAN/MACHINE, 112px display, O/B rule, telemetry strip |
| 02 | RULED ROWS | the no-cards pattern; tag hue encodes category |
| 03 | CODE | the ramp as syntax palette, with its legend |
| 04 | RAIL STATES | proposed six-visible vs today's clipped two, with measured ratios |
| 05 | CHROME INVENTORY | all 14 hero readouts, each with fate and reason |
| 06 | HOME (composed) | the real page: identity + rail, sections 01-06 |
| 07 | BLOGS index | `/blogs` |
| 08 | ARTICLE | `/blogs/[slug]` — the binlog post, full page |
| 09 | RESUME | `/resume`, with the Download-PDF CTA |
| 10 | ARCHIVE | `/archive`, two-column projects |
| 11 | MACHINE VIEW | `?machine=true`, content parity with 06 |
| 12 | MOBILE home 390 | rail collapses; numbers stay as section eyebrows |
| 13 | MOBILE article 390 | reading column at 390 |

## Decisions taken (all reversible)

1. **Rail = wayfinding, all six visible.** The report measures the dial as a defect: 4 of 6
   destinations hidden and focus able to land outside the window. Frame 04 keeps both for
   comparison.
2. **`/experience` dropped.** `/resume` is a strict superset and carries the PDF CTA.
3. **Spectral star data assumed present.** Adding a class per star is ~58 catalogue entries
   and touches `verify:sky` — a code/product call, not a design surface.
4. **Section eyebrows are numbers only** (`01`, then `About`) — the earlier
   `01 ABOUT` + 48px `ABOUT` duplicated the word.
5. **Light mode / paper substrate deleted.** A spectral ramp is a blackbody *emission*
   curve; to clear AA on a light ground every warm hue darkens into brown (G to `#7e6013`,
   K to `#9a5518`) and all six compress into 5.5 L* of each other, so the ramp stops being
   a ramp.

## Editing

```sh
$EDITOR design/build-spectral.js
sh design/build.sh                    # rebuild the .fig
openpencil export design/spectral.fig --node <id> -o /tmp/check.png   # then LOOK at it
```

Node ids shift on every rebuild — resolve them from `openpencil tree design/spectral.fig
--depth 1`, never hardcode across builds. Verify by exporting a PNG and looking at it;
every layout bug in this design was found in pixels, not in the write.
