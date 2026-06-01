# Portfolio Design Exploration — Session State (2026-06-01)

Durable handoff for the multi-design exploration on `adrijshikhar.github.io`. All work lives on `design/*` branches in `.worktrees/` (this repo). Default/deploy branch is `content`.

## Surviving candidates (4) — all committed, light+dark unless noted

| Design | Branch | Worktree | Identity | Modes |
|--------|--------|----------|----------|-------|
| **A — Swiss Terminal** | `design/swiss-terminal` | `.worktrees/design-a-swiss-terminal` | flat near-black, orange accent, tri-color aurora, name gradient, square cursor | dark default + light, 6 accents |
| **C — Soft Digital-Culture** | `design/soft-digital-culture` | `.worktrees/design-c-soft-digital-culture` | light, soft accent-tinted premium cards, rounded-square cursor | light, 6 accents |
| **E — Neo-Bauhaus** | `design/neo-bauhaus` | `.worktrees/design-e-neo-bauhaus` | bold color-block, orange lead + blue/yellow primaries, letter-box headings (`[A]bout`), dot side-nav (blue default / orange active) | **light-only + single orange** (dark mode + accent switcher were removed per user) |
| **G — Terminal Atelier (LEAD, the A×C bridge)** | `design/terminal-atelier` | `.worktrees/design-g-terminal-atelier` | A's engineered frame + C's medium-soft accent-tinted springy cards; parallel.ai-style smooth view toggle (machine view follows the mode) | dark default + light, 6 accents |

**Dropped:** B (Editorial Brutalist), D (Glass/Aurora — its tri-color aurora was ported into A), F (Warm-Paper — worktree `design/warm-paper` still on disk but not a current candidate).

## G = the bridge, built via subagent-driven-development
- Spec: `docs/superpowers/specs/2026-05-31-terminal-atelier-bridge-design.md`
- Plan: `docs/superpowers/plans/2026-05-31-terminal-atelier.md`
- Built + then heavily polished: card shadow matched to C, removed accent edge, C-style headings, pill buttons, E column widths, light text, rounded-square cursor, **mode-aware machine view** (light terminal in light mode / dark in dark) so the human↔machine toggle is a pure opacity crossfade — verified smooth in both modes/directions via Playwright (gan-evaluator). `?machine=true` + no-FOUC + `?mode=` all work.

## Key learnings (apply to any design)
- Machine view that FOLLOWS the active mode = canvas never recolors across toggle = always-smooth crossfade (no flicker). This is how G + E now work.
- Tailwind `/opacity` modifier does NOT compile on CSS-var colors (e.g. `bg-ink/70` → invisible). Use solid token colors (`bg-ink`, `bg-muted`, `bg-block-1`) for dots/fills.
- Mode swap should be atomic (`.mode-switching` one-frame `transition:none`) to avoid gradient-name flash.

## Dev servers (bun run dev, hot reload) — may need restart after compaction
- E → `:4325`, G → `:4330`. (A `:4321`, C `:4323` were preview builds.) Restart: `cd <worktree> && bun run dev -- --port <n> --host`.

## Next steps / open
1. **Pick a winner** → finalize on a clean branch off latest `origin/content`, then PR. (Local `content` was behind origin earlier — worktrees were reset to `origin/content` af09856.)
2. Blog phases (separate `adrijshikhar` README repo): canonical post `building-an-agentic-era-profile-readme.mdx` (draft), then dev.to (Phase 2), everydev.ai (Phase 3).
3. README gallery PRs tracked in `adrijshikhar/docs/readme-gallery-prs.md`: #1721 (abhisheknaiidu, slow), #596 (durgeshsamariya, active).
4. Cleanup: `.worktrees/_f-orig` is throwaway (remove); decide whether to keep the `design/warm-paper` (F) worktree.

## Constraints (always)
- No Co-Authored-By in commits. Machine-view contract: never break `?machine=true` / `window.__RAW_MARKDOWN__` / human-machine parity. SHA-pinned GH actions + least-privilege in the README repo workflows.
