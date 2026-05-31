# Eval Rubric — Design Direction A (Swiss Terminal)

Score each dimension 0–10. Weighted total must reach **7.5** to pass.

### Design Quality (weight: 0.35)
- Flat Swiss-minimal foundation realized: near-black warm-gray base, hairline borders, ~0 radius, no shadow.
- Human view reads as a designed sibling of the terminal/machine view (cohesive duality).
- Orange accent is surgical, not splattered. Strong typographic hierarchy with Geist + mono labels.
- Looks intentional and premium on `/`, `/experience`, `/archive`, `/blogs`, `/resume`.

### Originality (weight: 0.30)
- Distinctive terminal-Swiss treatment (mono section indices, `//` eyebrows, hairline dividers) — not a generic dark theme.
- Creative leaps that elevate beyond the stock Brittany-Chiang template.

### Craft (weight: 0.25)
- Semantic CSS-variable tokens; literal slate-*/accent refactored.
- 6-accent switcher works live, persists, no FOUC, no layout shift.
- Machine view verifiably untouched; human/machine parity intact; `?machine=true` works.
- WCAG AA contrast on sampled pairs. `prefers-reduced-motion` respected. `npm run build` passes.

### Functionality (weight: 0.10)
- All routes render; scroll-spy nav, cursor, links, theme dots, view toggle all work.

## Evaluator method
1. `npm run build` in the worktree — must succeed (capture errors).
2. `npm run dev`, drive with Playwright at the dev URL.
3. Screenshot `/` (default orange), toggle 2–3 accent themes, screenshot each. Screenshot `/blogs` and `/experience`.
4. Verify `?machine=true` still lands on the unchanged terminal view.
5. Sample 4 text/bg contrast pairs; report ratios.
6. Return JSON: `{ scores: {designQuality, originality, craft, functionality}, weightedTotal, pass, topFixes: [..] }` plus 3–5 concrete fixes if below threshold.
