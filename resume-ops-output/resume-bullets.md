# Resume Bullets — Adrij Shikhar
Generated: 2026-05-31
Target Role: Senior Backend Engineer — Data Infrastructure / AI Infra
Targeting: Airbyte, Fivetran, Confluent, Estuary, dbt Labs, ClickHouse, Databricks, Hugging Face, Modal, Together AI, Sourcegraph, Vercel, Pydantic, Glean
Source window: 2022-06-01 → 2026-05-31 (4 years) · 1,674 merged PRs · 2,057 reviews · 54 repos · 516 Jira tickets · 4 epics · 295 P0/P1

---

## Scale & Performance

- Scaled the pipeline platform to **25,000+ source objects per pipeline** (epic INT-4446, 24 child issues) by decoupling source-object/SOTR/CT insertion from synchronous pipeline creation and moving generation to an async, paginated flow.
- Cut object-listing API latency from **60+ seconds to sub-second** by replacing N+1 mapping fetches with bulk catalog APIs and paginated queries.
- Drove a CI/test-runtime optimization sweep (H2-77864): parallelized Hermes integration tests with shared per-fork containers (**−49% local, −31% CI build time**) and propagated the model across catalog-service and connector repos.
- Built continuous performance benchmarking with **k6 + Grafana** for the full pipeline lifecycle, plus local JFR profiling and InfluxDB/Telegraf metrics across 11 services.

## Feature Development

- Architected and shipped **Binlog V2** — a Debezium-based MySQL CDC engine built from the ground up (DDL parser, large-transaction handling, GTID support, skipped-table management, new offset/polling strategy), rolled out to **100% of MySQL pipelines** (epic INT-3491).
- Shipped **SCD Type 2 / History Mode** across **Snowflake, BigQuery, and Redshift** loaders — destination-specific strategies (Snowflake/BigQuery MERGE, Fivetran-identical Redshift DELETE+UPDATE+INSERT) unified behind a `__hevo__valid_from` catalog primitive spanning loader-base, catalog-service, and connector-framework (3,040-line core PR).
- Designed and built the **SaaS-CDK Connector Development Kit** (H2-26663) — `ObjectPollTask`/`ParentChildPollTask` patterns, `GenericConnectorV2`, schema parsing — then migrated 9+ connectors (BambooHR, OrderGroove, Salesforce, SQL Server, CockroachDB, …) onto it.
- Built **connector-owned runtime config** (H2-77864) — a four-tier override system (segment > integration > connector default > CF default) with boot-time validation and immutable record-based config across the connector fleet.
- Extended CDC source coverage: PostgreSQL WAL (`wal2json`, array types), Oracle LogMiner, SQL Server CT, plus REST/OAuth2 SaaS sources (Survey Monkey, Mailchimp, Criteo, Typeform).

## Reliability & Incident Response

- Resolved **295 P0/P1 incidents** (207 Highest, 88 High) across US, EU, India, and AU regions — CDC ingestion lag, internal ingestion failures, WAL slot issues, and data mismatches on MySQL/Aurora/RDS and MongoDB Atlas sources.
- Fixed deep CDC data-integrity bugs: unsigned SQL types, geometry columns, timestamp-with-timezone conversion, binary/byte primary keys, BYTEA handling, and table-map cache corruption.
- Shipped **Failure Classifier Phase 1** (epic H2-590, 9 child issues) — an error-classification engine across all connectors and loaders that replaced generic errors with actionable diagnostics.
- Hardened API security: eliminated plaintext OAuth credential/password exposure, added SSL validation with sensitive-key masking, and closed missing-auth gaps.

## Leadership & Mentorship

- Provided **2,057 PR reviews across 54 repositories** over 4 years (~43/month) — top review surfaces: hermes (546), services (229), voltron (160), sentinel-tests (134), catalog-service (130).
- Owned **4 major epics totaling 102 child issues**: Hermes Service Optimizations (H2-91, 64), 25K Source-Object Handling (INT-4446, 24), Failure Classifier (H2-590, 9), Debezium MySQL Connector (INT-3491, 5).
- Authored **hevo-ai-plugin** — internal Claude Code plugin (16K+ LOC, 20+ skills) for on-call debugging, TDD workflows, RCA automation, and PR review — adopted org-wide so any repo installs once for consistent AI guidance.
- Set engineering standards across the connector platform via gradle-bom convention plugins, commit/PR hooks, and Claude Code skills that encode recurring workflows (sentinel test runs, RCA docs, Postman sync).

## System Design & Architecture

- Built **Hermes**, Hevo 2.0's control plane, from scratch (epic H2-91, 64 child issues) — Java 17, Dropwizard, Groot auth/RBAC, Caffeine/Redis caching, Temporal orchestration — and owned its lifecycle across **5 environments** (preview, gamma, US, EU, Asia).
- **Created and architected hevo-connector-agent** — an AI agent that generates production-ready Hevo source connectors directly from API documentation. Built the original framework and interactive Claude Code workflow (converted to an installable Python package + unified `hca` CLI), later extended into a model-driven generation pipeline (ERD + OpenAPI parsing, LanceDB RAG over docs, multi-flow LLM enrichment, auto-fixing Java codegen with TCK tests).
- Built the **Hermes MCP server** — a FastMCP server that turns the Hevo API (100+ endpoints, generated from Postman collections) into Claude tools, enabling agentic interaction with the platform.
- Designed the **log-router sidecar** (fluent-bit wrapper) for structured session-log collection to S3, integrated across 8+ data-plane services.
- Stood up local-dev platform infrastructure: hevo-2-starter one-command stack (lite/standard/chaos resource tiers), dockerized Groot with local OAuth, and a StatsD → Telegraf → InfluxDB → Grafana metrics pipeline.

## Customer Impact

- Eliminated recurring multi-region ingestion-lag and data-loss incidents for enterprise CDC pipelines (MongoDB Atlas, Aurora, RDS MySQL) — directly reducing customer-facing pipeline downtime. <!-- TODO: add metric — incidents/month reduction or pipeline uptime % -->
- Delivered History Mode (SCD Type 2) parity with Fivetran across three warehouses, unblocking customers who require full audit/change history in their destinations.
- Reduced new-connector delivery time via the SaaS-CDK + connector-agent toolchain. <!-- TODO: add metric — days-to-build a new connector before vs after -->

---

## Career Narrative

Joined Hevo as an SDE intern (Sep 2021) and grew into a Senior Software Engineer owning core data-infrastructure platform work. Over four years, progressed from SaaS-source/OAuth features → architecting MySQL CDC (Binlog V2) → building the Hevo 2.0 control plane (Hermes) from scratch → defining the SaaS-CDK connector framework → and most recently leading the company's move into agentic AI tooling by creating hevo-connector-agent and an org-wide Claude Code plugin. Consistent themes: change data capture, destination loaders, connector frameworks, and reliability at multi-region scale.

## Skills Extracted

- **Languages/Frameworks:** Java 8/17, Dropwizard, Spring, gRPC/Protobuf, Kotlin, Python, Golang, React, Node.js
- **Data Infra & CDC:** MySQL CDC (Debezium), PostgreSQL WAL, Oracle LogMiner, SQL Server CT, SCD Type 2/History Mode, Connector Framework v2 (CDK), Snowflake, BigQuery, Redshift, MongoDB, Kafka, Spark
- **Distributed/Cloud:** Temporal, Caffeine/Redis, RBAC & OAuth2, AWS (ECS/Fargate, S3), Docker, Kubernetes, Terraform, Ansible, CircleCI
- **AI & Agentic:** AI connector code-generation agents, Claude Agent SDK, RAG (LanceDB hybrid vector + BM25), Model Context Protocol (MCP) servers, Claude Code plugin/skill authoring
- **Observability & Testing:** OpenTelemetry, InfluxDB/Telegraf/Grafana, Fluent-bit, Coralogix, Sentry, JFR profiling, JUnit 5, Testcontainers, k6, Playwright

## Missing Quantification

- Customer Impact bullet 1 — incidents/month reduction or pipeline uptime %.
- Customer Impact bullet 3 — connector build-time before vs after the CDK/agent toolchain.
- Binlog V2 — rollout duration / # of pipelines migrated (stated as 100%; add absolute count if available).
