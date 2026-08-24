# Plan — establish the popup-closed precondition in `expectReachableByTab`

Author: Claude Opus 5 (1M context)
Reviewer: OpenAI Codex (GPT-5.6 Sol)
Owner gate: micah / BaggyG-AU

**Status: PLAN ONLY. No code has been written.** This document exists to be
reviewed before it is. Its subject is timing and it changes a helper three
tests depend on, so it falls inside the SPEC-BEFORE-CODE ruling in `CLAUDE.md`
(owner's ruling 2026-08-16, in force).

---

## 1. Context and background

Two identities are baselined in `tests/baseline/expected-failures.json` as
CONSISTENT behavioural failures, tier `behavioural`, reason class `other`,
added 2026-08-15 on the owner's explicit authorisation, and recorded there and
in the suite-baseline record as **CI-only, not reproduced locally, cause
UNDIAGNOSED, presumed environment/order sensitivity on the GitHub runner**:

1. `integration/theme-no-effect-badge.spec.ts` ›
   `F3 — the "no preview colours" badge renders` ›
   `the non-compact collapsed badge is keyboard-reachable too`
   (host `theme-settings-select`, fails at `:447`)
2. same file ›
   `the saved-theme and per-view override badges are keyboard-reachable too`
   (host `theme-manager-saved-select`, fails at `:573`)

Both fail inside one shared helper, `expectReachableByTab`
(`tests/integration/theme-no-effect-badge.spec.ts:191-217`), on its first
assertion at `:202`:

```
expect(activeElement).toMatchObject({ testid: 'theme-no-effect-badge' })
received: { "testid": null }
```

That presumption of "environment sensitivity" is now superseded by measurement.

### What the helper is for

The badge carries the qualification that keeps its three-word label honest. A
keyboard-only user must be able to reach it and have its explanation open.
`expectReachableByTab` exists because an earlier version of these tests
asserted `tabIndex="0"` and then called `locator.focus()` — neither of which
decides sequential keyboard reachability. That was finding R6-M1 on PR #142,
and replacing the instrument was correct.

## 2. What is actually going wrong

`expectReachableByTab` does this, with nothing in between:

```ts
const combobox = ctx.window.getByTestId(selectTestId).locator('input').first();
await combobox.focus();
await ctx.window.keyboard.press('Shift+Tab');
```

It never establishes that the antd Select popup is **closed**. Both calling
tests reach it immediately after clicking an option in that very Select, so the
popup is still in its React-commit-plus-`rc-motion` close when the traversal
runs.

**With the popup open, antd correctly keeps focus inside the combobox.** The
helper therefore measures antd's in-popup focus containment rather than the
badge's position in the tab order, and reports the badge unreachable.

### Evidence

**(a) The CI failure screenshots — direct observation.** Extracted from
`merged-report-229` (run `32513099658`, 2026-08-21, head `a272c0f`) for both
identities. In both, the Select popup is **still open on screen** at the moment
of the failed assertion, the badge is correctly rendered on the collapsed
value, and the combobox carries its focus ring.

**(b) A bidirectional local probe against the real app.** Written into
`tests/integration/`, run headless at `--project=electron-integration
--workers=1`, then deleted with `git status --porcelain` verified empty and
`HEAD` unchanged. It varied exactly one thing — the popup's state:

| Leg | `.ant-select-dropdown:not(.ant-select-dropdown-hidden)` | `Shift+Tab` landed on                                                                                            |
| --- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| A   | count 1 (open)                                          | `{"testid":null,"tag":"INPUT","cls":"ant-select-input"}` — **the CI signature exactly**                          |
| B   | count 0 (closed)                                        | `{"testid":"theme-no-effect-badge","tag":"SPAN","cls":"ant-tag … ant-tooltip-open","text":"no preview colours"}` |

So the product is correct: the badge **is** in the sequential focus order and
its tooltip **does** open on keyboard arrival.

**(c) The remedy was already prescribed by the reviewer and never implemented.**
Round 7 of PR #142 measured this: a focus probe must pin three properties —
direction, **state**, and exact identity — and "awaiting
`.ant-select-dropdown:not(.ant-select-dropdown-hidden)` at count zero made it
deterministic". The prescription reached the review record and not the code.

**(d) The failure rates match the mechanism's prediction.** Over the complete
32-run artifact population: identity 1 fails 25 and is `flaky` in 7; identity 2
fails **32 of 32**. Identity 2's test has exactly **one fewer Playwright round
trip** between the option click and the traversal (it lacks identity 1's
intervening `getAttribute('tabIndex')`). Less slack, more failures — and it
also dissolves the long-standing puzzle of identity 1 "destabilising the gate
from both directions", which was one race seen at two speeds.

## 3. The desired outcome

- Both identities pass on CI, reliably, for the right reason.
- The helper still **fails** when the badge is genuinely unreachable.
- No `src/` change. This is not a product defect.
- The two manifest rows are retired **only after CI demonstrates the fix**, and
  only with the owner's explicit authorisation.

## 4. The proposed change, in detail

One change, in one helper, in one file:
`tests/integration/theme-no-effect-badge.spec.ts`.

**4.1** At the top of `expectReachableByTab`, before `combobox.focus()`, add a
precondition that no Select popup is open:

```ts
await expect(
  ctx.window.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)'),
  `${selectTestId}: every Select popup must be CLOSED before the traversal — ` +
    `with one open, antd correctly keeps focus in the combobox and this probe ` +
    `would measure in-popup focus containment, not the badge's tab order`,
).toHaveCount(0, { timeout: 5000 });
```

**4.2** Extend the helper's docblock with the STATE property: which of antd's
two focus regimes each assertion is measured in, and why the precondition is
load-bearing rather than cosmetic.

**4.3** Nothing else. In particular the existing direction handling and the
explicit `.focus()` that resets Chromium's sequential-focus starting point stay
exactly as they are — both were established by review and neither is implicated.

### Deliberately NOT proposed

- **No change to the three calling tests.** The precondition belongs in the
  helper, where every present and future caller gets it.
- **No `waitForTimeout`.** A fixed sleep would mask the race at some speeds and
  not others, and would not fail when the popup genuinely never closes.
- **No retry or tolerance around the assertion.** Retrying until it passes is
  how a probe stops being able to fail.
- **No `src/` change.**

## 5. Blast radius

`expectReachableByTab` has **four call sites across three tests**, all in this
file, and it is **not exported** (enumerated with
`grep -rn expectReachableByTab tests/ src/`):

| Line   | Host                          | Test                                                                      | Current CI outcome       |
| ------ | ----------------------------- | ------------------------------------------------------------------------- | ------------------------ |
| `:343` | `theme-select`                | `the badge explanation is reachable without a mouse`                      | passes — the **control** |
| `:447` | `theme-settings-select`       | `the non-compact collapsed badge is keyboard-reachable too`               | fails 25/32, flaky 7/32  |
| `:573` | `theme-manager-saved-select`  | `the saved-theme and per-view override badges are keyboard-reachable too` | fails 32/32              |
| `:579` | `theme-manager-view-override` | (same test as `:573`)                                                     | **never reached on CI**  |

⚠⚠ **`:579` IS A NEW-EXPOSURE RISK, AND THIS PLAN NAMES IT RATHER THAN
DISCOVERING IT AFTERWARDS.** Its test dies at `:573`, so across all 32 CI runs
the fourth call site has never executed. Fixing `:573` makes `:579` run on CI
for the first time. It is not a blind unknown — the PR #142 reviewer measured
both badge cases green locally 4/4 at `--workers=1 --repeat-each=2`, so it
passes on a laptop — but it has **no CI history at all**, and "passes locally"
is precisely the property that failed to predict CI for `:447` and `:573`.
**A first green run of these two identities may therefore surface a third
failure at `:579`, and that would not be a regression introduced by this fix.**

- **Upstream reliances:** none. The helper is file-local.
- **The control:** `:343` currently passes, so the change must leave it passing.
  It reaches the helper via `pickTheme`, which likewise does not wait for the
  popup to close, so it is exposed to the same race and has simply been winning
  it.
- **Not touched:** `hoverWhenSettled`, the option-row a11y legs, the tooltip
  wording legs, and every other test in the file.

## 6. How it will be verified, before a CI cycle is spent

Per the MANDATORY COMPANION clause in `CLAUDE.md` — a plan review catches wrong
thinking but not wrong doing, so any guard whose subject is timing gets a
runnable bidirectional harness against the real code first.

1. **The probe already run** (§2b) establishes both directions of the underlying
   behaviour. It will be re-run against the **fixed** helper.
2. **Green leg:** all three calling tests pass locally at `--workers=1`.
3. **Red leg — the one that matters.** The new assertion must be shown to FAIL
   when its premise is false, or it is decoration. Deliberately leave a popup
   open before the traversal and confirm the helper fails on the
   **precondition**, with its own message, rather than failing later at `:202`
   with the misleading `testid: null`.
4. **Control leg:** confirm the helper still fails when the badge is genuinely
   unreachable — run it against `6eb47d8`'s `src/`, where the badge had no
   `tabIndex`, and confirm it still fails there. That is the known-bad input the
   original helper was proved on.
5. **CI:** the two identities must pass. Until they do, the manifest rows stay.

## 7. Sequencing, and what needs the owner

1. This plan is reviewed independently (the owner pastes the commission — the
   no-agent-spawned-Codex ruling stands).
2. Every inconsistency it raises goes to the owner with options and a
   recommendation, in a form a non-developer can judge.
3. Only then is the code written, on this branch.
4. Retiring the two manifest rows needs the owner's explicit authorisation and
   CI evidence. **Baselining is not diagnosis, and neither is un-baselining.**

## 8. The weakest claims in this plan, for the reviewer to attack

- The bidirectional probe was run on the **`theme-settings-select`** host only.
  For `theme-manager-saved-select` the evidence is its CI failure screenshot
  showing the popup open, the identical helper, assertion and `testid: null`,
  plus the four-host measurement recorded during PR #142. That is strong and it
  is **not** the same as having run legs A and B on that host.
- I have **not** discriminated whether the popup at failure time is one that
  never finished closing or one that was re-opened. The screenshots show it
  open; they do not show how it got there. The proposed precondition covers
  both, but a reviewer may reasonably want the distinction pinned first.
- `toHaveCount(0)` asserts over **every** Select popup in the document, not just
  the one belonging to `selectTestId`. That is deliberate — it is the stricter
  condition and the one the reviewer prescribed — but it will also fail if an
  unrelated Select is left open by an earlier step, which is a behaviour change
  worth a reviewer's eye.
- The 5000 ms timeout is inherited from the file's other waits rather than
  derived from a measurement of how long the close actually takes under load.
- §5's `:579` exposure means "both identities green" is a **weaker** success
  signal than it looks: it is the first time that call site will have run on CI.
