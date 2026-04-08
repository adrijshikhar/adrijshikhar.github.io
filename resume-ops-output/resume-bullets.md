# Resume Bullets — Adrij Shikhar
Generated: 2026-04-08
Target Role: Senior Software Engineer

---

## Scale & Performance

- **Scaled data pipeline platform to support 25,000+ source objects per pipeline** by profiling and optimizing the entire data plane (MySQL, Postgres, SQL Server connectors and Snowflake/BigQuery loaders), resolving OOM failures and timeout issues across 6 microservices <!-- TODO: add metric — measure latency reduction % for 25K object pipelines vs previous limit -->
- **Reduced API latency for object listing from 60+ seconds to sub-second** by replacing N+1 mapping fetches with bulk commit ingestion/load stats APIs and introducing paginated catalog queries with batch sizes tuned to 100-500 records
- **Optimized source object generation during pipeline creation** by decoupling SO/SOTR/CT insertion from the synchronous pipeline creation flow, introducing async generation with deduplication — reducing pipeline creation time for large integrations (INT-5155, INT-5198, INT-5287, INT-5292) <!-- TODO: add metric — pipeline creation time before/after -->
- **Reduced Hermes control plane memory pressure** by introducing User DTO caching, cached thread pool executors for OkHttp clients, and replacing heavy catalog name aggregation with lightweight mapping-info APIs — enabling the service to handle production traffic at 2 vCPU / 4 GB
- **Built performance testing infrastructure (butcher)** using k6 scripts for end-to-end pipeline lifecycle benchmarking across catalog, batch, and hermes services, with Grafana dashboards for continuous monitoring

## Feature Development

- **Architected and shipped Binlog V2 (Debezium-based MySQL CDC connector)** from ground up — integrating Debezium DDL parser, large transaction handling, skipped table management, new polling strategy, and GTID support. Rolled out to 100% of MySQL pipelines over 12 months (Q4 2022–Q4 2023), replacing the legacy binlog parser <!-- TODO: add metric — number of pipelines migrated to V2 -->
- **Built Hermes, Hevo 2.0's control plane service from scratch** — Java 17, Dropwizard REST framework, Groot auth integration, Caffeine/Redis caching, Temporal orchestration, and RBAC. Owned the full lifecycle: service setup, CI/CD, ansible deployment, multi-region rollout across 5 environments (preview, gamma, US, EU, Asia)
- **Designed and implemented the session logs system** — built the log-router sidecar (fluent-bit wrapper) for collecting data plane container logs, S3 upload with presigned URL download, marker file protocol for session completion, and integrated across all ingestor/loader containers (8+ services)
- **Shipped Failure Classifier Phase 1** (Epic H2-590, 9 child issues) — built an error classification engine integrated across all test connection and data path flows for MySQL, Postgres, Oracle, SQL Server, and Snowflake/BigQuery loaders, replacing generic error messages with actionable user-facing diagnostics
- **Implemented SCD Type 2 (History Mode) support for Redshift and BigQuery loaders** — enabling customers to track historical changes in destination tables with merge-based loading strategies

## Reliability & Incident Response

- **Resolved 200+ P0/P1 production incidents** across all regions (US, EU, India, AU, US2) spanning MySQL binlog failures, Postgres WAL slot issues, data mismatches, ingestion lag, and pipeline stuck states — maintaining SLA for Hevo's data pipeline platform serving enterprise customers
- **Fixed critical data integrity issues in binlog replication** including unsigned data type handling, geometry column support, timestamp-with-timezone conversion, binary primary key support, and table map cache corruption — preventing data loss for production CDC pipelines
- **Improved MySQL CDC reliability** by implementing binlog expiry handling, auto-reconnect, transaction offset retry, and table definition cleanup — reducing oncall incident volume for binlog-related failures <!-- TODO: add metric — % reduction in binlog oncall tickets quarter over quarter -->
- **Identified and fixed N×N mapping fetch bug** in data zone ingestion (H2-6112) that caused exponential API calls during incremental loads, and resolved bulk commit stats API bottleneck (H2-6442) where per-object calls were made instead of batch operations
- **Hardened API endpoints and eliminated security vulnerabilities** including plaintext password exposure in HTTP responses (H2-1933, H2-2765), missing authentication checks, and credential leakage in OAuth flows (INT-1682)

## Leadership & Mentorship

- **Provided 1,889 code reviews across 51 repositories** over 4 years — averaging 40+ reviews per month with peak of 275 reviews in Q1 2025, spanning hermes (516), services (221), voltron (145), catalog-service (129), and 47 other repositories
- **Owned 4 major epics** driving platform-level initiatives: Debezium MySQL Connector (INT-3491), Large Source Object Handling (INT-4446, 24 child issues), Failure Classifier Phase 1 (H2-590, 9 child issues), and Hermes Service Optimizations (H2-91, 63 child issues)
- **Contributed to 47 repositories** across the Hevo engineering org — from core platform services (hermes, voltron, catalog-service) to data plane components (dz-postgres, dz-mysql, loader-base), CI/CD tooling (hevo-circleci-orb), and developer infrastructure (hevo-2-starter, butcher) in a team growing from 8 to 12 engineers
- **Built and maintained developer tooling ecosystem** including hevo-2-starter local dev environment (Docker Compose, MCP servers, Postman collections, uv/fnm/bun integration), connector-generator scaffolding, JFR profiling support across all containers, and InfluxDB+Telegraf metrics pipeline for local observability

## System Design & Architecture

- **Designed multi-service architecture for Hevo 2.0 platform** — hermes (control plane), voltron (orchestration), catalog-service (metadata), hodor (user management), batch-service (job monitoring), with Temporal workflows, gRPC inter-service communication, and Redis caching layers
- **Architected the error classification system** with a pluggable entity-based classification model — errors are classified at the connector/loader level, propagated through the failure service, and surfaced as actionable messages in the UI, replacing generic "internal error" across all source/destination types
- **Designed the log-router sidecar pattern** for session log collection — a lightweight process running alongside each ECS data plane container, routing structured JSON logs to S3 via fluent-bit, with flow-type segmentation (data_control vs data_plane) and graceful termination handling
- **Led Debezium integration architecture** — forked and customized the Debezium MySQL connector with Hevo-specific timestamp handling, year-to-date conversion, and custom DDL parser integration, deployed as a shaded JAR with managed dependency conflicts
- **Introduced BOM (Bill of Materials) management** across the Java ecosystem — centralizing dependency versions in hevo-bom and gradle-bom, enabling consistent library upgrades across 30+ microservices and reducing CVE exposure

## Customer Impact

- **Eliminated pipeline creation failures for large-scale customers** by scaling config validation to 25K+ objects, fixing object listing timeout (H2-2675), and resolving pipeline creation failures at 20K tables (H2-2883) — unblocking enterprise adoption <!-- TODO: add metric — number of enterprise customers affected -->
- **Reduced customer-facing error confusion** by shipping the Failure Classifier — replacing generic "internal error" messages with specific, actionable diagnostics for test connection failures across MySQL, Postgres, Oracle, SQL Server, Snowflake, and BigQuery
- **Improved pipeline observability** by building session logs download and activity logs — giving customers visibility into job execution details, failure reasons, and pipeline state changes without requiring support intervention <!-- TODO: add metric — % reduction in support tickets post-launch -->
- **Resolved cross-region data integrity issues** including data mismatches in MySQL binlog (unsigned types, binary PKs), Postgres timestamp trimming, and SQL Server incremental load failures — protecting data accuracy for production pipelines across US, EU, India, and AU regions
- **Enabled advanced scheduling options** (5-minute, 30-minute, 45-minute sync frequencies) and merge as default load mode — reducing data freshness SLA from hours to minutes for real-time analytics customers

---

## Career Narrative

Adrij joined Hevo Data as a Software Development Engineer in September 2021 and rapidly grew into a platform-level technical leader. Starting with connector bug fixes and new source integrations (SurveyMonkey, Criteo), he progressed to architecting and shipping the Debezium-based MySQL CDC connector (Binlog V2), then to building Hevo 2.0's entire control plane (Hermes) from scratch. Over 4+ years, his scope expanded from single-service contributions to owning cross-cutting platform initiatives spanning 47 repositories, with direct impact on pipeline reliability, scalability, and developer experience across the organization.

## Skills Extracted

**Languages & Frameworks:** Java 8/17, Dropwizard, Spring, gRPC/Protobuf, Kotlin/Gradle, Python, JavaScript/React, Shell scripting

**Data Infrastructure:** MySQL CDC (Debezium), PostgreSQL WAL/Log Replication, Oracle Log Mining, SQL Server Change Tracking, Binlog parsing, GTID, SCD Type 2

**Cloud & DevOps:** AWS ECS/Fargate, S3, CircleCI, Docker, Ansible, Terraform, Fluent-bit, InfluxDB/Telegraf/Grafana

**Databases & Destinations:** MySQL, PostgreSQL, Oracle, SQL Server, MongoDB, Snowflake, BigQuery, Redshift, Redis, DynamoDB

**Architecture:** Microservices, Temporal (workflow orchestration), gRPC, REST API design, Sidecar pattern, Error classification, Feature flags, BOM management

**Testing & Observability:** JUnit 5, Testcontainers, k6 (performance testing), JFR profiling, GC logging, Coralogix, OpenTelemetry, Sentry

**Developer Tooling:** Claude Code/MCP servers, Postman API collections, Docker Compose local dev, uv/fnm/bun toolchain

## Missing Quantification

- Scale & Performance #1: `<!-- TODO: add metric — measure latency reduction % for 25K object pipelines vs previous limit -->`
- Scale & Performance #3: `<!-- TODO: add metric — pipeline creation time before/after -->`
- Feature Development #1: `<!-- TODO: add metric — number of pipelines migrated to V2 -->`
- Reliability & Incident Response #3: `<!-- TODO: add metric — % reduction in binlog oncall tickets quarter over quarter -->`
- Customer Impact #1: `<!-- TODO: add metric — number of enterprise customers affected -->`
- Customer Impact #3: `<!-- TODO: add metric — % reduction in support tickets post-launch -->`
