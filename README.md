# Portfolio

[![Build](https://github.com/adrijshikhar/adrijshikhar.github.io/actions/workflows/build.yml/badge.svg?branch=content)](https://github.com/adrijshikhar/adrijshikhar.github.io/actions/workflows/build.yml)
[![Deploy](https://github.com/adrijshikhar/adrijshikhar.github.io/actions/workflows/deploy.yml/badge.svg?branch=content)](https://github.com/adrijshikhar/adrijshikhar.github.io/actions/workflows/deploy.yml)

Personal portfolio site — the **Terminal Atelier** design — with a human/machine view toggle (switch between a styled resume and the raw markdown) and system-aware light/dark.

**Live:** [adrijshikhar.github.io](https://adrijshikhar.github.io)

## Stack

- **Framework:** Astro 6 + React 19 (islands)
- **Styling:** Tailwind CSS 3 + shadcn/ui primitives, CSS-variable design tokens
- **Animation:** GSAP (view toggle) + tw-animate-css
- **Fonts:** Geist Variable (UI) + JetBrains Mono (labels)
- **Content:** Markdown files (no CMS)
- **Package Manager:** Bun
- **Node:** 22 (pinned via `.node-version`)
- **Deploy:** GitHub Pages via GitHub Actions

## Setup

```bash
fnm use        # or `fnm install` — Node 22 from .node-version
bun install    # Install dependencies
bun run dev    # Start dev server at localhost:4321
```

## Build & Deploy

```bash
bun run build    # Production build to dist/
bun run preview  # Preview the production build locally
```

Pushes to the `content` branch auto-deploy via GitHub Actions (`actions/deploy-pages`).

## Content

All content lives in `src/content/` as markdown files — edit those to update the site. Experience and project entries use `<!-- slug -->` comment delimiters to associate descriptions with the YAML frontmatter entries.

## Pages

- `/` — Home: featured experience + projects, education, writing, interests
- `/experience` — Full work-experience archive
- `/archive` — Full project archive (2-column masonry)
- `/blogs` — Writing index
- `/blogs/[slug]` — Individual post
- `/resume` — Resume rendered from the content markdown

## Design — Terminal Atelier

A dark-default, light-capable design bridging Swiss-terminal precision with soft, accent-tinted cards.

- **Theme:** light/dark toggle docked top-right. Defaults to the visitor's **system preference** (`prefers-color-scheme`) until they make an explicit choice; `?mode=light` / `?mode=dark` force a mode.
- **Ambient aurora:** warm-gold blurred glows behind the content, mode-aware.
- **Cards:** accent-tinted "atelier" cards with a springy hover lift.

## Human/Machine Toggle

The bottom-center toggle switches the whole page between two views:

- **Human** — the fully styled site.
- **Machine** — the raw monospace markdown that backs the page (`window.__RAW_MARKDOWN__`).

The transition is a parallel.ai-style opacity crossfade (the machine view follows the active light/dark mode, so the canvas never recolors). The machine view is deep-linkable via `?machine=true`, with a no-FOUC head script so it paints correctly on first load. Human/machine content parity is preserved.
