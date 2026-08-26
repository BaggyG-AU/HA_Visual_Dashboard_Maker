Author: Claude Opus 5 (plan author; interested party)
Reviewer: OpenAI Codex / GPT-5.6 Sol (independent; authored none of the plan)
Owner gate: micah / BaggyG-AU decides whether the plan proceeds; this review decides nothing on its own

# Independent review — spacing-helper preset plan, round 1

## Verdict

**SEV-1-BLOCKED.** The ownership design is plausible, but the mandatory harness
cannot exercise its own hostile states because the proposed document-global
precondition consumes them, and the retry-removal rationale misreads the current
helper's control flow. No implementation may begin from this revision.

## Confidence and method

**Confidence: high on the three blocking findings; medium on runtime DOM and
timing consequences.** This was a spec-before-code source review at reviewed head
`c90155984db3edfc3e200a7ab1d808a9ec5f8462`, based on `main` = `08a9544`.

I read the complete plan; the current spacing helper and failing spec; the
product controls; the named tabs/popup siblings; all cited installed
`@rc-component/select@1.5.0`, `@rc-component/trigger@3.8.1`, and antd 6.1.4
source regions; `CLAUDE.md`; `OPERATING_AGREEMENT.md` §3, §3.4, and §3.7; and
the tracked commission. I also read the live HAVDM state, the diagnosis drawer,
and the owner's recorded fix-not-allowlist ruling.

I ran the commission's branch tripwire; regenerated the manifest cardinalities;
ran the plan's direct-consumer command; searched for assigned and destructured
aliases of `spacing`; enumerated the test files containing
`ant-select-dropdown`; and traced the retry loop and rc-select's actual opening
event at source. I ran no Electron, integration, unit, or CI suite: this branch
contains no code change, and reading is the prescribed method for this round.

The branch tripwire passed: the branch contains the plan and commission only,
both under `docs/`, with no `src/`, `tests/`, or manifest diff. The manifest
regenerated as 7 `expectedFailures`, 10 `expectedFlaky`, and 21
`expectedSkips`; the spacing identity is on none.

## Evidence boundary

- The plan's DOM chain was verified from installed source, not in the running
  Electron app. Runtime shape remains **UNVERIFIED**, as the plan itself says.
- I did not redownload or reparse the 32 CI artifacts. I relied on the
  commission's supplied background and separately read its source-of-record
  investigation drawer; the seven-sighting artifact census is not independently
  remeasured in this review.
- I did not measure Playwright's hit-target race or reproduce routes (a), (b),
  or (c). Conclusions about which route occurred on CI remain **UNVERIFIED**.
- The broad antd-Select class is behavioural and is not decidable by one token
  search. I used the 33-file token result as corroboration and read the exact
  near-verbatim `evaluate`-click population; I do not clear all 33 files as
  behaviourally equivalent.
- I did not read the optional badge-plan precedent. It was not needed to decide
  the current plan's internal control flow.
- I did no live-HA work.

## Claim ledger

| Claim                                                                                                                   | Status                                   | Evidence and result                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reviewed branch is plan-only and docs-only.                                                                         | **MEASURED**                             | `git log`/`git diff` at `c901559…`; confirmed.                                                                                                                              |
| The current helper can accept a foreign popup and search options document-globally.                                     | **MEASURED**                             | `tests/support/dsl/spacing.ts:25-64`; confirmed.                                                                                                                            |
| In a state with only a foreign matching popup, scoping to that popup without ownership still selects the wrong control. | **INFERRED**                             | Direct consequence of `getVisibleSelectDropdown().last()` plus a subtree search; sound as a state argument, not yet run.                                                    |
| Route (b) is delivered by the first caught hit-target error into the `force: true` fallback.                            | **CONTRADICTED**                         | `tests/support/dsl/spacing.ts:37-49` performs a second normal click; a second thrown error escapes and never reaches the fallback.                                          |
| The proposed ownership link is represented by open-only `aria-controls`.                                                | **MEASURED-from-source**                 | `Input.js:183-189`, `Select.js:123`, `OptionList.js:286-307`; confirmed in dependency source, runtime unverified.                                                           |
| The id-bearing node is the hidden virtual listbox inside the popup.                                                     | **MEASURED-from-source**                 | `OptionList.js:286-307`; confirmed. App configuration supplies no virtual/popup-width override at `src/App.tsx:2960-2964`.                                                  |
| `data-testid` lands on one Select root and not the input.                                                               | **MEASURED-from-source**                 | `BaseSelect/index.js:448`, `SelectInput/index.js:148-185`, `Content/index.js:26-44`; confirmed. Runtime count remains unverified.                                           |
| `.ant-select-content-value` is the selected-label node.                                                                 | **MEASURED-from-source**                 | `SingleContent.js:50-102`; confirmed.                                                                                                                                       |
| Setup isolation and assertion authority are conceptually different roles.                                               | **JUDGEMENT**                            | The distinction is valid, but the proposed global precondition prevents the adversarial states and makes the helper non-composable with a legitimately open foreign Select. |
| Legs 1–6 are bidirectional against the real repaired mechanism.                                                         | **CONTRADICTED**                         | The real helper waits for zero visible popups at plan `:507-516`; legs 1, 2, and 5 require a foreign popup already visible at `:793-797`.                                   |
| A capture listener that stops one `click` prevents rc-select from opening.                                              | **CONTRADICTED as written / repairable** | rc-select toggles on `mousedown`, `SelectInput/index.js:116-145,178-185`; a `click` listener fires too late.                                                                |
| The direct consumer population is two spec files.                                                                       | **MEASURED**                             | The published command returns `spacing.spec.ts` and `spacing.visual.spec.ts`; alias searches found no third caller.                                                         |
| S1 is the right blast-radius choice.                                                                                    | **JUDGEMENT**                            | Defensible only as an explicit owner choice; the wider ownership-gap family remains.                                                                                        |
| The work belongs in the fix lane.                                                                                       | **JUDGEMENT / OWNER CALL**               | The literal §3.7 text points toward slice lane; the proposed exception is not in the rule.                                                                                  |
| §4.3 and §5.2 are usable six-field Owner Decision Briefs.                                                               | **MEASURED**                             | Both contain all six fields; confirmed. §7.4 is a third owner call and does not.                                                                                            |

**Weakest claims in this review:** the exact real-CI route remains unknown; I
have not observed the DOM chain in Electron; “one click” in §6 might have been
intended colloquially to mean a `mousedown` listener, although that event is not
what the mechanism specifies; and the literal lane reading remains an owner
classification rather than mine.

## Findings

### SP-1 — SEV 1 — the setup-isolation wait makes the mandatory hostile harness legs exercise the wrong guard

**Three-part blocking proof.** (1) The broken decision is the MANDATORY
COMPANION claim that every guard leg is bidirectional against the real repaired
helper (`CLAUDE.md:20`; plan `:752-765`, `:785-798`). (2) The repaired helper
first waits for the document-wide visible-popup count to become zero
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:507-516`), while leg 1 requires the
margin popup to remain open and legs 2 and 5 require the margin popup to be the
only open popup before the padding path runs (`:793-797`, constructions
`:826-842`). If the foreign popup closes, the hostile state is erased; if it is
suppressed, the helper times out before P1/P2/P4. (3) The recorded pre-run state
assertion at `:843-847` is not mitigation: it happens before the helper itself
consumes that state, and no assertion proves which guard produced the result.

This also answers Q3's crueler attack. One stable, legitimately open unrelated
Select is worse than an extreme hidden popup: the count never reaches zero, so
every spacing mode/preset call waits the full five seconds and fails without
touching the requested Select. Normal calls usually pay only an immediate count
check or a bounded leave animation; composability with a stable foreign popup
pays the full timeout.

**Concrete fix.** Prefer removing the document-global pre-wait from
`openSelectDropdown`: P1 is already the authority and must be tested in the
presence of foreign state. If the owner retains setup isolation, specify a
synchronised construction that introduces the foreign popup only after the
zero-count wait has completed and before the option search, without patching the
helper under test. In either design, record the exact failure site and assert
the post-gesture state for legs 1, 2, and 5. Add the stable-unrelated-popup case,
and add the owned-mid-leave case if the wait is removed.

**What must NOT change.** Keep P1 ownership, P2 subtree scope, P3 real clicks,
P4 read-back, the no-manifest/no-snapshot rule, and the leg-3 halt if a valid
scope-only discriminator refutes the plan.

**Class swept.** I checked every §6 leg whose precondition contains a foreign
visible popup. Legs 1, 2, and 5 definitely collide with the pre-wait. Leg 3 is
underspecified about whether its “scope-only” variant retains that wait; it must
state its exact variant. Legs 4 and 6 start clean and do not collide.

### SP-2 — SEV 1 — the retry loop does not deliver thrown clicks to `force: true` as the plan claims

**Three-part blocking proof.** (1) The broken load-bearing claim is that the
retry loop and fallback are “ONE thing,” that the catch delivers control to the
fallback, and that without `force` the loop's sole purpose would be swallowing
the useful error (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:283-297`,
`:564-581`). That claim is the plan's reason for treating retry removal as
in-scope rather than an owner choice. (2) The current source says otherwise:
attempt 0's thrown error is swallowed, then attempt 1 performs another ordinary
actionability-checked `select.click()`; if attempt 1 throws, `if (attempt === 1)
throw error` exits at `tests/support/dsl/spacing.ts:37-45`, so line 49's forced
fallback is never reached. The fallback is reached only when the final normal
click resolves but the loop still observes no visible popup. (3) §8 labels the
Playwright half inferred but does not mitigate the false TypeScript control-flow
claim, and leg 0 is only a DOM census (`plan:767-783`) despite §2.3 saying it
records this premise.

**Concrete fix.** Correct every causal statement. Then give the owner the honest
choice: (A) retain a bounded second normal click, but make each attempt succeed
only on ownership and remove `force: true`; or (B) remove retry deliberately as
a tolerance reduction, with its intermittent-honest-failure cost. Add a harness
leg in which the first normal click throws and the second normal click succeeds;
that is the path the current rationale erased.

**What must NOT change.** Do not restore `force: true` or the DOM
`evaluate(...click())`; keep wrong-target failures loud and keep P1/P4.

**Class swept.** I traced every retry/fallback claim in the plan: `:283-297`,
`:564-581`, `:1004-1010`, and SR-5 at `:1055`. They repeat the same incorrect
flow. I also checked the whole `SpacingDSL` loop, including both catches and the
post-loop fallback; this is not a token-only finding.

### SP-3 — SEV 1 — legs 2/3 suppress the wrong event phase as specified

**Three-part blocking proof.** (1) Legs 2 and 3 are the plan's load-bearing
discriminator, and their construction claims a one-shot capture listener can
stop the Select seeing one `click` (`plan:800-808`, `:834-842`). (2) The installed
rc-select opens/toggles in `onInternalMouseDown`, not `onClick`:
`node_modules/@rc-component/select/lib/SelectInput/index.js:116-145` calls
`toggleOpen()` and the root binds that handler at `:178-185`. A capture listener
for `click` runs after `mousedown`; the popup has already toggled. (3) The
pre-run state assertion is no mitigation because it precedes the gesture, and
the plan has no post-gesture assertion that the padding Select's
`aria-controls` remained unset. A false leg-3 refutation would incorrectly send
the plan back to the owner under `plan:806-808` and `:898-900`.

**Concrete fix.** Specify the exact native event (`mousedown`, capture phase)
and one-shot removal. Immediately after the Playwright gesture, assert that the
padding combobox still has no `aria-controls`, that the foreign popup remains
visible, and that the pointer action itself completed. Prove the listener is
gone before the next leg.

**What must NOT change.** Do not use `force: true`, patch `src/`, or suppress the
entire Playwright action; the construction must retain actionability while
withholding only rc-select's opening event.

**Class swept.** Legs 2 and 3 are the complete population sharing this
one-shot suppression mechanism. Leg 1 names a different, also underspecified
close suppression and is covered by SP-1's state-survival repair.

### SP-4 — SEV 2 — the third owner decision is omitted from the owner section and has no Owner Decision Brief

The plan tells the owner “Two decisions are yours” and points only to §4.3 and
§5.2 (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:110-112`), but §7.4 says the
lane classification is the owner's to settle (`:902-920`). The literal
`OPERATING_AGREEMENT.md:417-429` reading favors slice lane: it names test DSLs as
capability-class and says capability-shaped fix work halts and re-enters as a
slice. The plan's “new capability only” exception is plausible policy reasoning,
but it is not text in §3.7.

**Owner Decision Brief.** (1) **Protects:** the owner knows which process and
evidence burden governs this shared-helper repair. (2) **Going wrong:** a third
decision is hidden in technical prose and asks the owner to interpret governance
without the required translation. (3) **Product affected:** **No**; this is
process classification, MEASURED from the two documents. (4) **Options/costs:**
A, add a third six-field brief and let the owner choose fix/slice; small document
cost. B, record an explicit owner clarification that all repairs of existing
shared DSLs remain fix-lane; larger governance consequence and it must use the
governed amendment path. (5) **Recommendation:** A now; it resolves this case
without silently amending §3.7. (6) **Do nothing:** implementation could start
under a lane the binding text appears to reject, and the non-developer owner is
left to supply the missing legal interpretation.

**Concrete fix.** Change §0 from two decisions to three and rewrite §7.4 as an
Owner Decision Brief with concrete fix-lane versus slice-lane costs.

**What must NOT change.** The owner retains the classification authority; this
review does not choose the lane or amend §3.7.

**Class swept.** I checked every explicit owner call in the plan. §4.3 and §5.2
contain all six fields; §7.4 is the only omitted/unbriefed one.

### SP-5 — SEV 3 — the wider-family inventory is materially understated

The plan says the same grep returns “~20 further DSL and spec files”
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:702-710`). Regenerating the token
population with `rg -l 'ant-select-dropdown' tests --glob '*.ts' | sort`
returns 33 files: 30 further files after spacing/tabs/popup, not about 20. That
does not prove all 33 are behavioural class members, but it does falsify the
description of what the token grep returns.

**Concrete fix.** Remove the static approximation and publish the regenerating
file-list command as the sole token inventory; retain the warning that it is
corroboration, not a behavioural sweep.

**What must NOT change.** Do not inflate S2 to 33 files based on a token search,
and do not weaken the distinction between a shared construct and shared cause.

**Class swept.** Within §5.2, the exact near-verbatim actionability-bypass
population is spacing/tabs/popup (confirmed by the complete
`option.evaluate(...click())` search); the broader ownership-gap population is
not mechanically decided by this token inventory.

### SP-6 — SEV 3 — the do-nothing consequence smuggles certainty after disclaiming shared cause

The plan correctly labels the tabs/popup causal link a hypothesis at
`docs/testing/SPACING_HELPER_PRESET_PLAN.md:692-700` and again at `:979-982`, but
then says, “the next spacing-shaped flake appears in `tabs` or `popup`” at
`:732-733`. That is a runtime prediction stated as certainty with no diagnosis.

**Concrete fix.** Say the same unowned-popup risk remains in tabs/popup and a
similar failure **could** occur; keep their known sightings explicitly
undiagnosed.

**What must NOT change.** Preserve the measured shared-construct evidence and
the deliberate S1 scope option.

**Class swept.** I read every plan statement connecting the sibling construct
to `tabs.visual:33` or the popup sighting. This sentence is the only one that
crosses from hypothesis to certainty.

## Commission answers

### Q1 — §2.3's routes

**Partly sound, with SP-2 blocking.** The state-level correction is right: if
only a foreign matching popup is open, scoping a search to `.last()` still
selects from the wrong popup, so ownership is stronger than scope. I found no
reading of the current helper that makes the foreign-only state logically
impossible, but neither route (b) nor (c) has been reproduced. I found no fourth
route that changes the required properties; a third unrelated matching Select
is another member of the same foreign-popup class. The specific catch-to-force
delivery story is false for the reason in SP-2.

### Q2 — DOM authority chain

**No issue found in the seven source claims.** `aria-controls`/`aria-owns` are
open-only; `useId` supplies an id; the id-bearing node is inside the popup and is
the hidden 0×0 listbox under virtualisation; app and component configuration do
not disable virtualisation; `data-testid` remains on one root; and
`.ant-select-content-value` is the selected-label node while its parent also
contains the input and the conditional placeholder. These remain
source-measured, not Electron-observed.

### Q3 — setup isolation

**The role distinction is valid, but this implementation is not.** A global
wait may be a setup precondition without becoming identity authority; however,
the proposed wait cannot create zero state, only wait for ambient code to do so.
A stable unrelated popup gives a full five-second false failure, and the same
wait invalidates the harness population. See SP-1.

### Q4 — blast radius

**No issue found in the direct-consumer claim.** The published method-call
command returns exactly `tests/e2e/spacing.spec.ts` and
`tests/e2e/spacing.visual.spec.ts`. The canvas file's sole `spacing` hit is the
docblock path at `tests/e2e/canvas-resize-and-nesting.spec.ts:23`. Searches for
assigned `ctx.spacing` aliases and renamed destructuring found none.

### Q5 — harness

**Not executable as claimed.** Legs 2/3 are a valid conceptual discriminator,
but the retained pre-wait consumes their state (SP-1), and the suppression event
is wrong/underspecified (SP-3). Leg 5 would isolate P4 only after the pre-wait is
removed from its path. Leg 6 is an adequate known-bad control if its named
`toHaveCount(1)` failure and runner exit are recorded, rather than merely caught
inside a passing wrapper. Re-establishing state immediately before the helper is
insufficient when the helper's first action destroys it. The owned-mid-leave
case should be added if SP-1 is repaired by removing the wait; with the current
wait it is waited away and therefore cannot test the authority.

### Q6 — scope

**S1 is defensible as an explicit owner choice; no root-cause smuggling was
found apart from SP-6's predictive wording.** The class is correctly stated as
behaviour first. Tabs and popup are the only near-verbatim siblings carrying the
same global search plus `evaluate` click; many more helpers carry the ownership
gap with different code. Leaving them is deliberate scope, not an unnoticed
clean sweep, but the owner must resolve the lane question before relying on S1.

### Q7 — over-reach

**Removing `force: true` and the option `evaluate` click is in scope; removing
the normal retry is not justified by the stated control flow.** The author may
still recommend removal as a tolerance simplification, but it needs the honest
owner choice and the missing retry-success leg in SP-2.

### Q8 — governance lane

**Owner call; the plan's literal-text defence is weak.** §3.7's words point to
slice lane for a test DSL and contain no existing-repair exception. The owner
can clarify or choose the intended classification, but §7.4 does not frame that
choice in the required six fields. See SP-4.

### Q9 — owner-facing quality

**§0, §4.3, and §5.2 are understandable and the two named briefs contain all
six fields.** The hidden third decision at §7.4 means the owner-facing surface
is incomplete, not that those two briefs are defective. See SP-4.

### Q10 — unpredicted cases

**Three material cases survived the author's commission run:** the global
pre-wait consumes the harness's hostile state; the retry catch does not flow to
force after the second thrown click; and rc-select opens on `mousedown`, not the
`click` event the harness says it suppresses. SP-5/SP-6 are lower-severity
inventory and evidence-language residue.

## MemPalace drawer candidates

**Candidate — wing `havdm`, room `review`, `added_by="codex"`:**

> [REVIEW] Spacing-helper preset plan round 1 at reviewed head
> `c90155984db3edfc3e200a7ab1d808a9ec5f8462` returned SEV-1-BLOCKED. Three
> blockers: the proposed document-global zero-popup precondition consumes the
> foreign-popup states required by mandatory harness legs 1/2/5 before their
> claimed guards run; the plan's retry-to-force narrative contradicts
> `tests/support/dsl/spacing.ts:37-49`, where a second thrown normal click escapes
> and never reaches force; and legs 2/3 specify suppressing `click` although
> rc-select toggles on `mousedown`. Non-blocking: §7.4 is a third owner decision
> omitted from §0 and lacks the six-field brief; the broad token inventory is 33
> files, not ~20; one tabs/popup consequence is stated as certainty after being
> labelled a hypothesis. Review artifact:
> `docs/reviews/spacing-helper-preset-plan-codex-review.md`. No code or suites
> were run; implementation remains blocked pending revision and STRAT-D7
> same-reviewer follow-up.
