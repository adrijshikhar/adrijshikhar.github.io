# Resume Update — Information Sourcing Plan

## Context
~4.5 years at Hevo Data (Sep 2021 intern → Jun 2022 Senior SWE → Present). Portfolio site has experience bullets but needs refreshing with recent work, better quantification, and resume-ready framing.

## Sources to Mine

### 1. Git History (GitHub/GitLab)
- **What:** Commit logs, PR descriptions, PR reviews given/received
- **Why:** Objective record of every feature shipped, bug fixed, and code reviewed
- **How:**
  - `git log --author="<your-name>" --since="2021-09-01" --oneline | wc -l` for volume
  - `gh pr list --author=@me --state=merged --limit=500` for merged PRs
  - Look at PR titles/descriptions — they often contain the "why" and impact
  - Note repos you contributed to (shows breadth)
- **Yields:** Feature list, technical scope, collaboration patterns

### 2. Jira / Linear / Issue Tracker
- **What:** Tickets you were assigned, epics you led, sprint velocity
- **Why:** Shows ownership scope — were you doing tasks or leading epics?
- **How:**
  - Filter by assignee = you, sorted by date
  - Look for epics/stories you created (leadership signal)
  - Note ticket labels: "P0", "customer-escalation", "tech-debt" etc.
- **Yields:** Project ownership, priority of work, cross-team collaboration

### 3. Internal Docs (Confluence / Notion / Google Docs)
- **What:** Design docs, RFCs, ADRs, postmortems, runbooks you authored
- **Why:** Writing design docs = senior-level impact. Authoring shows thought leadership
- **How:**
  - Search docs authored by you
  - Look for docs you were tagged as reviewer on
  - Check for any architecture decision records
- **Yields:** System design skills, technical writing, decision-making evidence

### 4. Performance Reviews / Self-Reviews (cues.xto10x.com)
- **What:** Past self-assessments, manager feedback, peer feedback, promo packets
- **Why:** Already distilled accomplishments with impact framing — gold mine
- **How:**
  - Check **cues.xto10x.com** (company's review platform)
  - Look at all review cycles (quarterly/half-yearly)
  - Your promo packet (intern → SWE → Senior) is especially valuable
  - Export/screenshot your self-reviews and peer feedback
- **Yields:** Pre-written impact statements, peer validation, growth narrative

### 5. Slack / Teams Messages
- **What:** Shoutouts, thank-you messages, announcements of launches, incident channels
- **Why:** Captures impact that never made it to docs — "thanks for fixing X, it saved us Y"
- **How:**
  - Search your name in #shoutouts, #general, #engineering channels
  - Search for messages you sent in #launches or #releases
  - Look at incident channels you participated in
- **Yields:** Peer recognition, customer impact anecdotes, reliability contributions

### 6. Email / Calendar
- **What:** Cross-team threads, customer escalation threads, on-call rotations
- **Why:** Shows scope beyond your immediate team
- **How:**
  - Search for threads where you were the technical point of contact
  - Check calendar for presentations, demos, knowledge-sharing sessions
  - Look for any external-facing work (customer calls, partner integrations)
- **Yields:** Communication skills, customer-facing experience, cross-functional work

### 7. 1:1 Notes with Manager
- **What:** Topics discussed, goals set, feedback received
- **Why:** Often captures strategic context — why you were put on a project
- **How:**
  - Check shared 1:1 docs
  - Look for quarterly goals/OKRs you set
- **Yields:** Strategic framing, career narrative, manager's perspective on your impact

### 8. Your Own Portfolio Site (Current State)
- **What:** The bullets already on adrijshikhar.github.io
- **Why:** Baseline to build from — some bullets are strong, others need refreshing
- **Current gaps identified:**
  - "hevo-senior" section is comprehensive but could be more recent
  - No mention of team size led, mentoring, hiring involvement
  - Skills section is outdated (still lists Manjaro i3wm, no mention of CDC/Debezium/Temporal)
  - No "promoted from intern to senior in X months" narrative

## Action Plan (After Sourcing)

1. **Gather** — Spend 2-3 days collecting from the sources above
2. **Categorize** — Group accomplishments into themes: Scale, Reliability, Features, Leadership, Customer Impact
3. **Quantify** — For each bullet, find or estimate a number (users, %, $, time saved)
4. **Frame** — Use "Accomplished X by doing Y, resulting in Z" format
5. **Update** — Modify `src/content/experience.md` and `src/content/skills.md`
6. **Export** — Generate a PDF resume from the updated content (or maintain a separate resume)
