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
**Author:** \<exact model, e.g. "Claude Fable 5" — per
`docs/governance/OPERATING_AGREEMENT.md` §3.1\>
**Reviewer:** \<different model — the §3.6 default seat table applies, or the
owner's per-slice override recorded here\>
**Owner gate:** spec approval before any code (ruling ARB-R7 /
`docs/governance/OPERATING_AGREEMENT.md` §1, §3)
**Branch:** `feature/<slug>` · **Created:** \<YYYY-MM-DD\>
**Classification:** capability | content — the slice-lane depth dial
(STRAT-D6, `docs/governance/OPERATING_AGREEMENT.md` §3.7), declared here so
it is visible at spec approval. Capability-class (shared machinery: services,
store, BaseCard, cardRegistry, test DSLs, CI logic) takes the full chain;
content-class (individual renderers, panels) takes the light process.
**Parent objective:** \<the objective this slice serves\> · **Cheapest
acceptable outcome:** \<the least this could deliver and still serve it\> ·
**Cost stop-rule:** \<the spend at which work halts and re-asks\>
(STRAT-D6 — required in both lanes)

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

**Deliverable identities** (strategy D8 as corrected by C4,
`docs/strategy/2026-08-18-model-roles-and-workflow-adoption.md`):
document-internal IDs are **stable and never recycled, and gaps are
deliberate** — a retired ID is never reissued to new work, and a missing
number means retirement, not renumbering. Slice-level deliverables become
**GitHub Issues at spec approval**; story Issues are never deleted and never
transferred (a project-owned prohibition, not a platform guarantee); the
dropped-commitment checker treats a missing or relocated Issue number as a
drop finding.

**The approval-to-Issue order, stated against this template's immutability
convention (review finding F6):** (1) the owner approves the spec — its
deliverable IDs lock with the approved text; (2) that approval itself
authorises creating the coverage table's story Issues (strategy D9/D11 — no
unbidden Issue creation); (3) the resulting spec-ID → Issue-number mapping is
**appended as a §11 amendment**, never written into the approved table. The
`Issue #` column below therefore reads `—` at approval, and the §11 mapping
amendment is its authoritative record.

| Finding / Ruling / Deliverable | Addressed in section | Issue #          | Status            |
| ------------------------------ | -------------------- | ---------------- | ----------------- |
| \<e.g. UAT F5, ruling ARB-R7\> | §\<n\>               | — until §11 maps | Covered / Partial |

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
