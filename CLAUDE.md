# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal portfolio + blog. Astro 6 static site with React 19 interactive islands, Tailwind 3 (CSS-variable design tokens) + shadcn/ui, MDX. Design is **"Terminal Atelier"** — dark-default with a light mode, an accent-tinted card system, and a warm-gold ambient aurora.

## Toolchain & commands

- **Package manager: Bun only.** Use `bun install` / `bun run …` / `bun x …`. `bun.lock` is the lockfile; `package-lock.json` is gitignored — never commit one.
- **Node: via fnm**, pinned by `.node-version` (Node 22). `fnm use` before working.

```bash
bun install                 # install deps
bun run dev                 # dev server at localhost:4321 (hot reload)
bun run build               # production build to dist/
bun run preview             # serve the production build
bun x astro sync            # regenerate content-collection types after schema changes
```

### Verification

```bash
bun run verify:sky          # 16 physical astronomy invariants — pure Node, runs in CI
bun run verify:code         # dual-theme code-block contrast — runs in CI
bun run verify:legibility   # 169/255 canvas-alpha ceiling — needs a browser, NOT in CI
```

`verify:legibility` enforces the ceiling DESIGN.md calls a hard contract. It cannot be pure
Node like `verify:sky`, because legibility depends on what the browser actually rasterised —
so it attaches over CDP to a Chrome you start yourself and runs its sampling **inside** the
page (only numbers cross the wire, so nothing has to decode an image). Deliberately not
wired into CI: adding a browser would make every build and deploy install one, and the check
only means something when you are changing the palette or the sky.

```bash
bun run dev                                          # terminal 1
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 --user-data-dir=/tmp/legibility-profile   # terminal 2
bun run verify:legibility                            # terminal 3 (--all, --json available)
```

It reports `exposed/sampled` per route: text with an **opaque** ancestor between it and the
canvas cannot be harmed, so only unshielded text can fail. That split is diagnostic in its
own right — `/resume/` currently reports `26/26 exposed` (nothing carded), which is why sky
glyphs collide with prose there. Readings drift ±1 between runs because the sky is live.

No lint script exists. Prettier is a dependency but is not wired to a script. The
`deploy` npm script (`gh-pages`) is legacy/unused — deployment is via GitHub Actions (below).

If a dev-server React island fails to hydrate with `jsxDEV is not a function` after editing
`astro.config.mjs`, clear stale caches and restart: `rm -rf node_modules/.vite .astro && bun run dev`.

## Two independent content systems (important)

The site reads content two different ways — keep them separate:

1. **Resume/portfolio content** — loose markdown in `src/content/*.md` (`about`, `experience`,
   `projects`, `education`, `achievements`, `interests`, `skills`), read at build time with
   `fs` + `gray-matter` directly inside the pages. This is **not** an Astro collection.
   `experience.md` and `projects.md` use **slug-splitting**: a YAML `entries[]` array in
   frontmatter plus a body split on `<!-- slug -->` HTML-comment delimiters; `splitBySlug()`
   maps each slug to its markdown chunk, then frontmatter + chunk render a card.

2. **Blog** — an Astro **content collection** (`src/content.config.ts`, glob loader + Zod
   schema) over `src/content/blog/*.mdx`. Read with `getCollection('blog')`. Drafts
   (`draft: true`) are hidden when `import.meta.env.PROD` (visible in `dev`); `getStaticPaths`
   in `[...slug].astro` emits a route for **every** post regardless of `draft`, so don't add
   stray `.mdx` files to that dir. Post `id` (the filename slug) is the URL.

Don't migrate the resume `.md` files into the collection — the isolation is intentional.

## Theming (CSS-variable tokens)

`src/styles/globals.css` defines all design tokens as CSS variables on `:root`.
`:root[data-mode="light"]` overrides the foundation (+ accent, + aurora) tokens for light
mode, re-tuned to hold AA contrast. There is a single accent — no per-theme token sets.

Light/dark **defaults to the system preference** (`prefers-color-scheme`) until the user makes
an explicit choice; `ModeToggle.tsx` persists `mode` to `localStorage` (explicit choice wins)
and follows live OS changes while unset. A **no-FOUC inline head script** in `BaseLayout.astro`
sets `data-mode` before first paint; `?mode=light|dark` is a URL override. Mode
swaps are made atomic via a one-frame `.mode-switching { transition: none }` class to avoid
gradient/heading flicker. Tailwind color utilities map to these vars in `tailwind.config.mjs`,
so prefer token classes (`bg-surface`, `text-muted`, `border-border`) over raw colors.

Gotcha: Tailwind's `/opacity` modifier does **not** compile against CSS-var colors
(`bg-foo/70` renders invisible) — use solid token colors.

## Typography (component classes, not utility strings)

Three faces: **Space Grotesk** display (`--font-heading`), **Familjen Grotesk** prose
(`--font-sans`), **IBM Plex Mono** for all data (`--font-mono`) — dates, coordinates, metrics,
labels. Space Grotesk is Space Mono's proportional sibling, so display rhymes with the all-mono
instrument chrome; it stays out of body copy, where its straight-tailed single-storey `y` reads
as noise at paragraph length. It is already tightly set, so display tracking is `-0.03em`
(`tracking-tightest`) — the `-0.045em` that suited Geist collides at 92px.

**Familjen Grotesk ships `wght 400–700` — there are no weights below 400.** Do not reach for
`font-light`/`font-thin`; they will silently render at 400. It also sets ~6% smaller than Geist
at the same `font-size` (x-height 0.500 vs 0.530), which is the baseline the current sizes were
re-checked against.

**Never size a measure in `ch`.** A `ch` is the width of the font's `0`, so a `ch`-based
max-width silently resizes when the body face changes — that is how the hero lead picked up a
one-word last line during the Geist→Familjen swap. Use `rem`. `text-wrap: pretty` on `p`/`li`
and `balance` on `h1`–`h3` in `globals.css` are the safety net, not the fix.

Every heading and label uses a **component class** from the `@layer components` block in
`globals.css`, never a hand-assembled utility string: `.display-hero`, `.display-page`,
`.title-entry`, `.label-data`, `.meta-data`, `.link-back`, `.channel` (+ `.channel-no`).
Repeating the utilities inline is what let six different tracking values drift into the same
label; add a class instead. Hand-written styles only where a thing is genuinely one-off.

## The instrument chrome must not lie

The sky is real computed astronomy, and that is the design's entire argument. Every value in
the chrome therefore has to be a true statement about the render, not camera-flavoured
decoration. The reference mock's `[ISO 200] [f/3.5] [1/160]` were deliberately **not** built.

The top-centre `.expo` cluster shows `ALT +90…−35°` (the projection's real altitude span, from
`FLOOR` in `projection.ts`), `STARS 96` (`STARS.length`), and a live Julian Date — which is the
actual input to every position on screen.

`STARS n` is a **count, not a limiting magnitude.** The catalogue bottoms out at mag 3.35 but
the renderer also draws a procedural faint field below that, so any `MAG n` label would be
false. Don't "improve" it into one.

The corner readouts are the same contract. Top-left carries `SUN` (the altitude
driving the twilight glow, plus its standard band), `MOON` (the illuminated
fraction the terminator is drawn from) and `PLANETS` (a live count) — all read
off the frame the canvas just painted, so they cannot drift from it. Bottom-left
carries the observer. **Animation runs on anime.js** (`src/lib/motion.ts`
re-exports it) — not hand-rolled `performance.now()` loops.

Only `index.astro` passes `skyMode="full"`; every other route gets `quiet`,
which since the `drawBodies` extraction shares the *same* body renderer — so
planets, the Moon and the Sun appear everywhere, and `tick()` runs the
cursor-gravity wobble everywhere. What quiet withholds is the instrument:
graticule, constellations, hover readout, game.

The graticule (`drawGraticule` in `render.ts`) is structural, not texture: altitude rings are
continuous, the horizon is a heavier solid rule carrying 10°/30° ticks. Only the **azimuth
spokes stay dashed and faint** — they are the one element with no honest label, because a fixed
frame cannot claim a bearing once travel has turned the sky. That is also why there is no
N/E/S/W.

## Human / Machine view toggle (a hard contract)

`ViewToggle.tsx` (the primary `client:load` island, driven by GSAP via `src/lib/gsap.ts`)
crossfades between `.human-view` (the styled site) and `.machine-view` (the raw markdown that
backs the page). The raw markdown is assembled at build in `index.astro` and exposed as
`window.__RAW_MARKDOWN__`. The machine view is **token-driven** (`src/styles/machine.css`) and
**follows the active light/dark mode**, so the canvas never recolors across the toggle — the
transition is a pure opacity crossfade (no flicker). `?machine=true` deep-links straight into
the machine view (with a no-FOUC head script), and toggling keeps the URL param in sync.

**Do not break:** `?machine=true`, `window.__RAW_MARKDOWN__`, or human/machine content parity.

## Layout & components

`BaseLayout.astro` wraps every page: `<head>` no-FOUC scripts, the `.aurora-stage` blobs
(warm-gold, mode-aware, behind a central readability veil), a fixed top-right `ModeToggle`, and
the slot. Home (`index.astro`) is a two-column layout — sticky `SideNav.astro` (identity +
scroll-spy in-page nav) on the left, scrolling `<main>` on the right. List cards (`ExpCard`,
`ProjectCard`, `BlogCard`) share the `HoverCard.tsx` shell — the accent-tinted, soft-shadowed
"atelier-card" with a springy hover lift (the `.atelier-card` / `.atelier-btn` classes live in
`globals.css`).

Pages: `/` (home preview of each section), `/experience` (full), `/archive` (2-col masonry),
`/blogs` (list), `/blogs/[...slug]` (post), `/resume`.

## Deployment

Push to the **`content`** branch → `.github/workflows/deploy.yml` builds with Bun and publishes
`dist/` to GitHub Pages (`actions/deploy-pages`). `build.yml` runs the build on PRs into
`content`. PRs target `content`, not `main`/`master`.

Workflow conventions to preserve: **major-version action tags** (e.g. `@v6` — not SHA pins),
**least-privilege `permissions:`** per workflow, and **never interpolate untrusted input into
`run:`** (pass it as an env var). Actions are on the Node-24 majors (checkout v6, setup-node
v6, upload-pages-artifact v5, deploy-pages v5).
