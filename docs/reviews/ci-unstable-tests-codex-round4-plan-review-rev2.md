# HAVDM plan review — PR #144 settle-helper contract, revision 2 (OpenAI Codex GPT-5)

**Reviewer:** OpenAI Codex (GPT-5), independent plan reviewer, 2026-08-17

**Artifact reviewed:** `docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md` revision 2
at `07f3f17`; no implementation exists for this plan.

**Scope:** `main..HEAD` (`ae4cbdf3..07f3f17`). Local `HEAD`, the remote feature
head, and PR #144's hosted head all resolved to
`07f3f17ae44fccd1313c733d00e160bce1e99e65`. The output of
`git diff f78af0d..HEAD --name-only` was exactly the revision-1 plan review, the
round-4 implementation review, and the revised plan. No source or test file has
changed since `f78af0d`.

## 1. Verdict

**CHANGES-REQUIRED**

The owner's two decisions remain settled. Full amended Option A is still the
right direction, and `clip-path` must actually be repaired. Revision 2 fixes
substantial parts of the first plan: it tells the owner about `visibility`,
adopts a mechanism-specific name, carries the correct `y = 650` ancestor
magnitude, adds both keyframe directions, adds ordinary and known-open controls,
and names the missing claim surface and external-body check.

The new tier 3 is nevertheless unsound. It does not ask an authority whether an
unknown property is geometric; it repeats the old sampling inference for nine
intervals instead of two. A registered custom property driving `translate`
passed its ten equal readings in headless Chromium while almost 10 px of movement
remained. The plan therefore fixes the `clip-path` false timeout by introducing a
false settle for the exact unknown-geometric class it says must continue to fail
closed.

The narrowed contract also remains advisory at runtime, and the proposed control
matrix contains one impossible red-leg claim plus unspecified latency and pin
magnitudes. Those defects need to be corrected before implementation or CI is
spent.

## 2. Findings, most severe first

### M1 — merge-blocking: tier 3 is the round-2 rounding hole with a larger streak

**Source.** The plan changes an unknown measured-target property from today's
fail-closed block into “10 consecutive equal hundredth-pixel readings” followed
by a return at `docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:192-203`. It admits
that sufficiently slow unknown motion still slips through at `:205-208`, then
asks whether a registered custom property driving `translate` opens exactly that
route at `:280-287`. This also directly contradicts proposal (a), which says
unknown and custom properties “keep failing closed” at `:139-141`. The current
helper does fail them closed at `tests/support/dsl/canvas.ts:472-480`; tier 3
does not.

That question has a concrete red answer. In Chromium 143.0.7499.4 I registered
`--x` as a `<length>`, made a measured 100 × 80 px item use
`translate: var(--x) 0`, and transitioned `--x` from `0px` to `10px` over 2,000
seconds. Chromium reported a running `CSSTransition` whose
`transitionProperty` was `--x`; its computed keyframes contained `--x: 0px` and
`--x: 10px`. Ten 32 ms-spaced readings all rounded to the same hundredth. The
tier-3 rule would have returned after **292 ms** at `x = 20.0015` while the
animation was still running, with **9.9985 px** left to its forced endpoint at
`x = 30`. The caller permits only ±2 px.

Ten is arbitrary in the stronger sense that no finite value can establish this
property. For any finite streak and coordinate resolution, the duration can be
made long enough that geometric motion remains within one bucket for the whole
window. Increasing the streak, interval, or timeout merely changes the defeating
duration. Tier 3 also cannot be implemented from the plan as written: it names
“known-geometric” and “known paint-only” sets at `:194-198` but supplies neither
the population nor the canonical source for the new known-geometric set.

**Class and population swept.** The behavioural class is “a running animation on
a measured target whose reported property is unknown to the classifier.” I
checked the three semantic members the proposed tiers create: stable geometry
(`clip-path`), known geometry (the existing `transform`/`scale` routes), and
unknown geometry (a registered custom property consumed by `translate`). I also
classified future CSS properties and context-dependent properties as the same
open unknown-geometric member, rather than treating the custom property as the
population. The existing `visibility: collapse` result is independently useful
here: whether a property affects a box can depend on formatting context.

The rejected throwaway-element probe at `:209-213` is not an adequate authority
either. A custom property which is inert on a throwaway element can be geometric
where the target's actual rules consume it; `visibility: collapse` likewise
distinguishes an ordinary element from a table row. My probe did recover the
custom property's endpoint values from `getKeyframes()`, so “endpoints are not
reliably recoverable” is not universal, but recovery for one construction does
not make a context-free clone authoritative. A viable layout-engine design would
have to evaluate the **actual target in its actual context** (for example, a
carefully analysed seek-and-restore counterfactual), then account for animation
events, simultaneous effects, restoration, and read-only-helper side effects.
That alternative needs its own hostile plan; a throwaway node is rightly
rejected.

**Required plan correction.** Remove “unknown + finite stable streak → return.”
Unknown properties must remain fail-closed unless the plan identifies a
canonical, non-memory-derived authority that classifies `clip-path` as safe, or a
target/context-specific layout query that is demonstrated safe. Define the
source and population of every tier, not merely the tier names. The repaired
design needs opposite controls: `clip-path` returns while live with unchanged
axes, and an unknown geometric property such as the registered `--x` route does
not return early and has a forced endpoint beyond ±2 px. Control 13 alone proves
only the first half.

**Must not change.** Do not pivot to a geometric allowlist, extend a property
list from memory, increase the sample count to hide this result, widen ±2 px,
alter grid-relative arithmetic or the saved-data assertion, or reclassify the
new false settle as an accepted `KNOWN-OPEN:` substitute for the owner's
`clip-path` repair decision.

### M2 — merge-blocking: the light-DOM/RGL boundary is still advisory, and the proposed shadow pin proves it

**Source.** Proposal (d) renames the API and says to state light-DOM and RGL
preconditions “at that API” at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:169-175`; it does not require an
assertion. Proposal (c) admits that a shadow-tree ancestor remains invisible at
`:163-167`, and pin 1 deliberately calls the helper in that state and expects a
false return at `:235-237`. The current implementation accepts any document
elements carrying `.react-grid-layout` and direct `.react-grid-item` classes at
`tests/support/dsl/canvas.ts:343-350,417-436`; it has no RGL, element-kind,
formatting-context, or composed-tree precondition.

A future caller can therefore read the new name, use selector-compatible markup,
and silently enter the very shadow route the narrowed contract excludes. The
rename improves intent discovery but cannot make a precondition binding when the
implementation accepts and returns from its counterexample. This also creates a
test-design conflict: Control 12 needs a table formatting context to demonstrate
Chromium's geometric `visibility: collapse` endpoint, while a real div-based-RGL
precondition should refuse that markup before the property classifier is reached.
A precondition error would make Control 12 green without exercising proposal
(b).

**Class and population swept.** The behavioural class is “an invocation admitted
by the API but excluded by its proposed contract.” I read the definition, both
Save consumers, and all ten discriminator-file consumers returned by the helper
name sweep. All 12 current call sites use the actual app's RGL path; none needs a
scope reversal. I then classified the reachable nonconforming shapes: arbitrary
selector-compatible markup, the table construction needed for M2a, and the open
shadow/slot construction already reproduced in revision 1. A fully closed shadow
root may limit what can be mechanically asserted, so I do not claim that one
runtime check can prove every composed-tree fact.

**Required plan correction.** Make every mechanically decidable precondition a
runtime invariant, or encapsulate the helper so a non-RGL caller cannot invoke
it. At minimum, specify and test the expected RGL element/formatting shape and the
detectable light/composed-tree boundary. Reconcile Control 12 with that gate: it
must reach and discriminate the `visibility` classification, not pass because a
different precondition throws. If some shadow construction cannot be detected,
state precisely which one and retain a `KNOWN-OPEN:` pin only for that residual.
If the ordinary slotted construction can be refused, its test should assert the
loud refusal and cease to be a known-open false-settle pin.

**Must not change.** Do not remove the rename, claim a docblock enforces a
precondition, drop the ordinary-ancestor failure, describe
`document.getAnimations()` as shadow-complete, or weaken the measured-target
exclusions for descendants and pseudo-elements.

### M3 — merge-blocking: the control/pin matrix still contains an impossible red leg and leaves named properties unmeasured

**Source.** The five controls are specified at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:215-229`, and the two pins at
`:231-239`.

There are four separate control-plan defects:

1. Control 11 cannot be red against “the old M3 implementation” as required at
   `:223`. Old M3 treats `computedOffset` as unknown and therefore blocks **every**
   keyframe, including the proposed geometric keyframe. Blocking is Control 11's
   desired result, so old M3 passes it. Control 10 is the member that rejects old
   M3; Control 11 correctly rejects only an ignore-all-keyframes mutant. The pair,
   not Control 11 alone, proves the two directions from the round-4 review.
2. Control 10 says its upper bound must be numeric and materially below 5 s, then
   `:227-229` repeats that a number is required, but the plan still chooses no
   number. Control 9 likewise says “throw promptly” at `:221` without an asserted
   latency. These are instructions to choose bounds during implementation, not a
   reviewed test design. The real-app red/green measurements must select explicit
   thresholds with margin before the plan is approved.
3. Control 13 is red against the un-repaired code: `f78af0d` treats `clip-path` as
   unknown and times out, while Control 13 requires return. It therefore **does**
   discriminate the presence of tier 3. It does not discriminate tier 3's safety;
   the `--x` false-settle mutation from M1 is the missing opposite control.
4. The rAF pin names only “a material endpoint residual” at `:238-239`. It omits
   the travel and duration that make the current helper return. A faster rAF move
   crosses hundredth-pixel buckets and may correctly prevent the known-open
   behaviour; an arbitrarily chosen fixture can therefore be flaky or dead. The
   round-4 construction—10 px over 200 s—must be re-derived in the real app
   fixture and carried with live-before/live-after and forced-endpoint assertions.

Control 11 should use a long geometric keyframe, a shortened explicit helper
budget, a specific timeout error, animation liveness before and after, and a
forced geometric endpoint. “Did not return early” alone tends to leave a pending
promise whose later rejection races teardown; an asserted bounded throw proves
the same refusal cleanly. It must not be claimed red against an implementation
whose bug is overblocking.

**Class and population swept.** The behavioural population is the five proposed
controls and two pins, classified by the guard each names and the wrong
implementation each must reject. Control 9 has the correct hostile direction and
its `2,000s` value is derived from the real fixture's most sensitive `y = 650`
axis at `:126-133`; no issue was found with that magnitude. Controls 10 and 11 are
the required opposite keyframe semantics. Control 12 names the `visibility`
repair but has the precondition conflict in M2. Control 13 is red against removal
of the proposed repair. The shadow construction is feasible in principle—a
light-DOM grid can be slotted beneath an animated shadow wrapper while remaining
visible to `document.querySelector`—but its expected result depends on the M2
runtime decision. The rAF construction asserts current behaviour, not wished-for
closure, but lacks its discriminating magnitude.

**Required plan correction.** Correct Control 11's mutation table; choose and
derive concrete latency bounds for Controls 9 and 10; add the unknown-geometric
opposite control required by any replacement M2b design; and carry measured
travel/duration into the rAF pin. Recount the budget after M1 and M2 are repaired
rather than preserving “five plus two” as a target.

**Must not change.** Do not delete the geometric-keyframe direction, count
Control 10 as proof that all keyframes are ignored safely, use a timeout-only
assertion for a prompt-return control, invert a `KNOWN-OPEN:` assertion into the
wished-for result, or discard the correctly derived `2,000s` ancestor magnitude.

### M4 — plan accuracy: one live SHA claim is already stale, and one limitation is overstated

**Source.** The plan includes itself in the live claim population, but says the
hosted head “is now `24f27bb`” at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:248-254`. The actual local, remote,
and PR head for this review is `07f3f17`. Part 1 also calls rAF motion
unconditionally “CANNOT BE FIXED” at `:50-51`. The round-4 result was narrower:
the current Web Animations authority cannot observe rAF, so the broad promise
must be replaced by an enforced RGL-specific contract or a different authority.
The plan is taking the contract route; it should describe that decision, not
promote an implementation limitation into a universal impossibility.

**Class and population swept.** I checked every measurement and prior-review
attribution in `docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:101-133` against the
round-4 implementation review and revision-1 plan review. The 66.2 ms ancestor
result, 524.1 ms `clip-path` result, 527.9 ms opacity result, Chromium 143
four-member keyframe metadata observation, n=1 application probe, shadow
partial-closure account, and 200/500/1,000/2,000 s duration series are accurately
reported within their stated evidence boundaries. The false current-head literal
and Control 11's old-M3 attribution in M3 are the discrepancies found.

**Required plan correction.** Make the PR-body task resolve the head at execution
time (and record the full final SHA), correct the current plan's literal now, and
say that rAF is unobservable to this helper's chosen authorities and outside its
enforced contract. Do not say no possible system could ever observe it.

**Must not change.** Do not rewrite historical SHA claims, carry acceptance from
`f78af0d` across future implementation changes, or present any prior probe as a
new revision-2 run.

## 3. Revision-1 finding dispositions

| Revision-1 finding                                           | Disposition                      | Reason                                                                                                                                                                                                                      |
| ------------------------------------------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M1 — owner/technical agreement and binding narrowing**     | **PARTIALLY RESOLVED**           | Part 1 and Part 2 now nominally promise the same five dispositions, and the rename is present. The promised M2b fix is unsound (M1 above), and non-RGL/light-DOM preconditions remain advisory (M2).                        |
| **M2 — controls reject wrong implementations**               | **PARTIALLY RESOLVED**           | The missing directions and correct ancestor magnitude are now present. Control 11 cannot reject old M3, prompt bounds are not chosen, and tier-3 safety has no opposite discriminator (M3).                                 |
| **M3 — declared limitations get passing `KNOWN-OPEN:` pins** | **PARTIALLY RESOLVED**           | Shadow and rAF pins are proposed and assert current behaviour. M2 determines whether shadow should instead fail loudly; the rAF magnitude is missing; and unsound tier 3 creates a new unpinned unknown-geometric residual. |
| **M4 — semantic and external claim surfaces**                | **RESOLVED AS A PROCESS DESIGN** | The discriminator instructions, labelled hand trace, and updated-live-body evidence check are now included. M4 above is a new factual correction: the plan's own intermediate-head literal is already stale.                |

## 4. Results of the six commissioned attacks

### Attack 1 — `clip-path` repair — findings M1 and M3

Tier 3 is not sound. It is finite-resolution sampling and is defeated by a
registered custom property driving `translate`. Ten has no defensible derivation
because every finite window has a slower counterexample. The throwaway-element
probe is also non-authoritative because property effects are contextual; an
actual-target layout-engine counterfactual is the version worth investigating,
with its mutation and event risks made explicit.

### Attack 2 — revision-1 M1–M4 closure — findings M1–M3; process half of M4 resolved

The table in §3 gives each required disposition. The rename is necessary but not
sufficient. A runtime assertion or equivalent encapsulation is required for every
mechanically decidable RGL/light-DOM precondition; otherwise the proposed shadow
pin proves that a faithful caller can still receive an out-of-contract value.

### Attack 3 — five controls and two pins — finding M3

Control 11's ignore-all-keyframes mutant is the right mutation, but old M3 is not:
old M3 already blocks the geometric keyframe. A shortened, explicit-budget throw
with liveness and endpoint evidence is the clean assertion. Control 13 **would
fail** against the un-repaired current code, so it discriminates returnability;
it does not test unknown-geometric safety. Control 9's `2,000s` magnitude and its
all-axis derivation are correct and are stated, not merely copied.

### Attack 4 — `KNOWN-OPEN:` pins — findings M2 and M3

Dropping the `clip-path` known-open pin is correct **only after a sound repair**;
the regular Control 13 is then its replacement. Under the current tier proposal,
the dropped limitation has been exchanged for the more dangerous unknown-
geometric false settle, so the two-pin claim is premature. The slotted open-shadow
construction is DOM-constructible, but an enforced precondition should turn it
into a loud-refusal control where detectable. The rAF pin asserts present
behaviour in the correct polarity but needs a real-fixture magnitude to avoid a
dead or flaky instrument.

### Attack 5 — claim surface — no new merge-blocking issue found

The semantic property is not mechanically decidable, so a labelled hand trace is
the correct instrument. `bash tools/check-pr-evidence.sh 144` is correctly limited
to the updated live PR body and to the SHA/candidate properties it can decide.
The repository sweep found the helper docblock, discriminator instructions, Save
explanation, and plan; the PR body is the verified external instructional
surface. The Save text at
`tests/e2e/save-and-backup.spec.ts:186-212,253-265` specifically attributes the
wait to RGL reflow and is not semantically stale, although its two method calls
must take the rename. It should appear in the hand trace as a cleared member,
not disappear because it needs no prose rewrite. Historical reviews, commit
messages, unrelated “stopped moving” helpers, and CI result artifacts are not
current instructions for this API.

The external question was asked explicitly. PR #144's body is current and stale;
it is already in scope. A MemPalace semantic search found no exact helper-contract
surface, but that is not a mechanically complete enumeration and the MCP
transport later closed, so any current memory-store claim is **UNVERIFIED**. The
decision drawer cited by the plan records the owner's choice; it is not shown to
be an implementation contract. No other external surface is claimed absent.

The phrase “four current surfaces” at
`docs/testing/SETTLE_HELPER_CONTRACT_PLAN.md:241-258` should say “four surfaces
requiring semantic rewrite” if that is what is meant, because the accurate Save
surface is still a member of the behavioural population. This is a count/wording
correction, not a separate blocker.

### Attack 6 — accuracy about the prior reviews — findings M3 and M4

The plan accurately carries the prior measurements and their limitations. It
misattributes Control 11 as needing to fail against old M3, overstates the rAF
observation as universal impossibility, and records `24f27bb` as the current head
of a plan committed at `07f3f17`. Those corrections do not re-open the settled
owner choice.

**Attack which found no new merge-blocking issue:** **Attack 5**. Its minor
population-label correction and external evidence boundary are stated above.

## 5. Evidence boundary

- I read the full revision-2 plan, the complete revision-1 plan review, the
  complete round-4 implementation review, the current helper, all eight committed
  controls, both load-bearing Save samples, and the complete live PR #144 body.
- I did not run a Playwright suite, `./tools/checks`, CI, Electron, an installer,
  a packaged acceptance pass, or Home Assistant. No unchanged round-4 green is
  presented as newly rerun.
- The only runtime attacks were standalone **headless Chromium** 143.0.7499.4.
  One constructed the registered `--x`/`translate` counterexample and recorded
  all ten readings, animation state, computed keyframes, and forced endpoint. A
  second confirmed that Chromium's `visibility: collapse` endpoint reduced a
  table-row box from 80 px to 0 px while the flex construction retained its box;
  that result supports the context-dependence judgement, not a universal browser
  claim.
- No Electron process or headful browser was launched. No project test or source
  file was changed.
- GitHub was read through the connected metadata surface and `gh`; no PR body,
  review state, issue, branch, or remote content was changed.
- MemPalace practice rules were read before the review. The project-memory MCP
  transport later closed; a CLI semantic search is not a complete population
  check. No MemPalace content was written.
- This review document is the only repository write.

## MemPalace drawer candidates

**HOLD — do not file these candidates yet.** The replacement mechanism has not
survived independent review, so the commission's rule 14 still applies.

1. A finite stable-sample window cannot turn an unknown animation property into
   a non-geometric fact. For every resolution, interval, and streak, a slower
   geometric transition can remain inside one bucket for the whole window; use a
   property/layout authority or fail closed.
2. A narrowed helper contract is not binding while selector-compatible callers
   outside its RGL/light-DOM preconditions still receive normal values. Enforce
   mechanically decidable preconditions at runtime or encapsulate the API, and
   pin only the residual that enforcement genuinely cannot detect.
