# Plan — repair the spacing DSL's Select targeting so a preset click cannot land on the wrong control

Author: Claude Opus 5 (1M context)
Reviewer: OpenAI Codex (GPT-5.6 Sol)
Owner gate: micah / BaggyG-AU

**Status: PLAN ONLY, REVISION 8. No code has been written.**

⚠⚠⚠ **REVISION 8 IS A DELETION, NOT AN ADDITION.** The owner ruled on 2026-08-31,
after seven review rounds, that the document itself had become the defect source:
**17 of 30 findings were the plan contradicting or overclaiming itself, and the
executable specification is 144 lines inside what had grown to 2,698.** Revisions
2–7 each added 200–450 lines to close 2–5 findings, at a measured rate of roughly
**one new finding per 60 lines added**. This revision deletes the archaeology —
route analysis, superseded option comparisons, per-round narrative, the running-cost
essay — and keeps the specification, the acceptance criteria and the live weak
claims. **A line that does not exist cannot contradict another line.**

⚠ **Nothing deleted is lost.** The reasoning lives verbatim in the review documents
on this branch (`docs/reviews/spacing-helper-preset-plan-codex-*`), in
[`SPACING_HELPER_PRESET_PLAN_HISTORY.md`](SPACING_HELPER_PRESET_PLAN_HISTORY.md)'s
disposition tables, and in the MemPalace `havdm` wing.

It answers the seventh review
(`docs/reviews/spacing-helper-preset-plan-codex-followup6-review.md`, verdict
**SEV-1-BLOCKED**, commit `fbe64cc`). **SP-27, SP-28, SP-29 and SP-30 were verified
at source and repaired using the reviewer's own supplied specification text**, under
the owner's 2026-08-31 non-binding-design-appendix ruling.

---

## 0. For the owner — in plain English

**The problem.** A test helper asks a drop-down for a value. Two drop-downs on the
panel offer identically-labelled options, and the helper can send its click to the
wrong one — silently, reporting success. One test reddens about one run in four
because of it.

**The fix.** Each drop-down is given its own name tag in the product code (two added
lines), and the helper asks for its own tag by name. That makes hitting the wrong
control impossible **by construction**, not by inference.

**What it costs.** A two-line product change, a test-helper rewrite, one harness run
before any CI cycle, and one more review round.

**What happens if you do nothing.** The test keeps reddening, issue #145 stays hard
to close, and the helper keeps the ability to drive the wrong control silently.

**Your three decisions are all made** — the ownership mechanism (option B), the
change's class, and the governance lane. §7.5 carries the running cost. Nothing
below reopens them.

---

## 1. Context

**The failing identity:** `tests/e2e/spacing.spec.ts` › `Card Spacing Controls` ›
`applies spacing presets` (`:94-117`). Seven recorded sightings. It is **not** on
`tests/baseline/expected-failures.json` (7 failures / 10 flaky / 21 skips — the
spacing identity is on none), so it reddens any run it fires in.

**The ruling this implements:** fix the instrument rather than allowlist it
(owner, 2026-08-26).

**What this plan is NOT:** it does not touch `BackgroundCustomizer`'s five existing
`popupClassName` uses, and it does not migrate them off the deprecated API.

---

## 2. What is actually going wrong

**D1 — no ownership.** `getVisibleSelectDropdown()` returns
`.ant-select-dropdown:visible` **document-wide**. Nothing ties the popup it finds to
the Select the caller named.

**D2 — scope-only search.** The option search is `.ant-select-dropdown:visible
.ant-select-item-option` filtered by text, `.first()`. Both spacing halves render
identically-labelled options (`All Sides`, `None (0px)` …), so a foreign popup
supplies a match.

**D3 — the click cannot complain.** `option.evaluate((el) => el.click())` bypasses
Playwright's hit-target check, and the fallback uses `force: true`. **D3 is what
turns D1 and D2 from a loud failure into a silent wrong answer.**

⭐ **MEASURED (M4):** with the padding Select closed and the margin Select owning the
only visible popup, a document-global search for `/^Normal/i` returned **exactly one
match — the margin's**. A scope-only repair would confidently select from the
foreign popup and report success.

---

## 3. The desired outcome

1. `applies spacing presets` stops firing, because **the helper can no longer
   operate a control the caller did not name** — true by construction under
   option B.
2. **A wrong-control operation that MOVES A VALUE becomes a loud, named failure at
   the DSL**, not a silent wrong answer discovered later as `Expected "8px" /
Received "0px"`. ⚠ **Narrowed by owner ruling, 2026-08-31 (SP-25).** Detection is
   scoped to operations that move a value; **prevention is item 1's job.**
3. The whole **class** is removed from `SpacingDSL`: `setPreset`, `setMarginMode`
   and `setPaddingMode` all route through the same two private helpers
   (definitions `tests/support/dsl/spacing.ts:35`, `:53`; calls `:108`/`:110`,
   `:116`/`:117`, `:123`/`:124`).
4. Nothing is added to or removed from `tests/baseline/expected-failures.json`.
5. There **is** a `src/` change: two added lines in
   `src/components/SpacingControls.tsx`, and nothing else.

⭐⭐ **Items 1 and 2 do not overlap, and revision 7 wrongly implied they did
(SP-27).** The governing statement, in the reviewer's own words:

> P1 closes the correctly-formed-but-misattached-class path by construction. P4 is a
> second, mutation-only alarm: if that construction drifts and the wrong operation
> leaves the requested control wrong or the other half changed, P4 names the result.
> If both requested and foreign controls were already at the target value, P4
> supplies no evidence; leg 5b pins that limit.

---

## 4. The proposed change

### 4.1 The four properties the repaired helper must have

| #      | Property                                                                                                                                                                                        | Kills                                      |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **P1** | **IDENTITY, BY CONSTRUCTION.** Resolve the popup by the class it renders (`<data-testid>-popup`); fail with its own message if that popup is not visible. Nothing is derived.                   | D1, and every reachable route              |
| **P2** | **SCOPE.** Search options only within that popup's subtree, and require exactly one match.                                                                                                      | D2                                         |
| **P3** | **ACTIONABILITY.** Playwright's own `click()`, hit-target check on. No `evaluate` click, no `force: true`.                                                                                      | D3                                         |
| **P4** | **OUTCOME, MUTATION-ONLY.** Read back the requested control's own value, **and** assert the other half still holds the values captured before the gesture. Both assertions name their controls. | Wrong-control operations that MOVE A VALUE |

⚠⚠ **What P4 does NOT decide (SP-25, owner ruling):** an operation that moves **no**
value is invisible to it. P4 is a mutation alarm, **not evidence of operation
identity**. Prevention is P1's alone. Leg 5b pins that limit as a passing assertion.

### 4.2 The measured facts this design rests on

All measured under the owner's narrow harness exception; every probe untracked,
headless, deleted afterwards with `git status --porcelain` empty and `src/` +
`tests/` byte-identical to `HEAD`.

| #       | Fact                                                                                                                                                                                                                                                                                              |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M1**  | `aria-expanded` is a reliable **per-Select** open-state authority (16 comboboxes sampled).                                                                                                                                                                                                        |
| **M2**  | `aria-controls` is the constant `"test-id"` for **every** Select in test mode — shared, so it cannot identify a popup. **This killed option A.**                                                                                                                                                  |
| **M4**  | In the foreign-only state a document-global option search returns exactly one match — the wrong one.                                                                                                                                                                                              |
| **M5**  | Two popups are simultaneously visible for **350.6 / 353.0 / 359.9 ms** on the ordinary path (3 runs).                                                                                                                                                                                             |
| **M6**  | For **45.4 / 60.9 / 66.8 ms** the requested Select reads open, exactly one popup is visible, and it is the **foreign** one. **This killed option D.**                                                                                                                                             |
| **M7**  | antd 6.1.4's `classNames.popup.root` lands on the `.ant-select-dropdown` **root**, and with both popups mounted each class matched **exactly one**. ⚠ **jsdom only — never observed in the Electron renderer.**                                                                                   |
| **M8b** | A legitimate operation on one half changes only that half.                                                                                                                                                                                                                                        |
| **M9a** | A fresh card renders **all four** spacing Selects pre-satisfied — both modes `All Sides`, both presets `None (0px)`. Corroborated by construction: `src/services/cardSpacing.ts:15,17-23`.                                                                                                        |
| **M9b** | ⚠⚠ **In that state a wrong-control click changes no value, closes the popup normally, and passes BOTH P4 assertions.** This is SP-25, measured in the Electron renderer.                                                                                                                          |
| **M9c** | ⚠ **A DETECTOR-LIVENESS CONTROL, not a matched or directional mirror (SP-28).** With a foreign value that does change, P4 fails. It shows the guard _can_ fire; it does **not** isolate foreign pre-satisfaction as the only difference between it and M9b, and it does not mirror the direction. |

⚠ **M9 measures the VALUE SPACE only.** It shows that reading values back cannot
distinguish a wrong-control operation; it does not show that no oracle could. That
question was put to the owner on 2026-08-31 and **declined**; no mechanism is
invented here.

### 4.3 The ruled mechanism — option B (owner, 2026-08-27)

Each spacing `Select` renders `classNames={{ popup: { root: `${testIdPrefix}-mode-popup` } }}`
(and `-preset-popup`). `renderSection` is called twice
(`src/components/SpacingControls.tsx:228-229`), yielding four distinct classes.
**The DSL rule is: popup class = `data-testid` + `-popup`.** Options A and D are
falsified by M2 and M6 and are not reopened.

### 4.4 The proposed helper, in full

```ts
/** P1 — identity BY CONSTRUCTION. MEASURED (M7): the class lands on the
 *  `.ant-select-dropdown` ROOT and each class matched exactly one popup. */
private popupFor(testId: string): Locator {
  return this.window.locator(`.ant-select-dropdown.${testId}-popup`);
}

/** ⚠ NOT an ownership authority — option B does not ask the app which popup it
 *  has. Two jobs only: gating the retry so a second click cannot TOGGLE a
 *  slow-but-correct open shut, and the scoped post-condition. */
private async isOpen(select: Locator): Promise<boolean> {
  const v = await select
    .locator('input[role="combobox"]')
    .getAttribute('aria-expanded')
    .catch(() => null);
  return v === 'true';
}

/** ⚠⚠ An ABSOLUTE deadline with NO floor, and the remainder is read ONCE per
 *  stage: Playwright installs a progress timer only `if (timeout)`
 *  (`playwright-core/lib/server/progress.js:67-75`), so passing ZERO means NO
 *  DEADLINE, not immediate expiry. */
private async resolveOwnedDropdown(testId: string, budgetMs: number): Promise<Locator> {
  const deadline = Date.now() + budgetMs;

  const budgetFor = (stage: string): number => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      throw new Error(
        `${testId}: the ${budgetMs} ms budget expired before ${stage}; ` +
          'this Select never presented its own popup',
      );
    }
    return remaining;
  };

  const popup = this.popupFor(testId);

  // ⚠ A CONSTRUCTION check, not an inference. Two nodes would mean the class is
  // rendered by more than one Select and is no longer an identity.
  await expect(
    popup,
    `expected exactly one popup carrying .${testId}-popup — more than one means ` +
      'the class is rendered by more than one Select and is no longer an identity',
  ).toHaveCount(1, { timeout: budgetFor('the popup class could be counted') });

  // ⚠ rc-trigger KEEPS closed popups in the DOM (`removeOnLeave: false`), so this
  // node exists while the Select is shut. Visibility distinguishes open from exists.
  await expect(
    popup,
    `${testId}'s own popup never became visible within ${budgetMs} ms`,
  ).toBeVisible({ timeout: budgetFor('the popup became visible') });

  return popup;
}

/** ⚠⚠ NO document-global pre-wait. The retry is gated on this Select already
 *  being open: a Select TOGGLES on mousedown, so an unconditional second click
 *  would CLOSE a slow-but-correct open. No `force`, no `evaluate(...click())`. */
private async openSelectDropdown(testId: string): Promise<Locator> {
  const select = this.window.getByTestId(testId);
  await expect(select).toBeVisible({ timeout: 5000 });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const last = attempt === 1;
    try {
      if (!(await this.isOpen(select))) {
        await select.click();               // hit-target check stays ON
      }
      return await this.resolveOwnedDropdown(testId, last ? 5000 : 1500);
    } catch (error) {
      if (last) throw error;                // second failure is REAL — report it
    }
  }
  /* c8 ignore next */
  throw new Error('unreachable');
}

private async selectOptionByText(
  testId: string,
  pattern: RegExp,
): Promise<Record<string, string>> {
  // Captured BEFORE the gesture, here rather than in the caller so no caller can
  // forget it, and keyed by test id so a failure names the control that moved.
  const siblingsBefore = await this.snapshotOtherHalf(testId);

  const dropdown = await this.openSelectDropdown(testId);

  // ⭐ Scoped to THIS Select's own popup by construction. Even with two popups
  // visible (M5), a foreign option is not reachable from here.
  const option = dropdown.locator('.ant-select-item-option').filter({ hasText: pattern });
  // ⚠ rc-select VIRTUALISES the list, so a scrolled-out row is absent from the
  // DOM. Requiring exactly one turns ambiguity AND absence into a loud failure.
  await expect(
    option,
    `expected exactly one option matching ${pattern} in ${testId}'s own popup`,
  ).toHaveCount(1);
  await expect(option).toBeVisible({ timeout: 5000 });
  await option.click();                     // real click; actionability enforced

  // ⚠ SCOPED to this Select, not a document-global count — waiting for "no popup
  // anywhere" would fail against a legitimately-open unrelated Select.
  await expect
    .poll(() => this.isOpen(this.window.getByTestId(testId)), { timeout: 5000 })
    .toBe(false);

  return siblingsBefore;
}

/** The two Selects of the half this control does NOT belong to. ⚠ Deliberately
 *  the OTHER HALF and not "every other Select": within a half the two controls
 *  are COUPLED (`SpacingControls.tsx:96-105`, `:128`), so a same-half change is
 *  legitimate and a wider guard would fail on correct behaviour. MEASURED (M8b). */
private otherHalf(testId: string): string[] {
  const other = testId.includes('-margin-') ? 'padding' : 'margin';
  return [`spacing-${other}-mode`, `spacing-${other}-preset`];
}

/**
 * The other half's values, KEYED BY TEST ID and FAIL-CLOSED.
 *
 * ⚠⚠⚠ SP-29 — WHY THIS RETURNS `string` AND NEVER `string | null`. The previous
 * draft read through `.textContent().catch(() => null)`. That erases every read
 * error, so a persistent fault — a strict-selector violation from a duplicated
 * node — yields a keyed `null` before AND after, the equality PASSES, and a
 * broken sensor is reported as a stable invariant. **Two failures to look must
 * never compare equal.** One absolute budget shared by both ids; any unreadable
 * value throws, naming the id.
 */
private async snapshotOtherHalf(testId: string): Promise<Record<string, string>> {
  const deadline = Date.now() + 5000;
  const snapshot: Record<string, string> = {};

  for (const id of this.otherHalf(testId)) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      throw new Error(
        `${testId}: the 5000 ms other-half capture budget expired before ${id} could be read`,
      );
    }
    const value = this.window.getByTestId(id).locator('.ant-select-content-value');
    await expect(
      value,
      `${id}'s value node never became visible — the other-half guard cannot be captured`,
    ).toBeVisible({ timeout: remaining });

    const text = await value.textContent();
    if (text === null) {
      throw new Error(
        `${testId}: could not read ${id}'s value; refusing to record an ` +
          'unreadable control as if it were a value',
      );
    }
    snapshot[id] = text;
  }

  return snapshot;
}

/** P4 — the outcome detector, in two parts.
 *  `.ant-select-content-value` is the single-select value node
 *  (SingleContent.js:53); the parent `.ant-select-content` (:89) also holds the
 *  placeholder and the input, so it is the WRONG node to assert on.
 *
 *  ⚠⚠⚠ P4 IS A MUTATION ALARM AND NOT AN IDENTITY PROOF (SP-25, owner-ruled).
 *  When the requested AND foreign controls are both already at the target value a
 *  wrong-control click changes nothing, both assertions below pass, and the popup
 *  closes as though it had worked — MEASURED (M9b). rc-select emits no `onChange`
 *  when the value is unchanged (`Select.js:314-318`) while the option stays
 *  clickable and closes the popup (`OptionList.js:371-374`, `:161-170`).
 *  **Do not restore the claim that P4 catches every wrong-control operation.** */
private async expectSelectShows(
  testId: string,
  expected: RegExp,
  siblingsBefore: Record<string, string>,
): Promise<void> {
  await expect(
    this.window.getByTestId(testId).locator('.ant-select-content-value'),
    `${testId} did not end up showing the value that was selected — the click may ` +
      'have landed on another control',
  ).toHaveText(expected, { timeout: 5000 });

  // ⚠ The message NAMES the requested control and both guarded controls, and the
  // compared value is KEYED, so the diff itself says which one moved.
  // `expect.poll` takes `{ message, timeout }` — Playwright 1.57.0,
  // `node_modules/playwright/types/test.d.ts:8455`.
  const guarded = Object.keys(siblingsBefore).join(', ');
  await expect
    .poll(() => this.snapshotOtherHalf(testId), {
      message:
        `${testId} was the control this call asked for, but the OTHER spacing ` +
        `half moved while it was being operated. Guarded controls: ${guarded}. ` +
        'Each key is a test id — compare expected (before) with received (after).',
      timeout: 5000,
    })
    .toEqual(siblingsBefore);
}
```

**The three internal callers** (`tests/support/dsl/spacing.ts:102-124`) — the
complete population; the public `setCardMargin` / `setCardPadding` string branches
route through `setPreset`:

```ts
private async setPreset(
  testIdPrefix: 'spacing-margin' | 'spacing-padding',
  preset: SpacingPreset,
): Promise<void> {
  const testId = `${testIdPrefix}-preset`;
  const label = preset.charAt(0).toUpperCase() + preset.slice(1);
  const pattern = new RegExp(`^${label}`, 'i');
  const siblings = await this.selectOptionByText(testId, pattern);
  await this.expectSelectShows(testId, pattern, siblings);          // P4
}

async setMarginMode(mode: SpacingMode): Promise<void> {
  const pattern = mode === 'all' ? /^All Sides$/i : /^Per Side$/i;
  const siblings = await this.selectOptionByText('spacing-margin-mode', pattern);
  await this.expectSelectShows('spacing-margin-mode', pattern, siblings);   // P4
}

async setPaddingMode(mode: SpacingMode): Promise<void> {
  const pattern = mode === 'all' ? /^All Sides$/i : /^Per Side$/i;
  const siblings = await this.selectOptionByText('spacing-padding-mode', pattern);
  await this.expectSelectShows('spacing-padding-mode', pattern, siblings);  // P4
}
```

⭐ Callers no longer open the Select themselves — `selectOptionByText` owns the whole
open→locate→click→settle sequence, and the same `pattern` object selects and reads
back, so P4 cannot drift from what was asked for.

### 4.5 Deliberately NOT proposed

No `Escape` key, no `force: true`, no `evaluate(...click())`, no document-global
pre-wait, no retry that is not ownership-gated, and **no event/association oracle** —
that was offered to the owner on 2026-08-31 and declined.

---

## 5. Blast radius

**Direct consumers — MEASURED.** Two spec files only:
`tests/e2e/spacing.spec.ts` and `tests/e2e/spacing.visual.spec.ts`. Regenerate:

```bash
rg -l '\bspacing\.(setCardMargin|setCardPadding|setMarginMode|setPaddingMode|setMarginSide|setPaddingSide|expectCardMarginApplied|expectCardPaddingApplied|expectSpacingScreenshot)\b' tests src tools
```

**The `src/` side.** `renderSection` (`SpacingControls.tsx:122`) is called twice
(`:228-229`); `SpacingControls` has exactly one product consumer
(`PropertiesPanel.tsx:6632`). The four proposed class tokens have no current
collision. ⚠ **No behaviour, markup structure, state or app-read prop changes.**
`src/index.css:26-40` selects on `BackgroundCustomizer`'s five `bg-*-dropdown`
classes — that is why those are product surface and this plan does not touch them.

**What must not move.** `spacing.visual.spec.ts`'s committed snapshots (a moved
snapshot goes to the owner, never re-baselined); the three passing spacing tests
(`:10`, `:34`, `:58`) and the YAML round-trip test (`:119`);
`tests/baseline/expected-failures.json`.

**Upstream reliances: none.** The private surface is **nine** methods — `popupFor`,
`isOpen`, `resolveOwnedDropdown`, `openSelectDropdown`, `selectOptionByText`,
`otherHalf`, `snapshotOtherHalf`, `expectSelectShows`, `setPreset` — all private to
`SpacingDSL`. ⚠ **DERIVED, not remembered** — regenerate with:

```bash
grep -nE '^\s*private( async)? [a-z]\w*\(' docs/testing/SPACING_HELPER_PRESET_PLAN.md
```

---

## 6. How it will be verified, before a CI cycle is spent

A temporary probe under `tests/`, run headless
(`bash tools/test-headless.sh <spec> --project=electron-e2e --workers=1`), deleted
afterwards with `git status --porcelain` empty. **Variants:** CURRENT (today's
helper), REPAIRED (the complete §4.4 helper), SCOPE-ONLY (REPAIRED with `popupFor`
replaced by a document-global lookup), P4-ONLY (SCOPE-ONLY plus P4).

| Kind                            | What it proves                                                                                                          | Legs       |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------- |
| **FAIL-OLD / PASS-NEW**         | The defect is real AND the repair removes it. Runs on both variants.                                                    | 1, 2, 4, 7 |
| **GUARD-REMOVAL DISCRIMINATOR** | A NARROWER repair still fails, so the chosen guard is doing the work.                                                   | 3, 5       |
| **KNOWN-BAD CONTROL**           | The probe can still fail — proof it is not reporting green blindly.                                                     | 6, 5c      |
| **ONE-SIDED CHARACTERISATION**  | Records the repaired helper only; NOT acceptance evidence.                                                              | 8, 9       |
| **KNOWN-OPEN BOUNDARY**         | ⚠ Asserts the CURRENT, passing behaviour at a limit the plan does not close. **A pass is NOT evidence of correctness.** | 5b         |

⭐ **Acceptance evidence that the defect mechanism is repaired comes only from the
first two kinds.** Legs 0 and 10–12 (census, regression, repeat, CI gate) can
**veto** a repair and cannot **establish** one.

| #      | Case                                                                                                                                                                 | Kind                | Expected                                                                                                                                                |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0**  | DOM census. Measures state; runs no helper. Source of M1–M9.                                                                                                         | CENSUS              | Never acceptance evidence — it produced M3, which was **wrong**.                                                                                        |
| **1**  | **The M6 state.** Open the margin preset Select, then drive the padding preset path inside the two-popup window.                                                     | FAIL-OLD / PASS-NEW | CURRENT sets the MARGIN. REPAIRED passes. ⚠ Record the popup count — if never 2, the leg missed its state.                                              |
| **2**  | **The foreign-only state.** Margin popup open; padding's own opening suppressed page-side; padding path runs.                                                        | FAIL-OLD / PASS-NEW | CURRENT **silently succeeds**. REPAIRED fails in `resolveOwnedDropdown`, naming the control.                                                            |
| **3**  | The scope-only straw man against leg 2's state.                                                                                                                      | GUARD-REMOVAL       | SCOPE-ONLY must **also** silently succeed. This proves identity beats scope.                                                                            |
| **4**  | Happy path, clean panel.                                                                                                                                             | FAIL-OLD / PASS-NEW | Both pass; record wall time as budget characterisation.                                                                                                 |
| **5**  | **P4 alone** against leg 2's state, through the WIRED caller (`setPreset`), never `expectSelectShows` directly.                                                      | GUARD-REMOVAL       | Fails at `expectSelectShows`, and the **recorded message names the requested control and the moved control**. ⚠ Record the exact message AND exit code. |
| **5b** | ⚠⚠ **THE SP-25 LIMIT.** Fresh card, all four Selects pre-satisfied (M9a); misattached class puts the click in the foreign popup.                                     | KNOWN-OPEN          | **PASSES — and that is the correct recorded result.** Anyone who later closes this hole breaks 5b and must correct §3, §4.1 and §8 in the same commit.  |
| **5c** | ⚠⚠ **SP-29's unreadable-sensor control.** (i) Remove one guarded value node and restore it inside the capture budget. (ii) Create a persistent duplicate value node. | KNOWN-BAD           | (i) the helper **waits and proceeds**, no false "moved" failure. (ii) the helper **fails at capture, before any click**, naming the unreadable id.      |
| **6**  | Negative control: a preset label that does not exist (`/^Nonexistent/`).                                                                                             | KNOWN-BAD           | Fails on `toHaveCount(1)`, naming the pattern. ⚠ Record message AND exit code.                                                                          |
| **7**  | A stable, legitimately-open unrelated Select popup, then the padding path.                                                                                           | FAIL-OLD / PASS-NEW | CURRENT burns its budget and fails. REPAIRED passes promptly.                                                                                           |
| **8**  | The owned popup mid-leave.                                                                                                                                           | CHARACTERISATION    | REPAIRED re-opens and selects. Not acceptance evidence.                                                                                                 |
| **9**  | The retry path: first gesture suppressed, second succeeds.                                                                                                           | CHARACTERISATION    | Passes on the second attempt; record wall time.                                                                                                         |
| **10** | Regression: existing callers and the visual spec unchanged, snapshots unmoved.                                                                                       | REGRESSION          | Necessary, not sufficient.                                                                                                                              |
| **11** | `--repeat-each=5`.                                                                                                                                                   | REPEAT              | Characterisation only.                                                                                                                                  |
| **12** | CI.                                                                                                                                                                  | GATE                | Aggregate; acceptance evidence is commit-addressed and the per-attempt list is the measurement.                                                         |

⚠ **The legs-2/3 interaction with Playwright's own `_hitTargetInterceptor` is an
OPEN QUESTION, deliberately not guessed, and the probe is what answers it.**

---

## 7. Sequencing

1. **Then implementation**, in this order:

   1. **The `src/` change first** — two lines in `SpacingControls.tsx`.
   2. **A class smoke step** — census kind, explicitly **NOT leg 1** — observing
      the popup class in the Electron renderer. Closes M7's jsdom-only limit and
      needs no helper.
   3. **Then the helper** and all three callers (§4.4).
   4. **Leg 1 first among the mechanism legs**, then 2–9, then 10–12.

⚠⚠ **THE NESTED-LIST FORM ABOVE IS LOAD-BEARING, NOT COSMETIC.** The consistency
checker's C4 parses these steps to prove leg 1 cannot precede the helper it needs
(SP-20). Revision 8 first rewrote them as a flat list, which C4's parser does not
match — **so C4 was silently DEAD against this document until a known-bad mutation
proved it could not fail.** Do not reformat this list without re-running that
mutation.

**What halts the work.** If the §6 harness cannot reproduce a wrong-target click
against the real app in either direction after one working session, work halts and
re-asks the owner.

### 7.5 The running cost

```yaml
# plan-running-totals
review_rounds_complete: 7
review_rounds_owed: 1
reviewer_findings: 30
findings_after_round_one: 24
repair_introduced_after_round_one: 23
executable_spec_lines: 144
```

⚠⚠ **These are the ONLY figures. Every other sentence in this plan and in the
history refers to a key above and restates no value** (SP-30). Three ownership
mechanisms were proposed and two were approved and then thrown away — option A on
M2, option D on M6. **Still zero lines of shipped code.**

⭐⭐ **The owner's 2026-08-31 ruling, which this revision executes:** the document
was the defect source, so **delete rather than check harder**. Four detection guards
were tried across seven rounds — more rounds, a split, a consistency checker, two
reading passes — and only **executing the question** (the harness) ever worked.
**A stop rule now applies: any SEV-1 in round 8 ends the review track.**

---

## 8. The weakest claims in this plan, for the reviewer to attack

- ⚠⚠⚠ **P1 STANDS ALONE in the double-pre-satisfied state**, which M9a measures to
  be the ordinary starting state of a fresh card. There is **no detector** there.
  **The sharpest attack on this plan is against P1, not P4:** if a foreign popup can
  ever carry the requested class, nothing downstream notices. **M7 is jsdom-only and
  the class has never been observed in the Electron renderer** — step 2 exists to
  close exactly that, and it has not been run.
- ⚠⚠ **This plan does not prove which control an operation reached.** It proves which
  control ends up with which value. Detection, diagnostics and operation identity are
  three different properties.
- ⚠ **The legs-2/3 `_hitTargetInterceptor` question is open** for a sixth revision.
- ⚠ **Leg 8's construction and the retry budget numbers are characterisation only**;
  nothing measures that 1500 ms and 5000 ms are the right values.
- ⚠ **`snapshotOtherHalf`'s fail-closed design is NEW and unrun.** Leg 5c is its only
  evidence and leg 5c has not been executed.

---

## 9. Review history

Per-round dispositions for SP-1 … SP-30 live in
[`SPACING_HELPER_PRESET_PLAN_HISTORY.md`](SPACING_HELPER_PRESET_PLAN_HISTORY.md).
The reviewer's own documents are `docs/reviews/spacing-helper-preset-plan-codex-*`.
