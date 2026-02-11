import { expect, Locator, Page } from '@playwright/test';

export type LayoutGapInput = 'none' | 'tight' | 'normal' | 'relaxed' | 'custom' | number;

export class LayoutDSL {
  constructor(private window: Page) {}

  private getCard(cardIndex = 0) {
    const cards = this.window.getByTestId('canvas-card');
    return cardIndex === 0 ? cards.first() : cards.nth(cardIndex);
  }

  private getVisibleSelectDropdown() {
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

    // AntD select trigger can be briefly obscured by a transient portal during animation;
    // use force only as a final fallback after normal click + escape retry.
    await select.click({ force: true });
    await expect(this.getVisibleSelectDropdown()).toBeVisible({ timeout: 5000 });
  }

  private getInputNumberInput(testId: string): Locator {
    const wrapper = this.window.getByTestId(`${testId}-field`);
    const byWrapper = wrapper.locator('input.ant-input-number-input').first();
    const byDirect = this.window.getByTestId(testId).locator('input.ant-input-number-input').first();
    return byWrapper.or(byDirect).first();
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

  private async addLayoutCard(cardType: 'vertical-stack' | 'horizontal-stack' | 'grid', testInfo?: import('@playwright/test').TestInfo): Promise<void> {
    const searchInput = this.window.getByTestId('card-search');
    await expect(searchInput).toBeVisible();
    await searchInput.fill(cardType);

    const card = this.window.getByTestId('card-palette').getByTestId(`palette-card-${cardType}`);
    await expect(card).toBeVisible({ timeout: 5000 });
    await card.dblclick();

    await expect(this.window.getByTestId('canvas-card').first()).toBeVisible({ timeout: 10000 });
    await searchInput.fill('');
    await expect(searchInput).toHaveValue('');

    void testInfo;
  }

  async addVerticalStackCard(testInfo?: import('@playwright/test').TestInfo): Promise<void> {
    await this.addLayoutCard('vertical-stack', testInfo);
  }

  async addHorizontalStackCard(testInfo?: import('@playwright/test').TestInfo): Promise<void> {
    await this.addLayoutCard('horizontal-stack', testInfo);
  }

  async addGridCard(testInfo?: import('@playwright/test').TestInfo): Promise<void> {
    await this.addLayoutCard('grid', testInfo);
  }

  async setGap(valueOrPreset: LayoutGapInput): Promise<void> {
    const presetSelect = this.window.getByTestId('layout-gap-preset');
    await expect(presetSelect).toBeVisible();

    if (typeof valueOrPreset === 'number') {
      const input = this.getInputNumberInput('layout-gap-custom');
      await expect(input).toBeVisible();
      await input.fill(String(valueOrPreset));
      await input.blur();
      return;
    }

    if (valueOrPreset === 'custom') {
      return;
    }

    await this.openSelectDropdown(presetSelect);
    await this.selectOptionByText(new RegExp(`^${valueOrPreset}`, 'i'));
  }

  async setGridRowGap(valueOrPreset: LayoutGapInput): Promise<void> {
    const presetSelect = this.window.getByTestId('grid-row-gap-preset');
    await expect(presetSelect).toBeVisible();

    if (typeof valueOrPreset === 'number') {
      const input = this.getInputNumberInput('grid-row-gap-custom');
      await expect(input).toBeVisible();
      await input.fill(String(valueOrPreset));
      await input.blur();
      return;
    }

    if (valueOrPreset === 'custom') {
      return;
    }

    await this.openSelectDropdown(presetSelect);
    await this.selectOptionByText(new RegExp(`^${valueOrPreset}`, 'i'));
  }

  async setGridColumnGap(valueOrPreset: LayoutGapInput): Promise<void> {
    const presetSelect = this.window.getByTestId('grid-column-gap-preset');
    await expect(presetSelect).toBeVisible();

    if (typeof valueOrPreset === 'number') {
      const input = this.getInputNumberInput('grid-column-gap-custom');
      await expect(input).toBeVisible();
      await input.fill(String(valueOrPreset));
      await input.blur();
      return;
    }

    if (valueOrPreset === 'custom') {
      return;
    }

    await this.openSelectDropdown(presetSelect);
    await this.selectOptionByText(new RegExp(`^${valueOrPreset}`, 'i'));
  }

  async setAlignItems(value: 'start' | 'center' | 'end' | 'stretch' | 'baseline'): Promise<void> {
    const stackSelect = this.window.getByTestId('layout-align-items');
    const gridSelect = this.window.getByTestId('grid-align-items');
    const select = (await stackSelect.isVisible().catch(() => false)) ? stackSelect : gridSelect;

    await expect(select).toBeVisible();
    await this.openSelectDropdown(select);
    await this.selectOptionByText(new RegExp(`^${value}$`, 'i'));
  }

  async setJustifyContent(value: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'): Promise<void> {
    const select = this.window.getByTestId('layout-justify-content');
    await expect(select).toBeVisible();
    await this.openSelectDropdown(select);
    const label = value
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    await this.selectOptionByText(new RegExp(`^${label}$`, 'i'));
  }

  async setJustifyItems(value: 'start' | 'center' | 'end' | 'stretch'): Promise<void> {
    const select = this.window.getByTestId('grid-justify-items');
    await expect(select).toBeVisible();
    await this.openSelectDropdown(select);
    await this.selectOptionByText(new RegExp(`^${value}$`, 'i'));
  }

  async setWrap(mode: 'nowrap' | 'wrap' | 'wrap-reverse'): Promise<void> {
    const select = this.window.getByTestId('layout-wrap');
    await expect(select).toBeVisible();
    await this.openSelectDropdown(select);
    const label = mode === 'nowrap'
      ? 'No Wrap'
      : mode
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    await this.selectOptionByText(new RegExp(`^${label}$`, 'i'));
  }

  async expectGapApplied(cardType: 'vertical-stack' | 'horizontal-stack' | 'grid-row' | 'grid-column', expectedPx: number, cardIndex = 0): Promise<void> {
    const card = this.getCard(cardIndex);

    if (cardType === 'vertical-stack') {
      const container = card.getByTestId('vertical-stack-container');
      await expect.poll(async () => await container.evaluate((el) => getComputedStyle(el as HTMLElement).gap)).toBe(`${expectedPx}px`);
      return;
    }

    if (cardType === 'horizontal-stack') {
      const container = card.getByTestId('horizontal-stack-container');
      await expect.poll(async () => await container.evaluate((el) => getComputedStyle(el as HTMLElement).gap)).toBe(`${expectedPx}px`);
      return;
    }

    const container = card.getByTestId('grid-layout-container');
    if (cardType === 'grid-row') {
      await expect.poll(async () => await container.evaluate((el) => getComputedStyle(el as HTMLElement).rowGap)).toBe(`${expectedPx}px`);
      return;
    }

    await expect.poll(async () => await container.evaluate((el) => getComputedStyle(el as HTMLElement).columnGap)).toBe(`${expectedPx}px`);
  }

  async expectAlignmentApplied(
    cardType: 'vertical-stack' | 'horizontal-stack' | 'grid',
    expected: { alignItems?: string; justifyContent?: string; justifyItems?: string },
    cardIndex = 0,
  ): Promise<void> {
    const card = this.getCard(cardIndex);
    const container = cardType === 'vertical-stack'
      ? card.getByTestId('vertical-stack-container')
      : cardType === 'horizontal-stack'
        ? card.getByTestId('horizontal-stack-container')
        : card.getByTestId('grid-layout-container');

    if (expected.alignItems) {
      await expect.poll(async () => await container.evaluate((el) => getComputedStyle(el as HTMLElement).alignItems)).toBe(expected.alignItems);
    }
    if (expected.justifyContent) {
      await expect.poll(async () => await container.evaluate((el) => getComputedStyle(el as HTMLElement).justifyContent)).toBe(expected.justifyContent);
    }
    if (expected.justifyItems) {
      await expect.poll(async () => await container.evaluate((el) => getComputedStyle(el as HTMLElement).justifyItems)).toBe(expected.justifyItems);
    }
  }

  async expectWrapApplied(expectedMode: 'nowrap' | 'wrap' | 'wrap-reverse', cardIndex = 0): Promise<void> {
    const container = this.getCard(cardIndex).getByTestId('horizontal-stack-container');
    await expect.poll(async () => await container.evaluate((el) => getComputedStyle(el as HTMLElement).flexWrap)).toBe(expectedMode);
  }

  async expectLayoutScreenshot(name: string, cardIndex = 0): Promise<void> {
    const card = this.getCard(cardIndex);
    await expect(card).toBeVisible();
    await this.window.evaluate(() => {
      document.body.classList.add('e2e-disable-animations');
      if (!document.getElementById('e2e-disable-animations-style')) {
        const style = document.createElement('style');
        style.id = 'e2e-disable-animations-style';
        style.textContent = `
          .e2e-disable-animations *,
          .e2e-disable-animations *::before,
          .e2e-disable-animations *::after {
            animation: none !important;
            transition: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    });

    const box = await card.boundingBox();
    if (!box) {
      throw new Error('Card bounding box unavailable for layout screenshot');
    }

    const clipHeight = Math.min(Math.max(260, box.height), 440);
    const screenshot = await this.window.screenshot({
      animations: 'disabled',
      caret: 'hide',
      clip: {
        x: Math.max(0, Math.floor(box.x)),
        y: Math.max(0, Math.floor(box.y)),
        width: Math.max(1, Math.floor(box.width)),
        height: Math.max(1, Math.floor(clipHeight)),
      },
      timeout: 20000,
    });

    expect(screenshot).toMatchSnapshot(name, {
      maxDiffPixels: 3000,
    });
  }
}
