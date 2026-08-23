# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Four audiences, all confirmed as primary — the site must serve all of them from
the same content, not pick one:

1. **Hiring managers and recruiters** evaluating Adrij for senior/staff
   data-infrastructure roles. They arrive with limited time and need to verify
   depth quickly and find a way to make contact.
2. **Engineering peers** who arrive from a blog post, a shared link, or the sky
   itself. They are judging craft. Success is respect, a second page read, a
   follow.
3. **AI agents and LLM crawlers** consuming the profile programmatically. This
   is a first-class audience, not an afterthought. Success is correct
   extraction of the résumé and work history.
4. **Adrij himself** — the site is a personal instrument and a reason to keep
   writing. Success includes staying worth maintaining.

## Product Purpose

A personal portfolio and writing site for Adrij Shikhar, Senior Software
Engineer at Hevo Data. It carries the résumé, the project archive, and
long-form engineering write-ups, and it is simultaneously a demonstration
artifact: the site's own construction is part of the evidence it presents.

## Positioning

Two claims a neighbouring portfolio could not truthfully copy:

- **Agent-native profile.** The site ships first-class machine surfaces — a
  raw-markdown machine view of the same page content, `llms.txt`, and
  `.well-known/agent-skills` — built for a world where agents read résumés
  before humans do. This is a deliberate product bet, not SEO hygiene.
- **Data-platform depth at scale.** The Hevo work is the claim: CDC pipelines,
  connector infrastructure, incident response at volume. The record does the
  arguing.

## Operating Context

- Visitors arrive from LinkedIn, GitHub, dev.to, or a shared blog-post link;
  many land on a post rather than the home page.
- Recruiter reads are short and often on mobile.
- Agent reads bypass the styled page entirely and consume the machine surfaces.
- Content is edited as markdown in-repo by Adrij; every change ships through a
  git push.

## Capabilities and Constraints

- **Static only.** No server, no database, no CMS. Astro 6 static build with
  React 19 islands, Tailwind 4, shadcn/ui, MDX; Bun is the package manager; Node 22
  pinned. Deploys to GitHub Pages via GitHub Actions on the `content` branch.
- **Canonical domain is `adrijshikhar.dev`** (Cloudflare-fronted).
  `adrijshikhar.github.io` is the Pages origin behind it. Absolute URLs
  (og:image, canonical) must resolve against the canonical domain.
- Two independent content systems: loose résumé markdown read at build time
  with `fs` + `gray-matter`, and an Astro content collection for the blog. The
  isolation is intentional.
- **Content is known stale** and is explicitly out of scope for current design
  work: `skills.md` predates the current stack, `README.md` names a toolchain
  the site no longer uses. Do not treat existing copy as evidence of what Adrij
  works on today, and do not fabricate replacements.

## Brand Commitments

- Name: **Adrij Shikhar**. Title: Senior Software Engineer.
- Existing tagline in content: "I build scalable data platforms and craft
  software that pushes boundaries."
- **Binding through any redesign:**
  - the background **sky** concept — a real-astronomy sky the page sits inside;
  - the **planet glyph icon set**;
  - **dark only** — there is no light mode;
  - **no glows** — nothing on the page emits light the sky cannot account for.
- **The rest of the incumbent visual world is explicitly open** — palette,
  typography, layout, card system, chrome treatment, and overall branding may
  be replaced. Treat the current look outside the four retained elements as
  evidence and anti-reference, not as authority.
- **The human/machine view toggle is permanent.** `?machine=true`,
  `window.__RAW_MARKDOWN__`, and human/machine content parity are load-bearing
  for the agent-native positioning.

## Evidence on Hand

- Résumé content in `src/content/*.md` — experience (Hevo senior + intern, MTX
  Global, Triomics), projects archive, education (IIT Roorkee, B.Tech Chemical
  Engineering, 2018–2022), achievements (CSAW Embedded Security Challenge 2020:
  1st national, 3rd global).
- Three long-form posts in `src/content/blog/`: MySQL binlog 4GiB position
  wrap, retry thread pool, agentic-era profile README.
- A real computed-astronomy sky engine (`src/lib/sky/`) with 14 physical
  invariants verified in CI via `bun run verify:sky`.
- Machine surfaces: `src/pages/llms.txt.ts`, `src/pages/index.md.ts`,
  `src/pages/.well-known/`.
- Contact: `ashikhar@ee.iitr.ac.in`; GitHub, LinkedIn, dev.to, Reddit.
- **No** testimonials, customer logos, press, benchmarks, or pricing exist.
  Future work must not invent them.

## Product Principles

1. **The site is its own strongest exhibit.** Construction quality is evidence.
   Anything that cannot survive an engineer reading the source weakens the case.
2. **Machine and human readings are equal citizens.** Every content change must
   land in both; a styled surface with no machine equivalent is incomplete.
3. **Serve the short read and the deep read from one page.** A recruiter
   skimming on a phone and a peer reading every word get the same content,
   ordered so neither is penalised.
4. **Claim only what the record supports.** No invented metrics, social proof,
   or credentials — the work history is the argument.
5. **Maintainability is a product requirement.** Content stays markdown in-repo,
   editable in a single push, because a site Adrij stops updating stops working.

## Accessibility & Inclusion

Light and dark mode both hold AA contrast. Mode follows the system preference
until an explicit choice is made. `prefers-reduced-motion` is honoured, and
reduced-motion fallbacks must remain informative rather than frozen.
