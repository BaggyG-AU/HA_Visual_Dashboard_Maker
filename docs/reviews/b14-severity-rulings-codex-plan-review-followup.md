# B14 Severity Rulings Codification — Plan Review Follow-up

Author: Claude Fable 5.1
Reviewer: OpenAI Codex / GPT-5.6 Sol
Owner gate: micah / BaggyG-AU. This document decides nothing on its own.

BLOCKED-ON: §3.3 owner-decision rule, §3.3 non-repair boundary, §1.3/§8 reachability restatements

Three same-seam SEV 1 remainders leave P2, P3 and P6 only partially resolved; P7 and P8 also retain non-blocking evidence defects, while the arithmetic, ledger fingerprint and other seven prior closures hold.

## Owner Summary Table

| Ref | What is wrong, in plain English                                                                                            | Severity | Blocks                            | Fix complexity 1–5 | Recommendation |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------- | -----------------: | -------------- |
| P2  | A broad urgent fix can still be used to smuggle in a lower-priority fix before you rule on it.                             | SEV 1    | §3.3 owner-decision rule          |                  1 | Fix now        |
| P3  | The new wording can make this follow-up review itself require another follow-up forever.                                   | SEV 1    | §3.3 non-repair boundary          |                  1 | Fix now        |
| P6  | The technical rule was broadened as you directed, but two owner/reviewer summaries still describe the old input-only rule. | SEV 1    | §1.3/§8 reachability restatements |                  1 | Fix now        |
| P7  | Two broken source lists can still display the expected total and pass the stated replay check.                             | SEV 2    | None                              |                  1 | Fix now        |
| P8  | The acceptance checklist still promises a complete sweep that its search and limited manual read cannot prove.             | SEV 2    | None                              |                  1 | Fix now        |
| P13 | The story says twenty-one findings in its explanation but still asks for twenty in its completion checklist.               | SEV 3    | None                              |                  1 | Fix now        |
| P14 | The evidence table calls every row measured even though the next sentence identifies one row as manual judgement.          | SEV 3    | None                              |                  1 | Fix now        |

## Owner Decision Brief

**What this protects in product terms.** B14 is meant to reduce review churn without letting an author bypass the owner's per-finding decision or weakening the rule that an actual repair receives one scoped follow-up. The wording also has to let the review lifecycle terminate.

**What is going wrong plainly.** The overlap exception does not confine itself to the part of a SEV 1 repair that is genuinely unavoidable. The next sentence then calls any artifact change made in response to a finding a repair; because this committed review is itself such an artifact, that reading creates an endless review chain. Separately, the owner summary and reviewer question still say “input” after the owner broadened the rule to several kinds of condition.

**Is the product affected?** No runtime product behaviour changed on this Markdown-only branch. The governance authorisation is affected: landing these sentences would make the owner's decision gate avoidable, the follow-up boundary self-recursive, and the approved reachability rule internally inconsistent.

**Options with costs.** The same-seam rule now applies to the P2, P3 and P6 remainders:

1. **Continue** — make narrow wording corrections and return them to this reviewer. Cost: three small prose repairs plus one scoped follow-up.
2. **Declare residual** — knowingly accept the bypass, recursion and stale summaries. Cost: ambiguous standing governance on every later review; not recommended.
3. **Park** — do not authorise the §3 governance edits and leave B14 pending. Cost: the existing review-round problem remains, but no defective rule lands.

**Recommendation and why.** Continue. The blocking defects are real but mechanically small: require only an inseparable/necessary SEV 1 overlap, scope “repair” to an author's change to the reviewed target or its safeguard, and replace the two stale input-only restatements. For P7, P8, P13 and P14, fix now as well: each is a one-line or short-command correction and none needs a policy choice.

**If nothing is done.** A future author can select a wider SEV 1 repair and incidentally close unruled work, a literal reader can demand follow-ups on review records themselves, and the owner can approve a plain-English rule different from the technical one.

## Prior-finding dispositions — P1–P12

### P1 — RESOLVED

Checked `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:132-136` and `:314-324`. Revision 2 says that every non-terminal prior finding “is re-graded on the behaviour that remains and counts toward the verdict,” and it adds `PARTIALLY RESOLVED` to the six disposition states. This completely closes the missing verdict-accounting case without changing the three verdict tokens.

### P2 — PARTIALLY RESOLVED — remainder SEV 1

Checked `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:330-339`. The new text correctly permits a required SEV 1 repair to overlap an OPEN lower-severity finding and leaves the lesser Ref OPEN. The closure is incomplete because “no repair undertaken SOLELY for it” plus “a repair required for a SEV 1 may overlap it” does not say that the overlap must be **necessary or inseparable**. A chosen broad repair can therefore include separable lower-severity work before the owner rules. Full proof is under “Live remainders” below.

### P3 — PARTIALLY RESOLVED — over-reaching remainder SEV 1

Checked `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:340-347`. “A label never changes the substance of a diff” closes the original escape hatch for a changed pin or governed residual. The next universal over-reaches: “any artifact or safeguard change made in response to a finding” includes a committed follow-up review artifact, which is not a repair. The exempt decision, disposition row and board pointer do not cover that required review record. Full proof is under “Live remainders” below.

### P4 — RESOLVED

Checked `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:25-28`, `:446-493` and `:544`. The plan now records 21 findings, 7 SEV 2, 14 SEV 3, 18 fixed, 3 residual, eight repair rounds, seven follow-ups, and the final unreviewed repair; scenario A is 9 rounds / 21 rulings. Independent heading, disposition and commit-order enumerations reproduce those figures. P13 below is a separate stale checklist line in the external story, not a remaining error in these repaired plan claims.

### P5 — RESOLVED

Checked `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:242-250`, `:330-340` and `:531`. Mandatory briefs and the OPEN gate now apply to SEV 2 and SEV 3 only; SEV 4 remains recorded and the owner may elect a fix. No SEV 4 mandatory-decision restatement remains in the changed plan.

### P6 — PARTIALLY RESOLVED — remainder SEV 1

Checked `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:217-240`, `:41`, `:540` and `:544`. The proposed technical contract correctly names an existing input, execution path, state, output or property of the artifact and uses “condition” in the proof and SEV 2 cap. A static missing-manifest defect is now gradeable. A made-up tab-before-fence case remains SEV 2 under the specific synthetic-condition cap at `:224-231`; relabelling the parser weakness as a current artifact property does not remove the obligation to identify the condition that reaches the defect.

The closure is nevertheless incomplete across its consequences: the owner-facing behaviour at `:41` and the reviewer question at `:540` still quote the superseded input-only rule. Full proof is under “Live remainders” below.

### P7 — PARTIALLY RESOLVED — remainder SEV 2

Checked `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:450-457`. Both commands now print 21 on the current source, so the 34-row overmatch is fixed. They still do not implement the required uniqueness-and-join assertion: `sort -u` hides duplicate source headings, `grep -c` counts duplicate disposition rows, neither command fails when its result is not 21, and the two Ref sets are never compared. A synthetic control produced `source_unique=21` and `disposition_rows=21` while P13 was missing and P12 was duplicated.

### P8 — PARTIALLY RESOLVED — remainder SEV 2

Checked `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:402-426` and `:500-501`. Section 3.6 now honestly calls the command a six-token inventory and limits the behavioural hand trace to the named live surfaces. AC-3 includes `APPROVE`; its exact command returned exit 1 with no output on the unedited current template, as expected. But AC-2's criterion still says “Every tracked restatement swept” even though `:404` correctly says that property is not decidable by search and the manual read claims only named surfaces. Its check can pass while a synonym-only restatement survives elsewhere.

### P9 — RESOLVED

Checked `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:378-385` against `docs/governance/OPERATING_AGREEMENT.md:434-440`. The two SEV-CAL rows now provide short ruling locators, binding-text locations and authority, and the amended STRAT-D18 row points to them. They no longer reproduce the operative rules in full.

### P10 — RESOLVED

Checked `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:478-493`. P30 is now in seam C as comment accuracy. Scenario C ends in round 2, so that later-row relabelling does not change its eight-decision arithmetic.

### P11 — RESOLVED

Checked `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:56-61`. The false claim that counts appear once is gone. The replacement identifies §1.2 and §3.6 as the measured sources and makes later occurrences cross-checked restatements. The plan's repaired numerical restatements agree; P13 concerns the external story.

### P12 — RESOLVED

Checked `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:523-525` against `tests/support/authorLedger.ts:308-325`. The text now distinguishes semantic interpretation by runtime/product code from the ledger's byte read for the governed fingerprint. The named `readFileSync` dependency is no longer hidden.

## Live remainders — full proofs and class sweeps

### P2 remainder — SEV 1 — the overlap exception is not confined to unavoidable overlap

**Blocks: §3.3 owner-decision rule**

**Four-part proof.** (1) The protected decision is that the owner rules on every SEV 2/3 repair before it is committed, with one narrow exception for a SEV 1 repair that cannot avoid the same lower-severity closure. (2) The proposed text at `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:330-339` prohibits only work undertaken “SOLELY” for the lower finding and permits “a repair required for a SEV 1” to overlap it. It does not require the **overlapping portion** to be necessary or inseparable. (3) Keeping the lower Ref OPEN records the later decision but does not undo a repair already committed, and no other clause limits the breadth of the selected SEV 1 repair. (4) **REACHABILITY:** a SEV 1 and an OPEN SEV 2 concern one paragraph; a narrow edit can fix only the blocker, but the author replaces the paragraph and calls that chosen broad repair “required for” the SEV 1. The separable SEV 2 correction then lands before the owner rules. This is a plausible ordinary governance edit.

**Correction.** Permit overlap only to the extent necessarily inseparable from resolving the SEV 1; any separable lower-severity repair still awaits the owner's ruling. Adding “necessarily” to “required” helps, but the protected object should be the overlapping portion, not merely the repair's headline purpose.

**What must not change.** Keep genuinely inseparable SEV 1 overlap possible, keep the lesser Ref OPEN for owner disposition, and do not introduce an author-selected default.

**Class swept.** Separate files, separable lines, inseparable same-line wording, a necessary shared replacement and a chosen broad superset were traced. Revision 2 handles the necessary cases but not the chosen superset.

### P3 remainder — SEV 1 — “any artifact change” makes the review record recursive

**Blocks: §3.3 non-repair boundary**

**Four-part proof.** (1) The protected contract is one scoped follow-up for each actual repair, while a decision/record that changes no reviewed target or safeguard is not itself a repair. (2) The proposed text at `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:340-347` declares “any artifact or safeguard change made in response to a finding” a repair. The current OA calls reviews governed artifacts at `docs/governance/OPERATING_AGREEMENT.md:143-149` and requires each review to be committed at `:155-156`. (3) Nothing limits “artifact” to the target under review or limits the actor to the repair author; the three exemptions omit the follow-up review document. (4) **REACHABILITY:** this required follow-up file is committed because P1–P12 were repaired. On the proposed literal rule it is an artifact change made in response to those findings, becomes a repair, and requires another follow-up, whose file repeats the condition without a terminating state.

**Correction.** Define the trigger around an author's change to the artifact under review or its safeguard made to resolve or mitigate the finding. Explicitly keep review reports and other evidence/decision records that do not change the reviewed target outside “repair.”

**What must not change.** A new or changed `KNOWN-OPEN:` pin, governed residual, test, code or target prose made to address a finding remains a repair regardless of its label and receives follow-up.

**Class swept.** Pure owner decision, disposition row, board pointer/item, owner brief, evidence record, reviewer follow-up, changed pin, changed governed residual and repaired target were traced. Target/safeguard changes need follow-up; records of deciding or reviewing them do not.

### P6 remainder — SEV 1 — two restatements still bind the old input-only object

**Blocks: §1.3/§8 reachability restatements**

**Four-part proof.** (1) The owner ruled that reachability is broadened from an input to an input, execution path, state, output or property of the artifact itself. (2) Revision 2 implements that at `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:217-240` and records it at `:544`, but the owner-facing approved behaviour at `:41` still requires “the input,” and reviewer question 6 at `:540` still quotes “an input that exists today, or an argued-plausible future input.” (3) The technical block does not mitigate contradictory owner-facing and reviewer-facing instructions: §1.3 says it is the list of behaviours being approved, while §8 directs the reviewer what construction to test. (4) **REACHABILITY:** the owner reads §1.3 to decide whether to authorise the plan, and the next plan reviewer reads §8 to test it. Both conditions exist in this approval track today; either reader can apply the narrower, superseded object.

**Correction.** Replace both restatements with the owner-ruled “input or condition” vocabulary and, in the owner summary, give plain examples such as execution path, state, output or a property of the artifact.

**What must not change.** Preserve the synthetic-only SEV 2 cap and the argued-plausible safety-gate exception. Do not turn “property of the artifact” into a way around the reaching-condition proof.

**Class swept.** A source search located each reachability restatement, followed by a manual read of its function: technical contract `:217-240` correct; owner summary `:41` stale; coverage table `:83/:89` locators only; ruling rows `:384-385` locators only; reviewer question `:540` stale; owner-ruling record `:544` correct; revision history `:551` correct.

### P7 remainder — SEV 2 — equal counts do not prove a one-to-one replay

**Evidence.** The two commands at `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:450-455` both printed 21. A known-bad in-memory Ref set with one missing Ref and one duplicate also produced 21/21; the control reported `missing_from_dispositions=13` and `duplicate_disposition_refs=12`.

**Problem.** The acceptance evidence checks two cardinalities, not uniqueness and membership equality. It can silently certify a replay whose source and disposition sets differ.

**Correction.** Extract raw Refs from each side, fail if either raw list has duplicates, compare the sorted unique sets with `diff`, and assert the expected count with a command whose exit status becomes non-zero on mismatch.

**What must not change.** Keep headings—not Owner Summary rows—as the source population and keep the seam classification a labelled hand trace.

**Class swept.** Correct set, duplicate-only, omission-only, duplicate-plus-offsetting-omission and equal-cardinality/different-member cases were considered; the last two evade the current pair.

### P8 remainder — SEV 2 — AC-2 retains the undecidable universal

**Evidence.** Section 3.6 says the behavioural class is not decidable by search and limits its hand trace to named surfaces at `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:402-424`. AC-2 still requires “Every tracked restatement swept” at `:500`, while its check measures the six-token inventory plus those limited surfaces.

**Problem.** A synonym-only restatement in any other tracked document leaves the criterion false while every stated check passes. The check cannot clear the claim it is paired with.

**Correction.** Change the criterion itself to the decidable result: the six-token inventory is complete and partitioned, and the named live surfaces received a labelled behavioural read. Do not call that “every tracked restatement.”

**What must not change.** Keep the current separation between token inventory, named-surface hand trace and session-local `prompts/` observation; keep `APPROVE` in AC-3.

**Class swept.** Exact-token files, synonym-only prose, the two named live surfaces, historical records, code comments and gitignored prompts were considered. The overclaim survives only in AC-2's criterion.

## Regression and contradiction sweep

- **§1.3 — finding:** P6's stale input-only summary at `:41`; the other eight behaviour rows remain aligned with §2.1 and §3. No other issue found.
- **§2.1 — no issue found:** all nine Issue #156 rulings, the strategy pointer, token/behaviour sweep, author-ledger fingerprint and cleanup board target remain mapped to edit surfaces.
- **§3.5 — no issue found:** the source D18 record is still `docs/strategy/2026-08-18-model-roles-and-workflow-adoption.md:312-325`, and the proposed paragraph is a dated pointer placed after it, not an in-place rewrite.
- **§3.7 — no issue found:** `tests/support/authorLedger.ts:68` still defines the four governed path classes; the plan changes one governed file and the review/ledger files remain outside that fingerprint.
- **§3.8 — no issue found:** the draft board item remains future edit-stage work, Issue creation remains owner-gated, and no PR #154/#155 finding is retro-filed.
- **§4 — no issue found:** the protected D7 spans, historical reviews, checker-governed plan, source/tests/tools and no-machine-enforcement boundaries remain named. The four D7 comparisons extracted 6/4/8/5 non-zero lines and were byte-identical to `main`.
- **§8 — finding:** question 6 still quotes P6's pre-repair input-only wording at `:540`; questions 1–5 remain aligned with the repaired targets. No other issue found.
- **Issue #156 rulings and acceptance criteria — finding P13 only:** the plan represents all nine rulings and all acceptance behaviours; the story's replay checklist alone retains the obsolete total.

## Confidence and method

**Confidence: high** on the three SEV 1 remainders because each is directly reachable in the proposed rule text or its live owner/reviewer surface. **Confidence: high** on P7/P8 and the historical arithmetic because the commands were run with controls. **Confidence: high** on P13/P14 as record defects. The semantic boundary around the words “required” and “artifact” is the least mechanical part and is exposed again under Weakest claims.

### Files and records read

- The commission, revision-1 review, revision-2 plan, repair-disposition ledger and author ledger, in full or by complete relevant sections.
- `docs/governance/OPERATING_AGREEMENT.md` §§1–4 and `docs/templates/ADVERSARIAL_REVIEW.md`, end to end; `CLAUDE.md` and `ai_rules.md` for governing workflow and memory rules.
- All eight PR #154 implementation-review files, their P12–P32 headings/disposition rows, and commit order `016cd03^..0cd2a05`.
- GitHub Issue #156, fetched directly with `gh issue view`.
- Owner decisions `drawer_havdm_decisions_9585602957964a59bf9571be`, `drawer_havdm_decisions_38993740c044247b0cf10527`, and `drawer_havdm_decisions_18da8a2c9bbad788a21abaee`; the original and corrected round-count investigations.
- Practice rules for follow-up repair review, check-to-claim fit and universal/count claims.

### Commands run and real results

| Purpose                   | Command or command family                                                 | Real result                                                                                  |
| ------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Starting-state stop gate  | branch, HEAD/main, ahead/behind, four-commit log, status                  | exit 0; required branch; HEAD `39c53d6`; `main` `fa685ef`; 4 ahead / 0 behind; clean         |
| Repair scope              | `git diff --name-status d6190d4..39c53d6`                                 | exit 0; exactly the plan, new disposition ledger and author ledger                           |
| Issue authority           | `gh issue view 156 --repo BaggyG-AU/HA_Visual_Dashboard_Maker --json ...` | exit 0; current body read; narrative says 21, checklist still says 20                        |
| Finding population        | exact `### P<n> — SEV-<n>` heading enumeration                            | exit 0; 21 unique: 7 SEV 2 and 14 SEV 3                                                      |
| Dispositions              | P12–P32 plan-row enumeration                                              | exit 0; 18 FIXED, 3 residual, 21 total                                                       |
| Review/repair cadence     | `git log --reverse --format='%h %s' 016cd03^..0cd2a05`                    | exit 0; 8 review commits and 8 repair groups; only the first 7 repair groups have follow-ups |
| Replay commands           | the two commands at plan `:452-454`                                       | exit 0; 21 and 21                                                                            |
| Replay negative control   | in-memory duplicate/omission Ref construction                             | exit 0; both counts 21 while P13 missing and P12 duplicated                                  |
| Six-token inventory       | plan §3.6 command on `main` and reviewed HEAD                             | exit 0; 100 and 102; HEAD delta is the plan plus round-1 review                              |
| AC-3 current-tree control | exact AC-3 `git grep`                                                     | exit 1, empty output, expected before template edits                                         |
| Protected D7 spans        | plan AC-4 command                                                         | exit 0; byte-identical spans with non-zero lengths 6 / 4 / 8 / 5                             |
| Fingerprint transition    | ledger reads at `d6190d4`, `0aecb8b`, `39c53d6`                           | exit 0; `08c029eaec8f` → `8a1c77bae104`; current declaration retained at `39c53d6`           |
| Focused current-tree gate | `npx vitest run tests/unit/author-ledger.spec.ts`                         | exit 0; 9/9 passed                                                                           |
| Required repository gate  | `./tools/checks`                                                          | exit 0; 4/4 steps; 1559 tests passed in 105 files                                            |
| Final scope/status        | `git status --porcelain`; `git diff --check`; committed-file check        | exit 0; before commit only this review file; after commit clean; one-file review commit      |

### Evidence boundary

- No e2e, integration, Electron, packaged-app or live-HA process was launched, as commissioned for this Markdown-only branch.
- I did not edit a governance document, disposition ledger, author ledger, source, test, board item, PR body or Issue.
- I did not run the optional detached `0aecb8b` negative test. Its claimed M1 failure is **UNVERIFIED in this review**; the current `39c53d6` 9/9 pass, the eight-line ledger delta and the checker source were verified.
- The gitignored `prompts/` population has changed since revision 2; the current session observed 141 files / 94 token-union matches after excluding this commission. As the plan now says, that mutable count is session-local and not acceptance evidence.
- The §3 edits do not exist yet, so AC-1, final AC-2, post-edit AC-3, post-edit ledger regeneration and ratification review remain **UNVERIFIED future acceptance work**. AC-4 was checked against the current unedited OA as a control.

## Claim ledger

| #   | Claim                                                                                                     | Tag      | Evidence                                                                     |
| --- | --------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| L1  | The starting-state gate and three-file repair scope matched the commission.                               | MEASURED | Branch/commit/status/diff commands above.                                    |
| L2  | P2's exception permits a chosen broad SEV 1 repair to close separable unruled work.                       | INFERRED | Plan `:330-339`; necessary-vs-chosen-superset construction.                  |
| L3  | P3's universal includes the committed follow-up review and becomes recursive.                             | INFERRED | Plan `:340-347`; OA `:143-156`; this required deliverable.                   |
| L4  | P6's technical wording is sound but its §1.3 and §8 restatements still use input-only wording.            | MEASURED | Plan `:41`, `:217-240`, `:540`, `:544`; reachability restatement sweep.      |
| L5  | P7's two 21 counts do not decide one-to-one Ref equality.                                                 | MEASURED | Known-bad in-memory control returned 21/21 with a missing and duplicate Ref. |
| L6  | P8's AC-2 criterion is broader than its check.                                                            | MEASURED | Plan `:404`, `:424`, `:500`; synonym construction.                           |
| L7  | PR #154's corrected figures are 21 / 7 / 14 / 18 / 3 / eight repair rounds / seven follow-ups.            | MEASURED | Heading, row and ordered-commit enumerations.                                |
| L8  | The repository repair blast radius is exactly three files and the governed fingerprint moved as declared. | MEASURED | Name-status diff, ledger hashes and focused 9/9 pass.                        |
| L9  | Issue #156's narrative is corrected but its replay acceptance item remains at twenty.                     | MEASURED | Direct `gh issue view` body read.                                            |
| L10 | §1.2's “Every row is MEASURED” label conflicts with its hand-traced seam row.                             | MEASURED | Plan `:31-34`; row-by-row classification.                                    |
| L11 | The required final gates pass with only the committed review added.                                       | MEASURED | Focused Vitest, `./tools/checks`, diff/status and commit checks above.       |

**Weakest claims.** L2 depends on whether “a repair required for a SEV 1” is read as “this exact scope is necessary” or merely “a repair selected to answer the SEV 1”; the absence of a constraint on the overlapping portion is why I do not treat the stronger reading as binding. L3 depends on applying the unqualified word “artifact” to the review artifacts OA expressly names; context may have intended only the author's target diff, but the proposed sentence does not say that. P6's SEV 1 grade treats the owner summary and commissioned reviewer question as operative decision surfaces, not harmless shorthand; both are used in this approval path.

## New findings — P13 onward

### P13 — SEV 3 — Issue #156's replay acceptance item still says twenty

**Evidence.** A direct Issue #156 body read shows the corrected narrative at its “What the 2026-09-06 measurement added” paragraph: 14 SEV 3, 21 findings, 18 fixed, eight repair rounds and the eighth without follow-up. Its fifth acceptance item still requires “a replay of PR #154's twenty implementation findings.” The repair ledger says the story is corrected at `docs/reviews/b14-severity-rulings-repair-dispositions.md:19-21`.

**Problem.** The external story has two current totals and the ledger overstates the completeness of its correction. The plan itself uses 21, so this is record accuracy rather than a remaining arithmetic blocker.

**Correction.** Change only the Issue acceptance item from “twenty” to “twenty-one.” This review is prohibited from editing the Issue or PR body.

**What must not change.** Preserve the corrected 7/14/21, 18/3, eight-repair/seven-follow-up record and the owner's record-only ruling on the missed follow-up.

**Class swept.** Issue rationale, Issue acceptance list, plan §1.2, plan §5, plan AC-5, repair-disposition P4 and the corrected investigation successor were checked. Only the Issue acceptance item remains stale.

### P14 — SEV 3 — the seam hand trace is labelled MEASURED

**Evidence.** `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:31` combines a hand classification (“all seven SEV-2s sit in one seam”) with a measured text fact (“every round wrote Class swept”). Line `:34` then says “Every row is MEASURED” and immediately says the seam classification is a hand trace.

**Problem.** The evidence label contradicts the method. The seam conclusion may be well supported, but it is a behavioural judgement from reading, not the output of the adjacent grep.

**Correction.** Label the seam-membership half JUDGEMENT/hand trace and the “Class swept” occurrence half MEASURED, or exclude that hybrid row from “Every row is MEASURED.”

**What must not change.** Keep the seven-finding seam conclusion as the plan's labelled hand trace and retain the command that proves each round used “Class swept.”

**Class swept.** All eight §1.2 evidence rows were classified against their stated instruments. Rows 1–6 and 8 are measured; row 7 alone mixes judgement and measurement.

## Disagreements with this commission

1. I disagree with the commission's complete-sounding statement that Issue #156 was corrected. Its main historical sentence is corrected, but the replay acceptance item still says twenty; P13 records the remaining line.
2. I do not treat adding “necessarily” anywhere in P2 as sufficient by itself. The rule must constrain the **overlapping portion** to what is inseparable from the SEV 1 repair; otherwise a broad chosen repair can still carry optional work.
3. I find no P6 loophole by which the phrase “property of the artifact itself” defeats the explicit synthetic-condition cap. The technical wording closes the original class; P6 remains partial only because §1.3 and §8 still restate the old wording.

## MemPalace drawer candidates

None. P2/P3 are project-specific instances of the existing fix-round over-reach rule, P7/P8 are instances of the existing check-to-claim and unverified-universal rules, and P13/P14 are project record corrections. Filing a new practice rule would duplicate the loaded authorities.
