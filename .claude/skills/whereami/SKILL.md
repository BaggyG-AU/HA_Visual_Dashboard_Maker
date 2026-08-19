---
name: whereami
description: Read-only orientation for the HAVDM workflow — answers "where are we" by reconciling the canonical status sources (live git/PRs, the GitHub Projects board, the Operating Agreement §4 rulings index, the MemPalace [STATE] drawer and diary, nightly gate runs) into a one-screen status - current work, immediate next step, open PRs, blockers, and any source disagreements. Use when the user asks "where are we", "what's the status", "orient me", "what's next", "catch me up". NEVER writes status anywhere — it reconciles and FLAGS drift; fixes stay with the ordinary session cadence.
---

# whereami

Fast orientation for HAVDM. Reads the canonical sources in a fixed order,
reconciles them, and reports a one-screen picture. Adapted from the PromptMi
`whereami` skill (owner-ruled repo-native home, 2026-08-19); the spine is
identical — read-only, fixed source order, reconcile, flag drift, never fix
it — and only the sources differ, because HAVDM's canon differs: the **plan
ledger is the GitHub Projects board** (STRAT-D9/D11), rulings live in the
**Operating Agreement §4 index**, and dev-cycle state lives in the
**MemPalace `[STATE]` drawer**.

## The one rule that makes this safe

**Read-only. It never becomes a status source.** It does not bump `[STATE]`
(that is the session cadence's job, under the scripted edit discipline), does
not move board items (status is event-driven per STRAT-D11), does not mark or
re-score anything, and does not trust any single source blindly — it
cross-checks and FLAGS drift.

## Step 1 — Read canonical sources, in priority order

```bash
# 1. LIVE git/PR — the ground truth for what is actually happening
git branch --show-current && git status --porcelain | head -5
git log --oneline -8
gh pr list --state open --json number,title,isDraft,headRefName
gh issue list --state open

# 2. THE PLAN LEDGER — the GitHub Projects board (STRAT-D9/D11)
gh project item-list 2 --owner BaggyG-AU --format json --limit 50 |
  python3 -c "import json,sys; [print(i.get('status','?'), '|', i['content']['title']) for i in json.load(sys.stdin)['items']]"

# 3. STANDING RULINGS — the §4 index tail (recent rulings land last)
grep -E '^\| [A-Z]' docs/governance/OPERATING_AGREEMENT.md | tail -15 | cut -c1-160

# 4. NIGHTLY / CI health
gh run list --limit 5 --json name,conclusion,headBranch,createdAt
```

Then MemPalace, **when the `mempalace_*` tools are available** (they are
absent on a non-maintainer checkout — say so once and continue with the live
sources above):

- `mempalace_get_drawer drawer_havdm_state_a15b0af78e0814cfd19cf627` — the
  live `[STATE]`. Authoritative for dev-cycle context per `ai_rules.md` §11,
  **but check its recorded `main` SHA and date against live git** — it is
  bumped by sessions and can lag reality between bumps.
- `mempalace_diary_read agent_name="claude-code", wing="havdm", last_n=5` —
  the most recent session hand-offs.

## Step 2 — Reconcile + flag

Cross-check the sources against each other. Explicitly flag:

- **Stale `[STATE]`** — its recorded `origin/main` SHA differs from live
  `git rev-parse origin/main`, or its OPEN items name work that live PRs show
  merged. Prefer live git; say the drawer needs its next bump.
- **Board drift** — a board item still In Progress whose PR is merged/closed
  (`gh pr view <n>`), or DRAFT items untouched long enough that the strategy's
  three-month hand-tending signal (strategy §7 concern 7) is worth naming.
- **Doc vs live mismatch** — a document citing a PR, branch, or file that no
  longer exists or has moved.
- **Quarantine ages** — ⚠ the D13 quarantine ledger is **not yet
  implemented** (board item). When it lands, list every quarantine entry with
  its age here and flag stale entries — this is the §7 "age flags" duty this
  skill carries by design (strategy §7 concerns 6 and 7).

Drift is reported, never silently fixed.

## Step 3 — Report (one screen)

```
WHERE WE ARE — <date>
main               : <sha> (<last merge PR + date>)   Gate: <latest run / known posture>
Active work        : <branch/PR or "none — main, clean">
Immediate next step: <from the board's ordered items + [STATE]>
Open PRs           : #<n> <title> (<draft/ready>) …  (or "none")
Open issues        : #<n> <title> …
Blockers / waits   : <owner decisions pending, review rounds in flight, …>
⚠ Source disagreements: <stale [STATE] / board drift / doc-vs-live> (or "none")
Recommended next   : B<n> <item> — <one-line why>
                     B<n> <item> — <one-line why>   (2–3 options, ranked)
```

**Recommended next** comes from the board's live backlog: rank the top two or
three selectable items — by their stable B-number title prefixes — on
unblocked-ness and standing risk, each with a one-line reason (an
owner-presence item that retires a measured risk outranks a large reviewed
slice; an item whose prerequisite is still open is not recommended). The
selection stays the owner's: a B-number choice authorizes starting that
item's **first step only** — plan sign-off before implementation and the
seat/review gates still apply per item.

## Guardrails

- READ-ONLY. No edits, no commits, no board mutations, no `[STATE]` bump, no
  UAT marks, no merges. `ha.home.local` untouched.
- Live git/PR is primary for _what is happening_; the board is primary for
  _what is planned_; `[STATE]` is authoritative for _dev-cycle context_ but
  verified against live git before being repeated.
- Reconcile and FLAG; hand fixes to the ordinary cadence (a `[STATE]` bump is
  a deliberate, scripted, separate action — never part of orientation).
