---
entries:
  - slug: catalyst
    title: "Catalyst"
    company: "Open source"
    date: "May 2026"
    year: 2026
    link: "https://github.com/adrijshikhar/catalyst"
    builtWith: ["Claude Code", "Agent Skills", "Shell"]
  - slug: binsight
    title: "binsight"
    company: "Open source"
    date: "Jul 2026 - Present"
    year: 2026
    link: "https://github.com/adrijshikhar/binsight"
    builtWith: ["Go", "MySQL", "SQLite", "Docker"]
  - slug: resume-ops
    title: "resume-ops"
    company: "Personal"
    date: "May 2026"
    year: 2026
    builtWith: ["Claude Code", "Agent Skills", "GitHub API", "Jira API"]
  - slug: retry-thread-pool
    title: "Retry Thread Pool"
    company: "Maven Central"
    date: "Jun 2026"
    year: 2026
    link: "https://central.sonatype.com/artifact/io.github.adrijshikhar/retry-thread-pool"
    builtWith: ["Java 17", "Concurrency", "Maven Central"]
  - slug: observatory
    title: "adrijshikhar.dev"
    company: "Personal"
    date: "Aug 2026 - Present"
    year: 2026
    link: "https://github.com/adrijshikhar/adrijshikhar.github.io"
    builtWith: ["Astro", "React", "Canvas", "Tailwind"]
  - slug: scraperql
    title: "ScraperQL"
    company: "Dgraph Labs"
    date: "Oct 2020"
    year: 2020
    link: "https://github.com/adrijshikhar/scraper-ql"
    builtWith: ["GraphQL", "Slash GraphQL", "Node.js"]
  - slug: kill-zee
    title: "Kill-Zee"
    company: "Global Game Jam 2020"
    date: "Jan 2020"
    year: 2020
    link: "https://github.com/adrijshikhar/kill-zee"
    builtWith: ["Lua", "LÖVE"]
  - slug: issue-labeler
    title: "Issue Labeler Bot"
    company: "SDSLabs"
    date: "Jul 2020 - Oct 2020"
    year: 2020
    link: "https://github.com/sdslabs/SDSLabs-Issue-Labeler"
    builtWith: ["Python", "BERT", "GitHub API"]
  - slug: slackbot
    title: "Slackbot"
    company: "SDSLabs"
    date: "July 2021 - Dec 2021"
    year: 2021
    builtWith: ["Golang", "Slack API", "WebSockets"]
  - slug: accounts
    title: "Accounts"
    company: "SDSLabs"
    date: "Jul 2020 - Oct 2020"
    year: 2020
    builtWith: ["OAuth 2.0", "Docker", "Redis"]
  - slug: cra-webpack
    title: "Create React App Webpack"
    company: "SDSLabs"
    date: "July 2020 - Aug 2020"
    year: 2020
    link: "https://github.com/adrijshikhar/create-react-app-webpack"
    builtWith: ["React", "Webpack"]
  - slug: vega-vscode
    title: "Vega VS Code Extension"
    company: "Major League Hacking"
    date: "Jun 2020"
    year: 2020
    link: "https://github.com/adrijshikhar/vega-vscode-extension"
    builtWith: ["VS Code API", "Vega", "TypeScript"]
  - slug: darkdev
    title: "DarkDev"
    company: "SDSLabs"
    date: "Apr 2020"
    year: 2020
    link: "https://github.com/adrijshikhar/darkdev"
    builtWith: ["VS Code Theme"]
  - slug: covid-tracker
    title: "Covid 19 Tracker"
    company: "SDSLabs"
    date: "Apr 2020 - May 2020"
    year: 2020
    builtWith: ["Flutter", "Dart", "Maps SDK"]
  - slug: coderunner
    title: "Coderunner 2.0"
    company: "SDSLabs"
    date: "Oct 2019 - Mar 2020"
    year: 2019
    builtWith: ["Golang", "gRPC", "Docker"]
  - slug: cerebro
    title: "Cerebro"
    company: "SDSLabs"
    date: "Apr 2019 - Dec 2019"
    year: 2019
    builtWith: ["Laravel", "React", "Redux"]
  - slug: cognizance
    title: "Cognizance"
    company: "IIT Roorkee"
    date: "Jan 2019 - Feb 2020"
    year: 2019
    builtWith: ["Django", "React", "Redux", "PostgreSQL"]
  - slug: esummit
    title: "E-Summit PWA"
    company: "IIT Roorkee"
    date: "Jan 2019 - Jan 2020"
    year: 2019
    builtWith: ["React", "PWA"]
  - slug: hidden-stone
    title: "Hidden Stone"
    company: "Utthan Foundation Trust"
    date: "Dec 2018 - May 2019"
    year: 2018
    builtWith: ["React", "Redux", "Material UI", "Google Sheets API"]
  - slug: evem
    title: "evem"
    company: "SDSWoC 19"
    date: "Dec 2018 - Jan 2019"
    year: 2018
    builtWith: ["HTML", "CSS", "JavaScript", "PHP"]
---

<!-- catalyst -->

Harness engineering for Claude Code — skills that turn the model into a long-running, reliable system. Named after the chemistry: a catalyst makes a reaction faster and more reliable without being consumed by it.

- Skills for handoffs between sessions, so work survives a context window ending.
- Shipped with CI, versioned releases and a documented deep dive on the harness itself.

<!-- binsight -->

A local, read-only MySQL and MariaDB binlog viewer and analyzer. Point it at a directory of binlog files and it gives you the events as something you can actually read.

- Filterable event stream, transaction grouping, row-image diffs, hex forensics, anomaly detection and a schema timeline, in a browser UI.
- Backed by a zero-config SQLite index, so decoding never blocks the UI — everything the browser reads comes from the index.
- Streams live from a running server as a replica, standing in for `mysqlbinlog` with a visual front end.
- Distributed as a Homebrew tap and a container image.

<!-- resume-ops -->

A Claude Code skill that reads four years of engineering history and writes it back as evidence.

- Pulls from GitHub, Jira, Confluence and Slack, reconciles the sources against each other, then synthesises the result.
- Every claim traces to a link, and the counting traps are recorded alongside the numbers — a batch job that closes tickets in blocks will happily hand you a flattering statistic.

<!-- retry-thread-pool -->

A retrying task executor for Java 17+. Wrap any `ExecutorService` and get retries without rewriting the task.

- Backoff, retry predicates, per-attempt timeouts, listeners and stats.
- Zero runtime dependencies. Published to Maven Central; the source is not public.

<!-- observatory -->

This site. An observatory instrument rather than a page — the background is real computed astronomy, not a texture.

- Star positions, the planets, the Moon's terminator and the Sun are computed from the observer's coordinates and the current Julian date. It asks for your location and falls back to Bengaluru when the lookup is blocked or slow, because a wrong sky is worse than a stated one.
- Every mark is a catalogued object rather than a procedural dot, and on the home page with a mouse you can hover any of them to have it named. The instrument readouts report the frame that was actually painted.
- Text legibility is a hard contract, verified against the rasterised page rather than asserted.

<!-- scraperql -->

Dgraph Labs hosted the 'Hack and Slash GraphQL' hackathon to showcase the power of Slash GraphQL.

- Developed a web scraper using GraphQL to leverage the nesting power of it.
- You have a single query resolver called scrape that takes in a URL as a parameter and returns a generic defined entity such as an HtmlNode

<!-- kill-zee -->

A small tactical game in Lua to kill zombies and protect your tower before its too late.

Spearheaded and implemented the underlying core features and worked on performance optimization.

<!-- issue-labeler -->

It is a github bot which uses machine learning to automate the labelling of issues on Github by critical analysis of its content.

- Generated training dataset by scraping around 20,000 issues on Github.
- Fine-Tuned the Google Bert Model on the dataset. Exported the trained model to integrate it with the Github bot.

<!-- coderunner -->

Program code compiler is written in Golang.

- Implemented core functionality CLI and exposed as API.
- Designed central agent to govern micro services, optimise cost & increase reliability
- Added GRPC server to spawn runners in docker environment with custom log factory.

<!-- accounts -->

It is an indigenous multi-provider authentication framework based on OAuth-2. It comprises of two standalone authentication and resource server.

- Worked on improving the OAuth flow and containerising the applications for better stability and scaling.
- Setup containerised infrastructure for developement as well as production environment.
- Worked on additional features such as server-side redis caching.

<!-- cerebro -->

Cerebro, a platform for hosting data hackathons exclusively in IITR developed by SDSLabs. It's challenges and competitions are maintained by members of SDSLabs and Data Science Group.

- Implemented Admin Panel to host and manage machine learning competitions with submissions and managing posts.
- Worked on additional features such as edit post and lazy loading of news feed.
- Built on Open source PHP framework, Laravel with frontend SPA client in ReactJS and Redux.

For more details, check out the [blog post](https://blog.sdslabs.co/2018/12/cerebro) on Cerebro.

<!-- slackbot -->

A simple yet extensive bot written in Golang, which uses Sockets to communicate to Slack API.

- Developed core features with plugin layer for attaching different bots onto one single point.
- Integrated with Google APIs for real-time chat features.

<!-- cra-webpack -->

An initial set up for react and webpack using a single command

It is light and minilistic with bare minimum configuration needed to spawn a react app.

<!-- vega-vscode -->

MLH and Microsoft joined forces to host a hackathon for building new and improving existing coding tools.

- Integrated Vega charting library to VSCode, to generate charts and diagrams on the go.
- It reads the config from the JSON schema and shows the output in the Web View of VSCode

<!-- darkdev -->

A self crafted VS Code Theme, for those who like it in dark mode.

<!-- esummit -->

E-Summit is an event held to exhibit the entrepreneurial talent and creativity through many competitions like business ventures, product design competition, etc.

- Developed core pipeline and worked on optimizing user experience.
- Spearheaded the development of user interface and the flow of login & registration forms

<!-- cognizance -->

Cognizance is the Tech Fest organized by IIT Roorkee. It is a progressive web app with conceptualized the ER Diagram and implemented the relational database in PSQL.

- Worked on designing the architecture and implementing core features of the progressive web app
- Ported the legacy code from webpack v2 to webpack v4 and restructured the dependencies.
- Worked alongside design team for faster and better development cycle for user interface.
- Built on Django with frontend SPA client in ReactJS and Redux.

<!-- covid-tracker -->

A cross platform application to track Covid-19 activities, based on Flutter framework.

- Integrated maps sdk to pinpoint data for convenient visual understanding across India.
- Lead the effort to introduce Government Protocols to be followed to prevent spreading of the same.

<!-- hidden-stone -->

The trust is working to train the village as well as urban downtrodden people of the society.

- Lead a team of four, from design to development cycle.
- Established using ReactJS and Redux for state management.
- Worked on wrappers to extend the functionalities of libraries used, such as material ui.
- Integrated Google Sheets API for newsletter and donation information.

<!-- evem -->

A website that provides information regarding the bookings of the venues of IIT Roorkee. and gives you a centralized system to book the venue for certain events.

- Implemented personalized calender, feedback portal and search feature.
- Pure HTML/CSS, JS usage with PHP as backend.
