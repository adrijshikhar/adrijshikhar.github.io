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

### Scale & Performance Impact

- **Unlocked enterprise-scale pipelines — 25× object capacity (1K → 25K objects/pipeline)**, clearing churn-risk blockers for customers ingesting 200M–400M events/month. Broke hard platform ceilings along the way (MongoDB's 16MB doc cap at ~800 objects, Temporal's 4MB activity-context limit, Redshift table limits) — tested to 50K objects, benchmarked to ~100K.
- **Made job monitoring near real-time — per-event processing 1.67 min → ~1 sec (~100×)** and job-summary memory **10 GB (OOM) → 400 MB**, by replacing per-event DB calls with a MongoDB aggregation + batched fetch (steady-state CPU 100% spikes → <20%).
- **Cut a critical API from 60+ seconds to sub-second** by replacing N+1 mapping fetches with bulk catalog APIs and cursor pagination.
- **Cut test/build runtime −49% locally and −31% in CI** via shared per-fork integration-test containers, then propagated the model across services.

### CDC & Data-Correctness Innovation

- **Architected Binlog V2 (Debezium-based MySQL CDC) from scratch** and invented a **transaction-start-anchored polling model** — eliminating duplicate-row corruption in append-only destinations, removing per-transaction `TABLE_MAP_EVENT` persistence (and a Redis write-through table), and handling >4 GB transactions around MySQL server bugs. Rolled out to **100% of MySQL pipelines**.
- **Diagnosed and killed "the root of all binlog latency issues"** — false multi-hour lag spikes traced to measuring from statement-execution instead of commit time; re-anchored the latency calc to COMMIT/XID timestamps.
- **Shipped SCD Type 2 History Mode** across Snowflake/BigQuery/Redshift — kept connectors history-unaware (emit `source_modified_at`) while the platform derives `valid_from/valid_to/is_active` via `LEAD`/`ROW_NUMBER` window SQL and per-destination MERGE.
- **Built Inferred Deletes** for full-load objects — timestamp soft-delete with a BigQuery single-pass `MERGE ... NOT MATCHED BY SOURCE` (vs Snowflake/Redshift two-step), keeping destinations consistent without explicit delete events.

### Reliability & Activation Impact

- **Attacked the biggest onboarding leak** — test-connection failures drove **40% of incidents and ~70% of signup drop-off**. My preflight + dynamic-classification redesign cut **false-negative classification >30% → 0%**, **system-error failures −25%**, invalid-credential feedback **180 s → <1 s**, p95 latency to **≤10 s**, and error-rule deploys from **3–7 days → minutes**.
- **Replaced the failure-classification regex engine with RE2J (DFA)** after root-causing catastrophic backtracking + thread-pool starvation — regex hangs **∞ → <5 s**, and a 4,800-request load test went from stalling (killed at 7 min) to **1m19s**.
- **Eliminated multi-day stuck loads** by setting an explicit Snowflake query timeout (**2-day JDBC default → 3 hr**); resolved 295 P0/P1 incidents across 4 regions with documented RCAs and a standardized gRPC→HTTP error-handling layer (UUID error-ID correlation across UI and logs).

### AI Tooling & Platform Innovation

- **Originated hevo-connector-agent** — an AI toolkit that builds production connectors straight from API docs (model-driven: ERD/OpenAPI parsing → LanceDB RAG → multi-flow LLM enrichment → auto-fixing Java codegen + TCK tests). Engineered its token efficiency: a command-as-orchestrator loading on-demand skill libraries cut LLM cost **30–50% per connector (~65K tokens saved on a 5-connector build)**, with pre-tool-use hooks enforcing the CDC offset data-loss invariant.
- **Built the Hermes MCP server** turning **100+ Hevo APIs into Claude tools**, plus **hevo-ai-plugin** (20+ skills) for autonomous on-call debugging and RCA generation.
- **Built Hermes, Hevo 2.0's control plane, from scratch** (Java 17, Dropwizard, Temporal, Groot RBAC) across 5 regions; **eliminated 3-repo coupling** per connector config knob via a connector-owned runtime-config model.

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
