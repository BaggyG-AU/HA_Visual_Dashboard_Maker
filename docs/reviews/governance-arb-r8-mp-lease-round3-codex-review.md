Author: OpenAI Codex, 2026-08-09
Reviewer: REQUIRED — a different model; not yet run
Owner gate: BaggyG-AU adjudicates this review and remains the sole merger of PR #140

# Independent artifact review — PR #140 round 3

## Verdict

**CHANGES-REQUIRED — high confidence.** The M2-R2 authority correction itself
is correct: the new drawer is self-contained, its four-way ratification split is
accurate, the §4 cell remains a set of labelled pointers, and the stale authority
is now clearly historical on the canonical route. The other half of round 2's
required correction is not clean. The live PR body still makes three mutually
inconsistent claims about when M2 closed and understates the committed review
population. Because this round was commissioned to confirm both the authority
repair and its live description, that description is merge-blocking.

**Artifact reviewed:** remote PR #140 head
`d35419f244e0f61d667f4339fdeeddbcacbc0cdb` on
`feature/governance-arb-r8-mp-lease`, against `main` at
`a6ce103c560ac45331321c8956bb445c789fa9d0`. I fetched and resolved the remote
head rather than relying on the commission's local state. I did not reopen the
round-1 extraction clearance, M1, or the gate withdrawal.

## Finding

### R3-M1 — MERGE-BLOCKING: the live PR description still contradicts the M2-R2 history

The authority chain is now corrected, but the live description was only partly
rewritten. This command exposes the conflicting statements in the canonical
body:

```bash
gh pr view 140 --json body --jq .body | nl -ba | \
  rg 'Three committed reviews|Round 1 findings|M2 —|Round 2|d35419f|fd626be'
```

It returns:

```text
9  | Three committed reviews | ...
11 ## Round 1 findings — both closed in fd626be
14 M2 — CLOSED, but only at round 3's request. ... Round 2 then ruled that
   insufficient ... d35419f files [the current record] ...
27 Round 2 ... left M2 OPEN as M2-R2 — now closed in d35419f.
```

The detailed M2 paragraph and line 27 have the correct sequence: `fd626be` did
not close M2-R2; round 2 (`ad16bdb`) required the superseding authority; and
`d35419f` implemented it for this round to confirm. The heading “both closed in
`fd626be`” therefore remains false. “Only at round 3's request” also assigns the
repair to the wrong round: round 2's required correction is explicit at
`docs/reviews/governance-arb-r8-mp-lease-round2-codex-review.md:55-60`; round 3
was requested to confirm that correction.

The count is independently stale. Before this review,

```bash
git diff --name-status main...origin/feature/governance-arb-r8-mp-lease \
  -- docs/reviews
```

lists four retained review documents, not three: round 1, the author-process
review, the self-pass-gate review, and round 2. This review makes five. A mutable
PR body should not keep a count that becomes false whenever the required next
review lands.

**Required correction:** rewrite the heading and M2 label so they state the
actual sequence (`fd626be` attempted M2; `ad16bdb` found M2-R2;
`d35419f` corrected the authority; this review accepted that repair but found
the body stale). Replace “Three committed reviews” with a count-free “Committed
review record” and list or link all five retained review documents. Update the
review-debt paragraph to say that round 3 accepted the authority repair but
requires one body-only confirmation. Then read the body live in a fourth,
narrow confirmation.

This finding forces a **fourth round on a PR whose ratified payload is two
rulings**. The branch artifact is ready on the sole issue commissioned here;
the extra round exists because the live description of that repair was not
reconciled end to end.

## Authority correction confirmed

### The new decision record is complete and accurate

I fetched `drawer_havdm_decisions_1069fb46eb9173d1dc58a9a2` directly. It:

- says both PRs are open and nothing is ratified yet;
- assigns ARB-R8 and MP-LEASE to the owner's merge of PR #140;
- assigns REV-IMPL and REV-RERUN, if accepted, to the owner's merge of PR #139;
- restates all four rulings sufficiently to stand alone; and
- identifies `drawer_havdm_decisions_9f91fa0a88ed9df5b21c2482` by full ID,
  quotes its stale single-PR claim, and supersedes only that route while keeping
  its substantive and historical record.

Its REV-RERUN coupling statement also holds on PR #139's actual tree. These
commands establish both bindings:

```bash
git show origin/feature/governance-review-invariant-implementation:docs/governance/OPERATING_AGREEMENT.md |
  nl -ba | sed -n '336,347p'
git show origin/feature/governance-review-invariant-implementation:docs/testing/TESTING_STANDARDS.md |
  nl -ba | sed -n '813,822p'
```

Section 3.5 says “A reviewer of a class-(d) artifact must re-run”; testing line
819 says the same items bind “reviewers of a class-(d) implementation slice” and
points back to §3.5. REV-RERUN therefore has no independent subject without
REV-IMPL's class (d); keeping them on the same PR is coherent.

### The §4 cell remains an index, not narrative

`docs/governance/OPERATING_AGREEMENT.md:193-216` says the index locates the
record and full narrative never lives there. The revised authority cell contains
three IDs plus the minimum labels needed to distinguish `current record`,
`history`, and `evidence`. Its width is larger than the other cells, but its
content is still pointers and provenance labels; none of the ruling or
ratification narrative moved into the index. The §3.3 rollback trigger has not
fired.

### The stale authority is adequately superseded

The repository sweep was:

```bash
git grep -n 'drawer_havdm_decisions_9f91fa0a88ed9df5b21c2482' \
  origin/feature/governance-arb-r8-mp-lease --
git grep -n -i -E \
  'ratif(y|ies|ied|ication)|owner.?s merge|merge of PR #13(9|40)|all four rulings|four rulings' \
  origin/feature/governance-arb-r8-mp-lease -- '*.md' ':!docs/reviews/**'
```

The active §4 route leads to the new drawer and labels the old one `history`.
The remaining exact-ID references are immutable review records: round 1 records
why the owner drawer was selected, and round 2 records why its ratification
sentence was later rejected. Section 2 does not directly cite the old drawer;
its broader “PR #139 record” reference is explicitly labelled “Evidence and
history,” not current ratification authority.

I also searched MemPalace by behaviour with `owner merge PR 139 ratifies all
four rulings`, `split ratification route PR 140 ARB-R8 MP-LEASE`, and the old
drawer ID plus `superseded`. Those searches surfaced historical records that
still preserve the once-correct #139 route, but also the current state at
`d35419f` and multiple post-split records warning that the route is false for
ARB-R8/MP-LEASE. The new decision itself cites and overrides the old one exactly
as `docs/governance/MEMPALACE_PROTOCOL.md:47-51` requires: “Supersede, don't
delete.” Direct retrieval of an old historical drawer will necessarily show its
historical text; current authority discovery now begins at §4's exact new ID.
Retroactively rewriting every historical review, diary, or decision would
contradict the project's supersession discipline and is not required.

The unchanged ARB-R8 drawer,
`drawer_havdm_decisions_ac026150b5fe8c5e6f70c519`, contains no claim that PR
#139 ratifies ARB-R8. Its final section is explicitly scoped to “the time of
filing” and says the clarification should ride the next governance PR already
requiring review. PR #140 is that carriage. The ARB-R8 row therefore does not
repeat M2-R2 and needs no new authority pointer.

## Live description — accurate portions

Apart from R3-M1, the live body accurately describes the new drawer, the
current/history/evidence split in the §4 cell, the still-open owner decision on
PR #139, the gate withdrawal, and the outstanding confirmation state. Live
GitHub metadata confirms exactly three open PRs: #138 at `a4f6060`, #139 at
`2d667f5`, and #140 at `d35419f`.

## Real gate result

I ran `./tools/checks` at remote head `d35419f` without piping or suppressing
its status. It returned **REAL_EXIT=0** and completed all **4/4** steps:

- lint: **0 errors / 145 warnings**;
- format: clean;
- typecheck: clean; and
- unit: **1,335 passed across 101 files**.

`git diff --stat main...HEAD -- src/ tests/` is empty. The unit result matches
main's 1,335/101 baseline; no rebaseline is needed.

## Checks and limits

I read the remote head, `d35419f`'s only repository delta and full commit
message; fetched the new, old, and ARB-R8 decision drawers; checked PR #139's
§3.5 and testing text from its branch; swept repository and MemPalace route
language; read PR #140's body live; checked current PR heads; and ran the full
four-step gate.

I did not reopen the extraction, M1, or gate-removal findings already closed. I
did not adjudicate PR #139's merits, run e2e/integration/UAT, build a package, or
use live Home Assistant. The branch remains docs-only, and none of those checks
can resolve the one live-description defect found here.

The normal `mempalace_add_drawer` filing attempt returned peer-writer error
`-32001` and identified this reviewer as read-only. I did not retry, stop the
holder, set `MEMPALACE_MCP_ALLOW_PEER_WRITER`, or use the
`mempalace_checkpoint` bypass. The candidate below is the MP-LEASE handoff.

## MemPalace drawer candidates

- `wing="havdm"`, `room="review"`, `added_by="codex"` — `[REVIEW] CODEX
INDEPENDENT REVIEW OF PR #140 (ARB-R8 AND MP-LEASE), ROUND 3 —
CHANGES-REQUIRED, HIGH CONFIDENCE. Reviewed remote head d35419f against main
a6ce103 in the narrow M2-R2 correction round. The authority correction is
accepted: drawer_havdm_decisions_1069fb46eb9173d1dc58a9a2 is self-contained,
accurately assigns ARB-R8/MP-LEASE to PR #140 and REV-IMPL/REV-RERUN to PR
#139 if merged, cites and supersedes the historical four-ruling drawer, and
correctly says REV-RERUN is coupled to class (d). The §4 cell contains only
labelled current/history/evidence pointers, so its extra width does not fire
the index-content rollback trigger. Route sweeps found no active instruction
still presenting the old drawer as current authority; historical drawers and
reviews remain historical under the project's supersede-don't-delete rule.
The ARB-R8 authority has no PR #139 ratification claim and needs no change.
One merge-blocker remains in the live PR body: it says both round-1 findings
closed in fd626be while its own M2 text says fd626be was insufficient and
d35419f supplied the cure; it misattributes the required correction to round
3 rather than round 2; and it says three committed reviews when four existed
before this review and five exist after it. Replace those claims with the
actual sequence and a count-free review record, then run a body-only round 4.
This is the fourth round on a two-ruling PR. Full gate REAL_EXIT=0, 4/4; lint
0 errors/145 warnings; format and typecheck clean; unit 1335 passed across
101 files. Review document:
docs/reviews/governance-arb-r8-mp-lease-round3-codex-review.md.`
