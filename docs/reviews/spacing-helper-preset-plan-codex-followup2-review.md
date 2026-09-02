Author and repair author: Claude Opus 5 (interested party)
Reviewer: OpenAI Codex / GPT-5.6 Sol (same reviewer as rounds 1 and 2)
Owner gate: micah / BaggyG-AU; this review decides nothing on its own
Reviewed head: `40b255645db6e3a4e5050e8b9508441ef1a215dd`

# Scoped follow-up 2 review — spacing-helper preset plan, revision 3

## Verdict

**SEV-1-BLOCKED.** The replacement option-D authority is materially better
grounded than the falsified id link, and I found no source-backed path by which
its ordinary steady-state flow can silently report the requested value after
selecting a foreign option. The revision is nevertheless not ready to implement:
SP-7's false TOCTOU mechanism still survives as live prose in two of the exact
surfaces the prior review required the author to sweep, and the mandatory
companion still cannot instantiate its P4-only control while simultaneously
claiming that every leg runs on both sides. Those are SP-11 and SP-12 below. No
implementation may begin from this revision.

## SP-7…SP-10 disposition

| Finding   | Disposition            | Follow-up result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SP-7**  | **PARTIALLY RESOLVED** | §2.3 now correctly deletes the ordinary-click TOCTOU account and leaves route (b)'s mechanism unknown. The deletion is not complete: §8 still says the Playwright TOCTOU race “survives” as an inferred claim, and §9 still says route (b) needs no force “because Playwright's hit-target check is TOCTOU” (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:1123-1130`, `:1202`). SP-11.                                                                                                                                                                                         |
| **SP-8**  | **PARTIALLY RESOLVED** | The repaired legs 2/3 construction now holds the capture listener for the whole helper call, counts both suppressed `mousedown` events, removes the listener in `finally`, and expects count 2 (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:892-906`). That control flow preserves the foreign-only state across both attempts if the still-open listener/interceptor question behaves as intended. The prior class sweep also required leg 5 to name its opening helper; revision 3 still contains that requirement as an instruction rather than an answer (`:878`). SP-12. |
| **SP-9**  | **RESOLVED**           | Leg 8 now names a test-side CSS-motion widening construction, an immediately-before state assertion, cleanup in `finally`, and one oracle: reopen and select successfully (`:912-920`). Leg 9 now has a separate one-shot capture suppression, a one-fire assertion, second-gesture success, and requested-control read-back (`:921-926`). I did not run either construction; this disposition is about whether the plan now specifies one constructible route and one falsifiable result for each. The wider every-leg/two-sided contradiction is new SP-12.                 |
| **SP-10** | **PARTIALLY RESOLVED** | Both waits inside `resolveOwnedDropdown` now receive `remaining()` (`:538-560`), so the omission SP-10 named is repaired. `Math.max(50, …)` nevertheless grants another 50 ms after the deadline has expired, so the claimed single hard 1500/5000 ms budget is still not literally what the code bounds. SP-14.                                                                                                                                                                                                                                                              |

## Confidence and method

**Confidence: high on SP-11 and SP-12; medium on SP-13's temporal-overlap
construction; high on SP-14.** I read the complete revision-3 plan, both prior
reviews, the current follow-up commission, the diff from round-2 review commit
`a8cba46` to the reviewed head, the current `SpacingDSL` and
`SpacingControls`, and the installed rc-select, rc-trigger, antd and Playwright
1.57.0 paths that bind the new claims.

I regenerated the branch, head, merge base, log, name-status diff, docs-only
check, worktree status, manifest populations, direct consumer enumeration, alias
searches and token inventory. They match the commission: branch
`feature/spacing-helper-preset-plan`, reviewed head `40b255645db6e3a4e5050e8b9508441ef1a215dd`,
base `main` = `08a9544643ef01aed843fa9babf1892291ed3e7f`, clean and docs-only; 7
`expectedFailures`, 10 `expectedFlaky`, 21 `expectedSkips`, with the spacing
identity on none; and the direct spacing-DSL consumer command returns only
`tests/e2e/spacing.spec.ts` and `tests/e2e/spacing.visual.spec.ts`.

I also read the recorded harness result in MemPalace drawer
`drawer_havdm_investigations_97218a6f74fbcb5c718ee50a` and the exact owner
exception in `drawer_havdm_decisions_12ca9d9672d4c827f60a4fcd`. The first records
the same id collision and M1–M4 values carried into §4.2. It is a record of the
run, not a retained raw transcript or executable probe.

## Evidence boundary

- I did **not** run the Electron app or recreate the deleted temporary probes.
  I can check M1–M4 against the retained measurement record and installed source;
  I cannot independently re-measure their runtime values.
- **M1:** the record contains the stated sixteen-combobox census and three-state
  sequence. Source supports the mechanism: `aria-expanded` is rendered from
  `open` (`node_modules/@rc-component/select/lib/SelectInput/Input.js:183-189`),
  and the same `mergedOpen` is supplied to the Select input and popup trigger
  (`node_modules/@rc-component/select/lib/BaseSelect/index.js:380-392`,
  `:492-497`). I did not observe the sixteen values myself.
- **M2:** the record contains the three singleton measurements. Source confirms
  that closed popup DOM is retained and receives the hidden class
  (`node_modules/@rc-component/trigger/lib/Popup/index.js:146-159`) and that antd
  makes that class `display: none`
  (`node_modules/antd/lib/select/style/dropdown.js:81-82`). I did not independently
  count live popups.
- **M3:** the record establishes that the tested pointer and keyboard sequences
  settled to one open Select. It does not establish the universal “not
  constructible”; the installed close path is deliberately delayed while open is
  immediate, which leaves a plausible transient-overlap construction. SP-13.
- **M4:** the retained record says the foreign-only query returned one Margin
  option. The current product source independently confirms identical labels in
  the two rendered sections (`src/components/SpacingControls.tsx:122-178`,
  `:228-229`), so the stated consequence follows from the recorded state. I did
  not execute the query.
- I did not execute legs 2–12, run unit/integration/e2e/CI, inspect raw CI
  artifacts, perform live Home Assistant work, or change any plan, source, test,
  snapshot or manifest file. This review adds only its own document.

## G2 — the replacement mechanism

### P2 and `isOpen`

At a stable rc-select render, option D's inference is sound: the same
`mergedOpen` drives both the requested input's `aria-expanded` and its trigger's
`visible` prop. A foreign Select therefore cannot make the requested input read
`"true"`. If the visible-popup population persistently has zero or more than
one member, `toHaveCount(1)` fails rather than choosing `.first()` or `.last()`.

The assertion is auto-retrying, however. A transient two-popup state does **not**
“break loudly” as §6 says at `:880`; it can wait until the count returns to one
and then pass. That is acceptable for the helper if the survivor is still the
requested Select's popup, but it means M3 and leg 7 must measure the temporal
state rather than infer it from the final count. SP-13 addresses the overclaim,
not a proved silent-selection defect.

`isOpen` itself cannot make a false `true` loud. Re-asking the round-2 question
against this helper found the same downstream containment: P2's count, the
scoped option count/visibility, the real click and P4 remain. A state change
between the P1 read and the dynamic global locator could make the helper act on a
different singleton, but I found no source-backed internal actor that produces
that change in the ordinary sequential call. If one did, P4 would detect the
requested control's unchanged value after the wrong click. That remains loud,
but it would violate the stronger prevention claim that the helper can never
operate an unrequested control; this is one of my weakest inferences, not a
blocking finding without a construction.

### Option D versus option B

**I would choose option B.** A class derived from `testIdPrefix` identifies the
popup by construction, removes the document-global singleton dependency and
avoids the temporal inference above for a very small product-code hook. The
installed antd type confirms `classNames.popup.root` is the current API and
`popupClassName` is deprecated (`node_modules/antd/lib/select/index.d.ts:38-60`).

That engineering preference does not make the owner's option-D ruling defective.
Within the present S1 scope, D's steady-state premise is source-backed, its
singleton is asserted, and P4 is a downstream detector. I therefore record the
trade as **JUDGEMENT / SEV 4**, not as a blocker or an attempt to review the
owner's authority above the binding cap.

## G3 — scope and regression

The new mechanism changes the authority, resolver and post-condition that the
falsification required. I found no revision-3 expansion into product code,
manifest state, snapshots, unrelated DSLs or public API. Deleting route (a) and
leg 1 reaches beyond replacement of the id mechanism, but it is separately
justified by M3; the problem is the strength of that factual claim, not hidden
scope. SP-13 asks that the claim and harness retain the temporal case rather than
reversing the owner's option-D ruling.

The clear under-reach is SP-7 deletion: revision 3 changed the main causal
section and added a later SP-7 row, but did not reconcile the live §8 and §9
statements. The other regression is internal to the harness contract (SP-12),
not an over-wide implementation change.

## G4 — previously clean areas

- **§5.1 blast radius:** PASS. The published command still returns the same two
  direct consumer files, and the alias/destructuring corroboration found no
  additional caller outside `tests/support/index.ts`.
- **§5.2 class statement:** PASS. It still defines the class behaviorally before
  publishing the `ant-select-dropdown` token search, and continues to separate
  shared construct from unproved shared cause (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:735-789`).
- **P1–P4:** PRESENT. P1 uses the requested combobox, P2 asserts the singleton
  then scopes the option locator, P3 uses normal Playwright click, and P4 reads
  back the requested control (`:516-623`). SP-12 is about proving P4's independent
  liveness, not its presence.
- **`.ant-select-content-value`:** PASS from installed source. It is the
  single-value label node (`node_modules/@rc-component/select/lib/SelectInput/Content/SingleContent.js:50-92`);
  its parent also holds the placeholder and input.
- **Escape removal and no-force/no-evaluate guard rails:** PASS. None was
  restored in the proposed path (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:641-652`).

## G5 — route (b) without a mechanism

**The helper hardening remains justified, but the claim that it explains the CI
flake remains unverified.** M4 constructs a harmful state in which the current
helper silently selects the foreign option, and route (c) supplies a
source-consistent way to reach the same state. That is enough to justify making
the shared helper reject the state without inventing route (b)'s “how”. It is not
enough to say the actual runner uses route (b), or that this change alone must
eliminate every future occurrence of the original identity. The plan correctly
keeps the real CI route unresolved at `:340-342`; repeat/CI evidence must decide
the outcome later.

## Claim ledger

| Load-bearing claim                                                                                         | Tag                                                  | Evidence and result                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reviewed state matches the commission and is docs-only.                                                | **MEASURED**                                         | Branch/head/base/status/diff and manifest populations regenerated; confirmed.                                                                                               |
| SP-7's false mechanism was deleted everywhere the prior review swept.                                      | **MEASURED — CONTRADICTED**                          | Live TOCTOU assertions remain at plan `:1123-1130` and `:1202`; SP-11.                                                                                                      |
| Whole-call suppression can keep the foreign-only state across the repaired helper's two attempts.          | **MEASURED-from-control-flow / INFERRED-at-runtime** | The plan now retains the capture listener through the call and requires count 2 (`:892-906`). Playwright/test-listener interaction was not run and remains explicitly open. |
| Legs 8 and 9 each have a construction and one oracle.                                                      | **MEASURED-from-text**                               | Confirmed at plan `:912-926`; runtime success not checked.                                                                                                                  |
| Every harness leg runs on both current/guard-removed and repaired variants.                                | **MEASURED — CONTRADICTED**                          | Plan `:862-866` says every; rows 3, 5, 8 and 9 say `n/a` (`:872-882`).                                                                                                      |
| Leg 5 independently proves P4 can detect a wrong-control click.                                            | **MEASURED — NOT SPECIFIED**                         | The row still says to state the opening helper but supplies none (`:878`); leg 6 exercises option absence, not P4.                                                          |
| Every resolver wait receives the remaining shared duration.                                                | **MEASURED**                                         | Both P1 and P2 waits call `remaining()` (`:543-560`).                                                                                                                       |
| The resolver cannot outlive the stated shared deadline.                                                    | **MEASURED — CONTRADICTED**                          | `Math.max(50, …)` grants time after expiry (`:538-560`); SP-14.                                                                                                             |
| At a stable render, requested `aria-expanded=true` and one visible popup imply the singleton is requested. | **MEASURED-from-source / INFERRED**                  | Input and trigger share `mergedOpen`; no ordinary internal counterexample found. Temporal replacement was not exercised.                                                    |
| Two visible Select popups are not constructible.                                                           | **INFERRED — NOT VERIFIED**                          | The retained record covers two gestures in one flow; delayed close plus immediate open makes transient overlap plausible; SP-13.                                            |
| P4 would make a residual wrong-control selection loud.                                                     | **INFERRED-from-source**                             | It reads the requested root's value node after the click; the required guard-removed liveness leg is not yet constructible.                                                 |
| The direct spacing-DSL consumer population remains two files.                                              | **MEASURED with lexical boundary**                   | Published command reproduced; independent alias/destructuring searches found no third caller.                                                                               |
| Option B is the more durable identity mechanism.                                                           | **JUDGEMENT**                                        | Construction removes D's singleton inference at the cost of a small `src/` hook; owner ruled D.                                                                             |

**Weakest claims in this review:** I did not measure whether rc-select's delayed
close actually commits a frame with two Playwright-visible popups; I did not run
the capture-listener construction against Playwright's interceptor; and my
clearance of option D against silent success assumes no external actor replaces
the singleton between P1/P2 and the option query. Those are respectively
INFERRED, NOT RUN, and INFERRED. SP-13 keeps the first in the harness instead of
calling it impossible; SP-12 prevents the missing P4 liveness proof from being
mistaken for clearance of the third.

## Findings

### SP-11 — SEV 1 — SP-7's deleted mechanism remains live in the exact swept surfaces

**Three-part blocking proof.** (1) The broken claim and owner decision are that
route (b)'s mechanism is deleted completely, no third mechanism is offered, and
SP-7 is “RESOLVED BY DELETION”
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:7-14`, `:309-330`, `:1219`). The
owner's narrow-then-build ruling likewise says to delete it entirely and not
invent another mechanism. (2) The plan still says that “what survives” is the
Playwright time-of-check/time-of-use dispatch race and calls it inferred at
`:1123-1130`; its SP-2 row still says route (b) needs no force “because
Playwright's hit-target check is TOCTOU” at `:1202`. Playwright 1.57.0 instead
installs the event-time interceptor before dispatch, returns a mismatch and
retries it (`node_modules/playwright-core/lib/server/dom.js:360-401`,
`:435-441`). (3) No mitigation covers a false causal record. §2.3 and the later
SP-7 row are correct, but they directly contradict rather than supersede the live
§8 and §9 statements; labeling the first as a weakest claim makes it more, not
less, current.

**Concrete fix.** Delete the live TOCTOU residue at `:1123-1130`. Rewrite the
historical SP-2 row so it records that revision 2's replacement explanation was
later refuted by SP-7, or strike the false sentence and point to the SP-7 row.
Then re-run the exact five-site sweep named by SP-7: §2.3, §6's honesty limit,
§8, §9 and §10/SR-5.

**What must not change.** Keep route (b)'s mechanism unknown, route (c), the
measured foreign-only state, the owner-selected retry, P1–P4, and the bans on
force and DOM `evaluate(...click())`.

**Class swept.** I searched every statement that explains how route (b) reaches
the foreign-only state, then read the five named surfaces end to end. The two
live survivors above are the defects; §2.3, §6's state-not-route wording, the
SP-7 row and SR-5 otherwise carry the retraction.

### SP-12 — SEV 1 — the mandatory companion still cannot prove P4 independently

**Three-part blocking proof.** (1) The broken decision is the mandatory
companion's promise that every leg is bidirectional and runs against both the
current/guard-removed and repaired helper
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:835-843`, `:862-866`), together with
the load-bearing claim that leg 5 proves P4 independently (`:373-380`, `:878`).
(2) Rows 3, 5, 8 and 9 have `n/a` on one side at `:872-882`, and leg 5 still says
“State which opening helper the guard-removed variant uses” rather than naming
one at `:878`. In the proposed implementation `selectOptionByText` gets its
dropdown only from `openSelectDropdown`, which itself implements P1/P2
(`:538-600`); “P1 and P2 removed” therefore does not identify an executable
variant or a popup locator. (3) No other leg proves the missing property. Legs 2
and 3 exercise ownership versus scope; leg 6 proves the option-count failure is
live; an ordinary P4 green cannot show that P4 would fail on the old wrong-control
state.

This blocks because P4 is the stated independent detector that makes option D's
inferred ownership acceptable. A detector with no constructible known-bad
control is not evidence for that mitigation.

**Concrete fix.** Define leg 5's exact opener and code shape—for example, retain
the current document-global opener/visible-popup return for this guard-removed
variant, append only the proposed P4 read-back, and run it against freshly
asserted leg-2 state. Then either (A) provide both named variants and outcomes for
every row, including 3/8/9, or (B) narrow the universal honestly: identify which
legs are fail-old/pass-new controls, which are guard-removal controls, and which
are one-sided characterisation. Keep one deterministic oracle per invocation.

**What must not change.** Keep P4, real pointer gestures, the known-bad leg 6,
fresh state per leg, listener/style cleanup, and the repaired constructions and
oracles for legs 8 and 9.

**Class swept.** I checked every numbered harness row for (a) a constructible
starting state, (b) a named implementation variant, (c) one expected result per
invocation, and (d) whether it satisfies the global two-run claim. Legs 2, 4, 6
and 7 name both sides; leg 3 is a guard-only discriminator; leg 5 lacks its
opener; legs 8 and 9 are valid one-sided characterisation as written but
contradict the universal. Leg 1 is separately covered by SP-13.

### SP-13 — SEV 2 — one settled sequence cannot support “two popups are not constructible”

The plan promotes two observed interactions into the universal M3, deletes route
(a) and leg 1 on that basis, and says a two-visible state in leg 7 would break
loudly (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:299-307`, `:414-417`,
`:868-880`, `:1163-1166`). The retained record proves the pointer and keyboard
flows **settled** to one popup. Installed rc-select source exposes a temporal case
the record did not sample: an outside `mousedown` asks the old Select to close
(`node_modules/@rc-component/select/lib/hooks/useSelectTriggerControl.js:28-33`),
but `useOpen` applies close on a later MessageChannel task while applying open
immediately (`node_modules/@rc-component/select/lib/hooks/useOpen.js:33-35`,
`:57-80`). Opening the requested Select while a foreign one is open can therefore
plausibly overlap their open states before the delayed close commits. Whether
both popup boxes become Playwright-visible in that interval is **INFERRED, not
measured**, so this is SEV 2 rather than a blocking factual contradiction.

**Owner Decision Brief.** (1) **What this protects in product terms:** only the
test alarm's proof coverage; shipped product behavior is unchanged. (2) **What is
going wrong plainly:** a final-state observation is being used to declare a
short-lived state impossible, even though the installed library deliberately
closes later than it opens. (3) **Is the product affected? No. Evidence status:
MEASURED-from-source / INFERRED-at-runtime.** The scheduling asymmetry is source;
the two-visible frame is not observed. (4) **Options and costs:** A, soften M3 to
“not retained after the two measured interactions” and make leg 7 sample the
popup count/identities immediately after the opening `mousedown`; tiny harness
cost. B, restore leg 1 as a dedicated temporal-overlap probe; more harness code,
clearest record. C, keep the deletion after running and recording a probe that
attacks the delayed-close window; cheapest prose if it genuinely refutes the
construction. (5) **Recommendation: A**, because leg 7 already owns this
interaction and option D's `toHaveCount(1)` is designed to wait through a
transient overlap. Record the maximum count and which Selects read expanded,
then distinguish transient overlap from persistent singleton failure. (6) **If
you do nothing:** the implementation may still be safe, but the plan will retain
an unverified universal and the harness can silently miss the temporal state at
the centre of its global-singleton inference.

**Class swept.** I checked every revision-3 use of “singleton,” “two popups,”
route (a), deleted leg 1 and leg 7. M2 is a recorded steady-state measurement;
M3 is the unsupported universal; P2 safely waits for eventual singleton but does
not itself prove no transient overlap.

### SP-14 — SEV 3 — the 50 ms floor is not one hard shared deadline

`remaining()` is `Math.max(50, budgetMs - elapsed)`
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:538-560`). If P1 consumes the whole
budget, P2 still receives 50 ms, so the resolver can outlive the deadline that
the comments, §8 and SP-10 disposition call a single shared budget (`:533-536`,
`:659-662`, `:1173-1175`, `:1222`). This is bounded and small, so it is SEV 3,
but SP-10 is not fully resolved as claimed.

Use an absolute deadline and fail before starting another wait once it has
expired; if Playwright requires a positive timeout, perform that explicit expiry
check and pass the positive remainder. I checked every wait inside the resolver:
P1 and P2 are both threaded correctly; the floor, not an omitted call site, is
the remaining defect.

## G6 — unpredicted interaction result

SP-12 is the closest analogue to round 2's SP-8: P4 is sound as a code idea and
the option-D inference is separately defensible, but their interaction makes the
P4-only control load-bearing at exactly the point where its opener is undefined.
SP-13 is the new mechanism's temporal interaction: rc-select's delayed close and
immediate open sit underneath a steady-state singleton measurement.

## MemPalace drawer candidates

**Candidate — wing `havdm`, room `review`, `added_by="codex"`:**

> [REVIEW] The same-reviewer STRAT-D7 follow-up 2 of
> `docs/testing/SPACING_HELPER_PRESET_PLAN.md` revision 3 at reviewed head
> `40b255645db6e3a4e5050e8b9508441ef1a215dd` returned SEV-1-BLOCKED. SP-7 is
> partially resolved because its false Playwright TOCTOU mechanism remains live
> in §8 and §9; SP-8 is partially resolved because whole-call suppression is
> repaired but the swept P4-only leg still lacks its opener; SP-9's named leg-8/9
> construction/oracle defects are resolved; SP-10 is partially resolved because
> both waits receive `remaining()` but its 50 ms floor exceeds the claimed hard
> deadline. New findings: SP-11 (SEV 1), incomplete deletion of the false route-(b)
> mechanism; SP-12 (SEV 1), the mandatory companion contradicts its every-leg
> two-sided promise and cannot instantiate the load-bearing P4-only control;
> SP-13 (SEV 2), one settled pointer/keyboard sequence does not establish that a
> two-popup temporal state is unconstructible, especially because rc-select
> delays close but applies open immediately; SP-14 (SEV 3), the `remaining()`
> floor grants time after the shared deadline. Option D has no separately proved
> silent-success path at the static evidence boundary, though option B remains
> the reviewer's SEV-4 engineering preference. No app or suite was run. Review
> artifact: `docs/reviews/spacing-helper-preset-plan-codex-followup2-review.md`.
