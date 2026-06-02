# Resume Bullets — Adrij Shikhar
Generated: 2026-05-31
Target Role: Senior Backend Engineer — Data Infrastructure / AI Infra
Targeting: Airbyte, Fivetran, Confluent, Estuary, dbt Labs, ClickHouse, Databricks, Hugging Face, Modal, Together AI, Sourcegraph, Vercel, Pydantic, Glean
Framing: impact + innovation first. Numbers are measured/extracted from Confluence design docs, RCAs, and Jira ticket bodies. `<!-- TODO -->` marks where a hard business figure (revenue/churn/customer count) would strengthen but isn't in the data.

---

## Scale & Performance Impact

- **Unlocked enterprise-scale pipelines — 25× object capacity (1,000 → 25,000 objects/pipeline)**, clearing churn-risk blockers for customers ingesting 200M–400M events/month. Broke hard platform ceilings (MongoDB 16MB doc cap at ~800 objects, Temporal 4MB activity-context limit, Redshift table limits); tested to 50K objects, benchmarked to ~100K. <!-- TODO: # enterprise customers onboarded / revenue unblocked -->
- **Made job monitoring near real-time — per-event processing 1.67 min → ~1 sec (~100×)** and job-summary memory **10 GB (OOM) → 400 MB**, by replacing per-event DB calls with a MongoDB aggregation + batched fetch; steady-state CPU 100% spikes → <20%.
- **Cut a critical catalog API from 60+ seconds to sub-second** via bulk APIs + cursor pagination (replacing N+1 mapping fetches).
- **Cut test/build runtime −49% local, −31% CI** via shared per-fork integration-test containers, propagated across catalog-service, hermes, and connector repos.
- Reduced JVM/GC overhead **350–400 MB → 250–300 MB** per container while hunting a ~900 MB off-heap gap during 25k scale work.

## CDC & Data-Correctness Innovation

- **Architected Binlog V2 (Debezium MySQL CDC) from scratch** and invented a **transaction-start-anchored polling model** — eliminated duplicate-row corruption in append-only destinations, removed per-transaction `TABLE_MAP_EVENT` persistence (and a Redis write-through table + 24h cleanup), and handled >4 GB transactions around MySQL bugs #95074/#55231. Rolled out to **100% of MySQL pipelines**.
- **Diagnosed and killed "the root of all binlog latency issues"** — false multi-hour lag spikes traced to statement-execution vs commit timestamps; re-anchored latency to COMMIT/XID time (H2-60661).
- **Shipped SCD Type 2 History Mode** across Snowflake/BigQuery/Redshift — connectors stay history-unaware (emit `source_modified_at`); platform derives `valid_from/valid_to/is_active` via `LEAD`/`ROW_NUMBER` window SQL + per-destination MERGE.
- **Built Inferred Deletes** for full-load objects — timestamp soft-delete with a BigQuery single-pass `MERGE ... NOT MATCHED BY SOURCE` vs Snowflake/Redshift two-step, keeping destinations consistent without explicit delete events.
- **Designed the SaaS-CDK Connector Framework** — declarative `PollTask` DAG executor (acyclicity validation, parallel ready-task scheduling, 6 DAG patterns) with reusable auth/retry/pagination/offset utilities; migrated 9+ connectors off imperative fetch loops.

## Reliability & Activation Impact

- **Attacked the biggest onboarding leak** — test-connection failures drove **40% of incidents and ~70% of signup drop-off**. Preflight + dynamic-classification redesign cut **false-negative classification >30% → 0%**, **system-error failures −25%**, invalid-credential feedback **180 s → <1 s**, p95 latency **≤10 s**, error-rule deploys **3–7 days → minutes**.
- **Replaced the failure-classification regex engine with RE2J (DFA)** after root-causing catastrophic backtracking + thread starvation (VisualVM) — regex hangs **∞ → <5 s**; a 4,800-request load test went from stalling (killed at 7 min) to **1m19s, P95 15.1s**.
- **Eliminated multi-day stuck loads** — set an explicit Snowflake `STATEMENT_TIMEOUT` (**2-day JDBC default → 3 hr**, H2-78322) so hung queries fail fast.
- **Resolved 295 P0/P1 incidents** across US/EU/India/AU and standardized control-plane error handling (17-row gRPC→HTTP mapping, UUID error-ID correlation UI↔logs) — turning generic "Internal Server Error" into actionable, traceable failures. <!-- TODO: MTTR or incident-rate reduction % -->

## AI Tooling & Innovation

- **Originated hevo-connector-agent** — an AI toolkit that builds production Hevo connectors straight from API docs (model-driven: ERD/OpenAPI parsing → LanceDB RAG → multi-flow LLM enrichment → auto-fixing Java codegen + TCK tests). Engineered its token efficiency: command-as-orchestrator + on-demand skill libraries cut LLM cost **30–50% per connector (~65K tokens on a 5-connector build)**, with pre-tool-use hooks enforcing the CDC offset data-loss invariant. <!-- TODO: connector build-time days→hours / # connectors shipped via it -->
- **Built the Hermes MCP server** turning **100+ Hevo APIs into Claude tools**; authored **hevo-ai-plugin** (20+ skills) for autonomous on-call debugging and RCA generation.

## Platform & Architecture

- **Built Hermes, Hevo 2.0's control plane, from scratch** — Java 17, Dropwizard, Temporal orchestration, Groot auth/RBAC, Caffeine/Redis — owned full lifecycle across 5 regions.
- **Eliminated 3-repo coupling** per connector config knob via a connector-owned runtime-config model (four-layer merge, boot-time validation).
- Authored foundational platform TRDs adopted org-wide — Fortress OAuth v2 (zero-code YAML provider registration), Dynamic Connector Config Template (server-driven form fields, shipped on HubSpot), Session Logs (fluent-bit→S3 + Macie/Comprehend PII redaction), Hevo as a Terraform Provider.

---

## Career Narrative

Joined Hevo as an SDE intern (Sep 2021), grew into Senior Software Engineer owning core data-infrastructure work. Arc: SaaS/OAuth sources → architecting MySQL CDC (Binlog V2) → building Hevo 2.0's control plane (Hermes) → defining the SaaS-CDK connector framework and SCD Type 2 History Mode → originating the company's agentic-AI tooling (hevo-connector-agent). Throughline: invent the primitive, prove it at multi-region scale, ship it as competitive parity.

## Supporting Scope (context, not headline)

4 years · 1,674 merged PRs · 2,057 reviews across 54 repos · 4 epics (102 child issues) · 158 design docs authored. Use sparingly — lead with impact above.

## Missing Quantification (fill from memory/dashboards)

- Enterprise customers onboarded / revenue unblocked by 25k-object support.
- Connector build-time before→after the connector-agent toolchain; # connectors shipped via it.
- Incident-rate / MTTR reduction.
- Activation (signup→active) lift after Test Connection Reliability shipped.
