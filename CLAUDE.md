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

No test or lint scripts exist. Prettier is a dependency but is not wired to a script. The
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

`src/styles/globals.css` defines all design tokens as CSS variables on `:root`. Mode and
accent are token-set overrides, not per-element styles:
- `:root[data-mode="light"]` overrides the foundation tokens for light mode.
- `[data-theme="…"]` (parallel/teal/rausch/violet/hyperlink/signal) overrides the accent
  (+ aurora) tokens, re-tuned per mode to hold AA contrast.

Light/dark **defaults to the system preference** (`prefers-color-scheme`) until the user makes
an explicit choice; `ModeToggle.tsx` persists `mode` to `localStorage` (explicit choice wins)
and follows live OS changes while unset. A **no-FOUC inline head script** in `BaseLayout.astro`
sets `data-mode`/`data-theme` before first paint; `?mode=light|dark` is a URL override. Mode
swaps are made atomic via a one-frame `.mode-switching { transition: none }` class to avoid
gradient/heading flicker. Tailwind color utilities map to these vars in `tailwind.config.mjs`,
so prefer token classes (`bg-surface`, `text-muted`, `border-border`) over raw colors.

Gotcha: Tailwind's `/opacity` modifier does **not** compile against CSS-var colors
(`bg-foo/70` renders invisible) — use solid token colors.

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
