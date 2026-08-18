Author: Claude Fable 5 (governance-codification author; interested party)
Reviewer: OpenAI Codex / GPT-5.6 Sol (independent reviewer; interested where the codification assigns or governs Sol/Codex seats)
Owner gate: micah/BaggyG-AU arbitrates every finding; this review decides nothing on its own, and only the owner's merge ratifies the amended text

# Independent Review — D1–D18 Governance Codification

## 1. Verdict first

**Verdict: APPROVE — no SEV 1; one non-blocking SEV 2 evidence-label finding (F1).**

PR-3 faithfully codifies the corrected strategy decisions, preserves the two
protected §3.4 paragraphs byte-for-byte, and passes both required gates. F1 is
narrow: one current ledger addendum falsely says an old commission quotation is
internally labelled as historical; the current Operating Agreement and every
other live governing surface state the replacement rule correctly.

## 2. Confidence and method

Confidence is high for the in-repository codification. I read the required
sources in the commissioned order, read every amended governing surface in full,
compared each commissioned decision to its corrected strategy text, executed the
protected-span byte diff, enumerated the replaced-default token class, traced the
behaviour-bearing governing surfaces end to end, inspected all four branch
commits, and ran both required gates.

The starting-state stop gate matched exactly: branch
`feature/governance-codification-d1-d18`, `HEAD` `ffa7b00`, `main` `16cc592`,
four expected commits ahead in the stated order, clean worktree, and issue #145
open. Before substantive review I read the shared practice index and the exact
drawers for behaviour-defined class sweeps, quantified claims, and
check-to-claim scope.

**Constraints — what this review did not establish:**

- The branch changes only `docs/**` and `ai_rules.md`. I ran no e2e,
  integration, Electron, Chromium, UAT, packaging, or live-HA process; they are
  **UNRUN** and are not owed for this docs-only branch.
- I did not re-derive §3.7's 8.8-hour measurement. I checked that the amended
  text attributes it to the existing `CLAUDE.md` ruling and its decision drawer.
- I did not certify the external MemPalace standing-rules or `[STATE]` drawers
  as updated. The commission records both as intentionally pre-D7 until merge;
  their post-merge updates remain **UNVERIFIABLE** in this branch review.
- I did not apply branch protection, create board items, alter GitHub settings,
  amend the strategy, edit a UAT card, write MemPalace, or merge.

## 3. Claim ledger

| ID  | Claim                                                                                                                                                        | Tag      | Evidence                                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | The commissioned starting state matched.                                                                                                                     | MEASURED | `git branch --show-current`, `git rev-parse`, `git rev-list --count`, `git log main..HEAD --reverse`, `git status --short`, and `gh issue list`.                                                                                                                                |
| C2  | PR-3's content commit changes exactly the five commissioned governing surfaces, and the whole branch remains docs/`ai_rules.md` only.                        | MEASURED | `git show --name-status 21fcc41` returned the five named files; `git diff --name-only 16cc592...HEAD` enumerated only `docs/**` and `ai_rules.md`.                                                                                                                              |
| C3  | The codification is faithful to corrected D3-D15/D18 and to D8/D10/D11's commissioned template content.                                                      | INFERRED | Decision-by-decision hand trace in §5.1 against strategy `:190-294,312-325,526-631`; codification at `docs/governance/OPERATING_AGREEMENT.md:143-175,202-312,374-470`, `ai_rules.md:133-149`, and both amended templates.                                                       |
| C4  | The protected no-mechanical-decider and never-incidental span is byte-identical to `main`.                                                                   | MEASURED | `diff -u` between exact marker-bounded extracts from `git show 16cc592:docs/governance/OPERATING_AGREEMENT.md` and the branch file returned no delta; both extracts SHA-256 to `76f1d801310b8e2cbe876cd4f3950bcc5a1a0b456cf140e58f4ecdbbc3c140a9`.                              |
| C5  | The two author drafting settlements are executable and expressly await owner confirmation.                                                                   | INFERRED | Disposition artifact and lifecycle at `docs/governance/OPERATING_AGREEMENT.md:267-279`; thresholds, stop condition, decider, and proposal labels at `:216-226,401-410`.                                                                                                         |
| C6  | No live in-repository governing surface retains the old no-automatic-follow-up default as current law.                                                       | INFERRED | Exact commissioned grep returned 23 hits, classified in §5.4; end-to-end reads of Operating Agreement §3, §3.4, and §4 found the universal replacement at `:143-161,240-312,457,464`. One historical commission lacks the promised label (F1), but it is not current authority. |
| C7  | The owner's commissioned PR-3 content list is complete, with no unrelated rule added by `21fcc41`.                                                           | INFERRED | Five-file content diff read in full; the requirement-by-requirement trace is in §5.5. Mechanical structure checks found the exact eleven STRAT IDs, one §3.6, one §3.7, and the required template markers.                                                                      |
| C8  | The amended set is internally coherent on the commissioned cross-references, lifecycle descriptions, full-suite rule, immutability order, and severity text. | INFERRED | End-to-end surface reads plus the Q6 trace in §5.6; `git diff --check 16cc592...HEAD` returned clean.                                                                                                                                                                           |
| C9  | The artifact-routing and two ledger-regeneration commits match the actual changed populations and reasons.                                                   | MEASURED | `git show --name-status` for `d2b5c71`, `662a094`, `21fcc41`, and `ffa7b00`; ledger addenda at `docs/reviews/self-pass-gate-author-ledger.md:346-374`. The addenda's separate historical-label claim is refuted in F1.                                                          |
| C10 | The amended headless block preserves the standing rule's word sequence.                                                                                      | MEASURED | Exact-ID read of `drawer_havdm_governance_b282610792b253fee5c09b40`; after stripping Markdown quote prefixes, escape syntax, and wrapping whitespace, the standing and template strings were identical at 405 normalized characters.                                            |
| C11 | The required repository and ledger gates pass at the reviewed head.                                                                                          | MEASURED | `./tools/checks` returned `REAL_EXIT=0`, `STEP_COUNT=4/4`, 104/104 test files and 1,413/1,413 tests; `npx vitest run tests/unit/author-ledger.spec.ts` returned exit 0 and 9/9.                                                                                                 |

**Weakest claims:** C3, C6, C7, and C8 are labelled hand traces of semantic
properties; the mechanical searches and structure counts corroborate but cannot
decide them. “No unrelated rule” is bounded to the five-file content diff and
the commissioned content list, not a claim that no reader could prefer different
wording. The external MemPalace lifecycle remains outside the merge-time state
this branch can certify. The 8.8-hour figure and the historical label status were
the author's weakest claims; I did not re-measure the former, and F1 refutes the
latter.

## 4. Findings (ranked, most severe first)

### F1 — SEV 2 — one old-rule quotation lacks the historical label the ledger says it has

**Affected claim:** the second PR-3 ledger addendum says row C39 and the
self-pass-gate commission's class-(d) quotation are each labelled as the
PR-#139-era text, and therefore deliberately leaves both untouched
(`docs/reviews/self-pass-gate-author-ledger.md:361-370`).

**Evidence and problem:** C39 does carry that label: it says “as ratified by PR
#139” (`docs/reviews/self-pass-gate-author-ledger.md:93`). The other named member
does not. Its required-reading bullet points to the live Operating Agreement and
states the old “no automatic follow-up / OWNER decides” rule without a date,
supersession note, or PR-#139 label
(`docs/reviews/self-pass-gate-codex-commission.md:415-424`). A full-file search
finds no `PR #139` or `ratified` label associated with that quotation.

This is SEV 2, not SEV 1. The addendum rests on an overstated factual claim and
the unlabeled old text creates a real reader-safety risk, but the current D7
codification does not depend on it: the live Operating Agreement body and index
explicitly replace the default. No decision or codification artifact is blocked.
**INTEREST:** the quoted lifecycle governs independent implementation review.

**Class swept:** the class is every result of the commissioned old-default grep,
plus the two members the ledger specifically says are labelled. The exact grep
enumerated 23 hits: 14 immutable/historical `docs/reviews/` records, eight old
PR/round-specific prompt records, and the current commission's own quoted
command. I read every hit's role. No live governing surface retained the old
default. Of the two promised internally labelled records, one is correctly
labelled and one is affected.

**Concrete fix:** add a narrow supersession annotation beside the old quotation
in `docs/reviews/self-pass-gate-codex-commission.md:421-423`, naming it as the
PR-#139-era rule and pointing to current Operating Agreement §3.4; then make the
ledger addendum's label statement literally true. Re-run the exact Q4 grep and
the 9-test ledger check.

**What must not change:** do not rewrite the historical quoted rule, C39, the
byte-protected §3.4 paragraphs, D7's universal trigger, or any reviewer-authored
review. The repair is a present-day supersession annotation only.

**Owner Decision Brief**

- **What this protects:** keeping an old instruction from being mistaken for
  today's rule that every repair gets a follow-up review.
- **What is going wrong:** the new ledger says an old commission is clearly
  marked historical, but that mark is not present beside the old instruction.
- **Is the product affected:** **No.** The application and its tests are
  unchanged. The evidence is a direct read of the two documents; the risk is to
  future review instructions.
- **Options with costs:** add a short historical banner beside the old quotation
  and correct the ledger if needed (two small document edits plus the existing
  9-test ledger check); correct only the ledger and rely on the old filename for
  context (cheaper, but leaves the ambiguous instruction); or accept the risk and
  merge unchanged (no work, but the factual claim stays false).
- **Recommendation and why:** add the narrow banner. It makes the intended
  historical status obvious without changing the old record's substance.
- **If you do nothing:** a future reader can follow a link to the current
  Operating Agreement and still read the opposite old rule in the commission,
  while the new ledger incorrectly assures them that the conflict is labelled.

No SEV 1, SEV 3, or SEV 4 finding was found.

## 5. Commissioned questions

### 5.1 Q1 — transcription fidelity, decision by decision

| Decision / content        | Disposition             | Codified result                                                                                                                                                                                                                                                        |
| ------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D3                        | **FAITHFUL — INTEREST** | §3.6 preserves all three Stage-8 exclusions, header enforcement, and the base-invariant-plus-owner-waiver fallback (`docs/governance/OPERATING_AGREEMENT.md:381-386,460`).                                                                                             |
| D4                        | **FAITHFUL — INTEREST** | §3 mechanics and §3.6 reproduce the four-seat table, per-slice override, and Terra/Luna entry limit without changing a seat (`:155-161,388-399,461`).                                                                                                                  |
| D5                        | **FAITHFUL — INTEREST** | Exact-model headers, REV-RERUN, seat/model attribution, Sol cross-checks, all three rollback triggers, and the v1.0.0 review point survive; Q3 assesses the delegated thresholds (`:172-175,202-226,401-410,462`).                                                     |
| D6                        | **FAITHFUL — INTEREST** | §3.7 and the feature header preserve the fix/slice partition, capability/content depth dial, hybrid stop, v1.0.0 review, and three-part parent-objective header (`:412-432,463`; `docs/templates/FEATURE_SPEC.md:23-31`).                                              |
| D7 / C6                   | **FAITHFUL — INTEREST** | Class (d), §3.4, REV-IMPL, and STRAT-D7 all say universal same-reviewer follow-up, repair diff plus declared radius, and depth decided after the gate fires; no C2 classifier survives (`docs/governance/OPERATING_AGREEMENT.md:143-149,240-312,457,464`).             |
| D9 / C1                   | **FAITHFUL**            | STRAT-D9 records the board and `[STATE]` ledger roles, the historical kanban ruling, frozen seed lifecycle, and owner-gated Issue creation (`:465`).                                                                                                                   |
| D12                       | **FAITHFUL — INTEREST** | `ai_rules.md` §4a remains mandatory; the required remote full run satisfies only its >5-spec leg, consumes the verified radius inventory, and precedes owner merge (`ai_rules.md:133-149`; Operating Agreement `:466`).                                                |
| D13                       | **FAITHFUL**            | STRAT-D13 preserves owner-gated flaky-only quarantine, cap 5 and shrink rule, the separate consistent-failure lane, briefs, explicit supersession, and pending implementation (`docs/governance/OPERATING_AGREEMENT.md:467`).                                          |
| D14 / C3                  | **FAITHFUL**            | STRAT-D14 includes PRs for all `main` changes, `enforce_admins: true`, exact `ci`, zero approvals, assigned owner flip on the agent's three-green brief, board visibility, and not-yet-applied status (`:468`).                                                        |
| D15 / C6                  | **FAITHFUL**            | The six-field plain-language brief, non-developer profile, and no-owner-diff-classification rule appear in the review template and STRAT-D15 (`docs/templates/ADVERSARIAL_REVIEW.md:23-29`; Operating Agreement `:469`).                                               |
| D18                       | **FAITHFUL — INTEREST** | The amended review template and STRAT-D18 preserve all four severities, the SEV-1 proof burden, non-blocking SEV 2 briefs, authority boundary, full-signal rule, and D10 non-subtraction (`docs/templates/ADVERSARIAL_REVIEW.md:132-163`; Operating Agreement `:470`). |
| D8 / C4 template content  | **FAITHFUL — INTEREST** | Feature-spec identities are stable/non-recycled with deliberate gaps; Issue deletion/transfer is prohibited by project rule and missing/relocated identities become checker drops (`docs/templates/FEATURE_SPEC.md:51-59`).                                            |
| D10 template content      | **FAITHFUL — INTEREST** | The amended template retains headers, claim ledger, weakest claims, class sweeps, evidence boundary, and the commission-may-add/never-subtract rule (`docs/templates/ADVERSARIAL_REVIEW.md:15-21,62-175`).                                                             |
| D11 / F6 template content | **FAITHFUL**            | Owner approval locks deliverable IDs and authorises Issue creation; the ID→Issue mapping is appended under §11, leaving approved text immutable (`docs/templates/FEATURE_SPEC.md:61-72,119-127`).                                                                      |

No re-decision, silent narrowing, or silent widening was found in the codified
decision class.

### 5.2 Q2 — survival of binding clauses

**No issue found.** The exact span beginning “THERE IS NO MECHANICAL
EVIDENCE-ONLY TEST” and ending “rule text _is_ the product” is byte-identical to
`16cc592`; both extracts hash to
`76f1d801310b8e2cbe876cd4f3950bcc5a1a0b456cf140e58f4ecdbbc3c140a9`.

The new lifecycle explicitly says it complies with and does not supersede that
span (`docs/governance/OPERATING_AGREEMENT.md:294-312`). Follow-up starts for
every repair before any content judgement; “records-only” changes reviewer depth
inside the follow-up, never gate entry (`:251-296`). The governed surfaces remain
never-incidental. No new mechanical decider or normative command was found.

### 5.3 Q3 — the two author drafting settlements

**(a) Disposition-table home — executable; no issue found.** The artifact is
separate from the reviewer's file, committed on the same branch, named from the
existing branch-shortname convention, and append-only by dated round
(`docs/governance/OPERATING_AGREEMENT.md:267-275`). On this branch its concrete
name would be
`docs/reviews/governance-codification-d1-d18-repair-dispositions.md`. The
reviewer file remains authored only by the reviewer.

**(b) F5 thresholds — executable and visibly proposed; no issue found.** The
deferential trigger stops at three consecutive zero-actionable-finding reviews
from one seat (`:216-226`). The Sol cross-check defaults to two; it stops there
if neither refutes a load-bearing review claim and extends once, to a third, if
either does (`:401-410`). The owner rules at the second checkpoint from the
agent's plain-language brief; the owner is not asked to classify a diff. Both
body locations say these are PR-3 author proposals awaiting owner confirmation,
which the owner's merge supplies.

### 5.4 Q4 — consequence sweep of the replaced default

**Current law — no issue found. Historical-label evidence — F1.** The exact
commissioned command returned 23 hits, not the handoff's claimed all-review-file
population:

- 14 are immutable/historical records under `docs/reviews/`;
- eight are old PR- or round-specific records under `prompts/`; and
- one is this commission quoting its own population command.

The prompt titles identify every old prompt by PR/round; none is a live template
or governing authority. End-to-end reads of Operating Agreement §3, §3.4, and
§4 found only the universal follow-up as current law. C39 is internally labelled
as PR-#139-era; the singled-out self-pass commission quotation is not, producing
F1. The standing-rules and `[STATE]` MemPalace updates are merge-time external
work and remain **UNVERIFIABLE**, not clean.

### 5.5 Q5 — completeness against the commissioned contents

| Commissioned content                                                    | Result              | Branch surface                                                                |
| ----------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------- |
| Final D7 §3.4 replacement and preserved protected clauses               | **PRESENT**         | Operating Agreement `:240-312`                                                |
| Stage-8 rule, four-seat table, roster fallback, exact-model headers     | **PRESENT**         | Operating Agreement `:163-175,374-410`                                        |
| D5 rollback additions and delegated thresholds                          | **PRESENT**         | Operating Agreement `:202-238,401-410`                                        |
| D6 lane partition, classification, hybrid stop, parent-objective header | **PRESENT**         | Operating Agreement `:412-432`; Feature Spec `:23-31`                         |
| D13/D14 implementation-pending ruling rows                              | **PRESENT**         | Operating Agreement `:467-468`                                                |
| Rows D3-D7, D9, D12-D15, D18                                            | **PRESENT — 11/11** | Operating Agreement `:460-470`; mechanical ID sequence matched the commission |
| D12 remote full-suite satisfaction wording                              | **PRESENT**         | `ai_rules.md:143-149`                                                         |
| D8 identity rules and `Issue #` column                                  | **PRESENT**         | Feature Spec `:51-72`                                                         |
| F6 approve→create→append order against immutability                     | **PRESENT**         | Feature Spec `:61-68,119-127`                                                 |
| Review headless insert and owner-profile line                           | **PRESENT**         | Adversarial Review `:23-60`                                                   |
| D18 severity contract and D10 machinery                                 | **PRESENT**         | Adversarial Review `:62-175`                                                  |
| Two historical-banner notes                                             | **PRESENT**         | `docs/governance/PROMPTMI_GOVERNANCE_REVIEW_2026-08.md:184-191,258-264`       |

The content commit modifies exactly these five surfaces: the Operating
Agreement, `ai_rules.md`, both templates, and the historical governance-review
banner document. I found no missing commissioned content or unrelated added
rule.

### 5.6 Q6 — internal coherence of the amended set

**No issue found.** The sweep established:

- §3.6 and §3.7 each exist once; mechanics and template references point to the
  correct sections.
- The class-(d) scope line, mechanics line, §3.4 lifecycle, REV-IMPL row, and
  STRAT-D7 row all describe one mandatory full round followed by universal
  same-reviewer scoped follow-up.
- Each of the eleven STRAT rows is a pointer-summary consistent with its body or
  template text; no row reverses an operative condition.
- `ai_rules.md` §4a steps 1 and 2 still require the consumer inventory and all
  affected specs. The remote full run satisfies only step 3 when the population
  exceeds five; it does not cancel the first two steps.
- The feature mapping is appended under §11 only after approval, so it does not
  mutate approved text or the locked deliverable IDs.
- The severity contract reinforces §0's evidence/class-sweep rules. The
  cross-check section's per-claim verdicts and new findings remain subject to
  the same severity and evidence machinery.

### 5.7 Q7 — artifact routing and the gate

**Routing and gates pass; F1 qualifies one ledger sentence.** Commit `d2b5c71`
adds exactly these eight session artifacts:

1. `docs/governance/PROMPTMI_WORKFLOW_SPEC_ASSESSMENT_2026-08.md`;
2. `docs/reviews/pr144-independent-performance-governance-review-codex-crosscheck.md`;
3. `docs/reviews/pr144-independent-performance-governance-review.md`;
4. `docs/reviews/promptmi-workflow-spec-assessment-codex-review.md`;
5. `docs/reviews/strategy-model-roles-codex-recheck.md`;
6. `docs/reviews/strategy-model-roles-codex-recheck2.md`;
7. `docs/reviews/strategy-model-roles-codex-review.md`; and
8. `docs/strategy/2026-08-18-model-roles-and-workflow-adoption.md`.

Only the first enters the gate's governed set. Commit `662a094` changes only the
ledger and moves its fingerprint from `ef69d12ccd44` to `5b1cbdb72b86` for that
population. Content commit `21fcc41` changes the five commissioned governed
surfaces. Commit `ffa7b00` changes only the ledger, moves the fingerprint to
`8b4eb5d26986`, and records the second regeneration. Those commit populations
and reasons match the addenda; F1 is confined to their claim that the historical
commission already carries a label.

`npx vitest run tests/unit/author-ledger.spec.ts` returned exit 0, one file
passed, 9/9 tests. `./tools/checks` returned real exit 0; the required grep count
was 4/4 (`eslint`, `prettier --check`, `tsc --noEmit`, `vitest run`), with 104/104
test files and 1,413/1,413 tests passing. No e2e or integration run is owed or
claimed.

## 6. Directions

1. The owner should arbitrate F1 using its brief. My recommendation is the
   narrow historical banner plus a literally accurate ledger sentence.
2. No change is directed to the D1-D18 codification, protected §3.4 text,
   templates, `ai_rules.md`, STRAT rows, drafting settlements, or gate
   mechanism.
3. After any repair, preserve reviewer authorship by adding a new commit; never
   amend `21fcc41`, `ffa7b00`, or this review commit.

No pivot is needed.

## 7. Disagreements

I disagree with two parts of the author's Q4 handoff, without disagreeing with
its clean-current-law conclusion:

1. the exact grep did not return “all hits in `docs/reviews/` history”; it also
   returned eight old prompt records and the current commission's self-quote;
2. the self-pass commission quotation is not internally labelled PR-#139-era,
   despite the current ledger addendum saying it is.

I found no other disagreement with the 28-row reading-pass outcome, the
byte-identity result, the gate results, or the author's stated weakest claims.

## 8. MemPalace drawer candidates

MemPalace write tools were unavailable to this reviewer, so I wrote no drawer.
After owner arbitration, the write-enabled author may file these with
`added_by="codex"`:

1. **[havdm / governance] PR-3 codification review:** corrected strategy D1-D18
   was faithfully transcribed; the protected §3.4 span stayed byte-identical;
   required gates passed; verdict APPROVE with no SEV 1.
2. **[havdm / governance] Historical old-rule label gap:** the current ledger
   says the self-pass commission's PR-#139-era lifecycle quotation is labelled,
   but the quotation lacks that label; current live authority is nevertheless
   correctly universal-follow-up.

---

## Workflow State

| Field                | Value                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| **Task**             | Independent §3 review of PR-3's D1-D18 governance codification                                           |
| **Status**           | Complete                                                                                                 |
| **Just completed**   | Answered Q1-Q7, ran the required gates, and recorded one non-blocking SEV 2 evidence-label finding.      |
| **Next action**      | The owner arbitrates F1 and decides whether to request its narrow documentation repair before merging.   |
| **Performed by**     | User                                                                                                     |
| **Reference**        | `docs/reviews/governance-codification-d1-d18-codex-review.md`                                            |
| **Verification**     | Prettier and required-structure audits passed; reviewed-head gates passed with REAL_EXIT=0, 4/4 and 9/9. |
| **MemPalace drawer** | N/A — not a cadence checkpoint                                                                           |
