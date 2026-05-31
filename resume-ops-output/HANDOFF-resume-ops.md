# Session Handoff — Resume & Portfolio Work

**Scope:** Resume + portfolio site only. Learning roadmap split to separate file (`learning-roadmap.md` / `HANDOFF-learning.md`).
**Project:** `/Users/nemesis/Projects/my-projects/adrijshikhar.github.io`
**Branch:** `feat/resume-ops-output`
**Last updated:** 2026-05-31

---

## Who / What

Adrij Shikhar. Senior SDE @ Hevo Data, 4+ yrs. Goal: switch in 2 months to AI/data-infra senior backend role. Target list: `resume-ops-output/ai_companies_100.md` (100 cos, Fit-5 shortlist of 18).

`resume-ops` = open-source Claude Code skill at `/Users/nemesis/Projects/my-projects/resume-ops/`. Scrapes GitHub + Jira via parallel subagents → synthesizes resume bullets. Skill symlinked to `~/.claude/commands/resume-ops/`.

---

## State of work

### Done
- **`/resume` page built** — `src/pages/resume.astro`. Mirrors old PDF design (navy `#1d3557` sidebar + white right column, Lora serif name). Print-to-PDF button (`window.print()`, `@page A4`). Responsive collapse <768px.
- **resume-ops re-run** for last 2 months (since 2026-03-01). GitHub: 123 PRs, 113 reviews, 39 repos. Jira: 0 results (date filter ahead of resolved tickets — known, not a bug).
  - Raw: `resume-ops-output/raw/github_recent.md`, `raw/jira_recent.md` (kept separate from 4-yr baseline `github.md`/`jira.md`).
- **`resume-bullets.md` rewritten** — new sections for recent work: SCD Type 2 across Snowflake/BigQuery/Redshift, Connector Framework v2 (CDK) migration, `hevo-ai-plugin` (20+ skills), Hermes MCP server, local-dev observability (InfluxDB+Telegraf+Grafana). Per-bucket pitch angles at bottom.
- **`resume.astro` content updated** to match — 7 thematic subsections, leads with CDC/SCD Type 2. Sidebar Core Skills updated (MCP, Claude plugin authoring, SCD Type 2 surfaced for ATS).
- **`src/content/about.md` updated** — new tagline, email → `adrijshikhar85@gmail.com`, body re-pitched toward AI infra.
- Build verified clean each change (`bun run build`).

### Config changed
`resume-ops-output/resume-ops.yaml`:
- `target_role` → "Senior Backend Engineer — Data Infrastructure / AI Infra"
- `github.since` → `2026-03-01` (was `2022-06-01`) — **revert to 2022-06-01 if re-running full baseline**

---

## Key recent-work themes (the differentiators for target cos)

1. **SCD Type 2 / History Mode** — 3,040-line loader-base PR. Snowflake MERGE, BigQuery CREATE OR REPLACE, Fivetran-identical Redshift DELETE+UPDATE+INSERT. `__hevo__valid_from` catalog primitive. **Lead with this for Bucket E (Airbyte/Fivetran/dbt/Confluent/Estuary).**
2. **hevo-ai-plugin** — Claude Code plugin, 20+ skills, 16K LOC. Hermes MCP server (Postman → 100+ Claude tools). alfred DB-query skills. **Lead with this for Bucket B/C (Modal/HF/Sourcegraph/Vercel).**
3. **CDK v2 migration** — 9+ connectors, declarative generateTasks/ObjectPollTask.
4. **Local-dev observability** — InfluxDB+Telegraf+Grafana, JFR profiling.

---

## Files (resume work)

| File | What |
|---|---|
| `src/pages/resume.astro` | The resume page. Master copy. |
| `src/content/about.md` | Portfolio homepage about — AI-infra pitch |
| `resume-ops-output/resume-bullets.md` | Synthesized bullets + per-bucket pitches |
| `resume-ops-output/ai_companies_100.md` | Target company tracker |
| `resume-ops-output/application-roadmap.md` | Gap analysis + per-company tactics (NOT the learning plan) |
| `resume-ops-output/raw/github_recent.md` | Last-2mo GitHub raw |
| `resume-ops-output/old resume.pdf` | Design reference |

Commands: `bun run dev` (localhost:4321), `bun run build`. View `/resume`.

---

## Open / next (resume only)

- **Per-bucket resume variants** not built yet. Want: Bucket E (lead CDC/SCD), Bucket B/C (lead AI-tooling). Current `/resume` is the master/generic.
- **Add `/resume` link to homepage SideNav** — not done.
- Resume-bullets has TODO metric markers in 4-yr baseline section (latency %, pipeline counts) — unfilled.
- Cover-letter templates — not built (was deprioritized; user chose learning-first).
- Uncommitted: many resume-ops-output files + `src/pages/resume.astro` + content edits. Not committed yet.

---

## NOT in scope here

Learning roadmap, Karpathy/nanoGPT, interview prep → see `HANDOFF-learning.md`.
