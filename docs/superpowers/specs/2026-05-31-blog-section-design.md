# Design: Add a Blog (`/blogs`) to the Portfolio

**Date:** 2026-05-31
**Repo:** `adrijshikhar/adrijshikhar.github.io` (Astro 6 + React 19 + Tailwind 3 + MDX, deployed to GitHub Pages)
**Integration branch:** `content` (CI `build.yml`/`deploy.yml` trigger on `branches: [content]`; deploy publishes `dist` to Pages). Execution happens in a git worktree branched off `content`.
**Status:** Approved — ready for implementation planning

## Goal

Add a blog to the existing resume/portfolio site: a `/blogs` list page and per-post pages,
plus a "Writing" entry point on the homepage — **without changing the existing layout or
visual design**. First post = a writeup of the agentic-era GitHub profile README project.

## Scope

**In scope**
1. **Blog content collection** (Astro content collections + MDX).
2. **`/blogs`** list page + **`/blogs/[...slug]`** post pages, styled with the existing
   `BaseLayout` and dark theme — no redesign.
3. **Homepage "Writing" section** (latest 2-3 posts + "View all posts →"), mirroring the
   existing Experience/Projects "see all" pattern, plus a **"Writing"** anchor in `SideNav`.
4. **`?machine=true` deep-link** — visiting any page with `?machine=true` starts in the
   existing machine (raw-markdown) view; toggling the human/machine `ViewToggle` keeps the
   URL param in sync. On-brand with the "for humans / for agents" identity.
5. **First post scaffold** — `building-an-agentic-era-profile-readme.mdx` as a structured
   draft (prose refined later by the author).

**Explicitly deferred (NOT in this scope)**
- The 4 color themes / theme switcher (Default slate+teal, Terminal Green, Mono+Blue, Warm
  Stone+Amber) — parked for a later iteration.
- Any homepage redesign (bento / split / single-column rework) — the original layout stays.
- Standard-blog extras: tags, RSS, reading time, prev/next, search.

## Cross-posting (content distribution — not code)

The blog post will be published in multiple places. The site is the **canonical** source;
cross-posts set `rel=canonical` back to the site URL.
- **Canonical:** `https://adrijshikhar.github.io/blogs/<slug>` (this site).
- **Cross-post targets:** [dev.to](https://dev.to/adrijshikhar) (`#showdev`) and
  **[everydev.ai](https://www.everydev.ai/)**.
- Distribution (manual): Reddit r/github, Hacker News, LinkedIn/X.

(No code is required for cross-posting; this section documents the publishing workflow so
the post's frontmatter can carry a `canonicalUrl`/`crossposts` note if desired.)

## Architecture / components

### Content model — `src/content.config.ts`
Define a `blog` collection with a Zod schema:
- `title: string`
- `date: Date`
- `description: string`
- `draft: boolean` (default `false`) — drafts hidden in production builds
- `canonicalUrl?: string` — optional, for cross-post canonical reference

Posts live in `src/content/blog/<slug>.mdx`.

> Note: the existing resume content (`src/content/*.md`) is read via `fs` + `gray-matter`
> and is intentionally left untouched. The blog uses Astro content collections (the
> idiomatic API) so it stays isolated from that loose-markdown code.

### Pages
- `src/pages/blogs/index.astro` — `getCollection('blog')`, filter out drafts in prod, sort
  by `date` desc, render a list of rows (date · title · description) using the existing card
  / hover styling. Wrapped in `BaseLayout`.
- `src/pages/blogs/[...slug].astro` — `getStaticPaths()` from the collection; renders the
  post body (MDX → prose) with title, date, a back-to-/blogs link. Wrapped in `BaseLayout`.

### Homepage integration (`src/pages/index.astro` + `SideNav.astro`)
- Add a **Writing** section to the homepage: `getCollection('blog')` → latest 2-3
  non-draft posts as a short list, plus a "View all posts →" link to `/blogs`. Placed and
  styled like the existing Experience/Projects preview sections.
- Add `{ id: 'writing', label: 'Writing' }` to the `SideNav` in-page anchor list.

### `?machine=true` (extends existing `ViewToggle.tsx`)
- On mount, read `URLSearchParams`; if `machine=true`, initialize in machine view.
- When the user toggles, update the URL (`history.replaceState`) to add/remove
  `machine=true` so the state is shareable/deep-linkable.
- Applies to the pages that have the human/machine toggle (the resume/home view). No change
  to the machine view's styling.

## Error handling / edge cases
- **No posts / empty collection:** `/blogs` and the homepage Writing section render an
  empty-state ("No posts yet"); the build must not fail.
- **Drafts:** excluded when `import.meta.env.PROD`; visible in `dev`.
- **Bad slug:** `getStaticPaths` only emits real posts → unknown slugs 404 (Astro default).
- **`?machine=true` with no toggle on a page:** param is ignored gracefully.

## Verification
1. `bun run build` (or `npm run build`) succeeds with the new collection + pages.
2. `/blogs` lists the first post; `/blogs/<slug>` renders it; back-link works.
3. Homepage shows the Writing section + working "View all posts →"; `SideNav` has the
   Writing anchor and it scrolls to the section.
4. `?machine=true` loads the machine view directly; toggling updates the URL.
5. Drafts hidden in a production build, visible in `dev`.
6. Existing pages (resume/home/experience/archive) unchanged visually.

## Risks / notes
- Working tree is currently dirty on `feat/resume-ops-output`; all blog work happens in a
  fresh worktree off `content` to keep it isolated.
- Introducing content collections adds `src/content.config.ts`; ensure it doesn't conflict
  with the existing `fs`-based content reading (different directory: `src/content/blog/`).
- Astro 6 content-collections API (`getCollection`, `render`) — confirm exact import paths
  against the installed Astro version during implementation.
