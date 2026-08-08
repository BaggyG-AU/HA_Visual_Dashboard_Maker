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

> **If the tools are not present, the only test that decides anything is
> whether `mempalace_*` tools are callable once the session has settled.**
> Do not infer this from whether `.mcp.json` or `mempalace.yaml` exists — that
> is a proxy and it is wrong in both directions. MemPalace can be registered
> **globally** (a user-level MCP config) with no project file present, and a
> project file can exist while the server never comes up.
>
> - **Tools appear** — you have MemPalace; the cadence below applies in full.
> - **Tools do not appear, and you are the maintainer** — reload the VS Code
>   window (`Ctrl+Shift+P` → _Developer: Reload Window_) and approve the MCP
>   server. Config: `.mcp.json` + `mempalace.yaml` at repo root, **both
>   gitignored**; the palace itself is machine-local.
> - **Tools do not appear and there is nothing to fix** — the ordinary state
>   for anyone who is not the maintainer. **This whole section does not apply
>   to you.** Say once in your first response that MemPalace is unavailable,
>   and carry on. Nothing to install, nothing owed, no blocker.

> **If reads work but writes are refused**, your server is latched read-only
> because another Claude Code window claimed the palace writer lease first.
> Retrying will never succeed — reload the window to restart the server. Do not
> set `MEMPALACE_MCP_ALLOW_PEER_WRITER`. See
> [`MEMPALACE_PROTOCOL.md`](docs/governance/MEMPALACE_PROTOCOL.md) §5.1.

### On session start

⚠ **"Session start" means BEFORE YOUR FIRST SUBSTANTIVE ACTION, not the
wall-clock moment the session opens** — they are not the same, and the whole
sequence below is due at the former. MCP servers frequently finish connecting
_after_ a session opens, so these tools may not exist when you first read
this. **If they are still connecting, run the sequence the moment they appear
and say so in your first response.** An instruction that was briefly
impossible has not lapsed, and beginning work before running it does not
discharge it. (Evidence: a 2026-08-07 test on a sibling private project — one
agent ran none of its cadence because the server was mid-connect at the due
moment and nothing returned it there; another ran all of it, but only after
starting work.)

⚠ **STILL CONNECTING is not the same as NEVER AVAILABLE.** The paragraph above
governs a delay of seconds, where a duty exists and is briefly unperformable.
If the `mempalace_*` tools never appear at all — the ordinary state for anyone
who is not the maintainer — **there is no duty here in the first place, so
nothing lapses and nothing is pending.** Do not retry, do not seek a
workaround, and never report a memory operation you did not perform. Say so
once and carry on; [`ai_rules.md`](ai_rules.md) §11 governs what is owed
instead, which for a checkout with no memory store is **nothing persistent** —
put drawer-candidate notes in the PR body and let a MemPalace-enabled agent
file them later.

> ⚠ **One exception, for independent reviewers only.** If — and only if — you
> are acting as the independent reviewer under
> [`OPERATING_AGREEMENT.md`](docs/governance/OPERATING_AGREEMENT.md) §3, put
> the notes in a `MemPalace drawer candidates` section **at the end of your
> committed review file**, not in the PR body, and the write-enabled author
> files them with `added_by="<reviewer>"` (ruling **MP-LEASE**,
> `OPERATING_AGREEMENT.md` §2; the same exception is carried in
> [`ai_rules.md`](ai_rules.md) §11, which is the higher-precedence text).
> The review file is your own deliverable on the branch, so the notes still
> arrive with the PR. This holds **however** MemPalace is unavailable to you —
> absent entirely, or present with the **write** refused by the per-palace
> writer lease, which is the normal case when author and reviewer run
> concurrently. ⚠⚠ **Never kill a process to free the lease and never set
> `MEMPALACE_MCP_ALLOW_PEER_WRITER`.** ⚠ **A refused write does not by itself
> put you inside this exception.** An agent that is not acting as the
> independent reviewer uses the PR body exactly as described above.

1. `mempalace_status` — confirm the palace is live and `havdm` is present.
2. `mempalace_search` `"HAVDM current state of play"` (limit 15) — load the live
   `[STATE]` drawer (it supersedes all prior state drawers).
3. `mempalace_search` `"HAVDM governance rules refresh plan decisions"` (limit 15)
   — the higher limit catches recently-filed drawers that corpus-age weighting
   can bury below the top 5.
4. `mempalace_search` `"HAVDM current milestone Phase 7"` — load milestone context.
5. `mempalace_diary_read` `agent_name="claude-code", wing="havdm"` — surface
   recent session hand-offs (recency-ordered; catches what search ranking misses).
6. `mempalace_get_drawer` `drawer_practice_charter_a914959dbe8a1120cffad334` —
   the **`practice` wing index** (see below). Fetched by ID, not searched.

### The `practice` wing — shared working practice, not HAVDM state

MemPalace also carries a **cross-project** wing, `practice`, holding rules for
how AI agents should work on any repository: how to respond to a review
finding, how to evidence a claim, how to commission and conduct reviews, how
to keep a long artifact internally coherent. It is not HAVDM state and it is
not a second copy of anything in the `havdm` wing.

- **Load the index, not the wing.** One call to `mempalace_get_drawer`
  `drawer_practice_charter_a914959dbe8a1120cffad334` returns every rule as a
  one-liner plus its drawer ID. Fetch in full only the two or three that match
  the task in front of you. ⚠ Fetch the index **by ID** — do not search for
  it; semantic ranking buries older drawers, which is the same reason the
  `havdm` searches above use `limit 15`.
- **Before authoring or reviewing a spec, plan or governance change**, read
  the drawers covering review conduct and claim hygiene. Most rework this
  project has paid for is already named there.
- **File back what generalises.** A lesson that would help any agent on any
  project goes into `practice` **and** gets its line added to the index
  drawer — an unindexed drawer is unfindable. A lesson about HAVDM's code,
  tests or governance stays in the `havdm` wing. One fact, one home — the
  wing split is [`ai_rules.md`](ai_rules.md) §11; the bar for what may enter
  `practice` at all is the wing charter
  `drawer_practice_charter_f9efb6904018fb7a2021bd64`.
- ⚠ **When you hand work to an agent that cannot reach MemPalace** — an
  independent review prompt, a fresh chat, a sub-agent without MCP — **quote
  the applicable `practice` rules into that prompt verbatim.** A reviewer
  judges against exactly what the prompt supplies; a cited rule reaches
  nothing. [`docs/templates/ADVERSARIAL_REVIEW.md`](docs/templates/ADVERSARIAL_REVIEW.md)
  §0 already carries the reviewer-facing subset for that purpose.

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
