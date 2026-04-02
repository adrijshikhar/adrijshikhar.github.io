# Portfolio

[![Build](https://github.com/adrijshikhar/adrijshikhar.github.io/actions/workflows/build.yml/badge.svg?branch=content)](https://github.com/adrijshikhar/adrijshikhar.github.io/actions/workflows/build.yml)
[![Deploy](https://github.com/adrijshikhar/adrijshikhar.github.io/actions/workflows/deploy.yml/badge.svg?branch=content)](https://github.com/adrijshikhar/adrijshikhar.github.io/actions/workflows/deploy.yml)

Personal portfolio site with a human/machine view toggle — switch between a styled resume and raw markdown.

**Live:** [adrijshikhar.github.io](https://adrijshikhar.github.io)

## Stack

- **Framework:** Astro 6 + React 19
- **Styling:** Tailwind CSS 3 + shadcn/ui
- **Content:** Markdown files (no CMS)
- **Package Manager:** Bun
- **Node:** 22 (via fnm)
- **Deploy:** GitHub Pages via GitHub Actions

## Setup

```bash
fnm install    # Install Node 22 from .node-version
bun install    # Install dependencies
bun run dev    # Start dev server at localhost:4321
```

## Build & Deploy

```bash
bun run build    # Production build to dist/
bun run preview  # Preview locally
```

Pushes to `content` branch auto-deploy via GitHub Actions (`actions/deploy-pages`).

## Content

All content lives in `src/content/` as markdown files — edit those to update the site. Experience and project entries use `<!-- slug -->` comment delimiters to associate descriptions with YAML frontmatter entries.

## Pages

- `/` — Main page with featured experience + projects
- `/experience` — Full work experience archive table
- `/archive` — Full project archive table

## Human/Machine Toggle

The bottom-center toggle switches between:
- **Human mode** — dark minimal layout (Brittany Chiang-inspired) with mouse spotlight, scroll animations, glassmorphism card hover
- **Machine mode** — raw monospace markdown (parallel.ai-inspired) at 640px width with height collapse animation
