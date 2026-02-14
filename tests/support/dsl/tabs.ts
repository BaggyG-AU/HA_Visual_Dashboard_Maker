import { expect, Locator, Page } from '@playwright/test';

export class TabsDSL {
  constructor(private window: Page) {}

  private getVisibleSelectDropdown() {
    return this.window.locator('.ant-select-dropdown:visible').last();
  }

  private async waitForAllSelectDropdownsToClose(): Promise<void> {
    await expect(this.window.locator('.ant-select-dropdown:visible')).toHaveCount(0, { timeout: 5000 });
  }

  private async openSelectDropdown(select: Locator): Promise<void> {
    await select.click();
    let dropdown = this.getVisibleSelectDropdown();
    const visibleAfterFirstClick = await dropdown.isVisible().catch(() => false);
    if (visibleAfterFirstClick) return;

    await select.click();
    dropdown = this.getVisibleSelectDropdown();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
  }

  private async selectOptionByText(pattern: RegExp): Promise<void> {
    await expect(this.getVisibleSelectDropdown()).toBeVisible({ timeout: 5000 });
    const option = this.window.locator('.ant-select-dropdown:visible .ant-select-item-option', { hasText: pattern }).first();
    await expect(option).toBeVisible();
    await option.evaluate((el) => {
      (el as HTMLElement).click();
    });
    await this.window.keyboard.press('Escape').catch(() => undefined);
    await this.waitForAllSelectDropdownsToClose();
  }

  private getCard(cardIndex = 0) {
    const cards = this.window.getByTestId('canvas-card');
    return cardIndex === 0 ? cards.first() : cards.nth(cardIndex);
  }

  private getTabsCard(cardIndex = 0) {
    return this.getCard(cardIndex).getByTestId('tabs-card');
  }

  private getTabTrigger(index: number, cardIndex = 0) {
    return this.getCard(cardIndex).getByTestId(`tabs-trigger-${index}`);
  }

  private getTabPanel(index: number, cardIndex = 0) {
    return this.getCard(cardIndex).getByTestId(`tabs-content-${index}`);
  }

  private getDefaultTabInput() {
    const byTestId = this.window.getByTestId('tabs-default-tab').locator('input').first();
    const byLabel = this.window
      .locator('.ant-form-item', {
        has: this.window.locator('.ant-form-item-label span', { hasText: /^Default Active Tab$/i }),
      })
      .locator('input')
      .first();
    return { byTestId, byLabel };
  }

  private async disableAnimations(): Promise<void> {
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
  }

  async addTabsCard(testInfo?: import('@playwright/test').TestInfo): Promise<void> {
    const searchInput = this.window.getByTestId('card-search');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('custom:tabbed-card');

    const card = this.window.getByTestId('card-palette').getByTestId('palette-card-custom:tabbed-card');
    await expect(card).toBeVisible({ timeout: 5000 });
    await card.dblclick();

    await expect(this.window.getByTestId('canvas-card').first()).toBeVisible({ timeout: 10000 });
    await searchInput.fill('');
    await expect(searchInput).toHaveValue('');

    void testInfo;
  }

  async expectVisible(cardIndex = 0): Promise<void> {
    await expect(this.getTabsCard(cardIndex)).toBeVisible();
  }

  async clickTab(index: number, cardIndex = 0): Promise<void> {
    const trigger = this.getTabTrigger(index, cardIndex);
    await expect(trigger).toBeVisible();
    await trigger.click();
  }

  async expectTabActive(index: number, cardIndex = 0): Promise<void> {
    const trigger = this.getTabTrigger(index, cardIndex);
    await expect(trigger).toHaveAttribute('aria-selected', 'true');
    await expect(this.getTabPanel(index, cardIndex)).toBeVisible();
  }

  async expectTabCount(count: number, cardIndex = 0): Promise<void> {
    await expect(this.getCard(cardIndex).locator('[data-testid^="tabs-trigger-"]')).toHaveCount(count);
  }

  async expectTabTitle(index: number, title: string, cardIndex = 0): Promise<void> {
    await expect(this.getTabTrigger(index, cardIndex)).toContainText(title);
  }

  async expectOrientation(orientation: 'horizontal' | 'vertical', cardIndex = 0): Promise<void> {
    await expect(this.getCard(cardIndex).getByTestId('tabs-tablist')).toHaveAttribute('aria-orientation', orientation);
  }

  async setTabTitle(index: number, title: string): Promise<void> {
    const input = this.window.getByTestId(`tabs-tab-${index}-title`);
    await expect(input).toBeVisible();
    await input.fill(title);
    await input.blur();
  }

  async setTabPosition(position: 'top' | 'bottom' | 'left' | 'right'): Promise<void> {
    const select = this.window.getByTestId('tabs-position');
    await expect(select).toBeVisible();
    await this.openSelectDropdown(select);
    await this.selectOptionByText(new RegExp(`^${position}$`, 'i'));
    await expect(select).toContainText(new RegExp(position, 'i'));
  }

  async setDefaultTab(index: number): Promise<void> {
    const value = String(index);

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const { byTestId, byLabel } = this.getDefaultTabInput();
      const hasByTestId = await byTestId.count();
      const input = (hasByTestId > 0 ? byTestId : byLabel).first();

      await expect(input).toBeVisible({ timeout: 5000 });

      try {
        await input.click({ clickCount: 3 });
        await input.fill(value);
        await input.blur();
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        const isDetached = message.includes('not attached to the DOM');
        if (!isDetached || attempt === 1) {
          throw error;
        }
      }
    }
  }

  async setAnimation(mode: 'none' | 'fade' | 'slide'): Promise<void> {
    const select = this.window.getByTestId('tabs-animation');
    await expect(select).toBeVisible();
    await this.openSelectDropdown(select);
    await this.selectOptionByText(new RegExp(`^${mode}$`, 'i'));
    await expect(select).toContainText(new RegExp(mode, 'i'));
  }

  async navigateToTab(index: number, cardIndex = 0): Promise<void> {
    const tab = this.getTabTrigger(index, cardIndex);
    await expect(tab).toBeVisible();
    await tab.focus();
    await expect(tab).toBeFocused();
  }

  async activateFocusedTab(key: 'Enter' | 'Space' = 'Enter'): Promise<void> {
    await this.window.keyboard.press(key === 'Space' ? ' ' : key);
  }

  async pressTabKey(key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | 'Home' | 'End'): Promise<void> {
    await this.window.keyboard.press(key);
  }

  async expectCardScreenshot(name: string, cardIndex = 0): Promise<void> {
    const panel = this.getCard(cardIndex).getByTestId('tabs-panel');
    await expect(panel).toBeVisible();
    await panel.scrollIntoViewIfNeeded();
    await expect.poll(async () => {
      const box = await panel.boundingBox();
      if (!box) return false;
      return box.width > 20 && box.height > 20;
    }, { timeout: 5000 }).toBe(true);
    await this.disableAnimations();
    const box = await panel.boundingBox();
    if (!box) {
      throw new Error('Tabs panel bounding box unavailable for screenshot');
    }

    // Capture the upper viewport area only. This avoids intermittent compositor
    // white regions that appear in the lower half of Electron frames on Linux.
    const clipHeight = Math.min(Math.max(240, box.height), 420);
    const image = await this.window.screenshot({
      animations: 'disabled',
      caret: 'hide',
      clip: {
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(clipHeight),
      },
      timeout: 20000,
    });
    expect(image).toMatchSnapshot(name, {
      maxDiffPixels: 2500,
    });
  }
}
