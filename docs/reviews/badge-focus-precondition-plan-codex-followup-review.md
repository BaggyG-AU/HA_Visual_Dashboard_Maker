Author: Claude Opus 5 (plan revision 2/3 and repair author; interested party)
Reviewer: OpenAI Codex / GPT-5.6 Sol (same independent reviewer as round 1; authored no repair)
Owner gate: micah/BaggyG-AU decides whether the plan proceeds; this review decides nothing on its own

# Scoped follow-up — badge focus precondition plan repair

**CHANGES-REQUIRED.** BF-P1, BF-P3 and BF-P4 are RESOLVED, but BF-P2 is only
PARTIALLY RESOLVED because case 4 can obtain the expected global-guard failure
from the owning popup's own unfinished visual leave instead of from the unrelated
popup it claims to discriminate. Implementation remains blocked until the plan
isolates that case and corrects the linked radius-evidence wording.

Reviewed `9fcc774` on `feature/badge-focus-precondition-plan` against the
round-1 plan `90760cd`; base `main` was `2b9a7ca`. The scope was the repair diff
plus §9's declared radius, under `docs/governance/OPERATING_AGREEMENT.md:240-285`.
I did not reopen the round-1-clean diagnosis, product/test-only decision, four
call-site population, manifest-retirement rule, `e2e/spacing.spec.ts`, or the
merged bubble-card work.

## Prior-finding disposition

| Finding                         | Disposition            | Re-checked repair and result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BF-P1 — exact identity**      | **RESOLVED**           | The new wording says the helper takes the caller's “already-scoped badge locator and asserts on the node, not on a projection of it,” then changes both destination assertions and the predecessor exclusion to `toBeFocused()` / `not.toBeFocused()` (`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:189-215`). The current class is exactly the three focus-identity assertions at `tests/integration/theme-no-effect-badge.spec.ts:198-216`; each of the four callers inherits the repair. The decoy mutation remains the live control at plan `:393-397`.                                                                                                                         |
| **BF-P2 — transition leg**      | **PARTIALLY RESOLVED** | Cases 1-3 and the page-side delayed `Escape` are now executable and causal (`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:321-332,346-391`). The proposed event reached the installed React/rc-select handler in the real app; at `DELAY_MS=4000`, the guard-equivalent wait continued after 4056 ms and exact badge focus then passed, while an immediate old-helper traversal retained the input with `testid: null`. Case 4 is the requested unrelated-popup scenario, but its setup does not isolate the rejected global guard from the owning popup's own visual leave; BF-F1.                                                                                                  |
| **BF-P3 — scope and authority** | **RESOLVED**           | The repair now waits for `aria-expanded="false"` on the owning combobox (`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:135-187`). At the locked versions, `open` renders that attribute (`node_modules/@rc-component/select/es/SelectInput/Input.js:150-180`), the same `mergedOpen` is placed in context and gates option-list routing (`node_modules/@rc-component/select/es/BaseSelect/index.js:370-383,439-487,257-263`), and the Tab handler prevents default only on its open path (`node_modules/@rc-component/select/es/OptionList.js:200-217`). The rejected hidden-class authority is later motion state (`node_modules/@rc-component/trigger/es/Popup/index.js:137-150`). |
| **BF-P4 — unexecuted tail**     | **RESOLVED**           | §5 now names `:575-581`, says the `finally` at `:582-584` still ran, and replaces the contradictory “green run may surface a third failure” wording (`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:274-297`). Those boundaries match `tests/integration/theme-no-effect-badge.spec.ts:563-585`.                                                                                                                                                                                                                                                                                                                                                                                      |

## Answers to the commissioned questions

### Q1 — BF-P1: RESOLVED

**Under-reach:** three is right. The behavior class is each assertion inside
`expectReachableByTab` that decides whether the particular caller-scoped badge
is or is not focused. The two destinations currently reduce the focused node to
a repeated test id (`tests/integration/theme-no-effect-badge.spec.ts:198-202,213-216`),
and the predecessor exclusion does the same at `:204-209`. Revision 3 replaces
all three. There is no fourth focus-identity decision in the helper; the
regenerating enumeration is:

```bash
rg -n "activeElement\(ctx\)|toMatchObject\(\{ testid: 'theme-no-effect-badge' \}\)|await expectReachableByTab\(" \
  tests/integration/theme-no-effect-badge.spec.ts
```

**Retained reader:** keeping `activeElement` is defensible. After the repair it
captures only the true predecessor's short diagnostic identity for the final
assertion message (`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:206-215`); it
does not decide a pass. Deletion would remove useful failure context without
closing an additional bypass. The risk that a later edit makes it authoritative
again is honestly listed at plan `:505-507`.

**Over-reach:** no issue found. Exact identity is not an incidental strengthening:
it is the measured open R7-N1 defect the owner chose to close. The round-7 class
sweep found this one helper and its four callers and prescribed scoped locator,
`toBeFocused()`, and explicit popup closure
(`docs/reviews/f3-theme-canvas-badge-codex-round7-review.md:32-63`). Revision 3
contains those three elements, so “This closes R7-N1” is earned and does not
claim beyond that recorded class.

**Caller claims:** verified. `badge` and `tagBadge` are held at
`tests/integration/theme-no-effect-badge.spec.ts:332-343,439-447`; the saved and
override locators are inline and discarded at `:569-579`, so those two need new
locals. The wrapper exception is also exact: `theme-selector` wraps
`theme-select` at `src/components/ThemeSelector.tsx:62-77`.

### Q2 — BF-P2: PARTIALLY RESOLVED

Cases 1-3 answer the round-1 timing repair. In a headless real-app probe, the
exact proposed native event had `key="Escape"`, `keyCode=27`, `which=27`, and
`bubbles=true`; although untrusted, it reached React's root-delegated handler and
changed the Select input from `aria-expanded="true"` to `"false"`. Against
`theme-manager-saved-select`, the two discriminating outcomes were:

```json
{
  "oldLeg": { "expanded": "false", "activeTestId": null, "activeTag": "INPUT" },
  "repairedLeg": { "guardWaitMs": 4056, "expanded": "false", "exactBadgeFocused": true }
}
```

The old leg's attribute is already false by observation time because the early
Tab itself selects/closes while its captured open-state handler still prevents
default. That does not weaken the discriminator: it entered key routing while
open, retained the input and failed before the scheduled close; the repaired
leg sent no traversal key until the scheduled close changed the precondition.
The fallback at plan `:384-391` therefore was not needed. Its stated restriction
is sound: an unawaited Playwright key is safe only while the repaired helper is
polling and sends no competing key; it cannot supply the old leg without a new
interleaving argument.

**Magnitude:** 4000 ms against 5000 ms is acceptable. MEASURED locally, it left
roughly 944 ms for the MessageChannel close and matcher observation while still
holding the popup open for 80% of the deadline. A 4900 ms timer would attack
scheduler/polling headroom more harshly, but would turn this causal harness into
a load-sensitive boundary test. JUDGEMENT: 4000 ms is the better discriminator;
the fixed deadline remains an admitted, version-local choice at plan `:462-465`.

**Case 4:** the requested scenario is present, and an independently isolated
version discriminates in both directions. After first waiting for the owning
popup's visual leave to finish, I measured one unrelated visible popup,
`savedExpanded="false"`, and `otherExpanded="true"`; the document-global guard
timed out, the scoped guard passed, and `Shift+Tab` focused the exact saved-theme
badge. The plan as written omits that first isolation and can pass its negative
control for the wrong reason; BF-F1.

The §8 “two open popups” assumption is not load-bearing and is misstated. Case 4
requires two co-present Selects but exactly one open popup: the owning popup is
closed and the unrelated one is open. The case must not be declared UNRUN merely
because two popups cannot remain open simultaneously.

### Q3 — BF-P3: RESOLVED

The installed versions are exactly `@rc-component/select@1.5.0`,
`@rc-component/trigger@3.8.1`, and `@rc-component/motion@1.1.6`. The three plan
citations are exact, and the missing connective path is also present:
`BaseSelect` supplies `open: mergedOpen` through context at
`node_modules/@rc-component/select/es/BaseSelect/index.js:370-383`; `Input`
reads that context and renders it as `aria-expanded` at
`node_modules/@rc-component/select/es/SelectInput/Input.js:31-40,150-180`.

I found no route in the four hosts that begins the `Shift+Tab` keydown with
`mergedOpen=false` and retains the input. None supplies a custom `onKeyDown`
(`src/components/ThemeSelector.tsx:75-100`;
`src/components/ThemeSettingsDialog.tsx:375-400,479-503,530-555`), and the app's
global key handler prevents only named command shortcuts, not Tab
(`src/App.tsx:2865-2945`). A headless false-state traversal landed on the exact
badge. The temporal qualification matters: an event may start with
`mergedOpen=true`, be prevented by `OptionList`, close the Select during that
same handler, and leave focus retained after `aria-expanded` has become false.
That is the measured old leg above; it supports rather than defeats a guard that
runs before the key is sent.

The scoped guard deliberately gives up visual-animation completion and
document-wide Select quiescence. Neither property controls whether this owning
Select routes Tab to its option list. The trade is narrower authority and less
incidental waiting, with loud failure if the owning state never closes.

### Q4 — BF-P4: RESOLVED

No issue found. The saved-theme helper at
`tests/integration/theme-no-effect-badge.spec.ts:573` precedes the override
setup, visibility assertion, helper and explicit settings close at `:575-581`;
the `finally` at `:582-584` remains reachable after a thrown assertion. The new
wording describes a moved failure within the same test identity rather than
calling that identity green.

### Q5 — declared radius

The implementation radius itself is complete: one helper signature, three
focus assertions, one new precondition, four caller arguments and two extracted
locals, all in `tests/integration/theme-no-effect-badge.spec.ts`. `Locator` is
already imported at `:19`, so no import edit is missing. The helper is file-local
and these are its four consumers:

```text
343  theme-select
447  theme-settings-select
573  theme-manager-saved-select
579  theme-manager-view-override
```

Regenerating command:

```bash
rg -n 'await expectReachableByTab\(' tests/integration/theme-no-effect-badge.spec.ts
```

The behavioral sweep found no second test helper that decides focus for a
`theme-no-effect-badge`. `src/components/ThemeNoEffectBadge.tsx:180,187`
produces the repeated id but is deliberately unchanged. The manifest consumes
the affected test file/title identities, not the helper signature; its two
behavioral rows remain at
`tests/baseline/expected-failures.json:178-201`, as the plan requires. The third
same-file baseline entry at `:476-484` covers an unrelated tooltip stability
test and is unchanged.

The radius's raw sweep narration is nevertheless literally inaccurate: its
command also returns those related baseline rows, contrary to the claim that
the only outside-file hits are unrelated component helpers. That is BF-F2, an
internal-coherence correction rather than a missing implementation consumer.

### Q6 — regression sweep over round-1-clean decisions

| Check                                                 | Result                                                                                                                                                                                                                                                                       |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Helper remains file-local with four call sites        | **PASS.** Definition at `tests/integration/theme-no-effect-badge.spec.ts:191-217`; calls at `:343,447,573,579`; no export.                                                                                                                                                   |
| Change remains test-only                              | **PASS.** Plan `docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:130-136,245-259,523-547` confines implementation to the one integration spec and expressly excludes `src/` and the manifest.                                                                                   |
| Both directions survive                               | **PASS.** `Shift+Tab`, predecessor discovery, explicit predecessor `.focus()`, and forward `Tab` remain at target test `:195-216`; plan `:241-243` preserves them.                                                                                                           |
| Explicit starting-point reset survives                | **PASS.** Target test `:211`; plan `:241-243`.                                                                                                                                                                                                                               |
| No retry/tolerance added around a failed precondition | **PASS.** The proposed matcher polls until a finite 5000 ms deadline and then fails; there is no outer retry, swallowed timeout, destination retry, or fixed sleep (`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:135-146,245-250`).                                        |
| `6eb47d8` control and its limit survive               | **PASS.** Plan `:399-403` assigns it only the “any intervening matching tab stop” property and leaves exact identity to §6b and state to §6a.                                                                                                                                |
| Both affected manifest rows remain                    | **PASS.** Manifest counts are 9 expected failures / 10 flaky / 21 skips; the two behavioral rows are at `tests/baseline/expected-failures.json:178-201`. Plan retirement remains post-CI and owner-gated at `docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:407-409,433-434`. |

No round-1-clean decision regressed.

### Q7 — over-reach and internal coherence

No repair over-reach was found in BF-P1, BF-P3 or BF-P4. The §4 mechanism, §5
consumer list, §6 cases 1-3, §8 version/timing weaknesses and §9 per-finding
dispositions otherwise agree.

Two contradictions remain:

1. Case 4 says the owning popup is closed and an unrelated popup is open, but
   its bailout and §8 discuss whether “the two popups” can be open together
   (`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:321-344,496-500`). That is a
   different state and contributes to BF-F1.
2. §9 says the raw radius command's outside-file hits are only unrelated
   component helpers (`:538-544`), while the command also returns the related
   baseline rows. BF-F2 corrects the evidence narration; the radius population
   itself remains complete.

Because BF-F1 means S4 is not yet proved by the case that claims to prove it,
§10's statements that S4 is fixed and that the commission ran every dimension
need narrowing in the same repair (`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:572-600`).

## New findings

### BF-F1 — SEV 2 — case 4 can fail the global guard for the wrong popup state

**Broken decision.** §6a says case 4 turns the rejection of the document-global
wait “from an assertion into a measurement” and requires the global guard to
fail while the scoped guard passes
(`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:321-326,334-344`). Its setup
confirms only that the owning combobox has `aria-expanded="false"`; it never
waits for that owning popup's later `ant-select-dropdown-hidden` state before it
opens the unrelated popup.

**Violated fact.** The rejected global guard observes visual leave, not
`aria-expanded` (`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:148-165`;
`node_modules/@rc-component/trigger/es/Popup/index.js:137-150`). Executing case
4's sequence against the real app produced this pre-guard state:

```json
{
  "savedExpanded": "false",
  "unrelatedExpanded": "true",
  "visiblePopupCount": 2
}
```

The global guard timed out, but that result could not decide the claimed scope
property because the owning popup was still one member of its failing count.
After adding the missing isolation—wait for visible popup count zero before
opening the unrelated Select—the population became exactly one unrelated
visible popup; the global guard still timed out, the scoped guard passed, and
exact badge focus passed.

**Why the plan's mitigation does not cover it.** The `aria-expanded="false"`
check establishes keyboard state, not the rejected guard's later visual state.
The plan records neither a zero-count precondition nor popup identity. Its
“two popups simultaneously open” caveat at `:343-344,496-500` asks the wrong
question: this case requires the owning popup closed and one unrelated popup
open.

**Required plan repair:** after closing/selecting the owning saved-theme Select,
wait for the document-global visible-popup count to reach zero. Only then open
the unrelated override Select; record owning `aria-expanded="false"`, unrelated
`aria-expanded="true"`, and exactly one visible popup. Run the scoped pass and
global fail from that isolated state. Remove the simultaneous-two-open-popup
bailout/weakness, and correct §10's S4 clearance.

#### Owner Decision Brief

- **What this protects in product terms:** confidence that the new test watches
  only the Select the keyboard user is leaving, without accidentally accepting a
  misleading harness result.
- **What is going wrong plainly:** the comparison can see two dropdowns. It calls
  the old global check wrong because of the unrelated one, but the owning
  dropdown may still be visually closing and would make that check fail anyway.
- **Is the product affected:** **No current product defect found.** This is a
  plan-evidence defect. The isolated real-app probe supports the scoped guard.
- **Options with costs:** (A) add the zero-visible-popup setup and correct the
  contradictory caveat; this is a small plan edit and a few seconds in the
  eventual harness. (B) drop the global-vs-scoped runtime claim and rely only on
  source reasoning; cheaper, but it removes the case round 1 expressly required
  after the scoped choice.
- **Recommendation and why:** choose **A**. It preserves the owner's scoped
  decision and makes the planned negative control capable of failing for only
  the named reason.
- **What happens if you do nothing:** implementation can begin with a scope
  control that prints the expected result without proving why, repeating the
  same evidence substitution this plan exists to remove.

### BF-F2 — SEV 3 — §9's sweep-result sentence is false even though the radius is complete

The command at `docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:538-544` returns
related hits in `tests/baseline/expected-failures.json:91,178-201,476-484`, not
only the listed unrelated component helpers. The affected behavioral rows are
already correctly retained elsewhere, and the tooltip row does not consume the
helper, so this is not a missed implementation surface. Correct the sentence to
distinguish code-behavior hits from raw text hits and name the three baseline
entries' dispositions.

## Method and evidence boundary

### Read and enumerated

- repair diff `90760cd..9fcc774`, revision-3 plan, round-1 review and follow-up
  commission;
- current helper, every call site, both Select hosts, manager DSL and affected
  baseline rows;
- locked `select@1.5.0`, `trigger@3.8.1`, `motion@1.1.6`, plus the React event
  and Select focus/blur paths used by cases 2 and 4;
- `CLAUDE.md:12-22`, `docs/governance/OPERATING_AGREEMENT.md:240-325`, and the
  relevant test-safety rules; and
- repository sweeps for the helper, focus decisions and repeated badge id. Raw
  search results were followed into their behavioral roles rather than treated
  as the population by themselves.

### Ran headless

1. Targeted current-source control:

   ```bash
   bash tools/test-headless.sh tests/integration/theme-no-effect-badge.spec.ts \
     --project=electron-integration --workers=1 \
     --grep 'the badge explanation is reachable without a mouse|the non-compact collapsed badge is keyboard-reachable too|the saved-theme and per-view override badges are keyboard-reachable too'
   ```

   Result: **exit 0, 3 passed in 47.6 s**.

2. Three read-only one-off Electron probes were supplied over stdin under Xvfb;
   they loaded the repository's existing launcher/DSL through Vite and left no
   source or test file. They measured: the exact native `Escape` reaching the
   real Select; case 2 old/repaired outcomes at 4000/5000 ms; and case 4 both as
   written and with the missing popup-isolation precondition. Their material
   outputs are quoted above.

3. Repository/manifest preconditions and enumerations:

   ```bash
   git status --short --branch
   git rev-list --count main..HEAD
   git log --format='%h %s' --reverse main..HEAD
   git diff --name-status main..HEAD
   rg -n 'await expectReachableByTab\(' tests/integration/theme-no-effect-badge.spec.ts
   rg -n "toBeFocused|activeElement|theme-no-effect-badge" tests/
   ```

   Results: clean branch at `9fcc774`, four expected commits over `2b9a7ca`,
   docs-only branch diff before this review, four helper calls, and manifest
   counts **9 / 10 / 21**.

### Not run or not established

- No implementation exists, so §6a-§6d as committed tests are **UNRUN**. The
  direct probes establish mechanism feasibility, not the future harness's exact
  implementation.
- No full integration/e2e suite, unit suite, `./tools/checks`, CI workflow,
  headed browser, live Home Assistant operation or physical assistive technology
  session was run. None is needed to decide this docs-only repair diff.
- The CI origin of the open state remains outside this follow-up and was not
  re-investigated.
- The prior 32-report / 96-attempt artifact population was not downloaded again;
  BF-P4 was checked against the unchanged source boundary and the round-1 record,
  not independently re-counted.

## Claim ledger

| Claim                                                                       | Tag           | Evidence                                                                                                                                                |
| --------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository preconditions and four-commit history matched the commission     | **MEASURED**  | Git commands above; clean `9fcc774`, base `2b9a7ca`.                                                                                                    |
| BF-P1 changes the complete focus-identity assertion class                   | **MEASURED**  | Helper read end to end plus the regenerating `rg` command; three assertions / four callers.                                                             |
| BF-P3's attribute and routing citations share `mergedOpen`                  | **MEASURED**  | Locked source at the cited Select/Input/OptionList lines and package-lock versions.                                                                     |
| The proposed native `Escape` reaches the real handler                       | **MEASURED**  | Headless real-app event probe: `keyCode=which=27`, then `aria-expanded="false"`.                                                                        |
| Case 2 distinguishes immediate old traversal from guarded delayed traversal | **MEASURED**  | Saved-theme real-app probe: retained input/null id versus 4056 ms wait and exact badge focus.                                                           |
| Case 4 as written can contain two visually non-hidden popups                | **MEASURED**  | Real-app sequence: owning false / unrelated true / visible count 2.                                                                                     |
| The isolated case 4 proves scoped pass and global fail                      | **MEASURED**  | Zero-count setup, then one unrelated visible popup; global timeout, scoped pass, exact badge focus.                                                     |
| No in-scope key path begins closed and retains the input                    | **INFERRED**  | Complete four-host prop trace, app key-handler sweep, locked dependency path, and false-state exact-focus probe; no CI instrumentation at keydown time. |
| 4000 ms is a better harness magnitude than 4900 ms                          | **JUDGEMENT** | Measured 4056 ms completion with ~944 ms headroom; balances near-boundary attack against scheduler flake.                                               |
| BF-P2 must remain partial until case 4 is isolated in the plan              | **JUDGEMENT** | Mandatory bidirectional real-code companion plus the demonstrated confound.                                                                             |

**Weakest claims for the next reviewer/owner to attack:** the closed-start
causal clearance is inferred from locked source plus local real-app behavior,
not from CI keydown telemetry; the 4000 ms magnitude is a reliability judgement,
not a derived runner limit; and the direct stdin probes prove the planned
mechanisms can work but do not clear the future committed harness.

## MemPalace drawer candidates

None. BF-F1 is another direct instance of the existing rule that a negative
control must be isolated so it can fail only for the property it claims to
exercise; BF-F2 is ordinary claim/evidence mismatch. No new agent-general rule
arose.
