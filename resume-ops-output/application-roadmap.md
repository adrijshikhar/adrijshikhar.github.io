# Application Roadmap — AI / Data Infra Senior Backend Roles

Generated: 2026-05-01
Target: Adrij Shikhar — 4 YOE, currently Senior SDE @ Hevo Data
Goal: Land a senior backend role in 8–12 weeks at one of the Fit-5 companies.

---

## TL;DR — Where you stand

You are **already 80% qualified** for Bucket E (data-infra-with-AI). Your CDC framework, SCD Type 2 ship, and connector-platform work map directly onto Airbyte, Fivetran, Estuary, and dbt's daily problems. The 20% gap is **public proof of work** — your strongest output is private (hevoio org) and the world can't see it.

For Bucket B (AI infra) and Bucket C (AI dev tools), you have an unusual edge for a backend engineer — you've actually shipped MCP servers and a Claude Code plugin. The gap there is **AI/ML literacy depth** (transformer internals, inference serving, eval frameworks).

The fastest unlock for both: 4–6 hours/week of public OSS contribution + 1 published blog post per month. Everything else is interview prep.

---

## What each bucket actually expects

### Bucket E — Data infra + AI (your strongest fit)
*Airbyte, Fivetran, Confluent, Estuary, dbt Labs, ClickHouse, Databricks*

| Expectation | Your status |
|---|---|
| Deep CDC, streaming, schema-evolution knowledge | ✅ Strong |
| Connector framework design, polymorphic offsets | ✅ Strong |
| SCD Type 2 / history mode across warehouses | ✅ Just shipped |
| Performance & scale (25K+ objects, JVM tuning, k6) | ✅ Strong |
| Production reliability at scale (P0/P1 incident bench) | ✅ Strong (200+) |
| **Public OSS contributions** (especially Airbyte CDK, Debezium, dbt-core) | ❌ Gap — almost all work is in private hevoio repos |
| **Cloud-native multi-tenant** (K8s operators, helm, multi-region) | ⚠️ Partial — Fargate yes, K8s lighter |
| **Data warehouse internals** (Snowflake query plans, BigQuery slots, ClickHouse merge-tree) | ⚠️ User-level, not internals-level |
| **System design** at scale, written + verbal | ⚠️ Practice required |
| LeetCode (medium, occasional hard) | ⚠️ Practice required |

**What "good" looks like for these companies:** Candidate has merged a non-trivial PR into Airbyte CDK / Debezium / dbt-core; can whiteboard a CDC connector for a new source under time pressure; can articulate trade-offs between Snowflake `MERGE` vs Redshift `DELETE+UPDATE+INSERT` (you literally just shipped this).

---

### Bucket B — AI Infrastructure
*Modal, Together AI, Hugging Face, Weights & Biases, Replicate, RunPod, Anyscale*

| Expectation | Your status |
|---|---|
| Distributed systems for GPU workloads | ✅ Transferable |
| Container orchestration (K8s, scheduling) | ⚠️ Light — ECS/Fargate experience, not K8s deep |
| **Inference-serving stack**: Triton, vLLM, TGI, KV cache, batching | ❌ Gap |
| **Training pipelines**: Ray, Slurm, distributed training basics | ❌ Gap |
| Python (Modal/Replicate are Python-first) | ⚠️ Functional Python, not idiomatic-Python depth |
| **Transformer internals literacy** (don't need to train models, but need to discuss attention, KV cache, quantization, speculative decoding) | ❌ Gap |
| Networking (RDMA, InfiniBand, NCCL) | ❌ Most candidates don't have this — fine to be light |
| OSS / arxiv awareness | ⚠️ Partial |

**What "good" looks like:** Candidate has built a small inference server (vLLM-based or hand-rolled), can discuss why batching matters for throughput vs. latency, has read a recent paper (Flash Attention, Mamba, MoE routing) and can summarize it.

---

### Bucket C — AI Dev Tools
*Sourcegraph, Vercel, Pydantic, Replit, LangChain, LlamaIndex, Cursor*

| Expectation | Your status |
|---|---|
| **Built actual AI dev tools** | ✅ Unusual strength — hevo-ai-plugin, MCP servers |
| Strong API design (REST, RPC) | ✅ Strong |
| Frontend awareness (TS, React) | ⚠️ Light — your portfolio site, not production |
| **LLM application patterns** (RAG, tool use, evals, prompt engineering) | ⚠️ Tool-use yes (MCP), RAG/evals partial |
| Python ecosystem fluency (Pydantic, LangChain, FastAPI) | ⚠️ FastMCP yes, but not LC/LI deep |
| Open-source presence | ❌ Gap |
| Eval frameworks (LangSmith, ragas, custom) | ❌ Gap |
| Real-time / streaming UX (SSE, WebSockets) | ⚠️ Light |

**What "good" looks like:** Candidate has a public GitHub repo demonstrating LLM tool-use, RAG, or eval; can discuss why Pydantic models matter for structured outputs; has used at least one of LangChain/LlamaIndex in anger.

---

### Cross-cutting senior expectations (all buckets)

1. **System design interviews** — design Airbyte's connector platform, Confluent's streaming pipeline, Modal's serverless GPU scheduler. 90 min, whiteboard, end-to-end.
2. **Behavioral / leadership** — STAR-format stories: hardest bug, biggest project, conflict resolution, what you'd do differently. Senior bar = ownership + cross-team impact + mentorship evidence.
3. **Coding interview** — LeetCode medium / occasional hard, often with real-world spin (rate limiter, LRU cache, CDC offset tracker).
4. **Take-home / pair programming** — 2–4 hour exercise, often in their stack. Fivetran/Airbyte/dbt: build a small connector or transform.
5. **Written communication** — design doc samples, blog posts, RFC threads. Senior roles weigh this heavily.

---

## 12-Week Roadmap

> Calibrated for ~10 hrs/week side-time on top of your day job. Every week ends with a checkpoint.

### Weeks 1–2 — Foundation: public proof of work + interview prep cadence

**Goal:** Make your work visible. Set up a daily interview-prep loop.

- [ ] **Publish 3 deep technical blog posts** to dev.to or your portfolio (you already have it). Topics:
  1. *"Shipping SCD Type 2 across Snowflake, BigQuery, and Redshift — the warehouse-by-warehouse playbook"* — drop the actual SQL templates, talk about why Redshift uses DELETE+UPDATE+INSERT instead of MERGE.
  2. *"Building a Claude Code plugin that 12 engineers actually use"* — your hevo-ai-plugin journey, MCP server design lessons.
  3. *"Migrating 9 connectors to a new CDK without downtime"* — the v1→v2 framework migration playbook.
- [ ] **Open up at least one piece of public OSS work** — ideas:
  - A Postman → MCP server generator (extract from hevo-2-starter, redact internal stuff)
  - A small public Debezium SMT (Single Message Transform) for a common CDC pain point
  - Contribution-ready PR draft for Airbyte CDK (browse their `good-first-issue` label)
- [ ] **Daily LeetCode**: 1 medium/day, 5 days/week. Topics: arrays, hashmaps, trees, graphs, DP, sliding window. Use Neetcode 150 as your spine.
- [ ] **System design**: read *Designing Data-Intensive Applications* Ch. 11 (stream processing) + Ch. 12 (future of data systems) if you haven't.

### Weeks 3–4 — Bucket E offensive: apply to your strongest fits

**Goal:** Apply to Airbyte, Fivetran, dbt Labs, Estuary, Confluent — these are your highest-conversion targets.

- [ ] **Tailor resume per company**: drop the AI-tooling block from the Airbyte/Fivetran versions (it's noise for them); lead with CDC + SCD Type 2. Save Bucket B/C variants for later.
- [ ] **Cover letter template** — 3 short paragraphs:
  1. Specific hook (e.g., *"I just shipped Fivetran-identical SCD Type 2 on Redshift…"*)
  2. Why them specifically (cite a public engineering blog post they wrote, a feature you've used, an open issue you'd own)
  3. Logistics + close
- [ ] **Cold-DM 5 engineers** at each target on LinkedIn — short message, no ask. Goal: warm referral pipeline.
- [ ] **Submit your first Airbyte CDK PR** — even a docs fix or test case. The merge gives you a permanent talking point.
- [ ] **Continue daily LC + 1 system design problem on weekends** (Hello Interview, ByteByteGo, or Alex Xu Vol 2).

### Weeks 5–6 — Bucket B / C: close the AI literacy gap

**Goal:** Become the rare backend engineer who can hold a credible inference / LLM-systems conversation.

- [ ] **Build a small public side project** — pick one:
  - **Inference toy**: vLLM-served Llama-3 8B with a request batcher in Python, exposing OpenAI-compatible API. Push to GitHub with a README showing throughput numbers.
  - **RAG eval harness**: small library that runs a fixed set of questions through a RAG pipeline and tracks accuracy/latency. Publish numbers.
  - **MCP server for a public API** (GitHub, Notion, etc.) — already in your wheelhouse, easy ship.
- [ ] **Read 5 papers** (skim, don't grind):
  1. Flash Attention 2 — why batching/memory matters
  2. PagedAttention / vLLM paper — KV cache management
  3. Mixtral / MoE routing — sparse compute
  4. RAG paper (Lewis et al.) — retrieval baseline
  5. Speculative decoding — latency reduction tricks
- [ ] Write 1 blog post summarizing what surprised you across the 5 papers. This becomes interview talking-points material.
- [ ] Apply to: **Hugging Face, Modal, Weights & Biases, Together AI, Vercel, Sourcegraph, Pydantic** — all remote-friendly.
- [ ] **Mock interview**: 2 sessions on interviewing.io or Pramp (system design + coding).

### Weeks 7–8 — Behavioral + system design polish; first onsite cycle

**Goal:** Convert applications into onsites. Practice the senior-level signals.

- [ ] **Write 12 STAR stories** covering: hardest bug, biggest cross-team project, mentorship, conflict, a time you said no, a time you took ownership of someone else's mess, a time you shipped under uncertainty. Draft each in 200 words.
- [ ] **System design drill list** — practice all of these once on whiteboard, time-boxed to 60 min:
  - Design a CDC connector platform (Fivetran)
  - Design a streaming pipeline like Confluent / Kafka Connect
  - Design Modal's serverless GPU scheduler
  - Design Hugging Face Spaces (deploy ML demos)
  - Design a vector DB (Pinecone, Weaviate)
  - Design a coding-agent backend (Cursor, Replit)
- [ ] **Onsite logistics**: prepare your dev environment, calendar, post-mortem template for each interview.
- [ ] If you have onsite invitations by now, optimize sleep + low-novelty workload during interview weeks.

### Weeks 9–10 — Recovery + offers + India-specific shortlist

**Goal:** Convert offers; explore India-AI-native if remote isn't materializing.

- [ ] **Negotiate**: never accept the first number. Use competing offers (or signal of one) for leverage.
- [ ] **Apply to Bangalore/Hyderabad on-site**: Confluent BLR, Databricks BLR, Glean, Atlassian Rovo, Sarvam AI, Atomicwork, Cresta Hyderabad, Observe.AI, Composio — strong India-eng cultures.
- [ ] **Reference list**: ping Tariq Iqbal (Atlassian) and Shubham Goyal (Powerplay) for warmups now, not when companies ask.

### Weeks 11–12 — Final push or pivot

**Goal:** Close, or recalibrate.

- [ ] If converting: trip-decline rejected offers cleanly, give 30 days notice at Hevo, set up handover docs (your bus-factor on hermes/loader-base/ai-plugin is high).
- [ ] If not converting: post-mortem each rejection. Common patterns:
  - System design too vague → drill 5 more
  - Coding too slow → 30/day for 2 weeks
  - Behavioral too generic → re-write STAR with metrics
- [ ] Adjust roadmap and re-cycle.

---

## Per-company tactical notes

| Company | Best entry point | Specific prep |
|---|---|---|
| **Airbyte** | Submit PR to airbytehq/airbyte CDK; mention in cover letter | Read CDK docs, build a toy connector locally |
| **Fivetran** | Bangalore office direct apply + LI referral | Read their engineering blog on incremental sync; you literally shipped their Redshift SCD pattern |
| **Confluent** | BLR office; massive eng team | Brush up on Kafka internals: ISR, log compaction, exactly-once |
| **dbt Labs** | Fully remote global; apply directly | Build a small dbt project; understand the DAG model |
| **Estuary** | Real-time CDC = you. Direct apply + email founder | Read their blog on Flow architecture |
| **ClickHouse** | Apply via remote portal | Study merge-tree, materialized views, sharding |
| **Databricks BLR** | Open req on careers; 14 new BLR teams expanding | Lakehouse mental model, Mosaic AI |
| **Hugging Face** | Apply via Workable, ship public repo first | HF Hub API knowledge, small Spaces demo |
| **Modal** | Apply + Twitter presence helps | Build a Modal app, write blog on cold-start times |
| **W&B** | Remote India hires; apply direct | Track an experiment on wandb publicly |
| **Sourcegraph** | Cody team; remote India | Code-search mental model, AST parsing |
| **Vercel** | Distributed remote hiring | Build something with v0 + Next.js, tweet it |
| **Pydantic** | Small team, OSS-first | Contribute to pydantic or pydantic-ai; they care about OSS |
| **Sarvam AI** | Bangalore on-site, 20+ open eng roles | Read their LLM blog posts; mention specific models |
| **Glean** | BLR office, large eng team | Strong on enterprise search infra; review their blog |

---

## What to drop

- **Frontend deep-dive** — your portfolio is enough. Don't try to become a frontend engineer.
- **ML model training** — backend engineers are hired to build *around* models, not train them. Don't waste cycles on Kaggle.
- **Massive cert grinds** — no AWS/GCP cert moves the needle for senior backend at these companies.
- **Trying to apply to all 100** — pick 25, go deep on tailoring, get a real referral on each.

---

## Single biggest leverage move

If you only do one thing this month: **publish the 3 blog posts** above and get **one merged Airbyte/Debezium PR**. That single artifact is what converts your private 4-year track record into a public credibility signal. Everything else is downstream of "can the recruiter Google you and find evidence."
