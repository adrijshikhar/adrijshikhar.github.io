# Terminal Atelier — Bridge Design (A × C)

**Date:** 2026-05-31
**Status:** Approved (brainstorming) → ready for implementation plan
**Goal:** One final design language that bridges the two favourites — design **A** (flat Swiss-terminal) and design **C** (soft premium light) — keeping the best of both.

## Origin

Six full-site design directions were explored (A–F) as live worktree previews. The user narrowed to four (A, C, E, F) and then asked to merge the two that felt closest — **A** and **C** — into a single final language. A and C cannot be folded as-is (opposite design languages: A is dark/flat/engineered/boxy; C is light/soft/premium/rounded). This spec defines a deliberate bridge instead.

## Core identity

**Engineered base + premium cards.** A's flat Swiss-terminal scaffolding is the frame; C's premium cards carry the content. Dark is the default; a light mode is available; the machine/terminal view is unchanged.

## Build approach

Fork from the **A worktree** (`design/swiss-terminal`), which already provides: semantic CSS-variable tokens, dark + light modes with a no-FOUC toggle + `?mode=` override, the 6-accent theme switcher, the tri-color aurora + readability veil, the hero name gradient, the custom cursor, Geist + JetBrains Mono type, and the untouched machine-view duality. Then port in from **C**: the medium-soft accent-tinted cards, springy motion, and adapt the cursor to a rounded-square.

Branch: `design/terminal-atelier` (forked from `design/swiss-terminal`).

## Design decisions (locked in brainstorming)

| Aspect | Decision |
|--------|----------|
| Lead identity | Engineered base (A) + premium cards (C) |
| Cards | Treatment **B** — ~10px radius, soft shadow + faint top-edge highlight, hairline border, **accent-derived tint wash**, springy lift on hover |
| Motion | **C's springy** easing on card lift + staggered section entrances; crisp on nav/links/theme; `prefers-reduced-motion` safe |
| Cursor | **Rounded-square** ring (~3–4px corners) + accent center dot, grows on hover |
| Layout | **Two-column sticky** (identity + in-page scroll-spy nav left, content right) |
| Modes | Dark default + light mode (A's toggle + `?mode=`); machine view unchanged |
| Type | Geist display + JetBrains Mono labels; mono section indices (`01`), `//` eyebrows, hairline section rules |
| Accent | 6-dot switcher (orange default) + light/dark toggle, both no-FOUC + persisted; accents AA-tuned per mode |
| Atmosphere | Tri-color aurora (orange/amber/gold default; recolors per accent) + readability veil, both modes; hero name gradient |

## Component-level requirements

### Cards (the bridge — the main new work)
- A new card surface combining A's hairline border + C's soft premium feel:
  - radius ~10px, `1px` hairline border (`rgb(var(--border)/0.10)` dark; `/0.12` light),
  - soft shadow (warm, mode-appropriate) + faint inner top-edge highlight,
  - **accent-derived tint** background via `color-mix(in srgb, var(--accent) N%, var(--surface))` — cards recolor live when the accent changes; keep N small (≤8%) so text stays AA in every accent × mode,
  - springy lift on hover (`translateY(-3..4px)` + shadow grow + accent left-edge or top-edge brighten) on a spring-ish cubic-bezier; no movement under reduced-motion.
- Used by `HoverCard` → Experience (`ExpCard`), Projects (`ProjectCard`), Writing (`BlogCard`). Date stays on the right of the heading.
- `/archive`: clean multi-column or list grid using the same card.

### Cursor
- Rounded-square ring (`border-radius ~4px`) + solid accent center dot; ring grows + intensifies to full accent on hover over `a, button`. Visible in both modes. `cursor:none` on `lg` only.

### Motion
- Card hover lift + section-entrance stagger use spring easing. Theme/mode/nav transitions stay crisp (~120–150ms). All animation gated by `prefers-reduced-motion`.

### Everything inherited from A (keep working)
- Dark/light tokens, mode toggle + `?mode=`, 6-accent switcher, aurora + veil (both modes), name gradient, mono indices / `//` eyebrows / hairline rules, two-column sticky layout, scroll-spy nav.

## Hard constraints

- **Machine view UNTOUCHED**: `src/styles/machine.css`, machine markup/logic, `ViewToggle` machine behavior, `?machine=true`, `window.__RAW_MARKDOWN__`, `rawMarkdown` assembly, human/machine parity — all unchanged. Machine stays dark `#101010` regardless of human-view mode.
- Content/data unchanged: `src/content/*.md`, `content.config.ts`.
- All routes consistent: `/`, `/experience`, `/archive`, `/blogs`, `/blogs/[slug]`.
- **Accessibility:** every text/bg and text/card pair ≥ 4.5:1 AA in **both** modes and across all 6 accents (verify worst case: lightest text vs most-saturated card tint). Respect `prefers-reduced-motion`. Visible focus rings. No FOUC, no layout shift on mode/theme swap. Content visible without JS.
- `npm run build` must pass. No new heavyweight deps (Geist + JetBrains Mono already bundled/linked).

## Out of scope

- Designs B, D dropped already. E and F remain independent explorations and are not affected.
- No content rewrites; no new sections.

## Definition of done

A cohesive "Terminal Atelier" portfolio where A's engineered terminal frame and C's premium accent-tinted soft cards read as one intentional language; springy but disciplined motion; rounded-square cursor; dark default + light mode + 6 live accents, all no-FOUC and AA in every combination; machine view fully intact; build green.
