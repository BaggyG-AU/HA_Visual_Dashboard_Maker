Author: Claude Opus 5 (plan revision 4 and repair author; interested party)
Reviewer: OpenAI Codex / GPT-5.6 Sol (same independent reviewer as rounds 1 and 2; authored no repair)
Owner gate: micah/BaggyG-AU decides whether the plan proceeds; this review decides nothing on its own

# Second scoped follow-up — badge focus precondition plan repair

**SEV-1-BLOCKED.** BF-F1 and BF-F2 are RESOLVED, so BF-P2 moves to
RESOLVED and the technical plan is ready for implementation. Implementation
nevertheless remains blocked because §7 still says BF-F1 needs an owner ruling
and Option B remains open, directly contradicting the binding 2026-08-26 Option
A ruling and §9.1's statement that Option B is closed.

Reviewed `c1f31df` on `feature/badge-focus-precondition-plan` against revision 3
at `9fcc774`; base `main` was `2b9a7ca`. Scope was the repair diff plus the
declared radius. I did not reopen BF-P1, BF-P3, BF-P4, the diagnosis, the
four-call-site population, the test-only decision, or the manifest-retirement
rule except where the commissioned regression and contradiction sweep required
checking that their recorded state survived.

## Disposition

| Finding                                                           | Disposition  | Evidence and consequence                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BF-F1 — case 4 could fail for the owning popup's visual leave** | **RESOLVED** | Step 2 now waits for the same document-global visible-popup population to reach zero before opening the unrelated Select; the later state records owning closed, unrelated open, and exactly one visible popup (`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:360-383`). An exact headless run then made the rejected global guard fail only on that one unrelated popup while the scoped guard and exact-badge traversal passed. |
| **BF-F2 — the published sweep result was false**                  | **RESOLVED** | The plan now separates code-behaviour hits from raw manifest text, names all three manifest entries and their dispositions, and records the narrower command that caused the old false report (`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:610-636`). The shipped `rg` command was run verbatim; its complete twelve-file population fits those two groups.                                                                     |
| **BF-P2 — no fail-against-old transition leg**                    | **RESOLVED** | Cases 1-3 were already ruled executable and causal. Case 4, the sole reason BF-P2 remained partial, is now isolated, binding under the owner's Option A ruling, and independently executed exactly. Nothing technical remains open in BF-P2.                                                                                                                                                                                       |

## Answers to the commissioned questions

### Q1 — BF-F1: RESOLVED

The isolation removes the measured two-popup confound. Step 2 is in the only
position that establishes the needed population: after selecting in the owning
Select, so its visual leave has begun, and before opening the unrelated Select,
so a zero count is achievable. `toHaveCount(0)` is the right predicate because
the rejected guard observes exactly that selector population. Once step 3 opens
the unrelated Select and step 4 proves the count is one, a later global-guard
timeout can be caused only by the one recorded unrelated popup.

The published setup-versus-authority defence holds. The document-global query
does not decide whether the owning Select is safe for traversal; the owning
combobox's scoped `aria-expanded="false"` assertion retains that authority. The
global query instead establishes the initial population required to test the
rejected global guard fairly. If another popup is ambiently open or the selector
stops tracking visible popup state, setup fails loudly before the comparison;
neither failure can manufacture the required scoped-pass/global-fail result.
Using a global observation to construct a controlled global population is not
the authority error BF-P3 rejected.

The old “two popups open at once” bailout is completely withdrawn. The only
remaining occurrence is struck through and explicitly says the case requires
the owning popup closed and exactly one unrelated popup open
(`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:543-548`). There is no remaining
UNRUN escape based on simultaneous popup support.

The plan also distinguishes the earlier evidence honestly. §6 says the reviewer
ran the isolated construction, while §8 expressly warns that the exact five
steps had not been run as written and calls the prior construction equivalent
rather than identical (`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:385-390,572-575`).
That qualification is sufficient. For this follow-up I additionally executed
the exact five steps; their output is recorded under Method below.

### Q2 — BF-F2: RESOLVED

The shipped command was run verbatim:

```bash
rg -n "toBeFocused|activeElement|theme-no-effect-badge" tests/
```

Its twelve-file population is one target spec, ten other TypeScript files, and
`tests/baseline/expected-failures.json`. The ten other code files are the five
named `toBeFocused()` surfaces plus `activeElement` diagnostics or mechanics in
the same or other unrelated DSL/spec surfaces: accordion, background
customizer, colour picker, file operations, gradient editor, popup, save and
backup, split-view YAML sync, tabs, and the app DSL. None combines its focus
check with the badge id; every badge-focus decision remains in the target spec.
The JSON hits are raw text. The corrected two-group sentence at plan
`:610-626` is therefore literally true; the parenthetical five-item list names
the complete `toBeFocused()` subset, not the complete code-file subset.

The manifest dispositions are also right:

- `:91` is prose describing the retained keyboard identities;
- `:178-201` contains the two affected behavioural expected-failure rows, both
  still present; and
- `:476-484` is the unrelated tooltip-stability expected-flaky row, unchanged.

`tools/check-suite-signatures.cjs:283-287` constructs its expected-failure key
from `file` plus `titlePath`; the same pattern is used for skip and flaky
identities. `baselineRef`, notes, helper names, and helper signatures do not
participate. The helper remains file-local, and the command found no second
focus assertion over `theme-no-effect-badge`, so the declared implementation
population is unchanged.

### Q3 — BF-P2: RESOLVED

Yes. Case 4 was the only remaining gate after cases 1-3 were accepted. Its
five-step repair now isolates the negative control, survives the strongest
published attack, and produced both discriminating outcomes against the real
Select. BF-P2 moves from PARTIALLY RESOLVED to RESOLVED.

### Q4 — accurate and not over-reach

The temporal trap is accurate. In the locked dependency,
`OptionList`'s Tab branch calls `onSelectValue(...)` before testing its captured
`open` value and preventing default
(`node_modules/@rc-component/select/es/OptionList.js:201-216`). In single mode,
`onSelectValue` calls `toggleOpen(false)` at `:153-163`. Thus the same handler can
close the Select and still prevent the already-arrived Tab; a post-event
`aria-expanded="false"` read is expected aftermath, not evidence that the
pre-event guard was irrelevant.

This is uncommissioned text, but not over-reach. It changes no repair scope or
product decision. It prevents the exact causal misreading exposed by the prior
old-helper probe and tells the eventual harness author where the meaningful
attribute read belongs—before traversal. No issue found for Q4.

### Q5 — one blocking structural contradiction

| Structural edit                       | Result                                                                                                                                                                                                                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §7 sequencing                         | **FAIL — BF-G1.** Step 4 says BF-F1 still needs the owner and Option B remains open (`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:471-475`). The owner already ruled A, and §9.1 says “SETTLED” and “Option B is closed” (`:668-675`).                                                    |
| §9.1 disposition                      | **PASS in isolation.** It accurately records every prior disposition, the 2026-08-26 ruling, and binding Case 4. Its conflict with §7 is BF-G1, not an error in the ruling it records.                                                                                                      |
| §10 S4 narrowing                      | **PASS.** The table now says Case 4 was only partly fixed in revision 3, then the revision-4 qualification identifies the owning-leave confound and its repair (`:699-706,729-736`).                                                                                                        |
| §10 “every dimension” narrowing       | **PASS.** The later text explicitly retracts the universal for Q5 because the author ran `grep --include=*.ts` rather than the published cross-file-type `rg` command (`:684-691,737-743`). It neither denies that the other dimensions ran nor pretends the wrong instrument covered JSON. |
| §8 revision-4 weaknesses              | **PASS.** It publishes the global-setup attack, temporal-text over-reach question, and exact-versus-equivalent evidence boundary (`:557-575`).                                                                                                                                              |
| Cross-references to §4, §5, §6 and §9 | **PASS apart from BF-G1.** Case numbering, manifest gates, the four cases, and the corrected sweep remain intact.                                                                                                                                                                           |

The §10 opening preserves the original “every dimension” sentence before
explicitly narrowing it later. That historical presentation is awkward, but
the same section identifies the original sentence verbatim as overstated and
states which dimension was not checked; it does not leave the universal
unqualified. Likewise §6's “reviewer ran it” is constrained by §8's explicit
equivalent-versus-exact warning. I found no second live contradiction in either
class.

### Q6 — declared radius: CONFIRMED

The BF-F2 prose repair does not alter the implementation radius. Regeneration
found `expectReachableByTab` defined once and called only at target-spec lines
`:343,447,573,579`; `activeElement` is defined once in that spec and its three
uses are inside the same helper. `ThemeNoEffectBadge.tsx:180,187` emits the
repeated id, while all test assertions over that id remain in the one target
spec. The other `activeElement`/`toBeFocused()` files listed under Q2 operate on
different components and identities. No unnamed consumer was found.

### Q7 — one unpredicted finding

BF-G1 below is the only issue found outside the two commissioned repairs. The
Case 4 mechanism, corrected sweep population, temporal trap, and declared
implementation radius produced no additional finding.

## New findings

### BF-G1 — SEV 1 — §7 contradicts the settled owner ruling

**Decision or claim broken.** The plan's sequencing section is the operative
record of what must happen before implementation. It says BF-F1 “needs the
owner,” that revision 4 merely implements a recommendation, and that “option B
remains open to the owner”
(`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:457-479`).

**Violated binding fact and text.** The owner ruled Option A on 2026-08-26 in
commit `52b8834`. The same plan records the ruling as “SETTLED,” says “Option B
is closed,” and makes the five-step sequence binding at
`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:668-675`. The follow-up
commission repeats that closed ruling. §7 therefore contradicts both the
binding decision and the plan's own current-state disposition.

**Why no recorded mitigation covers it.** §9.1 is not an explicit supersession
of §7 and establishes no precedence between the two sections; it is the other
side of the contradiction. A reader following the named sequencing section is
told to seek a decision that has already happened and to preserve an option the
owner closed. The prompt's correct state lets this reviewer identify the defect
but is not part of the durable plan an implementer will follow. Because the
artifact as recorded contradicts a binding ruling without reconciling it, this
meets STRAT-D18's SEV 1 contract and blocks plan acceptance, even though the
repair is a small prose edit.

**Required repair:** rewrite §7 step 4 to record the completed 2026-08-26 Option
A adjudication, say Option B is closed, and identify this follow-up—not a second
owner decision—as the remaining gate. Sweep the plan's other current-state
statements again after the edit; §9.1 already contains the canonical facts.

#### Owner Decision Brief

- **What this protects in product terms:** a single unambiguous approved test
  plan, so implementation cannot follow an abandoned validation path or wait on
  a decision the owner already made.
- **What is going wrong plainly:** one section says the owner still has to choose
  and can choose B; another says the owner already chose A and closed B.
- **Is the product affected:** **No current product change.** The branch is
  still documentation only. The affected item is the implementation gate and
  its durable decision record.
- **Options with costs:** (A) update §7 to the settled state; one localized prose
  repair plus the required scoped follow-up. (B) add an explicit statement that
  §9.1 supersedes §7's stale step; similarly small, but leaves obsolete workflow
  text in the sequencing section.
- **Recommendation and why:** choose **A**. Sequencing should state current
  sequencing, and §9.1 already supplies the canonical words to reuse.
- **What happens if you do nothing:** the plan remains internally contradictory
  and cannot receive the only verdict that opens implementation, despite its
  technical repair now being sound.

## Regression and contradiction sweep summary

The finding class was every live current-state statement affected by the owner
ruling, not just the sampled §7 sentence. The sweep found the plan status at
`:4-18`, Case 4's owner-choice premise at `:333-337`, §7 at `:457-481`, §9.1 at
`:644-680`, and §10's historical owner-choice references at `:693-743`. Only
§7's step 4 remains stale; the other members either state Option A as settled or
refer accurately to earlier decisions in historical context.

No content was dropped from the technical repair: four cases and three controls
remain; §5's affected test tail and manifest rule remain; §9's five-part
implementation radius remains; and §8 exposes all three revision-4 weaknesses
the commission names.

## Method and evidence boundary

### Read and enumerated

- `9fcc774..c1f31df`, including revision 4 (`97f67cb`), the owner-ruling commit
  (`52b8834`), and later commission-only housekeeping;
- the current plan, both prior reviews, both follow-up commissions, the affected
  baseline rows, and `tools/check-suite-signatures.cjs`'s identity construction;
- every file returned by the shipped radius command, plus the helper definition
  and all four calls; and
- locked `@rc-component/select@1.5.0` Tab ordering and close path used by the
  temporal-trap claim.

Repository preconditions matched before review: PR #153 was open/not draft at
`c1f31df`, local `main` was `2b9a7ca`, the worktree was clean, every branch path
was a Markdown file under `docs/`, and the manifest remained 9 expected
failures / 10 expected flaky / 21 expected skips with both keyboard rows.

### Ran headless and read-only

The shipped radius command above completed successfully. Its file population
was:

```text
tests/baseline/expected-failures.json
tests/e2e/accordion.spec.ts
tests/e2e/file-operations.spec.ts
tests/e2e/save-and-backup.spec.ts
tests/e2e/split-view-yaml-sync.spec.ts
tests/integration/theme-no-effect-badge.spec.ts
tests/support/dsl/app.ts
tests/support/dsl/backgroundCustomizer.ts
tests/support/dsl/colorPicker.ts
tests/support/dsl/gradientEditor.ts
tests/support/dsl/popup.ts
tests/support/dsl/tabs.ts
```

A one-off read-only Electron probe was supplied over stdin to Node under Xvfb;
it launched the existing branch build and wrote no source, test, manifest, or
plan file. It executed §6a's exact five-step Case 4 sequence and returned:

```json
{
  "isolatedState": {
    "owningExpanded": "false",
    "unrelatedExpanded": "true",
    "visiblePopupCount": 1
  },
  "globalGuardFailed": true,
  "globalElapsedMs": 5008,
  "scopedGuardPassed": true,
  "active": {
    "testid": "theme-no-effect-badge",
    "tag": "SPAN",
    "text": ""
  }
}
```

The exact global negative control used its full planned 5000 ms timeout. The
scoped precondition then passed and real `Shift+Tab` focused the caller-scoped
saved-theme badge.

### Not run or not established

- No implementation or committed harness exists, so the future code patch and
  §6a-§6d as committed tests remain **UNRUN**. The direct probe establishes that
  the exact Case 4 construction is executable and discriminating, not that an
  unwritten implementation will reproduce it correctly.
- No integration/e2e suite, unit suite, `./tools/checks`, CI workflow, headed
  browser, live Home Assistant operation, UAT, merge, state update, or manifest
  edit was performed. The branch is docs-only, and the commissioned technical
  question was exercised by the smaller exact real-app probe.
- Cases 1-3, BF-P1, BF-P3, BF-P4, and the CI diagnosis were not re-opened. Their
  prior dispositions were consumed as the commission required.

## Claim ledger

| Claim                                                       | Tag           | Evidence                                                                                                                                                                       |
| ----------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Expected repository/PR/manifest state matched               | **MEASURED**  | Git/GitHub checks, docs-only path check, manifest count, and both retained rows before review.                                                                                 |
| Case 4's step-2 isolation removes the owning-leave confound | **MEASURED**  | Exact sequence reached zero before opening the unrelated popup, then recorded one visible popup; global failed and scoped passed.                                              |
| Setup isolation is distinct from traversal authority        | **JUDGEMENT** | The setup query constructs the selector population, while the scoped attribute decides traversal readiness; either setup defect fails before producing the claimed comparison. |
| The exact five-step sequence is executable                  | **MEASURED**  | Headless output above, including full-timeout negative control and exact focused badge.                                                                                        |
| BF-F2's two-group narration is literally true               | **MEASURED**  | Verbatim shipped command; twelve files enumerated and classified by role.                                                                                                      |
| Manifest rows do not consume the helper signature           | **MEASURED**  | Checker keys at `tools/check-suite-signatures.cjs:283-287` use file/title identities.                                                                                          |
| The temporal trap is accurate                               | **MEASURED**  | Locked `OptionList.js:153-163,201-216` ordering; prior old-leg result is consistent with that order.                                                                           |
| The implementation radius has no unnamed consumer           | **INFERRED**  | Complete current-tree name/id/focus sweep and source-role inspection; future code does not yet exist.                                                                          |
| §7's Option B statement is a live contradiction             | **MEASURED**  | Plan `:471-475` versus owner commit `52b8834` and plan `:668-675`; no supersession text.                                                                                       |
| BF-P2 can move to RESOLVED                                  | **JUDGEMENT** | Cases 1-3 were already accepted; the sole remaining Case 4 defect is now isolated and measured.                                                                                |

**Weakest claims:** the setup-versus-authority distinction is a judgement about
test roles, though the exact bidirectional result supports it; the direct probe
uses today's docs-only-equivalent branch build and cannot clear the future
committed harness; and the radius clearance is bounded to current names and
behavioural roles, not hypothetical future consumers.

## Disagreements

I have no disagreement with the owner's Option A ruling or with revision 4's
technical response to BF-F1/BF-F2. I accept §10's explicit later narrowing as a
valid historical correction rather than requiring the original sentences to be
deleted, and I accept §8's exact-versus-equivalent warning as sufficient
qualification of §6. My disagreement is solely with §7 continuing to present
the already-settled owner decision as open; that is BF-G1 rather than a dispute
with the decision itself.

## MemPalace drawer candidates

None. BF-G1 is another instance of the existing whole-class sweep and internal
coherence rules: when a ruling changes current state, every live state summary
must be swept, not only the disposition table. It does not add a new
agent-general rule.
