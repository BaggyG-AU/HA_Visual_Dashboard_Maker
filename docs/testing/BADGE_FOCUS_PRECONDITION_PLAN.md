# Plan — establish the popup-closed precondition in `expectReachableByTab`

Author: Claude Opus 5 (1M context)
Reviewer: OpenAI Codex (GPT-5.6 Sol)
Owner gate: micah / BaggyG-AU

**Status: PLAN ONLY, REVISION 4. No code has been written.** Revision 2
answered the independent review at
`docs/reviews/badge-focus-precondition-plan-codex-review.md` (verdict
SEV-1-BLOCKED, commit `a81fb78`) and the owner's adjudication of
BF-P1/BF-P2/BF-P3 on 2026-08-25. **Revision 3 is what the author's own
pre-handover run of the scoped follow-up commission caught in revision 2** —
six items, one of them a required element of the BF-P2 repair that revision 2
had dropped. That run and its results are §10. **Revision 4 answers the STRAT-D7
scoped follow-up at
`docs/reviews/badge-focus-precondition-plan-codex-followup-review.md` (verdict
CHANGES-REQUIRED, commit `a18d784`), which disposed BF-P1/BF-P3/BF-P4 RESOLVED,
BF-P2 PARTIALLY RESOLVED, and raised BF-F1 (SEV 2) and BF-F2 (SEV 3).** The
per-finding disposition tables are §9. This document exists to be reviewed before it is implemented. Its
subject is timing and it changes a helper three tests depend on, so it falls
inside the SPEC-BEFORE-CODE ruling in `CLAUDE.md` (owner's ruling 2026-08-16,
in force).

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
tests reach it immediately after clicking an option in that very Select, and on
the runner the popup is **still open when the traversal runs**.

⚠ **That is the whole established claim, and it is deliberately narrower than
revision 1's.** The evidence fixes the STATE — open at traversal — not its
ORIGIN. A close that had not finished, a reopen, and any other transition
leaving the Select's `open` true would all produce it, and the screenshots
cannot tell them apart. The precondition covers all three origins, which is why
the open question does not block the guard; but the plan no longer asserts "the
popup never finished closing".

**With the popup open, antd correctly keeps focus inside the combobox** — the
option list receives the key while `open` is true. The helper therefore measures
antd's in-popup focus containment rather than the badge's position in the tab
order, and reports the badge unreachable.

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
- The helper still **fails** when the badge is genuinely unreachable, **and
  when a different element bearing the same repeated test id is reached
  instead** — the exact-identity half of the governing three-property rule.
- No `src/` change. This is not a product defect.
- The two manifest rows are retired **only after CI demonstrates the fix**, and
  only with the owner's explicit authorisation.

## 4. The proposed change, in detail

One change, in one helper, in one file:
`tests/integration/theme-no-effect-badge.spec.ts`.

**4.1 — STATE (revised per BF-P3, owner chose the scoped authority).** Wait for
the _owning_ combobox to report its popup closed, before `combobox.focus()`:

```ts
await expect(
  combobox,
  `${selectTestId}: this Select's popup must be CLOSED before the traversal — ` +
    `while it is open the option list receives the key and focus correctly ` +
    `stays in the combobox, so the probe would measure in-popup focus ` +
    `containment, not the badge's tab order`,
).toHaveAttribute('aria-expanded', 'false', { timeout: 5000 });
```

⭐ **Why this and not the document-global animation wait originally proposed.**
Read from the locked dependency, not inferred:

- `aria-expanded` is rendered straight from the Select's `open` state —
  `'aria-expanded': open || false`
  (`node_modules/@rc-component/select/es/SelectInput/Input.js:175`);
- that same `open` is what routes the keystroke —
  `if (mergedOpen && …) { listRef.current?.onKeyDown(event); }`
  (`node_modules/@rc-component/select/es/BaseSelect/index.js:257-263`);
- whereas `…-hidden` is CSSMotion's `leavedClassName` with
  `removeOnLeave: false`
  (`node_modules/@rc-component/trigger/es/Popup/index.js:137-150`), i.e. it
  lands only after the _visual_ leave completes.

So `aria-expanded="false"` is **the cause**, and the hidden class is a later
proxy for it that also couples the assertion to animation duration and to
every other Select on the page. The original proposal would have failed when an
unrelated Select was open — a precondition belonging to another component.
⚠ That last sentence is a **claim about the rejected alternative, and revision 3
puts it under test** rather than leaving it asserted: it is case 4 of §6a.

⚠⚠ **THE STEP REVISION 2 LEFT OUT — WHY THE GUARD IS SUFFICIENT FOR THE OBSERVED
FAILURE, NOT MERELY RELATED TO IT.** The natural attack is that the screenshots
show the popup _visually_ present, which is equally consistent with `open`
already `false` and the leave animation still running. In that state
`aria-expanded` would **already** read `"false"`, the guard would wait for
nothing, and the fix would fix nothing. The failure payload rules that reading
out. Focus was retained on the combobox `<input>`
(`{"testid":null,"tag":"INPUT","cls":"ant-select-input"}`), so the `Shift+Tab`
was **prevented**; the only thing that prevents it is the option list's key
handler — `case KeyCode.TAB:` … `if (open) { event.preventDefault(); }`
(`node_modules/@rc-component/select/es/OptionList.js:201-216`; `KeyCode.TAB` is
9 with or without Shift) — and that handler is reached only through the
`mergedOpen` gate at `BaseSelect/index.js:257-263`. So `mergedOpen` was **true**
at traversal, and `aria-expanded` is rendered from that same value. **The
attribute the guard waits on is the attribute that was wrong.**
ⓘ Tagged **INFERRED**: this is deduced from the failure payload plus the locked
source, not observed as an attribute read on the runner. Leg A of the local
probe corroborates it by producing the identical payload with the popup held
open. **The follow-up review re-derived this chain independently at the locked
versions and confirmed it, and found no route at any of the four hosts that
begins the keydown with `mergedOpen` false and still retains the input.**

⚠ **A TEMPORAL TRAP FOR WHOEVER BUILDS THE HARNESS, added in revision 4.** The
inference is about the moment the key **arrives**, not the moment you read the
attribute afterwards. `OptionList`'s Tab branch calls `onSelectValue(…)` — which
closes the Select — and only **then** runs `if (open) { event.preventDefault(); }`
(`node_modules/@rc-component/select/es/OptionList.js:201-216`). So in a failed
traversal the Select closes inside the very handler that prevented the key, and
`aria-expanded` already reads `"false"` by the time anyone inspects it.
**Reading the attribute after the failure and finding `"false"` does not refute
the guard — it is the expected aftermath.** The reviewer measured this in the
old-helper leg and ruled that it supports the guard rather than defeating it,
because the guard runs **before** the key is sent.

**4.2 — EXACT IDENTITY (BF-P1, owner chose to fix it now).** The helper takes
the caller's already-scoped badge locator and asserts on the node, not on a
projection of it:

```ts
async function expectReachableByTab(
  ctx: Awaited<ReturnType<typeof launchWithDSL>>,
  selectTestId: string,
  badge: Locator,          // NEW — supplied by the caller, already scoped
): Promise<void> {
```

**Three assertions change, not two.** Both destination assertions become
`await expect(badge, …).toBeFocused()`, and the middle assertion — that the
badge has a real preceding focus target — keeps its negative form expressed
against the same scoped node: `await expect(badge, …).not.toBeFocused()`.

⚠ **What becomes of `activeElement` (`:132-140`), stated because revision 2 was
silent on it.** It stops deciding anything and survives as a **diagnostics-only**
reader: the third assertion's message names the control it tabbed forward from
(`${predecessor.testid ?? predecessor.text}`), and that message is worth
keeping. So the predecessor capture at `:205` stays, its value feeds that
message and nothing else, and **no assertion anywhere in the helper compares a
projection of `document.activeElement` again** — which is the property BF-P1
actually requires. ⚠ Reviewer, attack this: retaining a diagnostic-only reader
is a judgement, not a necessity, and if you would rather see `activeElement`
deleted outright, say so.

⚠ **Why caller-supplied rather than derived from `selectTestId`, and this is
measured rather than assumed.** Three call sites scope the badge by the
Select's own test id, but the fourth does not: `theme-selector` is a `<Space>`
**wrapper** around `theme-select`
(`src/components/ThemeSelector.tsx:62,77`), and that caller scopes its badge by
the wrapper (`:332`). Deriving the badge inside the helper would therefore rest
on an unverified DOM-containment assumption at one of the four hosts.
Caller-supplied avoids it entirely, and it is what R7-N1 prescribed in as many
words: "pass the scoped badge locator into the helper, assert `toBeFocused()`".

⚠ **CORRECTED IN REVISION 3 — "every caller already holds a correctly scoped
locator" was an overstatement, and it understated the diff.** Two of the four
hold one in a variable: `:332` (`const badge = …`) and `:439`
(`const tagBadge = …`). The other two **construct the locator inline inside
`await expect(…)` and discard it** — `:571` and `:577` — so those two callers
need a **new local** as well as a new argument. §9's radius says so.

⭐ **This closes R7-N1**, an open finding on `main` since PR #142 and recorded
as open in the live `[STATE]` record. The badge's test id is deliberately
repeated across its render contexts (`src/components/ThemeNoEffectBadge.tsx:180,187`),
and the prior reviewer demonstrated the bypass by planting a focusable
same-testid decoy and removing the intended badge's tab stop: the helper passed
while the intended badge was not focused.

**4.3** The existing direction handling and the explicit `.focus()` that resets
Chromium's sequential-focus starting point stay exactly as they are — both were
established by review and neither is implicated.

### Deliberately NOT proposed

- **No `waitForTimeout`.** A fixed sleep would mask the race at some speeds and
  not others, and would not fail when the popup genuinely never closes.
- **No retry or tolerance around the precondition.** Retrying until it passes is
  how a probe stops being able to fail.
- **No `src/` change.** The product is not defective; `ThemeNoEffectBadge.tsx`
  and the Select hosts are untouched, including the repeated test id, which is
  deliberate and is now handled on the test side.

⚠ **REVISION 2 CHANGED THE CALL SITES, WHICH REVISION 1 DID NOT.** All four
callers gain one argument, and **two of them also gain a new local** (`:571` and
`:577` build their badge locator inline inside `await expect(…)` and discard it
— see §4.2). That is a direct consequence of the owner's BF-P1 decision and is
enumerated in §9's radius.

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

⚠⚠ **THE UNEXECUTED TAIL IS WIDER THAN `:579`, corrected per BF-P4.** The
saved-theme test dies at `:573`, so everything after it is unreached. Measured
by the reviewer over the same 32-report population: **96 of 96 attempts failed
first at the saved-theme helper**, so none reached the override setup, the
override badge visibility assertion, the override helper call, or the explicit
settings close — `tests/integration/theme-no-effect-badge.spec.ts:575-581`. The
`finally` cleanup at `:582-584` did still run.

⚠ **AND THE REVISION-1 WORDING WAS INTERNALLY INCONSISTENT.** It said "a first
green run of these two identities may surface a third failure at `:579`". If
`:579` fails, that identity is **not green** — the sentence contradicted itself.
Stated correctly:

> Repairing `:573` makes `:575-581` execute on CI for the first time. The first
> post-fix run may therefore move this identity's failure from the saved-theme
> step into the newly executed tail, rather than turning it green. That would
> **not** be a regression introduced by this fix; it would be a pre-existing
> unknown becoming visible for the first time. "Both identities green" is
> correspondingly a **weaker** success signal than it appears, because part of
> what it certifies will never have run before.

ⓘ It is not a blind unknown — the PR #142 reviewer measured both badge cases
green locally 4/4 at `--workers=1 --repeat-each=2` — but "passes locally" is
exactly the property that failed to predict CI for `:447` and `:573`.

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
runnable bidirectional harness against the real code first. **Revised per BF-P2:
revision 1 specified only two settled endpoints, which could show the guard
FIRES but never that it WAITS.** The middle case is the defect being repaired.

**6a — the state guard, FOUR cases, against the real Select.** Revision 2 had
three. The fourth is a **required element of the BF-P2 repair that revision 2
dropped**: the review's required repair reads "include an unrelated-open-popup
case **if the owner selects the scoped guard**", and the owner selected the
scoped guard (BF-P3, option A). §10 records how that omission was caught.

| #   | Case                                                                | Old / guard-removed helper                              | Repaired helper                                                           |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | Owning popup held OPEN                                              | fails late at the destination assertion, `testid: null` | **fails on the precondition, with its own message**                       |
| 2   | Owning popup closing on a CONTROLLED DELAY, just under the deadline | **fails** — traverses too early                         | **waits, then passes**                                                    |
| 3   | Owning popup already CLOSED                                         | passes                                                  | passes, and adds no measurable stall                                      |
| 4   | Owning popup CLOSED, an **unrelated** Select's popup OPEN           | n/a — this case tests the guard's SCOPE, not its timing | **proceeds and passes**; the rejected document-global guard **must fail** |

**Case 2 is the timing discriminator** and must be run **both** ways — guard
removed and guard present — with both outcomes recorded before any CI cycle.
The delay sits near the guard's own boundary rather than at an extreme: a
never-close case only proves the timeout, and the defeating case for a timing
guard sits just under its resolution, not far outside it.

**Case 4 is the scope discriminator**, and it is what turns §4.1's rejection of
the document-global wait from an assertion into a measurement. It is
constructible without contrivance: `ThemeSettingsDialog.tsx` carries
`theme-settings-select` (`:376`), `theme-manager-saved-select` (`:480`) and
`theme-manager-view-override` (`:531`), and the last two are already proved
co-present by the existing test at `:569-579`, which uses both in one flow
without reopening anything.

⚠⚠ **IT NEEDS EXACTLY ONE OPEN POPUP, AND REVISION 3 DID NOT ISOLATE IT —
BF-F1, corrected here.** The state this case requires is the **owning popup
closed and one unrelated popup open**. Revision 3 established only that the
owning combobox reads `aria-expanded="false"` before opening the unrelated
Select, and **that is not sufficient**: `aria-expanded` flips at the React
commit, while the owning popup keeps its non-hidden class until CSSMotion's
leave finishes (`@rc-component/trigger/es/Popup/index.js:137-150`). In that
window the owning popup is **still a member of the document-global count**, so
the rejected global guard fails because of the **owning** popup rather than the
unrelated one — and the negative control passes for the wrong reason. The
reviewer measured exactly that:
`{"savedExpanded":"false","unrelatedExpanded":"true","visiblePopupCount":2}`.

**The corrected sequence:**

1. At the `theme-manager-saved-select` host, select in the owning Select.
2. **Wait for the document-global visible-popup count to reach ZERO** —
   `.ant-select-dropdown:not(.ant-select-dropdown-hidden)` at `toHaveCount(0)`.
   This is the isolation revision 3 was missing, and it is the only step that
   makes the case able to fail for solely the named reason.
3. Only then open `theme-manager-view-override`'s popup.
4. Record all three facts: owning `aria-expanded="false"`, unrelated
   `aria-expanded="true"`, and **exactly one** visible popup.
5. Run both guards from that isolated state.

⭐ **This is not a speculative repair — the reviewer ran it.** From the isolated
state the document-global guard still timed out, the scoped guard passed, and
`Shift+Tab` focused the exact saved-theme badge. §4.1's scope claim therefore
now has a measurement behind it, taken in the one state that can support it.
⚠ Note the direction of the result: the global guard fails **even when it should
not**, which is the defect BF-P3 named. That is the point of the case.

**⭐ The mechanism for case 2, specified rather than deferred.** Revision 2 named
this as an open question in §8 and left it there; declaring a hole is not
filling it, and §6 is binding on how the fix is proved. The construction is
**page-side and touches no `src/` file**: open the owning Select so `open` is
true, then schedule its close entirely inside the page before entering the
helper —

```ts
const DELAY_MS = 4000; // just under the guard's 5000 ms deadline
await ctx.window.evaluate((delayMs) => {
  const input = document.querySelector<HTMLInputElement>(
    '[data-testid="theme-manager-saved-select"] input',
  );
  window.setTimeout(() => {
    input?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }),
    );
  }, delayMs);
}, DELAY_MS);
```

With the guard removed the helper focuses and presses `Shift+Tab` at t≈0, while
`open` is still true, and **fails** with the `testid: null` signature. With the
guard present the helper is polling `aria-expanded`, sees it flip at
t≈`DELAY_MS`, and **continues and passes**.

⚠ **Why this does not change what is being measured.** Escape drives antd's own
close path — it sets `open` false through the same state an option click does —
and it leaves focus on the combobox, which is exactly the state the three real
tests are in when they enter the helper. It patches nothing, stubs no timer, and
does not touch key routing: `mergedOpen` gates the option list's key handler
either way. It is scheduled **page-side** rather than as an unawaited Playwright
`keyboard.press`, so it cannot interleave with the helper's own key presses in
the guard-removed leg. ⚠⚠ **What it does NOT reproduce is the ORIGIN of the open
state on CI** — §2 is deliberately silent on that, and this harness is silent
too. It reproduces the **state transition** the guard is asked to survive, which
is what BF-P2 asked for and no more.

ⓘ **Fallback, with its cost stated.** If the synthetic `keydown` does not close
the popup (React attaches its listener at the root container, so a bubbling
native event should reach it — **INFERRED, not yet run**), the fallback is an
unawaited `ctx.window.keyboard.press('Escape')` fired from a test-side timer.
That is acceptable only for the guard-present leg, where the helper sends no
keys while it polls; in the guard-removed leg it could interleave with the
helper's `Shift+Tab`, so that leg would have to be re-derived. Prefer the
page-side form.

**6b — exact identity, the adversarial control (new in revision 2).** Reproduce
the recorded R7-N1 mutation against the repaired helper: remove the intended
badge's `tabindex` and insert a focusable element carrying the same
`data-testid` before the input. The repaired helper **must fail**; the current
helper passes. Without this leg the identity repair is unproven.

**6c — the badge-reachability control, retained.** Run against `6eb47d8`'s
`src/`, where the badge had no `tabIndex`, and confirm the helper still fails.
⚠ Its limit is now stated: it proves the helper detects the absence of any
intervening matching tab stop; it does **not** clear exact identity (that is 6b)
or popup state (that is 6a).

**6d — the control caller.** `:343` passes today and must still pass.

**6e — CI.** Only after 6a-6d are recorded. The two manifest rows stay until CI
evidence exists and the owner authorises their retirement, and §5's hidden-tail
caveat applies to reading that evidence.

## 7. Sequencing, and what needs the owner

1. ✅ **Done.** Revision 1 was reviewed independently — verdict SEV-1-BLOCKED
   (`a81fb78`); the owner adjudicated BF-P1/BF-P2/BF-P3 on 2026-08-25 and
   revision 2 landed as `014ac1c`.
2. ✅ **Done.** Revision 3 (`9fcc774`) went back to the **same reviewer** as the
   **scoped follow-up** required by STRAT-D7 / `OPERATING_AGREEMENT.md` §3.4 —
   scope being the repair diff plus the declared radius, disposing BF-P1 to
   BF-P4, **not** a fresh full review. Verdict **CHANGES-REQUIRED** (`a18d784`):
   BF-P1, BF-P3 and BF-P4 **RESOLVED**; BF-P2 **PARTIALLY RESOLVED**; two new
   findings, BF-F1 (SEV 2) and BF-F2 (SEV 3). **Disposition table: §9.1.**
3. ⬅ **WE ARE HERE.** Revision 4 answers both new findings and is committed.
   **No code has been written and none may be** — the follow-up's verdict was
   CHANGES-REQUIRED, so the gate at step 5 has not opened.
4. **BF-F1 is SEV 2 and needs the owner.** It goes up as an Owner Decision Brief
   in STRAT-D15's six fields. The owner gate is held by a non-developer and is
   never asked to classify a diff. Revision 4 implements the reviewer's
   recommended **option A**; **option B remains open to the owner** and is a
   small edit, not a rewrite.
5. **Only when a follow-up returns ACCEPTS-REVISION** is code written, on this
   branch, with §6's **four** cases and three controls recorded **before** a CI
   cycle is spent. Every further revision owes another same-reviewer scoped
   follow-up — that is universal under D7, with no exemption for a small diff.
6. Retiring the two manifest rows needs the owner's explicit authorisation and
   CI evidence. **Baselining is not diagnosis, and neither is un-baselining.**

## 8. The weakest claims in this plan, for the reviewer to attack

Revision 3. Two claims from revision 1 are **withdrawn** as the review required;
the standing weaknesses are restated, revision 2's three are kept (one of them
now answered), and revision 3 adds four more.

**WITHDRAWN — two overstatements the review caught.**

- Revision 1 called the document-global count "the one the reviewer
  prescribed". **That was an overstatement.** R7-N1 reported the count-zero wait
  as an experiment that made traversal deterministic; it never adjudicated
  global versus scoped, and it separately prescribed the scoped badge locator
  this revision now adopts. Withdrawn.
- Revision 1 spoke of a popup "that never finished closing". The evidence
  establishes only **open at traversal**. It does not distinguish a delayed
  close, a reopen, or another transition leaving `open` true. Narrowed
  throughout; the guard covers all three origins, which is why the residual
  uncertainty does not block it.

**STANDING WEAKNESSES.**

- The bidirectional probe was run on the **`theme-settings-select`** host only.
  For `theme-manager-saved-select` the evidence is its CI failure screenshot,
  the identical helper, assertion and `testid: null`, plus the four-host
  measurement from PR #142. Strong, and **not** the same as legs A and B on that
  host.
- The 5000 ms timeout is inherited from the file's other waits rather than
  derived from a measured close duration under load. Now less load-bearing than
  in revision 1, because `aria-expanded` flips at the React commit rather than
  at the end of the leave animation — but still not derived.
- §5's hidden tail means "both identities green" certifies code that has never
  run on CI.

**NEW IN REVISION 2 — attack these.**

- **The signature change touches four call sites.** Revision 1 changed none.
  Each caller must pass a locator that is genuinely the badge under test; a
  caller that passes the wrong one re-introduces exactly the defect being
  fixed, only more quietly, because it would now be a _scoped_ wrong node.
- **`toBeFocused()` requires the locator to resolve to exactly one element.** At
  each of the four hosts that is asserted visible beforehand, but strictness is
  now assumed rather than measured. A host whose badge locator matched two nodes
  would fail for a reason unrelated to reachability.
- **`aria-expanded` is read from the locked dependency at the version installed
  today.** It is a rendered accessibility attribute, not a public API contract;
  a future `@rc-component/select` bump could move it. That is a cheaper failure
  than the animation coupling it replaces — it would fail loudly — but it is a
  version-pinned fact, and the plan should be re-checked at any Select upgrade.
- ~~**Case 2 of §6a needs a mechanism to delay the close.**~~ **ANSWERED in
  revision 3**, not dropped: §6a now specifies a page-side scheduled `keydown`,
  argues why it does not alter what is measured, and states what it does not
  reproduce. Its own residual weakness is the first bullet below.

**NEW IN REVISION 3 — attack these too.**

- **The case-2 mechanism is now specified but has never been run.** §6a's
  page-side `keydown` relies on React's root-container listener receiving a
  bubbling native event. That is **INFERRED from how React 17+ delegates, not
  measured here**, and if it is wrong the whole timing discriminator falls back
  to a form with a known interleaving hazard.
- ~~**Case 4 assumes two popups can be open at once.**~~ **WITHDRAWN in revision
  4 — it asked the wrong question** (BF-F1). Case 4 requires the owning popup
  **closed** and exactly **one** unrelated popup open; whether two can be open
  simultaneously is irrelevant to it. Worse, the caveat instructed an
  implementer to record the case UNRUN for a condition that never applies. What
  the case actually needs is the zero-count isolation now specified in §6a.
- **§4.1's `mergedOpen`-was-true inference** is deduced from the failure payload
  plus locked source, not from an attribute read on the runner. If it is wrong,
  the guard is aimed at the wrong attribute and cases 1-3 would still pass while
  CI stayed red. That is the single load-bearing inference in this plan.
- **`activeElement` is retained as a diagnostics-only reader.** A reader that
  gates nothing cannot re-introduce the bypass, but it is one edit away from
  gating something again.

## 9. Disposition of the independent review

Review: `docs/reviews/badge-focus-precondition-plan-codex-review.md`, verdict
SEV-1-BLOCKED, commit `a81fb78`. Owner adjudicated 2026-08-25.

| Finding                                                 | Sev | Owner decision                    | Disposition                                                                                                                                                                                                                                                                          | Where         |
| ------------------------------------------------------- | --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| BF-P1 — same-testid exact-identity bypass survives §4.3 | 1   | Option A — fix identity now       | **RESOLVED** — helper takes a caller-supplied scoped locator and asserts `toBeFocused()`; adversarial decoy control added. Closes R7-N1.                                                                                                                                             | §3, §4.2, §6b |
| BF-P2 — no fail-against-old transition leg              | 1   | Option A — add the middle case    | **RESOLVED IN REVISION 3.** Revision 2 was only PARTIAL: it added the middle case but dropped the unrelated-open-popup case the repair required once the owner chose the scoped guard, and named no mechanism for the middle case. §6a now has four cases and a specified mechanism. | §6a, §10      |
| BF-P3 — document-global CSS guard is later and broader  | 2   | Option A — scoped `aria-expanded` | **RESOLVED** — guard is now `aria-expanded="false"` on the owning combobox, justified from locked source                                                                                                                                                                             | §4.1          |
| BF-P4 — unexecuted tail wider than `:579`               | 3   | accepted                          | **RESOLVED** — tail corrected to `:575-581`; the self-contradictory "green run may surface a third failure" wording replaced                                                                                                                                                         | §5            |
| Disagreement — "the one the reviewer prescribed"        | —   | accepted                          | **WITHDRAWN**                                                                                                                                                                                                                                                                        | §8            |
| Disagreement — "never finished closing"                 | —   | accepted                          | **NARROWED** to "open at traversal"                                                                                                                                                                                                                                                  | §2, §8        |

**Blast-radius statement (CORRECTED IN REVISION 3 — revision 2 under-declared
it, and under OA §3.4 a wrong or missing radius is itself a finding).** The
repair is confined to `tests/integration/theme-no-effect-badge.spec.ts` and
touches exactly:

1. the `expectReachableByTab` signature (`:191-194`) — one new parameter;
2. **three** assertions inside it, not two — both destinations (`:199-202`,
   `:213-216`) **and** the middle predecessor assertion (`:206-209`);
3. the new precondition, inserted between `:195` and `:196` — before
   `combobox.focus()`;
4. the four call sites (`:343`, `:447`, `:573`, `:579`), each gaining one
   argument;
5. **two new locals**, at `:571` and `:577`, because those two callers build
   their badge locator inline inside `await expect(…)` and discard it.

`activeElement` (`:132-140`) survives as a diagnostics-only reader and gates
nothing (§4.2). No `src/` change, no manifest change, and no change to any other
spec.

⚠ **THE SWEEP NARRATION IS CORRECTED IN REVISION 4 — the previous sentence was
false (BF-F2), and how it became false matters more than the sentence itself.**
The command this plan ships is
`rg -n "toBeFocused|activeElement|theme-no-effect-badge" tests/`. Run verbatim,
its hits outside this file fall into **two** groups, not one:

- **Code-behaviour hits** — `toBeFocused` in unrelated component helpers
  (accordion, gradient editor, colour picker, popup, tabs). **None of them
  asserts that a `theme-no-effect-badge` received focus**, so R7-N1's class is
  closed by this one file. This is the group that carries the radius claim.
- **Raw text hits in `tests/baseline/expected-failures.json`** — `:91` (a prose
  note), `:178-201` (the two behavioural keyboard rows this fix targets, which
  **REMAIN baselined** until CI evidence exists and the owner authorises
  retirement) and `:476-484` (ledger entry 10, the unrelated tooltip-stability
  flaky row, **unchanged** and not a consumer). The manifest consumes test
  file/title identities, never the helper signature, so none of these is an
  implementation consumer and the radius population is unaffected.

⚠⚠ **THE ROOT CAUSE IS NOT "A SENTENCE WAS WRONG".** The command published here
and the command actually run were **different**: the sweep was run as
`grep -rn … --include=*.ts`, which cannot see a `.json` file at all, and its
result was reported as this command's result. That is clause B of the
commission-is-your-own-checklist rule — **extract the check FROM THE SHIPPED
ARTIFACT and run THAT**. A published command nobody ran is not evidence, and it
is worse than no command because it reads as one. The upstream reliance is the installed `@rc-component/select@1.5.0`
rendering `aria-expanded` from `open`; the downstream consumers are the three
calling tests, of which `:343` is the control that must stay green.

**Nothing in round 1's review was rejected.** Every finding was verified against
the cited source before being accepted — the helper's assertions, the repeated
test id in `ThemeNoEffectBadge.tsx`, the R7-N1 decoy record, and all three
dependency claims in `@rc-component/select`, `@rc-component/trigger` and
`@rc-component/motion`.

### 9.1 Disposition of the STRAT-D7 scoped follow-up (round 2)

Follow-up: `docs/reviews/badge-focus-precondition-plan-codex-followup-review.md`,
verdict **CHANGES-REQUIRED**, commit `a18d784`, same reviewer.

| Finding                                                                | Sev | Reviewer's disposition | This plan's response                                                                                                    | Where   |
| ---------------------------------------------------------------------- | --- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------- |
| BF-P1 — exact identity                                                 | 1   | **RESOLVED**           | Accepted. Three-assertion class confirmed complete; "closes R7-N1" ruled earned.                                        | §4.2    |
| BF-P2 — fail-against-old transition leg                                | 1   | **PARTIALLY RESOLVED** | Accepted. Cases 1–3 ruled executable and causal; case 4 was mis-specified. Completed in revision 4.                     | §6a     |
| BF-P3 — guard scope and authority                                      | 2   | **RESOLVED**           | Accepted. Chain independently re-derived at the locked versions; no closed-start route found at any of the four hosts.  | §4.1    |
| BF-P4 — unexecuted tail                                                | 3   | **RESOLVED**           | Accepted.                                                                                                               | §5      |
| **BF-F1 — case 4 can fail the global guard for the wrong popup state** | 2   | NEW                    | **ACCEPTED — verified at source.** Zero-visible-popup isolation added; the wrong-question caveat withdrawn.             | §6a, §8 |
| **BF-F2 — §9's sweep-result sentence is false**                        | 3   | NEW                    | **ACCEPTED — verified by running the shipped command verbatim.** Corrected, with the published-vs-run root cause named. | §9, §10 |

**Nothing in the follow-up was rejected either.** BF-F1 was reproduced from the
locked motion source (`aria-expanded` flips at the React commit; the non-hidden
class persists until the leave completes), and BF-F2 by running this plan's own
published command and finding the `expected-failures.json` hits it denies. Three
supporting reviewer claims were also checked and hold: `Locator` is already
imported at `tests/integration/theme-no-effect-badge.spec.ts:19`;
`tests/baseline/expected-failures.json:476-484` is the unrelated tooltip flaky
row; and `OptionList` does call `onSelectValue(…)` before
`if (open) { event.preventDefault(); }`.

⚠ **BF-F1 is SEV 2 and carries an Owner Decision Brief.** The reviewer
recommended **option A** (add the isolation) over option B (drop the runtime
scope claim and rely on source reasoning alone), because B would remove the case
round 1 expressly required once the owner chose the scoped guard. **Revision 4
implements option A**, which the reviewer had already executed and measured
working. If the owner prefers B, case 4 and its §8 entry come out and §4.1's
scope claim reverts to source reasoning — a small edit, not a rewrite.

## 10. The author's own run of the follow-up commission, before handing it over

The governing rule is that **the review commission you write is the checklist
you owe yourself, and writing it down is not running it** — run every check
against your own artifact first, fix what it catches, then hand the commission
over **unweakened** with the record that you ran it. Revision 2 was blocked by a
review that found two SEV 1s partly because the previous self-check ran on one
dimension and not on the dimension the governing rule named. So this run was
made on **every** dimension the follow-up commission asks about, not the
convenient ones.

**What was run:** the seven questions of
`docs/reviews/badge-focus-precondition-plan-codex-followup-commission.md`,
against revision 2 (`014ac1c`), before that commission was handed to the owner.
The commission was **not** softened afterwards; every question below is still in
it, in the same words.

| #      | Dimension                                 | Result on revision 2                                                                                                                                     | Fixed in revision 3                                                                                                      |
| ------ | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **S1** | Radius accuracy (Q5)                      | §9 declared "its two destination assertions"; §4.2 also changes the middle one. **Under-declared radius — itself a finding under OA §3.4.**              | §9                                                                                                                       |
| **S2** | BF-P1 completeness (Q1)                   | Silent on what becomes of `activeElement` and the `predecessor` capture that feeds the third assertion's message. Under-specified.                       | §4.2                                                                                                                     |
| **S3** | Claim hygiene (Q1)                        | "Every caller already holds a correctly scoped locator" is false at `:571` and `:577`, which build it inline and discard it.                             | §4.2, §9                                                                                                                 |
| **S4** | BF-P2 completeness (Q2) — **the big one** | The unrelated-open-popup case, **required by the review once the owner chose the scoped guard**, was absent from §6a.                                    | §6a case 4 — ⚠ **only PARTLY fixed in revision 3; MIS-SPECIFIED, and completed in revision 4 — see the narrowing below** |
| **S5** | BF-P2 executability (Q2)                  | §6a case 2 named no delay mechanism; §8 declared the hole instead of filling it, while §6 is binding on how the fix is proved.                           | §6a                                                                                                                      |
| **S6** | BF-P3 sufficiency (Q3)                    | The chain stopped at "`aria-expanded` comes from `open`" and never closed back to the observed payload, leaving the obvious mid-leave attack unanswered. | §4.1                                                                                                                     |

**Checked and clean — recorded because silence is not a result.** BF-P4's tail
correction (`:575-581`, `finally` at `:582-584`) verified line by line against
the file. The R7-N1 class sweep re-run independently
(`rg -n "toBeFocused|activeElement|theme-no-effect-badge" tests/`): no assertion
outside this file claims a `theme-no-effect-badge` received focus, so the class
is closed by this one file. Every element round 1 checked clean is still intact
in revision 3 — file-local helper, test-only change, both traversal directions,
the explicit `.focus()` starting-point reset, no retry or tolerance, the
`6eb47d8` control retained with its limit stated, both manifest rows retained.
No over-reach found: "this closes R7-N1" is earned, because R7-N1's own
prescription has three parts (scoped locator, `toBeFocused()`, wait for popup
closure) and revision 3 carries all three.

**The honest part.** S4 is the same failure shape as the round before: a
required element of a decision the owner had **already made** went missing from
the revision that was supposed to implement it. It was caught here rather than
by the reviewer, which is the point of running the commission first — but the
lesson is not "the self-check works", it is that **a repair must be read against
the review's required-repair text, clause by clause, not against a summary of
the finding.**

⚠⚠ **AND REVISION 4 MUST NARROW TWO CLAIMS THIS SECTION MADE.**

1. **S4 was not "fixed" in revision 3 — it was ADDED and then MIS-SPECIFIED.**
   Revision 3 wrote case 4 in a form that could not prove what it claimed,
   because it never isolated the owning popup's own visual leave, so the
   document-global guard would have failed for the wrong popup. That is BF-F1 —
   and it is **the third consecutive instance of one defect class in this plan:
   a check that cannot fail for only the reason it names.** Fixed in §6a.
2. **"Every dimension was run" overstated one of the runs.** The Q5 radius sweep
   was run with a command **narrower than the one published** —
   `grep -rn … --include=*.ts` against a shipped `rg … tests/` — so its clean
   result never covered the file types the published command reaches. That is
   BF-F2. **A dimension exercised with the wrong instrument is not a dimension
   checked**, and the published-versus-run mismatch is the specific defect
   clause B of the governing rule exists to prevent.

**The standing lesson, now evidenced three rounds running.** Expect a residue of
genuinely independent findings: this run cannot substitute for the follow-up,
and nothing here should be read as clearing a question it merely failed to
break. **A self-check that finds six things is not thereby a self-check that
found all of them.**
