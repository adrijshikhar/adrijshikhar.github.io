# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev       # Start dev server at localhost:4321
bun run build     # Production build to dist/
bun run preview   # Preview production build locally
```

Node version managed via fnm (`.node-version` → Node 22).

## Architecture

Astro 6 static site with React 19 for interactive islands. Tailwind CSS 3 (native slate palette) + shadcn/ui for styling. Content lives in markdown files, not components.

### Content System

Seven markdown files in `src/content/` drive the entire site:

- `about.md`, `skills.md`, `achievements.md`, `interests.md` — YAML frontmatter + markdown body
- `education.md` — YAML `entries` array, no body
- `experience.md`, `projects.md` — **slug-based splitting**: YAML `entries` array in frontmatter, body split by `<!-- slug-name -->` HTML comment delimiters

The slug-splitting pattern in `index.astro`:
```
---
entries:
  - slug: hevo-senior
    position: "Senior Software Engineer"
    ...
---

<!-- hevo-senior -->
Description content here...

<!-- hevo-intern -->
Next entry content...
```

`splitBySlug()` regex splits on `<!-- slug -->` comments to map each slug to its markdown content. Frontmatter metadata + slug body are combined to render cards.

### Pages

- `/` — Main page. Shows Hevo senior role (1 entry), top 2 projects, education, achievements, interests.
- `/experience` — Full work experience table (all entries).
- `/archive` — Full project archive table with Year, Project, Description, Built with, Link columns.

### Human/Machine Toggle

`ViewToggle.tsx` is the only React island (`client:load`). It toggles between:
- **Human mode**: Styled two-column layout (sticky left sidebar + scrolling right content)
- **Machine mode**: Raw markdown at 640px max-width, monospace, parallel.ai-inspired palette (#101010 bg, #858483 text, #fb631b links)

Toggle uses parallel.ai-style height collapse animation. Raw markdown assembled at build time via `<script define:vars>`.

### Layout

Brittany Chiang-inspired: `lg:flex` two-column, left `<header>` is `lg:sticky lg:top-0 lg:max-h-screen`, right `<main>` scrolls. Cards use absolute overlay div for glassmorphism hover (`bg-slate-800/50 + inset shadow + drop-shadow`). Sibling cards dim on hover (`group-hover/list:opacity-50`).

### Color Palette

Uses native Tailwind slate scale — no custom color overrides except `accent` (#64ffda) and `navy` (alias for slate-900).

Human mode: `bg-slate-900` (#0f172a), `text-slate-400` (#94a3b8), headings `text-slate-200` (#e2e8f0), accent `#64ffda`
Machine mode: `#101010` bg, `#858483` text, `#d6d6d5` headings, `#fb631b` links

### Animations

- Mouse spotlight: radial gradient follows cursor (`rgba(29, 78, 216, 0.15)`)
- Section fade-in on scroll via IntersectionObserver
- Smooth scroll (`scroll-behavior: smooth`)
- Card hover: glassmorphism overlay with inset shadow
- Human/machine toggle: height collapse + opacity crossfade

### Key Files

- `src/pages/index.astro` — main page, reads all content, assembles raw markdown, spotlight + scroll animations
- `src/pages/archive.astro` — full project table
- `src/pages/experience.astro` — full experience table
- `src/components/SideNav.astro` — sticky sidebar with scroll-spy
- `src/components/ViewToggle.tsx` — React toggle with height collapse animation
- `src/components/ExpCard.astro` — experience card with grid layout + hover overlay
- `src/components/ProjectCard.astro` — project card with grid layout + hover overlay
- `src/styles/machine.css` — machine mode transitions and palette
- `src/styles/globals.css` — Tailwind base, smooth scroll, dark theme
- `tailwind.config.mjs` — accent color, fonts (Inter/JetBrains Mono), typography plugin

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) triggers on push to `content` branch. Uses `actions/setup-node` + `oven-sh/setup-bun`. Deploys via `actions/deploy-pages@v4`. Pages source set to "GitHub Actions" in repo settings.

Build CI (`.github/workflows/build.yml`) runs on PRs and `feat/**` branches.
