Author and repair author: Claude Opus 5 (interested party)
Reviewer: OpenAI Codex / GPT-5.6 Sol (same reviewer as round 1)
Owner gate: micah / BaggyG-AU; this review decides nothing on its own

# Scoped follow-up review — spacing-helper preset plan, revision 2

## Verdict

**SEV-1-BLOCKED.** Revision 2 removes the foreign-state-consuming pre-wait and
preserves the ownership design, but it replaces SP-2's false mechanism with a
second mechanism contradicted by the installed Playwright source, and its
mandatory harness still cannot produce three of its claimed observations as
written. No implementation may begin from this revision.

## SP-1…SP-6 resolution

| Finding | Resolution | Follow-up result |
| --- | --- | --- |
| **SP-1** | **PARTIALLY RESOLVED** | The document-global pre-wait is gone and the trailing global close wait is now scoped to the requested combobox. That restores foreign-popup composability in the proposed helper, including legs 1/2/5 in principle, and leg 7 targets the stable-foreign case. Leg 8, which SP-1 required if the wait was removed, still has neither a stable construction nor one falsifiable expected outcome (SP-9). |
| **SP-2** | **REGRESSED** | The original retry-to-force control-flow claim is fully retracted and the owner's bounded-retry ruling is represented. The replacement assertion that ordinary Playwright click has the claimed dispatch TOCTOU is contradicted by Playwright 1.57.0's event-time hit-target interceptor (SP-7); the retry-success leg is also only an outcome, not a construction (SP-9). |
| **SP-3** | **PARTIALLY RESOLVED** | `mousedown`, capture phase, explicit removal, and post-gesture evidence are the right repairs for the event mistake. The construction remains wrong after the simultaneous SP-2 repair: removing it after one event leaves the retained second attempt unsuppressed, so the repaired helper opens the requested popup instead of producing leg 2's expected ownership failure (SP-8). |
| **SP-4** | **RESOLVED** | §0 names all three owner decisions. §7.4 contains all six fields, preserves my literal-text reading that the slice lane is the most defensible reading, records the owner's fix-lane ruling, and explicitly says the ruling does not amend §3.7. |
| **SP-5** | **RESOLVED** | The inaccurate static approximation is gone; the regenerating command and its lexical blind spot are retained. |
| **SP-6** | **RESOLVED** | The sibling consequence is now expressed as a risk, not a prediction, and the tabs/popup sightings remain explicitly undiagnosed. |

## Scope and regression — F3/F4

**No issue found in the `Escape` removal.** A document-global `Escape` can close
unrelated UI and conflicts with the composability SP-1 protects. The revised
path instead uses the requested combobox's ownership link, a subtree option
search, a real click, and a requested-control read-back; removing the two global
key presses does not remove the loud failure paths.

RT-1's toggle hazard is real for an unconditional retry, and `ownsOpenPopup` is
a proportionate repair. `aria-controls` being non-empty can become stale after
the boolean read, but that does not silently select a foreign option: the owned
popup count, scoped option count/visibility, scoped close post-condition, and P4
read-back remain downstream. A false `true` can delay or loudly fail the call;
I found no path by which it silently reports the wrong requested value.

**No revision-2 regression was found in the previously cleared DOM chain,
blast-radius account, or P1–P4.** §4.2's authority chain and §5.1's two direct
consumers were not materially changed. P1 ownership, P2 subtree scope, P3 real
clicks, and P4 requested-control read-back all remain present. The regression
is the new interaction between the retained retry and the repaired harness
construction, not expansion into product code, snapshots, or the manifest.

## Confidence and method

**Confidence: high on SP-7 and SP-8; high that legs 8/9 are incomplete as
specified; medium on the best stable construction for leg 8.** I reviewed the
diff from round-1 review commit `6694a61ff32f79d260f0085bf1973233bd84c005`
through reviewed head `f2b0ed5a2676d17a6bb9d7965b1a542cbbeb5aa6`, and
read the complete revised plan and follow-up commission.

I regenerated the branch log, name-status diff, docs-only check, and manifest
cardinalities. They matched the commission: branch
`feature/spacing-helper-preset-plan`, base `main` = `08a9544`, docs only, no
spacing identity in the manifest, and 7 expected failures / 10 expected flaky /
21 expected skips.

I re-traced the proposed helper, the current helper, rc-select's `mousedown`
binding and open-only `aria-controls`, Playwright 1.57.0's ordinary-click server
path and injected hit-target interceptor, and Playwright's `toHaveAttribute`
matcher. I also swept every revised causal statement and every harness leg that
depends on click suppression or retry. I ran no Electron, integration, unit, or
CI suite: this remains a plan-only branch with no implementation to exercise.

## Evidence boundary

- I did not observe the DOM chain, motion classes, or timing in the Electron
  app. Leg 0 remains the correct runtime falsifier for the library-source DOM
  account.
- I did not reproduce routes (a), (b), or (c), and I do not identify the real CI
  route. SP-7 decides only that the newly asserted ordinary-click mechanism is
  not the mechanism Playwright 1.57.0 implements.
- I did not build the temporary harness. SP-8 is decided from the proposed
  helper's two-attempt control flow and the plan's explicit one-event removal;
  SP-9 concerns missing construction/oracle text, not a failed runtime attack.
- I did not re-open the settled direct-consumer or broad sibling populations;
  I checked only that revision 2 did not disturb their cleared claims.
- I did no live-HA work, made no `[STATE]` or UAT update, and changed no plan,
  source, test, snapshot, or manifest file.

## Claim ledger

| Load-bearing claim | Tag | Evidence and result |
| --- | --- | --- |
| The reviewed branch is plan-only and docs-only at the pinned head. | **MEASURED** | Branch/diff tripwire regenerated; confirmed. |
| Revision 2 correctly retracts the old retry-to-force TypeScript flow. | **MEASURED** | Plan `:297-307` matches `tests/support/dsl/spacing.ts:37-49`; confirmed. |
| An ordinary Playwright click can resolve after being delivered to a different element solely because the target moved between the preliminary check and dispatch. | **MEASURED — CONTRADICTED** | Playwright installs a Window-capture hit-target interceptor before the action, checks the trusted pointer event's actual target, blocks a mismatch, returns it, and retries it; see SP-7. |
| Ownership rather than document-global popup resemblance is still the safer helper authority. | **JUDGEMENT** | Sound independently of the false route-(b) mechanism: the known foreign-only state and route (c) remain, while ownership turns them loud. Runtime DOM authority remains conditional on leg 0. |
| The revised helper retains exactly two ownership-gated normal attempts. | **MEASURED** | Plan `:566-585`; confirmed. |
| A one-shot `mousedown` suppression keeps the requested popup closed for repaired leg 2. | **MEASURED — CONTRADICTED** | The listener is removed on attempt 0; attempt 1 sees no ownership and clicks normally, so it opens the requested popup. |
| `ownsOpenPopup` prevents an unconditional retry from toggling an open Select shut. | **MEASURED / INFERRED** | The control-flow hazard follows from plan `:569-582` and rc-select `SelectInput/index.js:117-145`; the exact slow-open state has not been run. |
| A false `true` from `ownsOpenPopup` can silently set the wrong control. | **INFERRED — NOT FOUND** | Downstream ownership count, scoped option assertions, real click, close post-condition, and P4 remain loud guards. A delay/failure is possible; silent foreign selection is not established. |
| `not.toHaveAttribute('aria-controls', /./)` passes when the attribute is absent. | **MEASURED-from-source** | Playwright's matcher sends a negated `to.have.attribute.value`; the injected matcher returns `matches: false` for `getAttribute(...) === null`, which negation accepts. |
| The first retry attempt has a 1500 ms end-to-end budget. | **MEASURED — CONTRADICTED** | Only the `aria-controls` poll receives `opts.timeout`; the owned-popup `toHaveCount(1)` uses the ambient expect timeout (SP-10). |
| New legs 8 and 9 are runnable and bidirectional. | **MEASURED — CONTRADICTED AS WRITTEN** | Leg 8 has no stable construction and accepts two opposite outcomes; leg 9 names an outcome and §8 explicitly says no mechanism is specified. |
| §7.4 faithfully preserves the reviewer's contrary governance reading. | **MEASURED** | The six-field brief states that the literal text favours slice lane and that option B is most defensible against the words, then separately records the owner's A ruling. |

**Weakest claims in this review:** I have not run the suggested motion-extension
construction for leg 8; I infer from the DOM event model rather than an Electron
probe that target-capture `stopPropagation()` prevents rc-select's delegated
React `onMouseDown`; and although the installed interceptor directly contradicts
the route-(b) story as written, I do not claim that every conceivable
post-`pointerdown` layout mutation is impossible.

## Findings

### SP-7 — SEV 1 — the replacement Playwright dispatch mechanism is demonstrably false

**Three-part blocking proof.** (1) The broken claim is revision 2's corrected
causal account: it says an ordinary, actionability-checked click can resolve
after being delivered to whatever moved under the coordinates between the
hit-target check and dispatch, making route (b) “MORE reachable” and supporting
the declaration that SP-2 is resolved
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:309-318`, repeated at `:1162-1169`
and `:1234`). (2) The installed dependency is Playwright 1.57.0
(`node_modules/playwright-core/package.json:1-4`) and implements the opposite.
Before the mouse action it installs `setupHitTargetInterceptor`
(`node_modules/playwright-core/lib/server/dom.js:364-380`); after dispatch it
reads that interceptor's result and returns any mismatch (`:388-401`), which the
outer action loop retries (`:295-297`). The injected interceptor listens at
Window capture for trusted pointer/mouse events, checks the event-time hit target,
and prevents/stops mismatches; its own source says this closes layout-shift races
(`node_modules/playwright-core/lib/generated/injectedScriptSource.js:24`). Normal
`locator.click()` enables that path (`node_modules/playwright-core/lib/server/dom.js:435-441`).
(3) Calling the claim **INFERRED** and saying no leg decides it are disclosures,
not mitigation for source that contradicts it. Legs 2/3 reproduce a foreign-only
state and P1 protects the implementation from that state, but neither establishes
route (b)'s asserted cause or repairs the plan's causal record.

**Concrete fix.** Delete the ordinary-click TOCTOU mechanism everywhere. Leave
route (b) explicitly unexplained/unproven or remove it from the reachable-route
list unless another source-backed mechanism is found. Keep the owner's bounded,
ownership-gated retry ruling: ownership is still justified by the foreign-only
state and route (c), without claiming how CI reached that state.

**What must NOT change.** Do not restore `force: true`, the DOM
`evaluate(...click())`, or a global popup authority. Keep P1–P4 and the honest
statement that the actual CI route is unresolved.

**Class swept.** I checked every revision-2 statement about the replacement
dispatch mechanism: §2.3, §6's honesty limit, §8's weak-claim entry, §9's SP-2
disposition, and §10's retained SR-5 record. I also traced both ordinary and
forced Playwright click paths; the event-time interceptor applies to the ordinary
path at issue and is deliberately skipped by force, which the repair still
removes.

### SP-8 — SEV 1 — the one-shot legs 2/3 suppression is consumed before the retained retry

**Three-part blocking proof.** (1) Legs 2 and 3 are the plan's load-bearing
state discriminator. Repaired leg 2 must keep only the foreign popup open until
the helper fails on ownership, while leg 3 must show that a scope-only variant
silently selects from that foreign popup
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:896-916`). (2) The construction
stops exactly one `mousedown` and removes itself in that same call (`:953-970`),
but the repaired helper performs up to two attempts (`:566-585`). After the
first suppressed click, `aria-controls` stays absent and the 1500 ms poll fails;
on attempt 1 `ownsOpenPopup` is still false, the listener is gone, and the normal
click opens the requested padding popup. The repaired leg therefore proceeds on
the owned popup instead of producing its stated ownership failure. (3) The
post-gesture assertions do not mitigate this; they establish attempt 0 only,
and the required proof that the listener is gone guarantees attempt 1 is
unsuppressed. No other leg holds the foreign-only state across both repaired
attempts.

**Concrete fix.** Give legs 2/3 a listener whose lifetime is the whole helper
call, count every suppressed `mousedown`, and remove it in `finally`. Run each
variant from freshly established state: the current/scope-only helper may return
after the first suppressed gesture because it accepts the foreign popup; the
repaired helper must have both gestures suppressed and fail its second ownership
resolution. Record the suppression count, both pointer-action completions, the
requested combobox's absent `aria-controls`, and the still-visible foreign popup.
Reserve a separate one-shot construction for leg 9, where the second click is
supposed to open the requested popup.

**What must NOT change.** Do not remove the owner-selected retry to make the old
probe fit. Do not use force, patch product code, or let the suppression leak into
another leg.

**Class swept.** I checked all legs whose result depends on suppressed opening
or retry: legs 2, 3, 5, and 9. Legs 2/3 require suppression through the complete
repaired call; leg 5's guard-removed variant must state which opening helper it
uses; leg 9 intentionally requires one-shot suppression. Legs 1, 4, 6, 7, and 8
do not share this event-suppression mechanism.

### SP-9 — SEV 1 — mandatory legs 8 and 9 are not executable, falsifiable specifications

**Three-part blocking proof.** (1) The broken decision is the mandatory
companion promise that every leg is runnable and bidirectional, plus the SP-1
and SP-2 dispositions that rely on new legs 8 and 9 to prove the repaired
mid-leave and retry contracts (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:857-864`,
`:890-906`, `:1233-1234`). (2) Leg 8 supplies no way to enter its short-lived
state and accepts either “re-open cleanly” or “fail with its own message” at
`:905`; those opposite results are not one deterministic oracle. Leg 9 says only
to make the first click fail and the second succeed at `:906`, while the plan
itself admits at `:1203-1213` that leg 8 may not be stably constructible and leg
9 has no mechanism. (3) No recorded mitigation covers either gap. Leg 0 can
observe DOM shape but does not stabilise a leave transition, and leg 2's
foreign-popup failure is not the owner-selected retry-success path.

**Concrete fix.** For leg 8, specify a test-only synchronisation method that
widens the actual CSS leave duration without patching `src/`, initiate close,
and assert immediately before invoking the helper that the requested
combobox's `aria-controls` is absent while its owned popup is still visible.
Choose one expected contract and repeat it; the recommended contract is that
the helper reopens and selects successfully. Remove the style override in
`finally`. For leg 9, start clean, attach a one-shot capture `mousedown`
suppression to the requested root, record that it fired once and removed itself,
then assert the helper succeeds only after the second gesture and that the
requested control shows the selected value. Record timing as characterisation,
not as proof that a particular delay is correct.

**What must NOT change.** Keep both hostile cases, real Playwright gestures,
P1–P4, headless execution, and the known-bad leg 6. Do not accept “either pass or
fail” as a deterministic result and do not patch timers or product source.

**Class swept.** I checked all newly added legs 7–9 for a constructible starting
state, an observable transition, and a single falsifiable oracle. Leg 7 has all
three. Leg 8 lacks a stable transition construction and one oracle; leg 9 lacks
the transition construction. SP-8 separately covers the revised construction
shared by older legs 2/3.

### SP-10 — SEV 2 — the advertised short first-attempt budget does not bound the whole resolver

The helper says the first attempt gets 1500 ms so a missed click is retried
quickly (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:530-539`, `:670-684`). That
timeout is passed only to the `aria-controls` poll. Once the attribute appears,
the owned-popup `toHaveCount(1)` at `:541-546` uses the ambient expect timeout;
if the ownership node is absent or duplicated, the first attempt is no longer a
1500 ms attempt. The plan's source comments and wall-time claim overstate what
the code bounds.

**Owner Decision Brief.** (1) **What this protects in product terms:** quick,
diagnosable test recovery without adding unexplained multi-second stalls. (2)
**What is going wrong plainly:** the “short try” clock stops applying halfway
through finding the popup, so an awkward partial-open state can wait on a second,
longer clock before retrying. (3) **Is the product affected? No. Evidence status:
MEASURED** from the proposed helper; this is test runtime and diagnostics only.
(4) **Options and costs:** A, carry one remaining-time deadline through both the
attribute poll and popup-count assertion; small code cost and the stated budget
becomes true. B, deliberately give popup resolution a separate full budget;
more tolerance, but document and measure the larger worst case instead of
calling the attempt 1500 ms. (5) **Recommendation: A**, then use legs 4/9 to
characterise whether 1500 ms itself is comfortable before freezing the number.
(6) **If you do nothing:** normal opens may remain fast, but partial ownership
states can wait materially longer than the plan tells the owner and the retry
probe will not measure the full worst case.

**Concrete fix.** Pass a shared deadline (or the remaining duration) to every
wait inside `resolveOwnedDropdown`, or rewrite the prose and harness to state
and measure two staged budgets. Do not choose 1500 ms from source reasoning
alone; record the leg 4/9 distributions first.

**What must NOT change.** Keep the retry bounded, ownership-gated, and limited
to normal actionability-checked clicks. This finding does not reopen the owner's
decision to retain it.

**Class swept.** I checked every wait on the retry path: initial select
visibility, `aria-controls` polling, owned-popup count, option count/visibility,
and the close post-condition. Only the poll receives the per-attempt timeout;
the other waits use explicit or ambient budgets. SP-10 concerns the two waits
inside the operation the plan calls the first “attempt,” not the later selection
and close stages.

## Follow-up question results not otherwise findings

- **F2 — scoped post-condition:** no issue found. `Input.js:188` removes
  `aria-controls` when `open` becomes false, and Playwright's negated regex
  matcher accepts an absent attribute. This remains source evidence pending the
  runtime census.
- **F2 — `ownsOpenPopup`:** no silent wrong-control path found. Its boolean is
  narrower than popup usability, but downstream assertions make unusable or
  stale ownership loud. RT-1 is a real reason not to unconditionally toggle.
- **F2 — 1500 ms magnitude:** not cleared as a good number. It is likely generous
  for an open flag set by the handled gesture, but no runtime distribution was
  measured; SP-10 first requires the code and prose to agree on what it bounds.
- **F3:** no unsafe over-reach found in deleting the global `Escape` presses.
- **F4:** no issue found in the unchanged §4.2 DOM chain, §5.1 blast-radius
  account, or P1–P4; runtime DOM facts remain conditional on leg 0.
- **F5:** no issue found. §7.4 preserves rather than softens my contrary reading
  and distinguishes it from the owner's binding case-specific ruling.
- **F6:** SP-8 is the unpredicted cross-repair interaction: the correct event
  repair from SP-3 ceased to be sufficient when SP-2 simultaneously restored a
  second attempt.

## MemPalace drawer candidates

**Candidate — wing `havdm`, room `review`, `added_by="codex"`:**

> [REVIEW] The same-reviewer STRAT-D7 follow-up of
> `docs/testing/SPACING_HELPER_PRESET_PLAN.md` revision 2 at reviewed head
> `f2b0ed5a2676d17a6bb9d7965b1a542cbbeb5aa6` returned SEV-1-BLOCKED. SP-1 is
> partially resolved; SP-2 regressed; SP-3 is partially resolved; SP-4 through
> SP-6 are resolved. Four new findings: SP-7, Playwright 1.57.0 installs an
> event-time Window-capture hit-target interceptor before ordinary click and
> blocks/retries a displaced event, contradicting the revision's replacement
> TOCTOU mechanism; SP-8, legs 2/3 remove their `mousedown` suppression after
> attempt 0, so the retained attempt 1 opens the requested popup and cannot
> yield the claimed repaired ownership failure; SP-9, mandatory legs 8/9 lack
> stable, falsifiable constructions, with leg 8 accepting opposite outcomes;
> SP-10, the stated 1500 ms first-attempt budget reaches only the
> `aria-controls` poll and not the owned-popup count. The scoped post-condition,
> `ownsOpenPopup`, Escape removal, §7.4 brief, and unchanged P1–P4 showed no
> additional defect. Review artifact:
> `docs/reviews/spacing-helper-preset-plan-codex-followup-review.md`. No product
> code or test suite was run; implementation remains blocked pending revision
> and another STRAT-D7 same-reviewer follow-up.
