# MemPalace Protocol — HAVDM

How HAVDM uses its persistent memory. Adapted from the PromptMi governance
framework (see [Provenance](#provenance)), with the parts that HAVDM had already
solved differently left as they were.

- **Authority** is set by [`ai_rules.md`](../../ai_rules.md) §11 Persistent Memory Policy.
- **Enforcement** is set by [`ai_rules.md`](../../ai_rules.md) §12 Workflow State Reporting.
- **Session cadence** lives in [`CLAUDE.md`](../../CLAUDE.md).
- This document holds the operational detail: what to file, how to write it, and
  the failure modes that have actually bitten us.

Wing: `havdm`. Palace: `~/.mempalace/palace`. Config: `.mcp.json` + `mempalace.yaml`
at repo root (both gitignored).

---

## 1. When to file — three trigger classes

File at the **moment of crystallisation**, not at session end. If an event fits
one of these classes, it gets a drawer:

| Class             | Meaning                             | Examples                                                                                                                                                    |
| ----------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Decision**      | A judgment future work must respect | architecture choice, dependency verdict, spec approval/rejection with reasons, tech debt registered or retired, a user instruction that changes how we work |
| **Transition**    | A state boundary in the workflow    | phase open/close, PR opened / merged, session pause or wrap, milestone reached                                                                              |
| **Investigation** | A root cause and its fix            | regression diagnosis, flaky-test root cause, post-incident analysis                                                                                         |

The test is not "is this interesting" but **"would the next agent make a worse
decision without it?"**

---

## 2. What to file — four archetypes

Start the drawer `content` with the archetype tag.

| Tag               | Room             | Contains                                                                                                             |
| ----------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| `[DECISION]`      | `decisions`      | what was decided, alternatives considered, why this one won, how to recognise when it applies again                  |
| `[STATE]`         | `state`          | current branch and commit, what is in flight, gates and baselines, open items in priority order, resume instructions |
| `[PATTERN]`       | `patterns`       | the pattern, when it applies, where it was first used, known traps                                                   |
| `[INVESTIGATION]` | `investigations` | observed behaviour, root cause, the fix, the prevention principle                                                    |

---

## 3. Disciplines

**Supersede, don't delete** — for `[DECISION]`, `[PATTERN]`, `[INVESTIGATION]`.
File a new drawer that cites and overrides the old one. Governance history is the
point; a wrong drawer that was corrected is more useful than a missing one.

**`[STATE]` is updated in place** via `mempalace_update_drawer` on the single
live state drawer. HAVDM deliberately does **not** file a new `[STATE]` drawer per
checkpoint — see [§6 Provenance](#provenance) for why this diverges from PromptMi.

**Pair every new `[DECISION]` / `[PATTERN]` / `[INVESTIGATION]` with a brief
`mempalace_diary_write`** naming the drawer ID, the one-line gist, and whether it
supersedes anything.

> Why: semantic search does **not** reliably surface recently-filed drawers. They
> get out-ranked by older, more abstract drawers whose wording matches the query
> better. This is structural, not a transient index problem. `mempalace_diary_read`
> is **recency-ordered rather than similarity-ranked**, so a diary entry is the only
> thing guaranteed to surface a same-day change to the next session.

`[STATE]` updates via `update_drawer` do not need a diary entry — that is routine
bookkeeping, not governance.

---

## 4. How to write a drawer — self-contained, always

**Every reference in a drawer must be expanded every time it appears.**

Drawers are retrieved _one at a time_ by semantic search. There is no "first use"
from the reader's perspective, and no guarantee any sibling drawer is read
alongside. A bare `PR #27`, `D15.9`, or `the antd fix` is undecodable to the agent
that retrieves the drawer six weeks from now.

- Bad: "Superseded by the rgl migration drawer."
- Good: "Superseded by `drawer_havdm_investigations_2b33744e49fe595cedf9edd8`
  (react-grid-layout v2 composable-API migration)."

Drawers are therefore slightly more verbose than prose docs. That is correct and
intentional — it matches how they are actually consumed.

For linearly-read files (this document, `CLAUDE.md`, specs), the lighter rule
applies: expand a reference at first use, shortcut thereafter.

---

## 5. Operational gotchas

These are all things that have cost real time.

### 5.1 Only one MCP server can write, and the latch is permanent

Every concurrent Claude Code window spawns its own `mempalace.mcp_server` against
the same palace. The **first** to claim the per-palace writer lease is the **only**
one that can ever write. Any server that starts while the lease is held latches
read-only **permanently** — it never re-evaluates.

Both behaviours are deliberate (MemPalace issue #1818): the lease is held for the
whole process lifetime because a second long-lived Chroma `PersistentClient` would
otherwise serve a stale in-memory HNSW/FTS index.

Consequences:

- **"Writes refused → retry later" is wrong advice.** An idle holder never
  releases; only process exit drops the lock. Retrying cannot succeed.
- Killing the holder frees the lease but does **not** promote a latched server.
  You must **restart your own MCP server** (VS Code: `Ctrl+Shift+P` →
  _Developer: Reload Window_).
- Do **not** set `MEMPALACE_MCP_ALLOW_PEER_WRITER` to work around it. That
  disables exactly the corruption guard #1818 exists for.

Diagnosis:

```bash
ps -eo pid,ppid,etime,lstart,cmd | grep "[m]empalace.mcp_server"  # how many, how old
lsof +D ~/.mempalace/locks                                        # who holds the lease
grep FLOCK /proc/locks                                            # confirm a WRITE flock
ps -p <pid> -o stat,time,etime                                    # Sl+ w/ tiny CPU = idle holder
```

Full analysis: `drawer_havdm_investigations_d4d800cfc80f091d552f5ded`.

### 5.2 `mempalace_checkpoint` bypasses the peer-writer guard

`checkpoint` is not in the server's `_MUTATING_TOOLS` set, so a read-only-latched
server can still write through it. Useful in an emergency — it is how a session's
work was salvaged on 2026-07-20 — but it is an **unintended hole**, not a
sanctioned workaround. Prefer `add_drawer` + `diary_write`; if `checkpoint`
succeeds while `add_drawer` refuses, your server is latched read-only and should
be restarted.

### 5.3 Base IDs vs chunk IDs

Drawers persist as chunk records named `<base_id>_chunk_000000`, carrying
`parent_drawer_id = <base_id>` in metadata. `mempalace_search` and
`mempalace_check_duplicate` return **chunk** IDs. If a `get` / `update` / `delete`
returns "drawer not found", check whether you are addressing the wrong one of the
two.

### 5.4 Deleting safely

- Look a drawer up by header text with `mempalace_check_duplicate`; a threshold
  around **0.1** works empirically.
- **Never delete by search rank alone.** Verify the target's ID against an
  expected content signature (date, header text, `source_file`) first.
- Sequence `add` → verify the new ID is distinct → `delete` in **separate tool
  batches**, to avoid a dedup-collision race where the new drawer is treated as a
  duplicate of the one being removed.

---

## 6. Provenance

Ported 2026-07-20 from the PromptMi governance framework, which developed these
rules across 2026-04-11 → 2026-07-13. Ported directly:

- Persistent Memory Policy (PromptMi `ai_rules.md` Rule 27) → HAVDM `ai_rules.md` §11
- Workflow State Reporting block (PromptMi `ai_rules.md` §22) → HAVDM `ai_rules.md` §12
- The three trigger classes and four drawer archetypes (MemPalace Continuity Rule,
  PromptMi, 2026-04-19)
- Diary-after-drawer (PromptMi, 2026-05-12)
- Self-describing references, drawer tier (PromptMi "D15.9", 2026-04-24)

**Deliberately not ported — `[STATE]` supersession.** PromptMi files a new
`[STATE]` drawer per checkpoint and deletes the predecessor. That rule exists
because semantic search ranked stale state drawers above fresh ones, and 15 of
them accumulated before anyone noticed; it was later softened to best-effort
deletion after the base-ID/chunk-ID mismatch (§5.3) made deletes return 404.

HAVDM instead keeps **one** `[STATE]` drawer and updates it in place. That
sidesteps the failure entirely — there is no supersession chain, so nothing can
out-rank the tip, and no delete to fail. Keep it this way.
