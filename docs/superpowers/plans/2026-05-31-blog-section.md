# Blog (`/blogs`) Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a blog to the portfolio — `/blogs` list + per-post pages (Astro content collections + MDX), a homepage "Writing" entry, and a `?machine=true` deep-link — without changing the existing layout/design. Then cross-post the first article to dev.to and everydev.ai (each its own phase).

**Architecture:** Astro 6 Content Layer collection (`blog`, glob loader + Zod schema) drives `/blogs/index.astro` (list) and `/blogs/[...slug].astro` (post), both wrapped in the existing `BaseLayout`. The homepage gains a Writing preview section + a `SideNav` anchor, mirroring the existing Experience/Projects "see all" pattern. `ViewToggle.tsx` learns to read/write a `machine` URL param. The existing `fs`-based resume content is untouched.

**Tech Stack:** Astro 6, `astro:content` (Content Layer), `@astrojs/mdx`, React (ViewToggle), Tailwind, Bun.

**Spec:** `docs/superpowers/specs/2026-05-31-blog-section-design.md`
**Integration branch:** `content` (CI builds + deploys from it).

---

## STATUS / HANDOFF (updated 2026-06-02)

- **Phase 1 — DONE + live.** All foundation tasks (collection, `/blogs` list + `[...slug]` post,
  homepage Writing section + SideNav anchor, `?machine=true`, first post) shipped — partly with the
  Terminal Atelier redesign (#768) and finalized via **#774** (content branch). First post is live:
  `https://adrijshikhar.dev/blogs/building-an-agentic-era-profile-readme/`. Post is `draft:false`.
  Canonical domain is now **`adrijshikhar.dev`** (custom domain; `.github.io` still resolves).
  - Extras beyond plan: live `ReadmePreview.astro` (build-time fetch of the real README, mode-synced),
    dual-theme Shiki code blocks, optional `cover` banner field. Code-review fixes merged in #774.
  - Tasks 0–7 below are historical — **do not re-run**; verify against `content` before any change.

- **Phase 2 — dev.to: DRAFT created, awaiting author review/publish.**
  - dev.to article **id 3803610**, `published:false`, canonical → `adrijshikhar.dev/blogs/...`,
    tags `showdev, github, webdev, ai`.
  - **dev.to blocks remote SVG** → live typing-banner + Pac-Man render broken. Hero replaced with a
    **retina PNG screenshot** of the rendered README top, hosted at
    `https://raw.githubusercontent.com/adrijshikhar/adrijshikhar/output/readme-top.png`.
  - Body built from the post mdx: strip frontmatter + the `import ReadmePreview` line, replace
    `<ReadmePreview />` with the PNG (linked to GitHub) + a "see full live README" link, keep prose + code.
  - `DEV_TO_API_KEY` is in shell env. API: `POST`/`PUT https://dev.to/api/articles[/{id}]`, header
    `api-key: $DEV_TO_API_KEY`, JSON `{"article":{...}}`. **Remaining:** review in dev.to dashboard,
    flip `published:true` (PUT) when happy.

- **Phase 3 — everydev.ai: pending.** Same finalized post + same canonical + reuse the `readme-top.png`
  asset. No site code.

### Recipe — regenerate the README screenshot (raster, for SVG-blocking platforms)
1. Open the live post `?mode=dark` in chrome-devtools at DPR 2 (`emulate viewport 1000x1500x2`).
2. `evaluate`: isolate `.readme-embed` (replace `document.body.innerHTML` with its `outerHTML` on a
   `#0d1117` wrapper) and `await` ~3.8s so the typing banner shows text.
3. `take_screenshot fullPage` → crop the top with `ffmpeg -i in.png -vf "crop=1980:1120:0:0" out.png`.
4. Push to the `output` branch via `gh api --method PUT repos/adrijshikhar/adrijshikhar/contents/readme-top.png` (base64 content, `branch:output`, include `sha` if updating).

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/content.config.ts` | Define the `blog` content collection (loader + schema) |
| `src/content/blog/building-an-agentic-era-profile-readme.mdx` | First post (draft) |
| `src/pages/blogs/index.astro` | Blog list page (newest first, drafts hidden in prod) |
| `src/pages/blogs/[...slug].astro` | Single post page (renders MDX in BaseLayout) |
| `src/pages/index.astro` | + Writing preview section (modify) |
| `src/components/SideNav.astro` | + "Writing" anchor (modify) |
| `src/components/ViewToggle.tsx` | + read/write `?machine=true` (modify) |

---

# Phase 1 — Blog foundation (code)

Ships the canonical post on `adrijshikhar.github.io`. Done in a worktree off `content`.

## Task 0: Worktree + clean base

**Files:** none (git)

- [ ] **Step 1: Create an isolated worktree off `content`**

The main checkout is on a dirty `feat/resume-ops-output`. Work off `content` in a worktree:
```bash
cd /Users/nemesis/Projects/my-projects/adrijshikhar.github.io
git fetch origin content
git worktree add ../adrijshikhar-blog -b feat/blog-section origin/content
cd ../adrijshikhar-blog
```
Expected: new worktree at `../adrijshikhar-blog` on branch `feat/blog-section`. **All subsequent paths are relative to this worktree.**

- [ ] **Step 2: Install deps + baseline build**

Run: `bun install && bun run build`
Expected: build succeeds (baseline, before changes).

## Task 1: Blog content collection

**Files:**
- Create: `src/content.config.ts`

- [ ] **Step 1: Create the collection config**

Create `src/content.config.ts`:
```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    draft: z.boolean().default(false),
    canonicalUrl: z.string().url().optional(),
  }),
});

export const collections = { blog };
```

- [ ] **Step 2: Verify Astro picks up the collection types**

Run: `bunx astro sync`
Expected: completes without schema errors and regenerates `.astro/` types. (If `astro sync` reports the collection, the loader path is correct.)

- [ ] **Step 3: Commit**
```bash
git add src/content.config.ts
git commit -m "feat(blog): add blog content collection (glob loader + schema)"
```

## Task 2: First post (draft scaffold)

**Files:**
- Create: `src/content/blog/building-an-agentic-era-profile-readme.mdx`

- [ ] **Step 1: Create the post**

Create `src/content/blog/building-an-agentic-era-profile-readme.mdx`:
```mdx
---
title: "Building an agentic-era GitHub profile README"
date: 2026-05-31
description: "A for-humans/for-agents profile: AGENTS.md + llms.txt, live Pac-Man & snake contribution graphs, self-computed stat badges, and an issue-driven Minesweeper — plus a reusable template."
draft: true
canonicalUrl: "https://adrijshikhar.github.io/blogs/building-an-agentic-era-profile-readme"
---

> Draft — refine the prose later.

## Why
Most profile READMEs are written only for humans. I built one that's also **agent-readable**.

## What it does
- **For humans / for agents** layout, with companion `AGENTS.md` and `llms.txt`.
- **Live contribution art** — Pac-Man + snake, regenerated daily by GitHub Actions.
- **Self-computed stat badges** — contributions (rolling-year), followers, repos, years —
  via the GitHub GraphQL API → Shields endpoints (accurate, not calendar-year/public-only skew).
- **Issue-driven Minesweeper** — hardened against command injection.
- A **reusable template** so anyone can adopt it.

## How
<!-- TODO: flesh out with snippets + screenshots before publishing -->

## Try it
- Profile: https://github.com/adrijshikhar/adrijshikhar
- Reuse the template: see the repo's `template/` folder.
```

- [ ] **Step 2: Commit**
```bash
git add src/content/blog/building-an-agentic-era-profile-readme.mdx
git commit -m "content(blog): scaffold first post (draft)"
```

## Task 3: Blog list page

**Files:**
- Create: `src/pages/blogs/index.astro`

- [ ] **Step 1: Create the list page**

Create `src/pages/blogs/index.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

const posts = (await getCollection('blog', ({ data }) => import.meta.env.PROD ? !data.draft : true))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

const fmt = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
---

<BaseLayout title="Writing | Adrij Shikhar">
  <main class="mx-auto min-h-screen max-w-screen-md px-6 py-12 md:px-12 md:py-20">
    <a href="/" class="text-sm text-slate-400 hover:text-accent">← Back</a>
    <h1 class="mt-6 text-3xl font-bold tracking-tight text-slate-200">Writing</h1>
    {posts.length === 0 ? (
      <p class="mt-8 text-slate-400">No posts yet.</p>
    ) : (
      <ul class="mt-8 space-y-8">
        {posts.map((post) => (
          <li class="group">
            <a href={`/blogs/${post.id}`} class="block">
              <div class="text-xs font-semibold uppercase tracking-widest text-slate-500">{fmt(post.data.date)}</div>
              <h2 class="mt-1 text-lg font-medium text-slate-200 group-hover:text-accent">{post.data.title}</h2>
              <p class="mt-1 text-sm leading-normal text-slate-400">{post.data.description}</p>
            </a>
          </li>
        ))}
      </ul>
    )}
  </main>
</BaseLayout>
```

- [ ] **Step 2: Verify it builds + renders in dev**

Run: `bun run dev` then open `http://localhost:4321/blogs`.
Expected: in dev the draft post appears (date · title · description, accent on hover). Stop dev (Ctrl-C).
Note: `text-accent` is the existing theme accent class used elsewhere (see `SideNav.astro`); if the class name differs in this repo, match the existing one.

- [ ] **Step 3: Commit**
```bash
git add src/pages/blogs/index.astro
git commit -m "feat(blog): add /blogs list page"
```

## Task 4: Single post page

**Files:**
- Create: `src/pages/blogs/[...slug].astro`

- [ ] **Step 1: Create the post page**

Create `src/pages/blogs/[...slug].astro`:
```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await render(post);
const fmt = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
---

<BaseLayout title={`${post.data.title} | Adrij Shikhar`}>
  <main class="mx-auto min-h-screen max-w-screen-md px-6 py-12 md:px-12 md:py-20">
    <a href="/blogs" class="text-sm text-slate-400 hover:text-accent">← All posts</a>
    <h1 class="mt-6 text-3xl font-bold tracking-tight text-slate-200">{post.data.title}</h1>
    <div class="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">{fmt(post.data.date)}</div>
    <article class="prose prose-invert mt-8 max-w-none">
      <Content />
    </article>
  </main>
</BaseLayout>
```

- [ ] **Step 2: Verify build emits the post route**

Run: `bun run build`
Expected: build succeeds and the output lists `/blogs/building-an-agentic-era-profile-readme/index.html` is NOT emitted in prod (draft excluded). Run `bun run dev` and open `http://localhost:4321/blogs/building-an-agentic-era-profile-readme` to confirm it renders in dev (drafts visible in dev). Stop dev.
Note: `prose prose-invert` requires `@tailwindcss/typography` (already a dependency). If post body is unstyled, confirm the plugin is enabled in `tailwind.config.mjs`; add it to `plugins` if missing.

- [ ] **Step 3: Commit**
```bash
git add src/pages/blogs/[...slug].astro
git commit -m "feat(blog): add /blogs/[slug] post page"
```

## Task 5: Homepage Writing section + SideNav anchor

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/components/SideNav.astro`

- [ ] **Step 1: Read the existing Experience/Projects section markup**

Run: `sed -n '70,120p' src/pages/index.astro`
Identify the markup pattern used for an existing section (e.g. the `/experience` "see all" block at ~line 85 and `/archive` at ~line 103) and the section wrapper/ids so the new Writing section matches exactly.

- [ ] **Step 2: Add the Writing preview section to `index.astro`**

In the frontmatter, add (near the other `readContent(...)` calls):
```ts
import { getCollection } from 'astro:content';
const latestPosts = (await getCollection('blog', ({ data }) => import.meta.env.PROD ? !data.draft : true))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 3);
```
Then add a Writing section in the body, immediately after the existing Projects/Archive
section, copying that section's wrapper classes and `id`/`Section` usage. Use this inner markup:
```astro
<section id="writing" class="mb-16 scroll-mt-16 md:mb-24 lg:scroll-mt-24" aria-label="Writing">
  <h2 class="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">Writing</h2>
  <ul class="mt-4 space-y-4">
    {latestPosts.map((post) => (
      <li>
        <a href={`/blogs/${post.id}`} class="group inline-flex flex-col">
          <span class="text-xs uppercase tracking-widest text-slate-500">{post.data.date.toLocaleDateString('en-US',{year:'numeric',month:'short'})}</span>
          <span class="font-medium text-slate-200 group-hover:text-accent">{post.data.title}</span>
        </a>
      </li>
    ))}
  </ul>
  <a class="mt-6 inline-flex items-center font-medium leading-tight text-slate-200 group" href="/blogs">
    <span class="border-b border-transparent group-hover:border-accent">View all posts</span>
    <span class="ml-1">→</span>
  </a>
</section>
```
Match the surrounding section's exact wrapper classes if they differ from the above (keep the new section visually consistent with Experience/Projects).

- [ ] **Step 3: Add the Writing anchor to `SideNav.astro`**

In `src/components/SideNav.astro`, add to the `sections` array (after `projects`):
```ts
{ id: 'writing', label: 'Writing' },
```

- [ ] **Step 4: Verify**

Run: `bun run dev`, open `http://localhost:4321/`. Confirm: a Writing section shows the
draft post (dev), the SideNav has a "Writing" link, clicking it scrolls to the section, and
"View all posts →" navigates to `/blogs`. Stop dev.

- [ ] **Step 5: Commit**
```bash
git add src/pages/index.astro src/components/SideNav.astro
git commit -m "feat(blog): homepage Writing section + SideNav anchor"
```

## Task 6: `?machine=true` deep-link in ViewToggle

**Files:**
- Modify: `src/components/ViewToggle.tsx`

- [ ] **Step 1: Read the current toggle**

Run: `cat src/components/ViewToggle.tsx`
Identify the state variable that holds the mode (e.g. `view`/`isMachine`) and the handler
that flips it.

- [ ] **Step 2: Initialize from the URL on mount**

Add an effect that, on mount, sets machine mode when `?machine=true` is present. Using the
component's actual state setter name, add:
```tsx
import { useEffect } from 'react';

// inside the component, after the existing useState:
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('machine') === 'true') {
    setMachine(true); // ← use this component's real setter
  }
}, []);
```
If the mode is represented as a string (`'human' | 'machine'`) rather than a boolean, set it
to `'machine'` instead.

- [ ] **Step 3: Sync the URL when the user toggles**

In the toggle handler, after updating state, reflect it in the URL without navigation:
```tsx
const params = new URLSearchParams(window.location.search);
if (nextIsMachine) params.set('machine', 'true');
else params.delete('machine');
const qs = params.toString();
window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname);
```
`nextIsMachine` is the new mode computed in the handler.

- [ ] **Step 4: Verify**

Run: `bun run dev`. Open `http://localhost:4321/?machine=true` → page loads in machine view.
Toggle to human → URL drops `machine=true`. Toggle back → URL gains `?machine=true`. Reload
the machine-view URL → still machine view. Stop dev.

- [ ] **Step 5: Commit**
```bash
git add src/components/ViewToggle.tsx
git commit -m "feat: support ?machine=true deep-link in ViewToggle"
```

## Task 7: Full verification + PR

**Files:** none

- [ ] **Step 1: Production build (drafts hidden)**

Run: `bun run build`
Expected: succeeds. The draft post route is NOT emitted (grep the build log / `dist/blogs`),
`/blogs/index.html` exists and shows the empty state (since the only post is a draft).
To preview a real published post, temporarily set `draft: false` in the MDX, rebuild, confirm
`/blogs/<slug>/index.html` is emitted, then revert to `draft: true` (it ships published once
the prose is finalized in Phase 2).

- [ ] **Step 2: Confirm existing pages unchanged**

Run: `bun run preview`, spot-check `/`, `/experience`, `/archive`, `/resume` — visually
identical to before aside from the added Writing section. Stop preview.

- [ ] **Step 3: Push + open PR into `content`**

```bash
git push -u origin feat/blog-section
gh pr create --base content --title "feat: add /blogs section + Writing entry + ?machine=true" \
  --body "Adds a blog (Astro content collection + MDX): /blogs list + post pages, homepage Writing section + SideNav anchor, and ?machine=true deep-link. Existing layout/design unchanged. First post scaffolded as a draft. See docs/superpowers/specs/2026-05-31-blog-section-design.md."
```
Expected: PR opened against `content`. CI (`build.yml`) runs; merge once green → `deploy.yml`
publishes to Pages.

- [ ] **Step 4: Clean up the worktree (after merge)**
```bash
cd /Users/nemesis/Projects/my-projects/adrijshikhar.github.io
git worktree remove ../adrijshikhar-blog
git worktree prune
```

---

# Phase 2 — Publish on dev.to

Operational (no site code). Depends on the Phase-1 post prose being finalized and the post
flipped to `draft: false` + deployed (so the canonical URL is live).

- [ ] **Step 1: Finalize the post prose** in
  `src/content/blog/building-an-agentic-era-profile-readme.mdx` (fill the `<!-- TODO -->`
  sections with snippets + screenshots), set `draft: false`, ship via a PR into `content`.
- [ ] **Step 2: Confirm canonical is live:**
  `curl -sI https://adrijshikhar.github.io/blogs/building-an-agentic-era-profile-readme | head -1`
  → `HTTP/2 200`.
- [ ] **Step 3: Cross-post to dev.to.** In the dev.to editor (or via the dev.to API with a
  `DEV_API_KEY`), paste the post markdown. In the front matter set
  `canonical_url: https://adrijshikhar.github.io/blogs/building-an-agentic-era-profile-readme`
  and tags `showdev, github, webdev`. Publish.
- [ ] **Step 4: Verify** the dev.to post shows "Originally published at adrijshikhar.github.io"
  (canonical respected). Record the dev.to URL.

---

# Phase 3 — Publish on everydev.ai

Operational (no site code). Same finalized post.

- [ ] **Step 1: Create the post on [everydev.ai](https://www.everydev.ai/)** — paste the
  finalized markdown.
- [ ] **Step 2: Set the canonical URL** to
  `https://adrijshikhar.github.io/blogs/building-an-agentic-era-profile-readme` (use the
  platform's canonical/SEO field if available; if not, add a "Originally published at …"
  line at the top linking the canonical).
- [ ] **Step 3: Publish; record the everydev.ai URL.**
- [ ] **Step 4 (optional distribution):** share on Reddit r/github, Hacker News (Show HN),
  LinkedIn/X.

---

## Reusable blog-post template

To write a new post, copy `src/content/blog/_template.mdx` (below) to
`src/content/blog/<slug>.mdx`, fill it in, and set `draft: false` when ready to publish. The
`<slug>` becomes the URL (`/blogs/<slug>`) — use kebab-case.

```mdx
---
title: "<Post title — sentence case>"
date: <YYYY-MM-DD>            # publish/authored date; drives list ordering (newest first)
description: "<1–2 sentence summary — shown on /blogs and used for SEO/social>"
draft: true                  # true = hidden in prod builds, visible in `bun run dev`; flip to false to ship
canonicalUrl: "https://adrijshikhar.github.io/blogs/<slug>"   # for cross-post rel=canonical
---

<!-- Opening hook: 2–4 sentences. Lead with the problem/tension, not "In this post I…". -->

## <Section — the "why" or context>

<!-- Prose. Keep paragraphs tight. -->

## <Section — the "what/how">

<!-- Code fences get Shiki highlighting automatically. Keep snippets short + load-bearing. -->

\`\`\`ts
// minimal, illustrative — not the whole file
\`\`\`

## <Section — a decision or tradeoff worth dwelling on>

<!-- The part readers remember: a removed feature, a gotcha, a security boundary, a perf cut. -->

## Try it

- **Link 1:** <repo / demo>
- **Link 2:** <related resource>

<!-- Closing: one forward-looking line. -->
```

**Conventions**
- **Slug = filename** (`my-post.mdx` → `/blogs/my-post`); kebab-case, stable (it's the URL).
- **`draft`** — keep `true` while writing (visible in `dev`, hidden in prod); flip to `false` in
  the shipping PR. The `/blogs` list + homepage Writing section filter drafts in prod automatically.
- **`description`** — write it for a human skimming `/blogs`; it's the only preview text.
- **MDX** — plain Markdown works; you may also import/use components if a post needs them.
- **Images** — put under `public/` and reference with an absolute path (`/img/...`).
- **Cross-posting** — once live, set the same `canonicalUrl` on dev.to / everydev.ai (Phases 2–3).

> **Don't commit the skeleton as a `.mdx` in `src/content/blog/`** unless you also exclude it
> from the loader: the glob (`**/*.{md,mdx}`) + `getStaticPaths` pick up *every* file
> regardless of `draft`, so a `_template.mdx` would emit a real `/blogs/_template` route. Keep
> the template here in the plan (copy from above), or, if you want a committed file, change the
> loader pattern to ignore underscore-prefixed files (e.g. `['**/!(_)*.{md,mdx}']`) first.

---

## Self-Review (plan author)

- **Spec coverage:** collection (T1) · /blogs list (T3) · post page (T4) · homepage Writing +
  SideNav (T5) · ?machine=true (T6) · first post scaffold (T2) · worktree off `content` (T0) ·
  verification (T7) · dev.to phase (Phase 2) · everydev.ai phase (Phase 3) · canonical/crosspost
  noted in post frontmatter (T2 `canonicalUrl`). All spec sections mapped.
- **Placeholders:** the only `<!-- TODO -->` is inside the *draft blog content* (intentional —
  author refines prose in Phase 2), not in implementation steps. No vague impl steps.
- **Consistency:** `post.id` (glob-loader slug) used consistently in T3/T4/T5; `getCollection('blog', filter)`
  draft filter identical across T3/T5; `text-accent`/`slate-*` classes flagged to match the
  repo's existing tokens.
- **Astro API caveat:** Content Layer (`glob` loader, `render()`, `post.id`) is Astro 5/6;
  `astro sync` (T1 S2) + the build steps validate against the installed version.
