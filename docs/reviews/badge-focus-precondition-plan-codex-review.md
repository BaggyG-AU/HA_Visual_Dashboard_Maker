# Badge Focus Precondition Plan — Independent Codex Review

- **Artifact:** `docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md`
- **Reviewed branch / commit:** `feature/badge-focus-precondition-plan` /
  `90760cd`
- **Base:** `main` / `2b9a7ca`
- **Review date:** 2026-08-25
- **Plan author:** BaggyG-AU; commit co-authored by Claude Opus 5
- **Reviewer:** OpenAI Codex, independent reviewer; did not author the plan
- **Cross-checker:** not commissioned
- **Owner gate:** BaggyG-AU adjudicates the findings before implementation;
  this document decides nothing on its own

## Verdict

**SEV-1-BLOCKED.**

The popup-open precondition is established well enough to justify a test-helper
change, and the proposed CSS wait would fail loudly rather than silently pass if
the close animation exceeded its timeout. Two decisions are nevertheless
blocked: §4.3 knowingly leaves a measured exact-identity bypass in the same
helper, and §6 does not make the timing guard prove itself against the old
helper. The owner also needs to choose whether the guard should observe the
owning combobox's focus regime or the animation-complete state of every Select
popup in the document.

This verdict blocks those decisions, not the diagnosis, the prohibition on a
`src/` change, or the rule that the manifest rows remain until CI evidence and
owner authorisation exist.

## Confidence, method, and evidence boundary

**Confidence: high** in the two blocking findings and in the guard-scope
finding; **moderate** in the explanation of how the popup reached its open
state on the GitHub runner.

I checked:

- the plan, `CLAUDE.md`, the operating agreement and adversarial-review
  template;
- the current helper, its four callers, the Theme Manager DSL and the Select
  hosts;
- the prior measured bypass and popup-closure finding in
  `docs/reviews/f3-theme-canvas-badge-codex-round7-review.md`;
- the installed locked implementations of `@rc-component/select@1.5.0`,
  `@rc-component/trigger@3.8.1`, and `@rc-component/motion@1.1.6`
  (`package-lock.json:2707-2708,2916-2917,3110-3111`);
- the merged JSON reports for the 32 completed workflow runs in the plan's
  population, plus the relevant run-229 screenshots; and
- the three calling tests on the unmodified branch with the required headless
  integration runner.

I did **not** reproduce GitHub's runner load, recreate the author's throwaway
open/closed probe, run a headed suite, run the Electron E2E project, run the
unit suite during Electron execution, touch `ha.home.local`, or test code for
the proposed fix because no such code exists. I did not inspect out-of-scope
`e2e/spacing.spec.ts` or reconsider the merged bubble-card work. No source,
baseline, plan, or UAT record was changed by this review.

## Claim ledger

| Claim                                                                                                               | Status                                   | Evidence and limit                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An open Select changes what `Shift+Tab` measures                                                                    | **MEASURED / source-corroborated**       | The plan's open/closed probe produces the CI focus signature in the open state. The installed Select forwards keys to the option list only while `mergedOpen` is true (`node_modules/@rc-component/select/es/BaseSelect/index.js:257-263`), where Tab can be prevented (`OptionList.js:200-216`).                                                                      |
| The GitHub failures are caused specifically by a popup that never finished closing                                  | **INFERRED, not established**            | The screenshots and failure payload establish “open at traversal.” They do not distinguish delayed close, a reopen, or another transition that leaves `mergedOpen` true. §8 correctly admits this. The proposed precondition covers those origins, so the residual uncertainty does not by itself block a guard.                                                       |
| Waiting for the non-hidden dropdown count to reach zero is defeated silently by a slower or stalled leave animation | **REFUTED for the installed dependency** | Trigger passes `open` to `CSSMotion` and adds the hidden class after the stable leave state (`node_modules/@rc-component/trigger/es/Popup/index.js:137-150`; `node_modules/@rc-component/motion/es/CSSMotion.js:90-100`). A slow or stalled leave keeps the selector count nonzero until Playwright times out. That is a loud false failure, not a false pass.         |
| The CSS selector is the closest authority for the focus regime                                                      | **REFUTED**                              | The owning input exposes `aria-expanded` from the same `open` value and removes `aria-controls` when closed (`node_modules/@rc-component/select/es/SelectInput/Input.js:173-180`). That scoped state matches the `mergedOpen` gate that routes Tab; the hidden class additionally waits for visual leave completion.                                                   |
| The helper pins exact badge identity                                                                                | **REFUTED by measured bypass**           | Both destinations reduce `document.activeElement` to a repeated test id (`tests/integration/theme-no-effect-badge.spec.ts:131-140,198-216`). Round 7 inserted a focusable same-testid decoy and removed the intended badge's tab stop; the helper passed while the intended badge was not focused (`docs/reviews/f3-theme-canvas-badge-codex-round7-review.md:32-63`). |
| §6 proves the new precondition is doing the work                                                                    | **REFUTED as written**                   | With no new guard, the three current calling tests already pass locally. The held-open leg can show that the new assertion executes, but neither endpoint leg reproduces the transition the guard is meant to repair: old code returns too early while repaired code waits for the real close and passes.                                                              |
| The fourth helper call has no CI execution history                                                                  | **VERIFIED, with a wider hidden tail**   | Across 96 attempts in 32 reports, the saved-theme helper failed first 96 times. The override setup, override visibility assertion, override helper, and explicit settings close at current lines 575-581 therefore did not execute in those attempts. The `finally` cleanup still ran.                                                                                 |

## Findings

### BF-P1 — SEV 1 — §4.3 preserves a known same-testid false-positive path

**Affected decision:** §4.3, “Nothing else,” together with the desired outcome
that the helper still fails when the badge is genuinely unreachable.

**Three-part blocking proof**

1. **The decision is broken.** The plan invokes the governing three-property
   rule—direction, state, and exact identity—at
   `docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:90-94`, then proposes only the
   state half and expressly freezes the rest at `:133-135`. The resulting helper
   can still pass when the intended badge is unreachable.
2. **The violated fact is recorded and reproduced at source level.** The helper
   scopes its combobox at
   `tests/integration/theme-no-effect-badge.spec.ts:191-196`, but its two
   destination assertions compare only
   `{ testid: 'theme-no-effect-badge' }` at `:198-216`. The id is repeated. The
   prior independent review records the defeating mutation: remove the intended
   override badge's `tabindex`, insert a focusable same-testid decoy before the
   input, and the helper passes while the scoped badge is not focused
   (`docs/reviews/f3-theme-canvas-badge-codex-round7-review.md:32-63`).
3. **No recorded mitigation covers it.** Popup-open/popup-closed probing varies
   state, not identity. The `6eb47d8` control proves that the helper detects the
   absence of an intervening matching tab stop; the recorded decoy shows it does
   not prove which matching node received focus. The local green leg and CI
   identities contain no decoy or scoped focus assertion.

**Class sweep.** The behaviour class was each destination assertion claiming
that a particular collapsed badge received focus. Both assertions in the one
helper are affected, and each of the four call sites inherits the weakness. The
regenerating command is:

```bash
rg -n "activeElement\(ctx\)|toMatchObject\(\{ testid: 'theme-no-effect-badge' \}\)|await expectReachableByTab\(" \
  tests/integration/theme-no-effect-badge.spec.ts
```

**Required plan repair:** pass the already-scoped badge locator (or a scoped
root from which it is derived) into the helper and use `toBeFocused()` after
each real traversal. Keep the direction and state checks. Add a live control
equivalent to the recorded same-testid decoy so that removing the intended
badge's tab stop makes the repaired check fail.

#### Owner Decision Brief

- **What this protects in product terms:** confidence that a keyboard user can
  reach the badge belonging to the Select under test, not merely some element
  elsewhere with the same internal label.
- **What is going wrong plainly:** the test throws away the badge's location and
  remembers only a reused name. A convincing impostor can pass it.
- **Is the product affected:** **No current product failure found.** Round 7's
  exact-locator probes reached the intended nodes; this is a demonstrated test
  evidence defect that could hide a future product regression.
- **Options with costs:** (A) fix state and exact identity in this helper now;
  this changes four test call sites and adds one adversarial control. (B) keep
  this plan state-only; this is cheaper now, but the desired outcome must be
  narrowed and the known false clearance remains.
- **Recommendation and why:** choose **A**. The work is local to the helper that
  is already being changed, and it completes the review prescription the plan
  itself cites.
- **What happens if you do nothing:** the current CI race may disappear while a
  known way to certify the wrong node remains, so a green result cannot support
  the plan's exact reachability claim.

### BF-P2 — SEV 1 — §6 has no fail-against-old transition leg for the timing fix

**Affected decision:** §6's verification design and its claim to satisfy the
mandatory pre-CI timing-guard companion.

**Three-part blocking proof**

1. **The decision is broken.** The held-open leg can prove that the assertion
   fires: without the guard the helper fails later, and with it the helper
   should fail on the precondition. The already-closed leg can prove that a
   closed state is permitted. Neither leg exercises the timing defect the wait
   is intended to repair—a popup begins open, closes before the deadline, old
   code traverses too early and fails, while repaired code waits and passes.
   The current helper passed the three target tests locally before any fix, so
   the proposed green leg does not supply that discrimination.
2. **The violated text is binding.** `CLAUDE.md:20` requires a small runnable
   harness against the real timing code, bidirectionally, before CI. The
   applicable liveness rule requires an extracted check to fail on known-bad
   input. The plan's steps at
   `docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:178-195` prescribe two static
   endpoint cases and an ordinary green run, not a fail-against-old close
   transition under controlled timing.
3. **No recorded mitigation covers it.** The `6eb47d8` control attacks badge
   reachability, not the new popup-state guard. The author's open/closed probe
   attacks Select behaviour at two settled endpoints, not whether the new wait
   handles a delayed real close. The CI step comes after the mandatory pre-CI
   decision point.

The current-helper green result used for this proof was:

```text
bash tools/test-headless.sh tests/integration/theme-no-effect-badge.spec.ts \
  --project=electron-integration --workers=1 \
  --grep 'the badge explanation is reachable without a mouse|the non-compact collapsed badge is keyboard-reachable too|the saved-theme and per-view override badges are keyboard-reachable too'

Result: 3 passed in 49.9 s; exit 0; branch still at 90760cd.
```

**Required plan repair:** specify a runnable, self-checking harness and the
old/guard-removed control that proves it live. At minimum it must (a) hold the
owning popup open and assert the precondition's own failure, (b) drive the real
Select through a controlled delayed close below the guard deadline so old code
fails but repaired code waits and passes, and (c) start closed and show that the
guard does not add blocking. Attack a delay near the guard's relevant boundary,
not only an extreme never-close case. Because BF-P3 identifies a scope choice,
include an unrelated-open-popup case if the owner selects the scoped guard.
Record the old/mutant and repaired outcomes before spending a CI cycle.

#### Owner Decision Brief

- **What this protects in product terms:** a CI fix that measures the intended
  keyboard state instead of moving the same failure to a different assertion.
- **What is going wrong plainly:** the plan checks “stays open” and “is already
  closed,” but not “closes late enough to beat the old helper and early enough
  for the new helper to continue.” That middle case is the proposed fix.
- **Is the product affected:** **No direct product defect shown.** The evidence
  risk is real; whether the unimplemented guard would be wrong remains unknown.
- **Options with costs:** (A) add a controlled close-transition case with an
  old/guard-removed control, alongside the held-open and already-closed cases;
  this costs a small harness before implementation reaches CI. (B) keep the two
  endpoints and a manual message comparison; this is quicker but does not prove
  the wait repairs the race.
- **Recommendation and why:** choose **A**. It is the cheapest point to detect a
  guard that fires but does not wait correctly.
- **What happens if you do nothing:** CI becomes the first environment that can
  discriminate the proposed timing fix, contrary to the owner's mandatory
  companion, and another cycle can be spent on a check that is present but not
  causal.

### BF-P3 — SEV 2 — the document-global CSS guard is later and broader than the claim

The proposed locator at
`docs/testing/BADGE_FOCUS_PRECONDITION_PLAN.md:117-127` waits for visual leave
completion for every Select popup in the document. That is a sufficient late
signal for the owning Select's closed focus regime, but it is not the closest
authority. In the installed locked Select, the owning combobox's
`aria-expanded="false"` is derived from the `open` state that gates option-list
key handling; the popup's hidden class is applied later by motion lifecycle.

This distinction answers the magnitude attack. If the target animation is
slower than 5000 ms or stalls, `toHaveCount(0)` times out loudly. It does not
silently measure nothing. The cost is a load-sensitive false failure. More
importantly, an unrelated open Select also makes this helper fail even when the
owning combobox is closed and its badge traversal is valid. “Stricter” is not
automatically more probative when the extra condition belongs to another
component. The Round 7 review recorded the count-zero wait as a deterministic
experiment; it did not prescribe a document-global contract in preference to a
scoped authority.

#### Owner Decision Brief

- **What this protects in product terms:** stable evidence about the exact
  Select a keyboard user is leaving, without an unrelated control invalidating
  that evidence.
- **What is going wrong plainly:** the proposed check watches every popup and
  waits for animation cleanup, while the question is whether this Select has
  left its popup keyboard mode.
- **Is the product affected:** **No.** This is a test-helper scope and reliability
  choice, established from the locked dependency source; no product behaviour
  change is proposed.
- **Options with costs:** (A) wait for `aria-expanded="false"` on the exact
  `combobox` already owned by the helper; smallest scope and no animation
  coupling. (B) resolve that combobox's `aria-controls` and wait for only its
  popup to become hidden; more code, and still waits for motion completion. (C)
  keep the document-global count; least plan editing, but unrelated popups and
  long animations can fail the helper.
- **Recommendation and why:** choose **A**. It observes the exact element and the
  state that controls Tab routing, and a stalled/delayed close still reaches the
  timeout loudly.
- **What happens if you do nothing:** the likely current failures may be fixed,
  but future failures can be caused by another Select or by visual animation
  duration rather than by the keyboard regime this helper claims to establish.

### BF-P4 — SEV 3 — the `:579` exposure is real, but the unexecuted tail is wider

The plan correctly identifies the second helper call as newly exposed. The
complete same-reason population in the 32 downloaded merged reports is broader:
96 of 96 attempts failed first on `theme-manager-saved-select`. On the current
source layout, none reached `setViewOverride`, the override badge visibility
assertion, the override helper, or the explicit settings close at
`tests/integration/theme-no-effect-badge.spec.ts:575-581`. The `finally` cleanup
at `:582-584` still executes.

Revise §5 to name that hidden tail, and say that the first post-fix CI attempt
may move the same test identity's failure from the saved-theme step into the
newly executed tail. If `:579` fails, that identity is not yet green, so “a first
green run ... may surface a third failure” at plan lines 167-168 is internally
inconsistent wording.

The population and attempt counts can be regenerated with:

```bash
repo=BaggyG-AU/HA_Visual_Dashboard_Maker
out=$(mktemp -d)
while IFS=$'\t' read -r id number; do
  mkdir -p "$out/$number"
  gh run download "$id" --repo "$repo" -n "merged-report-$number" -D "$out/$number"
done < <(
  gh run list --repo "$repo" --workflow test.yml --limit 80 \
    --json databaseId,number,conclusion \
    --jq '.[] | select(.number >= 170 and .number <= 229 and
      (.conclusion == "failure" or .conclusion == "success")) |
      [.databaseId,.number] | @tsv'
)
node - "$out" <<'NODE'
const fs = require('fs');
const path = require('path');
const root = process.argv[2];
const title = 'the saved-theme and per-view override badges are keyboard-reachable too';
const specs = [];
function walk(value) {
  if (!value || typeof value !== 'object') return;
  if (value.title === title && Array.isArray(value.tests)) specs.push(value);
  for (const child of Object.values(value)) walk(child);
}
const reports = fs.readdirSync(root);
for (const run of reports) {
  walk(JSON.parse(fs.readFileSync(path.join(root, run, 'merged-results.json'), 'utf8')));
}
const attempts = specs.flatMap(spec => spec.tests).flatMap(test => test.results);
const savedFailures = attempts.filter(result =>
  result.status === 'failed' &&
  result.error?.message?.includes('theme-manager-saved-select'),
);
const overrideFailureMentions = attempts.filter(result =>
  result.error?.message?.includes('theme-manager-view-override'),
);
console.log({ reports: reports.length, attempts: attempts.length,
  savedFailures: savedFailures.length,
  overrideFailureMentions: overrideFailureMentions.length });
NODE
```

Observed output: `{ reports: 32, attempts: 96, savedFailures: 96,
overrideFailureMentions: 0 }`. Because every recorded attempt had already
failed at the saved-theme helper, the later override steps were unreachable in
this population; the zero override-message count is corroborating, not the
basis of that inference.

## Commissioned attacks and clean results

1. **Diagnosis:** “popup open at traversal changes the focus regime” is
   established. “The close never finished” and runner-load causation remain
   consistent explanations, not established origins. That uncertainty does not
   defeat a correctly scoped state precondition.
2. **Right guard:** the CSS wait is sufficient but indirect and document-global;
   BF-P3 recommends the owning combobox's `aria-expanded` state.
3. **Magnitude:** a slow or stalled target leave fails loudly at 5000 ms. The
   plan's risk is false failure and excess waiting, not a silent pass. A scoped
   focus-regime guard removes the animation magnitude from the claim.
4. **Scope:** the global count can fail for an unrelated Select. That is an
   unrelated precondition, not useful strictness for this helper.
5. **Verification liveness:** the current endpoints show that the assertion can
   fire and permit a settled closed state, but there is no controlled close
   transition in which old code fails and repaired code waits and passes. BF-P2
   blocks that verification decision.
6. **New exposure:** `:579` is correctly identified, and BF-P4 records the wider
   unexecuted tail.
7. **§8 weaknesses:** each was independently checked. Naming them did not clear
   them. The host-evidence limitation and undistinguished failure origin are
   honest residual uncertainty; the scope issue needs an owner choice; the
   fixed timeout is loud; the exposure wording needs correction.

The following plan elements checked clean:

- the file-local helper has four call sites across three tests. A precise
  regenerating command is
  `rg -n 'await expectReachableByTab\(' tests/integration/theme-no-effect-badge.spec.ts`;
- a test-only change is consistent with the evidence that the current product
  badge is keyboard-reachable;
- preserving both traversal directions and an explicit real focus starting
  point is correct;
- no retry/tolerance should be introduced around the precondition;
- the old-source control remains useful for the badge-reachability property,
  although it cannot clear exact identity or popup state; and
- retaining both manifest rows until relevant CI evidence and an explicit owner
  decision is sound.

## Required disposition before code

1. The owner adjudicates BF-P1 through BF-P3 using the briefs above.
2. The author revises the plan—not `src/` or the tests—to include exact scoped
   badge identity and a live control for it.
3. The revised plan names the selected scoped/global state authority and updates
   the blast-radius description for the hidden tail.
4. The revised verification section defines a self-checking real-code harness,
   its old/guard-removed failure, its repaired result, and both timing
   directions before CI.
5. Implementation begins only after those plan decisions are reviewed and
   accepted. Manifest retirement remains a later owner decision after CI.

## Disagreements

- I disagree with §4.3 that the existing helper can otherwise remain unchanged;
  the same cited reviewer prescription includes exact identity, and its bypass
  is measured rather than hypothetical.
- I disagree with §8's characterisation of the global count as “the one the
  reviewer prescribed.” The prior review reported an experimental wait and also
  prescribed a scoped badge locator; it did not adjudicate the present
  global-versus-owned guard choice.
- I agree that the evidence establishes the state precondition without yet
  establishing whether the popup never closed or reopened. The plan should use
  that narrower causal language.

No new MemPalace drawer candidate arose: BF-P1 and BF-P2 directly instantiate
the existing exact-identity and fail-against-old rules, while BF-P3 instantiates
the existing authority-over-inference and magnitude rule.

---

## Workflow State

| Field            | Value                                                                                                                                                                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task             | Independent plan review of `BADGE_FOCUS_PRECONDITION_PLAN.md`                                                                                                                                                                                                         |
| Status           | Complete — **SEV-1-BLOCKED**                                                                                                                                                                                                                                          |
| Just completed   | Traced the diagnosis, helper contract, dependency state/motion signals, 32-report CI population, prior measured bypass, and proposed verification liveness; recorded two SEV 1 findings, one SEV 2 brief, and one SEV 3 inventory correction.                         |
| Next action      | Adjudicate BF-P1 through BF-P3, then have the plan author revise the plan before code is written.                                                                                                                                                                     |
| Performed by     | User                                                                                                                                                                                                                                                                  |
| Reference        | `docs/reviews/badge-focus-precondition-plan-codex-review.md`                                                                                                                                                                                                          |
| Verification     | Headless target integration run: 3 passed, exit 0; CI artifact parse: 32 reports / 96 attempts / 96 saved-helper failures before the override steps; `./tools/checks`: exit 0 (lint warnings only, Prettier and typecheck clean, 104 files / 1413 unit tests passed). |
| MemPalace drawer | None — existing practice drawers cover the findings; independent-review evidence remains in this committed file.                                                                                                                                                      |
