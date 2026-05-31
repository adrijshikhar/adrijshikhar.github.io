# Content Update Playbook — re-apply after layout merge

**Why this file exists:** A layout change in another worktree merges into `content` **before** this branch. That merge may conflict with / clobber the `src/content/*.md` edits made on `feat/resume-ops-output`. This file records every content change so it can be re-applied cleanly afterward.

**Session:** 2026-05-31 · agentic-AI / data-infra portfolio refresh + resume-ops 4-yr baseline.

**How to use:** After the layout branch lands and any conflict is resolved, verify each block below is present in the target file. If a block was lost to the merge, re-apply the "AFTER" text. Then `bun run build` to confirm.

---

## 1. `src/content/experience.md` — `hevo-senior` section

### 1a. CDC Framework & System Design — replace the SCD bullet, add CDK bullet

**BEFORE:**
```
- Shipped **Failure Classifier Phase 1** — error classification engine across all connectors and loaders, replacing generic errors with actionable diagnostics.
- Implemented **SCD Type 2 (History Mode)** for Redshift and BigQuery loaders.
```

**AFTER:**
```
- Shipped **Failure Classifier Phase 1** — error classification engine across all connectors and loaders, replacing generic errors with actionable diagnostics.
- Shipped **SCD Type 2 (History Mode)** across Snowflake, BigQuery, and Redshift loaders — destination-specific strategies (Snowflake/BigQuery MERGE, Fivetran-identical Redshift DELETE+UPDATE+INSERT) unified behind a `__hevo__valid_from` catalog primitive spanning loader-base, catalog-service, and connector-framework.
- Migrated **9+ source connectors to Connector Framework v2 (CDK)** — declarative `generateTasks`/`ObjectPollTask` model replacing imperative fetch loops, with pluggable offset codecs and null-safe task generation.
```

### 1b. Reliability & Incident Response — incident count 200+ → 295

**BEFORE:**
```
- Resolved **200+ P0/P1 production incidents** across US, EU, India, AU regions — binlog failures, WAL slot issues, data mismatches, and ingestion lag.
```

**AFTER:**
```
- Resolved **295 P0/P1 production incidents** across US, EU, India, AU regions — binlog failures, WAL slot issues, data mismatches, and ingestion lag.
```

### 1c. Leadership & Impact — full section replace (reorder to lead with AI tooling + updated numbers)

**BEFORE:**
```
- Provided **1,889 code reviews** across **47 repositories** over 4 years, averaging 40+ reviews/month.
- Owned **4 major epics**: Debezium MySQL Connector, 25K Source Object Handling (24 child issues), Failure Classifier (9 issues), Hermes Optimizations (63 issues).
- Built developer tooling: hevo-2-starter local dev, MCP servers, JFR profiling, InfluxDB+Telegraf metrics, connector-generator scaffolding.
```

**AFTER:**
```
- Created and architected **hevo-connector-agent** — an AI agent that generates production-ready Hevo source connectors directly from API documentation. Built the original framework and interactive Claude Code workflow, later extended into a model-driven generation pipeline (ERD + OpenAPI parsing, LanceDB RAG over docs, multi-flow LLM enrichment, and auto-fixing Java codegen with TCK tests).
- Authored **hevo-ai-plugin** — internal Claude Code plugin (16K+ LOC, 20+ skills) for on-call debugging, TDD workflows, and RCA automation; built the **Hermes MCP server** generating 100+ Claude tools from Postman collections to drive Hevo APIs programmatically.
- Built local-dev platform tooling: hevo-2-starter one-command stack, **InfluxDB + Telegraf + Grafana** StatsD metrics across 11 services, and JFR profiling commands.
- Provided **2,057 code reviews** across **54 repositories** over 4 years, averaging 40+ reviews/month.
- Owned **4 major epics** (102 child issues): Hermes Optimizations (64), 25K Source Object Handling (24), Failure Classifier (9), Debezium MySQL Connector (5).
```

---

## 2. `src/content/skills.md` — full file replace

Cut "Development Environment" + "And More..." sections. New senior-signal structure, AI & Agentic Systems elevated to #2. Dropped: TypeScript, Lua, Dart, PHP, C++, Sass, Redux, Flutter.

**AFTER (entire file):**
```markdown
---
title: "Skills"
---

## Languages & Frameworks

Java 8/17, Dropwizard, Spring, gRPC/Protobuf, Kotlin, Python, Golang, React, Node.js

## AI & Agentic Systems

AI agents for connector code-generation, Claude Agent SDK, RAG (LanceDB hybrid vector + BM25), Model Context Protocol (MCP) servers, Claude Code plugin & skill authoring, agentic tool-use (100+ internal APIs as agent tools), autonomous on-call & RCA agents

## Data Infrastructure & CDC

MySQL CDC (Debezium), PostgreSQL WAL, Oracle LogMiner, SQL Server CT, SCD Type 2 / History Mode, Connector Framework v2 (CDK), Snowflake, BigQuery, Redshift, MongoDB, Apache Kafka, Apache Spark

## Distributed Systems & Cloud

Temporal, Caffeine/Redis caching, RBAC & OAuth2, AWS (ECS/Fargate, S3), Docker, Kubernetes, Terraform, Ansible, CircleCI

## Observability & Testing

OpenTelemetry, InfluxDB/Telegraf/Grafana, Fluent-bit, Coralogix, Sentry, JFR profiling, GC logging, JUnit 5, Testcontainers, k6, Playwright
```

---

## 3. `src/content/about.md`

### 3a. Stats line — 200+/1,889/47 → 295/2,057/54

**BEFORE:**
```
I've resolved 200+ P0/P1 production incidents, cut critical API latency from 60+ seconds to sub-second, and reviewed 1,889 PRs across 47 repositories.
```

**AFTER:**
```
I've resolved 295 P0/P1 production incidents, cut critical API latency from 60+ seconds to sub-second, and reviewed 2,057 PRs across 54 repositories.
```

### 3b. AI bridge paragraph — reframe to agentic AI + connector-agent proof

**BEFORE:**
```
The problems I find most exciting now sit at the intersection of **data infrastructure and AI** — streaming systems, vector stores, inference platforms, and the plumbing that makes large-scale ML actually work in production. The same primitives that move 25K objects through a CDC pipeline are what move tokens through an inference cluster.
```

**AFTER:**
```
The problems I find most exciting now sit at the intersection of **data infrastructure and agentic AI** — autonomous agents that act on real production systems, tool-use platforms, and the plumbing that makes them reliable. I'm already building it: I created **hevo-connector-agent**, an AI agent that generates production-ready data connectors straight from API documentation, plus a Claude Code plugin and MCP servers that turn 100+ internal APIs into agent tools. The same engineering that keeps a CDC pipeline correct at 25,000 objects is what keeps an autonomous agent trustworthy in production.
```

---

## Not at conflict risk (no re-apply needed)

These live under `resume-ops-output/` (the layout change won't touch them):
- `resume-ops-output/raw/github.md` — 4-yr GitHub baseline (1,674 PRs · 2,057 reviews · 54 repos)
- `resume-ops-output/raw/jira.md` — 4-yr Jira baseline (516 tickets · 4 epics · 295 P0/P1)
- `resume-ops-output/resume-bullets.md` — regenerated synthesis
- `resume-ops-output/resume-ops.yaml` — `github.since` now `2022-06-01`

## Verify after re-apply
```bash
bun run build
grep -rn '1,889\|200+ P0\|47 repositories\|63 issues' src/content/   # must be empty
```
