# Plan — establish the popup-closed precondition in `expectReachableByTab`

Author: Claude Opus 5 (1M context)
Reviewer: OpenAI Codex (GPT-5.6 Sol)
Owner gate: micah / BaggyG-AU

**Status: PLAN ONLY, REVISION 2. No code has been written.** Revision 2 answers
the independent review at `docs/reviews/badge-focus-precondition-plan-codex-review.md`
(verdict SEV-1-BLOCKED, commit `a81fb78`) and the owner's adjudication of
BF-P1/BF-P2/BF-P3 on 2026-08-25. The per-finding disposition table is §9. This document exists to be
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

Both destination assertions become `await expect(badge, …).toBeFocused()`.
The middle assertion — that the badge has a real preceding focus target — keeps
its negative form but is expressed against the same scoped node.

⚠ **Why caller-supplied rather than derived from `selectTestId`, and this is
measured rather than assumed.** Three call sites scope the badge by the
Select's own test id, but the fourth does not: `theme-selector` is a `<Space>`
**wrapper** around `theme-select`
(`src/components/ThemeSelector.tsx:62,77`), and that caller scopes its badge by
the wrapper (`:332`). Deriving the badge inside the helper would therefore rest
on an unverified DOM-containment assumption at one of the four hosts. Every
caller already holds a correctly scoped locator (`:332`, `:439`, `:571`,
`:577`), so passing it in is both cheaper and stricter — and it is what R7-N1
prescribed in as many words: "pass the scoped badge locator into the helper,
assert `toBeFocused()`".

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

⚠ **REVISION 2 CHANGES THE CALL SITES, WHICH REVISION 1 DID NOT.** The four
callers each gain one argument. That is a direct consequence of the owner's
BF-P1 decision and is reflected in §5.

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

**6a — the state guard, three cases, against the real Select.**

| #   | Case                                                                   | Old / guard-removed helper                              | Repaired helper                                     |
| --- | ---------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------- |
| 1   | Popup held OPEN                                                        | fails late at the destination assertion, `testid: null` | **fails on the precondition, with its own message** |
| 2   | Popup closing on a CONTROLLED DELAY, set just under the guard deadline | **fails** — traverses too early                         | **waits, then passes**                              |
| 3   | Popup already CLOSED                                                   | passes                                                  | passes, and adds no measurable stall                |

Case 2 is the one that discriminates, and it must be run **both** ways — with
the guard removed and with it present — recording both outcomes before any CI
cycle. The delay is chosen near the guard's own boundary rather than at an
extreme: a never-close case only proves the timeout, and the defeating case for
a timing guard sits just under its resolution, not far outside it.

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

1. This plan is reviewed independently (the owner pastes the commission — the
   no-agent-spawned-Codex ruling stands).
2. Every inconsistency it raises goes to the owner with options and a
   recommendation, in a form a non-developer can judge.
3. Only then is the code written, on this branch.
4. Retiring the two manifest rows needs the owner's explicit authorisation and
   CI evidence. **Baselining is not diagnosis, and neither is un-baselining.**

## 8. The weakest claims in this plan, for the reviewer to attack

Revision 2. Two claims from revision 1 are **withdrawn** as the review required;
the rest are restated and three are new.

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
- **Case 2 of §6a needs a mechanism to delay the close** that does not itself
  change what is being measured. If that mechanism is a `src/` patch it is
  forbidden here; if it is a page-side stub it must be shown not to alter the
  focus routing under test.

## 9. Disposition of the independent review

Review: `docs/reviews/badge-focus-precondition-plan-codex-review.md`, verdict
SEV-1-BLOCKED, commit `a81fb78`. Owner adjudicated 2026-08-25.

| Finding                                                 | Sev | Owner decision                    | Disposition                                                                                                                              | Where         |
| ------------------------------------------------------- | --- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| BF-P1 — same-testid exact-identity bypass survives §4.3 | 1   | Option A — fix identity now       | **RESOLVED** — helper takes a caller-supplied scoped locator and asserts `toBeFocused()`; adversarial decoy control added. Closes R7-N1. | §3, §4.2, §6b |
| BF-P2 — no fail-against-old transition leg              | 1   | Option A — add the middle case    | **RESOLVED** — three-case harness; case 2 run with the guard removed and present, both recorded pre-CI                                   | §6a           |
| BF-P3 — document-global CSS guard is later and broader  | 2   | Option A — scoped `aria-expanded` | **RESOLVED** — guard is now `aria-expanded="false"` on the owning combobox, justified from locked source                                 | §4.1          |
| BF-P4 — unexecuted tail wider than `:579`               | 3   | accepted                          | **RESOLVED** — tail corrected to `:575-581`; the self-contradictory "green run may surface a third failure" wording replaced             | §5            |
| Disagreement — "the one the reviewer prescribed"        | —   | accepted                          | **WITHDRAWN**                                                                                                                            | §8            |
| Disagreement — "never finished closing"                 | —   | accepted                          | **NARROWED** to "open at traversal"                                                                                                      | §2, §8        |

**Blast-radius statement for this revision.** The repair is confined to
`tests/integration/theme-no-effect-badge.spec.ts`: one helper signature, its two
destination assertions, its precondition, and the four call sites that supply
the new argument. No `src/` change, no manifest change, no change to any other
spec. The upstream reliance is the installed `@rc-component/select` rendering
`aria-expanded` from `open`; the downstream consumers are the three calling
tests, of which `:343` is the control that must stay green.

**Nothing in the review was rejected.** Every finding was verified against the
cited source before being accepted — the helper's assertions, the repeated test
id in `ThemeNoEffectBadge.tsx`, the R7-N1 decoy record, and all three
dependency claims in `@rc-component/select`, `@rc-component/trigger` and
`@rc-component/motion`.
