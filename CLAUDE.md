# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev       # Start dev server at localhost:4321
bun run build     # Production build to dist/
bun run preview   # Preview production build locally
bun run deploy    # Deploy dist/ to GitHub Pages (master branch)
```

Node version managed via fnm (`.node-version` → Node 22).

## Architecture

Astro 6 static site with React 19 for interactive islands. Tailwind CSS 3 + shadcn/ui for styling. Content lives in markdown files, not components.

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

### Human/Machine Toggle

`ViewToggle.tsx` is the only React island (`client:load`). It toggles between:
- **Human mode**: Styled two-column layout (sticky left sidebar + scrolling right content)
- **Machine mode**: Raw markdown at 640px max-width, monospace, parallel.ai-inspired dark grey palette (#101010 bg, #858483 text, #fb631b links)

Raw markdown is assembled at build time in `index.astro` and injected via `<script define:vars={{ rawMarkdown }}>`. No runtime fetch — toggle is instant CSS class swap with height/opacity animation.

### Layout

Brittany Chiang-inspired: `lg:flex` two-column, left `<header>` is `lg:sticky lg:top-0 lg:max-h-screen`, right `<main>` scrolls. Sidebar has IntersectionObserver scroll-spy for nav highlighting.

### Color Palette

Human mode: navy `#0a192f`, slate text `#8892b0`, headings `#ccd6f6`, accent `#64ffda`
Machine mode: grey `#101010`, text `#858483`, headings `#d6d6d5`, links `#fb631b`

### Key Files

- `src/pages/index.astro` — reads all content, renders everything, assembles raw markdown
- `src/components/SideNav.astro` — sticky sidebar with scroll-spy
- `src/components/ViewToggle.tsx` — React toggle with animated height collapse
- `src/styles/machine.css` — machine mode transitions and palette
- `src/styles/globals.css` — Tailwind config, base dark theme
- `tailwind.config.mjs` — custom colors (navy/slate/accent), fonts (Inter/JetBrains Mono)

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) triggers on push to `content` branch. Uses fnm + bun. Deploys via `actions/deploy-pages@v4`. Pages source must be set to "GitHub Actions" in repo settings.
