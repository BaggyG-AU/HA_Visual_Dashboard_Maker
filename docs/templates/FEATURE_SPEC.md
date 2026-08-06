# <ID> — <Title> (Feature Spec)

<!--
Template: copy into docs/features/ (or the slice's agreed location) and fill.
Governed by docs/governance/OPERATING_AGREEMENT.md §3: the Reviewer must be a
different model from the Author; the review lands on this spec's branch as
docs/reviews/<branch-shortname>-<reviewer>-review.md; the owner signs off
reading spec + review together. An approved spec is immutable — changes are
appended to §11 Revision History, never edited in place.
-->

**Status:** Draft | Reviewed — \<reviewer, date\> | Approved — \<owner, date\> | Implemented | Closed — via PR #N
**Author:** \<model / agent\>
**Reviewer:** \<different model — assigned by the owner\>
**Owner gate:** spec approval before any code (ruling R7 /
`OPERATING_AGREEMENT.md` §3)
**Branch:** `feature/<slug>` · **Created:** \<YYYY-MM-DD\>

## 1. Objective

One paragraph: what this delivers and the user-visible outcome.

## 2. Background

Why now. The defect/finding/ruling history that led here, with drawer IDs and
document paths expanded — a reader with empty context must not need to hunt.

## 3. Finding Coverage

Every UAT finding, owner ruling, or deliverable this spec claims to address
gets a row. A row without a spec section means the spec is incomplete; a
section addressing nothing in this table means scope creep.

| Finding / Ruling / Deliverable | Addressed in section | Status            |
| ------------------------------ | -------------------- | ----------------- |
| \<e.g. UAT F5, ruling R7(a)\>  | §\<n\>               | Covered / Partial |

## 4. In Scope

Bulleted, concrete.

## 5. Out of Scope

Bulleted — and an explicit **MUST NOT** list: the adjacent behaviours this
slice is forbidden to change (the guard rails the reviewer verifies).

## 6. Files to Create / Modify

| Path | Change |
| ---- | ------ |
|      |        |

## 7. Design / Contract

The substance: data shapes, function contracts, UI behaviour, YAML mapping,
error handling. Claims about existing code cite `path:line`.

## 8. Acceptance Criteria

Numbered and testable. Each AC is something a test or the owner can verify —
not an intention.

## 9. Test Plan

- New tests, per suite (unit / e2e / integration), and which AC each proves.
- **Red-before-green legs:** how each new test is shown to FAIL on base in
  the same checkout (revert-src / historical-bug swap), and any leg limit
  claimed, stated here in advance.
- Expected baseline impact (suite counts, snapshots) — anything that will
  move, named before it moves.

## 10. Open Questions

Flagged, never guessed (each blocks implementation of its affected section
until the owner answers). Empty is a valid state; an unstated assumption is
not.

## 11. Revision History

| Date | Rev | Change | By  |
| ---- | --- | ------ | --- |
|      | 0   | Draft  |     |
