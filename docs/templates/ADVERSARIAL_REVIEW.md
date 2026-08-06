# HAVDM Adversarial Review — <round-or-gate> <YYYY-MM-DD> (<REVIEWER MODEL>)

<!--
Template: copy to
docs/reviews/HAVDM_ADVERSARIAL_REVIEW_<YYYY-MM-DD>_<round-or-gate>_<MODEL>.md
(the round/gate segment — e.g. r4, v1.0.0-gate — keeps two same-model reviews
from colliding; pre-existing review files keep their historical names).
Cadence (owner-ruled 2026-08-06): before EVERY UAT round and every release
gate. The cross-check by the second model lands as a separate file
(…_<MODEL2>_CROSSCHECK.md) or a clearly-delimited section — never by amending
the first review's commit, so critique and target stay separately reviewable.
Governed by docs/governance/OPERATING_AGREEMENT.md §3.2.
-->

**Author:** \<first-pass reviewer model, date\>
**Reviewer:** \<cross-checker — a different model; its verdicts land in the
cross-check section below or its own `_CROSSCHECK` file\>
**Owner gate:** owner arbitration of the findings; this document decides
nothing on its own.
**Commissioned by:** owner · **Scope:** \<commit range / branch / documents
under review\>

**Reviewer write-restrictions (acknowledged):** no `[STATE]` drawer update;
no UAT card marked or re-scored; no `src/` change; no merge; `ha.home.local`
read-only. Proposed changes go in this document, nowhere else.

## 1. Verdict first

The headline conclusion in three sentences or fewer, before any evidence.

## 2. Confidence and method

What was actually done (files read, commands run, suites executed) and how
confident the verdict is. Never claim a run that did not happen.

## 3. Claim ledger

Every load-bearing claim in this review, tagged:

| #   | Claim | Tag: MEASURED / INFERRED / JUDGEMENT | Evidence (`path:line`, command, or reasoning) |
| --- | ----- | ------------------------------------ | --------------------------------------------- |
|     |       |                                      |                                               |

- **MEASURED** = observed directly this review (command output, a run, a
  read). **INFERRED** = deduced from evidence but not directly observed.
  **JUDGEMENT** = opinion. A triage hypothesis built from reading is a coin
  flip — measure it.
- Close the ledger with **"Weakest claims"**: the claims the author is least
  sure of, handed explicitly to the cross-checker. This is the single most
  valuable input a cross-checker gets.

## 4. Findings (ranked, most severe first)

Per finding: **evidence** (`path:line`), **problem**, **concrete fix**, and
**what must NOT change** (the guard rails around the fix). Separate PIVOTS
from FIXES and rank them.

## 5. Directions

Actionable and specific — file + function, the proof-of-fix regression test,
cost, priority — but advisory pending owner arbitration. If the conclusion is
that no pivot is needed, say that plainly and do not manufacture one.

## 6. Disagreements

Where this review disagrees with an existing triage, spec, or prior review:
state the disagreement **as a disagreement** — never a merged compromise.
The owner arbitrates.

---

## Cross-check (second model)

**Cross-checker:** the Reviewer named in the header — instructed to disagree
where it disagrees and not to soften a refutation into a partial
confirmation. _Two models that agree because the second deferred to the first
have cross-checked nothing._

1. **Per-claim verdicts** on the §3 ledger (weakest claims first):
   `CONFIRMED / PARTIALLY CONFIRMED / REFUTED / UNVERIFIABLE`, each with
   evidence.
2. **What the first review missed** — new findings, numbered N1, N2, …
3. **Verdict on each §5 direction:** `SOUND / NEEDS-CHANGE`, with the change.
4. **Owner arbitration points** created by this cross-check — every
   remaining first-review-vs-cross-check disagreement, listed for ruling.
