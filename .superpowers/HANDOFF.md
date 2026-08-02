# Observatory redesign — session handoff

Written 2026-08-02 before a strategic compact. Branch `sky-revamp`, PR #792 open
into `content`. Build clean, `verify:sky` 11/11 (now gated in CI), legibility
137-152 max alpha under text on every route, zero external requests.

---

## Decisions already made (do not re-litigate)

| Decision | Rationale |
|---|---|
| **Cards stay** for experience / projects / writing | Bare prose reads at 108 alpha and carded at 137, both under the 169 bar — but a card is a *guarantee* where the sky tuning is only a *measurement*, and these are the entries people read. Bare prose reserved for the short About section. |
| **Space Grotesk for display only** | Owner picked it. Keep Geist for `--font-sans`. It carries monospace DNA (Space Mono's proportional sibling), which rhymes with the all-mono chrome. Quirks are an asset at 76px, a liability at 16px. NOT YET APPLIED. |
| **No Flaticon attribution** | Owner's call, stated explicitly. For the record: account showed the `0/100` free-tier counter and "Go Premium", and the free licence requires credit. Raised once, not to be raised again. |
| **Wide/extended faces rejected** | Archivo Expanded, Saira, Michroma all read sci-fi/automotive rather than scientific instrument. Packages removed. |
| **Planets stay computed canvas paths** | No icon set works: they need live phase and apparent size, and every pack tested needs ~3x the render size before its detail resolves. |
| **Light mode uses `space-lineal-color`**, dark uses monochrome packs masked to `--planet` | Owner's direction. Colour needs a light ground; the icons sit in their own register so this is a deliberate relaxation of the single-accent lock. |
| **Per-frame astronomy recompute** | Measured 0.047ms, 0.3% of frame budget. The alternative (5-min interval) caused a visible jump. |

---

## Next up, in priority order

### 1. Apply Space Grotesk (small, but needs care)
Three token values in `globals.css` plus the import. Package already installed.
- Hero is `clamp(3rem, 8.5vw, 5.75rem)` at `-0.045em`, tuned for Geist. Space
  Grotesk is wider per character and looser — tracking likely wants `-0.02em`,
  and "Shikhar" may overflow the column at the top of the clamp.
- **Must be checked in light mode.** Thin strokes behave differently on cream,
  and the engraved theme is the more fragile of the two.

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
- **Uncommitted**: font packages in `package.json` (`space-grotesk`, `archivo`,
  `geist-mono`, `jetbrains-mono`, `martian-mono`) — all unused by the site.
  Promote one, remove the rest.

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
