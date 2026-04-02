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

### Scalability and Performance

- Architected for Scale: Led key initiatives that enabled the platform to support a **2500% increase** in object handling, from 1,000 to 25,000 objects.
- Optimized Data Ingestion: Achieved a **5x increase** in data ingestion speed within the MySQL connector, significantly boosting system efficiency and throughput.
- Database Interaction at Scale: Engineered a metadata system that scaled the ETL platform by **15x**, allowing for massive improvements in core database interactions.
- Source Object Generation: Optimized the source object generation flow, resulting in a **10x improvement** in pipeline performance and enabling support for larger datasets.
- Reduced Catalog Document Size: Drove efforts to reduce the catalog document size, leading to **improved performance and scalability** across the platform.

### CDC Framework Project

- Ownership and Execution: Led the complete implementation of real-time CDC framework using Debezium Engine (open source) which significantly enhanced data synchronization and ensured seamless real-time updates.
- Schema Catalog Service:
  - Designed and built a generic schema service from scratch to manage and validate data schemas in ETL pipelines, with seamless integration and testing using Debezium connectors.
  - Supported source-specific features, including handling unchanged toast datum from PostgreSQL and diverse data types from various data sources, ensuring flexibility across different ETL environments.
  - Implemented schema versioning, metadata management, and compatibility checks to maintain data quality, streamline data processing, and accommodate schema evolution.

### System Optimization and Security Enhancements

- Standardized Error Handling: Spearheaded the initiative to create a unified standard for HTTP and gRPC request failures across the control plane, which improved user experience and **reduced support overhead**.
- Enhanced Security and Governance: Implemented source/destination whitelisting and played a key role in the Connectors Flag GA for Hevo 1.0.
- REST API Security Enhancements: Enhanced the REST API connector by implementing OAuth 2.0 authorization, improving security and user management.

### Feature Development and Integrations

- Led the implementation of several new features including Session Logs, YML template support, advanced scheduler with Cron support, and Terraform integration.
- Spearheaded the development and launch of the SurveyMonkey connector, contributing to the expansion of Hevo's connector ecosystem.

### Critical Customer Issue Resolution

- Managed and resolved several complex customer issues for key clients, **significantly improving customer satisfaction**.

### Innovative System Enhancements

- Real-time Logs Implementation: Implemented data governance tool to handle PII redaction in near real-time using AWS S3 and AWS Comprehend, ensuring data privacy and enhancing user experience.
- Microservices and Task Execution: Worked on integrating a microservices architecture on AWS Fargate and implemented a Temporal-based task execution system, improving reliability and streamlining hierarchical DAG processes.

### Team Contribution and Documentation

- Regularly contributed to improving documentation quality and conducted knowledge transfer sessions, fostering team collaboration.

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
