# MDX Migration + Human/Machine Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the resume site from Preact CLI with hardcoded JSX content to Astro + MDX with markdown-driven content, and add a human/machine toggle that switches between rendered HTML and interactive raw markdown views (inspired by parallel.ai).

**Architecture:** Astro as the static site generator with MDX integration and React for interactive islands. Content lives in 7 markdown files (one per section) with structured YAML frontmatter. Tailwind CSS + shadcn/ui for styling. Dark-only color palette inspired by brittanychiang.com — fixed left sidebar with name/nav, scrolling right content area, muted teal accent on dark slate background. A global view-mode toggle switches between "human" (styled dark HTML) and "machine" (raw markdown with monospace terminal aesthetic). Raw markdown source is assembled at build time.

**Tech Stack:** Astro 5, @astrojs/mdx, @astrojs/react, @astrojs/tailwind, React 19, Tailwind CSS 4, shadcn/ui, Bun (package manager), fnm (Node version manager), Node 22, GitHub Pages deployment.

**Design:** Brittany Chiang-inspired dark minimal layout:
- **Layout:** Two-column flexbox. Left column is `sticky top-0 h-screen` with name, title, tagline, nav, social icons. Right column scrolls through sections. NOT a fixed sidebar — both columns live inside the same scrollable container.
- **Human palette:** Navy background (`#0a192f`), slate text (`#8892b0`), lightest slate headings (`#ccd6f6`), teal accent (`#64ffda`)
- **Machine palette:** Dark grey background (`#1a1a2e`), lavender-grey text (`#a0a0b8`), near-white headings (`#e0e0f0`), purple accent (`#7b68ee`)
- **Nav:** Scroll-spy highlights current section. Three links: About, Experience, Projects (minimal like brittanychiang.com)
- **Typography:** Inter for body, monospace (JetBrains Mono) for accents/labels/machine mode
- **Cards:** Subtle hover lift with teal left-border accent on experience/project entries
- **Toggle animation:** Human view shrinks (scale 0.92) + fades → background transitions navy→grey → machine view fades up with clip-path typewriter reveal. Toggle pill changes teal→purple.
- **Mobile:** Single column, sticky section headers visible on scroll

---

## File Structure

```
src/
  content/
    about.md                     # Bio, contact info, social links
    experience.md                # All jobs — YAML array in frontmatter, descriptions in body
    projects.md                  # All projects — YAML array in frontmatter, descriptions in body
    education.md                 # All education — YAML array in frontmatter
    skills.md                    # Skills list
    achievements.md              # Achievements list
    interests.md                 # Interests paragraphs
  components/
    ui/                          # shadcn/ui components (auto-generated)
    ViewToggle.tsx               # Human/Machine toggle switch (React island)
    SideNav.astro                # Fixed left sidebar navigation
    Section.astro                # Generic resume section wrapper
    ExpCard.astro                # Experience card
    ProjectCard.astro            # Project card
  layouts/
    BaseLayout.astro             # HTML shell, Tailwind, fonts
  pages/
    index.astro                  # Main page, reads all content files
  styles/
    globals.css                  # Tailwind directives + custom base styles
    machine.css                  # Machine mode styles (monospace, terminal)
  lib/
    utils.ts                     # shadcn/ui cn() helper
public/
  assets/
    images/profile.jpg
    resume.pdf
astro.config.mjs
tailwind.config.mjs
tsconfig.json
components.json                  # shadcn/ui config
.node-version                    # fnm node version (22)
```

---

## Content File Format

### experience.md — YAML array + markdown descriptions keyed by slug

```markdown
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
---

<!-- hevo-senior -->

### Scalability and Performance

- Architected for Scale: Led key initiatives that enabled **2500% increase** in object handling
- Optimized Data Ingestion: Achieved a **5x increase** in data ingestion speed
...

<!-- hevo-intern -->

- Added support for 'wal2json' output plugin for postgres replication
- Reduced WAL processing time by **60%**
...
```

The `<!-- slug -->` HTML comments act as section delimiters. At build time, the index page splits the body by these markers and associates each chunk with its frontmatter entry.

### about.md — frontmatter metadata + body prose

```markdown
---
name: "Adrij Shikhar"
title: "Senior Software Engineer"
tagline: "I build scalable data platforms and craft software that pushes boundaries."
phone: "+91 (821) 805 8928"
email: "ashikhar@ee.iitr.ac.in"
socials:
  - platform: github
    url: "https://github.com/adrijshikhar/"
    icon: "fab fa-github"
  - platform: linkedin
    url: "https://www.linkedin.com/in/adrij-shikhar"
    icon: "fab fa-linkedin-in"
  - platform: dev
    url: "https://dev.to/adrijshikhar"
    icon: "fab fa-dev"
  - platform: email
    url: "mailto:ashikhar@ee.iitr.ac.in"
    icon: "fa fa-envelope"
  - platform: reddit
    url: "https://www.reddit.com/user/nemesis0009"
    icon: "fab fa-reddit"
---

Welcome to my portfolio! I'm a graduate from IIT Roorkee...
```

### Simple sections (skills.md, achievements.md, interests.md) — just markdown body

```markdown
---
title: "Skills"
---

## Development Environment
- **OS:** Manjaro i3wm Community Edition
...
```

---

### Task 1: Scaffold Astro Project with React + Tailwind + Bun

**Files:**
- Create: `astro.config.mjs`
- Create: `tailwind.config.mjs`
- Create: `tsconfig.json`
- Create: `src/styles/globals.css`
- Create: `src/pages/index.astro` (placeholder)
- Create: `.node-version`
- Modify: `package.json`
- Delete: `.nvmrc`, `package-lock.json`

- [ ] **Step 1: Switch to fnm + Node 22 and Bun**

```bash
rm -f .nvmrc
echo "22" > .node-version
fnm install 22
fnm use 22
rm -f package-lock.json
```

- [ ] **Step 2: Install Astro and integrations via Bun**

```bash
bun add astro @astrojs/mdx @astrojs/react @astrojs/tailwind @astrojs/sitemap
bun add react react-dom @types/react @types/react-dom
bun add -D tailwindcss @tailwindcss/typography
bun remove preact preact-cli preact-render-to-string preact-router sirv-cli jest-preset-preact enzyme enzyme-adapter-preact-pure bootstrap sass sass-loader
```

- [ ] **Step 3: Create astro.config.mjs**

```javascript
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://adrijshikhar.github.io',
  integrations: [
    mdx(),
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
});
```

- [ ] **Step 4: Create tailwind.config.mjs**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0a192f',
        'navy-light': '#112240',
        'navy-lighter': '#233554',
        slate: '#8892b0',
        'slate-light': '#a8b2d1',
        'slate-lightest': '#ccd6f6',
        white: '#e6f1ff',
        accent: '#64ffda',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
```

- [ ] **Step 5: Create src/styles/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

@layer base {
  body {
    @apply bg-navy font-sans text-slate;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply text-slate-lightest font-semibold;
  }

  a {
    @apply text-accent hover:text-accent/80 transition-colors;
  }

  ::selection {
    @apply bg-accent/20 text-slate-lightest;
  }
}
```

- [ ] **Step 6: Update package.json scripts**

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "deploy": "gh-pages -d dist -b master",
    "lint": "eslint --fix src/**/*.{js,ts,tsx,astro}"
  },
  "packageManager": "bun"
}
```

- [ ] **Step 7: Create tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

- [ ] **Step 8: Copy static assets**

```bash
mkdir -p public/assets/images
cp src/assets/images/profile.jpg public/assets/images/
cp src/assets/resume.pdf public/assets/
cp src/assets/favicon.ico public/
```

- [ ] **Step 9: Create placeholder index page and verify**

```astro
---
// src/pages/index.astro
import '../styles/globals.css';
---
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Adrij Shikhar</title>
  </head>
  <body>
    <h1 class="text-4xl text-slate-lightest p-8">Migration in progress</h1>
    <p class="text-accent px-8">Accent color test</p>
  </body>
</html>
```

Run: `bun run dev`
Expected: Astro dev server starts, dark navy background, light heading text, teal accent

- [ ] **Step 10: Initialize shadcn/ui**

```bash
bunx shadcn@latest init
```

Select: TypeScript, Default style, CSS variables, `src/components/ui` as component dir.

- [ ] **Step 11: Add useful shadcn components**

```bash
bunx shadcn@latest add button badge card separator toggle
```

- [ ] **Step 12: Commit**

```bash
git add astro.config.mjs tailwind.config.mjs tsconfig.json components.json .node-version bun.lockb package.json public/assets src/pages/index.astro src/styles/globals.css src/components/ui/ src/lib/
git rm -f .nvmrc package-lock.json --ignore-unmatch
git commit -m "feat: scaffold Astro project with React, Tailwind, shadcn/ui, Bun, fnm, Node 22"
```

---

### Task 2: Create All 7 Content Markdown Files

**Files:**
- Create: `src/content/about.md`
- Create: `src/content/experience.md`
- Create: `src/content/projects.md`
- Create: `src/content/education.md`
- Create: `src/content/skills.md`
- Create: `src/content/achievements.md`
- Create: `src/content/interests.md`

- [ ] **Step 1: Create about.md**

```markdown
---
name: "Adrij Shikhar"
title: "Senior Software Engineer"
tagline: "I build scalable data platforms and craft software that pushes boundaries."
phone: "+91 (821) 805 8928"
email: "ashikhar@ee.iitr.ac.in"
socials:
  - platform: github
    url: "https://github.com/adrijshikhar/"
    icon: "fab fa-github"
  - platform: linkedin
    url: "https://www.linkedin.com/in/adrij-shikhar"
    icon: "fab fa-linkedin-in"
  - platform: dev
    url: "https://dev.to/adrijshikhar"
    icon: "fab fa-dev"
  - platform: email
    url: "mailto:ashikhar@ee.iitr.ac.in"
    icon: "fa fa-envelope"
  - platform: reddit
    url: "https://www.reddit.com/user/nemesis0009"
    icon: "fab fa-reddit"
  - platform: facebook
    url: "https://www.facebook.com/adrij.shikhar"
    icon: "fab fa-facebook-f"
---

Welcome to my portfolio! I'm a graduate from IIT Roorkee. While my academic journey began in the world of chemistry, I quickly discovered my true passion for software development during my freshman year.

Over the past years, I've been honing my skills and working on exciting projects. My time is now dedicated to reading, writing, and crafting software solutions that not only solve problems but also push the boundaries of innovation.

Explore my portfolio to see the fruits of my labor, from web applications to mobile apps and everything in between. I'm excited to share my journey and the projects that have shaped my development career. If you have any questions or would like to collaborate, don't hesitate to get in touch!

Let's embark on this coding adventure together!
```

- [ ] **Step 2: Create experience.md**

Full file with all 9 entries in the frontmatter `entries` array and markdown descriptions in the body, delimited by `<!-- slug -->` comments. Extract all content from `src/components/experience/index.js`, converting HTML to markdown.

```markdown
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
- Optimized Data Ingestion: Achieved a **5x increase** in data ingestion speed within the MySQL connector.
- Database Interaction at Scale: Engineered a metadata system that scaled the ETL platform by **15x**.
- Source Object Generation: Optimized the source object generation flow, resulting in a **10x improvement** in pipeline performance.
- Reduced Catalog Document Size: Drove efforts leading to **improved performance and scalability** across the platform.

### CDC Framework Project

- Led the complete implementation of real-time CDC framework using Debezium Engine (open source).
- Schema Catalog Service:
  - Designed and built a generic schema service from scratch to manage and validate data schemas in ETL pipelines.
  - Supported source-specific features, including handling unchanged toast datum from PostgreSQL.
  - Implemented schema versioning, metadata management, and compatibility checks.

### System Optimization and Security Enhancements

- Created a unified standard for HTTP and gRPC request failures across the control plane, **reducing support overhead**.
- Implemented source/destination whitelisting and Connectors Flag GA for Hevo 1.0.
- Implemented OAuth 2.0 authorization for the REST API connector.

### Feature Development and Integrations

- Led implementation of Session Logs, YML template support, advanced scheduler with Cron support, and Terraform integration.
- Developed and launched the SurveyMonkey connector.

### Critical Customer Issue Resolution

- Managed and resolved complex customer issues for key clients, **significantly improving customer satisfaction**.

### Innovative System Enhancements

- Implemented data governance tool for PII redaction in near real-time using AWS S3 and AWS Comprehend.
- Integrated microservices architecture on AWS Fargate and implemented Temporal-based task execution system.

### Team Contribution and Documentation

- Regularly contributed to improving documentation quality and conducted knowledge transfer sessions.

<!-- hevo-intern -->

- Added support for 'wal2json' output plugin for postgres replication.
- Reduced WAL processing time taken by the platform, by **60%**.
- Implemented dynamic plugin selection using Guice dependency injection.
- Implemented OAuth 2.0 feature for accessing protected Rest APIs.
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
- Contributed as a Manager Web in 2019 and 2020.
- Worked on designing the architecture and implementing core features of the progressive web app.
- Ported the legacy code from webpack v2 to webpack v4 and restructured the node dependencies.
```

> **Adding a new experience:** Add a new object to the `entries` array at the desired position, and add a `<!-- new-slug -->` section in the body.

- [ ] **Step 3: Create projects.md**

Same pattern — frontmatter `entries` array + body with `<!-- slug -->` delimiters. Extract all 15 projects from `src/components/projects/index.js`.

```markdown
---
entries:
  - slug: scraperql
    title: "ScraperQL"
    company: "Dgraph Labs"
    date: "Oct 2020"
    link: "https://github.com/adrijshikhar/scraper-ql"
  - slug: kill-zee
    title: "Kill-Zee"
    company: "Global Game Jam 2020"
    date: "Jan 2020"
    link: "https://github.com/adrijshikhar/kill-zee"
  - slug: issue-labeler
    title: "Issue Labeler Bot"
    company: "SDSLabs"
    date: "Jul 2020 - Oct 2020"
    link: "https://github.com/sdslabs/SDSLabs-Issue-Labeler"
  - slug: coderunner
    title: "Coderunner 2.0"
    company: "SDSLabs"
    date: "Oct 2019 - Mar 2020"
  - slug: accounts
    title: "Accounts"
    company: "SDSLabs"
    date: "Jul 2020 - Oct 2020"
  - slug: cerebro
    title: "Cerebro"
    company: "SDSLabs"
    date: "Apr 2019 - Dec 2019"
  - slug: slackbot
    title: "Slackbot"
    company: "SDSLabs"
    date: "July 2021 - Dec 2021"
  - slug: cra-webpack
    title: "Create React App Webpack"
    company: "SDSLabs"
    date: "July 2020 - Aug 2020"
    link: "https://github.com/adrijshikhar/create-react-app-webpack"
  - slug: vega-vscode
    title: "Vega VS Code Extension"
    company: "Major League Hacking"
    date: "Jun 2020"
    link: "https://github.com/adrijshikhar/vega-vscode-extension"
  - slug: darkdev
    title: "DarkDev"
    company: "SDSLabs"
    date: "Apr 2020 - Present"
    link: "https://github.com/adrijshikhar/darkdev"
  - slug: esummit
    title: "E-Summit PWA"
    company: "IIT Roorkee"
    date: "Jan 2019 - Jan 2020"
  - slug: cognizance
    title: "Cognizance"
    company: "IIT Roorkee"
    date: "Jan 2019 - Feb 2020"
  - slug: covid-tracker
    title: "Covid 19 Tracker"
    company: "SDSLabs"
    date: "Apr 2020 - May 2020"
  - slug: hidden-stone
    title: "Hidden Stone"
    company: "Utthan Foundation Trust"
    date: "Dec 2018 - May 2019"
  - slug: evem
    title: "evem"
    company: "SDSWoC 19"
    date: "Dec 2018 - Jan 2019"
---

<!-- scraperql -->

Dgraph Labs hosted the 'Hack and Slash GraphQL' hackathon to showcase the power of Slash GraphQL.

- Developed a web scraper using GraphQL to leverage the nesting power of it.
- Single query resolver called scrape that takes a URL and returns a generic HtmlNode entity.

<!-- kill-zee -->

A small tactical game in Lua to kill zombies and protect your tower before its too late.

- Spearheaded and implemented the underlying core features and worked on performance optimization.

...remaining projects follow same pattern...
```

> **Adding a new project:** Add a new object to `entries` at any position, add a `<!-- new-slug -->` section.

- [ ] **Step 4: Create education.md**

```markdown
---
entries:
  - institution: "Indian Institute of Technology, Roorkee"
    degree: "Bachelor of Technology"
    field: "Chemical Engineering"
    startDate: "Jul 2018"
    endDate: "Jun 2022"
  - institution: "Gulab Rai Montessori"
    degree: "PCM with Computer Science"
    startDate: "Apr 2015"
    endDate: "Mar 2017"
---
```

- [ ] **Step 5: Create skills.md**

```markdown
---
title: "Skills"
---

## Development Environment

- **OS:** Manjaro i3wm Community Edition
- **IDE:** Highly customized VS Code / IntelliJ with self crafted theme
- **Shell:** Bash, Oh My Zsh, fish-shell, Oh My Fish

## Frameworks & Tools

Java, AWS, Golang, Python, Django, Docker, Kubernetes, React, Node.js, JavaScript, Sass, Git, GraphQL, Kotlin

## Workflow

- Mobile-First, Responsive Design
- Cross Browser Testing & Debugging
- Agile Development & Scrum
```

- [ ] **Step 6: Create achievements.md**

```markdown
---
title: "Achievements"
---

- 1st Place — CSAW Embedded Security Challenge 2020 — National level
- 3rd Place — CSAW Embedded Security Challenge 2020 — Globally
```

- [ ] **Step 7: Create interests.md**

```markdown
---
title: "Interests"
---

I try to make the most out of my time by exploring the latest technological advancements. Apart from being a tech enthusiast, I enjoy most of my time playing guitar. I have an OCD for music and love to have a sorted music library.

When forced indoors, I follow a number of sci-fi genre movies and television shows and a large amount of my free time exploring new advancements in every field. Some of my time is invested in learning how our brain functions.
```

- [ ] **Step 8: Commit**

```bash
git add src/content/
git commit -m "feat: extract all content to 7 markdown files (one per section)"
```

---

### Task 3: Build Layout, Navigation, and Section Components

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/SideNav.astro`
- Create: `src/components/Section.astro`
- Create: `src/components/ExpCard.astro`
- Create: `src/components/ProjectCard.astro`

- [ ] **Step 1: Create BaseLayout.astro**

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/globals.css';

interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
    />
  </head>
  <body class="antialiased bg-navy text-slate">
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Create SideNav.astro**

```astro
---
// src/components/SideNav.astro
const sections = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'education', label: 'Education' },
  { id: 'interests', label: 'Interests' },
];
---

<aside class="fixed top-0 left-0 z-50 h-screen w-[40vw] max-w-md bg-navy flex-col justify-between p-12 hidden lg:flex">
  <div>
    <h1 class="text-5xl font-bold text-slate-lightest mb-2">Adrij Shikhar</h1>
    <h2 class="text-xl text-slate-light mb-4">Senior Software Engineer</h2>
    <p class="text-slate text-sm max-w-xs mb-8">
      I build scalable data platforms and craft software that pushes boundaries.
    </p>
    <nav>
      <ul class="flex flex-col gap-1">
        {sections.map((s, i) => (
          <li>
            <a
              class="group flex items-center gap-3 py-2 text-sm text-slate hover:text-slate-lightest transition-colors nav-link"
              href={`#${s.id}`}
              data-section={s.id}
            >
              <span class="h-px w-8 bg-slate-light/30 group-hover:w-16 group-hover:bg-slate-lightest transition-all"></span>
              <span class="font-mono text-xs text-slate/60">0{i + 1}.</span>
              <span class="uppercase tracking-widest text-xs">{s.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  </div>
  <div class="flex flex-col gap-4">
    <div class="flex gap-4">
      {[
        { icon: 'fab fa-github', url: 'https://github.com/adrijshikhar/' },
        { icon: 'fab fa-linkedin-in', url: 'https://www.linkedin.com/in/adrij-shikhar' },
        { icon: 'fab fa-dev', url: 'https://dev.to/adrijshikhar' },
        { icon: 'fa fa-envelope', url: 'mailto:ashikhar@ee.iitr.ac.in' },
      ].map((s) => (
        <a class="text-slate hover:text-accent transition-colors text-lg" href={s.url} target="_blank" rel="noreferrer noopener">
          <i class={s.icon}></i>
        </a>
      ))}
    </div>
    <a class="text-accent text-sm font-mono hover:underline" href="/assets/resume.pdf" download="Adrij Shikhar Resume.pdf">
      Download Resume &darr;
    </a>
  </div>
</aside>

<!-- Mobile nav -->
<nav class="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-md border-b border-navy-light lg:hidden">
  <div class="flex items-center justify-between px-6 py-4">
    <span class="font-mono text-accent text-sm">AS</span>
    <button id="mobile-menu-btn" class="text-slate hover:text-accent transition-colors" aria-label="Toggle navigation">
      <i class="fas fa-bars text-lg"></i>
    </button>
  </div>
  <div id="mobile-menu" class="hidden px-6 pb-4">
    <ul class="flex flex-col gap-1">
      {sections.map((s, i) => (
        <li>
          <a class="block py-2 text-slate hover:text-accent transition-colors text-sm" href={`#${s.id}`}>
            <span class="font-mono text-accent/60 mr-2">0{i + 1}.</span>{s.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
</nav>

<script>
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  btn?.addEventListener('click', () => menu?.classList.toggle('hidden'));
  menu?.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => menu?.classList.add('hidden'))
  );

  // Scroll-spy for desktop nav
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            const isActive = link.getAttribute('data-section') === entry.target.id;
            link.classList.toggle('text-slate-lightest', isActive);
            link.querySelector('span:first-child')?.classList.toggle('w-16', isActive);
            link.querySelector('span:first-child')?.classList.toggle('bg-slate-lightest', isActive);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -60% 0px' }
  );
  sections.forEach((s) => observer.observe(s));
</script>
```

- [ ] **Step 3: Create Section.astro**

```astro
---
// src/components/Section.astro
interface Props {
  id: string;
  title: string;
  index: number;
}

const { id, title } = Astro.props;
---

<section class="py-24 scroll-mt-24" id={id}>
  <h2 class="flex items-center gap-4 text-2xl font-semibold text-slate-lightest mb-10">
    <span class="font-mono text-accent text-xl">0{Astro.props.index}.</span>
    {title}
    <span class="h-px flex-1 bg-navy-lighter"></span>
  </h2>
  <slot />
</section>
```

- [ ] **Step 4: Create ExpCard.astro**

```astro
---
// src/components/ExpCard.astro
interface Props {
  position: string;
  company: string;
  companyLink?: string;
  location: string;
  startDate: string;
  endDate: string;
  tagline?: string;
}

const { position, company, companyLink, location, startDate, endDate, tagline } = Astro.props;
---

<div class="group relative mb-12 rounded-md p-6 transition-all hover:bg-navy-light/50 hover:shadow-lg border-l-2 border-transparent hover:border-accent">
  <div class="flex flex-col md:flex-row justify-between mb-3">
    <div class="flex-1">
      <h3 class="text-lg font-medium text-slate-lightest group-hover:text-accent transition-colors">{position}</h3>
      <div class="text-sm">
        {companyLink ? (
          <a href={companyLink} target="_blank" rel="noreferrer noopener">{company}</a>
        ) : <span class="text-accent">{company}</span>}
        <span class="text-slate/50 mx-2">&middot;</span>
        <span class="text-slate/70">{location}</span>
      </div>
    </div>
    <div class="md:text-right mt-1 md:mt-0 shrink-0">
      <span class="font-mono text-xs text-slate/60">{startDate} — {endDate}</span>
    </div>
  </div>
  {tagline && <p class="text-slate/70 text-sm italic mb-3">{tagline}</p>}
  <div class="prose prose-invert prose-sm max-w-none prose-a:text-accent prose-strong:text-slate-lightest">
    <slot />
  </div>
</div>
```

- [ ] **Step 5: Create ProjectCard.astro**

```astro
---
// src/components/ProjectCard.astro
interface Props {
  title: string;
  company: string;
  date: string;
  link?: string;
}

const { title, company, date, link } = Astro.props;
---

<div class="group relative mb-8 rounded-md p-6 transition-all hover:bg-navy-light/50 hover:shadow-lg border-l-2 border-transparent hover:border-accent">
  <div class="flex flex-col md:flex-row justify-between mb-3">
    <div class="flex-1">
      <h3 class="text-lg font-medium text-slate-lightest group-hover:text-accent transition-colors">
        {link ? (
          <a href={link} target="_blank" rel="noreferrer noopener" class="hover:underline">
            {title} <span class="text-xs">&#8599;</span>
          </a>
        ) : title}
      </h3>
      <div class="text-sm text-accent/80">{company}</div>
    </div>
    <div class="md:text-right mt-1 md:mt-0 shrink-0">
      <span class="font-mono text-xs text-slate/60">{date}</span>
    </div>
  </div>
  <div class="prose prose-invert prose-sm max-w-none prose-a:text-accent prose-strong:text-slate-lightest">
    <slot />
  </div>
</div>
```

- [ ] **Step 6: Verify components render**

Run: `bun run dev`
Expected: Layout, sidebar, components render correctly

- [ ] **Step 7: Commit**

```bash
git add src/layouts/ src/components/SideNav.astro src/components/Section.astro src/components/ExpCard.astro src/components/ProjectCard.astro
git commit -m "feat: add dark-themed layout, sidebar nav with scroll-spy, and card components"
```

---

### Task 4: Wire Up Index Page with Content

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Build the full index page**

The index page reads all 7 markdown files, parses frontmatter + body, splits body content by `<!-- slug -->` markers for experience/projects, and renders everything through the components.

```astro
---
// src/pages/index.astro
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import BaseLayout from '../layouts/BaseLayout.astro';
import SideNav from '../components/SideNav.astro';
import Section from '../components/Section.astro';
import ExpCard from '../components/ExpCard.astro';
import ProjectCard from '../components/ProjectCard.astro';

function readContent(filename: string) {
  const raw = readFileSync(join(process.cwd(), 'src/content', filename), 'utf-8');
  const { data, content } = matter(raw);
  return { meta: data, content, raw };
}

function splitBySlug(content: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const parts = content.split(/<!--\s*([\w-]+)\s*-->/);
  for (let i = 1; i < parts.length; i += 2) {
    sections[parts[i]] = parts[i + 1]?.trim() || '';
  }
  return sections;
}

const about = readContent('about.md');
const experience = readContent('experience.md');
const projects = readContent('projects.md');
const education = readContent('education.md');
const skills = readContent('skills.md');
const achievements = readContent('achievements.md');
const interests = readContent('interests.md');

const expSections = splitBySlug(experience.content);
const projSections = splitBySlug(projects.content);
---

<BaseLayout title="Adrij Shikhar">
  <SideNav />

  <main class="lg:ml-[40vw] lg:max-w-2xl px-6 lg:px-12 py-24">
    <div class="human-view">

      <!-- About -->
      <section class="min-h-[60vh] flex flex-col justify-center mb-24" id="about">
        <p class="font-mono text-accent mb-5">Hi, my name is</p>
        <h1 class="text-5xl lg:text-6xl font-bold text-slate-lightest mb-4">{about.meta.name}.</h1>
        <h2 class="text-3xl lg:text-4xl font-bold text-slate mb-6">{about.meta.tagline}</h2>
        <div class="prose prose-invert prose-lg max-w-xl text-slate mb-8" set:html={marked(about.content)} />
      </section>

      <!-- Experience -->
      <Section id="experience" title="Experience" index={1}>
        {experience.meta.entries.map((exp: any) => (
          <ExpCard {...exp}>
            <div set:html={marked(expSections[exp.slug] || '')} />
          </ExpCard>
        ))}
      </Section>

      <!-- Skills -->
      <Section id="skills" title="Skills" index={2}>
        <div class="prose prose-invert max-w-none prose-a:text-accent" set:html={marked(skills.content)} />
      </Section>

      <!-- Projects -->
      <Section id="projects" title="Projects" index={3}>
        {projects.meta.entries.map((proj: any) => (
          <ProjectCard {...proj}>
            <div set:html={marked(projSections[proj.slug] || '')} />
          </ProjectCard>
        ))}
      </Section>

      <!-- Achievements -->
      <Section id="achievements" title="Achievements" index={4}>
        <div class="prose prose-invert max-w-none prose-a:text-accent" set:html={marked(achievements.content)} />
      </Section>

      <!-- Education -->
      <Section id="education" title="Education" index={5}>
        {education.meta.entries.map((edu: any) => (
          <div class="group flex flex-col md:flex-row justify-between mb-8 p-4 rounded-md hover:bg-navy-light/50 transition-all">
            <div class="flex-1">
              <h3 class="text-lg font-medium text-slate-lightest">{edu.institution}</h3>
              <div class="text-accent text-sm">{edu.degree}</div>
              {edu.field && <p class="text-slate/70 text-sm">{edu.field}</p>}
            </div>
            <div class="md:text-right mt-1 md:mt-0">
              <span class="font-mono text-xs text-slate/60">{edu.startDate} — {edu.endDate}</span>
            </div>
          </div>
        ))}
      </Section>

      <!-- Interests -->
      <Section id="interests" title="Interests" index={6}>
        <div class="prose prose-invert max-w-none text-slate" set:html={marked(interests.content)} />
      </Section>

      <!-- Footer -->
      <footer class="text-center py-12 text-slate/50 text-xs font-mono">
        <p>Built with Astro & Tailwind</p>
      </footer>

    </div>
  </main>
</BaseLayout>
```

Note: Install `gray-matter` and `marked` as dependencies:

```bash
bun add gray-matter marked
```

- [ ] **Step 2: Verify all sections render**

Run: `bun run dev`
Expected: All sections display with correct content from markdown files, dark theme applied

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro package.json bun.lockb
git commit -m "feat: wire index page to markdown content files"
```

---

### Task 5: Implement Human/Machine Toggle

**Files:**
- Create: `src/components/ViewToggle.tsx`
- Create: `src/styles/machine.css`
- Modify: `src/pages/index.astro`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add build-time raw markdown assembly to index.astro**

Add to the frontmatter of `src/pages/index.astro`:

```typescript
function stripFrontmatter(raw: string): string {
  return raw.replace(/^---[\s\S]*?---\n*/, '');
}

function formatExpEntry(entry: any, body: string): string {
  return `### ${entry.position} @ ${entry.company} (${entry.startDate} — ${entry.endDate})\n\n${body}`;
}

function formatProjEntry(entry: any, body: string): string {
  const header = entry.link ? `### [${entry.title}](${entry.link}) — ${entry.company}` : `### ${entry.title} — ${entry.company}`;
  return `${header}\n\n${body}`;
}

const rawMarkdown = [
  `# ${about.meta.name}\n\n${about.content}`,
  `\n---\n\n## Experience\n\n${experience.meta.entries.map((e: any) => formatExpEntry(e, expSections[e.slug] || '')).join('\n\n---\n\n')}`,
  `\n---\n\n## Skills\n\n${skills.content}`,
  `\n---\n\n## Projects\n\n${projects.meta.entries.map((p: any) => formatProjEntry(p, projSections[p.slug] || '')).join('\n\n---\n\n')}`,
  `\n---\n\n## Achievements\n\n${achievements.content}`,
  `\n---\n\n## Education\n\n${education.meta.entries.map((e: any) => `### ${e.institution}\n\n${e.degree}${e.field ? ` — ${e.field}` : ''}`).join('\n\n')}`,
  `\n---\n\n## Interests\n\n${interests.content}`,
].join('\n');
```

Add before `</BaseLayout>`:

```astro
<script define:vars={{ rawMarkdown }}>
  window.__RAW_MARKDOWN__ = rawMarkdown;
</script>
```

- [ ] **Step 2: Create ViewToggle.tsx**

```tsx
// src/components/ViewToggle.tsx
import { useState } from 'react';

export default function ViewToggle() {
  const [mode, setMode] = useState<'human' | 'machine'>('human');

  const toggle = () => {
    const next = mode === 'human' ? 'machine' : 'human';
    setMode(next);
    document.body.classList.toggle('machine-mode', next === 'machine');
    document.querySelector('.human-view')?.classList.toggle('hidden', next === 'machine');
    const mv = document.querySelector('.machine-view');
    if (mv) {
      mv.classList.toggle('hidden', next === 'human');
      if (next === 'machine' && !mv.getAttribute('data-loaded')) {
        const raw: string = (window as any).__RAW_MARKDOWN__ || '';
        const withLinks = raw.replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>',
        );
        const withBold = withLinks.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        mv.innerHTML = `<pre class="machine-pre">${withBold}</pre>`;
        mv.setAttribute('data-loaded', 'true');
      }
    }
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-[1100] flex items-center gap-2 bg-navy-light/90 border border-navy-lighter rounded-full px-4 py-2 cursor-pointer backdrop-blur-md font-mono text-sm"
      aria-label="Toggle human/machine view"
    >
      <span className={`transition-colors ${mode === 'human' ? 'text-slate-lightest font-bold' : 'text-slate/50'}`}>
        human
      </span>
      <span className="relative w-10 h-5 bg-navy-lighter rounded-full">
        <span
          className={`absolute top-0.5 w-4 h-4 bg-accent rounded-full transition-all ${
            mode === 'machine' ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </span>
      <span className={`transition-colors ${mode === 'machine' ? 'text-slate-lightest font-bold' : 'text-slate/50'}`}>
        machine
      </span>
    </button>
  );
}
```

- [ ] **Step 3: Create machine.css**

```css
/* src/styles/machine.css */
body.machine-mode nav,
body.machine-mode aside {
  display: none !important;
}

body.machine-mode main {
  margin-left: 0 !important;
  max-width: 100% !important;
}

.machine-view {
  max-width: 80ch;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.machine-pre {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.7;
  color: #8892b0;       /* slate — same as body text */
  white-space: pre-wrap;
  word-wrap: break-word;
}

.machine-pre a {
  color: #64ffda;       /* accent — same as links */
  text-decoration: underline;
}

.machine-pre a:hover {
  opacity: 0.8;
}

.machine-pre strong {
  color: #ccd6f6;       /* slate-lightest — same as headings */
}

.hidden {
  display: none !important;
}
```

- [ ] **Step 4: Import machine.css in BaseLayout.astro**

Add to imports:
```typescript
import '../styles/machine.css';
```

Add to `<head>`:
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" />
```

- [ ] **Step 5: Add toggle and machine view container to index.astro**

Add import:
```typescript
import ViewToggle from '../components/ViewToggle.tsx';
```

Add after `<SideNav />`:
```astro
<ViewToggle client:load />
<div class="machine-view hidden" />
```

- [ ] **Step 6: Verify toggle works**

Run: `bun run dev`
Expected:
1. Toggle button in top-right corner styled with navy/accent colors
2. Human mode: dark themed resume with sidebar
3. Machine mode: nav disappears, raw markdown in monospace on dark background, links clickable in teal
4. Toggling back restores human mode

- [ ] **Step 7: Commit**

```bash
git add src/components/ViewToggle.tsx src/styles/machine.css src/pages/index.astro src/layouts/BaseLayout.astro
git commit -m "feat: implement human/machine view toggle with raw markdown display"
```

---

### Task 6: Clean Up Old Files

**Files:**
- Delete: old Preact source files
- Modify: `.gitignore`

- [ ] **Step 1: Remove old Preact source files**

```bash
rm -rf src/App.js src/index.js src/sw.js src/template.html
rm -rf src/components/home src/components/about src/components/experience src/components/projects src/components/skills src/components/education src/components/achievements src/components/interests src/components/side-nav-bar src/components/common
rm -rf src/components/index.js
rm -rf src/helpers src/assets/vendor src/assets/js src/assets/images src/assets/resume.pdf src/assets/favicon.ico src/assets/manifest.json
rm -rf src/styles/main.scss src/styles/_variables.scss src/styles/_mixins.scss src/styles/_global.scss src/styles/_nav.scss src/styles/_resume-item.scss src/styles/_bootstrap-overrides.scss src/styles/_font-awesome-overrides.scss
rm -f jsconfig.json .travis.yml .eslintrc.js
rm -rf tests/
```

- [ ] **Step 2: Update .gitignore**

Add:
```
dist/
.astro/
node_modules/
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove old Preact source files, Bootstrap styles, and legacy config"
```

---

### Task 7: Build, Verify, and Deploy

**Files:**
- None new — verification only

- [ ] **Step 1: Production build**

```bash
bun run build
```

Expected: Build succeeds with no errors, output in `dist/`

- [ ] **Step 2: Preview production build**

```bash
bun run preview
```

Expected: Site at localhost:4321 matches dev version, toggle works, all sections render

- [ ] **Step 3: Verify all content**

Check each section:
- About: name, tagline, bio prose
- Experience: all 9 entries with dates, descriptions, company links
- Skills: dev environment, frameworks, workflow
- Projects: all 15 entries with links where applicable
- Achievements: both awards
- Education: both entries
- Interests: both paragraphs
- Machine mode: full raw markdown, links clickable in teal, smooth toggle
- Mobile: hamburger nav, stacked layout, toggle accessible

- [ ] **Step 4: Deploy**

```bash
bun run deploy
```

Expected: Site deploys to GitHub Pages master branch

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete migration to Astro + React + Tailwind with human/machine toggle"
```
