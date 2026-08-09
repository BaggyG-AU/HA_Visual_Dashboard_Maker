Author: OpenAI Codex, 2026-08-09
Reviewer: REQUIRED — a different model; not yet run
Owner gate: BaggyG-AU adjudicates this review and remains the sole merger of PR #140

# Independent artifact review — PR #140 round 2

## Verdict

**CHANGES-REQUIRED — high confidence.** M1 is correctly repaired, the gate
withdrawal is exact and dependency-free, and the full repository gate returns to
the main baseline. M2 is only partly closed: the §4 cell now distinguishes an
owner decision from review evidence, but the decision drawer it identifies as
authority still says PR #139's merge ratifies MP-LEASE. The split made that route
false, and the newer withdrawal decision explicitly records the correction as
still owed. A standing index row cannot point at a knowingly stale ratification
record.

**Artifact reviewed:** PR #140, branch
`feature/governance-arb-r8-mp-lease`, head
`03c817c5420127a6e3062573dfad89c3e55b34c6` against `main` at
`a6ce103c560ac45331321c8956bb445c789fa9d0`. This round did not reopen round
1's already-cleared extraction or dangling-pointer questions.

## Finding

### M2-R2 — MERGE-BLOCKING: the authority record still names the wrong ratification PR

The repaired MP-LEASE Authority cell has the right _form_. It leads with
`drawer_havdm_decisions_9f91fa0a88ed9df5b21c2482` and labels
`drawer_havdm_review_65aecb8d3cb0de6511b03648` as “evidence, not authority”
(`docs/governance/OPERATING_AGREEMENT.md:201-216`). The first drawer also does
state MP-LEASE as an owner ruling: the reviewer writes drawer candidates into
the committed review, the author files them with reviewer attribution, and
neither process killing nor `MEMPALACE_MCP_ALLOW_PEER_WRITER` is permitted.

The same drawer says, however:

> THESE RULINGS ARE NOT YET RATIFIED … the OWNER'S MERGE OF PR #139 … is what
> ratifies the text.

That sentence covers all four rulings in the drawer, including MP-LEASE and
ARB-R8. PR #140 split those two away from PR #139. The later owner decision
`drawer_havdm_decisions_6ef91642c11eff054b8c1ee0`, fetched independently,
confirms rather than cures the problem:

> STILL OWED … the superseding record that PR #140's merge — not PR #139's —
> ratifies ARB-R8 and MP-LEASE.

Deferral is therefore not acceptable for this PR. Section 4 says “the authority
is the record”; after a #140 merge, the cited record would still direct a reader
to the wrong ratification event while the row calls MP-LEASE `Standing`. The
live PR body also calls M2 closed, so its claim is premature until the authority
chain is corrected.

**Required correction:** file a self-contained decision drawer that supersedes
the stale ratification route, restates which PR ratifies each split ruling, and
cites the historical four-ruling drawer. Point the §4 MP-LEASE Authority cell at
that current decision record; keep the older owner decision and PR #137 review
only as clearly labelled history/evidence. Then commission a narrow confirmation
of that correction and its live PR description.

## §1 confirmation — M1 is closed

`docs/governance/MEMPALACE_PROTOCOL.md:129-143` now does what round 1 required.
It retains the historical emergency context, calls the checkpoint hole
unintended rather than sanctioned, and then expressly says an independent
reviewer “must NOT use this bypass.” It limits the emergency note to roles and
circumstances that do not contradict MP-LEASE. The note is no longer doing both
the general and reviewer-specific jobs.

The author's decision not to edit `ai_rules.md:329` is sound. Lines 325-327
precede it with a reviewer-only exception, define the committed review as the
`SINGLE destination`, cover a write refused by the per-palace lease explicitly,
and say only non-reviewing agents follow the unmodified general rules. The later
general `mempalace_add_drawer / mempalace_checkpoint` sentence is therefore not
a reviewer route. `CLAUDE.md:39-45` directs a refused reviewer to the MP-LEASE
exception rather than a futile restart, and `CLAUDE.md:72-87` repeats the
review-file destination.

I swept the route class rather than only the named token:

```bash
git grep -n -i -E \
  'mempalace_checkpoint|MEMPALACE_MCP_ALLOW_PEER_WRITER|writer[- ]lease|peer[- ]writer|kill.*mempalace|restart.*MCP|mempalace_add_drawer|diary_write' \
  -- ai_rules.md CLAUDE.md docs/governance docs/templates
```

No third documented post-refusal write route remains. Process killing and the
peer-writer environment override are prohibited; restarting the reviewer's own
server cannot acquire a lease still held by the author; the only tool-level hole
named by the operational protocol is checkpoint, and §5.2 now excludes the
reviewer expressly.

## §2 confirmation — gate withdrawal is clean

`git show --stat 03c817c` and
`git diff-tree --no-commit-id --name-status -r 03c817c` establish that the
withdrawal deletes exactly three paths and changes nothing else:

```text
D docs/reviews/governance-arb-r8-mp-lease-author-ledger.md
D tests/unit/author-ledger.spec.ts
D tools/claims-worklist.sh
```

A tracked token sweep confirms that `author-ledger|claims-worklist` now occurs
only in `docs/reviews/self-pass-gate-adversarial-review-codex.md`. The behavioural
sweep used `AUTHOR SELF-PASS`, `execution ledger`, `UNRUN`, `OPEN=`, `PR-BODY
row`, `content fingerprint`, `governed paths`, and `append-only observation`.
Outside the deliberately retained gate review it found only
`docs/reviews/pr139-author-process-review-codex.md:50-78`, the historical process
review that recommended the mechanism. That review is advice, is listed as
historical evidence in the live PR body, and neither asserts that the mechanism
remains on this head nor supplies a runtime dependency.

No workflow, package script, Vitest configuration, helper, or remaining tool
references either deleted path or its protocol. `vitest.config.ts` merely
discovers whatever specs remain below `tests/unit/**`; deletion requires no
configuration repair. `git diff --stat main...HEAD -- src/ tests/` is empty.

The immutable-history correction is adequate. Commit `03c817c` names
`fd626be`, lists the removed artifacts, says the earlier gate claims are now
historical, and directs the mechanism to a new PR. A reader following branch
history sees `fd626be`, its adversarial review `c8678d2`, and the explicit
withdrawal immediately afterward. The live PR body, read through
`gh pr view 140 --json body`, likewise identifies the withdrawal, the five
gate blockers, the intentionally retained review, and the future separate PR.
No gate-removal residue finding remains.

## §3 confirmation — real gate result

I ran `./tools/checks` at `03c817c` without piping or suppressing its status. It
returned **REAL_EXIT=0** and completed all **4/4** steps:

- lint: **0 errors / 145 warnings**;
- format: clean;
- typecheck: clean; and
- unit: **1,335 passed across 101 files**.

The unit count is exactly `main`'s 1,335/101 baseline. The temporary
1,341/102 gate implementation has not been rebaselined or left behind.

## Checks and limits

I fetched both the cited four-ruling owner drawer and the later gate-withdrawal
decision; read the repaired protocol route and its higher-precedence callers;
inspected `03c817c`'s complete path delta and commit message; swept tracked
references by filename and behaviour; inspected unit-test discovery, package
scripts, workflows and `tools/checks`; and read PR #140's body live.

I did not re-review the ARB-R8/MP-LEASE extraction, which round 1 already
cleared. I did not run e2e, integration, UAT, a package build, or live Home
Assistant because this branch has no `src/` or `tests/` delta and the commission
requires the four-step repository gate. I did not assess PR #139's REV-IMPL or
REV-RERUN merits.

The normal `mempalace_add_drawer` filing attempt returned peer-writer error
`-32001` and identified this reviewer as read-only. I did not retry, stop the
holder, set `MEMPALACE_MCP_ALLOW_PEER_WRITER`, or use the
`mempalace_checkpoint` bypass. The candidate below is the MP-LEASE handoff.

## MemPalace drawer candidates

- `wing="havdm"`, `room="review"`, `added_by="codex"` — `[REVIEW] CODEX
INDEPENDENT REVIEW OF PR #140 (ARB-R8 AND MP-LEASE), ROUND 2 —
CHANGES-REQUIRED, HIGH CONFIDENCE. Reviewed 03c817c against main a6ce103 in a
deliberately narrow confirmation. M1 is closed: MEMPALACE_PROTOCOL.md §5.2
now forbids the independent reviewer from using the checkpoint writer-lease
bypass while preserving emergency context only for non-conflicting roles;
ai_rules.md:329 needs no edit because :325-327's preceding reviewer exception
makes the committed review the single destination for refused writes; a
behaviour-keyed route sweep found no third bypass. The self-pass gate removal
is exact and clean: 03c817c deletes only the ledger, detector and generator;
filename and behaviour sweeps found only deliberately retained historical
reviews, no config/script/workflow/helper dependency; the corrective commit
message and live PR body provide an adequate signpost. Full gate REAL_EXIT=0,
4/4; lint 0 errors/145 warnings; format and typecheck clean; unit returned to
main's 1335 passed across 101 files. One merge-blocker remains: the §4
MP-LEASE cell correctly labels owner decision versus review evidence, and
drawer_havdm_decisions_9f91fa0a88ed9df5b21c2482 states MP-LEASE, but it still
says PR #139's merge ratifies all four rulings. The split made that false for
ARB-R8/MP-LEASE, and the later withdrawal decision
drawer_havdm_decisions_6ef91642c11eff054b8c1ee0 expressly says the superseding
#140 ratification record is still owed. File that self-contained superseding
decision, point the §4 cell to it, correct the live closure claim, and run one
narrow confirmation. Review document:
docs/reviews/governance-arb-r8-mp-lease-round2-codex-review.md.`
