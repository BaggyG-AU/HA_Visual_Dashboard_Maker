# CLAUDE.md — HAVDM Session Guide

Project-specific guidance for Claude Code sessions on **HAVDM** (Home Assistant
Visual Dashboard Maker — Electron + React + TypeScript desktop app).

- Immutable project rules live in [`ai_rules.md`](ai_rules.md).
- The active refresh roadmap is [`docs/refresh/PROJECT_REFRESH_PLAN_2026-07.md`](docs/refresh/PROJECT_REFRESH_PLAN_2026-07.md).
- Governance framework: [`docs/governance/`](docs/governance/).

---

## MemPalace — Session Cadence

HAVDM has a persistent MemPalace memory registered over MCP (server `mempalace`,
wing **`havdm`**, palace `~/.mempalace/palace`). When the `mcp__mempalace__*`
tools are available in the session, **use them actively** — MemPalace is the
source of truth for dev-cycle context. The local `MEMORY.md` auto-memory is the
bootstrap-only fallback for when MCP is unavailable.

> If the tools are **not** present, MCP hasn't loaded — reload the VS Code window
> (`Ctrl+Shift+P` → _Developer: Reload Window_) and approve the project MCP
> server. Config: `.mcp.json` + `mempalace.yaml` at repo root (both gitignored).

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

Don't wait to be asked. Save:

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

### Two disciplines

- **Supersede, don't delete.** For `[DECISION]` / `[PATTERN]` / `[INVESTIGATION]`,
  file a new drawer that cites and overrides the old one rather than editing
  history. Only `[STATE]` is updated in place.
- **Pair every new `[DECISION]` / `[PATTERN]` / `[INVESTIGATION]` with a brief
  `mempalace_diary_write` entry** summarising the change — diary entries surface
  immediately via `diary_read` even when semantic ranking misses the new drawer.
  (`[STATE]` bookkeeping via `update_drawer` does not need a diary entry.)

### Filing examples

```
mempalace_add_drawer  wing=havdm  room=decisions       content="[DECISION] …"
mempalace_add_drawer  wing=havdm  room=investigations  content="[INVESTIGATION] …"
mempalace_update_drawer  drawer_id=…  content="[STATE] …"   # live state only
mempalace_diary_write  agent_name=claude-code  wing=havdm  entry="SESSION:YYYY-MM-DD|…"
```
