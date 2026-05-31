---
entries:
  - slug: hevo-senior
    position: "Senior Software Engineer"
    company: "Hevo Data"
    companyLink: "https://hevodata.com/"
    location: "Bangalore"
    startDate: "Jun 2022"
    endDate: "Present"
    tagline: "Load data from any source into your warehouse"
  - slug: hevo-intern
    position: "Software Development Intern"
    company: "Hevo Data"
    companyLink: "https://hevodata.com/"
    location: "Bangalore"
    startDate: "Sep 2021"
    endDate: "Oct 2021"
    tagline: "Load data from any source into your warehouse"
  - slug: mtx
    position: "Software Development Intern"
    company: "MTX Global"
    companyLink: "https://www.mtxb2b.com/s/"
    location: "Hyderabad"
    startDate: "Jun 2021"
    endDate: "Aug 2021"
    tagline: "GO DIGITAL. THINK HUMAN."
  - slug: triomics
    position: "Software Development Intern"
    company: "Triomics"
    companyLink: "https://triomics.in/"
    location: "Gurgaon"
    startDate: "Apr 2021"
    endDate: "May 2021"
    tagline: "Making Clinical Trials faster and transparent"
  - slug: rephrase
    position: "Software Development Intern"
    company: "Rephrase.ai"
    companyLink: "https://www.rephrase.ai/"
    location: "Bangalore"
    startDate: "Oct 2020"
    endDate: "Mar 2021"
    tagline: "Use Generative AI to address millions of customers personally, through videos."
  - slug: powerplay
    position: "Software Engineering Intern"
    company: "Powerplay"
    companyLink: "https://www.getpowerplay.in/"
    location: "Bangalore"
    startDate: "Apr 2020"
    endDate: "Jun 2020"
    tagline: "Helping construction contractors track realtime on-site progress"
  - slug: sdslabs
    position: "Developer"
    company: "SDSLabs"
    companyLink: "https://sdslabs.co/"
    location: "IIT Roorkee"
    startDate: "Jan 2019"
    endDate: "Jul 2020"
    tagline: "Think. Build. Ship"
  - slug: ecell
    position: "Manager"
    company: "Entrepreneurship Cell"
    companyLink: "https://www.ecelliitr.org/"
    location: "IIT Roorkee"
    startDate: "Feb 2019"
    endDate: "Feb 2020"
    tagline: "#inspiringinnovation"
  - slug: cognizance-web
    position: "Web Developer"
    company: "Cognizance"
    companyLink: "https://cognizance.org.in/"
    location: "IIT Roorkee"
    startDate: "Dec 2018"
    endDate: "Jan 2020"
    tagline: "IIT Roorkee Tech Fest"
---

<!-- hevo-senior -->

### Scale & Performance

- Scaled data pipeline platform to support **25,000+ source objects per pipeline** by profiling and optimizing ingestion across MySQL, Postgres, SQL Server connectors and Snowflake/BigQuery loaders.
- Reduced object listing API latency from **60+ seconds to sub-second** by replacing N+1 mapping fetches with bulk APIs and paginated catalog queries.
- Optimized source object generation by decoupling SO/SOTR/CT insertion from synchronous pipeline creation, cutting pipeline creation time for large integrations.
- Built performance testing infrastructure using **k6** with Grafana dashboards for continuous pipeline lifecycle benchmarking.

### CDC Framework & System Design

- Architected and shipped **Binlog V2** (Debezium-based MySQL CDC) from ground up — DDL parser, large transaction handling, skipped table management, new polling strategy, and GTID support. Rolled out to **100% of MySQL pipelines** over 12 months.
- Built **Hermes**, Hevo 2.0's control plane from scratch — Java 17, Dropwizard, Groot auth, Caffeine/Redis caching, Temporal orchestration, RBAC. Owned full lifecycle across **5 environments** (preview, gamma, US, EU, Asia).
- Designed the **log-router sidecar** for session log collection — fluent-bit wrapper routing structured logs to S3, integrated across **8+ data plane services**.
- Shipped **Failure Classifier Phase 1** — error classification engine across all connectors and loaders, replacing generic errors with actionable diagnostics.
- Shipped **SCD Type 2 (History Mode)** across Snowflake, BigQuery, and Redshift loaders — destination-specific strategies (Snowflake/BigQuery MERGE, Fivetran-identical Redshift DELETE+UPDATE+INSERT) unified behind a `__hevo__valid_from` catalog primitive spanning loader-base, catalog-service, and connector-framework.
- Migrated **9+ source connectors to Connector Framework v2 (CDK)** — declarative `generateTasks`/`ObjectPollTask` model replacing imperative fetch loops, with pluggable offset codecs and null-safe task generation.

### Reliability & Incident Response

- Resolved **295 P0/P1 production incidents** across US, EU, India, AU regions — binlog failures, WAL slot issues, data mismatches, and ingestion lag.
- Fixed critical data integrity issues: unsigned types, geometry columns, timestamp-with-timezone, binary PKs, and table map cache corruption in CDC pipelines.
- Hardened API security: eliminated plaintext password exposure, missing auth checks, and OAuth credential leakage.

### Leadership & Impact

- Created and architected **hevo-connector-agent** — an AI agent that generates production-ready Hevo source connectors directly from API documentation. Built the original framework and interactive Claude Code workflow, later extended into a model-driven generation pipeline (ERD + OpenAPI parsing, LanceDB RAG over docs, multi-flow LLM enrichment, and auto-fixing Java codegen with TCK tests).
- Authored **hevo-ai-plugin** — internal Claude Code plugin (16K+ LOC, 20+ skills) for on-call debugging, TDD workflows, and RCA automation; built the **Hermes MCP server** generating 100+ Claude tools from Postman collections to drive Hevo APIs programmatically.
- Built local-dev platform tooling: hevo-2-starter one-command stack, **InfluxDB + Telegraf + Grafana** StatsD metrics across 11 services, and JFR profiling commands.
- Provided **2,057 code reviews** across **54 repositories** over 4 years, averaging 40+ reviews/month.
- Owned **4 major epics** (102 child issues): Hermes Optimizations (64), 25K Source Object Handling (24), Failure Classifier (9), Debezium MySQL Connector (5).

<!-- hevo-intern -->

- Added support for 'wal2json' output plugin for postgres replication.
- Reduced WAL processing time taken by the platform, by **60%**.
- Implemented dynamic plugin selection using Guice dependency injection.
- Implemented OAuth 2.0 feature for accessing protected Rest APIs
- Tech Stack: Java, Postgres

<!-- mtx -->

- Worked on curating ETL data pipeline from concept to proof of concept.
- Implemented on-demand data transformations using Apache Spark, and streaming the same using Apache Kafka onto Google Cloud Platform.
- Containerized individual components of the pipeline for better development and deployment.
- Solely configured and maintained pipeline on Google K8s Engine.
- Orchestrated data visualization service to configure overlayed charts.
- Tech Stack: Python, Apache Spark, Docker, Kubernetes, Google Cloud Platform

<!-- triomics -->

- Collaborated with the core founding team on the initial stages of the platform.
- Setup infrastructure for the applications, keeping scalability and security into account.
- Developed management dashboard service for micro and macro level user access across the apps.
- Customized D3 for visualization of data, fitting our use case.
- Tech Stack: React, Django, Postgres

<!-- rephrase -->

- Ensured stability of the product by integrating tests and error handling.
- Optimized uploading and validating data from user's end.
- Implemented Stripe, Sentry, Clickup for better development cycle.
- Integrated continuous integration and ensured continuous delivery among various services.
- Worked on graphene to optimize API performance.
- Tech Stack: React, Django, GraphQL, ffmpeg

<!-- powerplay -->

- Implemented core features and structure from concept through deployment.
- Introduced REST API's, server-side pagination and JWT based authentication system.
- Standardized UI libraries by enclosing them in highly customizable wrapper for code reusability.
- Assessed UX and UI designs for technical feasibility.
- Developed standard and ad hoc report in table format.
- Collaborated with product team members to implement new feature developments.
- Tech Stack: React, NodeJS, MongoDB

<!-- sdslabs -->

- Under the hood of the group, we promote technical culture on the campus by conducting hackathons, lecture series, and competitions.
- Responsible for maintaining current applications and server management.
- Mentored freshmen students in their projects for the Winter of Code program.

<!-- ecell -->

- Conducted meetings, hands-on workshops and events on various topics related to entrepreneurship and startups.
- Participated in various case studies regarding SaaS.
- Developed core pipeline and worked on optimizing user experience.
- Spearheaded the development of user interface and the flow of login & registration forms.

<!-- cognizance-web -->

- Been a part of a 3-tier team of 5+ executive members, associate members, and co-coordinators to establish web presence of Cognizance 2019 and 2020.
- Contributed as a Manager Web in 2019 and 2020
- Worked on designing the architecture and implementing core features of the progressive web app.
- Ported the legacy code from webpack v2 to webpack v4 and restructured the node dependencies.
