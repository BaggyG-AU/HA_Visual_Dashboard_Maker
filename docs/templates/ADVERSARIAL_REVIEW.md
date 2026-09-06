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

**The owner's profile (standing line — STRAT-D15 / strategy correction C6):**
the owner gate is held by a **non-developer** — write for the reader who
actually rules. Anything routed to the owner uses the **Owner Decision
Brief**: what this protects in product terms / what is going wrong plainly /
is the product affected Yes-No-Unknown with honest evidence status / options
with costs / recommendation and why / what happens if you do nothing. Never
require the owner to classify a diff or apply developer instinct.

**Reviewer write-restrictions (acknowledged):** no `[STATE]` drawer update;
no UAT card marked or re-scored; no `src/` change; no merge; `<HA_HOST>`
read-only. Proposed changes go in this document, nowhere else.

**Where your MemPalace notes go (ruling MP-LEASE).** If MemPalace is absent,
or present with the **write** refused by the per-palace writer lease — the
normal case when author and reviewer run concurrently — record them in a
`MemPalace drawer candidates` section at the end of **this document**, not in
the PR body, and the write-enabled author files them with
`added_by="<reviewer>"`. This is the independent reviewer's exception to the
general PR-body fallback, and it is carried in `ai_rules.md` §11 itself as
well as `docs/governance/OPERATING_AGREEMENT.md` §2. ⚠ Never kill a process to
free the lease and never set `MEMPALACE_MCP_ALLOW_PEER_WRITER`.

**Execution rules — EVERYTHING HEADLESS.** Quoted verbatim from the
standing-rules record (`drawer_havdm_governance_b282610792b253fee5c09b40`);
the item numbering is that record's own:

> 1\. ⚠⚠ **EVERYTHING HEADLESS:** `bash tools/test-headless.sh <spec…>
--project=electron-e2e|electron-integration --workers=1`. MULTIPLE SPECS IN
> ONE INVOCATION WORK. 2. **INTEGRATION IS A SEPARATE PROJECT — run
> SEQUENTIALLY.** 3. **DO NOT RUN THE UNIT SUITE WHILE AN ELECTRON SUITE IS
> LIVE.** 4. **TO SEE THE APP: `npm run start:wsl`.** 6. **LIVE HA:
> `HAVDM_LIVE=1 npx playwright test --project=live-ha`.**

A suite you cannot run headless is declared **UNRUN** — it is never launched
headed; `xvfb-run -a` is the fallback where the helper script does not fit.
This section exists because this template measurably carried zero
headless/xvfb mentions (strategy claim L6, MEASURED 2026-08-18) after a
review's suite run had put an app window on the owner's desktop.

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

One verdict line, then the headline conclusion in three sentences or fewer,
before any evidence.

**The verdict is DERIVED from §4's severities, never chosen (owner ruling
SEV-CAL-2, 2026-09-06).** Exactly one of:

- `BLOCKED-ON: <component>[, <component>…]` — if and only if at least one
  finding is SEV 1 carrying its full four-part proof. List every `Blocks:`
  scope a SEV 1 names, and nothing wider. The owner decides the merge.
- `CLEAR-WITH-FINDINGS` — no SEV 1; one or more SEV 2–4 findings, reported in
  full below.
- `CLEAR` — no finding at any severity. A legitimate result (§0 rule 5).

No other verdict token is valid. `CHANGES-REQUIRED`, `SEV-1-BLOCKED`,
`PARTIALLY-CONFIRMS` and `APPROVE` are retired as verdicts: on PR #154 the
verdict tracked whichever token the commission supplied, and seven rounds
returned `CHANGES-REQUIRED` with no SEV 1 present. A follow-up round reports
each prior finding's closure — RESOLVED / PARTIALLY RESOLVED / REGRESSED /
OPEN — as disposition lines in §4; every prior finding not in a terminal
state (RESOLVED, DEFERRED, ACCEPTED-RESIDUAL) is re-graded on the behaviour
that remains and counts toward the verdict like any other finding, so a
PARTIALLY RESOLVED remainder is a live finding with its own grade. ⚠ A
commission may add requirements to a review (strategy D10) but may not define,
add or vary a verdict token or a severity grade — those belong to this
template alone.

## 1a. Owner Summary Table

**Before any technical detail (owner ruling SEV-CAL-1, 2026-09-03).** The
owner is a non-developer who arbitrates every finding personally; a review
that can only be actioned by reading code has not been delivered. One row per
finding:

| Ref | What is wrong, in plain English | Severity | Blocks | Fix complexity (1–5) | Recommendation |
| --- | ------------------------------- | -------- | ------ | -------------------- | -------------- |
|     |                                 |          |        |                      |                |

- **Ref** — `P1`, `P2`, `P3`… in finding order, stable for the life of the
  review and never reused, because the owner replies by reference ("P1
  accept, P3 defer"). A follow-up round continues the sequence; it never
  restarts it.
- **Plain English** — judgeable by someone who has never read the code. No
  identifiers, no line numbers, no domain or grammar jargon in this column;
  those belong in §4.
- **Blocks** — the `Blocks:` scope for a SEV 1; `None` otherwise.
- **Fix complexity** — 1 = a wording change or one-line edit; 3 = a contained
  change plus its tests; 5 = a redesign, a new dependency, or a blast radius
  beyond the module. Justified in one clause in §4.
- **Recommendation** — one of **Fix now / Fix later / Accept as-is / Owner
  judgement needed**; for the last, say what the choice is between. ⚠ This
  column is INPUT to the owner's decision under
  `docs/governance/OPERATING_AGREEMENT.md` §3.4 (SEV-CAL-2 ruling 6), never
  the decision itself.

Anything routed to the owner beyond this table — a contested classification,
a residual to declare, a stop-or-continue choice — uses the Owner Decision
Brief (STRAT-D15) named in the header, immediately after this table.

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

**Severity contract (STRAT-D18, owner-ruled 2026-08-18, as amended by
SEV-CAL-1 on 2026-09-03 and SEV-CAL-2 on 2026-09-06 — binding for any
document whose function is to evaluate another artifact, however
commissioned):** every finding is tagged **SEV 1–4**. SEV 1 and SEV 2 each carry
two readings with identical blocking semantics: the DOCUMENT reading (STRAT-D18's
original, for specs, plans, strategy and governance text) and the
IMPLEMENTATION reading (SEV-CAL-2 ruling 8, for code, tests, tooling and
checkers).

- **SEV 1 — blocks the affected COMPONENT only, never the pull request.**
  Document reading: the target as recorded is internally contradictory,
  contradicts a binding ruling it does not explicitly supersede, rests on a
  demonstrably false factual claim, or is unexecutable as written.
  Implementation reading: the artifact's stated contract is violated under a
  condition that exists today — an input, an execution path, a state, an
  output, or a property of the artifact itself — or under a future condition
  the reviewer has ARGUED to be plausible. **Every SEV 1 carries the four-part proof:** (1) the decision,
  claim or contract broken; (2) the violated fact or text at `path:line`;
  (3) why no recorded mitigation covers it; (4) **REACHABILITY — the input or
  condition that reaches this defect, and whether it exists today.** Missing
  any part → at most SEV 2. **A finding whose only demonstration is a
  synthetic input or condition nobody has produced caps at SEV 2** — reported in full, never
  blocking. ⚠ The safety-gate exemption must be ARGUED, not assumed: where the
  artifact's whole job is catching the not-yet-written, a synthetic
  demonstration may still carry SEV 1 only if the reviewer states why the
  construction is a PLAUSIBLE future edit rather than merely a constructible
  one; an unargued exemption grades SEV 2. Calibration: "someone adds a second
  totals block" is plausible; "someone puts a tab before the fence" is not.
  **Every SEV 1 states `Blocks: <component>`** on its own line — the narrowest
  thing that cannot ship as recorded (`Blocks: C3 blocking half`, never
  `Blocks: PR #154`); a whole-change block must justify why the narrower scope
  is insufficient. The whole-PR token `SEV-1-BLOCKED` is withdrawn. The
  reviewer decides severity and scope; **the owner decides the merge.**
- **SEV 2 — does not block.** Document reading: rests on an unverified or
  overstated claim, or an unmitigated risk. Implementation reading: the
  contract is violated only under a constructible condition nobody has
  produced (the reachability cap), or the claim about the code is unverified
  or overstated.
  Each goes to the owner as an Owner Decision Brief, and **the owner decides
  fix-now / defer / accept-residual per finding, by Ref**
  (`docs/governance/OPERATING_AGREEMENT.md` §3.4).
- **SEV 3 — recorded; no round-trip is owed.** Documentation, comment or
  record accuracy; a stale or inconsistent statement whose correction changes
  no behaviour. The owner may still elect a fix under §3.4.
- **SEV 4 — recorded; no round-trip and no owner brief is owed.** Style,
  wording preference, or an improvement with no defect behind it. The owner
  may still elect a fix.
- **The authority boundary:** owner judgment calls are not reviewable defects
  above SEV 4 — attack the facts a choice rests on, never the authority to
  make it. Contested classifications go to the owner as briefs.
- **Bundling (SEV-CAL-2 ruling 9):** one finding per behaviour. Where several
  constructions are bundled under one finding, state the severity per
  construction; the finding's headline severity is the highest that carries
  its own four-part proof.
- The severity model governs what **blocks**, never what may be **reported**:
  report full signal, tagged. This template's machinery applies in full, and
  commissions may add requirements, never subtract (strategy D10) — but a
  commission may not define, add or vary a verdict token (§1) or a severity
  grade.

Per finding: **evidence** (`path:line`), **problem**, **concrete fix**, and
**what must NOT change** (the guard rails around the fix). Separate PIVOTS
from FIXES and rank them.

Add **class swept:** per finding — the class the instance belongs to and
whether every member was checked (§0 rule 1). "Class: all 23 test legs —
swept, 3 affected" closes the class; "class not swept" tells the author to
sweep it before fixing. This is what stops the next round re-reporting the
same defect one instance later.

⚠ **The same-seam rule (SEV-CAL-2 ruling 7).** If a finding in a scoped
follow-up sits in the same seam as the finding whose repair you are
reviewing, state the seam as a BEHAVIOUR, sweep every member of it — or
declare it unsweepable and say why — before reporting. One more instance is
not a report. Measured basis: PR #154's seven SEV-2s were one seam; every
round wrote "Class swept" with the class drawn one layer wide, and the next
round found a sibling.

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
