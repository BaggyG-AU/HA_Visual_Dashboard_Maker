import { expect, Locator, Page } from '@playwright/test';

type SpacingPreset = 'none' | 'tight' | 'normal' | 'relaxed' | 'spacious' | 'custom';
type SpacingMode = 'all' | 'per-side';
type SpacingSide = 'top' | 'right' | 'bottom' | 'left';
type SpacingInput = SpacingPreset | number | { top?: number; right?: number; bottom?: number; left?: number };

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

  private getVisibleSelectDropdown(): Locator {
    return this.window.locator('.ant-select-dropdown:visible').last();
  }

  private async waitForAllSelectDropdownsToClose(): Promise<void> {
    await expect(this.window.locator('.ant-select-dropdown:visible')).toHaveCount(0, { timeout: 5000 });
  }

  private async openSelectDropdown(select: Locator): Promise<void> {
    await expect(select).toBeVisible({ timeout: 5000 });
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        await select.click();
        const dropdown = this.getVisibleSelectDropdown();
        const visible = await dropdown.isVisible().catch(() => false);
        if (visible) return;
      } catch (error) {
        if (attempt === 1) throw error;
      }
      await this.window.keyboard.press('Escape').catch(() => undefined);
    }

    await select.click({ force: true });
    await expect(this.getVisibleSelectDropdown()).toBeVisible({ timeout: 5000 });
  }

  private async selectOptionByText(pattern: RegExp): Promise<void> {
    await expect(this.getVisibleSelectDropdown()).toBeVisible({ timeout: 5000 });
    const option = this.window.locator('.ant-select-dropdown:visible .ant-select-item-option', { hasText: pattern }).first();
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.evaluate((el) => {
      (el as HTMLElement).click();
    });
    await this.window.keyboard.press('Escape').catch(() => undefined);
    await this.waitForAllSelectDropdownsToClose();
  }

  private getInputNumberInput(testId: string): Locator {
    const wrapper = this.window.getByTestId(`${testId}-field`);
    const byWrapper = wrapper.locator('input.ant-input-number-input').first();
    const byDirect = this.window.getByTestId(testId).locator('input.ant-input-number-input').first();
    return byWrapper.or(byDirect).first();
  }

  private async setInputNumberValue(input: Locator, value: number): Promise<void> {
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.click();
    await input.press('Control+A').catch(() => undefined);
    await input.type(String(value), { delay: 20 });
    await input.blur();
    await expect.poll(async () => {
      const raw = await input.inputValue();
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : NaN;
    }, { timeout: 1200 }).toBe(value);
  }

  private async setAllSpacing(testIdPrefix: 'spacing-margin' | 'spacing-padding', value: number): Promise<void> {
    const input = this.getInputNumberInput(`${testIdPrefix}-all`);
    await this.setInputNumberValue(input, value);
  }

  private async setPreset(testIdPrefix: 'spacing-margin' | 'spacing-padding', preset: SpacingPreset): Promise<void> {
    const select = this.window.getByTestId(`${testIdPrefix}-preset`);
    await expect(select).toBeVisible();
    await this.openSelectDropdown(select);
    const label = preset.charAt(0).toUpperCase() + preset.slice(1);
    await this.selectOptionByText(new RegExp(`^${label}`, 'i'));
  }

  async setMarginMode(mode: SpacingMode): Promise<void> {
    const select = this.window.getByTestId('spacing-margin-mode');
    await expect(select).toBeVisible();
    await this.openSelectDropdown(select);
    await this.selectOptionByText(mode === 'all' ? /^All Sides$/i : /^Per Side$/i);
  }

  async setPaddingMode(mode: SpacingMode): Promise<void> {
    const select = this.window.getByTestId('spacing-padding-mode');
    await expect(select).toBeVisible();
    await this.openSelectDropdown(select);
    await this.selectOptionByText(mode === 'all' ? /^All Sides$/i : /^Per Side$/i);
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
    const card = this.getCard(cardIndex).locator('[data-testid="conditional-visibility-wrapper"]').first();
    const normalizedExpected = this.normalizeExpected(expected);
    await expect.poll(async () => await card.evaluate((el) => getComputedStyle(el as HTMLElement).margin)).toBe(normalizedExpected);
  }

  async expectCardPaddingApplied(expected: SpacingInput, cardIndex = 0): Promise<void> {
    const card = this.getCard(cardIndex).locator('[data-testid="conditional-visibility-wrapper"]').first();
    const normalizedExpected = this.normalizeExpected(expected);
    await expect.poll(async () => await card.evaluate((el) => getComputedStyle(el as HTMLElement).padding)).toBe(normalizedExpected);
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
