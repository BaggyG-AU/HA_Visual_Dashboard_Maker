---
name: session-handover-prompt
description: Author a handover / kickoff ("START") prompt that boots a fresh Claude Code session on this project with exact state and a scoped task, so the next agent is productive in one turn. Use when the user asks for a handover prompt, a session-start / kickoff prompt, or a hand-off to the next session/agent. Covers loading MemPalace drawers BY ID, the "expected starting point + STOP if untrue" tripwire, task framing, and the disciplines to restate.
---

# Authoring a session-handover prompt

A handover prompt is the **opening message of a fresh session**. Its job: load the
exact state, name one scoped task, and arm the tripwires — so the new agent starts
correct work immediately instead of re-deriving context or acting on stale facts.
It is written for an agent with **empty context**, so every reference is expanded
and nothing is assumed.

Gather the live values first (don't hand-write them from memory):

- `mempalace_status` → confirm the palace is live and wing `havdm` is present.
- Fetch the live `[STATE]` drawer **by id** and read its "START HERE", gates, and
  SUITE TRUTH. (`[STATE]` is `drawer_havdm_state_...`; get its current id from a
  recent drawer or `mempalace_diary_read`.)
- `git rev-parse --short HEAD`, `git log --oneline -1`, `gh pr list --state open`,
  and the current gate numbers — so the "expected starting point" is real.

## The seven sections

Write the prompt in this order. Keep it directive and specific.

1. **START — load memory BY ID.** Tell the agent to fetch the specific drawers by
   id, and say _why_: semantic search buries recently-filed drawers under
   corpus-age weighting, so `mempalace_search` misses them. List, with a
   one-line reason each:
   - the live `[STATE]` drawer (current + authoritative);
   - the governing `[DECISION]` / vision drawer the task must respect;
   - the `[INVESTIGATION]` that is the _evidence base_ for the task;
   - the most recent slice/PR record (what "done" looked like last);
   - `mempalace_diary_read agent_name="claude-code" wing="havdm" last_n=6`.

2. **Read, in-repo.** The plan/design doc for the task **and the actual code**
   the task touches (name files + the functions/areas). Don't make them hunt.

3. **Expected starting point + tripwire.** State `main = <sha>` (name the merge),
   tree clean, open PRs, and every gate: typecheck, lint (errors/warnings),
   format, unit count, package, and the electron-e2e baseline. End with the
   **tripwire**: _"If any of that is untrue, STOP and tell me before starting."_
   This is what stops a session built on a stale HEAD.

4. **The task.** One crisp paragraph: what to do and the acceptance bar. If it is
   destructive, high-risk, or has real UX/behaviour decisions, say
   **"INVESTIGATE FIRST, present a short plan (root cause + fix), and get my
   sign-off BEFORE implementing."** Name any hard constraints (e.g. keep live HA
   testing READ-ONLY on the VPP instance).

5. **Disciplines to restate** (the ones that keep earning their keep here):
   - Verify every merge (`git merge-base --is-ancestor <sha> origin/main`);
     prefer NON-stacked one-commit PRs based on `main`.
   - Red-before-green in the SAME checkout: prove the new test FAILS on base
     (revert the src, or swap in the historical bug, or run the lint rule on the
     unconverted file), then restore. A test not seen to fail on base is decoration.
   - Run e2e/integration **headless under Xvfb** (`npm run test:e2e:headless`) —
     WSLg steals focus otherwise; full run → background + poll; triage against the
     SUITE TRUTH baseline, never blind-rebaseline. (See the
     `headless-electron-testing` skill.)
   - Branches via `bash tools/feature-start <name>`; NEVER commit to `main`; NEVER
     merge without explicit approval.
   - If MemPalace refuses a write (read-only latch), say so immediately and ask
     whether to take the write lease.

6. **Close-out expectation.** Require the `ai_rules.md` §12 Workflow State block
   naming the MemPalace drawer, and the file-a-drawer-then-diary cadence.

## Skeleton

```
Continue the <project> work at <repo path>.

START — load memory, fetching state BY ID (semantic search buries recent drawers):
  mempalace_status
  mempalace_get_drawer drawer_id="<live [STATE] id>"  — the live [STATE] (vNN), CURRENT + authoritative. Opens with START HERE.
  mempalace_get_drawer drawer_id="<vision/decision id>"  — <what it governs>. Read before writing code.
  mempalace_get_drawer drawer_id="<evidence investigation id>"  — the evidence base for this task.
  mempalace_get_drawer drawer_id="<latest slice id>"  — what the just-completed work looks like.
  mempalace_diary_read agent_name="claude-code" wing="havdm" last_n=6

Then read, in-repo: <plan/design doc>, and the code — <files + functions>.

Expected starting point: main = <sha> (Merge PR #NN = <slice>), tree clean, NO open PRs, only `main` local.
Gates: typecheck 0, lint 0/<W> warnings, unit <N>, format clean, package OK. electron-e2e <baseline>.
If any of that is untrue, STOP and tell me before starting.

TASK: <one paragraph>. <If risky: INVESTIGATE FIRST → short plan → sign-off BEFORE implementing.> <hard constraints, e.g. keep live HA READ-ONLY.>

Disciplines: <verify-merge; non-stacked PRs; red-before-green same checkout; Xvfb headless e2e + triage vs baseline; feature-start branches, never commit to main, never merge without approval; MemPalace latch → ask>.
End significant responses with the ai_rules.md §12 Workflow State block naming the MemPalace drawer.
```

## Quality bar

- **Every reference expanded, every time** — drawer ids, PR numbers, file paths,
  SHAs, prior decisions. A fresh session shares no context with this one.
- **Facts are live, not remembered** — pull the SHA, PR list, gate numbers, and
  drawer ids before writing; a stale HEAD or drawer id is the most common failure.
- **One task, scoped.** If there are several, name the first and note the rest as
  "next".
- **Tripwired.** The "expected starting point + STOP if untrue" block is
  non-negotiable — it is what prevents work on a diverged tree.
