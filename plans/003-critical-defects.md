# 003 — Critical defects

**Files:** `src/components/SideRail.astro`, `src/pages/index.astro`, `src/lib/sky/render.ts`,
`src/layouts/BaseLayout.astro`, `src/content/about.md`
**Risk:** mixed — §1, §3, §4 and §5 are small and safe; §2 touches the sky renderer.
**Independent of** plans 001/002/004 — can run in parallel.

Ordered by damage to the site's job.

---

## §1 — The in-page nav fails AA in both modes

**Measured, not estimated.** The rail links render the bronze accent at `opacity: 0.4`, 16px:

| Mode | Effective colour | Ratio | Required | |
|---|---|---|---|---|
| Light | `rgb(186,149,120)` | **1.79:1** | 4.5:1 | fail |
| Dark | `rgb(96,70,38)` | **2.27:1** | 4.5:1 | fail |
| *either, at `opacity: 1`* | — | *4.84 / 9.00* | 4.5:1 | pass |

The opacity is the entire cause — the token is fine. This is WCAG 1.4.3, on the only
in-page navigation the site has.

**In `src/components/SideRail.astro`,** find the rule setting `opacity: 0.4` on the rail
links (`grep -n "opacity" src/components/SideRail.astro`) and:

1. Set `opacity: 1` on all rail links.
2. Carry the **inactive** state with `color: var(--muted)` instead of transparency.
3. Carry the **active** state with `color: var(--heading)` plus the accent on the numeral
   only — colour, never opacity.

Two related items in the same component:

- **The rail is 16px.** `DESIGN.md:107` states that anything in the chrome rendering at 14px
  "has left the register," and a control floating over the sky is chrome by that document's
  own rule. Bring the rail to the chrome scale (11px, tracking 0.14em) so it stops competing
  with the section labels it points at.
- **Focus handling.** The scroll-spy indicator is driven by a `--i` custom property from
  scroll position only. Drive it from `focusin` as well, so keyboard traversal moves the
  indicator (WCAG 2.4.7).

**A review claim that did NOT reproduce — do not act on it.** An earlier report stated that
`overflow: hidden` clips 3 of the 6 rail links. Measured at 1440px, all six links have full
`145×37` boxes and the container computes `overflow: visible`. Only two are *legible*, which
is a consequence of the opacity above, not clipping. Fixing §1 should resolve the visible
symptom; verify before adding any `overflow` change.

---

## §2 — Planet glyphs and labels draw on top of prose

The highest-converged finding in the review (5 independent lenses). On `/blogs/[slug]/` and
`/resume/` there is no card between the sky canvas and the text, so planet discs and their
9px labels render *inside* the reading column, and labels clip to `JUPITE` at the viewport
edge.

`BODY_ALPHA_CAP` in the renderer is a legibility crutch for a collision that should not
happen at all.

**In `src/lib/sky/render.ts`,** in `drawBodies` (around lines 884-893):

1. Accept an optional keep-out rectangle parameter (a `DOMRect`-shaped `{x, y, width, height}`).
2. For each body whose projected label box intersects that rectangle, **suppress the label
   and keep the glyph.** The glyph is the retained design element; the 9px label is what
   destroys the prose.
3. Clamp label `x` to `[8, W - labelWidth - 8]` **unconditionally**, independent of the
   keep-out — that alone fixes the `JUPITE` clipping everywhere.

**Critical constraint:** `render.ts` must stay DOM-blind so `scripts/verify-sky.mjs` can
import it under Node. Do **not** call `getBoundingClientRect` inside `render.ts`. Measure the
column in the component (`SkyField.tsx`) and pass a plain object down.

Callers to wire up: `src/pages/blogs/[...slug].astro:47` and `src/pages/index.astro:93`.

`bun run verify:sky` must stay green — it holds 16 physical invariants and this is the file
it covers.

---

## §3 — Home body content is invisible without scrolling

`src/pages/index.astro:271-302` sets `style.opacity = '0'` on every `section[id]` in JS, and
only an IntersectionObserver lifts it. Anything that renders without scrolling gets a blank
page: print, save-as-PDF, reader mode, link-preview screenshots, and any automated capture.

This was hit during the review itself — five review lenses analysed ~3,900px of "void" that
does not exist.

Note the current script is skipped under `prefers-reduced-motion`, which means the bug only
appears for users who have *not* asked for reduced motion. That inversion is a hint the
default state is wrong.

**Fix:** make the default state *visible* and let the reveal be additive.

1. Delete the JS that sets `opacity`, `transform` and `transition` inline.
2. Express the reveal in CSS behind `@supports (animation-timeline: view())`, using
   `animation-timeline: view()` — the same pattern `SideRail.astro:86-94` already uses, so
   there is an in-repo exemplar to copy.
3. Add a `@media print` reset that forces `opacity: 1; transform: none` on `section[id]`.

Browsers without `animation-timeline` support simply show the content, which is the correct
degradation.

---

## §4 — Content outside a landmark region

The only finding produced by the real WCAG engine (`accesslint`, `landmarks/region`,
moderate) — reported on every page audited, in both modes:

- home: 2 instances, both `astro-island` wrappers
- post and résumé: 1 instance each, a top-level `div`

Wrap or re-parent the offending nodes so all content sits inside a landmark, or mark
genuinely decorative wrappers `aria-hidden="true"` where they carry no content.

Related, same component family, from the review:

- `aria-hidden="true"` is present on `.expo` and the canvas but **missing on all three
  `.instrument` blocks** (`SkyField.tsx:735, 758, 804`), so a screen reader recites ~20 words
  of jargon including a sidereal clock that mutates every second.
- **No skip link**, despite `<main id="content">` already existing in `BaseLayout.astro`. Add
  one as the first body child.
- **First Tab lands on a 30%-opacity easter egg** whose focus ring fades with it
  (`SkyField.tsx:815-824`). Add `focus-visible:opacity-100`, and move `<SkyField>` after
  `<slot/>` in the layout — it is `position: fixed`, so painting is unaffected.

**Verify with the engine, at the right viewport.** The audit run during the review came back
almost clean *because* its headless Chrome sat below 1180px, where the rail collapses to
`0×0` and the contrast rule correctly skips zero-area elements. A green report at the default
viewport proves nothing about this site. Force ≥1180px before trusting any a11y pass.

---

## §5 — Disclosure and contact

Three separate problems, all verified directly:

1. **A phone number in a public repo** — `src/content/about.md:5`. Delete the `phone:` field.
   There is no UI that renders it.
2. **Two different contact emails ship simultaneously** — `adrijshikhar@gmail.com`
   (`index.astro:104`) versus `ashikhar@ee.iitr.ac.in` (`about.md:6`, and `PRODUCT.md`). Pick
   one and correct the other two files.
3. **No contact endpoint on any page** — only five unlabelled 20px glyphs in the hero. Add
   name, one email, and a résumé link to the global footer so every page carries a way to
   make contact. `PRODUCT.md` names recruiters as a primary audience whose success condition
   is being able to reach Adrij.

Also in `about.md:21-23`: a Facebook link. Whether that belongs on a senior engineer's
professional page is Adrij's call, not a fix — flag it, do not remove it unilaterally.

Related truthfulness defect (from plan 002 §1): `.live` pulses a hardcoded `BENGALURU`
(`index.astro:87-88`) while `OBSERVER` reports the visitor's resolved coordinates. For a
visitor in Berlin the two disagree about the same fact — the only outright false statement in
the chrome, in the first thing anyone reads. Either drop `.live` from the eyebrow (it is
biography, not a reading) or bind it to the resolved city.

---

## Verification

```bash
bun run build
bun run verify:sky     # §2 must not break the 16 invariants
```

1. **§1:** re-measure both modes. Every rail link must reach ≥4.5:1 against its actual
   background. Tab through the rail and confirm the indicator follows focus.
2. **§2:** load `/blogs/mysql-binlog-4gib-position-wrap/` and `/resume/` at 390px and 1440px,
   both modes. No planet label may overlap prose; no label may be cut at either edge; glyphs
   must still be present. Then confirm `render.ts` still imports cleanly under Node.
3. **§3:** take a `fullPage` screenshot **without scrolling** — every section must be visible.
   Then print-preview the home page.
4. **§4:** re-run `accesslint audit_live` at a **≥1180px** viewport against `/`,
   `/blogs/[slug]/` and `/resume/`, in both modes. `landmarks/region` must be gone and
   nothing new introduced.
5. **§5:** `grep -rn "phone:" src/content/` returns nothing; `grep -rn "gmail.com" src/`
   agrees with `about.md`.
