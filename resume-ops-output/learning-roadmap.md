# 8-Week Switch Plan — Senior Backend → AI / Data Infra

Generated: 2026-05-01
Constraint: **2 months to switch.** Learning-first, but applications start in week 4.
Time budget: ~12–15 hrs/week (slightly above the original 10 — the timeline demands it).

---

## The honest reframe

2 months is **not enough time to learn everything from cold**. It IS enough time to:
1. Close the most important AI/inference gap (3 weeks of focused learning)
2. Convert your existing 4-year track record into interview signal (parallel)
3. Run a tight 4–5 week interview cycle (weeks 4–8)

**You will not become a vLLM expert in 8 weeks. You don't need to.** You need to be able to (a) hold credible technical conversations, (b) crush system-design rounds in your strongest area (data infra), and (c) show up sharp on coding rounds.

The plan optimizes for that, not for completeness.

---

## What gets cut from the original 12-week plan

| Phase | Original | Cut to |
|---|---|---|
| Python AI stack | 1 full week | Folded into Phase 2 build sessions |
| Transformer fundamentals | 1 week | 1 weekend (Karpathy in 2 sittings) |
| Inference internals | 3 weeks | 2 weeks |
| Data warehouse internals | 2 weeks | 4–5 days |
| RAG + evals | 2 weeks | 1 weekend |
| GPU + distributed inference | 1 week | Skim only — interview-bait, not deep |
| K8s deep-dive | scheduled | Cut. ECS/Fargate is enough story. |

What stays: **DSA daily** (lethal if missed) and **system design** (your strongest interview surface).

---

## The 8-week plan

### Week 1 — Transformer + inference foundation

**Goal:** Stop hand-waving about how LLMs actually run.

- [ ] **Day 1–2 (weekend ideal):** Karpathy "Let's build GPT from scratch" — watch in two sittings. Type along, don't copy.
- [ ] **Day 3:** Read [The Annotated Transformer](http://nlp.seas.harvard.edu/2018/04/03/attention.html). 2 hrs.
- [ ] **Day 4:** Read [vLLM PagedAttention paper](https://arxiv.org/abs/2309.06180) + [Anyscale continuous batching post](https://www.anyscale.com/blog/continuous-batching-llm-inference). 2 hrs.
- [ ] **Day 5:** Skim [FlashAttention 2](https://arxiv.org/abs/2307.08691) sections 1–3. 1 hr.
- [ ] **Daily:** 1 LeetCode medium (Neetcode 150 — start with arrays/hashing).

**Checkpoint:** Can you explain *out loud* why decode is O(n²) without KV cache and O(n) with? Why PagedAttention exists? What "continuous batching" means? If yes, move on. If no, repeat day 4.

### Week 2 — Run inference for real + serving stack literacy

**Goal:** Get your hands on actual inference. Make the abstract concrete.

- [ ] **Day 1–2:** Spin up vLLM locally (or Modal/RunPod free tier ~$5). Serve Llama-3 8B-Instruct.
- [ ] **Day 3:** Write an `httpx + asyncio` load tester. Plot tokens/sec vs concurrency 1, 4, 16, 64. Confirm continuous batching with your eyes. ~3 hrs.
- [ ] **Day 4:** Run the same model at FP16 / INT8 / INT4. Compare throughput + check 5 prompts manually for output quality. ~2 hrs.
- [ ] **Day 5:** Read READMEs of vLLM, TGI, Triton Inference Server, SGLang. Make a 1-page mental cheat-sheet on when to pick each. 1 hr.
- [ ] **Daily:** 1 LeetCode medium.
- [ ] **Saturday:** First system design whiteboard — *Design Modal's serverless GPU scheduler*. 60 min, no looking up answers. Then read 1 reference.

**Checkpoint:** You can describe end-to-end what happens when a request hits vLLM. You've seen tokens/sec move with batch size. You have opinions on quantization.

### Week 3 — Data warehouse internals + RAG/evals (compressed)

**Goal:** Plug the warehouse-internals gap (closest to your existing expertise = fastest ROI). Touch RAG once so you don't bluff in interviews.

**Warehouse (Mon–Wed):**
- [ ] **Day 1:** [Snowflake SIGMOD paper](https://event.cwi.nl/lsde/papers/p215-dageville-snowflake.pdf). All of it. 2 hrs.
- [ ] **Day 2:** [Dremel/BigQuery paper](https://research.google/pubs/pub36632/) sections 1–4. ClickHouse merge-tree docs. 2 hrs.
- [ ] **Day 3:** DuckDB + PyIceberg locally. Create an Iceberg table, write 3 commits, time-travel query. Connect this to your SCD Type 2 work. 2 hrs.

**RAG / evals (Thu–Fri):**
- [ ] **Day 4:** Build a tiny RAG over your `resume-ops-output` markdown — ChromaDB + Claude/local model. Question → top-3 chunks → answer. 2 hrs.
- [ ] **Day 5:** Read [Hamel Husain's evals post](https://hamel.dev/blog/posts/evals/). Write 10 Q/A pairs, run a programmatic + LLM-judge eval. 2 hrs.

- [ ] **Daily:** 1 LeetCode medium.
- [ ] **Saturday:** System design whiteboard — *Design Airbyte / Fivetran's connector platform*. You already know the answer; rehearse articulating it. Then *Design a RAG-as-a-service platform*.

**Checkpoint:** You can compare Snowflake's micro-partitions to BigQuery's slots. You've seen Iceberg snapshots first-hand. You've shipped a working RAG + eval — small, but real.

### Week 4 — Resume polish + first applications + system design intensive

**Goal:** Start the application pipeline NOW. Continue learning JIT for interviews.

**Mon–Tue: Resume + applications**
- [ ] Finalize per-bucket resume variants (Bucket E lead-with-CDC, Bucket B/C lead-with-AI-tooling). The current `/resume` page is the master.
- [ ] Apply to **Bucket E** (highest conversion):
  - Airbyte, Fivetran (Bangalore), dbt Labs, Estuary, Confluent (Bangalore), ClickHouse, Databricks (Bangalore expanding 14 teams)
- [ ] Apply to **Bucket B/C** (longer odds, higher reward):
  - Hugging Face, Modal, Together AI, W&B, Vercel, Sourcegraph, Pydantic, Glean (Bangalore), Replicate
- [ ] Cold-DM 3 engineers per company on LinkedIn. Short messages, no ask. Goal: warm referral pipeline.

**Wed–Sat: Interview prep**
- [ ] **System design — 1 hour every weekday.** Run through:
  - Confluent / Kafka Connect distributed worker pool
  - Design a vector DB (Pinecone)
  - Design a coding agent backend (Cursor)
  - Design Hugging Face Spaces
- [ ] **Daily:** 2 LeetCode mediums (ramped from 1).
- [ ] **Saturday:** 12 STAR stories drafted in 200 words each — hardest bug, biggest cross-team project, mentorship, conflict, said-no, took ownership of mess, shipped under uncertainty. Reuse for every behavioral round.

### Week 5 — First interviews + JIT learning

**Goal:** Recruiter screens convert to technical screens. JIT-learn anything that comes up in feedback.

- [ ] First-round interviews with whoever responded fastest.
- [ ] **After each interview:** 30-min post-mortem. What blew up? Add it to a "to-revisit" list.
- [ ] **JIT learning** based on interview signal — examples:
  - If asked about Kafka internals you fumbled → 2 hr deep-dive on ISR, log compaction, exactly-once
  - If asked about K8s operator patterns → 2 hr read on operator SDK
  - If asked about distributed tracing → review OpenTelemetry context propagation
- [ ] **Daily:** 2 LeetCode mediums + 1 hour system design.
- [ ] Continue applications — cast 5 more applications/week to keep the funnel fed.

### Week 6 — Onsite cycle begins

**Goal:** Convert technical screens to onsites. Optimize for sharpness, not new content.

- [ ] **Reduce learning load.** Stop adding new topics. Drill what you already know.
- [ ] **2 mock interviews** this week — interviewing.io, Pramp, or paid coach. One coding, one system design.
- [ ] **Sleep + cardio**: this is not optional in onsite weeks. Cut anything that isn't interview prep.
- [ ] **Daily:** 1 LeetCode medium (down from 2 — onsites are tiring) + 30 min targeted system design refresh based on which company you're with.

### Week 7 — Onsite peak

**Goal:** Run hot. Most onsites land here.

- [ ] Whatever you're doing: keep doing it. Don't try anything new.
- [ ] **Reference list ready** — Tariq Iqbal (Atlassian) and Shubham Goyal (Powerplay) — give them a heads-up in advance, not when companies ask.
- [ ] **Negotiation prep**: read [Patrick McKenzie — Salary Negotiation](https://www.kalzumeus.com/2012/01/23/salary-negotiation/) once. Once.

### Week 8 — Close + decide

**Goal:** Ship.

- [ ] Stack offers / verbal commits side-by-side.
- [ ] **Never accept the first number.** Use competing offers (or signal of one) for leverage.
- [ ] Decision matrix: comp, manager quality, technical scope, remote viability, runway for the company, your gut.
- [ ] If converting → give 30-day notice at Hevo, document handover (your bus-factor on hermes / loader-base / hevo-ai-plugin is high).
- [ ] If not converting → assess: more interview prep, or accept the timeline slips? Don't auto-extend; reassess from scratch.

---

## Daily template (8 weeks)

| Time | What | Notes |
|---|---|---|
| 6:30–7:30 AM | LeetCode (1–2 mediums) | Before work. Non-negotiable. |
| Lunch (30 min) | Reading queue (papers, docs) | Phone-free |
| 7–9 PM | Hands-on build OR system design OR interview prep | The main learning slot |
| Sunday 2 hr | Buffer / write notes on what you learned | Skipped if exhausted |

**~12–15 hours/week.** Less than the original plan budget (10) because you also need to apply, interview, and not burn out. More than that and you'll start dropping balls at work.

---

## Resource stack (compressed)

### Must
- Karpathy GPT video
- vLLM PagedAttention paper
- Snowflake SIGMOD paper
- Hamel Husain's evals post
- DDIA Ch. 11–12 (skim if you haven't)
- [Hello Interview senior breakdowns](https://www.hellointerview.com/learn/system-design)

### Skim only
- FlashAttention 2 (sections 1–3)
- Dremel paper (sections 1–4)
- Iceberg spec
- LangChain core concepts page

### Tools
- vLLM, llama.cpp (or Ollama)
- DuckDB + PyIceberg
- ChromaDB or Qdrant
- ragas (or just write your own evals — simpler)
- Modal / RunPod free tier for GPU

---

## What NOT to do in 2 months

- **Train any model.** Even a LoRA. Time sink, zero job-market ROI.
- **Build a public OSS project.** You don't have time, and you said skip this.
- **Read all of DDIA.** Skim Ch. 5–7, read 11–12.
- **Master a new framework end-to-end** (LangChain, LlamaIndex). Concept-fluent, not API-fluent.
- **Apply to all 100 companies.** Pick 25, tailor each, work referrals.
- **Switch your primary language.** You're a Java + Python pragmatist. Don't try to become a Python purist by Week 3.

---

## Risk register

| Risk | Mitigation |
|---|---|
| Burnout by Week 5 | Sunday is off. Weeknight cap = 2 hrs. Cardio non-negotiable. |
| Day-job blow-up at Hevo | Be very visible at work in weeks 1–4. Don't let your manager catch you in interview mode. |
| Onsites stack into one week | Negotiate slots; ask recruiters for breathing room. They expect this. |
| First-round flame-outs on LeetCode | Don't skip the morning ritual. 60 problems by Week 8 is the bar. |
| Specific topic gap surfaces in interview | Add to JIT list, study night-of, retest in next round. |
| Salary expectation mismatch | Anchor first, ask their range explicitly, walk if it's low. India senior = ₹70L–1.4Cr base depending on company. |

---

## Single biggest insight

You already have the 4-year track record. The 2-month learning is **defensive** — closing gaps that would otherwise disqualify you. The 2-month application sprint is **offensive** — converting your existing strength into offers.

Don't over-rotate on either. Learn weeks 1–3 hard, apply weeks 4–8 hard, learn JIT throughout. That's the play.

---

## Checkpoints

**End of Week 3:** You can answer the inference internals + warehouse + RAG checkpoint questions. Resume page reflects all this.

**End of Week 5:** 25 applications submitted. 5+ recruiter calls done. 2+ technical screens passed.

**End of Week 7:** ≥2 onsite cycles in flight.

**End of Week 8:** ≥1 offer in hand or clear next step.

If any checkpoint slips by more than a week — stop, reassess, decide if the timeline holds or extends.
