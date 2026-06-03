# Blog (`/blogs`) Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a blog on the portfolio (`/blogs` list + per-post pages, homepage "Writing" entry, `?machine=true` deep-link), then cross-post the first article to dev.to and everydev.ai with the site as canonical.

**Architecture:** Astro 6 Content Layer collection (`blog`, glob loader + Zod schema) drives `/blogs/index.astro` (list) and `/blogs/[...slug].astro` (post), both wrapped in `BaseLayout`. The homepage gains a Writing preview + `SideNav` anchor; `ViewToggle.tsx` reads/writes a `machine` URL param. The `fs`-based resume content is untouched. Cross-posting is operational (no site code) — the site URL is canonical, cross-posts set `rel=canonical` back to it.

**Tech Stack:** Astro 6, `astro:content` (Content Layer), `@astrojs/mdx`, React (ViewToggle), Tailwind 3, Bun. dev.to API (`api-key` header), GitHub `output` branch for hosted raster assets.

**Spec:** `docs/superpowers/specs/2026-05-31-blog-section-design.md`
**Integration branch:** `content` (CI `build.yml`/`deploy.yml` trigger on `branches: [content]`; deploy publishes `dist/` to Pages).

---

## STATUS / HANDOFF (updated 2026-06-02)

- **Phase 1 — Blog foundation: DONE + live.** Shipped on `content` (partly with the Terminal Atelier
  redesign #768, finalized in #774). First post live at
  `https://adrijshikhar.dev/blogs/building-an-agentic-era-profile-readme/` (200), `draft:false`.
  Canonical domain is now **`adrijshikhar.dev`** (custom domain; `.github.io` still resolves).
  Tasks 1–7 below are a **historical record — do not re-run.** Verify against `content` before any change.
  - Extras beyond the original plan: `ReadmePreview.astro` (build-time fetch of the real README,
    mode-synced light/dark), dual-theme Shiki code blocks, optional `cover` banner field.

- **Phase 2 — dev.to: DRAFT created, awaiting author review/publish.** This is the next actionable work.
  - Article **id 3803610**, `published:false`, canonical → `adrijshikhar.dev/blogs/...`,
    tags `showdev, github, webdev, ai`, hero = retina PNG screenshot.
  - **dev.to blocks remote SVG** → the live typing-banner + Pac-Man render broken. Hero uses a
    raster PNG instead, hosted at
    `https://raw.githubusercontent.com/adrijshikhar/adrijshikhar/output/readme-top.png`.
  - `DEV_TO_API_KEY` is in the shell env.

- **Phase 3 — everydev.ai: pending.** Same finalized post, same canonical, reuse `readme-top.png`. No site code.
- **Phase 4 — Hashnode: pending.** Same finalized post + canonical (Hashnode GraphQL API or editor). No site code.
- **Phase 5 — HackerNoon: pending.** Editorial submission with canonical. No site code.
- **Phase 6 — Medium: pending.** Import-story (auto-canonical) or canonical field. No site code.

All cross-post phases (2–6) share one rule: **the site is canonical**, every platform sets
`rel=canonical` → `https://adrijshikhar.dev/blogs/building-an-agentic-era-profile-readme`, and the hero
uses the raster **`readme-top.png`** (never the live SVG banner/Pac-Man — most platforms block or
mangle remote SVG).

### Post 2 — `retry-thread-pool` (added 2026-06-03)

Second post: **introduces the `retry-thread-pool` Java library** (greenfield framing — a brand-new
library that brings retries to the thread-pool level; never frame it as fixing prior/internal code).
Angle blends "introducing the library" with the site's **for-humans/for-agents** brand: the library's
repo is itself **agent-first** (`llms.txt` + `AGENTS.md` + `docs/AI_USAGE.md` + docs-as-compilable-tests),
so AI agents can read the examples and implement against it correctly.

- **Site post — DONE (in this worktree).** `src/content/blog/retry-thread-pool.mdx`, `draft:false`,
  canonical `https://adrijshikhar.dev/blogs/retry-thread-pool`. Plain MDX (no custom components, no
  cover) — `bun run build` emits `/blogs/retry-thread-pool/`. Ships on merge of
  `docs/blog-handoff-update` → `content`.
- **dev.to — DRAFT created on the API, awaiting author review/publish.** Article **id 3812186**,
  `published:false`, canonical → `https://adrijshikhar.dev/blogs/retry-thread-pool`, tags
  `java, opensource, webdev, ai`. Source of truth for the body is
  `docs/crossposts/retry-thread-pool.devto.md` (code-only — **no SVG/hero constraint**; the
  readme-top.png raster rule applies to Post 1 only). **Remaining:** review in the dev.to dashboard,
  then flip `published:true` (PUT) — see Phase 7 Task 16 Step 3.
- everydev.ai / Hashnode / HackerNoon / Medium: same canonical-back-to-site rule if cross-posted later.

---

## File Structure

| File | Responsibility | State |
|------|----------------|-------|
| `src/content.config.ts` | `blog` collection (glob loader + Zod schema) | shipped |
| `src/content/blog/building-an-agentic-era-profile-readme.mdx` | First post | shipped (`draft:false`) |
| `src/pages/blogs/index.astro` | Blog list (newest first, drafts hidden in prod) | shipped |
| `src/pages/blogs/[...slug].astro` | Single post page (MDX in BaseLayout) | shipped |
| `src/pages/index.astro` | Homepage Writing preview section | shipped |
| `src/components/SideNav.astro` | "Writing" anchor | shipped |
| `src/components/ViewToggle.tsx` | `?machine=true` read/write | shipped |
| `src/components/ReadmePreview.astro` | Build-time README embed, mode-synced | shipped |
| `src/content/blog/retry-thread-pool.mdx` | Post 2 — retry-thread-pool library | done (`draft:false`, this worktree) |
| `docs/crossposts/retry-thread-pool.devto.md` | Post 2 dev.to draft (file; not yet on API) | done (this worktree) |

---

# Phase 1 — Blog foundation (code) — DONE

> **Historical record.** All tasks shipped on `content` (#768 + #774). Do not re-execute. Listed so
> the canonical structure is recoverable and a fresh worker understands what exists.

- **Task 1 — `blog` content collection** (`src/content.config.ts`): `defineCollection` with `glob`
  loader over `./src/content/blog`, Zod schema `{ title, date (coerce), description, draft (default
  false), canonicalUrl? (url), cover? }`. Validated with `bunx astro sync`.
- **Task 2 — First post** (`building-an-agentic-era-profile-readme.mdx`): frontmatter + prose,
  `canonicalUrl` → site URL, embeds `<ReadmePreview />`. Now `draft:false`.
- **Task 3 — `/blogs` list** (`src/pages/blogs/index.astro`): `getCollection('blog', filter)` hides
  drafts in prod (`import.meta.env.PROD ? !data.draft : true`), sorts by `date` desc, empty-state
  when no posts. Styled with the atelier card shell.
- **Task 4 — `/blogs/[...slug]`** (`src/pages/blogs/[...slug].astro`): `getStaticPaths()` from the
  collection, `render(post)` → `<Content />`, banner → title → subheading → date meta. Dual Shiki
  themes switched by `[data-mode]`.
- **Task 5 — Homepage Writing + SideNav** (`src/pages/index.astro`, `src/components/SideNav.astro`):
  latest 3 non-draft posts preview + "View all posts →"; `{ id: 'writing', label: 'Writing' }` anchor.
- **Task 6 — `?machine=true`** (`src/components/ViewToggle.tsx`): init machine view from the URL param
  on mount; `history.replaceState` keeps the param in sync on toggle. No-FOUC head script (`.machine-boot`).
- **Task 7 — Verify + PR:** prod build hides drafts; existing pages visually unchanged; PR → `content`
  → CI deploy. Code-review fixes landed in #774 (human/machine parity order, `color-mix` for token
  opacity, scroll-spy `#interests` fix, `?machine=true` no-FOUC script).

---

# Phase 2 — Publish on dev.to

Operational (no site code). The dev.to draft already exists (id **3803610**, `published:false`). This
phase reviews and publishes it. Depends on the Phase-1 canonical being live (it is).

## Task 8: Confirm canonical + draft state

**Files:** none

- [ ] **Step 1: Confirm the canonical post is live**

Run:
```bash
curl -sI https://adrijshikhar.dev/blogs/building-an-agentic-era-profile-readme/ | head -1
```
Expected: `HTTP/2 200`.

- [ ] **Step 2: Fetch the current dev.to draft and confirm its fields**

Run:
```bash
curl -s -H "api-key: $DEV_TO_API_KEY" https://dev.to/api/articles/3803610 \
  | python3 -c 'import sys,json; a=json.load(sys.stdin); print(a["title"]); print("published:",a["published"]); print("canonical:",a.get("canonical_url")); print("tags:",a.get("tag_list"))'
```
Expected: `published: False`; `canonical_url` → `https://adrijshikhar.dev/blogs/building-an-agentic-era-profile-readme`; tags include `showdev, github, webdev, ai`.

## Task 9: Verify the draft body renders (SVG-free)

**Files:** none

- [ ] **Step 1: Confirm the hero PNG is reachable**

Run:
```bash
curl -sI https://raw.githubusercontent.com/adrijshikhar/adrijshikhar/output/readme-top.png | head -1
```
Expected: `HTTP/2 200`. (dev.to blocks remote SVG — the body must use this raster, not the live SVG banner/Pac-Man.)

- [ ] **Step 2: Preview the draft in the dev.to dashboard**

Open the dev.to draft (id 3803610) in the editor/preview. Confirm: hero PNG shows, no broken-image
placeholders, prose + code blocks render, the "see full live README" link points to the GitHub profile.

## Task 10: Publish

**Files:** none

- [ ] **Step 1: Flip `published` to true** (after author is happy with the preview)

Run:
```bash
curl -s -X PUT -H "api-key: $DEV_TO_API_KEY" -H "Content-Type: application/json" \
  -d '{"article":{"published":true}}' \
  https://dev.to/api/articles/3803610 \
  | python3 -c 'import sys,json; a=json.load(sys.stdin); print("published:",a["published"]); print("url:",a["url"])'
```
Expected: `published: True`; prints the live dev.to URL.

- [ ] **Step 2: Verify canonical is respected**

Open the published dev.to URL. Confirm it shows "Originally published at adrijshikhar.dev". Record the URL.

---

# Phase 3 — Publish on everydev.ai

Operational (no site code). Same finalized post, same canonical, reuse the `readme-top.png` asset.

## Task 11: Cross-post to everydev.ai

**Files:** none

- [ ] **Step 1: Create the post on [everydev.ai](https://www.everydev.ai/)**

Paste the finalized post markdown (the dev.to body — SVG-free, PNG hero). Use the platform editor.

- [ ] **Step 2: Set the canonical URL**

Set the platform's canonical/SEO field to
`https://adrijshikhar.dev/blogs/building-an-agentic-era-profile-readme`. If no canonical field exists,
add an "Originally published at https://adrijshikhar.dev/blogs/building-an-agentic-era-profile-readme"
line at the top.

- [ ] **Step 3: Publish + record the URL.**

---

# Phase 4 — Publish on Hashnode

Operational (no site code). Same finalized post, same canonical, reuse `readme-top.png`. Hashnode has a
GraphQL API (`https://gql.hashnode.com/`, header `Authorization: <PAT>`) — or use the editor.

## Task 12: Cross-post to Hashnode

**Files:** none

- [ ] **Step 1: Create the draft** — paste the SVG-free post markdown (PNG hero) into the Hashnode
  editor, or `publishPost` via the GraphQL API.
- [ ] **Step 2: Set the canonical URL** — Hashnode supports it natively: in **Post settings → SEO →
  "Original/Canonical URL"**, set
  `https://adrijshikhar.dev/blogs/building-an-agentic-era-profile-readme`. (API: `originalArticleURL`
  on the `PublishPostInput`.)
- [ ] **Step 3: Set tags** (`github`, `webdev`, `ai`), cover image = the README PNG, then publish.
- [ ] **Step 4: Verify** the published post shows the canonical points back to `adrijshikhar.dev`.
  Record the Hashnode URL.

---

# Phase 5 — Publish on HackerNoon

Operational (no site code). HackerNoon is editorial — submit a draft, an editor reviews before it goes
live. Canonical is supported.

## Task 13: Cross-post to HackerNoon

**Files:** none

- [ ] **Step 1: Create the story** in the HackerNoon editor — paste the SVG-free markdown (PNG hero).
- [ ] **Step 2: Set the canonical URL** — in the story settings, set the "Canonical / Original URL" to
  `https://adrijshikhar.dev/blogs/building-an-agentic-era-profile-readme`.
- [ ] **Step 3: Pick categories/tags** (programming, github, ai), set the feature/cover image = README
  PNG, submit for editorial review.
- [ ] **Step 4: After approval, verify** the canonical resolves to `adrijshikhar.dev`. Record the URL.

---

# Phase 6 — Publish on Medium

Operational (no site code). Prefer Medium's **Import Story** — it pulls the live canonical post and sets
`rel=canonical` automatically, so the original stays attributed.

## Task 14: Cross-post to Medium

**Files:** none

- [ ] **Step 1: Import the story** — Medium → **Stories → Import a story** → paste
  `https://adrijshikhar.dev/blogs/building-an-agentic-era-profile-readme`. Medium fetches the content
  and sets the canonical automatically.
  - Fallback (manual paste): if import mangles the layout, paste the markdown and set the canonical via
    **⋯ → Story settings → Advanced settings → "Canonical link"** =
    `https://adrijshikhar.dev/blogs/building-an-agentic-era-profile-readme`.
- [ ] **Step 2: Fix the hero** — confirm the README PNG renders (Medium handles PNG fine; drop any
  remaining SVG). Add tags (Programming, GitHub, AI).
- [ ] **Step 3: Publish; verify** the story footer reads "Originally published at adrijshikhar.dev".
  Record the Medium URL.

---

# Phase 7 — Post 2: `retry-thread-pool` + dev.to

Second article (see "Post 2" in STATUS/HANDOFF). The site post is written in this worktree; this
phase ships it and publishes the dev.to cross-post.

## Task 15: Ship the site post — DONE (in this worktree)

**Files:** `src/content/blog/retry-thread-pool.mdx`

- [x] **Step 1:** Post written, `draft:false`, canonical `https://adrijshikhar.dev/blogs/retry-thread-pool`.
- [x] **Step 2:** `bun run build` emits `/blogs/retry-thread-pool/index.html` (build verified — 7 pages).
- [x] **Step 3:** Merged `docs/blog-handoff-update` → `content` (PR #780, squash). CI deployed.
  `curl -sI https://adrijshikhar.dev/blogs/retry-thread-pool/` → `HTTP/2 200` (verified, live).

## Task 16: Publish on dev.to

**Files:** `docs/crossposts/retry-thread-pool.devto.md` (source of truth for the body)

Depends on Task 15 Step 3 (canonical post live). The draft body is code-only — **no SVG/hero
constraint** (the `readme-top.png` rule is Post-1-specific).

- [x] **Step 1: Created the dev.to article from the draft file** — article **id 3812186**,
  `published:false`, canonical → the site post, tags `java, opensource, webdev, ai`. Command used:
  ```bash
  curl -s -X POST -H "api-key: $DEV_TO_API_KEY" -H "Content-Type: application/json" \
    -d "$(python3 - <<'PY'
import json
raw = open("docs/crossposts/retry-thread-pool.devto.md").read()
_, fm, body = raw.split("---", 2)
meta = {}
for line in fm.strip().splitlines():
    if line.startswith("#") or ":" not in line: continue
    k, v = line.split(":", 1); meta[k.strip()] = v.strip().strip('"')
print(json.dumps({"article": {
    "title": meta["title"],
    "body_markdown": body.strip(),
    "published": False,
    "canonical_url": meta["canonical_url"],
    "tags": [t.strip() for t in meta["tags"].split(",")],
}}))
PY
)" \
    https://dev.to/api/articles \
    | python3 -c 'import sys,json; a=json.load(sys.stdin); print("id:",a["id"]); print("published:",a["published"]); print("canonical:",a.get("canonical_url"))'
  ```
  Expected: prints a new article `id`, `published: False`, canonical → the site post. **Record the id**
  here in the plan.
- [ ] **Step 2: Review** the draft in the dev.to dashboard — prose + code blocks render, canonical
  shows "Originally published at adrijshikhar.dev".
- [ ] **Step 3: Publish** when happy — `PUT https://dev.to/api/articles/{id}` with
  `{"article":{"published":true}}`; record the live URL.

## Task 17 (optional): Cross-post Post 2 further

everydev.ai / Hashnode / HackerNoon / Medium — same canonical-back-to-site rule as Phases 3–6, reusing
the dev.to body. Code-only post, so no raster-hero constraint. Pursue only if desired.

---

## Recipe — regenerate the README screenshot (raster, for SVG-blocking platforms)

Reuse this if the hosted PNG needs refreshing (the live README changed).

1. Open the live post `?mode=dark` in chrome-devtools at DPR 2 (`emulate viewport 1000x1500x2`).
2. `evaluate`: isolate `.readme-embed` (replace `document.body.innerHTML` with its `outerHTML` on a
   `#0d1117` wrapper) and `await` ~3.8s so the typing banner shows text.
3. `take_screenshot fullPage` → crop the top: `ffmpeg -i in.png -vf "crop=1980:1120:0:0" out.png`.
4. Push to the `output` branch:
   `gh api --method PUT repos/adrijshikhar/adrijshikhar/contents/readme-top.png` (base64 `content`,
   `branch:output`, include the existing blob `sha` when updating).

---

## Reusable blog-post template

To write a new post, copy this skeleton to `src/content/blog/<slug>.mdx`, fill it in, set
`draft: false` when ready. `<slug>` becomes the URL (`/blogs/<slug>`) — kebab-case, stable.

```mdx
---
title: "<Post title — sentence case>"
date: <YYYY-MM-DD>            # publish/authored date; drives list ordering (newest first)
description: "<1–2 sentence summary — shown on /blogs and used for SEO/social>"
draft: true                  # true = hidden in prod, visible in `bun run dev`; flip to false to ship
canonicalUrl: "https://adrijshikhar.dev/blogs/<slug>"   # for cross-post rel=canonical
# cover: "/img/<slug>-cover.png"   # optional banner image (under public/)
---

<!-- Opening hook: 2–4 sentences. Lead with the problem/tension, not "In this post I…". -->

## <Section — the "why" or context>

<!-- Prose. Keep paragraphs tight. -->

## <Section — the "what/how">

<!-- Code fences get dual-theme Shiki highlighting automatically. Keep snippets short + load-bearing. -->

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
- **`draft`** — keep `true` while writing (visible in `dev`, hidden in prod); flip to `false` in the
  shipping PR. `/blogs` + the homepage Writing section filter drafts in prod automatically.
- **`description`** — write it for a human skimming `/blogs`; it's the only preview text.
- **MDX** — plain Markdown works; import/use components when a post needs them (e.g. `ReadmePreview`).
- **Images** — put under `public/` and reference with an absolute path (`/img/...`). Cross-post platforms
  that block remote SVG need a **raster** hero (see the screenshot recipe).
- **Cross-posting** — once live, set the same `canonicalUrl` on dev.to / everydev.ai (Phases 2–3).

> **Don't commit a `_template.mdx` into `src/content/blog/`** unless you also exclude it from the loader:
> the glob (`**/*.{md,mdx}`) + `getStaticPaths` pick up *every* file regardless of `draft`, so it would
> emit a real `/blogs/_template` route. Keep the template here, or change the loader pattern to ignore
> underscore-prefixed files (`['**/!(_)*.{md,mdx}']`) first.

---

## Self-Review (plan author)

- **Spec coverage:** Phase 1 (collection, list, post, homepage Writing + SideNav, `?machine=true`,
  first post) — all shipped, recorded as historical Tasks 1–7. Cross-post phases: Phase 2 (dev.to) →
  Tasks 8–10, Phase 3 (everydev.ai) → Task 11, Phase 4 (Hashnode) → Task 12, Phase 5 (HackerNoon) →
  Task 13, Phase 6 (Medium) → Task 14. Cross-post canonical, the SVG→PNG constraint, and the screenshot
  recipe all carried from the spec's STATUS/HANDOFF. Deferred items (themes, homepage redesign,
  RSS/tags/search) remain out of scope per the spec.
- **Cross-post consistency:** every platform (Phases 2–6) sets the same canonical
  (`adrijshikhar.dev/blogs/building-an-agentic-era-profile-readme`) and uses the raster `readme-top.png`
  hero — stated once in STATUS/HANDOFF and repeated per phase. Canonical mechanism per platform: dev.to
  `canonical_url`, Hashnode `originalArticleURL`, HackerNoon canonical field, Medium import auto-canonical.
- **Placeholder scan:** the only `<...>` placeholders live inside the *reusable post template*
  (intentional — author fills per post). No vague implementation steps; every actionable step has an
  exact command + expected output.
- **Consistency:** canonical domain is `adrijshikhar.dev` throughout (updated from the original
  `.github.io`); dev.to article id `3803610` and the `readme-top.png` `output`-branch URL match the spec.
