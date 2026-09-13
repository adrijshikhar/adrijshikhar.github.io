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

### Agent-native connector development

- Built the surface that lets LLMs generate and operate connectors: a construct library, a connector generator, an installable CLI, a skill library, and an MCP server exposing platform APIs to agents.
- Started the internal agent-tooling platform the team now builds on — repo structure, skill conventions, CI auto-release, marketplace distribution. Other engineers extend it rather than fork it.

### Streamlining connector development

- Made connector authentication declarative. A provider used to be its own processor inside the platform — a code change, a database migration, and coordination across three services. It is now a config file, with no platform change at all.
- Moved runtime configuration and config templates into the connector, behind a compatibility kit that gates correctness at build time instead of in review.
- Standardised how connector repos are created, versioned and released, behind a central BOM carrying a named release policy. Before this every connector carried its own build config and drifted.
- Decoupled the connector fleet from the shared platform SDK, so a connector no longer inherits a runtime it does not control.

### Connection reliability

- Owned the test-connection contract end to end and took its false-negative rate from **over 30% to nil in validation** — a failing check now means an actual connection problem rather than a flaky one.
- Delivered configuration validation across every source and destination — Postgres, MySQL, Oracle, SQL Server, Snowflake, BigQuery, Redshift — so a misconfiguration surfaces at connect time rather than at first sync.
- Brought p95 test-connection latency **under 10 seconds**, and shipped an end-to-end suite alongside each framework rather than leaving the contract unit-tested.

### Failure visibility

- Replaced static error classification with a dynamic system. A classification change used to wait on a connector's full release cycle; it now takes **minutes instead of 3–7 days**.
- Root-caused a class of production hangs to the regex engine rather than the queries being run, and migrated classification to RE2J — which bounds worst-case evaluation to **under five seconds** and took a load run from a multi-minute stall to **1m19s**.
- Built metrics and dashboards for connection health, and put HTTP client metrics into the connector construct library so teams see a rate-limiting API before it becomes a sync failure.

### Data correctness at scale

- Delivered SCD Type 2 history mode across Snowflake, BigQuery and Redshift, handling the per-destination SQL differences — Redshift has no `MERGE` and needs a four-statement path.
- Built parent-child object handling with inferred deletes, giving full-load objects the delete support they previously lacked.
- Implemented real-time CDC on the Debezium engine, and built the schema catalog service behind it from scratch — schema versioning, metadata management and compatibility checks, so a pipeline survives schema evolution.
- Scaled object handling from **1,000 to 25,000 objects**, with a **5x** gain in MySQL ingestion throughput.
- Moved every source and destination onto negotiated TLS 1.2 and 1.3, and proved it safe across providers with a dedicated SSL test suite.

### Engineering velocity

- Cut build and CI runtime with measured before and after: `mvn clean verify` **31:43 → 10:33** and CI **43:32 → 21:24** on the first service, then **11:07 → 5:15** and **5:14 → 2:01** as the approach was adopted elsewhere.
- Ran controlled configuration sweeps against a 90-day baseline rather than tuning by feel, and published the before/after pipelines including the configurations that regressed.
- Built the unified CLI and local development platform — one command, three modes, profiling, a metrics pipeline — so the team runs the stack locally instead of queueing for shared environments.

### Earlier platform work

- Implemented near-real-time PII redaction for data governance, on S3 and AWS Comprehend.
- Integrated a microservices architecture on AWS Fargate and a Temporal-based task execution system for hierarchical DAG processing.
- Shipped session logs, YAML pipeline templates, a Cron-based scheduler and Terraform support, and launched the SurveyMonkey connector.
- Unified how HTTP and gRPC failures are reported across the control plane, cutting support overhead.

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
