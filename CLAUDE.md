# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal portfolio + blog. Astro 6 static site with React 19 interactive islands, Tailwind 4 (CSS-first: the theme lives in `globals.css` under `@theme inline`, there is no `tailwind.config.mjs`) and shadcn/ui. MDX for posts. Colour is shadcn's default theme, `neutral` base, dark only — the full `:root`/`.dark` oklch token pair, unmodified. Design is an **observatory instrument**: a near-black ground with real computed astronomy behind the content.

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
own right. Every route except `/` now reports `0/n exposed`, because the redesign moved
the legibility shield up from the individual rows to the reading column (`.reading-plane` /
`.content-plane` in `globals.css`) — rows are rules with no fill, so the plane has to live
one level up or canvas ink lands under the prose. `/` stays intentionally exposed at
`45/45`: the hero is meant to sit *in* the sky, and it measures 139/169 there. Readings
drift ±1 between runs because the sky is live.

Two traps when verifying in a headless browser, both hit in anger:

1. **Playwright reports `prefers-reduced-motion: reduce` by default.** Emulate
   `no-preference` or you exercise the static path.
2. **Never resize the viewport to the full page height to capture a tall page.** It inflates
   every `min-h-screen`/`100dvh` box (a 900px hero became 4464px) and the result looks like
   a broken layout that is not broken. Use CDP `captureBeyondViewport` with the viewport
   left at 1440x900.

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

## Theming

Dark only. `<html>` carries `.dark`, and `src/styles/globals.css` holds shadcn's default
token pair — `:root` for light, `.dark` for dark — verbatim from ui.shadcn.com. `@theme
inline` maps those tokens to Tailwind utilities, which is what replaced
`tailwind.config.mjs` in v4.

**Do not invent colours.** Every colour is a shadcn token: `background`, `card`, `popover`,
`primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, plus
their `-foreground` pairs. Use the token classes (`bg-card`, `text-muted-foreground`,
`border-border`), not raw values.

**The trap that has cost real time here:** in shadcn, a token WITHOUT `-foreground` is a
SURFACE. `--accent` and `--muted` are backgrounds — both `oklch(0.269 0 0)` in dark, near
black. Their ink counterparts are `--primary` and `--muted-foreground`. Feeding `--accent`
to the canvas painted the sky readout near-black on near-black; using `bg-accent` for a
button hover painted near-white on near-white text. If a colour looks invisible, check
whether a surface token is being used as ink.

No `color-mix()`, no fractional `opacity` for dimming, and no derived shades: reach for a
dimmer token instead. `opacity: 0` / `1` for show-hide is fine.

Gotcha: Tailwind's `/opacity` modifier does **not** compile against CSS-var colours
(`bg-foo/70` renders invisible) — use solid token colours.

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

The top-centre `.expo` strip shows `ALT +90…−35°` (the projection's real altitude span, from
`FLOOR` in `projection.ts`), a live star count, a live Julian Date (the actual input to every
position on screen) and local sidereal time. Below `sm` only `ALT` is shown — three cells do
not fit a phone, and a bare Julian Date is the least self-explanatory value in the chrome.

`STARS n` is a **count of what is drawn, not of the catalogue**, and it has to stay that way.
The ambient sky draws constellation members only — 59 of 96 — and the `[dark sky]` toggle
inside orbital mechanics reveals the other 37. The readout switches 59 ↔ 96 with it. Anything
that changes which stars are painted must update this number in the same commit.

Suppressed stars are **flagged** (`BodyPos.suppressed`), never filtered out of the array.
`game.sync()` pairs `bodies[i]` with `game.stars[i]` positionally and `hoverIndex` is an index
into the same array, so removing entries misaligns both silently. `nearestBody()` returns −1
for a suppressed star, or the hover readout would name something that is not on screen.

Star size and alpha come from `vrFor` and `starAlpha` in `render.ts`. Two things learned the
hard way: the alpha ramp reaching zero before the catalogue's faint end (3.35) is what made
46% of the field invisible; and widening that ramp rather than just lifting its floor is what
made the field look crowded — it doubled the pixels above alpha 110. Lift the floor, leave the
slope.

`FAINT_FIELD` in `render.ts` is an intentionally empty export, not dead code: the draw loops
and `computeSky` signature still handle it, so dropping a real faint catalogue in there works
with no other change. What it must not go back to is procedural dots that cannot be hovered or
named.

The corner readouts are the same contract. Top-left carries `SUN` (its altitude plus the
standard twilight band), `MOON` (the illuminated fraction the terminator is drawn from) and
`PLANETS` (a live count) — all read off the frame the canvas just painted, so they cannot
drift from it. Bottom-left carries the observer, sidereal time and the source of the
coordinates. Note the twilight glow itself no longer exists; `SUN` reports the altitude for
its own sake.

`05-chrome-inventory.png`, in the design companion dir (see below), is the design's own audit of all fourteen
readouts, with a KEEP / MOVE / CUT verdict and a reason for each. Consult it before adding or
removing chrome — several of the CUT verdicts are still unactioned, deliberately.

**Animation runs on anime.js** (`src/lib/motion.ts` re-exports it) — not hand-rolled
`performance.now()` loops.

**Pointer affordances are gated on the input device**, not the viewport: the cursor-gravity
wobble and the hover-to-name readout are skipped when
`(hover: none), (pointer: coarse)` matches. On a touchscreen the wobble bends the sky toward a
stale coordinate and the readout labels wherever the last tap landed.

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

The legibility keep-out (`applyKeepOut` in `render.ts`) erases canvas ink under the READING
COLUMN, feathered on all four sides — not full width. It used to span the viewport, which
erased 45% of every mark including the planet labels and the hover readout out in the empty
margins, where there is no text to protect. `SkyField` measures the column each frame and
passes only numbers, so `render.ts` stays DOM-blind and `scripts/verify-sky.mjs` can import it
under Node.

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

`BaseLayout.astro` wraps every page: the no-FOUC head script and the slot. There is no
ambient glow and no mode toggle — the site is dark only, and a `body::before` radial
gradient was removed because it read as a light source the sky could not account for.

Home (`index.astro`) is two columns — sticky `SideRail.astro` (identity + scroll-spy nav,
one entry per section, currently 7) on the left, scrolling `<main>` on the right.

Cards are **shadcn `Card`** (`src/components/ui/`, added via the CLI — they are the upstream
files, don't hand-edit them). `ExpCard`, `ProjectCard` and `BlogCard` compose
`Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`, with tags as `Badge`. Hover
is a 2px lift plus a border to `--ring`.

Two card details that are easy to break:
- `CardTitle` ships `leading-none`, which collides the moment a title wraps. Every use here
  passes `leading-snug`.
- Preview cards (no body prose) stretch their link over the whole card with
  `after:absolute after:inset-0`, so clicking anywhere opens it. Cards WITH prose deliberately
  do not — an overlay would swallow links inside the body. On `ExpCard` the company link sits
  at `z-10` to stay clickable above the overlay.

Lists that hold cards use `flex flex-col gap-5` (or `grid gap-5 sm:grid-cols-2`), and cards
must be wrapped in `<li>`. CSS columns split a shadcn `Card` across the column break, because
`Card` is a flex container and `break-inside-avoid` does not hold on it.

Pages: `/` (home preview of each section), `/experience` (full), `/archive` (2-col masonry),
`/blogs` (list), `/blogs/[...slug]` (post), `/resume`.

## Companion directories (outside this repo)

Design sources and working plans are deliberately NOT tracked here — a 3.5MB `.fig`
and a set of planning notes do not belong in a public Pages repo. They live at:

```
../projects/adrijshikhar.github.io/design/    # spectral.fig, build scripts, 14 PNG exports
../projects/adrijshikhar.github.io/plans/     # numbered working plans
../projects/adrijshikhar.github.io/docs/      # longer-form notes
```

`05-chrome-inventory.png` in that `design/` dir is the KEEP / MOVE / CUT audit of the
sky chrome, and is worth reading before changing any readout.

## Deployment

Push to the **`content`** branch → `.github/workflows/deploy.yml` builds with Bun and publishes
`dist/` to GitHub Pages (`actions/deploy-pages`). `build.yml` runs the build on PRs into
`content`. PRs target `content`, not `main`/`master`.

Workflow conventions to preserve: **major-version action tags** (e.g. `@v6` — not SHA pins),
**least-privilege `permissions:`** per workflow, and **never interpolate untrusted input into
`run:`** (pass it as an env var). Actions are on the Node-24 majors (checkout v6, setup-node
v6, upload-pages-artifact v5, deploy-pages v5).
