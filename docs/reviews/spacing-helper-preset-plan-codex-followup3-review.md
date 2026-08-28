# SEV-1-BLOCKED — scoped follow-up 3 review of the spacing-helper preset plan

Author and repair author: Claude Opus 5 (interested party)  
Reviewer: OpenAI Codex / GPT-5.6 Sol (same reviewer as rounds 1–3)  
Owner gate: micah / BaggyG-AU; this review decides nothing on its own  
Reviewed head: `6f839ec64a5e39a4930a179aa2b60e02b6f130d6`

## Verdict

**SEV-1-BLOCKED.** Option B is the first ownership mechanism in this arc whose
identity mapping is supported both by the installed antd path and by a recorded
probe before implementation, and I found no current source-backed path by which a
foreign popup can acquire the requested Select's correctly generated class. The
revision is nevertheless not ready to implement: the rewrite defines P4 but
deletes the only caller example that invoked it, and the proposed “helper, in
full” never calls `expectSelectShows`. The mandatory P4 detector is therefore an
orphan rather than part of the repaired path (SP-15). No implementation may begin
from this revision.

I deliberately attacked option B as my own round-3 recommendation. Its class
placement is stronger than the two inferred authorities it replaces, but the
attack did find that the plan overstates the older background precedent and that
its naming-drift mitigation depends on the very P4 call the rewrite dropped.

## SP-11…SP-14 disposition

| Finding   | Disposition            | Follow-up result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **SP-11** | **RESOLVED**           | The false Playwright TOCTOU mechanism is now retracted in every one of the five previously swept surfaces. I read §2.3, §6's state/route limit, §8, §9 and §10/SR-5 end to end and corroborated with searches for `TOCTOU`, `hit.target`, `displaced`, `moved target`, `delivered` and route (b). The surviving statements are historical retractions, the true P3 hit-target guard, or the explicit statement that route (b)'s mechanism is unknown (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:345-366`, `:1432-1446`, `:1540`, `:1557`, `:1641`).                                                                                                                                                                                                                                            |
| **SP-12** | **PARTIALLY RESOLVED** | The P4-ONLY variant now has a document-global opener derived from SCOPE-ONLY, and rows 1–9 have honest evidence kinds (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:1042-1060`, `:1099-1124`). The repair does not close the whole class: leg 0 and legs 10–12 have no declared kind, leg 12 is called acceptance evidence despite the rule that acceptance rows come from the first two kinds, and §7's implementation order still says legs 1–8, omitting leg 9 and the later caller/repeat/CI legs. SP-17. More importantly, the P4-only control now exercises a method that the actual proposed helper never invokes; SP-15.                                                                                                                                                                  |
| **SP-13** | **RESOLVED**           | The retained measurement record reports the delayed-close construction directly: two visible popups for 350.6/353.0/359.9 ms and the foreign-only P1+P2 window for 45.4/60.9/66.8 ms. Revision 4 restores route (a) and leg 1 and replaces option D (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:319-343`, `:478-512`, `:1093-1097`). Installed rc-select source independently supports the immediate-open/deferred-close mechanism (`node_modules/@rc-component/select/lib/hooks/useOpen.js:33-35,57-80`; `node_modules/@rc-component/select/lib/hooks/useSelectTriggerControl.js:28-37`). I did not re-run the app, so the durations remain author-recorded runtime evidence, not my measurement. SP-19 narrows the unsupported “every transition” wording without reopening this disposition. |
| **SP-14** | **PARTIALLY RESOLVED** | The 50 ms floor is gone and both resolver waits are intended to share an absolute deadline (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:703-740`). Each guard and its wait recompute `left()` separately, however. The first read can be positive and the second zero; Playwright treats timeout zero as no progress timer (`node_modules/playwright-core/lib/server/progress.js:67-75`). The plan therefore does not yet guarantee that each wait receives the claimed positive remainder. SP-16.                                                                                                                                                                                                                                                                                               |

## Confidence and method

**Confidence: high on SP-15, SP-16 and SP-17; high on the source half of option
B; medium on runtime consequences I did not re-measure; high on SP-18 and
SP-19's documentary claims.**

The pinned-tree gate passed before review: branch
`feature/spacing-helper-preset-plan`, head
`6f839ec64a5e39a4930a179aa2b60e02b6f130d6`, `main` =
`08a9544643ef01aed843fa9babf1892291ed3e7f`, clean worktree, and every branch
change under `docs/`. I read the commission first, revision 4 in full, the three
prior reviews and round-3 commission in the required order, then the current
spacing DSL/spec/product component, the background precedent and its consumers,
`OPERATING_AGREEMENT.md` §3.7, and the installed antd/rc-select/rc-trigger and
Playwright paths cited below.

I regenerated:

- the direct spacing-DSL consumer command: it returns
  `tests/e2e/spacing.spec.ts` and `tests/e2e/spacing.visual.spec.ts`;
- assigned/destructured alias searches: no renamed caller was found;
- `renderSection(`: the two calls are at
  `src/components/SpacingControls.tsx:228-229`;
- the four proposed class tokens: no existing collision under `src/`, `tests/`
  or `tools/`;
- the `SpacingControls` product consumer: one JSX use at
  `src/components/PropertiesPanel.tsx:6632`;
- the five background popup class tokens: component props, the DSL map, and the
  product CSS at `src/index.css:26-40` all consume them;
- the manifest populations: 7 `expectedFailures`, 10 `expectedFlaky`, 21
  `expectedSkips`; the spacing identity is absent.

Regenerating commands for those finite populations:

```bash
rg -l '\bspacing\.(setCardMargin|setCardPadding|setMarginMode|setPaddingMode|setMarginSide|setPaddingSide|expectCardMarginApplied|expectCardPaddingApplied|expectSpacingScreenshot)\b' tests src tools | sort
rg -n '\b(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*[^;\n]*\.spacing\b|\{[^}\n]*\bspacing\s*:' tests src tools
rg -n 'renderSection\(' src/components/SpacingControls.tsx
rg -n '<SpacingControls\b|SpacingControls\(' src tests tools
rg -n 'spacing-margin-mode-popup|spacing-margin-preset-popup|spacing-padding-mode-popup|spacing-padding-preset-popup' src tests tools
rg -n 'bg-type-dropdown|bg-image-position-dropdown|bg-image-size-dropdown|bg-image-repeat-dropdown|bg-blend-dropdown' src tests tools
rg -n 'expectSelectShows|selectOptionByText\(|openSelectDropdown\(' docs/testing/SPACING_HELPER_PRESET_PLAN.md
node -e "const m=require('./tests/baseline/expected-failures.json'); console.log(m.expectedFailures.length,m.expectedFlaky.length,m.expectedSkips.length,/applies spacing presets/i.test(JSON.stringify(m)))"
```

The `expectSelectShows` population is mechanically decisive: `rg -n
"expectSelectShows" docs/testing/SPACING_HELPER_PRESET_PLAN.md` returns its
definition, the private-surface inventory and leg 5, but no production-path call.
I then read the complete current caller population at
`tests/support/dsl/spacing.ts:102-124`: `setPreset`, `setMarginMode` and
`setPaddingMode` are the three internal callers that must be rewritten.

## Evidence boundary

- I did **not** run the Electron app, the deleted probes, the e2e suite, CI, unit
  tests or integration tests. I can verify that the retained M5–M7 record says
  what revision 4 reports and that installed source supports the mechanisms; I
  cannot independently re-measure the runtime values.
- M5/M6 are therefore **author-recorded runtime evidence**. The source-level
  scheduling asymmetry is measured this session; popup visibility durations and
  the six-frame samples are not.
- M7's API path is independently source-backed: antd merges
  `classNames.popup.root` into `popupClassName`
  (`node_modules/antd/lib/select/index.js:171-180,220-250`), rc-select passes that
  to the trigger (`node_modules/@rc-component/select/lib/SelectTrigger.js:119-143`),
  and rc-trigger attaches it to the popup root
  (`node_modules/@rc-component/trigger/lib/Popup/index.js:146-170`). I did not
  repeat the jsdom probe or observe the class in Electron.
- I did not execute legs 1–12 or the capture-listener/style constructions. The
  listener/interceptor interaction remains genuinely open.
- I did no live Home Assistant work and changed no plan, source, test, snapshot
  or manifest file. This review adds only its own document.

## G2 — option B and the reopened clearance

### M5–M7

The retained investigation drawer and revision 4 agree on the M5/M6 values and
method. Installed source explains why the transition can exist, but not its
duration or Playwright visibility, so I do not relabel those values as my
measurement. The earlier clearance of option D is withdrawn for the wider claim:
my static check could not fail on the temporal actor that M6 measured.

M7 is stronger at this boundary. The installed antd implementation confirms the
class reaches the rc-select popup class path, and the proposed four strings are
distinct by construction from the two `renderSection` calls and the `-mode` /
`-preset` suffixes. The collision search is clean. Electron placement remains
unrun, but the repaired resolver's count and visibility assertions are an
appropriate fail-closed runtime check once the implementation exists.

Leg 1 should be the first option-B mechanism leg after implementation and must
retain its `max < 2` no-result rule. A separate static component test would move a
future missing-class failure nearer its source, but is not required for safety:
missing and duplicate classes already fail `toHaveCount(1)`. A class attached to
the wrong Select is the harder drift case; P4 is the downstream protection, which
is why SP-15 blocks while it is unwired.

### Naming, product hook and silent wrong-control paths

With the proposed source mapping exactly as written, I found no current path by
which a foreign popup carries the requested unique class. Closed popup retention
does not defeat the mapping because the resolver separately requires visibility.
Missing or duplicate classes are loud. A swapped/misattached unique class would
pass the class count and visibility checks; wired P4 would make it loud, but the
current revision's orphaned P4 would not. That is the remaining silent path in the
plan as written, not a defect in antd's class placement.

The product hook is acceptable as the owner's option-B trade, but the cited
background precedent proves less than the plan says. Those five classes are also
product CSS selectors, and the DSL silently falls back to a global locator when
the scoped lookup fails. They support the API shape, not the claim that this
repository already protects five equivalent test-only hooks. SP-18 corrects the
record without reopening the owner judgement.

## G3 — scope and regression

The option-B replacement justifies deleting option D's singleton assertion and
document-global `:visible` locator. Deleting the 50 ms floor is also in scope,
although SP-16 shows the replacement deadline still has a narrow zero-time hole.
Keeping `isOpen` only for retry gating and the scoped close post-condition is a
sound demotion.

I found no owner-ruled over-reach into unrelated product behaviour, manifest
state, snapshots or background-control migration. The material under-reach is
SP-15: revision 4 rewrites the private signatures but omits the complete caller
rewrite, including P4, that revision 3 showed explicitly.

## G4 — previously clean areas

- **§5.1 direct consumers:** PASS at the stated lexical boundary. The published
  command still returns two spec files; alias searches found no renamed caller.
- **§5.1a new product surface:** collision and `renderSection` enumerations pass.
  `SpacingControls` itself has one JSX consumer. Its “no markup”/precedent account
  needs SP-18's correction.
- **§5.2 class statement:** PASS. It remains behavioural first and keeps shared
  construct separate from unproved shared cause.
- **P2 and P3:** PRESENT. The option search is scoped to the class-owned popup,
  requires one option, and uses an ordinary Playwright click.
- **P4:** DECLARED BUT NOT WIRED. SP-15.
- **`.ant-select-content-value`:** PASS from installed source at
  `node_modules/@rc-component/select/lib/SelectInput/Content/SingleContent.js:50-89`.
- **No-force/no-evaluate/Escape guard rails:** PASS in the proposed path. None is
  restored.

## G5 — lane and cost

The §7.4 re-examination is honest reasoning, not a hidden rationalisation: it
names the changed fact, preserves the literal-text counter-reading and labels the
subject-versus-extension conclusion as the author's judgement. My literal reading
of `OPERATING_AGREEMENT.md:417-429` still favours slice lane because test DSLs are
named capability machinery and the hybrid ban has no file-extension exception.
The two-line `src/` hook strengthens the cost/blast-radius side of that reading,
but does not change the subject of the work. The owner's case-specific fix-lane
ruling remains binding; this is **JUDGEMENT / SEV 4**, not a blocker.

§7.5 is directionally candid but incomplete. It names review rounds, findings,
discarded mechanisms and zero shipped-code lines, but not the author repair time,
owner re-adjudications, two probe-exception cycles, the round-2 formatting gate
failure, or the two local-only review handoffs. Its “measure earlier” conclusion
is supported; its inventory is not the complete process cost. This is judgement,
not a new severity finding.

## G6 — unpredicted interactions

SP-15 is the round's analogue to SP-8 and SP-12: option B's private-signature
rewrite is individually coherent and P4 is individually coherent, but their
integration disappeared when the previous caller example was removed. SP-16 is
the deadline equivalent: the expiry guard and remaining-time wait are each right
in isolation, but recomputing between them permits zero. SP-17 shows the narrowed
KIND contract was applied to the main guard table rather than the actual numbered
population.

The load-bearing runtime claim still awaiting the app is M7 in Electron. The plan
properly discloses that boundary. What it does not properly do is wire the detector
that makes a class-mapping drift loud.

## Claim ledger

| Load-bearing claim                                                                            | Tag                                       | Evidence and result                                                                                                                         |
| --------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| The reviewed tree matches the pinned commission and is clean/docs-only.                       | **MEASURED**                              | Branch/head/base/status/log/diff regenerated; confirmed.                                                                                    |
| SP-11's false mechanism is gone from the five swept surfaces.                                 | **MEASURED**                              | Behavioural read plus differently keyed searches; resolved.                                                                                 |
| SP-12 now gives every numbered leg an evidence kind and makes every acceptance row two-sided. | **MEASURED — CONTRADICTED**               | Kind table covers 1–9; 0 and 10–12 are outside it, while leg 12 is acceptance evidence; SP-17.                                              |
| SP-13's transient construction was measured at the reported durations.                        | **INFERRED from retained record**         | The investigation record and plan agree; installed source supports the scheduling route; app not re-run.                                    |
| The resolver always gives each wait a positive remaining deadline.                            | **MEASURED — CONTRADICTED**               | Guard and timeout recompute `left()`; zero disables Playwright's progress timer; SP-16.                                                     |
| antd 6.1.4 places `classNames.popup.root` on the rc-trigger popup root.                       | **MEASURED from installed source**        | `antd/lib/select/index.js:171-180,220-250`; rc-select trigger `:119-143`; rc-trigger popup `:146-170`. Electron not observed.               |
| The proposed four class strings are distinct and collision-free in the current tree.          | **MEASURED with lexical/source boundary** | Two render calls × two suffixes; collision search under `src/`, `tests/`, `tools/` returned no hit.                                         |
| The proposed repaired path executes P4 after a selection.                                     | **MEASURED — CONTRADICTED**               | `selectOptionByText` ends without P4 and `expectSelectShows` has no caller; SP-15.                                                          |
| No current correctly generated foreign popup can satisfy option B's requested class.          | **INFERRED from source**                  | Each JSX class derives from the same local `testIdPrefix` as its root test id; missing/duplicate mappings fail count. Runtime not executed. |
| The background classes are five equivalent unprotected test hooks.                            | **MEASURED — CONTRADICTED**               | Product CSS consumes all five and the DSL has a global fallback; SP-18.                                                                     |
| M5 occurs on every Select-to-Select transition.                                               | **INFERRED — OVERCLAIMED**                | Three recorded samples plus scheduling source do not decide the universal; leg 1 itself admits no-entry runs; SP-19.                        |
| The direct spacing-DSL consumer population is two files.                                      | **MEASURED with lexical boundary**        | Published command reproduced; assigned/renamed alias searches found no third caller.                                                        |
| The lane re-examination is honest but the literal text still favours slice.                   | **JUDGEMENT**                             | Plan §7.4 preserves both readings; `OPERATING_AGREEMENT.md:417-429`. Owner ruling controls.                                                 |

**Weakest claims in this review:** I did not observe option B in Electron or repeat
the jsdom probe; I have not run the capture-listener construction against
Playwright's interceptor; the swapped-class silent path is a drift construction,
not current source; and SP-16's zero-time window is narrow even though the source
semantics are definite. Those are respectively NOT RUN, NOT RUN, INFERRED and
MEASURED-from-source / unmeasured-frequency.

## Findings

### SP-15 — SEV 1 — P4 is defined but never wired into the proposed helper path

**Three-part blocking proof.** (1) The broken decision is that the repaired helper
must have P4 outcome read-back, that P4 is the cheap detector behind P1–P3, and
that §4.4 presents the proposed helper “in full”
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:413-439`, `:636-646`). (2) The actual
proposal's `selectOptionByText` opens, locates, clicks and waits for close, then
returns without invoking P4 (`:771-796`). `expectSelectShows` is defined at
`:798-808` but has no caller anywhere in the plan. The current caller population
that must be rewritten is `setPreset`, `setMarginMode` and `setPaddingMode`
(`tests/support/dsl/spacing.ts:102-124`). Revision 3 included a caller example
that invoked P4; revision 4 removed it while changing the private signatures.
(3) No recorded mitigation covers an orphaned detector. The class count makes a
missing/duplicate mapping loud, but a unique class attached to the wrong Select
can pass P1/P2; later computed-style assertions cover only some callers and do not
provide the immediate named DSL failure the plan promises. Leg 5 can prove an
orphan method fails when called; it cannot prove that the repaired path calls it.

**Concrete fix.** Restore a complete caller proposal for all three internal
callers. Each must build one `testId` and expected pattern, call
`selectOptionByText(testId, pattern)` exactly once (without separately opening the
Select), then call `expectSelectShows(testId, pattern)`. Keep the string branches
of `setCardMargin`/`setCardPadding` routing through `setPreset`. Make the harness
show P4 fails when the same wired path is run against the P4-only hostile variant.

**What must not change.** Keep option B's class identity, subtree scope, normal
click, class count/visibility checks, retry gating, no-force/no-evaluate bans and
the owner-selected S1 scope.

**Class swept.** I enumerated every `expectSelectShows`, `selectOptionByText` and
`openSelectDropdown` reference in the revision, then read the complete current
private-caller population. The three callers above are the population; the two
public card setters reach it through `setPreset`.

### SP-16 — SEV 3 — the deadline guard does not guarantee a positive timeout

Each resolver stage calls `left()` once in its expiry guard and again when
building the matcher options (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:726-740`).
If the first read is 1 ms and the second is 0, `timeout: 0` reaches Playwright.
Its `ProgressController` installs a timer only when `timeout` is truthy
(`node_modules/playwright-core/lib/server/progress.js:67-75`), so zero means no
deadline rather than immediate expiry. This is a narrow edge and remains bounded
in normal timing, so I retain SP-14's SEV 3 rather than promoting it.

Capture the remainder once per stage, reject `<= 0`, and pass that same positive
value to the matcher. I checked both waits in `resolveOwnedDropdown`; both repeat
the same pattern, and no other wait is inside the claimed shared resolver budget.

**Class swept.** I checked every wait inside `resolveOwnedDropdown` and every
`left()` read in the proposal. The count and visibility stages are the complete
population; both use the split guard/value pattern.

### SP-17 — SEV 3 — the KIND repair and implementation sequence do not cover the numbered harness population

The revision says each leg declares its evidence KIND, that the record states the
kind beside every result, and that acceptance evidence comes from the first two
kinds (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:1042-1060`). The table covers
legs 1–9. Leg 0 and legs 10–12 sit outside it (`:1067-1086`, `:1193-1203`); leg 12
is explicitly called acceptance evidence despite not having a first-two-kind
classification. The implementation order is also stale: it says leg 0 “can
falsify option A” and then names legs 1–8, although option A is already dead and
leg 9 plus caller/repeat/CI legs remain (`:1224-1227`).

Add kinds for the actual 0–12 population, or explicitly scope the KIND rule to
mechanism legs 1–9 and define separate census/regression/repeat/gate categories.
Narrow the “acceptance must come from the first two kinds” rule to the defect
mechanism if CI is intentionally aggregate acceptance. Then update the sequence
to put the Electron option-B check first after source implementation and name all
remaining leg groups.

**Class swept.** I checked every numbered leg, the kind table, the acceptance
rule and the implementation sequence. The omission population is 0 and 10–12;
the stale sequence separately omits 9–12.

### SP-18 — SEV 3 — the product-hook precedent and blast-radius account are materially unlike the cited surface

The plan calls the five `BackgroundCustomizer` classes equivalent test hooks and
uses them to support durability and lane reasoning
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:539-546`, `:1022-1028`,
`:1306-1312`). All five are product CSS selectors: `src/index.css:26-40` hides
their leave-transition remnants. The DSL map exists, but its consumer falls back
to a document-global popup if the scoped lookup returns null
(`tests/support/dsl/backgroundCustomizer.ts:44-60`, `:186-212`). Those classes
therefore have a product purpose and their DSL does not fail closed on omission.
They are API-shape precedent, not five examples of the same unprotected test-only
contract.

Correct the precedent narrowly and replace “no markup” at plan `:881-885` with
the accurate claim: no state/layout/behaviour is intended, but the popup's class
attribute changes. Name the one `SpacingControls` product consumer at
`src/components/PropertiesPanel.tsx:6632`. This does not reopen the owner's
option-B judgement or require migrating the background controls.

**Class swept.** I enumerated all five background class tokens across `src/`,
`tests/` and `tools/`, then read their component definitions, CSS consumers, DSL
map and lookup call sites. The CSS and fallback above are the two omitted roles.

### SP-19 — SEV 3 — three observed transitions do not establish “every transition”

Revision 4 says option D is false on “every Select-to-Select transition” and that
route (a) is what the ordinary path does “EVERY TIME”
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:7-14`, `:329-343`). M5/M6 report
three finite observations. The installed scheduling asymmetry makes overlap
plausible and repeatable, but does not guarantee that both popup boxes become
Playwright-visible on every machine and timing. The plan later admits that leg 1
may record `max < 2` and must then return no result (`:1134-1144`, `:1505-1510`).

State the measured population: the ordinary sequence produced the overlap in
each of the three recorded runs. Keep the `max < 2` no-result guard. Option B does
not depend on the universal, so this is evidence-language residue rather than a
mechanism blocker.

**Class swept.** I checked every revision-4 statement that promotes M5/M6 from
the recorded sample to all ordinary transitions and compared it with leg 1's
entry guard. The two quoted live universals are the defects; the measured values
and no-result rule are soundly scoped.

## MemPalace drawer candidates

**Candidate — wing `havdm`, room `review`, `added_by="codex"`:**

> [REVIEW] The same-reviewer STRAT-D7 follow-up 3 of
> `docs/testing/SPACING_HELPER_PRESET_PLAN.md` revision 4 at reviewed head
> `6f839ec64a5e39a4930a179aa2b60e02b6f130d6` returned SEV-1-BLOCKED. SP-11 is
> resolved; SP-12 and SP-14 are partially resolved; SP-13 is resolved by the
> retained M5/M6 measurement record, though the app was not re-run. New blocker
> SP-15: revision 4 defines `expectSelectShows` but no proposed caller invokes it,
> so P4 is orphaned and the complete public-caller rewrite from revision 3 has
> disappeared. Non-blocking findings: SP-16, the deadline guard and matcher
> timeout recompute the remainder so zero can disable Playwright's timer; SP-17,
> the KIND table covers legs 1–9 but not 0/10–12 and the implementation sequence
> is stale; SP-18, the five background popup classes are product CSS hooks and
> their DSL falls back globally, so they are not equivalent durability precedent;
> SP-19, three observed transitions do not support “every transition.” Installed
> source supports option B's class-placement path, but Electron/jsdom probes and
> suites were not run. Review artifact:
> `docs/reviews/spacing-helper-preset-plan-codex-followup3-review.md`.
