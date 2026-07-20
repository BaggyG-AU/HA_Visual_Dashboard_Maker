# CLAUDE.md — HAVDM Session Guide

Project-specific guidance for Claude Code sessions on **HAVDM** (Home Assistant
Visual Dashboard Maker — Electron + React + TypeScript desktop app).

- Immutable project rules live in [`ai_rules.md`](ai_rules.md) — note **§11
  Persistent Memory Policy** and **§12 Workflow State Reporting**, both MANDATORY.
- The active refresh roadmap is [`docs/refresh/PROJECT_REFRESH_PLAN_2026-07.md`](docs/refresh/PROJECT_REFRESH_PLAN_2026-07.md).
- Governance framework: [`docs/governance/`](docs/governance/).
- MemPalace operational detail: [`docs/governance/MEMPALACE_PROTOCOL.md`](docs/governance/MEMPALACE_PROTOCOL.md).

---

## MemPalace — Session Cadence

HAVDM has a persistent MemPalace memory registered over MCP (server `mempalace`,
wing **`havdm`**, palace `~/.mempalace/palace`). When the `mcp__mempalace__*`
tools are available, **use them actively** — per [`ai_rules.md`](ai_rules.md) §11
MemPalace is authoritative for dev-cycle context, and `MEMORY.md` is a
bootstrap-only fallback with **no duplication** between the two.

> If the tools are **not** present, MCP hasn't loaded — reload the VS Code window
> (`Ctrl+Shift+P` → _Developer: Reload Window_) and approve the project MCP
> server. Config: `.mcp.json` + `mempalace.yaml` at repo root (both gitignored).

> **If reads work but writes are refused**, your server is latched read-only
> because another Claude Code window claimed the palace writer lease first.
> Retrying will never succeed — reload the window to restart the server. Do not
> set `MEMPALACE_MCP_ALLOW_PEER_WRITER`. See
> [`MEMPALACE_PROTOCOL.md`](docs/governance/MEMPALACE_PROTOCOL.md) §5.1.

### On session start

1. `mempalace_status` — confirm the palace is live and `havdm` is present.
2. `mempalace_search` `"HAVDM current state of play"` (limit 15) — load the live
   `[STATE]` drawer (it supersedes all prior state drawers).
3. `mempalace_search` `"HAVDM governance rules refresh plan decisions"` (limit 15)
   — the higher limit catches recently-filed drawers that corpus-age weighting
   can bury below the top 5.
4. `mempalace_search` `"HAVDM current milestone Phase 7"` — load milestone context.
5. `mempalace_diary_read` `agent_name="claude-code", wing="havdm"` — surface
   recent session hand-offs (recency-ordered; catches what search ranking misses).

### On session end (pause / wrap / hand-off)

- `mempalace_diary_write` `agent_name="claude-code", wing="havdm"` — one entry:
  what was done, what was decided, what's open, next step for the resuming agent.
  Keep it cold-readable by another AI (~5–10 lines). AAAK compression optional.

### During the session — file these automatically, at the moment they crystallise

Don't wait to be asked. An event earns a drawer if it is **Decision-class** (a
judgment future work must respect), **Transition-class** (a state boundary — phase
open/close, PR opened or merged, session wrap), or **Investigation-class** (a root
cause and its fix). The test is not "is this interesting" but **"would the next
agent make a worse decision without it?"**

Save:

- **`[DECISION]`** — any judgment future work must respect (architecture choices,
  spec approvals/rejections with reasons, instructions that change how we work).
  → `room="decisions"`
- **`[STATE]`** — the live "state of play". Update the existing one with
  `mempalace_update_drawer`; don't file a new one each time. → `room="state"`
- **`[PATTERN]`** — a reusable convention or approach worth repeating.
  → `room="patterns"`
- **`[INVESTIGATION]`** — a debugging finding / root cause and its fix.
  → `room="investigations"`
- Governance rule clarifications → `room="governance"`.

Use `wing="havdm"` on every `mempalace_add_drawer` call, and start the `content`
with the archetype tag, e.g. `content="[DECISION] Node baseline → Node 22 LTS …"`.

### Three disciplines

- **Supersede, don't delete.** For `[DECISION]` / `[PATTERN]` / `[INVESTIGATION]`,
  file a new drawer that cites and overrides the old one rather than editing
  history. Only `[STATE]` is updated in place.
- **Pair every new `[DECISION]` / `[PATTERN]` / `[INVESTIGATION]` with a brief
  `mempalace_diary_write` entry** summarising the change — diary entries surface
  immediately via `diary_read` even when semantic ranking misses the new drawer.
  (`[STATE]` bookkeeping via `update_drawer` does not need a diary entry.)
- **Write drawers fully self-contained.** Expand every reference **every time** it
  appears — drawer IDs, PR numbers, file paths, prior decisions. Drawers are
  retrieved one at a time by semantic search, so there is no "first use" and no
  guarantee a sibling drawer is read alongside. "Superseded by the rgl drawer" is
  useless six weeks on; "superseded by `drawer_havdm_investigations_2b33744e…`
  (react-grid-layout v2 composable-API migration)" is not.

Close every significant response with the **Workflow State block** required by
[`ai_rules.md`](ai_rules.md) §12 — its `MemPalace drawer` field is what makes this
cadence auditable rather than aspirational.

### Filing examples

```
mempalace_add_drawer  wing=havdm  room=decisions       content="[DECISION] …"
mempalace_add_drawer  wing=havdm  room=investigations  content="[INVESTIGATION] …"
mempalace_update_drawer  drawer_id=…  content="[STATE] …"   # live state only
mempalace_diary_write  agent_name=claude-code  wing=havdm  entry="SESSION:YYYY-MM-DD|…"
```
