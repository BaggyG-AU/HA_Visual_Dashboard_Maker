# HAVDM plan review — PR #144 settle-helper contract, revision 3 (OpenAI Codex GPT-5)

**Reviewer:** OpenAI Codex (GPT-5), independent plan reviewer, 2026-08-17

**Artifact reviewed:** `docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md` revision 3
at `b3dc2e5`; no implementation exists for this plan.

**Scope:** `main..HEAD` (`ae4cbdf3..b3dc2e5`). Local `HEAD`, the remote feature
head, and PR #144's hosted head all resolved to
`b3dc2e507394ec678c1579536abf60d55cb028cf`. The merge base and hosted base both
resolved to `ae4cbdf3d3fc36825061175349f83b4816b35a57`. The output of
`git diff f78af0d..HEAD --name-only` was exactly the round-4 implementation
review, the revision-1 and revision-2 plan reviews, and the revised plan. No
source or test file has changed since `f78af0d`.

## 1. Verdict

**CHANGES-REQUIRED**

Revision 3 correctly deletes tier 3, keeps unknown properties fail-closed,
carries the owner's `clip-path` reversal, corrects Control 11's mutation table,
and narrows the rAF claim to this helper's authorities. Those are substantial
repairs, and none should be reversed.

The new runtime precondition is not yet sound. `getRootNode() === document` does
not detect a light-DOM grid rendered through a shadow-root slot, so the proposed
check admits the exact open-shadow counterexample it is meant to refuse. The
same proposal leaves “expected kind” undefined and can reject a legitimate RGL
grid merely because some ancestor is flex. Its control plan can be repaired
without a test-only table seam: a live `visibility` transition on a measured
card in the real RGL fixture is red against `f78af0d` and exercises the production
classifier directly.

The matrix also omits load-bearing numbers and assertions for Controls 9, 11,
and 12 and for two pins. The rAF magnitude is independent of card size, but not
of elapsed sample gaps; one local 145 ms observation does not make it
structurally portable to a loaded CI scheduler. Finally, revision 3 accidentally
deletes the explicit claim-surface proposal that revision 2 had resolved. Part
1 still promises a four-surface sweep, but Part 2 now instructs the implementer
to rewrite only the helper docblock.

## 2. Findings, most severe first

### M1 — merge-blocking: proposal (g) neither detects the open slotted route nor defines a safe refusal boundary

**Source.** Proposal (g) equates light DOM with
`getRootNode() === document`, leaves the element requirement as “of the expected
kind”, and refuses a grid “inside a table/flex formatting context” at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:232-242`. Pin 1 then leaves the
ordinary slotted construction's polarity undecided at `:260-265`. The current
helper obtains the first `.react-grid-layout` and its direct grid items without
any structural gate at `tests/support/dsl/canvas.ts:343-350,417-436`.

The proposed root check does not establish the property claimed. In standalone
headless Chromium 143, I constructed an open shadow root containing an animated
wrapper and a `<slot>`, with a light-DOM wrapper containing the grid and item
assigned to that slot. Both measured elements reported
`getRootNode() === document`; the grid's `assignedSlot` was `null` because its
ordinary parent was the slotted node, while that parent exposed the slot.
`document.getAnimations()` reported zero and the retained open shadow root
reported the live animation. A composed-ancestor walk that follows
`assignedSlot` from every ordinary ancestor can detect and refuse this open
route. The same construction under a closed shadow root hid the assigned slot,
`host.shadowRoot`, and the animation from document authority while the retained
closed root still reported it. That is the genuine residual.

The formatting-context condition creates a second defect class. “Inside flex”
is not a mechanically precise invariant: an ancestor with `display: flex` does
not imply that the grid itself participates as its flex item when block wrappers
intervene. The real split-view surface has a flex-column ancestor at
`src/components/SplitViewEditor.tsx:359-360` and embeds `GridCanvas` beneath
additional wrappers at `:484-521`; the populated RGL path is a div beneath a
block wrapper at `src/components/GridCanvas.tsx:453-489`. A scan of arbitrary
ancestors would therefore risk refusing a legitimate app RGL path. More
fundamentally, once `visibility` is removed from the non-geometric set, its
context no longer controls the safety decision: it fails closed in every
context. Table/flex exclusion needs a separately demonstrated RGL invariant, not
the contextual reason for proposal (b).

**Class and population swept.** The behavioural class is “selector-compatible
markup that proposal (g) either falsely admits or falsely refuses.” I classified
the actual populated RGL div path, the sections branch at
`src/components/GridCanvas.tsx:301-327` (not an RGL invocation), the split-view
RGL path, a same-document portal, a nested/ambiguous grid, an ordinary open slot,
and the corresponding closed-slot construction. I also checked all 12 current
call sites: the two Save calls and ten discriminator-file calls. They currently
use the real populated RGL fixture, but that does not define which future RGL
placements the public helper may reject.

**Required plan correction.** Define the exact structural invariant—at least the
actual `HTMLDivElement` RGL container and direct `HTMLDivElement` items rather
than “expected kind”—and define how multiple/nested grids are handled. Replace
the root-only light-DOM check with an ordinary/composed-ancestor walk that
follows exposed `assignedSlot` links and rejects the open-shadow route with a
named error. Remove the blanket table/flex-ancestor refusal unless a specific,
mechanically testable RGL assumption requires it; if one does, name the exact
participation relationship, not any distant ancestor. Make the open-slot case a
loud-refusal control. Retain a `KNOWN-OPEN:` pin for the otherwise identical
**closed-shadow** route, with a live mutation and forced endpoint proving the
residual.

**Must not change.** Do not remove or weaken the rename, restore advisory-only
preconditions, call `getRootNode()` a composed-tree authority, claim
`document.getAnimations()` is shadow-complete, reject the sections view for not
being RGL when this RGL-specific API should not be invoked there, or invert the
closed-shadow pin into a wished-for refusal.

### M2 — merge-blocking: the control/seam plan permits untested repairs and does not fully discriminate the promised branches

**Source.** Proposal (b) offers an internal classifier seam and then an explicit
fallback with no control at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:178-189`. The matrix at `:244-272`
specifies four controls and three pins. Control 9 asserts only a throw and a loose
wall bound despite proposal (c)'s named ancestor error at `:191-194`; Control 11
has no numeric shortened budget or wall bound; Control 12 has neither; and the
closed-shadow/`clip-path` pins do not carry the durations, budgets, liveness, or
endpoint magnitudes needed to establish that their mutations are live.

The table construction is evidence for why `visibility` cannot remain in a
universal harmless-property set, but it need not be the regression fixture.
Start a long `visibility` transition on a measured card in the admitted,
populated RGL fixture and assert its exact reported property and liveness. The
public helper under `f78af0d` ignores it and returns; the repaired helper blocks
and throws under an explicit shortened budget. That exercises the production
classifier and is red/green for removal of `visibility`, even if the card's
ordinary-div endpoint geometry is unchanged. If an internal seam is nevertheless
used, it is acceptable only when it is the single production-used predicate and
another public-path assertion proves the seam is wired into the helper. A
test-only duplicate classifier can drift, and the proposed “carry (b) with no
control” fallback is not acceptable.

Control 9 has a different false-green route. An implementation that omits the
ordinary-ancestor branch but generically waits until `timeoutMs: 1500` can still
throw before 2500 ms. The test must assert the ancestor-specific named error and
the offending element identity required by proposal (c), in addition to
animation liveness and the `y = 650` forced residual. The 2500 ms wall ceiling is
adequately above the observed 1515–1532 ms generic throw range, but timing alone
does not distinguish the named immediate branch.

Control 11's corrected mutation polarity is sound: it is red only against an
ignore-all-keyframes mutant, while Control 10 rejects the old
`computedOffset`-as-property code. Control 10's 1000 ms return ceiling is also a
reasonable margin over the enumerated 75–86 ms observations. No equivalent
numbers are selected for Controls 11 and 12. Pin 3 likewise says only “long” and
“shortened”; it must select an exact `clip-path` duration, helper budget, wall
ceiling, expected timeout error, liveness before/after, and unchanged four-axis
endpoint. The closed-shadow pin resulting from M1 needs the same treatment,
including a hostile scale magnitude derived from the actual grid's `y = 650`
axis. The matrix then contains five controls and three pins, not four plus three:
the new fifth control is open-slot refusal, and the first pin is its closed-slot
residual.

**Class and population swept.** The behavioural population is the four proposed
controls and three proposed pins, plus the open/closed split that proposal (g)
makes necessary. I counted each named guard against the wrong implementation it
must reject: ordinary-ancestor discovery, paint-only keyframe admission,
geometric-keyframe refusal, `visibility` removal, open-slot precondition
refusal, closed-shadow non-observability, rAF non-observability, and unknown
`clip-path` fail-closed behaviour. I also checked the two keyframe directions
against current lines `tests/support/dsl/canvas.ts:459-480`; the revised
Control-10/11 mutation table is correct.

**Required plan correction.** Replace the uncontrolled fallback with the public
real-RGL `visibility` control above, or fully specify a single-source production
classifier seam and its wiring proof. Add the named error/element assertion to
Control 9. Choose exact shortened budgets and wall bounds for Controls 11 and 12
and complete every row's authority, liveness, endpoint, and cleanup assertions.
Split open and closed shadow polarity as M1 requires, fully specify the
closed-shadow and `clip-path` pins, and update the control/pin count and Part 1
cost.

**Must not change.** Do not restore `visibility` to the non-geometric set, weaken
unknown-property fail-closed behaviour, drop the geometric keyframe direction,
claim Control 11 rejects old M3, accept a control that passes at the precondition
instead of its named guard, discard the correct `2000s`/`y = 650` ancestor
construction, or convert any `KNOWN-OPEN:` assertion to the desired future
behaviour.

### M3 — merge-blocking: “absolute” removes subject-size dependence, not scheduler dependence

**Source.** The plan calculates the rAF mutation as
`10 × 32 / 200000 = 0.0016 px` per sample and concludes that it ports
structurally at `docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:159-166`. It then
specifies the pin from one reported 145 ms return at `:143-147,266-269`. The
helper uses `setTimeout(gap)` at `tests/support/dsl/canvas.ts:489-490`; 32 ms is a
minimum scheduling delay, not an elapsed-time guarantee.

The proportional/absolute distinction is valid only for one dimension. A 10 px
absolute endpoint is independent of the card's width and height, unlike scale.
The rounded-key stability seen by the helper is still proportional to the
**actual elapsed gap**. At the stated velocity, hundredth-pixel bucket boundaries
are 200 ms apart; delayed samples, their starting alignment within a bucket, and
the need for three equal keys determine whether the helper returns. A loaded CI
event loop can therefore make the mutation more visible than the nominal 32 ms
calculation predicts. D's single enumerated corrected return shows that the
construction worked once on this fixture; it does not establish scheduler
portability.

**Class and population swept.** The behavioural class is “a hostile magnitude
claimed portable because one dependency was removed.” I checked the two
dimensions the plan names—subject size and elapsed time—and the additional
bucket-alignment and sample-streak dimensions used by the actual guard. The
`scale 2000s` control remains correctly fixture-derived. The rAF endpoint is
size-independent but still scheduler- and sampling-dependent; `clip-path` is a
timeout pin and does not depend on rounded movement magnitude in the same way.

**Required plan correction.** Withdraw the structural-portability claim and
design the rAF pin around a scheduler-robust hostile construction, or state its
remaining scheduling assumption and derive/test a bound for that assumption in
the actual CI fixture. Keep explicit loop liveness before and after, a bounded
helper return, cleanup, and a forced endpoint residual above ±2 px. One local
corrected observation may support feasibility but not a portable threshold.

**Must not change.** Do not drop the rAF `KNOWN-OPEN:` pin, increase the helper's
sample interval/count/timeout to conceal it, reduce the forced residual below
the caller's tolerance, or revive the incorrect claim that no system can observe
rAF motion.

### M4 — merge-blocking: revision 3 drops the binding claim-surface repair that Part 1 still promises

**Source.** Part 1 budgets “a documentation sweep across four surfaces” at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:79-94`, but Part 2 proposal (e) now
requires only the helper docblock rewrite at `:215-221`; proposal (h) immediately
ends at `:270-272`. Revision 2's explicit proposal (i)—the four classified
surfaces, labelled hand trace, live PR body rewrite, and
`bash tools/check-pr-evidence.sh 144`—has disappeared. This is not a wording-only
change: the last binding technical document no longer tells the implementer to
perform those deliverables.

The stale population still exists. The helper claims “STOPPED MOVING” at
`tests/support/dsl/canvas.ts:214-248`; the discriminator instructions claim the
grid “STOPPED MOVING” at
`tests/e2e/card-geometry-discriminators.spec.ts:1-14,125-153`; and the live PR
body still presents the superseded allowlist/acceptance account. The Save surface
at `tests/e2e/save-and-backup.spec.ts:186-212,253-265` accurately attributes the
wait to RGL reflow and needs only the method rename, so it remains a cleared
member of the hand trace. The revision-3 plan itself states the revised contract,
but naming a count in Part 1 does not bind any of the other implementation-time
updates.

**Class and population swept.** The class is “current text that teaches a reader
what the shared helper certifies,” not occurrences of its old name. I re-swept
the helper docblock, discriminator instructions and `makeDirty` explanation,
both Save explanations, the current plan, and the external live PR #144 body. I
excluded historical reviews and commit messages because they are evidence, not
current instructions; unrelated helpers using “stopped moving” are not members.
The live PR body is the canonical external ungated surface and cannot be cleared
by a repository grep.

**Required plan correction.** Restore an explicit proposal equivalent to
revision 2's (i): enumerate the four semantic surfaces; require a labelled hand
trace that records the Save text as checked and already accurate; rewrite the
helper and discriminator claims to the RGL-specific, partial contract; update
the live PR body; and run `bash tools/check-pr-evidence.sh 144` against that
updated body, resolving each candidate and recording the full final head SHA.
Update Part 1 if the corrected population/count differs. Part 1 and Part 2 must
name the same implementation deliverable.

**Must not change.** Do not rewrite historical reviews or commit messages, treat
a token search as a semantic proof, remove the accurate Save explanations,
carry acceptance from `f78af0d` across a future implementation SHA, or omit the
live PR body because it is outside the repository.

### M5 — plan accuracy: the measurement account has one arithmetic error and overstates C and D

**Source.** Measurement B reports nine budget/throw pairs and concludes that
overhead is 28–41 ms at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:129-133`. The listed 1500 ms run
that threw at 1515 ms makes the actual enumerated range **15–41 ms**. The matrix's
1515–1532 ms Control-9 subset at `:248` is accurate; only the aggregate range is
wrong.

Measurement C calls the app defect “CONFIRMED” while recording unexplained
1544/1540/983 ms variance and admitting that the probe discarded the error
message at `:135-141`. A throw with no retained identity cannot distinguish the
expected helper timeout from another rejection; the dead first D run immediately
demonstrates why attribution needs such a discriminator. C is consistent with
the known source defect and may motivate Control 10, but it is not independent
confirmation until the red leg retains the expected error and proves the
opacity animation was the blocking member.

The plan honestly identifies and discards D's contaminated first run at
`:150-157`; after C's animation was cancelled, `animationsSeen = 0` makes the
listed corrected D observation clean with respect to that contamination. A and
B preceded it and reproduced, so no other row is contaminated by the dead D
instrument. However, §2.6 calls A–D “three runs” at `:306-310`, while §2.2
enumerates three runs only for A and B and supplies one corrected D latency and
residual. The attached population does not support three corrected D runs. The
claim that every latency and magnitude is derived at `:16-22` is also premature
while Control 11, Control 12, the closed-shadow pin, and the `clip-path` pin lack
the numbers identified in M2.

Part 1 additionally says “`clip-path` appears nowhere in the app” at `:76-77`.
A source/test token sweep found no `clip-path`/`clipPath` literal, but that is not
a proof about runtime-injected styles. State the mechanically supported source
population instead of the universal app claim.

**Class and population swept.** I recomputed all nine B overheads, counted all 24
A samples, and checked every A–D repetition claim against the observations
printed in §2.2. I traced execution order for cross-row contamination: A and B
are reproduced before C, the first D is contaminated by C and discarded, and
the corrected D is after cancellation with the authority count back at zero. I
also swept every numeric matrix/pin row for an explicit mutation magnitude,
helper budget, wall bound, liveness assertion, and forced endpoint.

**Required plan correction.** Change B to 15–41 ms; label C “consistent with the
defect” rather than confirmed unless it is re-run with the exact error and
isolation evidence; report D as the number of corrected observations actually
enumerated (currently n=1); and restrict the three-run claim accordingly. Add
the missing matrix/pin numbers before repeating “every latency and magnitude.”
Replace the `clip-path` universal with the exact searched source population and
leave runtime-injected reachability unverified unless measured.

**Must not change.** Do not discard A/B's reproduced measurements, re-admit the
dead first D result, use C's variance as a latency bound, weaken Control 10's
required red leg, or present a deleted probe as independently rerunnable from
the repository.

## 3. Revision-2 finding dispositions

| Revision-2 finding                                       | Disposition            | Reason                                                                                                                                                                                   |
| -------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M1 — tier 3 is an unsound finite-stability inference** | **RESOLVED**           | Tier 3 is deleted, unknown/custom properties remain fail-closed, and the owner deliberately declares rather than repairs `clip-path`.                                                    |
| **M2 — narrowed contract remains advisory**              | **PARTIALLY RESOLVED** | A runtime invariant is now required, but its root test admits the open-slot counterexample and its formatting-context test is underdefined and overbroad (M1).                           |
| **M3 — control/pin matrix is incomplete**                | **PARTIALLY RESOLVED** | Control 10's bound and the Control-10/11 mutation directions are repaired. The seam fallback, branch discriminator, remaining bounds, shadow split, and rAF portability are not (M2–M3). |
| **M4 — claim accuracy/process**                          | **REGRESSED**          | The rAF wording and stale literal are corrected, but revision 3 deletes the explicit four-surface hand-trace/live-body proposal that made the process resolved (M4).                     |

The settled owner decisions remain accurately represented: full amended Option
A, no tier 3, `clip-path` declared rather than fixed, actual-target
seek/measure/restore deferred to its own plan, and Control 9's `2000s`/`y = 650`
construction retained.

## 4. Results of the seven commissioned attacks

### Attack 1 — runtime precondition — finding M1

`getRootNode() === document` proves ordinary tree ownership, not absence from a
shadow composed path. The open slotted route is detectable by walking ordinary
ancestors and exposed `assignedSlot` links; the equivalent closed-root route is
not. “Expected kind” must be made exact, and the table/flex condition currently
creates a false-refusal class. Sections is not an RGL caller; a same-document
portal need not be refused; nested grids need an explicit selection rule.

### Attack 2 — proposal (b)/(g) conflict — finding M2

I would accept a single extracted classifier used by production plus a proof
that the public helper calls it. I would prefer the simpler public real-RGL
`visibility` control described in M2. I would **not** accept the plan's fallback
of carrying proposal (b) with no fail-against-old control.

### Attack 3 — derived numbers and matrix — findings M2 and M5

Control 10's 1000 ms bound is reasonable, and Control 11's corrected mutation
table is right. Control 9's 1500/2500 ms budget/wall pair has ample observed
overhead margin but does not prove its named ancestor-error branch. Control 11,
Control 12, and two pins still lack exact numbers. B's aggregate overhead is
15–41 ms, not 28–41 ms.

### Attack 4 — proportional versus absolute — finding M3

Absolute travel removes fixture-size dependence; it does not remove
elapsed-gap, bucket-alignment, or scheduler dependence. Pin 2's one local
measurement is feasible evidence, not a structural portability proof.

### Attack 5 — three pins and pin 1 polarity — findings M1–M3

The open slotted case must become a loud-refusal control. The matching closed
slotted case remains the `KNOWN-OPEN:` pin and needs a derived mutation and
endpoint. The rAF pin has the correct current-behaviour polarity but an
under-justified CI magnitude. The `clip-path` pin correctly asserts the throw,
not a wished-for repair, but lacks exact duration, shortened budget, wall/error,
and liveness values. The resulting matrix is five controls plus three pins.

### Attack 6 — dead instrument and measurement isolation — finding M5

The first D result is correctly rejected, and its contamination does not reach A
or B. The corrected D authority count shows C's animation was cancelled. C's
discarded error and unexplained variance mean it is consistent evidence only,
and the plan does not enumerate three corrected D observations.

### Attack 7 — prior-review accuracy and Part 1/Part 2 — findings M4 and M5

The owner decisions, tier-3 refutation, keyframe direction, ancestor magnitude,
and rAF-authority wording are carried accurately. The new errors are the deleted
claim-surface deliverable, the measurement overclaims, and the mismatch between
Part 1's promised documentation sweep and Part 2's docblock-only instruction.

**Attacks that found nothing:** **none of the seven attacks was wholly clear.**
The cleared subparts are stated explicitly above: tier 3 remains deleted; the
owner's `clip-path` reversal is honoured; Control 9's hostile magnitude and wall
margin are sound; Control 10's bound is sound; Control 11's mutation table is
correct; pin 3 has the correct throw polarity; and no A/B/corrected-D
cross-contamination was found.

## 5. Evidence boundary

- I read the full revision-3 plan, both prior plan reviews, the round-4
  implementation review, the current helper, all eight committed controls, both
  Save call sites and explanations, and the live PR #144 body. I also inspected
  the actual populated/sections/split-view render paths relevant to proposal
  (g).
- I did not run a Playwright suite, `./tools/checks`, CI, Electron, an installer,
  a packaged acceptance pass, or Home Assistant. No unchanged green is presented
  as newly rerun.
- The only runtime attack was a standalone **headless Chromium** 143.0.7499.4
  construction. It compared open and closed shadow roots containing animated
  wrappers and slots, recording each measured node's root/slot exposure plus
  document- and shadow-root animation counts. No headful process or Electron
  window was launched.
- I did not rerun §2.2's deleted probe. Its A–D values were audited as reported,
  not independently reproduced. C's discarded error and D's unenumerated repeat
  count therefore remain within the stated evidence boundary.
- GitHub was read through the connected metadata surface and `gh`; no PR body,
  review state, issue, branch, or remote content was changed.
- The commission supplied all 14 practice rules. No MemPalace content was
  written, and no project decision was re-litigated.
- No test or source file was changed. This review document is the only repository
  write.

## MemPalace drawer candidates

**HOLD — do not file these candidates yet.** The corrected mechanism has not
survived independent review, so rule 14 still applies.

1. `getRootNode() === document` establishes a node's ordinary tree, not its
   rendered composed ancestry. A light-DOM node can be slotted beneath an open or
   closed shadow-tree wrapper; follow exposed assigned-slot links, then pin the
   closed-root remainder rather than calling the root check complete.
2. An absolute hostile mutation is independent of subject size but not
   automatically portable. Enumerate every load-bearing dimension—elapsed
   scheduler gaps, quantisation-bucket alignment, and streak length included—
   before calling its magnitude structural.
3. When a revision says a prior process finding is resolved, diff the binding
   deliverables as well as the prose. A summary can continue promising a sweep
   after the technical instruction that made it executable has been deleted.
