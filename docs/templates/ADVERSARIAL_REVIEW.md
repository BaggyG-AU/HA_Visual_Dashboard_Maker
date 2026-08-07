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
no UAT card marked or re-scored; no `src/` change; no merge; `<HA_HOST>`
read-only. Proposed changes go in this document, nowhere else.

## 0. Working practice this review is held to

<!--
These are the cross-project `practice` wing rules that bear on a reviewer.
They are QUOTED HERE VERBATIM, not cited, because the reviewer is often a
model with no MemPalace access — it judges against exactly what this prompt
supplies. If the reviewer DOES have MemPalace, the full drawers are in the
wing index `drawer_practice_charter_a914959dbe8a1120cffad334`.
Keep this section in sync when the wing's reviewer-facing rules change.
-->

1. **A finding is a sample, not the population.** When you find a defect,
   identify the CLASS it belongs to — all rows of that table, all call sites,
   all specs of that kind — and sweep every member before reporting. Say which
   you did: "L12 is misclassified" and "I checked all 15 legs; only L12 is
   misclassified" are different reports, and only the second lets the author
   stop. Reporting instances one round at a time makes you an expensive linter.
2. **No unverified universals.** "Only", "every", "all", "none" or any count is
   a measurement and needs the enumeration that backs it, attached to the
   claim. A count of containers is not a count of contents — the command you
   ran must measure the property you are asserting.
3. **A check is evidence only for the property it exercises.** Before writing
   "verified", ask: if this claim were false, would what I ran have failed? A
   green suite proves nothing if the tests were written to agree with the code;
   an isolated pass says little about a flaky path; confirming the wiring is
   not confirming that a value flows through it.
4. **Verify each finding against the source before reporting it.** Quote
   `path:line`. A finding you cannot locate is a question, and should be
   written as one. Check whether the thing you are calling an inconsistency is
   a DELIBERATE decision recorded somewhere you were not shown — say so if you
   suspect it rather than asserting a defect.
5. **Silence is not a result.** State "no issue found" explicitly for every
   heading you were asked to cover, so the reader can trust the heading was
   checked. Zero findings on a mature artifact is a PASS, not a failed review —
   never manufacture a finding to justify the pass.
6. **Declare your evidence boundary** (see §2): what you could not run, could
   not reach, or could not verify. `UNVERIFIABLE` is a result; a quietly
   dropped claim is not.

## 1. Verdict first

The headline conclusion in three sentences or fewer, before any evidence.

## 2. Confidence and method

What was actually done (files read, commands run, suites executed) and how
confident the verdict is. Never claim a run that did not happen.

**Constraints — what this review did NOT establish.** Suites not run,
environments not exercised, documents or systems unreachable in this session,
and what that means for confidence (e.g. "targeted probes are review evidence,
not release gates"; "reviewed the dev build, not the packaged binary"). A
reader must be able to tell "checked and clean" from "never looked".

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

Add **class swept:** per finding — the class the instance belongs to and
whether every member was checked (§0 rule 1). "Class: all 23 test legs —
swept, 3 affected" closes the class; "class not swept" tells the author to
sweep it before fixing. This is what stops the next round re-reporting the
same defect one instance later.

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
