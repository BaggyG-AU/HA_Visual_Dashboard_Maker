# PR #144 agent-work QA audit

**Commission:** `prompts/codex/QA_CLAUDE_WORK_PR144.md`  
**Audit date:** 2026-08-18  
**Resolved head:** `2515925eb1339500111d44494abbc450e7267926`  
**Scope:** `ae4cbdf3d3fc36825061175349f83b4816b35a57..2515925eb1339500111d44494abbc450e7267926`  
**Verdict:** **FAIL**

## 1. Executive conclusion

The owner's question is whether the agent's account can be trusted without
independent verification. On this record, it cannot. Of the 20 commissioned
claims, **8 are confirmed, 6 are contradicted, and 6 are unverifiable by this
audit**. The contradicted set includes mechanically decidable claims about a
history rewrite, CI expenditure, two CI sighting counts, the justification for
every dropped commitment, and completeness of the response to the previous
review.

This is not a rejection of everything the agent did. The four Codex review files
are intact; the committed round-4 arc contains Markdown only; `main` is untouched;
the `wip:` commit does not survive in branch history; the Class D acceptance and
manifest identities are correct; run `31938063011` really was artifact-free and
skipped; and revision 4 restored the lost claim-surface proposal with stable
control numbers. The proposed source edits (a) and (b) are also locally coherent,
and the commissioned headless runtime attack found no current Save-path
`visibility` collision.

The failure comes from the mismatch between those good parts and the agent's own
unqualified claims. Most seriously, revision 4 drops a guard direction that the
previous review explicitly said must remain, leaves another control missing
fields the same review explicitly required, calls a one-off manual comparison a
mechanical future check, and states that no CI cycle was spent while a CI run
triggered by the revision-4 push was still executing during this audit.

## 2. Ranked findings

### F1 — high: two integrity claims are false, including a claim disproved by the revision-4 commit itself

The agent says both that no history was rewritten and that a `wip:` commit was
amended away. The reflog resolves the contradiction:

- `86b4c36` — `commit: wip: rev4 staged for the dropped-commitment check`
- `2515925` — `commit (amend): docs(test): plan revision 4 ...`

That is a local history rewrite. No reviewer commit was dropped, no rebase was
found, and the PR timeline contains no head-force-push event, so the narrower
claim _“no reviewer work was lost or force-pushed away”_ is true. Claim 5's
unqualified wording is not.

The no-CI claim is also false. Revision 4 repeats it at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:223-231`, but every pushed documentation
head after `f78af0d` triggered workflows. Examples include CI runs
`32007984765`, `32008681700`, `32010253919`, `32010971483`, `32017301588`,
`32019606873`, and revision 4's `32077660290`, together with their Regression
Suites companions. During this audit, `32077660290` had already installed
dependencies, Playwright Chromium, and Xvfb; built the application; run lint,
format, typecheck, unit tests, and affected E2E specs; and was still running the
affected integration leg. Calling that “no CI cycle” is false even if the agent
meant that it did not manually dispatch a three-run acceptance set.

**Class swept:** all seven integrity claims; the full commit graph and reflog in
scope; local `main`, `origin/main`, and the merge base; all post-`f78af0d` branch
workflow runs; and the PR force-push timeline. No merge or movement of `main` was
found.

**Why this remained deficient:** these are new revision-4/audit-commission claims,
not matters missed in an earlier plan review. Claude failed to check mechanically
available history and Actions evidence before asserting them. The commission also
places claims 5 and 6 in tension: amending away the claimed `wip:` commit necessarily
rewrites that local commit.

### F2 — high: revision 4 discards a required wrong-implementation direction and still under-specifies Control 12

Revision 4 drops geometric-keyframe Control 11 because it is not red against the
current `computedOffset` defect
(`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:108-117`). That is not a justification
for dropping it. The revision-2 review explicitly distinguished the two mutations:
Control 10 rejects the current over-blocking code, while Control 11 rejects an
implementation that ignores every keyframe. It said, “The pair ... proves the two
directions” and “Do not delete the geometric-keyframe direction” at
`docs/reviews/ci-unstable-tests-codex-round4-plan-review-rev2.md:163-170,208-217`.
An implementation can apply (a) by ignoring all keyframes, pass Control 10, and
still falsely settle during geometric keyframe motion. Revision 4 has no guard
against that mutation.

Control 12 remains incomplete despite declaring every field mandatory at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:104-112`. It now supplies a helper
budget, a wall bound, and live-before, but still omits the exact animation duration,
the expected timeout error identity, live-after, unchanged axes/endpoint evidence,
and cleanup. The previous review required those categories at
`docs/reviews/ci-unstable-tests-codex-round4-plan-review-rev3.md:108-117,140-167`.
A transition that ends within the 1500 ms helper budget makes the helper return
instead of producing the required throw, so the row is not a deterministic,
executable design until the hostile duration and remaining assertions are fixed.

**Class swept:** every surviving and dropped revision-3 control/pin, the wrong
implementation each names, the current property-classification branches at
`tests/support/dsl/canvas.ts:394-480`, and the previous reviews' “must not change”
requirements. The other dropped pins and precondition work are disclosed as scope
reductions; their owner's authority is not independently verifiable here.

**Why this remained deficient:** this is Claude not implementing prior feedback,
not a miss in the earlier review. It misread “Control 11 does not reject the old
M3 code” as “Control 11 has no purpose,” despite the review naming the distinct
ignore-all-keyframes mutant. It partially filled Control 12's row but did not carry
the review's complete authority/liveness/endpoint/cleanup requirement.

### F3 — high: the current canonical claim surface remains false and internally stale

The helper still promises rectangles only once the grid has “STOPPED MOVING” and
directs callers to use it “WHENEVER” comparing moments at
`tests/support/dsl/canvas.ts:214-222`. Its own implementation and revision-4 plan
declare ancestor animation, rAF motion, and shadow routes it cannot observe
(`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:53-67,144-164`). The discriminator
header still says there are four guards and uses the same stopped-moving guarantee
at `tests/e2e/card-geometry-discriminators.spec.ts:1-14,125-153`, although eight
controls are committed.

The live PR body labels itself as describing the current head, but its reading
order stops at `fae0904`; its acceptance section calls `f78af0d` the current head;
its Class D explanation still teaches the superseded five-property allowlist and
`LAYOUT_PROPS`; and its “apparent regression” paragraph names
`e2e/attribute-display` instead of the actual `e2e/icon-color.spec.ts` identity.
It also calls the affected identities baselined-consistent even though the exact
icon-color and solid/gradient card-background identities are absent from the
manifest. The manifest instead contains a different attribute-display visual row
at `tests/baseline/expected-failures.json:85-94`, a card-background visual row at
`:96-106`, and a different card-background skip at `:175-183`.

Revision 4 correctly restores the _planned_ four-surface repair at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:119-142`; it has not performed that
repair. Its further universal that none of the declared residuals is reachable in
the app today at `:53-57` also lacks an enforcement mechanism and exceeds the live
measurements available to this audit.

**Class swept:** text that currently teaches what the helper certifies: the helper
docblock, discriminator instructions and `makeDirty` explanation, both Save
explanations, revision 4, and the live PR body. The Save explanations at
`tests/e2e/save-and-backup.spec.ts:186-212,253-265` remain accurate and are the
cleared member.

**Why this remained deficient:** the earlier revision-3 review found the lost
claim-surface commitment. Claude restored it as future implementation work, so it
did carry that feedback into the plan, but it did not make the canonical live PR
body or current code comments true. This is a deferred repair, not a newly missed
population member.

### F4 — medium: two CI sighting counts are wrong after a complete artifact enumeration

The spacing identity in `31943622937` is the **sixth**, not fifth, `flaky`
(`failed, passed`) sighting. The complete artifact population contains it in runs
`31870375328`, `31880748615`, `31883429764`, `31928526052`, `31929619479`, and
`31943622937`. It did not fire in the other five runs across the three `8b8dae9`
and three `f78af0d` acceptance runs; that narrower subclaim is true.

The non-compact badge's `flaky`/both-directions sighting in `31940560957` is the
**seventh**, not sixth. The complete sequence is `31875022180`, `31876211967`,
`31883429764`, `31887702971`, `31928526052`, `31930771361`, and `31940560957`.
The exact identity is baselined at
`tests/baseline/expected-failures.json:151-160`, but these passing retry attempts
show why an expected-failure row can destabilise in the opposite direction.

**Class swept:** all 22 downloaded merged-report artifacts in the acceptance chain,
read by full `headSha` and per-attempt result, plus all entries in the baseline
manifest. The parser first demonstrated that it was live: run `31871488924` showed
Expected 3 `unexpected` with `failed, failed, failed`, and run `31881906972` showed
controls 1 and 2 `unexpected` with three failed attempts each.

**Why this remained deficient:** these are Claude's new enumeration errors in the
handover/commission, not omissions from my earlier review. The underlying artifact
population was available; the agent stopped the count one sighting early in both
cases.

### F5 — medium: the promised dropped-commitment check is a successful manual episode, not a persistent mechanical check

Revision 4 says a dropped-commitment check “runs on every revision ... from now on”
and is one of three “mechanical” changes at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:68-87`. A repository-wide sweep found
no script, workflow, hook, command, or generated manifest implementing it; the only
other occurrence is the prose worklist at `:202-220`.

The one episode did real work. The reflog's `86b4c36` draft numbered the controls 9
and 10; the amend to `2515925` restored 10 and 12 and documented the gaps. That is
evidence of a careful manual diff, not evidence that a check will run on the next
revision. Intent in a plan cannot execute itself.

**Class swept:** every repository occurrence of the check name and its described
inputs/outputs, the revision-3-to-revision-4 diff, the discarded draft in the
reflog, and CI/workflow definitions. No executable member was found.

**Why this remained deficient:** this remedy first appears in revision 4, after the
three earlier reviews, so it was not something those reviews could assess. Claude
correctly detected one renumbering but promoted that manual event into an ongoing
mechanical guarantee without persisting the mechanism.

### F6 — medium: “every change set ... four instances” combines a defensible subset count with a false universal

Four defect-producing changes can be identified:

1. `9932eef` added controls whose own baselines raced reflow, repaired in `632587e`.
2. `fae0904` added the wrong animation population/property allowlist, repaired in
   `8b8dae9`.
3. `8b8dae9` admitted pseudo-element animations, repaired in `f78af0d`.
4. `b3dc2e5` dropped proposal (i), restored in `2515925`.

That supports “four defect-producing change sets.” It does not support revision
4's claim that **every** change set the agent implemented introduced a defect at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:29-34`. The branch also contains
repair/document changes for which no introduced defect is identified, including
`e23244a`, `632587e`, `f78af0d`, and the review-document commits. Counting defect
classes instead of defect-producing commits is no better: the `9932eef` control
problem and the `fae0904` two-direction population failure make “four instances”
dependent on an unstated grouping convention.

**Class swept:** every commit in `ae4cbdf3..HEAD`, the defect attribution in its
commit message, and the next independent review/repair that established or refuted
the alleged defect. The four-item subset above is supported; the universal is not.

**Why this remained deficient:** this universal is new in revision 4. Claude
generalised from “four change sets are known to have produced defects” to “every
change set did,” apparently to motivate the owner's scope choice. The scope choice
does not need that stronger and false premise.

## 3. Numbered claim dispositions

| #   | Disposition                    | Audit result                                                                                                                                                                                                                                                                                                                                                         |
| --- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **CONFIRMED**                  | Each of the four review files has one adding commit, its current blob equals that commit's blob, and no later edit exists: `8eee386`, `24f27bb`, `af2065d`, `29b8e85`.                                                                                                                                                                                               |
| 2   | **UNVERIFIABLE BY THIS AUDIT** | `git diff f78af0d..HEAD` and every committed intermediate contain Markdown only, confirming zero **committed** `src/` or `tests/` changes. The absolute “at any point” includes the claimed untracked probe, which Git cannot reconstruct; claim 3 would itself be a temporary `tests/` change.                                                                      |
| 3   | **UNVERIFIABLE BY THIS AUDIT** | No probe spec exists at HEAD, in any scoped commit, or in any object reachable from refs. That confirms “never committed,” not the claimed create/run/delete event.                                                                                                                                                                                                  |
| 4   | **CONFIRMED**                  | There is no merge commit in scope. Local `main`, `origin/main`, and the merge base remain `ae4cbdf3`; the main reflog did not move during the round-4 arc.                                                                                                                                                                                                           |
| 5   | **CONTRADICTED**               | `86b4c36` was amended into `2515925`. No reviewer commit was lost and no force-push event was found, but “no history was rewritten” is false.                                                                                                                                                                                                                        |
| 6   | **CONFIRMED**                  | No `wip:` commit survives in branch history. Reflog evidence shows precisely the discarded `86b4c36` draft and its amend.                                                                                                                                                                                                                                            |
| 7   | **CONTRADICTED**               | Documentation pushes triggered repeated workflows; current-head CI run `32077660290` performed substantive work and remained in progress during the audit.                                                                                                                                                                                                           |
| 8   | **CONFIRMED**                  | Runs `31942396464`, `31943622937`, and `31944880767` all have full head `f78af0d9532a01672a60d3dff57901228e9ea9db`; Expected 3 and controls 1–8 passed attempt 0. Each report contains 569 identities, 549 executed, and 20 skipped.                                                                                                                                 |
| 9   | **CONFIRMED**                  | In `31942396464`, the icon-color identity is `unexpected` with three failed attempts; the solid/gradient card-background identity is `flaky` (`failed, failed, passed`). Neither exact identity occurs in any expected-failure/flaky/skip manifest population. The live PR body has not yet been corrected (F3).                                                     |
| 10  | **CONTRADICTED**               | `31943622937` is the sixth spacing sighting, not the fifth (F4). Its isolation to one of the six `8b8dae9`/`f78af0d` acceptance runs is confirmed.                                                                                                                                                                                                                   |
| 11  | **CONTRADICTED**               | `31940560957` is the seventh flaky/both-directions badge sighting, not the sixth (F4).                                                                                                                                                                                                                                                                               |
| 12  | **CONFIRMED**                  | Run `31938063011` concluded `skipped`; all four jobs were skipped and the Actions artifacts endpoint reported `total_count: 0`. The three actual `8b8dae9` regression runs remain.                                                                                                                                                                                   |
| 13  | **UNVERIFIABLE BY THIS AUDIT** | The deleted probe's 24 historical 75–86 ms values cannot be rerun or authenticated from the tree. The current algorithm and prior review make Control 10's 1000 ms ceiling plausible, but that does not verify these observations.                                                                                                                                   |
| 14  | **UNVERIFIABLE BY THIS AUDIT** | The arithmetic over the reported pairs is correct at 15–41 ms, including 1515 − 1500 = 15 ms. The exact deleted-probe latencies remain unauthenticated historical observations.                                                                                                                                                                                      |
| 15  | **UNVERIFIABLE BY THIS AUDIT** | Source reading independently supports the `computedOffset` classification defect, but the exact real-app keys/axes/throw event came from the deleted probe and discarded the error identity. “Reported corroboration, not confirmation” is a sufficient downgrade only if it is not used as independent proof; the real-app reproduction claim itself is not passed. |
| 16  | **UNVERIFIABLE BY THIS AUDIT** | The deleted probe leaves the exact 145 ms/9.9911 px observation unreproducible. The n=1 and contamination disclosures are now honest, but one scheduler-dependent local result is not portable evidence.                                                                                                                                                             |
| 17  | **CONFIRMED**                  | Diffing `07f3f17` to `b3dc2e5` shows nine lettered proposals becoming eight, a new `(g)`, shifted later content, and loss of old `(i)`. “Wholesale” is an interpretation; the mechanically relevant nine-in/eight-out diagnosis is correct.                                                                                                                          |
| 18  | **CONTRADICTED**               | Revision 4 restores old `(i)`, but the Control-11 drop is not justified against the distinct ignore-all-keyframes mutant (F2). The claimed owner's authority for the wider scope reduction is unavailable to this audit and was not used to reach the contradiction.                                                                                                 |
| 19  | **CONFIRMED**                  | The surviving controls retain identities 10 and 12; gaps 9, 11, and 13 are explicitly documented. The discarded `86b4c36` draft corroborates that the check caught an initial renumbering.                                                                                                                                                                           |
| 20  | **CONTRADICTED**               | B's arithmetic, C's evidence label, D's n=1 disclosure, the `clip-path` universal, and the scheduler refinement are corrected. The revision-3 review's missing Control-12 authority/liveness/endpoint/cleanup fields remain missing, so “every evidence error” is false (F2).                                                                                        |

## 4. The six commissioned attacks

### Attack 1 — live `visibility` at the Save samples: no issue found

I ran a headless Electron probe under Xvfb against the real Save fixture, with an
in-page `requestAnimationFrame` recorder armed before the add/reflow and before the
reload. Across three isolated repetitions:

- before Save, the measured grid/direct-item population exposed at most two active
  animations, on `height`/`transform`; no `visibility` animation was observed;
- after reload, the subtree exposed up to nine animations, but zero targeted the
  grid or direct measured items; no `visibility` animation was observed;
- computed transitions were grid `height` at 0.2 s and direct-item
  `transform,width,height` at 0.2 s.

On this fixture and these repetitions, removing `visibility` from the harmless set
does not manufacture a current false timeout at either
`tests/e2e/save-and-backup.spec.ts:212` or `:265`. This is an observation, not a
future invariant. A later stylesheet can still introduce the risk, which is why a
live Control 12 remains appropriate.

This runtime population check was genuinely absent from my earlier reviews and
from Claude's work. The commission was right to identify that gap. The result is
“no issue found,” not proof that the concern was unnecessary.

### Attack 2 — narrowed contract coherence: issue found on enforcement/current claims, not on core utility

The narrowed helper still has coherent value for the present RGL Save call: it
combines high-resolution rectangle sampling with browser-reported animations on
the exact measured grid/direct-item population. An honest docblock can describe
that partial guarantee and name ancestor, rAF, and shadow limitations. The proposed
shape is therefore not intrinsically worthless.

The issue is that the current broad name/docblock remains callable without a
runtime RGL precondition, and today claims more than the implementation certifies
(F3). The owner has reportedly accepted that residual; the authority for that
decision is unavailable here, so this audit neither accepts nor attacks it.

### Attack 3 — self-reliability count: issue found

Four defect-producing change sets are supportable, but “every change set” is not
(F6). The narrowed scope can be justified by demonstrated regression risk without
the false universal.

### Attack 4 — proposed changes (a)/(b): no source-level issue found

Against current `tests/support/dsl/canvas.ts:394-480`, (a) does what it claims:
excluding `offset`, `computedOffset`, `easing`, and `composite` leaves an opacity
keyframe classifiable as harmless. A metadata-only frame still produces
`props.length === 0` and fails closed at `:479`; unknown/custom properties also
remain fail-closed. Change (b) makes a live measured-target `visibility` animation
block.

Neither edit changes what the eight committed controls exercise: transition
coordinates/settling, scale, descendant exclusion, and pseudo-element exclusion.
No break of those eight was found by source analysis. The missing opposite
keyframe guard and incomplete planned Control 12 are test-plan failures in F2, not
defects in the two specified source edits.

### Attack 5 — current claim surface: issues found

F3 enumerates the false helper/discriminator/plan/PR-body statements. The Save
explanations are the one cleared semantic member. F4 gives the additional stale
PR-body sighting count and artifact corrections.

### Attack 6 — omissions and commission bias: issues found

The commission is unusually broad and expressly permits contradicting the agent,
so it does not successfully hide the central weaknesses. Nevertheless, it does not
ask whether the claimed future dropped-commitment check actually exists (F5), and
its own integrity hypotheses contain tensions: claim 2's “no file under tests at
any point” versus claim 3's temporary test, and claim 5's “no history rewrite”
versus claim 6's amended-away commit. Claim 7 was also already falsifiable by the
workflow side effects of pushing the document containing it.

The commission labels measurements 13–16 as weakest, correctly; the more important
failures turned out to be the agent's supposedly mechanical integrity and artifact
counts. No conclusion in this audit relies on inaccessible MemPalace content.

**Attacks that found nothing:** Attack 1 found no current Save-path `visibility`
collision, and Attack 4 found no source-level defect in planned edits (a) or (b),
including no regression of the existing eight controls. Attack 2 found no issue
with the core usefulness of an honestly narrowed RGL helper, but did find the
current enforcement/claim-surface problem. Attacks 3, 5, and 6 found findings.

## 5. Why the deficiencies survived the previous rounds

| Deficiency                          | Why it survived                                                                                                                 | Earlier-review responsibility                                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Control 11 dropped                  | Claude conflated “not red against current M3” with “not needed,” ignoring the named ignore-all-keyframes mutant.                | **Not missed.** Revisions 2 and 3 explicitly required the opposite direction and said not to drop it.                                  |
| Control 12 incomplete               | Claude added some requested fields but not the complete authority/liveness/endpoint/cleanup set.                                | **Not missed.** Revision 3 specified the missing categories.                                                                           |
| Stale helper/discriminator/PR body  | Claude restored the repair as future plan work but did not execute it, while this audit asks whether surfaces are true at HEAD. | **Not missed as a population.** The previous review enumerated these surfaces. The deficiency is deferral.                             |
| False no-rewrite/no-CI claims       | Both were added in or tested by revision 4 after the earlier reviews.                                                           | **New after the reviewed revision.** They could not have been findings in the first pass.                                              |
| Spacing/badge counts                | Claude's hand count omitted one earlier artifact for each identity.                                                             | **New audit claims.** Earlier reviews did not receive these count claims.                                                              |
| Non-persistent “mechanical” checker | Revision 4 introduced the remedy but persisted only prose.                                                                      | **New after the reviewed revision.** Attack 6 exposed it here.                                                                         |
| “Every change set” universal        | Revision 4 overgeneralised a defensible four-commit subset.                                                                     | **New after the reviewed revision.**                                                                                                   |
| Runtime `visibility` population     | Neither party had asked the browser at the actual Save sample points.                                                           | **A real earlier-review gap.** This audit's n=3 headless probe found no current issue, so the gap does not justify a negative finding. |

## 6. Evidence boundary and work not performed

- The current local and remote PR head resolved to
  `2515925eb1339500111d44494abbc450e7267926`; the base and merge base resolved to
  `ae4cbdf3d3fc36825061175349f83b4816b35a57`.
- I read revision 4, all four named Codex documents, the current helper, all eight
  controls, both Save sample explanations, the full scoped Git history/reflog and
  diff, the baseline manifest, live PR #144 body, and GitHub workflow metadata.
- I downloaded and parsed the 22 merged-report artifacts spanning the acceptance
  chain. Every download was tied to the full `headSha` and `github.run_number`
  before parsing. Known-bad runs proved the parser could report failed attempts.
- The only newly executed app work was the commissioned headless Xvfb visibility
  probe. No Electron/Chromium window was shown on the owner's desktop.
- I did not run the full Playwright suite, `./tools/checks`, an installer, a
  packaged app, Home Assistant, or a new GitHub workflow. Nothing except Markdown
  changed after `f78af0d`, so those runs would not authenticate the deleted probe's
  historical observations.
- I did not reconstruct measurements 13–16. Their exact historical values remain
  unverifiable, and this report does not silently convert source plausibility into
  confirmation.
- Current-head run `32077660290` was still in progress when last read. Its
  existence and already-completed work are enough to contradict claim 7; no
  conclusion here depends on its final status.
- MemPalace was unavailable by commission. Drawer-only owner/rule claims are not
  accepted or attacked. No memory was written.
- No PR, branch, review state, issue, source, test, baseline manifest, `[STATE]`,
  UAT score, or Home Assistant state was changed. This audit document is the only
  repository write.

## MemPalace drawer candidates

These are candidates only. They have not been filed and should not become rules
until independently reviewed.

1. **A promised recurring mechanical check needs a persisted executable artifact
   or named reproducible command.** A manual diff that catches one defect is
   evidence for that episode, not an enforcement mechanism for future revisions.
2. **Red against the current defect and mutation completeness are separate test
   obligations.** A guard that cannot fail current broken code can still be
   essential when it rejects a distinct plausible wrong repair; preserve both
   polarities explicitly.
3. **Audit prompts written by the audited agent need an internal-consistency pass.**
   Check claimed temporary files against “nothing ever changed,” amended commits
   against “no rewrite,” and pushed-document side effects against “no CI spent.”
