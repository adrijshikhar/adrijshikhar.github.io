# Session Handoff — Learning Roadmap & Interview Prep

**Scope:** Learning + interview prep only. Resume/portfolio split to separate file (`HANDOFF-resume-ops.md`).
**Learning workspace:** `/Users/nemesis/Projects/learning/`
**Plan doc:** `resume-ops-output/learning-roadmap.md`
**Last updated:** 2026-05-31

---

## Context

Adrij Shikhar. Senior SDE @ Hevo Data, 4+ yrs (Java/data-infra). **Constraint: 2 months to switch** to AI/data-infra senior backend role. Targets in `resume-ops-output/ai_companies_100.md`.

User chose **learning-first**. Skip public OSS / blog posts / applications for now (those live in `application-roadmap.md` weeks 4-8, deferred).

---

## The plan — `learning-roadmap.md`

8-week plan, ~12-15 hrs/week. Learning-heavy front (wks 1-3), apply-while-learning back (wks 4-8).

| Week | Focus |
|---|---|
| 1 | Transformer + inference foundation (Karpathy, vLLM PagedAttention paper) |
| 2 | Run vLLM for real, quantization, serving-stack literacy |
| 3 | Warehouse internals (Snowflake SIGMOD, Iceberg) + RAG/evals |
| 4 | Apply to 25 cos + system-design intensive + STAR stories |
| 5 | First interviews + JIT learning |
| 6 | Onsites begin + mocks |
| 7 | Onsite peak |
| 8 | Close + decide |

Gap priority ranked in doc: (1) LLM inference internals (2) transformers (3) modern Python AI stack (4) warehouse internals (5) RAG/evals (6) K8s (7) system design (8) DSA.

---

## CURRENT POSITION: Week 1, Day 1 — Karpathy nanoGPT

**Workspace ready:** `/Users/nemesis/Projects/learning/nanogpt/`

```
nanogpt/
├── bigram.py     # skeleton — type along with video, DON'T paste
├── NOTES.md      # 12 checkpoint questions + day-job connections
├── input.txt     # Tiny Shakespeare (1.1MB)
└── pyproject.toml # uv project, torch + numpy installed
```

- Video: https://www.youtube.com/watch?v=kCc8FmEb1nY (2 hrs)
- Karpathy repo (don't peek mid-video): https://github.com/karpathy/ng-video-lecture
- Run: `cd ~/Projects/learning/nanogpt && uv run python bigram.py`
- Natural split point: ~0:55 (after single-head attention).

**Checkpoint to clear Day 1-2:** answer all 12 questions in `NOTES.md` from memory — esp. why decode O(n²) without KV cache / O(n) with, why PagedAttention exists, Q/K/V intuition, ÷√d_k.

---

## Next after Karpathy

Phase 1 Day 4 — vLLM PagedAttention paper (https://arxiv.org/abs/2309.06180) + Anyscale continuous-batching post. Bridge: Karpathy's KV cache → PagedAttention. User's Hevo CDC instincts (offset tracking, memory pressure, batching) = unfair advantage reading the paper.

Then Week 2: spin up vLLM (local or Modal/RunPod free tier), `httpx+asyncio` load tester, plot tokens/sec vs concurrency 1/4/16/64.

---

## Tooling notes
- `uv` at `~/.local/bin/uv`. Python 3.13 system, nanogpt pinned 3.11 via uv.
- torch 2.11.0 + numpy 2.4.4 installed in nanogpt project.
- No GPU local — plan uses Modal/RunPod free tier (~$5) for Week 2 GPU work.

## Daily template (from plan)
- 6:30-7:30 AM: LeetCode 1-2 mediums (Neetcode 150)
- Lunch: reading queue
- 7-9 PM: hands-on / system design / interview prep
- Sunday: buffer or off

## What NOT to do (per plan)
Train models, build public OSS now, read all of DDIA (skim 5-7, read 11-12), master a framework end-to-end, apply to all 100, switch primary language.

---

## NOT in scope here

Resume page, resume-ops scraping, portfolio content → see `HANDOFF-resume-ops.md`.
