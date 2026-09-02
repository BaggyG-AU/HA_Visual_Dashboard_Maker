import { expect, Locator, Page } from '@playwright/test';

type SpacingPreset = 'none' | 'tight' | 'normal' | 'relaxed' | 'spacious' | 'custom';
type SpacingMode = 'all' | 'per-side';
type SpacingSide = 'top' | 'right' | 'bottom' | 'left';
type SpacingInput =
  SpacingPreset | number | { top?: number; right?: number; bottom?: number; left?: number };

const PRESET_TO_VALUE: Record<Exclude<SpacingPreset, 'custom'>, number> = {
  none: 0,
  tight: 4,
  normal: 8,
  relaxed: 16,
  spacious: 24,
};

export class SpacingDSL {
  constructor(private window: Page) {}

  private getCard(cardIndex = 0): Locator {
    const cards = this.window.getByTestId('canvas-card');
    return cardIndex === 0 ? cards.first() : cards.nth(cardIndex);
  }

  /** P1 — identity BY CONSTRUCTION. The popup carries the requesting Select's own
   *  class (`<data-testid>-popup`), rendered from the same `testIdPrefix`
   *  expression as the `data-testid` in `SpacingControls.tsx`. MEASURED in the
   *  Electron renderer: each of the four classes matched exactly one popup and
   *  no popup carried another Select's class. */
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
          await select.click(); // hit-target check stays ON
        }
        return await this.resolveOwnedDropdown(testId, last ? 5000 : 1500);
      } catch (error) {
        if (last) throw error; // second failure is REAL — report it
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
    // visible, a foreign option is not reachable from here.
    const option = dropdown.locator('.ant-select-item-option').filter({ hasText: pattern });
    // ⚠ rc-select VIRTUALISES the list, so a scrolled-out row is absent from the
    // DOM. Requiring exactly one turns ambiguity AND absence into a loud failure.
    await expect(
      option,
      `expected exactly one option matching ${pattern} in ${testId}'s own popup`,
    ).toHaveCount(1);
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click(); // real click; actionability enforced

    // ⚠ SCOPED to this Select, not a document-global count — waiting for "no popup
    // anywhere" would fail against a legitimately-open unrelated Select.
    await expect
      .poll(() => this.isOpen(this.window.getByTestId(testId)), { timeout: 5000 })
      .toBe(false);

    return siblingsBefore;
  }

  /** The two Selects of the half this control does NOT belong to. ⚠ Deliberately
   *  the OTHER HALF and not "every other Select": within a half the two controls
   *  are COUPLED, so a same-half change is legitimate and a wider guard would fail
   *  on correct behaviour. */
  private otherHalf(testId: string): string[] {
    const other = testId.includes('-margin-') ? 'padding' : 'margin';
    return [`spacing-${other}-mode`, `spacing-${other}-preset`];
  }

  /**
   * The other half's values, KEYED BY TEST ID and FAIL-CLOSED.
   *
   * ⚠⚠ Returns `string`, never `string | null`. Reading through
   * `.textContent().catch(() => null)` erases every read error, so a persistent
   * fault yields a keyed `null` before AND after, the equality PASSES, and a
   * broken sensor is reported as a stable invariant. Two failures to look must
   * never compare equal.
   *
   * ⚠ EVERY wait inside the budget RECEIVES it: `textContent()` without a timeout
   * does not inherit the deadline and falls back to the repository's 30 s
   * `actionTimeout` (`playwright.config.ts:53`).
   */
  private async snapshotOtherHalf(testId: string): Promise<Record<string, string>> {
    const deadline = Date.now() + 5000;
    const snapshot: Record<string, string> = {};

    const remainingFor = (id: string, stage: string): number => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        throw new Error(
          `${testId}: the 5000 ms other-half capture budget expired before ${stage} for ${id}`,
        );
      }
      return remaining;
    };

    for (const id of this.otherHalf(testId)) {
      const value = this.window.getByTestId(id).locator('.ant-select-content-value');
      await expect(
        value,
        `${id}'s value node never became visible — the other-half guard cannot be captured`,
      ).toBeVisible({ timeout: remainingFor(id, 'the value node became visible') });

      const text = await value.textContent({ timeout: remainingFor(id, 'the value was read') });
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
   *
   *  ⚠⚠⚠ P4 IS A MUTATION ALARM AND NOT AN IDENTITY PROOF. When the requested AND
   *  foreign controls are both already at the target value a wrong-control click
   *  changes nothing, both assertions below pass, and the popup closes as though it
   *  had worked — MEASURED. rc-select emits no `onChange` when the value is
   *  unchanged (`Select.js:314-318`) while the option stays clickable and closes the
   *  popup (`OptionList.js:371-374`, `:161-170`). Prevention is P1's, by
   *  construction. Do not restore the claim that P4 catches every wrong operation. */
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

  private getInputNumberInput(testId: string): Locator {
    const wrapper = this.window.getByTestId(`${testId}-field`);
    const byWrapper = wrapper.locator('input.ant-input-number-input').first();
    const byDirect = this.window
      .getByTestId(testId)
      .locator('input.ant-input-number-input')
      .first();
    return byWrapper.or(byDirect).first();
  }

  private async setInputNumberValue(input: Locator, value: number): Promise<void> {
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.click();
    await input.press('Control+A').catch(() => undefined);
    await input.type(String(value), { delay: 20 });
    await input.blur();
    await expect
      .poll(
        async () => {
          const raw = await input.inputValue();
          const parsed = Number(raw);
          return Number.isFinite(parsed) ? parsed : NaN;
        },
        { timeout: 1200 },
      )
      .toBe(value);
  }

  private async setAllSpacing(
    testIdPrefix: 'spacing-margin' | 'spacing-padding',
    value: number,
  ): Promise<void> {
    const input = this.getInputNumberInput(`${testIdPrefix}-all`);
    await this.setInputNumberValue(input, value);
  }

  /** ⚠ Callers no longer open the Select themselves — `selectOptionByText` owns the
   *  whole open→locate→click→settle sequence, and the SAME pattern object selects
   *  and reads back, so P4 cannot drift from what was asked for. */
  private async setPreset(
    testIdPrefix: 'spacing-margin' | 'spacing-padding',
    preset: SpacingPreset,
  ): Promise<void> {
    const testId = `${testIdPrefix}-preset`;
    const label = preset.charAt(0).toUpperCase() + preset.slice(1);
    const pattern = new RegExp(`^${label}`, 'i');
    const siblings = await this.selectOptionByText(testId, pattern);
    await this.expectSelectShows(testId, pattern, siblings); // P4
  }

  async setMarginMode(mode: SpacingMode): Promise<void> {
    const pattern = mode === 'all' ? /^All Sides$/i : /^Per Side$/i;
    const siblings = await this.selectOptionByText('spacing-margin-mode', pattern);
    await this.expectSelectShows('spacing-margin-mode', pattern, siblings); // P4
  }

  async setPaddingMode(mode: SpacingMode): Promise<void> {
    const pattern = mode === 'all' ? /^All Sides$/i : /^Per Side$/i;
    const siblings = await this.selectOptionByText('spacing-padding-mode', pattern);
    await this.expectSelectShows('spacing-padding-mode', pattern, siblings); // P4
  }

  async setMarginSide(side: SpacingSide, value: number): Promise<void> {
    const input = this.getInputNumberInput(`spacing-margin-${side}`);
    await this.setInputNumberValue(input, value);
  }

  async setPaddingSide(side: SpacingSide, value: number): Promise<void> {
    const input = this.getInputNumberInput(`spacing-padding-${side}`);
    await this.setInputNumberValue(input, value);
  }

  async setCardMargin(valueOrPreset: SpacingInput): Promise<void> {
    if (typeof valueOrPreset === 'number') {
      await this.setMarginMode('all');
      await this.setAllSpacing('spacing-margin', valueOrPreset);
      return;
    }

    if (typeof valueOrPreset === 'string') {
      await this.setPreset('spacing-margin', valueOrPreset);
      return;
    }

    await this.setMarginMode('per-side');
    const sides = {
      top: valueOrPreset.top ?? 0,
      right: valueOrPreset.right ?? 0,
      bottom: valueOrPreset.bottom ?? 0,
      left: valueOrPreset.left ?? 0,
    };

    await this.setMarginSide('top', sides.top);
    await this.setMarginSide('right', sides.right);
    await this.setMarginSide('bottom', sides.bottom);
    await this.setMarginSide('left', sides.left);
  }

  async setCardPadding(valueOrPreset: SpacingInput): Promise<void> {
    if (typeof valueOrPreset === 'number') {
      await this.setPaddingMode('all');
      await this.setAllSpacing('spacing-padding', valueOrPreset);
      return;
    }

    if (typeof valueOrPreset === 'string') {
      await this.setPreset('spacing-padding', valueOrPreset);
      return;
    }

    await this.setPaddingMode('per-side');
    const sides = {
      top: valueOrPreset.top ?? 0,
      right: valueOrPreset.right ?? 0,
      bottom: valueOrPreset.bottom ?? 0,
      left: valueOrPreset.left ?? 0,
    };

    await this.setPaddingSide('top', sides.top);
    await this.setPaddingSide('right', sides.right);
    await this.setPaddingSide('bottom', sides.bottom);
    await this.setPaddingSide('left', sides.left);
  }

  private normalizeExpected(expected: SpacingInput): string {
    if (typeof expected === 'number') {
      return `${expected}px`;
    }

    if (typeof expected === 'string') {
      if (expected === 'custom') {
        throw new Error('Expected value cannot be custom token. Provide numeric or side values.');
      }
      return `${PRESET_TO_VALUE[expected]}px`;
    }

    const top = expected.top ?? 0;
    const right = expected.right ?? 0;
    const bottom = expected.bottom ?? 0;
    const left = expected.left ?? 0;
    return `${top}px ${right}px ${bottom}px ${left}px`;
  }

  async expectCardMarginApplied(expected: SpacingInput, cardIndex = 0): Promise<void> {
    const card = this.getCard(cardIndex)
      .locator('[data-testid="conditional-visibility-wrapper"]')
      .first();
    const normalizedExpected = this.normalizeExpected(expected);
    await expect
      .poll(async () => await card.evaluate((el) => getComputedStyle(el as HTMLElement).margin))
      .toBe(normalizedExpected);
  }

  async expectCardPaddingApplied(expected: SpacingInput, cardIndex = 0): Promise<void> {
    const card = this.getCard(cardIndex)
      .locator('[data-testid="conditional-visibility-wrapper"]')
      .first();
    const normalizedExpected = this.normalizeExpected(expected);
    await expect
      .poll(async () => await card.evaluate((el) => getComputedStyle(el as HTMLElement).padding))
      .toBe(normalizedExpected);
  }

  async expectSpacingScreenshot(name: string, cardIndex = 0): Promise<void> {
    const card = this.getCard(cardIndex);
    await expect(card).toBeVisible();

    const screenshot = await card.screenshot({
      animations: 'disabled',
      caret: 'hide',
      timeout: 20000,
    });

    expect(screenshot).toMatchSnapshot(name, {
      maxDiffPixels: 3000,
    });
  }
}
