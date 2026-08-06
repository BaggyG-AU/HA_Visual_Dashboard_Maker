# <ID> — <Title> (Feature Spec)

<!--
Template: copy into docs/features/ (or the slice's agreed location) and fill.
MANDATORY for R7-class specs and remediation plans; optional for other specs
unless the owner rules otherwise. Governed by
docs/governance/OPERATING_AGREEMENT.md §1 (the R7 spec-before-code gate) and
§3 (independent review): the Reviewer must be a different model from the
Author; the review lands on this spec's branch as
docs/reviews/<branch-shortname>-<reviewer>-review.md; the owner signs off
reading spec + review together. An approved spec's text is immutable — changes
are appended under §11, never edited in place.
-->

**Status:** Draft | Reviewed — \<reviewer, date\> | Approved — \<owner, date\> | Implemented | Closed — via PR #N
**Author:** \<model / agent\>
**Reviewer:** \<different model — assigned by the owner for R7-class work\>
**Owner gate:** spec approval before any code (ruling ARB-R7 /
`docs/governance/OPERATING_AGREEMENT.md` §1, §3)
**Branch:** `feature/<slug>` · **Created:** \<YYYY-MM-DD\>

## 1. Objective

One paragraph: what this delivers and the user-visible outcome.

## 2. Background

Why now. The defect/finding/ruling history that led here. Guidance: expand
drawer IDs and document paths so a reader with empty context does not need to
hunt.

## 3. Finding Coverage

Every UAT finding, owner ruling, or deliverable this spec claims to address
gets a row, and every row names the section that addresses it — a row without
a section means the spec is incomplete. Substantive behaviour that maps to no
row needs an explicit scope justification (supporting design, risk, and test
sections do not need rows of their own).

| Finding / Ruling / Deliverable | Addressed in section | Status            |
| ------------------------------ | -------------------- | ----------------- |
| \<e.g. UAT F5, ruling ARB-R7\> | §\<n\>               | Covered / Partial |

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
error handling. Guidance: claims about existing code are strongest cited as
`path:line`.

## 8. Acceptance Criteria

Numbered and testable. Each AC is something a test or the owner can verify —
not an intention.

## 9. Test Plan

- New tests, per suite (unit / e2e / integration), and which AC each proves.
- **Red-before-green legs:** where a valid red leg exists, how each new test
  is shown to FAIL on base in the same checkout (revert-src / historical-bug
  swap). The controlling test is whether a valid red leg exists, not whether
  the code is new. Where none exists (the documented case is a brand-new
  module — see
  `docs/governance/phases/phase-7-ecosystem-future-growth-amendment-02.md`),
  say so here explicitly and name the alternative evidence.
- Guidance: name any expected baseline impact (suite counts, snapshots)
  before it moves.

## 10. Open Questions

Flagged, never guessed (each blocks implementation of its affected section
until the owner answers). Empty is a valid state; an unstated assumption is
not.

## 11. Revision History & Amendments

Approved text above is never edited. An amendment is appended here as a
dated subsection (`### Amendment NN — YYYY-MM-DD`) carrying the new normative
text, plus a row in the log:

| Date | Rev | Change | By  |
| ---- | --- | ------ | --- |
|      | 0   | Draft  |     |
