# Eval Rubric — Design Direction E (Neo-Bauhaus Color-Block)

Score each dimension 0–10. Weighted total must reach **7.5** to pass.

### Design Quality (weight: 0.35)
- Bold Bauhaus color-block grid realized: solid primary panels, thick black frames, geometric motifs, oversized type.
- Composition feels designed (asymmetric but aligned), confident, museum-poster quality. Cohesive on all routes.

### Originality (weight: 0.30)
- Distinct Neo-Bauhaus identity — clearly different from dark (A/B/D) and pastel (C) directions and from any stock template.
- Creative leaps (geometric markers, color-blocking rhythm, hard-cut motion) that make it memorable.

### Craft (weight: 0.25)
- Semantic CSS-variable tokens; literal slate-*/accent refactored.
- 6-accent switcher works live, persists, no FOUC, no layout shift.
- Text on color blocks meets AA (black/white chosen correctly per block). Machine view untouched; parity intact; `?machine=true` works.
- WCAG AA on sampled pairs. `prefers-reduced-motion` respected. Content visible without JS. `npm run build` passes.

### Functionality (weight: 0.10)
- All routes render; nav, cursor, links, theme dots, view toggle all work.

## Evaluator method
1. `npm run build` (use `npm install --legacy-peer-deps` if needed) — must succeed.
2. `npm run preview -- --port 4325`. Verify you're on THIS worktree (bold color-blocked light design) before scoring; if port auto-incremented, find the real one.
3. Screenshot into gan-harness/shots/: `home-red.png` (default), `home-parallel.png` + `home-blue.png` (2 accent swaps — confirm live + no layout shift), `experience.png`, `blogs.png`, `machine.png` (`/?machine=true` — MUST be the unchanged DARK terminal view).
4. Sample 4 text/bg contrast pairs INCLUDING text on a solid color block; report ratios; flag any < 4.5:1.
5. Confirm theme persists across reload. Note reduced-motion + focus rings + no-JS visibility.
6. Return JSON: `{ "direction":"neo-bauhaus", "scores":{designQuality,originality,craft,functionality}, "weightedTotal", "pass", "contrast":[{pair,ratio}], "machineViewIntact", "screenshots":[paths], "topFixes":[..] }`.
