# B14 Severity Rulings Codification — Second Plan Review Follow-up

Author: Claude Fable 5.1
Reviewer: OpenAI Codex / GPT-5.6 Sol
Owner gate: micah / BaggyG-AU. This document decides nothing on its own.

BLOCKED-ON: §1.3 reachability restatement, §1.4/§5 owner-cost accounting

P2, P3, P7, P8, P13 and P14 close, and A1/A2, A3 and the ledger
re-certification hold; P6 retains one blocking owner-facing mismatch, and new
P15 finds that the plan omits its own same-seam decisions from the worst-case
owner-workload count.

## Owner Summary Table

| Ref | What is wrong, in plain English                                                                                                                   | Severity | Blocks                        | Fix complexity 1–5 | Recommendation                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------- | -----------------: | --------------------------------------- |
| P6  | The owner summary says any plausible future edit can block, but the detailed rule permits that exception only for safety gates after an argument. | SEV 1    | §1.3 reachability restatement |                  1 | Owner judgement needed — park under cap |
| P15 | The worst-case estimate says you make 21 decisions, but the plan's repeat-problem rule adds at least six more decisions in that same scenario.    | SEV 1    | §1.4/§5 owner-cost accounting |                  1 | Owner judgement needed — park under cap |
| P16 | The plan says one bookkeeping step happens twice on the branch, but it has already happened four times before implementation starts.              | SEV 3    | None                          |                  1 | Fix now if the owner re-authorises B14  |
| P17 | The plan's list of new branch records is already out of date, so its completion check cannot be read literally.                                   | SEV 3    | None                          |                  1 | Fix now if the owner re-authorises B14  |

## Owner Decision Brief

### P6 and P15 — the two blocking sections

**What this protects in product terms.** P6 keeps an ordinary component's
made-up future case non-blocking while preserving the narrow exception for a
safety gate whose purpose is to catch future mistakes. P15 gives the owner an
honest view of how many decisions the new process can put on their desk.

**What is going wrong plainly.** The detailed reachability rule caps a made-up
condition at non-blocking and permits a plausible-future exception only for a
safety gate, with the plausibility argued. The owner summary says a plausible
future edit can block without either limitation. The worst-case replay then
counts the 21 per-finding decisions but omits the extra continue /
declare-residual / park decision required each time the same seam recurs. The
plan's own Scenario C counts that seam decision separately, so the two
scenarios use different arithmetic.

**Is the product affected?** No runtime product behaviour changed. The affected
components are the governance plan's approved reachability meaning and its
owner-workload disclosure.

**Options with costs.** Under the owner's hard cap, this verdict parks B14 and
returns it to the owner; no repair is attempted first. The owner can leave it
parked, preserving today's governance but also today's review-round cost. The
owner could instead explicitly re-authorise one more narrow plan repair and its
same-reviewer follow-up; that overrides the present cap and costs another
round. Accepting the two contradictions as residuals would leave the owner
summary narrower than the binding rule and the central workload estimate
demonstrably low.

**Recommendation and why.** Park under the cap. If the owner later chooses to
re-authorise the work, qualify the owner summary's future-edit case with the
safety-gate boundary and the reviewer's argument, and count the same-seam
choices in Scenario A and every owner-facing restatement derived from it. P16
and P17 can be corrected in that same authorised revision.

**What happens if you do nothing.** B14 remains unapproved and the existing
governance remains in force. No defective rule lands, but the review-churn
problem B14 is intended to reduce also remains.

### P16 and P17 — record corrections if work is re-authorised

**What this protects in product terms.** The owner should be able to see the
real bookkeeping cost of the plan and regenerate its branch-only inventory
without chasing an already-stale list.

**What is going wrong plainly.** Four certificate updates have already happened
where the plan says two, and the list of branch-created records omits a review
that now exists. Neither changes the proposed rules, but both understate the
work and make the acceptance record internally inconsistent.

**Is the product affected?** No. These are SEV 3 plan-record inaccuracies.

**Options with costs.** If B14 stays parked, leave them with the parked plan and
do no work. If the owner re-authorises B14, fix both during the same plan
revision: replace the certificate count with measured history plus the
remaining obligation, and replace the branch-file list with a regenerating
command or an immutable commit pin. Deferring them would preserve two known
false statements in the plan; accepting them as residuals would save only two
small wording changes.

**Recommendation and why.** Fix both in the same revision if—and only if—the
owner re-authorises B14. They are low-cost corrections and prevent the next
ratification review from having to reinterpret false inventory prose.

**What happens if you do nothing.** Runtime behaviour is unchanged, but the
plan continues to under-report its ledger work and its branch-only file list
drifts again when the next review is committed.

### A3 — no remaining finding

**What this protects in product terms.** The live story must preserve what the
owner originally ruled while clearly identifying the later, broader
reachability wording.

**What is going wrong plainly.** Nothing remains wrong in the live text. Each
dated note preserves the original ruling, names the P6 owner ruling, and points
readers to the broader binding wording.

**Is the product affected?** No. This is governance-history accuracy only.

**Options with costs.** Accept the notes as adequate and make no further Issue
edit, or reopen wording that already agrees with the technical rule and incur
another external edit with no identified benefit.

**Recommendation and why.** Accept A3 as resolved. The live Issue now covers an
input, execution path, state, output or artifact property, and its ruling-8 note
uses an existing condition or an argued-plausible future condition. The ruling
as originally made remains visible.

**What happens if you do nothing.** The correct state is preserved; no further
action is needed on A3.

## Prior-finding dispositions

### P2 — RESOLVED

Checked
`docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:339-345`.
“Could be left out” is a reviewer-applicable counterfactual: if the SEV 1 can
be repaired without the lower-severity correction, that correction is
separable and waits. An author's bare assertion of inseparability does not
satisfy that test. Separate files, separate lines in one file, inseparable
same-line wording, one correction that necessarily closes both behaviours and
a chosen broad superset were traced; only genuinely inseparable overlap is
permitted and the lesser Ref remains OPEN.

### P3 — RESOLVED

Checked
`docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:350-357`
against `docs/governance/OPERATING_AGREEMENT.md:251-292` and the authoritative
STRAT-D7 decision. The definition does not exempt a change to a reviewed target
or its safeguard:

- a plan revision is a repair because the plan is the reviewed target;
- a new or changed test, `KNOWN-OPEN:` pin, governed residual, commission
  safeguard or other safeguard remains a repair;
- the author-ledger regeneration is a safeguard change in the same repair diff,
  and the plan repair independently triggers review of the whole diff plus its
  declared radius;
- the `7d3969f` re-certification corrected a measured failing safeguard, so it
  is itself within the repair meaning even though it was author-found; and
- a correction to a review/evidence record that is itself under review changes
  the reviewed target and therefore is not covered by the pure-record
  exclusion.

Pure creation of the required review, disposition, owner-decision or board
record changes neither target nor safeguard and terminates the lifecycle. That
is a definition of what is and is not a repair, not a new exemption from an
existing repair.

### P6 — PARTIALLY RESOLVED — remainder SEV 1

Checked the owner-facing row at
`docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:42`, the
technical contract at `:219-243`, reviewer question 6 at `:558`, and the live
Issue #156 ruling-2/ruling-8 amendment notes. The technical contract, reviewer
question and live notes now use the ruled condition vocabulary. The owner row
still says any condition that is “a plausible future edit” can block. It omits
the detailed rule's two gates on that future case: the artifact's whole job must
be catching the not-yet-written, and the reviewer must state why the edit is
plausible rather than merely constructible.

**Blocks: §1.3 reachability restatement**

**Four-part proof.** (1) The protected ruling is that a synthetic condition
nobody has produced caps at SEV 2; it may carry SEV 1 only for a safety gate
whose whole job is catching the not-yet-written, after the reviewer argues why
the future edit is plausible. (2) The proposed technical wording states both
limits at `:226-233`, while the owner-facing approved behaviour at `:42` says
only that the condition is “a plausible future edit.” (3) The technical block
does not mitigate a contradictory owner summary: §1.3 is expressly the list of
behaviours the non-developer owner is approving. “A made-up condition alone
cannot block” does not supply the missing safety-gate boundary or the required
argument; the live Issue amendments fix the external members, not this line.
(4) **REACHABILITY:** an ordinary feature reviewer constructs a plausible
future input field that nobody has produced and demonstrates a latent contract
violation. The owner summary permits SEV 1 because it is a plausible future
edit; the detailed rule caps it at SEV 2 because the feature is not a safety
gate. This is a routine future-schema review construction.

**Narrow correction.** After the current-condition half, say that a synthetic
future edit can block only where the artifact's whole job is catching the
not-yet-written and the reviewer states why the edit is plausible. Preserve the
condition examples and synthetic-only SEV 2 cap.

**Class swept.** The behavioural summary, detailed severity contract, coverage
locator, reviewer question, open-question record, revision history and both
live Issue amendment notes were read by function. Only `:42` drops the
safety-gate and argued-plausibility limits; A3 leaves no external remainder.

### P7 — RESOLVED

Checked
`docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:460-475`
and AC-5 at `:521`. The block was run exactly as written: exit 0 and
`replay population ok: 21 findings, one disposition each, sets identical`.
Independent in-memory controls then produced exit 1 for each promised defect:
duplicate source heading, duplicate disposition row, equal-cardinality
different Ref sets, and equal 20-member sets. The plan's block itself is
committed and reproducible; the author's uncommitted mutation harness is
acceptable supporting evidence because this review independently reconstructed
the controls and obtained the required failures. AC-5 promises no more than
the block delivers.

### P8 — RESOLVED

Checked §2.1 at
`docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:94`, §3.6
at `:412-436`, AC-2 at `:518`, and §4 at `:449`. The repaired criterion now
claims only the exact six-token inventory, the named-surface behavioural read
and a session-local prompts observation. The §4 “zero restatements found” line
is adequately backed for `ai_rules.md` and `CLAUDE.md`: both have zero token
hits, both were read end to end in round 1, and both are byte-identical to
`main` in this round. P17 is a separate stale branch-artifact inventory, not a
return of P8's rejected repository-wide behavioural universal.

### P13 — RESOLVED

The live Issue #156 acceptance item 5 says “twenty-one.” It agrees with plan
`docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:456-475`
and with the 21 unique source headings.

### P14 — RESOLVED

Checked
`docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:31-35`.
The seam-membership claim is separately labelled JUDGEMENT/hand trace. The
mechanical statement is only that each of eight review files contains at least
one “Class swept” statement; the command returned eight files with non-zero
counts. No measured label remains on the seam-membership judgement.

### Other prior findings — no regression in their resolved classes

No regression was found in P1's non-terminal verdict accounting (`:134-138`,
`:316-331`), P4's P32/finding/repair-round population (`:25-28`, `:456-511`),
P5's SEV-2/3 owner-decision scope (`:239-252`, `:332-359`), P9's short ruling
locators (`:388-395`), P10's P30 seam-C placement (`:497`), P11's
one-measured-source wording (`:59-62`) or P12's byte-read disclosure (`:543`).
P15 is a distinct omitted **same-seam decision** consequence in the owner-cost
projection, not a regression of P4's corrected finding and repair-round
population.

## Other commissioned checks

### A1 and A2

Confirmed. The A1 change only re-wraps the new §3.3 text inside the proposed
AFTER fence; no rule sentence changes beyond the reviewed P2/P3 repairs. A2
removes the fourth orphan cell from AC-4's row at
`docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:520`; the
criterion and its actual command block are unchanged.

### Ledger re-certification

Adequate. `tests/support/authorLedger.ts:290-340` records an index fact (`I`)
and a working-tree fact (`W`) for every tracked governed path, plus an untracked
fact (`U`) for governed additions, then hashes the sorted facts. A fingerprint
computed with the new plan unstaged therefore represents old index object plus
new working-tree bytes and changes when the plan is staged/committed. The
fourth ledger addendum at
`docs/reviews/self-pass-gate-author-ledger.md:430-447` states that mechanism,
quotes both fingerprints, names the immediate post-`79eb20e` failure and
updates the live declaration to `618ea4beca30`.

Leaving `79eb20e`'s immutable message with the pre-commit value is acceptable:
`7d3969f` explicitly identifies the false historical value and corrects it in
both its commit body and the append-only ledger, following the `39c53d6`
precedent. `npx vitest run tests/unit/author-ledger.spec.ts` passed 9/9 at
`fcfba75`.

### Protected and previously clean surfaces

The five future governance targets (`OPERATING_AGREEMENT.md`, the adversarial
review template, the strategy record, `CLAUDE.md`, and `ai_rules.md`) are
byte-identical to `main`. AC-3 returned the expected empty result (grep exit 1,
zero output bytes). AC-4 returned exit 0; its four spans extracted 6, 4, 8 and 5
lines and every diff was empty. No silent omission of Issue #156 ruling 1–9 or
its seven acceptance items was found in the plan's §2.1/§3/§6 mapping. P6 and
P15 are inconsistencies within present mappings, not dropped ruling rows.

## Confidence and method

**Confidence: high** on the two blockers and the named repairs; **medium-high**
on P17 because §3.6 could be read as illustrative rather than as the exact
inventory AC-2 calls for. The literal “this branch's own new files” and “each
named” wording is why I report it.

| Check                                                                      | Real exit/result                                                                 |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Starting-state gate: branch, HEAD, base, eight-commit sequence, clean tree | exit 0; exact match                                                              |
| `git diff --name-only cd1d412..fcfba75`                                    | exit 0; exactly the plan, disposition ledger and author ledger                   |
| `gh issue view 156 --json ...`                                             | exit 0; live item 2 wording and “twenty-one” observed; A3 notes present          |
| Revision-3 §5 replay block, verbatim                                       | exit 0; expected `21 findings` line                                              |
| Four independent known-bad replay controls                                 | each validation exit 1; harness exit 0                                           |
| AC-3 retired-token grep                                                    | exit 1 with zero output bytes, the expected no-match result on the unedited tree |
| AC-4 protected-span loop                                                   | exit 0; 6/4/8/5 non-zero lines, all diffs empty                                  |
| `npx vitest run tests/unit/author-ledger.spec.ts`                          | exit 0; 9/9 tests                                                                |
| Six-token inventory, `main` versus `fcfba75`                               | exit 0; 100 versus 103; three HEAD-only matching files                           |
| B14 ledger addenda enumeration                                             | exit 0; four dated B14 addenda before implementation                             |
| `./tools/checks` on the completed review tree                              | exit 0; REAL_EXIT=0, 4/4 steps, 1559 tests / 105 files                           |
| Final `git status --porcelain` before commit                               | only this review file                                                            |

**UNVERIFIED:** the Issue edit-history backup and the ledger's “exactly four
lines changed” claim were not available through `gh issue view`; only the live
body was checked. The future governance edits, draft cleanup board item,
ratification review, PR body, CI, packaging, e2e, integration, Electron and
live Home Assistant are not present or are outside this Markdown-only round and
remain UNVERIFIED. No repository-wide behavioural-restatement universal is
claimed. The current ignored `prompts/` observation is 144 files / 97 token
matches; the plan correctly labels its older 139/92 observation session-local,
so this drift is not acceptance evidence and is not a finding.

## Claim ledger

| Claim                                                              | Status    | Evidence                                                                                         |
| ------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------ |
| Starting state and three-file repair scope match the commission    | MEASURED  | Git branch/revision/log/status and diff-name commands                                            |
| P2's “could be left out” wording decides separability              | JUDGEMENT | Five-case hand trace against `:339-345`                                                          |
| P3 exempts no actual reviewed-target or safeguard repair           | JUDGEMENT | Target/safeguard/record trace against §3.3 and STRAT-D7                                          |
| P6's owner summary omits the safety-gate and argument limits       | MEASURED  | Direct comparison of `:42`, `:226-233`, `:558` and the live Issue notes                          |
| A3 is adequate                                                     | JUDGEMENT | Live Issue wording preserves the originals and appends matching amendments                       |
| The replay check is live for every promised failure class          | MEASURED  | Real-data pass plus four known-bad exit-1 controls                                               |
| Scenario A needs more than 21 owner rulings                        | INFERRED  | 21 per-Ref decisions plus six later A-seam recurrences; Scenario C establishes separate counting |
| The ledger mechanism explains `2cca75f5bde4` versus `618ea4beca30` | MEASURED  | Source trace at `authorLedger.ts:290-340`, ledger addendum and 9/9 spec pass                     |
| “Two ledger regenerations” is stale                                | MEASURED  | Four B14 addenda already present; plan `:440` and `:549` still say two                           |
| The branch-local token inventory is stale                          | MEASURED  | `main` 100, HEAD 103; three matching additions versus the row's old artifact description         |
| No Issue ruling or acceptance item was silently dropped            | JUDGEMENT | Live Issue-to-plan §2.1/§3/§6 hand trace                                                         |

### Weakest claims

1. **P3 closure.** “Finding” could be read narrowly as only a reviewer-issued
   Ref. I read it in its ordinary repair sense, which includes an author-found
   measured defect; the target/safeguard boundary and the current `7d3969f`
   correction make that the coherent reading. A later codification should
   preserve that breadth.
2. **P15's exact increment.** Six extra A-seam choices are unavoidable from
   P16/P19/P20/P23/P26/P29. I do not add a seventh for P32 because its
   record-accuracy defect arose in the P29 repair; the finding needs only the
   six to refute 21. Thus the defensible statement is “at least 27,” not a
   universal 28.
3. **P17's intended home for the names.** AC-2 could allow the execution record
   rather than §3.6 itself to name future branch-only matches. The current §3.6
   row is still false as a present-tense inventory, which is the narrower
   SEV-3 finding reported.

## New findings

### P15 — SEV 1 — Scenario A omits the same-seam owner decisions

**Blocks: §1.4/§5 owner-cost accounting**

**Four-part proof.** (1) The broken claim is the plan's disclosure of how many
owner rulings the amended process requires when the owner fixes every replayed
finding. Section 1.4 says 21 at
`docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:53`, and
Scenario A repeats 21 at `:507`; Scenario C expressly counts its same-seam
choice as an additional eighth ruling at `:509-511`. (2) The plan's own replay
has seven SEV-2 findings in seam A—P12, P16, P19, P20, P23, P26 and P29—at
`:479`, `:483`, `:486-487`, `:490`, `:493` and `:496`. Under the proposed rule
at `:369-377`, each of the six later same-seam follow-ups requires a continue /
declare-residual / park brief and owner choice before further repair. (3) The
JUDGEMENT label mitigates uncertain owner choices, not arithmetic inside the
stated “fix every finding” assumption. Scenario C confirms the plan's own
counting convention treats the seam choice separately from per-finding
rulings. No other line adds the omitted decisions back into the owner-cost
summary. (4) **REACHABILITY:** the replayed rounds and seams exist today. Under
Scenario A's express assumption, all 21 findings receive Fix now, so the six
later seam-A repairs reach the same-seam gate. The owner therefore makes at
least 27 rulings—21 per finding plus six seam choices—not 21.

**Narrow correction.** Recompute Scenario A and §1.4 under one explicit
counting convention. If a combined owner message is counted once operationally,
say that and stop calling the cells “rulings”; otherwise report at least 27 and
show the six seam choices. Do not change the same-seam rule or the 21-finding /
nine-round replay.

**Class swept.** Every owner-decision total in §1.4 and §5 was traced against
the replay and rule: Scenario B's four has no follow-up and is sound; Scenario
C's eight correctly adds one seam choice; Scenario A alone omits the six known
seam-A choices. Historical finding, severity, repair-round and verdict counts
were separately checked and remain sound.

### P16 — SEV 3 — the two-regeneration cost is already false

**Evidence.** The plan says the ledger is regenerated “twice on this branch” at
`docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:440` and
repeats “Two ledger regenerations” as accepted operational cost at `:549`.
`docs/reviews/self-pass-gate-author-ledger.md:380-447` now contains four B14
addenda: the initial plan, revision 2, revision 3, and committed-tree
re-certification. Four branch steps wrote or re-certified the live certificate;
another regeneration is still planned for the governance edits.

**Problem.** The cost statement remained fixed while governed plan repairs
forced further certificate updates. It is stale before the implementation it
purports to cost has begun.

**Narrow correction.** Replace the fixed total with the measured history plus
the remaining obligation, or make the rule dynamic: regenerate after every
governed change and record each regeneration; one further regeneration is owed
with the edits commit.

**What must not change.** Preserve the author-ledger gate, every append-only
addendum and the requirement to regenerate for the governance edits.

**Class swept.** Every `twice`, “two ledger,” regeneration and fingerprint-move
statement in the three-file repair scope was searched, then the four B14
addenda and five ledger-touching branch commits were read. Only plan `:440` and
`:549` assert the stale total; `39c53d6` touched the ledger without changing
the fingerprint and is not counted as a regeneration.

### P17 — SEV 3 — the branch-only token-inventory row omitted the follow-up

**Evidence.** Section 3.6 says “This branch's own new files (the plan, its
review, its disposition ledger)” at
`docs/governance/B14_SEVERITY_RULINGS_CODIFICATION_PLAN_2026-09.md:432`; AC-2
requires the branch additions to be “each named” at `:518`. The six-token union
measures 100 files on `main` and 103 at `fcfba75`. The three HEAD-only matches
are the plan, the original plan review and the first follow-up review. The
disposition ledger does not match any of the six tokens, and the row omits the
first follow-up as a separate new artifact.

**Problem.** A static description written before the follow-up was added now
misstates the exact branch-only population that AC-2 says must be named. The
next review artifact will make the unpinned list drift again.

**Narrow correction.** Make a `main`-versus-edits-commit command the inventory
and name its output in the edits execution record, or pin the prose to a named
commit. Do not keep a present-tense static list of an accumulating review arc.

**What must not change.** Keep `main`'s 100-file partition, branch-created
records outside that baseline, historical reviews untouched and the
behavioural claim limited to the named live surfaces.

**Class swept.** The complete 100-file `main` token union, complete 103-file
HEAD union, their set difference, and every branch-added path were enumerated.
Only the branch-local row/AC naming promise is affected; the `main` partition
and the three head-only token matches are exact.

## Disagreements with this commission

I have no disagreement with the commission's starting-state facts, repair-diff
scope, A3 procedure or instruction to judge the uncommitted P7 harness by
independent reconstruction. I do disagree with the repair ledger's supplied
`RESOLVED` conclusion for P6: the commission correctly asked for a fresh
judgement, and plan `:42` still omits the future-edit exception's safety-gate
boundary and required argument.

## MemPalace drawer candidates

None. P16/P17 are project-specific instances of the already filed rule against
static inventories of accumulating artifacts, and P6/P15 are specific to this
plan. Filing them as new cross-project rules would duplicate existing practice
drawers rather than add an agent-general lesson.
