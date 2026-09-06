# B14 Severity Rulings — Ratification Review

Author: Claude Fable 5.1
Reviewer: GPT-5.6 Sol
Owner gate: micah / BaggyG-AU. This document decides nothing on its own; the
owner's merge ratifies the amended text.
Scope: `fa685ef..bf78585` over the three governed rule surfaces, Round 4 of the
B14 dispositions ledger, and the author ledger's sixth addendum.

CLEAR-WITH-FINDINGS

The B14 rule text is faithful to the approved plan, executable under its new
vocabulary, and carries no SEV 1. Six record or presentation findings remain:
four are the disclosed A4-A6 residues plus a related record error, and two are
in the live work item; none blocks a component or the owner's merge decision.

## Owner Summary Table

| Ref | What is wrong, in plain English                                                                            | Severity | Blocks | Fix complexity (1–5) | Recommendation |
| --- | ---------------------------------------------------------------------------------------------------------- | -------- | ------ | -------------------- | -------------- |
| P18 | The plan says its retirement check returns one sentence, but it also returns a second withdrawal sentence. | 3        | None   | 1                    | Accept as-is   |
| P19 | The plan still says its final plan review is pending even though that review finished.                     | 3        | None   | 1                    | Accept as-is   |
| P20 | One list continuation is visually misaligned, although readers and the formatter interpret it correctly.   | 4        | None   | 1                    | Accept as-is   |
| P21 | The edits record says all three edited documents affect its integrity check; only two do.                  | 3        | None   | 1                    | Accept as-is   |
| P22 | The live work item points readers to the wrong section for the owner-facing summary table.                 | 3        | None   | 1                    | Fix now        |
| P23 | The live work item's title says the change covers two rules although it now covers nine.                   | 3        | None   | 1                    | Fix now        |

## Owner Decision Brief

### P18 — acceptance-check output

- **What this protects:** a plan whose stated acceptance evidence matches the
  command a later reader runs.
- **What is wrong:** the criterion is true, but its Check cell omits the second
  retirement sentence that the command prints.
- **Is the product affected?** No. This is record accuracy; the governed rule
  and the check's pass/fail meaning are unchanged.
- **Options and costs:** Fix now is a one-line governed-plan edit and the
  follow-up/fingerprint work that such an edit entails. Defer preserves a stale
  check description for later cleanup. Accept-residual relies on Round 4 and
  this review as the correction of record.
- **Recommendation and why:** Accept as-is. The executable criterion passes,
  and the correction is already explicit in two committed review records.
- **If you do nothing:** a reader sees an incomplete output prediction, then
  sees the accurate four-line result in Round 4 and this review.

### P19 — stale plan status

- **What this protects:** an honest at-a-glance statement of the plan track's
  state.
- **What is wrong:** the plan still says the last scoped follow-up is awaited;
  that follow-up returned `CLEAR` at `b462579`.
- **Is the product affected?** No. The commit history, Round 4, and this
  commission all record the closed plan track.
- **Options and costs:** Fix now is a one-line governed-plan edit with its
  required fingerprint and follow-up consequences. Defer or accept-residual
  leaves the stale header but keeps the correction in the review chain.
- **Recommendation and why:** Accept as-is. The history is unambiguous and the
  extra governance round would cost more than this header correction protects.
- **If you do nothing:** only the plan's status line remains stale; execution
  authority remains clear from the subsequent commits and records.

### P21 — governed-set wording

- **What this protects:** an accurate account of which files move the author
  ledger's integrity fingerprint.
- **What is wrong:** Round 4 says three governed files were staged for the
  fingerprint, while the strategy file is outside that fingerprint's governed
  set.
- **Is the product affected?** No. The computed fingerprint is current and its
  focused test passes.
- **Options and costs:** Fix now adds a correction to the reviewed record and
  therefore creates another repair/follow-up. Defer leaves the isolated phrase.
  Accept-residual relies on the same record's later correct explanation and the
  sixth addendum.
- **Recommendation and why:** Accept as-is. Round 4 itself says the ledger
  hashes two of the three files and that the strategy document is outside the
  governed set; the false phrase cannot change the mechanism.
- **If you do nothing:** a reader may pause at the contradiction, but the source
  predicate and both later explanations give the right population.

### P22 — wrong landing section in the live work item

- **What this protects:** a live story that sends a non-developer to the actual
  owner-summary instructions.
- **What is wrong:** the story's landing-site bullet associates the Owner
  Summary Table with template §4; it landed in §1a.
- **Is the product affected?** No. The repository rule is correct; the hosted
  work-item record is not.
- **Options and costs:** Fix now changes one hosted sentence and requires no
  governed-file edit. Defer leaves a misleading locator on the open story.
  Accept-residual permanently relies on the plan/template to override it.
- **Recommendation and why:** Fix now. It is a small external-record correction
  with no code, fingerprint, or rule-text blast radius.
- **If you do nothing:** readers following the story will look in the wrong
  section, although the nearby plan and template references eventually correct
  them.

### P23 — stale live work-item title

- **What this protects:** a board title that communicates the actual scope
  without requiring the owner to open the body.
- **What is wrong:** the title still names only rulings 2 and 3 after the owner
  expanded B14 to rulings 1-9.
- **Is the product affected?** No. The body and repository plan carry the full
  scope.
- **Options and costs:** Fix now retitles one hosted item. Defer keeps the board
  summary stale until cleanup. Accept-residual treats the body as the only scope
  authority.
- **Recommendation and why:** Fix now. This is a low-cost correction on the
  surface the owner uses as the live plan ledger.
- **If you do nothing:** the board continues to understate B14's scope, while
  the opened story remains accurate.

P20 is SEV 4, so no Owner Decision Brief is owed. Its table recommendation is
input only; the owner may still elect the one-line formatting change.

## Findings

### P18 — SEV 3 — AC-3's Check cell under-describes its output

**Evidence.** The plan says the retired-token grep "returns only the §1
retirement sentence" at
`docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:511`.
Running that exact command returns four matching source lines: template
`:116`, `:117`, and `:119` from §1, plus `:221` from §4. Round 4 already records
the omitted withdrawal sentence at
`docs/reviews/b14-severity-rulings-repair-dispositions.md:265-272`.

**Problem.** This is a false description of evidence, not a failed criterion:
all four returned lines retire or withdraw old verdict vocabulary and none
offers it as a returnable verdict. Because the affected artifact is a plan, the
DOCUMENT reading applies; the author's SEV 3 grade is upheld as non-load-bearing
record accuracy, rather than by Round 4's stated implementation reading.

**Concrete fix.** If the owner elects a fix, replace “returns only the §1
retirement sentence” with “returns only the §1 retirement sentence and the §4
withdrawal sentence.” Complexity 1: one wording change.

**What must not change.** Do not remove either retirement sentence or weaken
the prohibition on returning the old tokens.

**Class swept.** The class is every claim in the edits record about AC-3's
returned population. The exact command, plan cell, Round 4 note, and content
commit message were read together; the command/result mismatch is confined to
the plan cell and is already corrected elsewhere.

### P19 — SEV 3 — the plan status still says the final follow-up is pending

**Evidence.** The plan says “awaiting the last scoped follow-up” at
`docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:3`.
That follow-up is committed at
`docs/reviews/b14-severity-rulings-codex-plan-review-followup3.md:7-10` with
verdict `CLEAR`, and Round 4 records that it closed the plan track at
`docs/reviews/b14-severity-rulings-repair-dispositions.md:224-231`.

**Problem.** The stale status can misstate whether the prerequisite review has
happened, but subsequent committed records resolve the question and no rule
depends on the status line. This is document-record accuracy, SEV 3.

**Concrete fix.** If elected, change the status to say revision 4 is approved
and executed. Complexity 1: one wording change.

**What must not change.** Preserve the revision history, terminal-cap record,
and the fact that owner merge—not this review—ratifies the amendments.

**Class swept.** The class is plan-track state statements in the plan, Round 4,
third follow-up, and the two execution commits. The plan header is the stale
member; the later records agree that the track closed.

### P20 — SEV 4 — one lazy-continuation line is visually unindented

**Evidence.** `docs/governance/OPERATING_AGREEMENT.md:276-278` has no two-space
list indent on the line beginning “documented residual”. The plan quotes that
layout exactly at
`docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:325-327`,
and Prettier leaves it unchanged.

**Problem.** CommonMark reads the line as a lazy continuation, so the rule's
meaning and rendering remain intact. This is formatting only, with no defect
behind it: SEV 4.

**Concrete fix.** If elected, add the two spaces. Complexity 1: one whitespace
edit.

**What must not change.** Do not change the six disposition states or the
accepted-residual fallback where no test can pin the gap.

**Class swept.** The class is continuation indentation in the inserted
disposition-state paragraph. The entire paragraph was compared byte-for-byte
to the plan and read after formatting; only this line is visually inconsistent,
and it remains valid Markdown.

### P21 — SEV 3 — Round 4 calls three edited files governed by the fingerprint

**Evidence.** Round 4 says the ledger was regenerated with “the three governed
files STAGED first” at
`docs/reviews/b14-severity-rulings-repair-dispositions.md:277-279`.
The canonical predicate includes `docs/governance/**`, `docs/templates/**`,
`ai_rules.md`, and `CLAUDE.md`, but not `docs/strategy/**`, at
`tests/support/authorLedger.ts:67-70`. Round 4 correctly says later that the
ledger hashes two of the three and that the strategy file is outside the set at
`:309-313`; the sixth addendum says the same at
`docs/reviews/self-pass-gate-author-ledger.md:469-475`.

**Problem.** The staging claim can be true for all three edited files, but the
adjective “governed” is false in the fingerprint context. The strategy pointer
does not move the certificate. This is record accuracy, SEV 3; the current
certificate is not defective.

**Concrete fix.** If elected, append a correction saying “the three edited
files were staged; two are in the ledger's governed set.” Complexity 1: one
record sentence.

**What must not change.** Do not add `docs/strategy/**` to the governed
predicate or regenerate the fingerprint merely to make the old wording true.

**Class swept.** The class is fingerprint-population descriptions in Round 4
and the sixth addendum. An `rg` inventory for governed-set, fingerprint,
strategy-document, and two-of-three language was read in context; this is the
incorrect member, while Round 4's blast-radius paragraph and the addendum state
the actual population.

### P22 — SEV 3 — the live Issue mislocates the Owner Summary Table

**Evidence.** The live Issue #156 “Where the edits land” bullet says template
§4 carries the Owner Summary Table. The table is actually §1a at
`docs/templates/ADVERSARIAL_REVIEW.md:129-159`, exactly as the plan specifies
at
`docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:143-173`.
Round 4 says the Issue's landing sites match what landed at
`docs/reviews/b14-severity-rulings-repair-dispositions.md:316-318`.

**Problem.** The governed template is correct, but the live external locator
and Round 4's clearance of it are not. A reader following the story is sent to
the severity contract rather than the owner-table section. Both constructions
are SEV 3 record accuracy; neither changes rule behaviour.

**Concrete fix.** Amend the hosted bullet to say “§1a — Owner Summary Table”
and retain §4 for the severity contract. Round 4 remains append-only and can be
corrected by this review. Complexity 1: one hosted wording edit.

**What must not change.** Do not move the table into §4 or rewrite the landed
template to agree with the stale external record.

**Class swept.** The class is every landing-site and acceptance statement in
the live Issue. The complete “Where the edits land” and “Acceptance criteria”
sections were fetched and hand-read against HEAD; no other landed section is
mislocated. The related Round 4 external-member paragraph was also checked.

### P23 — SEV 3 — the live Issue title retains the old two-ruling scope

**Evidence.** `gh issue view 156` returns the title “Codify severity rulings 2
& 3”. The same live body enumerates rulings 1-9, and the approved plan maps all
nine behaviours at
`docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:37-49`.
The owner decision expanding B14 to rulings 1-9 is
`drawer_havdm_decisions_38993740c044247b0cf10527`.

**Problem.** The title is the board's at-a-glance scope label, but it now
understates the ruled and landed work. The body prevents a substantive scope
error after opening the item, so this is SEV 3 record accuracy rather than a
rule defect.

**Concrete fix.** Retitle the Issue to describe codification of the severity
rulings generally, or rulings 1-9 specifically. Complexity 1: one hosted title
edit.

**What must not change.** Preserve Issue #156's identity, body history, and the
owner's expanded nine-ruling scope.

**Class swept.** The class is current live-story scope labels for B14. The
Issue title, body preamble, nine ruling headings, acceptance criteria, plan
story pointer, and board item were read together; the title is the stale label.

No finding is SEV 1, so no four-part SEV 1 proof or `Blocks:` detail line is
applicable.

## Commissioned attack results

### 1. Fidelity to the specification

**No issue found.** All eleven edit units compare equal to the plan's AFTER
text: template §1, §1a, §4 severity, and §4 same-seam text; OA §3.4 disposition,
owner-decision, and same-seam bullets; OA §4's amended STRAT-D18 cell and two
new rows; and the strategy pointer. OA table padding was ignored by comparing
cells. Replacement BEFORE text is gone; the append-only anchors remain by
design. P20 is an exact planned formatting residue, not a fidelity deviation.

### 2. Protected STRAT-D7 span and landed meaning

**No issue found.** The exact AC-4 block extracted 6, 4, 8, and 5 lines; every
diff against `main` was empty and the block exited 0. The new REPAIR definition
does not exempt a changed reviewed target or safeguard: a new test,
`KNOWN-OPEN:` pin, or governed residual is expressly a repair and receives a
follow-up. Decision and evidence records are outside the trigger only when they
change neither target nor safeguard, which matches the unchanged D7 rule. The
same-seam bullet adds a pre-repair owner choice without narrowing D7's trigger.

### 3. Derived-verdict decidability

**No issue found.** Every valid outcome maps to one token. A fully proved SEV 1
produces `BLOCKED-ON:` with its component scopes; any finding with no SEV 1
produces `CLEAR-WITH-FINDINGS`; no findings produces `CLEAR`. A follow-up whose
only live item is a PARTIALLY RESOLVED remainder re-graded SEV 1 is explicitly a
live finding, so it produces `BLOCKED-ON:` rather than falling between tokens.
A claimed SEV 1 missing part of the proof is capped at SEV 2 before derivation.

### 4. OPEN/overlap deadlock

**No issue found.** If an owner-unruled SEV 2 is inseparable from a required SEV
1 repair, OA `:290-295` permits the overlapping change and keeps the lower Ref
OPEN until the owner rules on its incidental closure. The text therefore needs
no default and does not block the SEV 1 repair. A separable lower-severity edit
waits, as the owner ruled.

### 5. Consistency across the three surfaces

**No issue found.** Template §4's SEV 2 rule and OA §3.4 agree that the reviewer
recommends, the author supplies the per-Ref options, and the owner decides. The
template table says its Recommendation is input, not decision. OA §4's two new
rows point to template §1/§1a/§4 and OA §3.4, and the strategy pointer names the
same landing sites. The live Issue locator error is external record finding
P22, not a disagreement among the three landed surfaces.

### 6. Behavioural read for surviving old rules

**No issue found.** `docs/templates/ADVERSARIAL_REVIEW.md` was read end to end,
and `docs/governance/OPERATING_AGREEMENT.md` §§1-4 were read end to end. A
second vocabulary-oriented `rg` pass over verdict, blocking, disposition, and
round-trip terms corroborated the hand trace. No unedited operative sentence
still states the old review verdict or two-state disposition model. OA §3.3's
“returned APPROVE” is history; template
`CONFIRMED / PARTIALLY CONFIRMED / REFUTED / UNVERIFIABLE` remains a per-claim
cross-check vocabulary, as deliberately recorded.

### 7. AC-3 and A4

**P18 found; no further issue found.** The exact grep exited 0 and returned the
four expected source lines: three in §1 and the §4 withdrawal line. None offers
a retired token as returnable. The criterion passes; its Check cell is the
SEV 3 record error in P18.

### 8. AC-2 and the correction

**No issue found.** Enumeration 1 returns 100 tracked files on `main` and 105 at
reviewed HEAD. `comm -23` is empty. `comm -13` is exactly the plan, original
plan review, first follow-up, third follow-up, and dispositions ledger, matching
the correction at `bf78585`. This review file will join that set when committed
because it necessarily discusses the retired tokens; the post-commit result is
reported in the final handoff rather than frozen into governing prose.

### 9. Round 4, sixth addendum, fingerprint, and commit record

**P19-P23 found; no further issue found.** Round 4 and the sixth addendum were
read sentence by sentence against the tree and reachable external records. The
fingerprint is `4fad7a426996`; the focused specification exits 0 with 9/9. The
content commit changed the three planned surfaces, did not change the plan,
left the commissioned ledger rows untouched, and the records-only correction
changed no governed file. The content commit's stale “104 here” statement is
fully owned by `bf78585` and Round 4's appended correction; no other commit-
message overstatement was found. The cleanup item exists as the named draft,
Todo/process, empty of deferred findings; the live state drawer records this
13-commit unratified state.

The historical assertion that the files were staged before the fingerprint was
read cannot be reconstructed from Git. It is **UNVERIFIED as an action order**;
the resulting committed-tree certificate is verified by the focused test.

### 10. The amended template as an instrument

**No issue found.** This review could derive its verdict, populate the non-coder
table, distinguish recommendations from owner rulings, and grade every finding
without using a retired verdict. “Whole-change block” does not restore a
whole-PR veto: it allows the affected component to be the whole change only
when no narrower component is honest, while `Blocks: PR #…` remains forbidden
and the owner alone decides merge. Nothing in §1, §1a, or §4 was harder to
execute than the former free-form verdict.

## Confidence and method

**Confidence: high** on the governed text, local records, and live Issue/board
state. Fidelity and protected-span claims are executable comparisons; verdict,
deadlock, D7 meaning, and the whole-change distinction require bounded textual
interpretation and are exposed under Weakest claims.

| Check                                                                | Real exit/result                                                                  |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Starting-state stop gate                                             | exit 0; exact branch, `bf78585`, `main`=`fa685ef`, ordered 13 commits, clean tree |
| Eleven plan-to-HEAD edit-unit comparisons                            | exit 0; 11 PASS; strategy D18 preserved; OA non-ruling fields unchanged           |
| Scoped `git diff --check fa685ef..HEAD`                              | exit 0; no output                                                                 |
| AC-1 landing-site grep                                               | exit 0; expected template, OA, strategy, and plan sites                           |
| AC-3 exact retired-token grep                                        | exit 0; four source lines, all retirement/withdrawal text                         |
| AC-4 exact protected-span block                                      | exit 0; 6/4/8/5 lines, every diff empty                                           |
| AC-5 replay block                                                    | exit 0; 21 findings, one disposition each, sets identical                         |
| Enumeration 1 on `main` and reviewed HEAD                            | exit 0; 100 and 105; `comm -23` empty; expected five HEAD-only files              |
| `npx vitest run tests/unit/author-ledger.spec.ts` before review file | exit 0; 9 tests passed in 1 file                                                  |
| Live Issue #156 and HAVDM board reads                                | exit 0; body/title and cleanup draft inspected                                    |
| Four commissioned MemPalace decision drawers plus live state drawer  | reachable; read by exact drawer ID                                                |
| `./tools/checks` on the completed review tree                        | exit 0; 4/4 steps; lint 0 errors/145 warnings; 1559 tests passed in 105 files     |
| Final pre-commit repository state                                    | exit 0; only this review file present; diff check clean                           |

**Constraints — what this review did not establish.** No e2e, integration,
Electron, packaged application, or live Home Assistant run applies to this
Markdown-only branch. No CI or merge state was exercised. Git cannot prove the
historical order in which the author staged files and read the fingerprint.
The gitignored `prompts/` population is mutable and was not used as commit
acceptance evidence. The review verifies the live Issue and board as read-only
external members; it edits neither.

## Claim ledger

| #   | Claim                                                                            | Tag                  | Evidence                                                                             |
| --- | -------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------ |
| C1  | The starting state matched the stop gate.                                        | MEASURED             | branch, revision, base, ordered log, and porcelain-status commands                   |
| C2  | All eleven landed edit units equal the plan.                                     | MEASURED             | line and table-cell comparisons; each printed PASS                                   |
| C3  | The protected D7 text is unchanged and the new text does not narrow its meaning. | MEASURED / JUDGEMENT | AC-4 exact diff; OA `:251-360`; D7 decision drawer                                   |
| C4  | The verdict vocabulary covers a SEV 1 partial remainder.                         | MEASURED / INFERRED  | template `:109-127` and `:199-222` traced together                                   |
| C5  | The OPEN overlap wording has no owner-unavailability deadlock.                   | INFERRED             | OA `:283-310`; inseparable and separable paths traced separately                     |
| C6  | No operative old verdict/disposition rule survives in the two live surfaces.     | MEASURED / JUDGEMENT | complete hand read plus the vocabulary-oriented search reported above                |
| C7  | AC-3 passes but its plan output description is false.                            | MEASURED             | exact command output versus plan `:511`                                              |
| C8  | The current fingerprint is valid for the committed governed tree.                | MEASURED             | ledger `:48`; focused spec exit 0, 9/9                                               |
| C9  | Round 4 mislabels the fingerprint population once.                               | MEASURED             | Round 4 `:277-279`, `:309-313`; predicate source `:67-70`; sixth addendum `:469-475` |
| C10 | The live Issue has two stale scope/locator labels.                               | MEASURED             | read-only `gh issue view 156`; plan `:37-49`, `:143-173`; template `:129-159`        |
| C11 | The amended instrument does not recreate a whole-PR block.                       | JUDGEMENT            | template `:109-111`, `:199-222`; ruling-1 decision drawer                            |
| C12 | The completed review tree passes the repository gate.                            | MEASURED             | `./tools/checks`, real exit 0, four steps; 1559/105                                  |

### Weakest claims

1. **Whole-change versus whole-PR.** The instrument allows a whole-change
   component only with a justification that no narrower scope is honest. I read
   that as scope, not merge authority, because the same paragraph forbids a PR
   scope and reserves merge to the owner. A future reviewer could still write
   an overbroad component name; that would violate the text rather than be
   licensed by it.
2. **P23's title status.** No retrieved owner decision says to preserve the old
   two-ruling title, and the live body/decision drawer explicitly expands B14 to
   nine. If the title is intentionally immutable history, P23 falls to SEV 4;
   no such register entry was found.
3. **Historical staging order.** The current fingerprint and test result are
   measured; the claim that staging preceded the read is not reconstructible
   and remains UNVERIFIED.
4. **P20's formatting grade.** CommonMark lazy continuation and Prettier's
   output make SEV 4 the strongest supported grade. A renderer with a narrower
   Markdown dialect was not exercised.

## Disagreements with this commission and prior record

- I agree with A4's SEV 3 grade but not Round 4's “implementation reading”
  label. The affected artifact is a plan, so the template assigns the DOCUMENT
  reading; the false sentence is non-load-bearing record accuracy and therefore
  remains SEV 3.
- I agree with A5 at SEV 3 and A6 at SEV 4.
- I disagree with Round 4's claim that all three edited files are governed by
  the author-ledger fingerprint (P21), and with its clearance of the live
  Issue's landing-site text (P22).
- The commission's predicted post-commit inventory is sound: this file will be
  the additional branch-only member. No static total is made normative here.
- No other disagreement with the commission's scope, cap, authority, or
  required vocabulary was found.

## MemPalace drawer candidates

None. The findings are project-specific record corrections and do not establish
a new cross-project practice rule. MemPalace reads succeeded; no write was
needed, no lease override was attempted, and no process was disturbed.
