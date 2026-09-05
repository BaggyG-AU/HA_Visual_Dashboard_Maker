# B14 Severity Rulings Codification — Plan Review

Author: Claude Fable 5.1
Reviewer: OpenAI Codex (GPT-5.6 Sol)
Owner gate: micah / BaggyG-AU

BLOCKED-ON: §3.1 derived verdict, §3.3 OPEN/repair rule, §3.3 non-repair boundary, §1.2/§5 PR #154 replay, §3.3 owner-decision scope, §3.2 implementation reading

Six component-scoped SEV 1 findings prevent those parts from being authorised as written; the remaining findings correct evidence, pointer discipline, and record accuracy without blocking the other proposed sections.

## Owner Summary Table

| Ref | What is wrong, in plain English                                                                                                               | Severity | Blocks                             | Fix complexity (1–5) | Recommendation         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------- | -------------------: | ---------------------- |
| P1  | A partly fixed problem has no rule saying how it affects the overall result, so a valid follow-up can produce no permitted outcome.           | SEV 1    | §3.1 derived verdict               |                    1 | Fix now                |
| P2  | Fixing an urgent problem can be forbidden when the same edit also fixes a lower-priority problem that the owner has not yet ruled on.         | SEV 1    | §3.3 owner-decision rule           |                    1 | Fix now                |
| P3  | Calling a problem deferred or accepted can be read as exempting related changes from the promised independent follow-up.                      | SEV 1    | §3.3 non-repair boundary           |                    1 | Fix now                |
| P4  | The evidence leaves out the final finding and the repairs made after the last review, so its totals and projected savings are wrong.          | SEV 1    | §1.2 and §5 replay/accounting      |                    2 | Fix now                |
| P5  | The plan makes the owner rule on style-only comments even though the recorded owner decision covered only the two higher non-blocking levels. | SEV 1    | §3.3 owner-decision severity scope |                    1 | Fix now                |
| P6  | Some real faults concern the shipped artifact itself rather than an input; the proposed grades give those faults no level.                    | SEV 1    | §3.2 implementation reading        |                    2 | Owner judgement needed |
| P7  | The command said to rebuild the replay returns extra rows and cannot recreate the table it is meant to prove.                                 | SEV 2    | None                               |                    1 | Fix now                |
| P8  | The search proves only six phrases, not every equivalent rule, and one local file count cannot be reproduced.                                 | SEV 2    | None                               |                    2 | Fix now                |
| P9  | The new index entries copy the full rules into a section required to remain a short pointer.                                                  | SEV 2    | None                               |                    1 | Fix now                |
| P10 | One wording problem is grouped with behavioural faults instead of with the other record-accuracy problems.                                    | SEV 3    | None                               |                    1 | Fix later              |
| P11 | The plan says its counts appear once, but the same totals are repeated in several sections.                                                   | SEV 3    | None                               |                    1 | Fix later              |
| P12 | The plan says no code reads these documents, but the fingerprinting check reads their bytes.                                                  | SEV 3    | None                               |                    1 | Fix later              |

## Owner Decision Brief

**What this protects in product terms.** The new rules are meant to reduce review churn without weakening independent review. P1–P6 protect that exact bargain: every review must still produce a determinate result, urgent repairs must remain possible, actual repairs must still be reviewed, the owner must receive the workload they actually authorised, and real implementation defects must remain gradeable.

**What is going wrong plainly.** The draft has six reachable rule gaps and contradictions. It also understates the PR #154 population by one finding and stops its repair trace before the final, unreviewed repair round. P7–P12 are narrower evidence and record defects.

**Is the product affected?** No current product behaviour is changed; no governance edit has yet been made. The process is affected if the proposed text lands unchanged. P4 is already reachable in the historical evidence: the omitted final finding and repair commits exist on `main`.

**Options with costs.** For P1–P5, correct the wording and replay now (complexity 1–2) or knowingly land rules with an immediate ambiguity/authority conflict. For P6, choose between preserving the owner's literal input-only wording or broadening reachability to an execution, state, output, or artifact condition; the latter needs an explicit owner ruling because it expands ruling 8. P7–P9 are small evidence/pointer repairs. P10–P12 can be corrected opportunistically because they do not change the mechanism.

**Recommendation and why.** Fix P1–P5 and P7–P9 now. For P6, I recommend the owner broaden “input” to “reachable execution, state, output, or artifact condition,” because a severity system that promises a grade for every finding should not omit static packaging and artifact-integrity defects.

**If nothing is done.** A follow-up can have no legal verdict, an urgent repair can deadlock behind an unrelated owner decision, a post-review change can escape review by being labelled a disposition, and the owner will approve the mechanism on a replay that understates both its finding population and its required round count.

## Confidence and method

**Confidence: high** on P1–P5 and P7–P12 because each is directly located in the plan, governing text, source review, command output, or owner ruling. **Confidence: medium-high** on P6 because the gap is textual and the construction is plausible, but the owner may intend “input” to be read broadly enough to include artifact state; the present wording does not say that.

### Files and records read

- `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md`, in full, at `89ff9d7`.
- `docs/governance/OPERATING_AGREEMENT.md` §§1–4, end to end.
- `docs/templates/ADVERSARIAL_REVIEW.md`, end to end.
- `docs/strategy/2026-08-18-model-roles-and-workflow-adoption.md`, including corrections C1–C7 and its final verdict.
- `CLAUDE.md` and `ai_rules.md`, in full.
- GitHub Issue #156, fetched directly with `gh issue view`.
- All eight `docs/reviews/plan-consistency-c3-parser-implementation-review*.md` files; their seven local commissions; the P12–P32 disposition rows in `docs/testing/PLAN_CONSISTENCY_C3_PARSER_PLAN.md`; and the relevant PR #154 commit range through merged branch head `0cd2a05`.
- `tests/support/authorLedger.ts`, including the governed set and fingerprint implementation.
- The cited MemPalace decisions for SEV-CAL-1, SEV-CAL-2, STRAT-D7, STRAT-D3/D4/D5, and the PR #154 round-count/full-record investigations.
- The three applicable `practice` drawers: finding verification, check-to-claim fit, and explicit evidence boundaries.

### Commands run and real results

| Purpose                      | Command or command family                                                                                                                          | Real result                                                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Starting-state stop gate     | `git branch --show-current`; `git rev-parse`; `git rev-list --count main..HEAD`; `git diff --name-status main...HEAD`; `git status --porcelain=v1` | exit 0; correct branch; HEAD `89ff9d7`; `main` `fa685ef`; one commit; exactly the plan plus ledger; clean tree                       |
| Issue authority              | `gh issue view 156 --repo BaggyG-AU/HA_Visual_Dashboard_Maker --json ...`                                                                          | exit 0; current body read                                                                                                            |
| Finding population           | heading enumeration over all eight implementation-review files, grouped by severity                                                                | exit 0; SEV 2 = 7, SEV 3 = 14, total = 21                                                                                            |
| Review cadence               | line-5 verdicts, commission inheritance checks, Owner Summary Table count                                                                          | exit 0; eight reviews, eight tables, seven `CHANGES-REQUIRED`, final `PARTIALLY-CONFIRMS`                                            |
| Dispositions                 | P12–P32 plan rows plus `git log 016cd03..0cd2a05`                                                                                                  | exit 0; 18 fixed, 3 owner residuals; final repair round follows `2e95904` with no review                                             |
| Template/OA vocabulary       | reads at template `:101-103` and OA `:267-275`                                                                                                     | exit 0; no review-verdict vocabulary; RESOLVED/REGRESSED only                                                                        |
| Class-sweep claim            | `grep -Hn 'Class swept' ...implementation-review*.md` plus behavioural read of the findings                                                        | exit 0; the seven SEV 2 findings are one directive-legality seam; each round has a class-sweep statement                             |
| Live-plan directive history  | `git log --all -S'%YAML' --` and current-tree search on the two governed plan files                                                                | log exit 0 with no output; current search exit 1 with no matches, the expected no-match result                                       |
| Tracked token union          | plan §3.6 `git grep -l -F ...` on HEAD and `main`, followed by an independent category partition                                                   | exit 0; HEAD 101, `main` 100; partition 87 / 3 / 6 / 1 / 3 / 0 / 1                                                                   |
| Replay commands              | the two commands at plan `:435-436`                                                                                                                | exit 0; first command emits 34 rows, second emits 21                                                                                 |
| Gitignored prompt population | `find prompts -type f`; token-union search under `prompts/`                                                                                        | exit 0; 140 files and 93 matches now; excluding this commission gives 139 and 92                                                     |
| Role eligibility             | source reads and targeted role/seat search                                                                                                         | exit 0; Fable is the default governance-authoring seat and was explicitly selected by the owner; Codex is the governance-review seat |
| Required focused gate        | `npx vitest run tests/unit/author-ledger.spec.ts`                                                                                                  | recorded after the review file was written: 9 passed, exit 0                                                                         |
| Required repository gate     | `./tools/checks`                                                                                                                                   | recorded after the review file was written: REAL_EXIT=0, 4/4 steps, 1559 tests passed in 105 files                                   |

### Evidence boundary

- No e2e, integration, Electron, packaged-app, or live-HA process was run, as the commission expressly excludes them for this Markdown-only branch.
- I did not edit any governance document, board item, PR body, source file, test, snapshot, or baseline.
- I did not rerun PR #154's parser probes; this review checks the plan and its source record, not the merged implementation. The recorded finding population and lifecycle were independently reconstructed from committed headings, rows, and commits.
- The `prompts/` tree is gitignored and mutable. Its present 140/93 population is measured, but the plan author's historical 148-file population is **UNVERIFIABLE** because no immutable manifest or regenerating snapshot was attached.
- I did not test the future AC-4 byte-identity command against an edits commit because no edits commit exists. I checked that it is non-vacuous against the present `main` spans and reviewed the command construction.

## Claim ledger

| #   | Claim                                                                                              | Tag      | Evidence                                                                                                             |
| --- | -------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| L1  | The starting-state gate passed exactly.                                                            | MEASURED | Branch/commit/diff/status commands above.                                                                            |
| L2  | The proposed verdict is not total over its own allowed follow-up outcomes.                         | MEASURED | Plan `:120-135`; construction P1.                                                                                    |
| L3  | The OPEN rule can prevent a required SEV 1 repair that overlaps an unruled lower-severity finding. | INFERRED | Plan `:323-334`; construction P2.                                                                                    |
| L4  | The non-repair sentence can be read to exempt artifact changes made to establish a disposition.    | INFERRED | Plan `:313-331`; OA `:251-256`, `:276-292`; construction P3.                                                         |
| L5  | PR #154 has 21 implementation findings: 7 SEV 2 and 14 SEV 3.                                      | MEASURED | Unique review headings P12–P32; plan's own replay has 21 rows.                                                       |
| L6  | The final P32 repair round received no follow-up review.                                           | MEASURED | `2e95904` review followed by repair commits `141fe0d` and `0cd2a05`; no later review before merged head.             |
| L7  | The owner mandated per-finding fix/defer/accept briefs for SEV 2 and SEV 3, not SEV 4.             | MEASURED | Issue #156 ruling 6 and `drawer_havdm_decisions_38993740c044247b0cf10527` R-E.                                       |
| L8  | A static artifact-integrity defect is not expressly classified by the implementation reading.      | INFERRED | Plan `:210-244`; P6 construction.                                                                                    |
| L9  | The tracked six-token union counts and category partition reproduce.                               | MEASURED | HEAD/main token-union commands and independent partition.                                                            |
| L10 | The six-token union cannot decide the behavioural class it claims to enumerate.                    | MEASURED | Counterexample sentence in P8 contains none of the six keys; plan's second pass reads only two preselected surfaces. |
| L11 | Fable was the correct authoring seat for this work.                                                | MEASURED | OA `:388-399`; strategy `:190-203`; explicit owner selection in SEV-CAL-2 R-F.                                       |
| L12 | The two required gates pass on the final review-file tree.                                         | MEASURED | Focused Vitest exit 0, 9 passed; `./tools/checks` REAL_EXIT=0, 4/4, 1559/105.                                        |

**Weakest claims.** L3 depends on an unavoidable-overlap construction rather than an observed B14 edit. L4 depends on how a later author reads “they create no follow-up”; the proposed correction removes that discretion cheaply. L8 depends on “input” retaining its ordinary narrow meaning rather than silently including any state of an artifact. The eight-repair-round grouping in L6 treats consecutive post-review commits `141fe0d` and `0cd2a05` as one author repair round; the absence of any follow-up is independent of that grouping.

## Findings

### P1 — SEV 1 — `PARTIALLY RESOLVED` has no verdict accounting rule

**Blocks: §3.1 derived verdict**

**Four-part proof.** (1) The broken contract is “Exactly one” derived verdict for every review. (2) The plan permits `PARTIALLY RESOLVED` as a follow-up disposition at `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:127-133`, but says only REGRESSED or OPEN prior findings are re-graded and count. The proposed disposition table at `:308-322` also defines exactly five states and omits `PARTIALLY RESOLVED`. (3) No mitigation tells the reviewer whether the unresolved remainder retains its old grade, receives a new grade, or counts as a finding. (4) Reachability is plausible and expressly anticipated: a follow-up partially fixes its sole prior finding. If that finding was formerly SEV 1, the remaining behaviour may now be SEV 1 or SEV 2; without re-grading, it satisfies neither the explicit `BLOCKED-ON` proof rule nor the SEV 2–4 precondition for `CLEAR-WITH-FINDINGS`, while `CLEAR` is false because a problem remains.

**Required correction.** Add `PARTIALLY RESOLVED` to the disposition vocabulary and say that its unresolved remainder is re-graded and counts toward the derived verdict. The more general and safer sentence is: every prior finding not in a terminal state (`RESOLVED`, `DEFERRED`, or `ACCEPTED-RESIDUAL`) is re-graded and counts.

**What must NOT change.** Keep the three verdict tokens, component-scoped blocking, full-signal reporting, stable references, and the owner's merge authority.

**Class swept.** I constructed outcomes for no findings, SEV 2–4 only, fully proved SEV 1, RESOLVED, REGRESSED, OPEN, DEFERRED, ACCEPTED-RESIDUAL, and PARTIALLY RESOLVED. Only the last lacks total accounting.

### P2 — SEV 1 — OPEN lower-severity work can deadlock a required SEV 1 repair

**Blocks: §3.3 owner-decision rule**

**Four-part proof.** (1) The broken contract is that a proved SEV 1 may be repaired so its named component can ship, while the owner personally decides whether separate SEV 2/3 work is fixed, deferred, or accepted. (2) The plan says no repair for an unruled finding is committed at `:323-329`; OA's protected rule requires every actual repair to receive follow-up at `docs/governance/OPERATING_AGREEMENT.md:251-256`. (3) There is no overlap rule. Splitting commits does not help when the two findings concern the same lines or one correction necessarily closes both behaviours. (4) Reachability is plausible: the owner is unavailable; a proved SEV 1 requires a wording repair; an unruled SEV 2 concerns the same sentence. Repairing the blocker necessarily repairs the lower-severity problem, but the new rule prohibits committing that repair.

**Required correction.** Replace the absolute with: “No repair undertaken solely for an OPEN SEV 2 or SEV 3 is committed before the owner rules. A repair required for a SEV 1 may overlap it; leave the lower-severity Ref OPEN until the owner records how the incidental closure is dispositioned.” This creates no default for discretionary work.

**What must NOT change.** Do not create a SEV 3 default, let the reviewer decide fix/defer, or let an author perform discretionary lower-severity work without the owner's ruling.

**Class swept.** Separate files, separable same-file lines, inseparable same-line wording, and one repair that necessarily closes two findings were considered. Only inseparable overlap deadlocks.

### P3 — SEV 1 — disposition labels can become a follow-up escape hatch

**Blocks: §3.3 non-repair boundary**

**Four-part proof.** (1) The broken contract is STRAT-D7's universal rule that every post-review repair receives the same-reviewer scoped follow-up. (2) OA states “EVERY post-review repair” and “the only mechanical fact ... is that a repair exists” at `docs/governance/OPERATING_AGREEMENT.md:251-256`; the plan says DEFERRED and ACCEPTED-RESIDUAL “create no follow-up” at `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:323-334`, while ACCEPTED-RESIDUAL may require a new or changed KNOWN-OPEN test at `:313-317`. (3) The plan does not distinguish the owner's state transition from artifact changes made to qualify for or record that state. (4) Reachability is plausible: after a review, the owner accepts a residual and the author adds a KNOWN-OPEN test or rewrites the governed residual. Calling the package “ACCEPTED-RESIDUAL” can then be cited to skip follow-up even though new test/governance work exists and can itself be defective.

**Required correction.** Say: “The owner decision and disposition-row/board-pointer update alone are not repairs. A label never changes the substance of a diff: any artifact or safeguard change made in response to the finding, including creating or changing a KNOWN-OPEN pin, is assessed under STRAT-D7, and an actual repair receives follow-up.”

**What must NOT change.** A pure deferral or acceptance decision must not trigger a follow-up, and the protected STRAT-D7 text must remain byte-identical.

**Class swept.** Pure table-state update, board-only deferral, pointer to an existing pin, creation of a new pin, modification of a pin, and governed-text changes were traced. The first three need no repair review; the latter three can contain unreviewed new work.

### P4 — SEV 1 — P32 is in the replay but omitted from the measured population and lifecycle

**Blocks: §1.2 and §5 replay/accounting**

**Four-part proof.** (1) The broken claims are the plan's measured PR #154 totals, dispositions, repair cadence, and scenario-A projection. (2) The plan says 7 SEV 2 + 13 SEV 3 and 20 total at `:25-28`, calls the replay “twenty” at `:430`, and projects 20 owner rulings/eight rounds at `:471`; its own table contains P12–P32, 21 rows, at `:443-463`, and AC-5 says 21 at `:485`. The source headings measure 7 SEV 2 + 14 SEV 3. The final review records P32 at `docs/reviews/plan-consistency-c3-parser-implementation-review-followup7.md:5-6,20-23,279-310`; commits `141fe0d` and `0cd2a05` then repair it and related records after review commit `2e95904`, with no later review. (3) The stated range `016cd03..2e95904` and the `fix(governance)` subject token stop before two behaviourally named repair commits whose subjects begin `docs(governance)`; no mitigation covers the omitted population. (4) Reachability exists today on merged `main`: 21 findings means 18 fixed + 3 residuals, and “Fix now on every finding” would require a ninth review after the eighth review's P32 repair under unchanged STRAT-D7.

**Required correction.** Recompute from P12–P32 and the full branch range through `0cd2a05`: 21 findings (7 SEV 2, 14 SEV 3), 18 fixed, 3 residual; eight author repair rounds, with the final P32/record repair round not followed by review. Correct scenario A to 21 owner rulings and nine review rounds if every finding is fixed. State the historical STRAT-D7 miss rather than silently normalising it.

**What must NOT change.** Do not re-grade or reopen PR #154, change P32's substance, or use the accounting correction to weaken STRAT-D7.

**Class swept.** Every unique P12–P32 heading, every corresponding plan disposition, every commit from the first implementation review through merged branch head, and every review after a repair was enumerated. The omission is confined to the final P32 population/repair round and the totals derived from it.

### P5 — SEV 1 — mandatory owner rulings are expanded from SEV 2/3 to SEV 4 without authority

**Blocks: §3.3 owner-decision severity scope**

**Four-part proof.** (1) The broken authority is owner ruling 6: per-finding pros/cons and owner decisions apply to SEV 2 and SEV 3. (2) Issue #156 ruling 6 and `drawer_havdm_decisions_38993740c044247b0cf10527` R-E name exactly SEV 2 and SEV 3, while the plan requires the step for SEV 2, 3, **or 4** at `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:323-329`, repeats the expanded burden at `:52` and `:513`, and blocks any SEV 4 repair before that ruling. (3) The template's statement that the owner “may still elect” a fix is permissive, not authority for a mandatory brief and OPEN gate. No recorded amendment adds SEV 4. (4) Reachability is certain in ordinary future review: a style-only SEV 4 will force owner arbitration and bar even an optional wording cleanup, increasing the precise workload B14 is meant to reduce.

**Required correction.** Remove SEV 4 from the mandatory §3.3 brief/OPEN gate and from the two cost claims. Preserve the Owner Summary row for full signal; the owner may still voluntarily elect a SEV 4 fix.

**What must NOT change.** Keep mandatory owner decisions for SEV 2 and SEV 3, no author-selected default, and full reporting of SEV 4.

**Class swept.** Ruling 6's scope was checked in Issue #156, the cited decision drawer, the proposed OA bullet, the template SEV 2/3/4 clauses, the owner-facing cost section, and blast-radius cost statement. Only the plan expands the mandatory set.

### P6 — SEV 1 — the implementation reading leaves non-input artifact defects ungradeable

**Blocks: §3.2 implementation reading**

**Four-part proof.** (1) The broken contract is that every finding is tagged SEV 1–4 with document and implementation readings having identical blocking semantics. (2) The implementation SEV 1 and SEV 2 definitions at `:210-239` both turn on an “input”; SEV 3 and SEV 4 at `:240-244` are documentation/style only. (3) No clause covers a verified behavioural or delivery contract violated by the artifact's current state rather than by an input. (4) Reachability is plausible in this repository's release work: a packaged application is missing a required signed manifest or required bundled resource. The distributable violates its contract today, but there is no synthetic or current input to classify; the same false claim in a release plan fits the document SEV 1 reading, while the implementation reading fits neither SEV 1 nor SEV 2.

**Required correction.** Owner ruling required: broaden the reachability object to “an existing reachable execution, state, output, or artifact condition, or a future one argued plausible,” and make the fourth proof identify whichever trigger/condition applies. Apply the same vocabulary to the SEV 2 constructible-only cap.

**What must NOT change.** Do not weaken reachability, permit a merely constructible case to block, or change the owner's authority over merge. This correction must be owner-ratified because it broadens ruling 8's literal wording.

**Class swept.** User input, repository text, environment, time/event, persisted state, output/postcondition, and static packaged-artifact conditions were considered. The first six can reasonably be described as inputs or triggers; the last cannot without an unstated expansion.

### P7 — SEV 2 — the replay's regenerating command emits 34 rows, not 21

**Evidence.** The first command at `:432-437` matches any table line beginning `| P<number> `, including claim-ledger prose such as “P12 is not closed” and repeat P29–P31 status rows. It emitted 34 rows. The second command emitted the 21 plan disposition rows.

**Problem.** AC-5 at `:485` calls these the replay's regenerating commands and says to check 21 rows. The first command cannot regenerate the source population or the replay table without undocumented filtering.

**Required correction.** Generate the unique population from finding headings, for example the exact `### P<number> — SEV-<n>` headings, and join those refs to the disposition table. Include a uniqueness/count assertion that fails on duplicates or omissions.

**What must NOT change.** Keep the replay sourced from committed reviews and dispositions, and keep its seam labels explicitly a hand trace.

**Class swept.** Owner-summary rows, claim-ledger rows, follow-up status rows, finding headings, and plan disposition rows were tested against the regex.

### P8 — SEV 2 — the sweep evidence is narrower than “every restatement”

**Evidence.** The six-token union at `:388-406` reproduces 100 files on `main` and 101 on the branch with the stated partition. But a semantically equivalent restatement—“A severity-two issue never prevents its component from shipping”—contains none of those six keys. The labelled behavioural read at `:408` covers only OA §§1–4 and the adversarial template, not every tracked document. AC-3's command at `:483` also omits `APPROVE`, which the proposed rule retires at `:127-129`, and does not search the gitignored scaffold population. The present ignored tree measures 140 files/93 matches; excluding this commission gives 139/92, so the stated 148-file denominator at `:410` does not reproduce and has no immutable manifest.

**Problem.** The token count is correct for its tokens, but it cannot prove the behavioural universal used by §3.6 and AC-2. The prompts result is especially non-repeatable because its population is untracked.

**Required correction.** Either narrow the claim to the named live surfaces actually read, or publish an independently keyed candidate inventory (semantic synonym search plus a hand trace of every live template/governance/scaffold surface). Add `APPROVE` to AC-3's known-token check. For ignored prompts, attach a dated path manifest or report the count as session-local and non-reproducible rather than acceptance evidence.

**What must NOT change.** Historical reviews remain untouched, claim-ledger/cross-check result tokens remain distinct from review verdicts, and the verified 100/101 six-token inventory need not be discarded—only labelled accurately.

**Class swept.** The six exact tokens, independently worded blocking/non-blocking/verdict/disposition searches, the full OA/template behavioural read, tracked category partition, ignored prompt population, and known retired tokens were checked.

### P9 — SEV 2 — the proposed rulings-index rows are content, not pointers

**Evidence.** The two proposed rows at `:364-369` reproduce the detailed proof elements, table columns, three verdict tokens, four retired tokens, two disposition schemas, owner decision, seam rule, both severity readings, bundling, and protected-trigger statement. OA's governing design says content moves to memory and the line shrinks back to a pointer at `docs/governance/OPERATING_AGREEMENT.md:15-22`; its rollback trigger requires an accumulating index to be cut back at `:234-238`; §4 says one sentence and that the authority is the record at `:434-440`.

**Problem.** Each row is technically one sentence, but it is the full rule compressed with semicolons, not a pointer. That creates another live copy that can drift from the template and §3.4 on the next amendment.

**Required correction.** Reduce each row to a short locator, for example: “Severity calibration amended STRAT-D18; binding text: template §1/§1a/§4 and OA §3.4; authority: ...”. Keep the detailed narrative in the cited drawers and binding sections.

**What must NOT change.** Preserve two dated IDs, standing status, authority citations, the original STRAT-D18 row's amendment pointer, and the strategy-document pointer.

**Class swept.** Both proposed rows, the existing STRAT-D18 row, OA's front-matter pointer rule, rollback trigger, and §4 convention were read together.

### P10 — SEV 3 — P30 belongs in seam C, not seam A

**Evidence.** The replay labels P30 “A (comment accuracy at the boundary)” at `docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:461`. The source finding states that runtime behaviour is unchanged and the defect is false code/test commentary at `docs/reviews/plan-consistency-c3-parser-implementation-review-followup6.md:289-318`. The replay's seam C is “record/wording accuracy” at `:445`.

**Problem.** Boundary subject matter does not turn a comment-accuracy finding into directive-legality behaviour. Moving P30 to C makes the hand trace internally consistent.

**Required correction.** Change P30's seam to C. Scenario C is unchanged because it stops at round 2.

**What must NOT change.** Keep P21/P24/P27 in A if the trace is keyed by the shared `%TAG` validation boundary; their residual scope, unlike P30's comment, is behavioural contract content.

**Class swept.** All 21 rows were compared with their source finding headline and problem statement. P30 is the only row moved. Scenario C's count remains exactly eight under its stated assumptions; “about eight” is conservative, not false.

### P11 — SEV 3 — “Counts appear once” is false in the plan itself

**Evidence.** The claim appears at `:56-61`. The sweep count 101 is repeated in AC-2 at `:482`; the PR #154 finding and round figures recur in §§1.1, 1.2, 2, 5, and AC-5; gate counts recur at `:11`, `:486`, and `:511`.

**Problem.** The sentence presents a claim-hygiene safeguard as already satisfied when the plan intentionally repeats counts for owner summary, evidence, replay, and acceptance.

**Required correction.** Delete the claim or narrow it to the actual policy: one canonical measured source per count, with clearly labelled restatements generated or cross-checked from it.

**What must NOT change.** Do not remove useful owner-facing summaries merely to satisfy a cosmetic one-location rule.

**Class swept.** Every numeric and written count in the plan was searched; only this meta-claim is at issue. P4 separately handles incorrect counts.

### P12 — SEV 3 — the fingerprint code does read governed document content

**Evidence.** The plan says the author-ledger code hashes the governed tree “without reading it” at `:505-507`. `tests/support/authorLedger.ts:308-325` calls `readFileSync(abs)` and hashes the bytes for each regular file.

**Problem.** The intended claim appears to be “no code interprets these documents semantically.” The written claim is literally false and obscures the already acknowledged fingerprint dependency.

**Required correction.** Replace it with: “No runtime/product code interprets these documents; the author-ledger reads their bytes only to compute the governed fingerprint.”

**What must NOT change.** Keep the fingerprint in the blast radius and keep its required regeneration.

**Class swept.** All repository references returned by the plan's named search were read; only the author-ledger reads governed content, and it does so as bytes rather than as governance semantics.

## Answers to §8 questions

1. **No.** A sole `PARTIALLY RESOLVED` prior finding fits no complete accounting rule; P1 gives the construction and correction. The no-findings, lower-severity-only, and fully proved SEV 1 cases are otherwise mutually exclusive and exhaustive.
2. **Yes.** An inseparable SEV 1/SEV 2 overlap deadlocks while the owner is unavailable. The narrow fix is to prohibit repairs undertaken solely for an OPEN SEV 2/3 while allowing a required SEV 1 repair to overlap, leaving the lower-severity Ref OPEN for later owner disposition. No default is introduced.
3. **No additional live sentence was found in OA §§1–4 or the adversarial template that independently defines review severity, review verdict, or finding disposition and is left unedited.** OA's historical `APPROVE` and the template's claim/direction verdicts are correctly excluded. The six-token union would miss a synonym-only restatement such as “A severity-two issue never prevents its component from shipping”; P8 explains why the broader repository-wide universal remains unsupported.
4. **Yes.** Byte identity does not preserve meaning if the inserted sentence says disposition labels “create no follow-up.” Without the substance-over-label clarification in P3, a new pin or governed-text edit can be packaged under ACCEPTED-RESIDUAL and escape the unchanged D7 trigger.
5. **Mostly defensible.** Move P30 from A to C because it is comment accuracy, not directive legality. That move does not affect scenario C, which ends at round 2. Scenario C is correctly labelled JUDGEMENT. Its arithmetic is exactly eight decisions under the stated assumptions: four round-1 findings + three round-2 findings + one same-seam choice.
6. **Yes.** A current packaged artifact missing a required signed manifest or bundled resource violates an implementation contract without an “input.” It is SEV 1 under the document reading if the release claim is demonstrably false, but fits neither implementation SEV 1 nor SEV 2 as written. P6 gives the owner-ratified broadening needed.

## Claims attacked by name

### Plan §1.2, every row

1. **“0 SEV-1, 7 SEV-2, 13 SEV-3; seven `CHANGES-REQUIRED`.” — REFUTED IN PART.** The verdict count and zero/7 figures hold; SEV 3 is 14, total 21 (P4).
2. **“Rulings 1–3 applied to all eight rounds.” — VERIFIED.** The first commission quotes them; six follow-ups inherit the prior form; the seventh restates the severity contract; all eight reviews have Owner Summary Tables.
3. **“17 of 20 fixed; 3 residual; no owner fix/defer ruling for a SEV-2.” — REFUTED IN PART.** It is 18 of 21 fixed plus 3 residual. The owner-decision claim for SEV 2 holds in the commit record.
4. **“Seven repair rounds (nine fix commits) produced seven follow-ups.” — VERIFIED ONLY FOR THE TRUNCATED RANGE/TOKEN; REFUTED AS THE PR POPULATION.** Nine `fix(governance)` subjects occur before `2e95904`, but P32 is repaired afterwards by two `docs(governance)` commits in an eighth author repair round with no follow-up (P4).
5. **“The review template defines no verdict vocabulary.” — VERIFIED.** Template `:101-103` gives only a heading instruction.
6. **“OA disposition allows RESOLVED/REGRESSED only.” — VERIFIED.** OA `:267-275`.
7. **“All seven SEV-2s sit in one seam and every round wrote Class swept.” — VERIFIED for the seven SEV 2 findings.** P30's separate seam-label correction is P10.
8. **“The live governed plan has never contained a YAML directive.” — VERIFIED for available Git history/current files.** History search returned no output; current search returned the expected no-match exit 1.

### Commission §3, every supplied claim

- **PR #154 eight-round severity/verdict totals:** refuted in the same part as §1.2 row 1; 14, not 13, SEV 3 findings.
- **Rulings 1–3 live in commissions:** verified.
- **Nine fix commits/seven repair rounds/one follow-up each:** token/range fact verified; complete-behaviour claim refuted by the P32 repair round.
- **Template has no verdict vocabulary; OA is RESOLVED/REGRESSED only:** verified.
- **Tracked sweep 100, 87 reviews, 13 other, plan = 101st:** verified exactly with an independent partition.

### Other load-bearing plan claims

- **§3.1 derived verdict:** refuted on `PARTIALLY RESOLVED` (P1); otherwise the three base cases are decidable.
- **§3.3 OPEN rule:** refuted on inseparable overlap (P2).
- **§3.3 protected-span meaning:** refuted without a substance-over-label guard (P3).
- **§3.2 implementation reading:** refuted for static artifact-integrity defects (P6).
- **§3.4 ruling rows follow pointer convention:** refuted (P9).
- **§3.6 token population:** exact count verified; behavioural completeness refuted (P8).
- **§3.7 author-ledger governed set:** verified at `tests/support/authorLedger.ts:68`.
- **§5 replay and scenarios:** P4 and P10; scenarios B/C arithmetic otherwise holds as judgement.
- **Issue #156 rulings/acceptance criteria:** all nine behaviours are represented, but ruling 6 is improperly expanded to SEV 4 (P5), replay accounting is wrong (P4/P7), and the sweep acceptance check is narrower than its claim (P8).
- **Fable seat:** verified as correct; see the role assessment below.

## Role-seat assessment — was Fable the right agent?

**Yes.** OA's binding default seat table assigns Fable “high-stakes upstream: strategy, briefs, governance authoring” at `docs/governance/OPERATING_AGREEMENT.md:388-396`. The independently reviewed strategy decision D4 says the same at `docs/strategy/2026-08-18-model-roles-and-workflow-adoption.md:190-203`. The 2026-09-06 owner ruling then explicitly selected Fable for this plan and the later governance edits, Codex for review, and disqualified Opus (`drawer_havdm_decisions_38993740c044247b0cf10527`, R-F; Issue #156 acceptance criteria).

Fable is an interested party as author, but that is expected and controlled: a different model conducts this committed review and the owner remains the gate. The Stage-8 “authored none of spec, prompt, implementation” restriction is an implementation-review rule, not a bar on Fable's governance-authoring seat. The current author/reviewer pairing therefore follows governance exactly.

## Disagreements with this commission

1. I disagree with commission §3's supplied “13 SEV-3 / 20 findings” fact. The committed population is 14/21; the plan's own table and AC-5 expose the contradiction.
2. I disagree with the complete-sounding “nine fix commits in seven repair rounds, each followed by exactly one review.” It is true only for the stated truncated range and subject prefix; the final P32 repair round exists after that range and has no review.
3. The commission says the standing rules are quoted because I cannot reach the project memory store. In this session MemPalace was reachable; I read the cited authority drawers directly. The quoted rules remain binding, but the access premise is false here.

## MemPalace drawer candidates

None. P4 is a project-specific instance of the already filed rule that a mechanical sweep must be keyed by behaviour rather than the first observed token (`drawer_practice_review_ba6eb45cbbd7c581a68b6df0`); filing it again would duplicate an existing rule.
