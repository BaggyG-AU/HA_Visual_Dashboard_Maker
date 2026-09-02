# SEV-1-BLOCKED — scoped follow-up 7 review of the spacing-helper preset plan

Author and repair author: Claude Opus 5 (interested party)

Reviewer: OpenAI Codex / GPT-5.6 Sol (same reviewer as rounds 1–7)

Owner gate: micah / BaggyG-AU; this review decides nothing on its own

Reviewed head: `ab52ef3caa23591471468332dbe7f9d805c72530`

## Verdict

**SEV-1-BLOCKED.** Revision 8 preserves the core option-B implementation and
faithfully integrates the SP-27 and SP-28 repairs. It removes SP-29's nullable
error sentinel and gives the other-half comparison keyed diagnostics. Installed
antd/rc-select source still supports P1's class-placement path, conditional on
the mandatory Electron class smoke.

The deletion removed load-bearing specification, not only archaeology. The
current §6 no longer defines a constructible P4-ONLY variant, no longer specifies
the event lifetime and controls that make legs 2/3 valid, and reduces legs 8/9 to
outcomes without constructions. It also drops the scope-only discriminator halt
and the explicit owner-ruling outcomes for the class scope and governance lane.
The exact one-shot suppression and undefined-P4-variant defects that blocked
SP-8 and SP-12 are therefore permitted again by the current text. An implementer
cannot build and validate the mandatory harness from §3–§7 alone. That is SP-31,
and it meets the three-part SEV-1 bar.

Two lower-severity defects remain. SP-29 is only partially resolved because the
new five-second capture budget stops before `textContent()`, which silently
switches to the repository's 30-second action timeout (SP-32). SP-30 regresses:
the marked totals block exists, but revision 8 restates the live round and finding
totals outside it while claiming every other sentence is numeric-free. The
checker correctly returns clean for the frames it recognizes; that clean result
does not clear either semantic defect.

Under the commission's stop rule, this verdict ends the plan-review track. I am
**not** asking for revision 9. The owner's choices are to park the work or proceed
under the conditional implementation clearance below. My recommendation is to
proceed conditionally: the core repair is source-coherent and narrow, while the
blocking defect is in the deleted harness contract. The Electron class smoke is
the first hard gate, and the compact appendix under SP-31 supplies the missing
contract without restoring the deleted archaeology.

## SP-27…SP-30 disposition

| Finding   | Disposition            | Follow-up result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SP-27** | **RESOLVED**           | §3 now assigns correctly-formed-but-misattached prevention to P1, P4 only to mutation detection, and the double-pre-satisfied limit to leg 5b (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:92-116`). The P4 property, method comment and weakest-claim section agree (`:122-133,328-365,531-546`). I found no surviving claim that P4 proves operation identity or catches every wrong operation.                                                                                                                         |
| **SP-28** | **RESOLVED**           | M9c is labelled a detector-liveness control and expressly says it neither isolates foreign pre-satisfaction nor mirrors direction (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:150-152`). No current text calls it a matched or bidirectional mirror.                                                                                                                                                                                                                                                                     |
| **SP-29** | **PARTIALLY RESOLVED** | The shared reader now returns `Record<string, string>`, preserves read errors instead of converting them to comparison data, names the ids, and has leg 5c (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:287-326,468-470`). Its claimed absolute capture budget does not include the terminal `textContent()` read; SP-32.                                                                                                                                                                                                 |
| **SP-30** | **REGRESSED (SEV 3)**  | The marked `plan-running-totals` block and narrowed checker claim are present (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:506-527`; history `:205-210`). The same plan nevertheless restates “after seven review rounds” and “30 findings” at `:9-14`, “one more review round” at `:43-44`, and “across seven rounds” at `:523-527`, while `:518-519` says every other sentence refers to the keys and restates no value. The current checker returns `[]`; its C3 frame list does not make the one-home assertion true. |

## Stop-rule consequence and conditional clearance

The owner is not being asked to judge TypeScript. In plain language: the chosen
name-tag repair still looks sound, but the shortened plan deleted instructions
that prevent a bad probe from reporting a reassuring result. Proceeding is
reasonable only if those instructions are restored as implementation conditions,
not as another plan revision.

**Conditional clearance to implement:**

1. The owner accepts SP-31's compact contract below as binding for this
   implementation, and keeps the ruled scope at `SpacingDSL` only under the fix
   lane.
2. Add only the two option-B class hooks first, then run the four-control Electron
   class smoke headlessly. Each Select's popup must carry its own
   `.<testid>-popup` class and no popup may carry another Select's class. Any
   missing, duplicate, shared or swapped mapping **halts and parks/re-puts the
   mechanism**; it is not characterisation.
3. Implement the helper and all three callers with SP-32's bounded-read repair.
4. Run legs 1–9 under the constructions in SP-31's appendix, then the caller,
   visual, repeat and CI gates. A leg whose required starting state was not
   observed is **UNRUN**, never PASS.
5. Do not change snapshots, the expected-failures manifest, `tabs.ts`, `popup.ts`
   or `BackgroundCustomizer` as part of this work.

If the owner does not accept those conditions, the commission's remaining option
is to park the work. There is no further plan-review round under the stop rule.

## G2 — what the deletion lost

I keyed the deletion on roles rather than method names. The author already
audited methods and code lines; this pass asked which constraints, evidence
boundaries and rulings had no current normative home.

| Role in revision 7                                                                                                 | Revision-7 home         | Revision-8 result                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Option-B code, all three callers, P1–P4 and the known-open P4 boundary                                             | §3–§4.4                 | **RETAINED.** SP-27/SP-28 are integrated faithfully.                                                                                                                                                                                                            |
| Ruled class scope: S1/`SpacingDSL` now; `tabs.ts` and `popup.ts` remain deliberately out of scope                  | §5.2                    | **LOST AS A RULING.** Current §0 says the class decision is made but does not state its outcome; §3–§7 contains no S1 result and no `tabs.ts`/`popup.ts` exclusion. The narrow blast radius implies S1 but does not record the owner's decision.                |
| Ruled governance outcome: fix lane, case-specific, without amending §3.7                                           | §7.4                    | **LOST FROM THE SPECIFICATION.** The history records the old disposition, but its own preamble says it specifies nothing. Current §0 names a decided lane without saying which lane.                                                                            |
| Executable SCOPE-ONLY and P4-ONLY code shapes                                                                      | §6 variant definitions  | **PARTLY LOST.** Current `P4-ONLY (SCOPE-ONLY plus P4)` does not say what is removed and is redundant because SCOPE-ONLY is already derived from the complete repaired helper, including P4. The prior required removal of the global singleton/identity count. |
| Leg-1 liveness: immediate transition, maximum popup count, and `max < 2` means no result                           | §6 leg-1 construction   | **PARTLY RETAINED.** The current table keeps the popup-count veto but drops the no-settling construction and recorded-state details.                                                                                                                            |
| Legs-2/3 whole-call capture-phase `mousedown` suppression, event counts, four postconditions and `finally` cleanup | §6 constructions        | **LOST.** “Opening suppressed page-side” permits the one-shot construction already falsified by SP-8.                                                                                                                                                           |
| Leg-8 widened real CSS leave motion, immediate precondition, one oracle and cleanup                                | §6 constructions        | **LOST.** Only “owned popup mid-leave” and the desired outcome remain.                                                                                                                                                                                          |
| Leg-9 separate one-shot suppression, exactly-one-fire proof and second-gesture proof                               | §6 constructions        | **LOST.** Only “first gesture suppressed, second succeeds” remains.                                                                                                                                                                                             |
| Fresh state for every leg and proof that listeners/styles are gone                                                 | end of §6 constructions | **LOST.** A previous leg can again manufacture the next leg's result.                                                                                                                                                                                           |
| Halt if a measured M1–M7 fact is contradicted, or if leg 3 makes the scope-only repair fail loudly                 | §7.3                    | **LOST.** Current §7 halts only after failure to reproduce a wrong target for one working session.                                                                                                                                                              |
| Electron class smoke before helper implementation                                                                  | §7 sequence             | **RETAINED** and correctly remains census, not leg 1.                                                                                                                                                                                                           |

This is not an objection to the owner's delete-don't-split ruling. The revision is
materially clearer. The defect is that the deletion classified executable
preconditions and owner outcomes as archaeology. A short contract fixes that
without restoring route essays, superseded options or per-round narrative.

## G3 — self-sufficiency of §3–§7

**The implementation code is self-sufficient; the acceptance mechanism is not.**
An implementer can add the four popup names and write the helper/callers from
§3–§5. They cannot produce trustworthy acceptance evidence from §6–§7 without
the deleted material.

The strongest counterexample is mechanical. The current leg 2 says only that
padding opening is “suppressed page-side” (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:465`).
A one-shot `mousedown` suppression satisfies those words. The repaired helper
has two attempts (`:228-245`): attempt 0 consumes the listener, attempt 1 opens
the requested popup, and the leg no longer exercises the foreign-only failure it
claims. That was SP-8's exact measured control-flow defect. The current text has
removed the clause that prevented it.

P4-ONLY is independently under-specified. The current variant list at `:443-447`
does not identify a removed guard, while leg 5 requires P4 “alone” at `:468`.
That recreates SP-12's old problem: a method can be invoked and red without the
harness establishing which guard caused the red or whether the wired path reaches
it under the intended hostile opener.

The prior review files preserve the missing words historically, but the
commission explicitly asks whether §3–§7 stands alone. A reviewer archive is not
a normative implementation dependency, and the history declares itself a record
rather than a specification.

## G4 — the four checks

I checked out `feature/plan-consistency-checker` at
`1f6650a57d68a896ce3b9de646a0f0127c052995` in a detached temporary worktree,
ran its permanent spec, and added an untracked audit spec that read revision 8
from this reviewed worktree. The temporary worktree and audit file were removed.

**Executed result:** 23 permanent tests passed and the real-plan test skipped on
the off-branch checkout; all eight audit tests passed. `checkPlan` returned `[]`
against revision 8. Each current check then proved live on a matching mutation:

- **C1** fired after all proposed `expectSelectShows` calls were removed.
- **C2** fired after an `SP-999` reference was added without a disposition row.
- **C3** fired after a second recognized “Eight review rounds complete” site was
  added.
- **C4** fired after the nested sequence put leg 1 before the helper.

That proves liveness on this document, not generality to the next edit. Three
controls measured the boundary:

- C1 stayed silent when all wired calls were removed and one disconnected
  TypeScript code block merely called `expectSelectShows`.
- C3 stayed silent after appending the SP-30 hostile shape: “This plan has been
  reviewed eight times and has 31 total findings.”
- C4 stayed silent when an inverted helper/leg sequence was expressed as a flat
  list. Revision 8 already discloses this parser dependency at `:495-500`.

C2 is likewise row-presence coverage only; it does not decide whether a
disposition is true, unique or current. The checks are useful regression alarms
for the exact shapes they parse. They do not inspect event lifetime, hostile-state
construction, causal isolation, read budgets or owner-scope outcomes. SP-31 and
SP-32 therefore passing C1–C4 is expected, not contradictory.

SP-30's current regression is the clearest scope mismatch. A marked block was
added, but C3 neither parses that block nor enforces numeric-free references to
it. One recognized natural-language site plus one unrecognized duplicate is a
clean C3 result, not a one-home certificate.

## G5 — scope and over-reach

The SP-27 and SP-28 repairs are exact. The SP-29 redesign is proportionate: one
shared non-null keyed snapshot is smaller and safer than retaining a nullable
reader plus separate assertions. Deleting `readSelectValue` is not over-reach;
leaving its terminal read outside the promised budget is under-reach (SP-32).

The large deletion was owner-authorized and correctly removed superseded routes,
option comparisons, narrative and cost archaeology. It over-reached only where
those passages uniquely carried live work: the ruled S1/fix-lane outcomes,
hostile-state constructions, cleanup requirements and halt conditions listed in
G2. I found no proposed expansion into product behavior, CSS, snapshots,
manifest policy, unrelated DSL implementation or CI policy.

The regenerated direct-consumer command still returns only
`tests/e2e/spacing.spec.ts` and `tests/e2e/spacing.visual.spec.ts`; alias searches
found no renamed caller. `renderSection` is called twice, `SpacingControls` has
one product consumer, the four proposed class strings have no current collision,
and the private-method enumeration returns the nine names printed in §5. The
manifest remains 7 expected failures / 10 flaky / 21 skips, with the spacing
identity on none.

## G6 — interaction and the load-bearing runtime premise

The new interaction is between two individually sensible timeout layers.
`snapshotOtherHalf` gives `toBeVisible` the shared five-second remainder, then
calls `textContent()` without a timeout (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:298-325`).
Playwright forwards a locator read's own timeout to the channel
(`node_modules/playwright-core/lib/client/locator.js:270-272` and
`client/frame.js:306-308`); this repository supplies a 30-second action timeout
(`playwright.config.ts:53`). The “bounded readiness” step and the “read the
value” step are each valid alone, but together they switch clocks inside one
operation that claims a single absolute budget. On the pre-gesture capture path,
that can delay the click for the larger clock. Inside `expect.poll`, the outer
five-second race can time out while the inner read remains in flight. SP-32
records the scope and fix.

The load-bearing runtime premise remains P1's Electron placement. Installed
antd 6.1.4 merges `classNames.popup.root` into `popupClassName`
(`node_modules/antd/lib/select/index.js:171-180,220-250`), rc-select passes it to
the trigger (`node_modules/@rc-component/select/lib/SelectTrigger.js:119-143`),
and rc-trigger attaches it to the retained popup root
(`node_modules/@rc-component/trigger/lib/Popup/index.js:146-170`). I found no
source path by which a correctly generated foreign popup receives the requested
class. That is still **INFERRED from source**, not runtime clearance; M7 remains
jsdom-only and the conditional Electron smoke is mandatory.

## Confidence and method

**Confidence: high on SP-31 because the current text permits two previously
proved harness defects; high on SP-32's timeout semantics; high on the SP-30
one-home regression; high on the checker execution; medium-high on P1 because
the installed source path is direct but Electron remains unrun.**

The pinned-tree gate passed before review: branch
`feature/spacing-helper-preset-plan`, head
`ab52ef3caa23591471468332dbe7f9d805c72530`, base
`08a9544643ef01aed843fa9babf1892291ed3e7f`, clean and docs-only. I read the
commission, revision-8 plan, complete history, review 7, then reviews 2–6 in the
commissioned order. I inspected the checker module/spec and all named product,
DSL, test, rc-select and Playwright source ranges.

For the deletion audit I compared revision 7 at `f46d32d` to revision 8 by
heading and role, then read the predecessor's §5–§7 end to end. Git reports 365
insertions and 2,296 deletions across plan/history, a net reduction of 1,931
physical lines. I separately regenerated callers, aliases, render sites, product
consumer, class collisions, private methods and manifest populations.

## Evidence boundary

- I did **not** run Electron, the class smoke, M9, harness legs 0–12, an e2e or
  integration suite, CI or live Home Assistant. No app probe was created.
- M5–M9 remain author-recorded runtime evidence. Installed source corroborates
  class placement and the already-selected close/no-change path; it does not
  reproduce their timing or rendered values.
- The checker audit used a detached temporary worktree and synthetic mutations.
  It did not alter the reviewed branch, and the worktree was removed.
- SP-31's one-shot counterexample is source/control-flow evidence and the exact
  previously reviewed SP-8 case; I did not recreate the event listener in
  Electron this round.
- SP-32 establishes a budget mismatch from the proposed code, Playwright's
  installed timeout path and repository configuration. Its runtime frequency is
  unknown.
- I changed no plan, source, test, snapshot, manifest or CI file. This review is
  the only tracked change.

## Claim ledger

| Load-bearing claim                                                                    | Tag                                              | Evidence and result                                                                                                                              |
| ------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| The reviewed branch/head/base is clean and docs-only.                                 | **MEASURED**                                     | Pinned gate regenerated before review; confirmed.                                                                                                |
| SP-27's P1/P4 separation is integrated across the live specification.                 | **MEASURED**                                     | Full behavioral sweep of §3, P1–P4, helper comments, harness and weak claims; confirmed.                                                         |
| M9c is now described only as detector liveness.                                       | **MEASURED**                                     | Current M9c row expressly disclaims causal isolation and directional mirroring; SP-28 resolved.                                                  |
| SP-29's two read failures can no longer compare as equal null sentinels.              | **MEASURED-from-plan**                           | Snapshot type is non-null and read errors are no longer caught into data; confirmed.                                                             |
| SP-29's one absolute five-second budget covers both ids and every read step.          | **MEASURED — CONTRADICTED**                      | `toBeVisible` receives the remainder; subsequent `textContent()` receives the ambient 30-second action timeout; SP-32.                           |
| The marked totals block is the only live home for its running totals.                 | **MEASURED — CONTRADICTED**                      | Current header/cost prose restates review-round and finding totals outside the block; SP-30 regressed.                                           |
| Revision 8 preserves all live constraints and owner rulings needed by an implementer. | **MEASURED — CONTRADICTED**                      | Role-based predecessor/current comparison found missing variant definitions, state constructions, cleanup, halt and ruled-scope outcomes; SP-31. |
| §3–§7 is self-sufficient for implementing the code.                                   | **MEASURED / JUDGEMENT**                         | The product/helper/caller proposal is complete and source-coherent.                                                                              |
| §3–§7 is self-sufficient for producing valid acceptance evidence.                     | **MEASURED — CONTRADICTED**                      | Current text permits the SP-8 one-shot construction and does not define P4-ONLY; SP-31.                                                          |
| C1–C4 are live against matching revision-8 mutations.                                 | **MEASURED by execution**                        | Four mutations fired; permanent and audit suites passed.                                                                                         |
| C1–C4 generalize to equivalent future phrasings and semantic defects.                 | **MEASURED — CONTRADICTED**                      | Disconnected-call, hostile-C3-phrase and flat-sequence controls all stayed clean.                                                                |
| P1 prevents a foreign popup from satisfying a correctly generated requested class.    | **INFERRED from installed source; runtime owed** | Same-expression mapping and antd→rc-select→rc-trigger path are direct; mandatory Electron smoke has not run.                                     |
| Proceeding under the compact conditional contract is safer than parking.              | **JUDGEMENT**                                    | Core code design is coherent and narrow; the blocker is repairable at the implementation-evidence boundary without a ninth plan round.           |

**Weakest claims in this review:** I did not observe P1 in Electron; I infer the
best stop-rule choice rather than decide it for the owner; the conditional
harness contract restates previously reviewed constructions but has not itself
been executed; and SP-30's dated deletion rationale can be read as an immutable
historical pin, although the plan's own unqualified “every other sentence” rule
does not make that exception.

## Findings

### SP-31 — SEV 1 — the deletion removed the mandatory harness contract and ruled boundaries

**Three-part blocking proof.** (1) The binding decision is that acceptance of the
mechanism comes only from fail-old/pass-new and guard-removal legs
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:441-477`), and the commission asks
whether an implementer can build the change from §3–§7 alone. Previous blockers
SP-8, SP-9 and SP-12 established that event lifetime, constructible variants and
single oracles are load-bearing specification, not explanatory history. (2) The
current text removes those conditions. `P4-ONLY (SCOPE-ONLY plus P4)` at `:445-447`
does not define which guard is removed; leg 2 at `:465` says only “suppressed
page-side”; legs 8/9 at `:473-474` name outcomes without constructions; and §7
at `:484-504` no longer carries the scope-only or contradicted-measurement halts.
The direct counterexample is the already-proved SP-8 sequence: a one-shot
`mousedown` listener is consumed by attempt 0, attempt 1 opens the requested
popup, and leg 2 never reaches the foreign-only failure it reports. The current
words permit that construction. (3) No remaining mitigation decides this class.
C1–C4 do not inspect events or harness state; a table of expected results cannot
prove that its precondition occurred; and the review archive/history are not the
normative §3–§7 specification. A green harness built from this text can therefore
be green for the same wrong reason that already consumed a review round.

This blocks implementation acceptance, not because option B is disproved, but
because the only evidence allowed to establish option B's repair can be invalid
while satisfying the shortened document.

**Class swept.** I read every revision-7/current role under owner decisions,
blast radius, harness variants and categories, legs 0–12, constructions,
sequencing, halts and live weak claims. The lost population is: S1/fix-lane
outcomes; exact SCOPE-ONLY/P4-ONLY shapes; leg-1 liveness details; legs-2/3
whole-call suppression and postconditions; leg-8/9 constructions; per-leg state
and cleanup; and the two refutation halts. Core code, callers, P1–P4, class smoke,
regression boundaries and weak claims survive.

#### Conditional implementation appendix for SP-31

The owner can adopt this compact contract instead of commissioning revision 9:

- **Scope:** S1 — `SpacingDSL` only, under the case-specific fix-lane ruling.
  `tabs.ts`, `popup.ts`, `BackgroundCustomizer`, snapshots and the manifest do not
  move.
- **SCOPE-ONLY:** REPAIRED with `popupFor` replaced by the document-global visible
  popup locator and the class-identity check removed; retain P3 and wired P4.
- **P4-ONLY:** SCOPE-ONLY with the document-global singleton/count guard removed,
  leaving the working global opener, real option click and wired P4. Leg 5 invokes
  `setPreset`, never `expectSelectShows` directly.
- **Leg 1:** open Margin preset, wait for its popup, invoke Padding preset
  immediately with no settling wait, and continuously record simultaneous visible
  popup count. `max < 2` is **UNRUN/no result**, not PASS.
- **Legs 2/3:** attach a capture-phase `mousedown` listener to the requested
  Padding root for the entire helper call; count suppressed events; remove it in
  `finally`. For REPAIRED, prove two suppressed attempts, requested
  `aria-expanded="false"`, foreign popup still visible and both pointer actions
  completed. Establish fresh state for each variant.
- **Leg 5:** record the exact failure message and process exit code; the message
  must name requested and moved ids.
- **Leg 8:** widen the real popup CSS leave motion test-side, initiate close, then
  immediately prove requested `aria-expanded="false"` while its owned popup is
  visible. The sole oracle is reopen-and-select success. Remove the style in
  `finally`.
- **Leg 9:** use a separate one-shot capture suppression; prove it fired once and
  removed itself, then prove success only after the second gesture.
- **Isolation:** every leg establishes and records its own starting state, and
  every listener/style override is proved gone before the next leg.
- **Halts:** stop and return to the owner if any M1–M9 fact is contradicted, if
  leg 3 does not silently succeed, or if a leg never observes its required state.

### SP-32 — SEV 2 — `snapshotOtherHalf`'s absolute budget stops before the value read

The new method says one absolute five-second budget is shared by both ids and
that any unreadable value throws by name
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:287-325`). It computes one remainder
and gives it to `toBeVisible`, but then calls `value.textContent()` with no
timeout at `:315`. Playwright locator reads accept a timeout and otherwise use
the configured default (`node_modules/playwright-core/types/types.d.ts:14545-14562`);
this repository sets `actionTimeout: 30_000` (`playwright.config.ts:53`). A value
node can pass visibility, disappear before the read, and make capture wait on the
larger clock. The before-gesture path can therefore delay the operation far
beyond its advertised budget; the comparison path starts the same larger read
inside a five-second `expect.poll` race.

**Owner Decision Brief.** (1) **What this protects:** no shipped product behavior;
it protects whether the mutation alarm fails promptly and predictably when its
sensor becomes unreadable. (2) **What is going wrong plainly:** the helper starts
with a five-second clock, then changes to a 30-second clock for the final act of
reading. (3) **Product affected: no. Evidence status: MEASURED from proposed code,
installed Playwright and repository configuration; runtime frequency UNMEASURED.**
(4) **Options and costs:** A, recompute the positive remainder after visibility,
pass it to `textContent({ timeout: remaining })`, and wrap any read failure with
the id; a few helper lines. B, declare a separate 30-second read budget and update
leg 5c/diagnostics; no ambiguity but materially slower failure. C, do nothing;
smallest implementation, false five-second promise. (5) **Recommendation: A**,
because it completes the already-selected fail-closed design and makes the type,
message and deadline tell the same story. (6) **If you do nothing:** ordinary
reads likely remain fast, but a DOM/selector regression can stall before the
gesture and make leg 5c observe the ambient timeout rather than the guard's own
budget.

**Concrete fix.** After `toBeVisible`, recompute `deadline - Date.now()` once,
reject `<= 0`, and pass that same positive value to
`value.textContent({ timeout: readRemaining })`. Catch a thrown read only to
rethrow a failure naming `testId` and `id`; never convert it into comparison data.
Keep the existing null rejection. Leg 5c must record elapsed time as well as the
named failure so it proves the budget, not only the error shape.

**Class swept.** I traced every awaited operation inside `snapshotOtherHalf`,
both ids, its pre-gesture call from `selectOptionByText`, its comparison call from
`expect.poll`, locator text resolution, locator timeout typing and the repository
default. The visibility waits are correctly bounded; the two possible terminal
text reads are the complete unbounded population.

## MemPalace drawer candidates

**Candidate — wing `havdm`, room `review`, `added_by="codex"`:**

> [REVIEW] The same-reviewer STRAT-D7 scoped follow-up 7 of revision 8 at reviewed
> head `ab52ef3caa23591471468332dbe7f9d805c72530` returned SEV-1-BLOCKED under the
> owner's terminal stop rule. SP-27 and SP-28 are resolved; SP-29 is partial;
> SP-30 regressed. SP-31 blocks because the deletion removed load-bearing harness
> constructions, exact weakened variants, cleanup/refutation halts and explicit
> S1/fix-lane outcomes; the shortened text again permits the one-shot suppression
> and undefined-P4-variant classes that caused SP-8/SP-12. A compact conditional
> implementation contract is supplied, with the Electron four-class smoke as the
> first hard gate and no ninth plan round requested. SP-32 finds that
> `snapshotOtherHalf` bounds visibility to five seconds but leaves
> `textContent()` on the repository's 30-second action timeout. Checker commit
> `1f6650a` was executed: the permanent suite and eight audit cases passed, all
> four checks fired on matching mutations, while disconnected-call, hostile-C3
> phrasing and flat-sequence controls measured their limits. No Electron/app
> suite was run. Review artifact:
> `docs/reviews/spacing-helper-preset-plan-codex-followup7-review.md`.

**Candidate — wing `practice`, room `verification`, `added_by="codex"`:**

> An absolute budget must reach every awaited operation in the stage it claims
> to bound. Bounding readiness and then performing an unbounded terminal read
> silently switches clocks. Recompute the positive remainder once after each
> wait, pass it to the next operation, preserve the error, and make the known-bad
> control assert elapsed time as well as message shape.
