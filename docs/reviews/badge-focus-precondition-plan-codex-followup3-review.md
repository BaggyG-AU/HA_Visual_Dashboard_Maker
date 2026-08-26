Author: Claude Opus 5 (plan revision 5 and repair author; interested party)
Reviewer: OpenAI Codex / GPT-5.6 Sol (same independent reviewer as rounds 1–3; authored no repair)
Owner gate: micah/BaggyG-AU decides whether the plan proceeds; this review decides nothing on its own

# Third scoped follow-up — BF-G1 prose repair

**ACCEPTS-REVISION.** BF-G1 is RESOLVED: the owner ruling, closed Option B,
absence of an outstanding owner decision, and this follow-up as the remaining
gate are now stated consistently. The technical plan remains ready for
implementation; BF-H1 is a non-blocking SEV 3 precision issue in the commission's
range description, not in the plan repair.

Reviewed `438f142` on `feature/badge-focus-precondition-plan`; base `main` was
`2b9a7ca`. Scope was the BF-G1 repair after `feb0cfa`, with the two later
commission-housekeeping commits inspected to ensure they changed no plan or
technical decision.

## BF-G1 disposition

| Finding                                              | Disposition  | Evidence                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BF-G1 — §7 contradicted the settled owner ruling** | **RESOLVED** | §7 now says no owner decision is outstanding, records Option A on 2026-08-26, closes Option B, makes Case 4 binding, records the second follow-up's technical clearance, and names this minimal follow-up as the remaining gate (`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:462-490`). The complete current-state re-sweep found no stale live member. |

## Commissioned questions

### Q1 — BF-G1: RESOLVED

The repaired sequence is internally consistent:

- the status says revision 5 repairs BF-G1, while BF-F1, BF-F2 and BF-P2 are
  resolved and the technical plan is ready (`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:7-27`);
- Case 4's premise still says the owner selected the scoped guard (`:338-342`);
- §7 says Option A was ruled on 2026-08-26, Option B is closed, no owner decision
  is outstanding, and this follow-up—not another owner ruling—is the current
  gate (`:473-490`);
- §9.1 retains the same settled ruling and binding five-step sequence
  (`:685-697`); and
- §10 refers to the formerly stale state only as history and accurately says it
  entered at `52b8834` (`:795-812`).

The class-wide `rg` sweep found no remaining statement that BF-F1 needs a new
owner decision or that Option B is live. The new standing re-sweep warning at
`:494-498` addresses the defect class without changing the decision.

### Q2 — scope and regression: PASS

Nothing technical moved. Hashing each section independently at `feb0cfa` and
`438f142` produced identical SHA-256 values for §§4, 5, 6 and 8. The plan diff
changes only:

- the revision/status history;
- §7's current sequencing and its re-sweep warning;
- new §9.2, recording the prior review; and
- §10's self-check admission.

No `src/`, test, manifest or governed-rule file changed. The branch-wide diff
remains Markdown-only under `docs/`; the manifest remains 9 expected failures /
10 expected flaky / 21 expected skips, with both badge keyboard identities
retained. BF-F1, BF-F2, BF-P1–P4, the four-call-site population, test-only
decision and manifest-retirement rule were not altered or reopened.

The full mechanical range `feb0cfa..438f142` also adds the tracked follow-up
commission and its head-pinning correction. Both were read. They change review
instructions only and do not disturb the plan repair; the range-count wording
itself is BF-H1.

### Q3 — §9.2: PASS

§9.2 faithfully represents the second follow-up
(`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:699-730`):

- its `feb0cfa` / SEV-1-BLOCKED identity is correct;
- BF-F1, BF-F2 and BF-P2 were all disposed RESOLVED;
- the prior review explicitly said the technical plan was ready for
  implementation and that only BF-G1 blocked it;
- the 5008 ms exact Case 4 result and twelve-file shipped-command population
  match the committed review; and
- the setup-versus-authority defence is represented at its actual strength: the
  global query constructs a known starting population, while the scoped
  attribute decides traversal readiness.

It does not convert that defence into a wider technical clearance or claim that
the unwritten implementation has already passed.

### Q4 — §10 admission: PASS

The chronology is exact. Commit `52b8834` recorded the owner ruling only in
§9.1 at 12:46:05 +10:00. The round-3 commission followed at `d4b4d3e` at
12:55:59, so BF-G1 was already present when the author performed and recorded
that self-check. The subsequent commission repairs `35c00e3` and `c1f31df`, and
the second follow-up `feb0cfa`, all came later.

The admission at plan `:801-812` narrows the previous self-check claim rather
than erasing it: the pass exercised technical arguments but missed the separate
current-state consistency pass that would have compared §7 with §9.1. That is
consistent with the committed history and with BF-G1's measured location. Its
comparison to the earlier false file-count stop is also accurate at the stated
level: both were live-record consistency failures that stopped a review gate,
not product defects.

### Q5 — one non-blocking record issue

The plan repair produced no unpredicted issue. BF-H1 below concerns only the
commission's description of the reviewed range and does not alter BF-G1's
disposition or the implementation gate.

## New findings

### BF-H1 — SEV 3 — the commission's full-range cardinality is mechanically false

The tracked commission says the repair diff “from `feb0cfa` to the reviewed
head” is “two commits, one file” and then names `9d69be0` and `565eb6c`
(`docs/reviews/badge-focus-precondition-plan-codex-followup3-commission.md:57-65`).
For the reviewed head `438f142`, the literal range contains four commits and two
files: those two repair commits plus `578df1d` and `438f142`, which add and
correct the commission itself.

I swept the commission's remaining cardinality statements. Its “four
questions” self-check refers to Q1–Q4 (Q5 is the unpredictable-residue prompt),
the four-call-site and three-prior-blocking-round counts match the record, and
the manifest counts were regenerated. BF-H1 is the only false mechanical
cardinality in that document.

This does not block or require a round-trip under STRAT-D18. The two-entry list
unambiguously identifies the semantic repair subset, and direct inspection
confirms that subset is exactly two commits changing only the plan. The two
additional commits are commission housekeeping and carry no technical or plan
change. If this record is edited incidentally later, “the repair subset is the
two named commits in the plan file; later commits are commission housekeeping”
would state the intended boundary without making a self-invalidating range
count.

## What was run and evidence boundary

### Ran

```bash
git status --short --branch
git rev-parse HEAD
git rev-parse main
git log --oneline main..HEAD
git diff --name-status main..HEAD
git diff --name-only main..HEAD | grep -vE '^docs/.*\.md$'
git log --reverse --format='%h %cI %s' feb0cfa..438f142
git diff --name-status feb0cfa..438f142
git diff --unified=0 feb0cfa..438f142 -- docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md
rg -n "option B|Option B|owner decision|outstanding|WE ARE HERE|ready for implementation|BF-G1|52b8834" \
  docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md
git diff --check feb0cfa..438f142
```

I also extracted §§4, 5, 6 and 8 independently from `feb0cfa` and `438f142` and
SHA-256 hashed each pair; all four pairs were identical. `gh pr view 153`
confirmed PR #153 open/not draft with head `438f142` and base `main`. A direct
manifest read confirmed 9/10/21 and the two retained keyboard rows.

### Not run

No Electron, integration, e2e, unit, CI, live Home Assistant or UAT run was
performed. No suite is needed to decide this prose-only repair, and the prompt
explicitly says none is owed. I made no plan, `src/`, test, manifest, merge,
`[STATE]` or UAT change.

## MemPalace drawer candidates

None. BF-G1 directly exercises the existing whole-class sweep rule, and BF-H1
is another instance of the already-recorded self-invalidating-cardinality
pattern. Neither adds a new agent-general lesson.
