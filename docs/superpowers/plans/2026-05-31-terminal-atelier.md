# Terminal Atelier — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bridge design A (flat Swiss-terminal) and C (soft premium) into one "Terminal Atelier" language — A's engineered frame + C's medium-soft accent-tinted springy cards, on the existing A base.

**Architecture:** This worktree (`design/terminal-atelier`) was forked from A (`design/swiss-terminal`), so dark+light tokens, the no-FOUC mode toggle + `?mode=`, the 6-accent switcher, the tri-color aurora + veil, the hero name gradient, Geist+JetBrains Mono type, two-column sticky layout, and the untouched machine view ALL already exist. This plan only ports three things from C: (1) medium-soft accent-tinted cards, (2) springy motion, (3) a rounded-square cursor — then verifies AA across every mode × accent.

**Tech Stack:** Astro 6, Tailwind (CSS-variable semantic tokens), React islands (.tsx), GSAP/IntersectionObserver reveals.

**Frontend-design note:** Apply `frontend-design` rigor throughout — the card tint/shadow/lift must feel intentional and premium (depth + restraint), not generic. Keep the dominant near-black + sharp accent; springy but disciplined.

**Verification reality:** This is CSS/markup work with no unit tests. "Tests" = `npm run build` passes + measured WCAG contrast + a screenshot check. Commit after each task.

---

### Task 1: Card + motion design tokens (globals.css)

**Files:**
- Modify: `src/styles/globals.css` (`:root` block, `:root[data-mode="light"]` block, and a new `@layer components` rule)

- [ ] **Step 1: Add card + spring tokens to the dark `:root` block**

In `:root { ... }` (after the aurora trio vars) add:

```css
  /* Atelier card (bridge: A hairline + C soft premium) */
  --card-tint: color-mix(in srgb, var(--accent) 6%, var(--surface));
  --card-tint-2: color-mix(in srgb, var(--accent) 9%, var(--surface));
  --card-radius: 10px;
  --card-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  --card-edge: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  /* Springy easing (from C) */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

- [ ] **Step 2: Add light-mode card token overrides**

In `:root[data-mode="light"] { ... }` add (warm soft shadow + lighter edge for paper-like light surface):

```css
  --card-tint: color-mix(in srgb, var(--accent) 5%, var(--surface));
  --card-tint-2: color-mix(in srgb, var(--accent) 8%, var(--surface));
  --card-shadow: 0 8px 26px rgba(40, 36, 30, 0.10), 0 1px 3px rgba(40, 36, 30, 0.06);
  --card-edge: inset 0 1px 0 rgba(255, 255, 255, 0.7);
```

- [ ] **Step 3: Add the `.atelier-card` component class**

In `@layer components { ... }` add:

```css
  .atelier-card {
    border: 1px solid rgb(var(--border) / 0.12);
    border-radius: var(--card-radius);
    background: var(--card-tint);
    box-shadow: var(--card-shadow), var(--card-edge);
    transition: transform 0.45s var(--ease-spring), background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  }
  .atelier-card.is-alt { background: var(--card-tint-2); }
  @media (min-width: 1024px) {
    .group\/list-item:hover .atelier-card,
    .atelier-card:hover {
      transform: translateY(-4px);
      border-color: rgb(var(--border) / 0.22);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), var(--card-edge);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .atelier-card { transition: background-color 0.3s ease; }
    .atelier-card:hover { transform: none; }
  }
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: PASS (5 pages built, no errors).

- [ ] **Step 5: Commit**

```bash
git add src/styles/globals.css
git commit -m "feat(atelier): card + spring design tokens (dark + light)"
```

---

### Task 2: Convert HoverCard to the Atelier card

**Files:**
- Modify: `src/components/HoverCard.tsx`

Current HoverCard is a flat list block (hairline top border, accent left-edge, no rounding/shadow). Replace with the medium-soft accent-tinted springy card. It must still accept an optional `index` to alternate tint, and keep the date-on-right children layout untouched (children unchanged).

- [ ] **Step 1: Rewrite the component**

```tsx
import type { ReactNode } from 'react';

/**
 * Terminal Atelier card — A's hairline precision + C's soft premium feel.
 * Medium-soft (~10px) rounded surface, accent-derived tint wash, soft shadow +
 * top-edge highlight, springy lift on hover. Alternating tint by index.
 */
export default function HoverCard({ children, index = 0 }: { children: ReactNode; index?: number }) {
  return (
    <li className="group/list-item mb-4 break-inside-avoid last:mb-0 sm:mb-5">
      <div className={`atelier-card relative px-5 py-6 lg:px-6 lg:py-7 ${index % 2 === 1 ? 'is-alt' : ''}`}>
        {/* accent left-edge that brightens on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-3 bottom-3 w-px scale-y-0 bg-accent opacity-0 transition-all duration-300 group-hover/list-item:scale-y-100 group-hover/list-item:opacity-100"
          style={{ borderTopRightRadius: '2px', borderBottomRightRadius: '2px' }}
        />
        {children}
      </div>
    </li>
  );
}
```

- [ ] **Step 2: Verify ExpCard/ProjectCard/BlogCard still pass `index` (they already accept it on the A base) and render**

Run: `npm run build`
Expected: PASS. If a card consumer doesn't pass `index`, it defaults to 0 (no error).

- [ ] **Step 3: Commit**

```bash
git add src/components/HoverCard.tsx
git commit -m "feat(atelier): HoverCard -> medium-soft accent-tinted springy card"
```

---

### Task 3: Springy section-entrance reveals

**Files:**
- Modify: `src/pages/index.astro` (the IntersectionObserver reveal `<script>` near the bottom)

The A base reveals sections with a plain `ease`/`translateY`. Give entrances a springy, staggered feel (disciplined — small distance, gated by reduced-motion).

- [ ] **Step 1: Update the reveal transition to spring easing + stagger**

Find the section-reveal script. Replace the per-section transition setup so each section uses:

```js
// inside the reveal setup, when preparing each section element `s` (index i):
s.style.opacity = '0';
s.style.transform = 'translateY(24px)';
s.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
// on intersect:
el.style.transitionDelay = `${Math.min(i, 4) * 60}ms`;
el.style.opacity = '1';
el.style.transform = 'translateY(0)';
```

Guard the whole reveal behind `window.matchMedia('(prefers-reduced-motion: reduce)').matches === false` and `'IntersectionObserver' in window` (A base already gates on IntersectionObserver; add the reduced-motion guard so sections stay visible/static when motion is reduced).

- [ ] **Step 2: Build + confirm content is visible without JS**

Run: `npm run build`
Expected: PASS. Sections must not be hidden by inline `opacity:0` in the served HTML (the reveal is JS-applied progressive enhancement only).

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(atelier): springy staggered section reveals (reduced-motion safe)"
```

---

### Task 4: Rounded-square cursor

**Files:**
- Modify: `src/layouts/BaseLayout.astro` (cursor markup, ~line 60)

A's cursor is a sharp 0-radius square (`h-4 w-4 border border-muted`). Make it a rounded-square + accent center dot.

- [ ] **Step 1: Replace the cursor inner markup**

Replace the single `cursor-dot` div with a rounded-square ring + accent dot:

```html
    <div class="pointer-events-none fixed z-[9999] hidden lg:block" id="cursor">
      <div class="absolute -left-[10px] -top-[10px] h-5 w-5 rounded-[5px] border border-muted transition-all duration-150 ease-out" id="cursor-ring"></div>
      <div class="absolute -left-[2px] -top-[2px] h-1 w-1 rounded-[1px] transition-all duration-150 ease-out" id="cursor-dot" style="background: var(--accent)"></div>
    </div>
```

- [ ] **Step 2: Update the hover script to target the ring**

In the cursor `<script>`, add a `cursorRing` ref and on `a, button` hover grow + accent the ring:

```js
const cursorRing = document.getElementById('cursor-ring');
// enter:
cursorRing?.classList.add('scale-150');
cursorRing?.style.setProperty('border-color', 'var(--accent)');
cursorDot?.classList.add('scale-150');
// leave:
cursorRing?.classList.remove('scale-150');
cursorRing?.style.removeProperty('border-color');
cursorDot?.classList.remove('scale-150');
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat(atelier): rounded-square cursor (ring + accent dot)"
```

---

### Task 5: AA verification across modes × accents + visual check

**Files:** none (verification + any tint fixes to `src/styles/globals.css`)

- [ ] **Step 1: Compute worst-case contrast**

For BOTH modes and ALL 6 accents, the card tint = `color-mix(--accent N%, --surface)`. Verify the lightest body text token (`--text`, and `--muted`) against the most-saturated tint (`--card-tint-2`, 9% dark / 8% light). Use any contrast tool/script. Worst case must be ≥ 4.5:1. If any pair fails, reduce the tint percentage (e.g. 9%→7%, 8%→6%) in globals and re-check.

- [ ] **Step 2: Build + serve + screenshot**

```bash
npm run build
npm run preview -- --port 4330 &
```
Screenshot `/` (dark, orange), `/?mode=light`, `/experience`, `/archive`, and toggle one accent — confirm: cards are medium-soft tinted with lift, cursor rounded-square, aurora + name gradient intact, no layout shift, machine view (`/?machine=true`) still the dark terminal.

- [ ] **Step 3: Confirm machine view untouched**

Run: `git diff design/swiss-terminal -- src/styles/machine.css src/components/ViewToggle.tsx src/content.config.ts`
Expected: empty (no changes to machine view, toggle, or content config beyond what A already had).

- [ ] **Step 4: Commit any tint fixes**

```bash
git add src/styles/globals.css
git commit -m "fix(atelier): tint percentages for AA across all modes x accents"
```

---

## Self-Review

- **Spec coverage:** cards (T1–T2), springy motion (T1 token + T3 reveals), rounded-square cursor (T4), accent-tint recolor (T1 tokens via `color-mix(var(--accent)…)`), dark+light (T1 light overrides), AA across modes×accents (T5), machine untouched (T5 step 3), build green (every task). Inherited A features (aurora, name gradient, mode toggle, 6-accent switcher, two-column layout) need no work — already present from the fork.
- **Placeholders:** none — all steps have concrete code/commands.
- **Type consistency:** `index?: number` added to HoverCard matches the A-base card consumers that already pass `index`; `.atelier-card` / `.is-alt` / `--card-tint*` / `--ease-spring` names used consistently across T1–T2.
