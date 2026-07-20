import { expect, Locator, Page } from '@playwright/test';

export type LayoutGapInput = 'none' | 'tight' | 'normal' | 'relaxed' | 'custom' | number;

export class LayoutDSL {
  constructor(private window: Page) {}

  private getCard(cardIndex = 0) {
    const cards = this.window.getByTestId('canvas-card');
    return cardIndex === 0 ? cards.first() : cards.nth(cardIndex);
  }

  /**
   * The per-Select open/closed signal.
   *
   * AntD renders a hidden `input[role="combobox"]` inside the Select field whose
   * `aria-expanded` tracks its own dropdown. That is the only handle observed to
   * bind a dropdown to *its* Select — see the notes on `selectOptionByText` for
   * the alternatives that were measured and rejected.
   */
  private getCombobox(select: Locator): Locator {
    return select.locator('input[role="combobox"]').first();
  }

  private async isDropdownOpen(select: Locator): Promise<boolean> {
    const expanded = await this.getCombobox(select)
      .getAttribute('aria-expanded')
      .catch(() => null);
    return expanded === 'true';
  }

  private async waitForDropdownState(select: Locator, open: boolean, timeout = 5000) {
    await expect(this.getCombobox(select)).toHaveAttribute(
      'aria-expanded',
      open ? 'true' : 'false',
      { timeout },
    );

    if (!open) {
      // `aria-expanded` flips as soon as AntD commits the state change, while the
      // portal is still playing its leave animation and still intercepting
      // pointer events. Returning on the attribute alone hands control back
      // mid-animation and the caller's next click races the closing overlay, so
      // wait for the portal to actually be gone as well.
      await expect(
        this.window.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)'),
      ).toHaveCount(0, { timeout });
    }
  }

  /**
   * Open `select`'s dropdown and return the dropdown locator.
   *
   * The previous implementation probed the freshly-portalled dropdown with
   * `isVisible()`, which returns false *immediately* for a node that is not in
   * the DOM yet (the documented rule in TESTING_STANDARDS.md). The dropdown was
   * measured taking ~370ms to mount, position and settle, so that probe lost the
   * race under load, and the "recovery" — Escape then click again — toggled the
   * now-open dropdown back shut. That produced both observed failures: the
   * dropdown ending up closed, and the option locator going unmatchable
   * mid-call. Waiting on `aria-expanded` removes the race and the false recovery.
   */
  private async openSelectDropdown(select: Locator): Promise<Locator> {
    await expect(select).toBeVisible({ timeout: 5000 });

    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        if (!(await this.isDropdownOpen(select))) {
          await select.click({ timeout: 5000 });
        }
        await this.waitForDropdownState(select, true, 3000);
        return this.getOpenDropdown();
      } catch (error) {
        lastError = error;
        // Reset to a known-closed state before retrying so the next click opens
        // rather than toggles.
        await this.window.keyboard.press('Escape').catch(() => undefined);
        await this.waitForDropdownState(select, false, 2000).catch(() => undefined);
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error('Failed to open Ant Design select dropdown');
  }

  /**
   * Matches on the `ant-select-dropdown-hidden` class rather than Playwright's
   * `:visible`. While the dropdown animates open AntD parks it off-screen at
   * `inset: -1000vh auto auto -1000vw`; `:visible` is a layout predicate and
   * flips as that position changes, so a locator carrying `:visible` can stop
   * matching between one call and the next. The class is the state AntD actually
   * sets when it closes a dropdown.
   */
  private getOpenDropdown(): Locator {
    return this.window.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
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

  /**
   * Open `select` and pick the option matching `pattern`.
   *
   * Options are matched on `.ant-select-item-option`, deliberately not by role.
   * AntD mirrors the option list into a 0x0 `overflow:hidden` element for
   * assistive tech, and that mirror is virtualised — with five options only
   * three carry `role="option"`, none of them are inside `.ant-select-dropdown`,
   * and none are visible. `getByRole('option')` therefore matches an incomplete
   * set of unclickable nodes.
   */
  private async selectOptionByText(select: Locator, pattern: RegExp): Promise<void> {
    let lastError: unknown;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const dropdown = await this.openSelectDropdown(select);
        const option = dropdown.locator('.ant-select-item-option').filter({ hasText: pattern });
        await expect(option.first()).toBeVisible({ timeout: 5000 });

        // A real click auto-waits for actionability, so it rides out the open
        // animation instead of firing a synthetic event into a widget that is
        // still parked off-screen and mid-motion.
        await option.first().click({ timeout: 5000 });

        // AntD closes a single-value Select on pick; that close is the signal the
        // click was actually received by the component, not just dispatched.
        await this.waitForDropdownState(select, false, 5000);
        return;
      } catch (error) {
        lastError = error;
        await this.window.keyboard.press('Escape').catch(() => undefined);
        await this.waitForDropdownState(select, false, 2000).catch(() => undefined);
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error(`Failed to select Ant Design option matching ${pattern}`);
  }

  private async addLayoutCard(
    cardType: 'vertical-stack' | 'horizontal-stack' | 'grid',
    testInfo?: import('@playwright/test').TestInfo,
  ): Promise<void> {
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

    await this.selectOptionByText(presetSelect, new RegExp(`^${valueOrPreset}`, 'i'));
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

    await this.selectOptionByText(presetSelect, new RegExp(`^${valueOrPreset}`, 'i'));
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

    await this.selectOptionByText(presetSelect, new RegExp(`^${valueOrPreset}`, 'i'));
  }

  async setAlignItems(value: 'start' | 'center' | 'end' | 'stretch' | 'baseline'): Promise<void> {
    // Stack and grid cards expose different test ids for the same control. `.or()`
    // resolves to whichever is present and still auto-waits; the previous
    // `isVisible()` probe resolved false the instant the panel had not re-rendered
    // yet and silently picked the control belonging to the other card type.
    const select = this.window
      .getByTestId('layout-align-items')
      .or(this.window.getByTestId('grid-align-items'))
      .first();

    await expect(select).toBeVisible();
    await this.selectOptionByText(select, new RegExp(`^${value}$`, 'i'));
  }

  async setJustifyContent(
    value: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly',
  ): Promise<void> {
    const select = this.window.getByTestId('layout-justify-content');
    await expect(select).toBeVisible();
    const label = value
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    await this.selectOptionByText(select, new RegExp(`^${label}$`, 'i'));
  }

  async setJustifyItems(value: 'start' | 'center' | 'end' | 'stretch'): Promise<void> {
    const select = this.window.getByTestId('grid-justify-items');
    await expect(select).toBeVisible();
    await this.selectOptionByText(select, new RegExp(`^${value}$`, 'i'));
  }

  async setWrap(mode: 'nowrap' | 'wrap' | 'wrap-reverse'): Promise<void> {
    const select = this.window.getByTestId('layout-wrap');
    await expect(select).toBeVisible();
    const label =
      mode === 'nowrap'
        ? 'No Wrap'
        : mode
            .split('-')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    await this.selectOptionByText(select, new RegExp(`^${label}$`, 'i'));
  }

  async expectGapApplied(
    cardType: 'vertical-stack' | 'horizontal-stack' | 'grid-row' | 'grid-column',
    expectedPx: number,
    cardIndex = 0,
  ): Promise<void> {
    const card = this.getCard(cardIndex);

    if (cardType === 'vertical-stack') {
      const container = card.getByTestId('vertical-stack-container');
      await expect
        .poll(async () => await container.evaluate((el) => getComputedStyle(el as HTMLElement).gap))
        .toBe(`${expectedPx}px`);
      return;
    }

    if (cardType === 'horizontal-stack') {
      const container = card.getByTestId('horizontal-stack-container');
      await expect
        .poll(async () => await container.evaluate((el) => getComputedStyle(el as HTMLElement).gap))
        .toBe(`${expectedPx}px`);
      return;
    }

    const container = card.getByTestId('grid-layout-container');
    if (cardType === 'grid-row') {
      await expect
        .poll(
          async () => await container.evaluate((el) => getComputedStyle(el as HTMLElement).rowGap),
        )
        .toBe(`${expectedPx}px`);
      return;
    }

    await expect
      .poll(
        async () => await container.evaluate((el) => getComputedStyle(el as HTMLElement).columnGap),
      )
      .toBe(`${expectedPx}px`);
  }

  async expectAlignmentApplied(
    cardType: 'vertical-stack' | 'horizontal-stack' | 'grid',
    expected: { alignItems?: string; justifyContent?: string; justifyItems?: string },
    cardIndex = 0,
  ): Promise<void> {
    const card = this.getCard(cardIndex);
    const container =
      cardType === 'vertical-stack'
        ? card.getByTestId('vertical-stack-container')
        : cardType === 'horizontal-stack'
          ? card.getByTestId('horizontal-stack-container')
          : card.getByTestId('grid-layout-container');

    if (expected.alignItems) {
      await expect
        .poll(
          async () =>
            await container.evaluate((el) => getComputedStyle(el as HTMLElement).alignItems),
        )
        .toBe(expected.alignItems);
    }
    if (expected.justifyContent) {
      await expect
        .poll(
          async () =>
            await container.evaluate((el) => getComputedStyle(el as HTMLElement).justifyContent),
        )
        .toBe(expected.justifyContent);
    }
    if (expected.justifyItems) {
      await expect
        .poll(
          async () =>
            await container.evaluate((el) => getComputedStyle(el as HTMLElement).justifyItems),
        )
        .toBe(expected.justifyItems);
    }
  }

  async expectWrapApplied(
    expectedMode: 'nowrap' | 'wrap' | 'wrap-reverse',
    cardIndex = 0,
  ): Promise<void> {
    const container = this.getCard(cardIndex).getByTestId('horizontal-stack-container');
    await expect
      .poll(
        async () => await container.evaluate((el) => getComputedStyle(el as HTMLElement).flexWrap),
      )
      .toBe(expectedMode);
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
