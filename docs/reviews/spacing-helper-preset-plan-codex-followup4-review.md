# SEV-1-BLOCKED — scoped follow-up 4 review of the spacing-helper preset plan

Author and repair author: Claude Opus 5 (interested party)  
Reviewer: OpenAI Codex / GPT-5.6 Sol (same reviewer as rounds 1–4)  
Owner gate: micah / BaggyG-AU; this review decides nothing on its own  
Reviewed head: `c707cd8b87f182d12bf11c512497ee712e640511`

## Verdict

**SEV-1-BLOCKED.** Revision 5 repairs the literal defects in SP-15, SP-16,
SP-18 and SP-19, and it repairs SP-17's evidence taxonomy. My independently
keyed deletion audit accounted for all 52 lines removed between revisions 4 and
5; none disappeared without a replacement, narrowing, relocation or deliberate
reformat.

The revision is nevertheless not ready to implement. SP-17's replacement
sequence now requires the fail-old/pass-new leg 1 to run before the repaired
helper it invokes has been implemented (SP-20). P4 is wired, but its new
load-bearing claim is false in an idempotent state: if the requested control
already shows the expected value, a correctly formed but misattached class can
operate the other control and P4 still passes (SP-21). Both defects break
mandatory evidence or mitigation on which the plan relies. No implementation may
begin from this revision.

Option B itself is not reopened. The proposed source mapping still identifies
each popup by construction when implemented exactly as written. The blockers are
in the order used to prove that implementation and in the claimed coverage of
its residual detector.

## SP-15…SP-19 disposition

| Finding   | Disposition            | Follow-up result                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SP-15** | **RESOLVED**           | The complete internal population is now present: `setPreset`, `setMarginMode` and `setPaddingMode` each create one pattern, call `selectOptionByText` exactly once, do not call `openSelectDropdown` separately, and then invoke `expectSelectShows` with the same pattern (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:897-936`; current population `tests/support/dsl/spacing.ts:102-124`). SP-21 attacks what wired P4 can prove, not whether it is wired. |
| **SP-16** | **RESOLVED**           | `budgetFor(stage)` reads `Date.now()` once, rejects a non-positive result, and returns that same positive number to each matcher (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:776-816`). No wait inside the shared resolver receives zero. The new §8 statement about every expiry causing a second gesture is separately false (SP-23), but it does not reopen the positive-timeout repair.                                                                  |
| **SP-17** | **PARTIALLY RESOLVED** | The four-kind table is explicitly scoped to mechanism legs 1–9, the second table covers 0 and 10–12, and the acceptance rule now distinguishes mechanism evidence from release vetoes (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:1200-1237`). The replacement implementation sequence names all groups but orders repaired leg 1 before the repaired helper exists (SP-20).                                                                                 |
| **SP-18** | **RESOLVED**           | The old durability/lane overstatement is gone. The plan now identifies the background classes as product CSS surface, the background DSL's global fallback and forced click, the class-attribute markup change, and `SpacingControls`'s one product consumer (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:589-607`, `:1029-1047`, `:1174-1186`, `:1497-1511`). SP-24 concerns the stronger new historical inference drawn from the CSS comment.               |
| **SP-19** | **RESOLVED**           | The two live universals are replaced by the measured population: three recorded margin-then-padding runs, all entering the overlap, with an explicit statement that this does not establish every machine/timing (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:23-29`, `:360-375`). A widened search found the old wording only in historical disposition text.                                                                                                |

## Confidence and method

**Confidence: high on SP-20 through SP-23; medium-high on SP-24's evidence
classification; high on the line-deletion accounting.**

The pinned-tree gate passed before review: branch
`feature/spacing-helper-preset-plan`, head
`c707cd8b87f182d12bf11c512497ee712e640511`, `main` =
`08a9544643ef01aed843fa9babf1892291ed3e7f`, clean worktree, and every branch
change under `docs/`. I read the commission, revision 5 in full, reviews 4, 3, 2
and 1 in that order, and then every named source range.

I directly diffed revision 4 against revision 5 with the commissioned command:

```bash
git diff 6f839ec c707cd8b -- docs/testing/SPACING_HELPER_PRESET_PLAN.md
```

The diff is 363 additions and 52 removals. I then regenerated the removal-only
view with zero context and accounted by contiguous deletion block rather than by
identifier or heading. That key differs from the author's revision-3 structural
inventory and is recorded below.

I also swept:

- every proposed `expectSelectShows`, `selectOptionByText` and
  `openSelectDropdown` reference, then the complete current caller population;
- every numbered harness leg, variant definition and sequencing reference;
- every revision-5 statement about budget expiry and a second gesture;
- all live M5/M6 population wording;
- all `BackgroundCustomizer` precedent claims and the five class consumers named
  by the commission;
- all cost-round and finding-count statements.

Installed source still supports option B's class path: antd merges
`classNames.popup.root` into `popupClassName`
(`node_modules/antd/lib/select/index.js:171-180,220-250`), rc-select passes it to
the trigger (`node_modules/@rc-component/select/lib/SelectTrigger.js:119-143`),
and rc-trigger applies it to the retained popup root
(`node_modules/@rc-component/trigger/lib/Popup/index.js:146-170`).

## Evidence boundary

- I did **not** run Electron, recreate either deleted probe, execute harness legs
  0–12, or run unit, integration, e2e or CI suites. M5–M7 remain
  author-recorded runtime evidence; I checked their retained wording and source
  mechanism, not their runtime values.
- SP-20 is decided from the plan's own dependency order: repaired leg 1 invokes
  the §4.4 helper, while §7 schedules that helper afterwards. I did not attempt
  to invent an unstated temporary implementation.
- SP-21 is a deterministic state/control-flow counterexample, not a reproduced
  Electron failure. It uses values the product source exposes on both controls
  (`src/components/SpacingControls.tsx:147-178`) and the public setter path at
  `tests/support/dsl/spacing.ts:137-172`.
- The CSS comment at `src/index.css:26-40` is source evidence of intended
  leave-remnant suppression. It is not an incident record or a second runtime
  measurement of M5.
- I changed no plan, application, DSL, test, snapshot, manifest or CI file. This
  review adds only its own document.

## Direct accounting for every removed revision-4 line

The table covers all 19 contiguous deletion blocks and all 52 removed lines.
“Replaced” means the semantic role remains in revision 5; it does not mean I
accept every new sentence as correct.

| Revision-4 lines | Removed | Accounting                                                                                                                                                                                   |
| ---------------- | ------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `7`              |       1 | The revision-4 status line is retained as the historical header after the new revision-5 status.                                                                                             |
| `11-13`          |       3 | The unsupported “every Select-to-Select transition” header is replaced by the three-run population and explicit non-universal boundary.                                                      |
| `125-126`        |       2 | “Does exactly this” is replaced by the narrower API-shape precedent and the product-CSS/test-only distinction.                                                                               |
| `340-343`        |       4 | “Every time” is replaced by “every run measured,” the three-run population, reachability requirement and no-result caveat.                                                                   |
| `618`            |       1 | “Same pattern” is replaced by “same API,” with the non-equivalent test-only contract named.                                                                                                  |
| `638-642`        |       5 | The revision-4 helper introduction is expanded to identify the omitted callers and make the restored block normative.                                                                        |
| `712-717`        |       6 | `left` plus unconditional `expired` are replaced by `budgetFor`, which performs the single read, non-positive guard and return.                                                              |
| `726`            |       1 | The first separate expiry guard is folded into `budgetFor('the popup class could be counted')`.                                                                                              |
| `731`            |       1 | The first `timeout: left()` is replaced by that same returned positive stage budget.                                                                                                         |
| `736`            |       1 | The second separate expiry guard is folded into `budgetFor('the popup became visible')`.                                                                                                     |
| `740`            |       1 | The second `timeout: left()` is replaced by that same returned positive stage budget.                                                                                                        |
| `883-885`        |       3 | “No markup” is corrected to one added class token, with no intended behavior/layout/style/state or product consumer.                                                                         |
| `889`            |       1 | The render-site sentence is retained and expanded with the sole `SpacingControls` consumer and regeneration command.                                                                         |
| `1023-1024`      |       2 | The background blast-radius entry is expanded to include product CSS, global fallback context and the explicit no-migration boundary.                                                        |
| `1058-1060`      |       3 | The over-broad acceptance rule is replaced by the full 0–12 category table and a mechanism-only acceptance rule.                                                                             |
| `1114-1124`      |      11 | The table header, separator and all nine mechanism rows are reformatted in full. Cases 1–9 all remain; leg 5 is strengthened to invoke the wired caller. No case or oracle is deleted.       |
| `1225-1227`      |       3 | The stale option-A/legs-1–8 sequence is replaced by a five-stage sequence covering source, mechanism legs, regression, repeat, checks and CI. Its new dependency inversion is SP-20.         |
| `1311`           |       1 | The lane argument's “five hooks” sentence is replaced by the narrower API precedent and reduced lane weight.                                                                                 |
| `1512-1513`      |       2 | The interceptor weak-claim sentence is retained with its survival period updated from revision 3 to revisions 3 and 4; the same open question is also carried into the revision-5 weak list. |

**Result:** no removed line is unaccounted for and no load-bearing sentence was
silently deleted in revision 5. The blocking sequence defect is in the replacement
for old lines 1225–1227; the other findings are additions or stale surviving
sentences, not losses.

## G3 — whether wired P4 is sufficient

P4 is now reached through all three callers, and leg 5 now reaches it through
`setPreset`. That fixes SP-15's integration failure. It does **not** establish the
stronger claim that P4 closes a correctly formed but misattached-class path.

One valid state is enough to refute that universal:

1. Padding already displays `Normal (8px)`; Margin displays `Relaxed (16px)`.
2. The unique class `.spacing-padding-preset-popup` is mistakenly attached to the
   Margin preset popup—the exact drift case the plan says only P4 catches.
3. `setCardPadding('normal')` selects `Normal` in the misidentified Margin popup,
   changing Margin to `Normal`.
4. `expectSelectShows('spacing-padding-preset', /^Normal/i)` reads Padding, which
   already displayed `Normal`, and passes.

The wrong control was operated and the helper returned success. Identical option
labels are rendered for both sections from the same `renderSection`
(`src/components/SpacingControls.tsx:122-178,228-229`), and the public setters do
not prohibit idempotent calls (`tests/support/dsl/spacing.ts:137-172`). Leg 5's
different-starting-value construction proves that P4 can fail in one state; it
cannot prove the pre-satisfied state safe.

## Previously clean areas

- **§5.1 / §5.1a:** no revision-5 deletion or expansion changes the two lexical
  DSL consumers, two `renderSection` calls, four proposed class strings or sole
  product consumer. The stated lexical/runtime limits remain.
- **§5.2:** unchanged and still behavioral-first; the wider sibling construct is
  not promoted to a shared diagnosis.
- **P1–P3:** present and not softened. Popup identity remains class-based,
  option lookup remains within that popup, and the option uses an ordinary
  Playwright click.
- **P4:** wired but not sufficient for its claimed drift population; SP-21.
- **Guard rails:** the repaired path still removes the document-global pre-wait,
  `force: true`, DOM `evaluate(...click())` and `Escape`; the historical and
  background-precedent mentions do not restore them.
- **SP-18 edit surfaces:** §4.2, §4.3, §5.1a, §5.3 and §7.4 preserve the product
  CSS distinction and no-migration boundary. I found no hidden migration or lane
  redesign.

## Cost and process claims

The added §7.5 paragraph makes several previously omitted cost classes visible,
but the inventory still carries revision-4 cardinalities. It says four review
rounds with three complete and one owed, and fourteen findings
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:1513-1535`). At revision 5, rounds
1–4 are complete, this fifth review is owed, and SP-1…SP-19 already total
nineteen. The same document states nineteen correctly in its header and round-4
disposition (`:7-17`, `:1848-1867`). SP-22 records the internal contradiction.

The new “diff the replaced block” lesson is useful when stated narrowly. It
finds removed text, not incorrect additions, stale retained sentences or
dependency inversions inside a replacement. This review's result demonstrates
that boundary: all 52 removals are accounted for, while SP-20 through SP-24 arise
elsewhere. The plan itself mostly observes that limit at `:1720-1731`; I do not
read §10 as claiming the diff is complete safety evidence.

## Claim ledger

| Load-bearing claim                                                                                  | Tag                                        | Evidence and result                                                                                                                                            |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reviewed tree matches the pinned branch/head/base and is clean/docs-only.                       | **MEASURED**                               | Gate regenerated before reading the commission; confirmed.                                                                                                     |
| Every revision-4 line removed by revision 5 is accounted for.                                       | **MEASURED**                               | Direct zero-context deletion audit: 19 contiguous blocks, 52 lines; table above.                                                                               |
| All three internal callers invoke selection once and then wired P4 with the same pattern.           | **MEASURED-from-plan/source**              | Plan `:897-936`; current caller population `tests/support/dsl/spacing.ts:102-124`; SP-15 resolved.                                                             |
| Every resolver wait receives one captured positive timeout.                                         | **MEASURED-from-plan/source**              | Plan `:776-816`; `timeout: 0` source semantics re-read at `node_modules/playwright-core/lib/server/progress.js:67-75`; SP-16 resolved.                         |
| The replacement implementation sequence can execute leg 1 as specified.                             | **MEASURED — CONTRADICTED**                | REPAIRED means §4.4 and leg 1 runs it (`:1276-1294`), but §7 orders leg 1 before the helper (`:1402-1416`); SP-20.                                             |
| P4 catches any residual wrong-control operation and the misattached-class drift case.               | **INFERRED — CONTRADICTED**                | A pre-satisfied requested value lets wrong-control mutation pass read-back; plan claim `:463-467,930-936`; SP-21.                                              |
| The SP-17 evidence taxonomy covers the real 0–12 population.                                        | **MEASURED**                               | Tables and narrowed rule at `:1200-1237`; taxonomy repaired, sequence only partial.                                                                            |
| The old background precedent is now bounded to API shape and its product consumers are named.       | **MEASURED**                               | Plan `:589-607,1029-1047,1174-1186,1497-1511`; source `src/index.css:26-40` and background DSL `:43-60,186-212`; SP-18 resolved.                               |
| The CSS comment independently establishes that someone observed M5's exact behavior.                | **INFERRED — OVERCLAIMED**                 | It records suppression intent in another component, not observation history or spacing timing; SP-24.                                                          |
| The live M5/M6 population language no longer promotes three samples to a universal.                 | **MEASURED**                               | Widened searches and end-to-end reading; SP-19 resolved.                                                                                                       |
| §7.5's running cost cardinalities describe revision 5.                                              | **MEASURED — CONTRADICTED**                | `:1518-1534` says 4/3/1 and 14; header and round-4 record say 19 across four completed rounds; SP-22.                                                          |
| Any first-attempt budget expiry necessarily causes a second gesture.                                | **MEASURED — CONTRADICTED**                | Retry clicks only when `isOpen` is false (`:832-841`); an opened Select with a slow/missing popup mapping retries without another click; SP-23.                |
| No correctly generated foreign popup can satisfy the proposed option-B class in the current design. | **INFERRED from installed/source mapping** | Two render calls × mode/preset suffixes, antd/rc-select/rc-trigger class path re-read; Electron not run. This does not cover misimplementation or later drift. |

**Weakest claims in this review:** I did not reproduce SP-21 in Electron; its
counterexample assumes the deliberately hostile misattachment the plan itself
names. I did not observe option B in Electron or repeat M7. I infer from a source
comment that the background CSS was intended to address overlapping leave
remnants, but I cannot infer who observed it or equate it with M5's measured
population. Those limits do not affect SP-20's textual dependency contradiction
or the stale cardinalities in SP-22.

## Findings

### SP-20 — SEV 1 — repaired leg 1 is scheduled before the repaired helper exists

**Three-part blocking proof.** (1) The broken decision is the mandatory companion
and SP-17 repair: leg 1 is a FAIL-OLD/PASS-NEW mechanism leg whose REPAIRED side
must pass and whose P4 must confirm Padding
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:1207-1216`, `:1276-1294`). (2) The
replacement sequence adds the two product `classNames` lines, then says to run leg
1 immediately, and only **then** implement the helper (`:1402-1412`). By the
plan's own variant definition, REPAIRED is “the §4.4 helper as proposed”
(`:1276-1279`); before that helper exists, leg 1 cannot produce its repaired
result. (3) No recorded mitigation supplies the missing variant or a later second
leg-1 invocation. M7 is jsdom and explicitly does not observe Electron; running
only CURRENT cannot establish PASS-NEW or P4.

**Concrete fix.** Keep the product class change first, implement the repaired
helper and three callers next, and then run leg 1 as the first mechanism leg. If a
source-only Electron class check must precede helper implementation, name it as a
separate census/smoke step and keep the complete two-sided leg 1 after the helper.
Do not relabel a one-sided class observation as leg 1.

**What must not change.** Keep option B, `max < 2` as a no-result, both CURRENT
and REPAIRED outcomes, P4 confirmation, and legs 2–12 in their repaired groups.

**Class swept.** I checked every variant definition, all 0–12 category entries,
the leg-1 row/construction, and every sequencing reference. Leg 1 is the only
mechanism leg placed before its required helper; legs 2–9 follow it and legs
10–12 follow the implementation and checks.

### SP-21 — SEV 1 — P4 silently passes a wrong-control operation when the requested value is already satisfied

**Three-part blocking proof.** (1) The broken load-bearing claim is that P4 fails
if any residual route lets a wrong click through, and specifically closes the
unique-but-misattached popup-class path
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:461-479`, `:930-936`,
`:1732-1735`). (2) `expectSelectShows` checks only the requested control's final
text (`:874-883`). Both Margin and Padding expose the same labels
(`src/components/SpacingControls.tsx:147-178,228-229`), and their public setters
permit repeated values (`tests/support/dsl/spacing.ts:137-172`). In the
pre-satisfied state described under G3, the misattached class changes Margin
while Padding already matches; P4 passes. (3) No recorded mitigation covers that
state. Leg 5 runs one different-starting-value hostile case and therefore can
prove only that wired P4 sometimes detects a wrong click. The class count accepts
the stipulated unique misattachment, and later computed-style checks are not part
of every caller or the named immediate DSL guard.

**Concrete fix.** Add a fail-against-bad control for the pre-satisfied requested
value with the non-requested value different. Then either pin the test-id-to-popup
class association directly in the running component (including a deliberately
swapped-class negative) or extend the detector so a non-requested mutation is
loud. Narrow P4's prose to the population it actually observes; do not count a
single different-starting-value leg as proof of the universal.

**What must not change.** Keep option B's construction identity, subtree scope,
ordinary click, all three wired callers, and valid idempotent setter behavior.

**Class swept.** I checked all three P4 callers, both mode/preset option
populations, the P4-ONLY variant, leg 5, and every live statement assigning P4 a
wrong-target role. Preset and mode setters share the same pre-satisfied blind
spot; the concrete preset state above is one sample of that behavioral class.

### SP-22 — SEV 3 — the expanded cost inventory retains stale round and finding counts

Revision 5 says the plan is at four rounds with three complete and one owed, and
fourteen findings (`docs/testing/SPACING_HELPER_PRESET_PLAN.md:1513-1535`). The
same revision says nineteen findings across four completed rounds in its header
and round-4 disposition (`:7-17`, `:1848-1867`). Before this follow-up, the honest
inventory is five review rounds commissioned—four complete and one owed—and
nineteen prior findings. The added list is broader but internally stale at the
two cardinalities it leads with.

Update the round/finding counts and the sentence that quotes “four rounds,
fourteen findings.” Keep the newly added repair-time, adjudication, probe, gate,
local-only and self-inflicted-blocker costs.

**Class swept.** I searched every round-count, finding-count and “nineteen”
statement. The header and round-4 record agree; §7.5 contains the stale three
occurrences.

### SP-23 — SEV 3 — budget expiry does not necessarily cost a second gesture

The revision-5 weak-claim block says a first-attempt `budgetFor` throw is caught
and therefore “a budget expiry now costs a second gesture”
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:1740-1744`). The proposed retry
checks `isOpen` before every click (`:832-841`). If the first click opened the
Select but popup count/visibility exhausted the short budget—for example a slow
popup or missing class—the second attempt sees `isOpen === true` and does **not**
click. A second gesture occurs only when the requested Select is still closed.

Rewrite the statement conditionally and distinguish the open-but-unresolved and
closed cases. Leg 9 characterizes the latter through first-gesture suppression;
if the former matters to the budget decision, give it a separate observation or
record it as unmeasured. The core SP-16 positive-timeout fix remains valid.

**Class swept.** I checked every `budgetFor`, budget-expiry, fast-failure and
second-gesture statement plus both loop attempts. The §8 bullet is the only live
unconditional claim; the resolver and SP-16 disposition do not repeat it.

### SP-24 — SEV 3 — the background CSS comment is corroboration of a general risk, not an independent measurement of M5

The correction says someone “hit this exact” behavior and calls the CSS comment
a second independent line of evidence for M5
(`docs/testing/SPACING_HELPER_PRESET_PLAN.md:377-384`, repeated in the SP-18
disposition at `:1866`). `src/index.css:26-40` proves that product CSS intends to
hide `BackgroundCustomizer` leave remnants to prevent visible merged menus. It
does not record an observed incident, establish who encountered one, measure two
Playwright-visible popups, or exercise the spacing margin-to-padding sequence and
durations that define M5.

State the supported claim: the CSS is independently **consistent with** the
general leave-remnant/merged-menu mechanism and makes the risk less speculative.
Keep M5's runtime support limited to its three recorded spacing runs.

**Class swept.** I read every revision-5 use of the background precedent across
§0, §2.3, §4.2, §4.3, §5.1a, §5.3, §7.4, §8 and §9. The API/product-surface
corrections are sound; only §2.3 and the SP-18 historical row promote the comment
to an observed second M5 line.

## MemPalace drawer candidates

No drawer was written, as commissioned.

**Candidate — wing `havdm`, room `review`, `added_by="codex"`:**

> [REVIEW] The same-reviewer STRAT-D7 scoped follow-up 4 of
> `docs/testing/SPACING_HELPER_PRESET_PLAN.md` revision 5 at reviewed head
> `c707cd8b87f182d12bf11c512497ee712e640511` returned SEV-1-BLOCKED. SP-15,
> SP-16, SP-18 and SP-19 are resolved; SP-17 is partially resolved. A direct
> revision-4-to-5 deletion audit accounted for all 52 removed lines with no
> silent loss. New blockers: SP-20 schedules repaired fail-old/pass-new leg 1
> before implementing the repaired helper it invokes; SP-21 shows P4 can pass a
> wrong-control operation when the requested control already displays the
> expected value, defeating the claimed misattached-class mitigation. New
> non-blockers: SP-22 retains stale four-round/fourteen-finding cost counts;
> SP-23 falsely says every budget expiry costs a second gesture despite the
> `isOpen` retry gate; SP-24 promotes a background CSS intent comment beyond the
> general leave-remnant risk it supports. No app, probe, suite or CI run was
> performed. Review artifact:
> `docs/reviews/spacing-helper-preset-plan-codex-followup4-review.md`.

**Candidate — wing `practice`, room `verification`, `added_by="codex"`:**

> A post-condition detector tested only from a state where success changes the
> observed value has not proved it detects a wrong operation when that value is
> already satisfied. Include a pre-satisfied known-bad control before claiming
> the detector covers idempotent operations.
