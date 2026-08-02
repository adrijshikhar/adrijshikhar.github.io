# Observatory redesign — session handoff

Written 2026-08-02 before a strategic compact. Branch `sky-revamp`, PR #792 open
into `content`. Build clean, `verify:sky` 11/11 (now gated in CI), legibility
137-152 max alpha under text on every route, zero external requests.

---

## Decisions already made (do not re-litigate)

| Decision | Rationale |
|---|---|
| **Cards stay** for experience / projects / writing | Bare prose reads at 108 alpha and carded at 137, both under the 169 bar — but a card is a *guarantee* where the sky tuning is only a *measurement*, and these are the entries people read. Bare prose reserved for the short About section. |
| **Space Grotesk for display only** | Owner picked it. Geist keeps `--font-sans`. It carries monospace DNA (Space Mono's proportional sibling), which rhymes with the all-mono chrome. Quirks are an asset at 76px, a liability at 16px. **APPLIED.** |
| **Familjen Grotesk for body** | Owner picked it from a 15-face lab. Editorial-grotesk lane, most voice of that lane and the most economical at matched optical size. Costs the IBM Plex metric match and the sub-400 weights. |
| **No rationale comments in markup/CSS** | Owner's call. Design reasoning lives in `CLAUDE.md` or here, not inline. |
| **Headings and labels are component classes** | Owner's call: "common classes not hand written styles". The utility strings had been copy-pasted enough that six different tracking values (0.1/0.12/0.14/0.16/0.2/0.22em) had drifted into what was meant to be one label. |
| **No Flaticon attribution** | Owner's call, stated explicitly. For the record: account showed the `0/100` free-tier counter and "Go Premium", and the free licence requires credit. Raised once, not to be raised again. |
| **Wide/extended faces rejected** | Archivo Expanded, Saira, Michroma all read sci-fi/automotive rather than scientific instrument. Packages removed. |
| **Planets stay computed canvas paths** | No icon set works: they need live phase and apparent size, and every pack tested needs ~3x the render size before its detail resolves. |
| **Light mode uses `space-lineal-color`**, dark uses monochrome packs masked to `--planet` | Owner's direction. Colour needs a light ground; the icons sit in their own register so this is a deliberate relaxation of the single-accent lock. |
| **Per-frame astronomy recompute** | Measured 0.047ms, 0.3% of frame budget. The alternative (5-min interval) caused a visible jump. |

---

## Next up, in priority order

### 1. ~~Apply Space Grotesk~~ — DONE
Measured, both modes, six routes, 1180–1920px: zero overflow anywhere. The
overflow worry was unfounded — the clamp maxes at 92px against a 736px column,
and Space Grotesk sets marginally *narrower* than Geist ("Shikhar" 305px vs
309px), not wider. Hero tracking moved `-0.045em → -0.03em` on legibility, not
width. Type is now on component classes; four unused font packages removed.

### 2. Five deltas from the Gemini reference (image in conversation)
Highest value first. 1 and 2 are contained.
1. **`[ 02 EXPERIENCE ]`** — amber square brackets *wrapping* the active rail
   label, plus a vertical amber position bar on the left edge. Current rail puts
   the reticle beside the label; wrapping it is stronger.
2. **Three-column readout** — `OBSERVER | SIDEREAL | SOURCE` side by side along
   the bottom edge with thin vertical rules, replacing the stacked key-value
   rows in the corner.
3. **Boxed values top-centre** — `[ISO 200] [f/3.5] [1/160]`. No top-centre
   element exists today; this balances the exposure scale below.
4. **Exposure scale** bottom-centre with an index triangle.
5. **Graticule arcs made structural** rather than faint texture.

Also worth considering: the mock's cards are a *thin hairline border with a
barely-lifted fill*, no double bezel. Simpler, lets more sky through, keeps the
opaque backdrop. Compare against `.atelier-card`.

### 3. Deferred by owner, in their stated order
Mobile UX (last, and it is a design question not breakpoints — below 1180px the
entire instrument concept currently disappears), profiling/Lighthouse (before
mobile), entry animation, icon integration.

### 4. Known and unfixed
- **Ambient layer can spike to 255** when two bright stars visually converge
  during play. Pre-existing, separate from the game-overlay fix, untouched.
- **`animation-timeline: scroll(root)`** on the rail progress track is
  Chromium-verified only. Degrades to hidden via `@supports not`, so not a
  blocker.
- The `/resume` **download-PDF button** still carries its type inline. It is a
  genuine one-off (border, padding, hover), but its mono/xs/0.14em spec
  duplicates `.link-back`. Fold it in if a second such button ever appears.

---

## Traps that have already cost time — do not repeat

**Playwright MCP reports `prefers-reduced-motion: reduce` by default.** Five
people have been caught. Naive measurements exercise static paths and look
plausible while describing code no visitor runs. Always:
```js
await page.emulateMedia({ reducedMotion: 'no-preference' });
```

**Width cannot compare monospace fonts.** They share advance width by
definition — Plex, Geist Mono and JetBrains all measure identically. Pixel-hash
the rendered glyphs instead.

**Verify fonts actually loaded before judging them.** A comparison page was
shown to the owner with five CDN fonts that had all silently fallen back to
system monospace. `document.fonts.check()` plus a glyph hash.

**A font comparison must vary the thing being judged.** A second attempt varied
only the 10px mono while keeping the 76px display identical in all four rows —
correctly rendered, and useless.

**`lsof -ti :PORT` matches client sockets.** It reported the dev server as up
when it was down and Chrome held a closed connection. `curl` it.

**A canvas glyph-hash does not prove the DOM renders in that font.** Two different
checks. The body-font lab passed a canvas hash on all nine faces while the
owner correctly reported they looked identical; the real test is screenshotting
the rendered element and hashing *that*. (They were in fact all distinct — nine
distinct element hashes — the faces just converge at 16px.)

**Neutral grotesks are indistinguishable in body copy, by design.** Comparing
them in paragraphs shows nothing. Show the diagnostic glyphs — `a g y R Q 1 t e`
— at ~96px, then the same string at 16px. The pair is the finding: real
differences, sub-perceptual at reading size.

**Never size a measure in `ch`.** It is the width of the font's `0`, so the
column resizes when the face changes. Cost a widowed hero lead on the Familjen
swap. Sizes are in `rem` now.

**Test the render decision, not the physics.** The Mars terminator bug shipped
under an invariant asserting Mars stays above 0.83 illuminated — true, and
useless, because the defect was in the drawing decision derived from it.

**Do not `git add -A` while a subagent is working.** Its in-progress files get
swept into an unrelated commit. This happened to the game-alpha fix, which
landed inside the About-section commit.

**Scope fixes to the feature, not the file the task named.** Two review findings
were the same shape: `BODY_ALPHA_CAP` applied only to the home page while a
sibling commit had already put the sky behind five routes; machine-mode hiding
keyed on `body` while the no-FOUC script can only mark `html`.
