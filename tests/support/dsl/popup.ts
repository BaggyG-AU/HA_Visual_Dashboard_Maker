import { expect, Locator, Page } from '@playwright/test';

export class PopupDSL {
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

  private getModal(level = 0) {
    return this.window.locator('.ant-modal-wrap:visible').nth(level);
  }

  async addPopupCard(testInfo?: import('@playwright/test').TestInfo): Promise<void> {
    const searchInput = this.window.getByTestId('card-search');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('custom:popup-card');

    const card = this.window.getByTestId('card-palette').getByTestId('palette-card-custom:popup-card');
    await expect(card).toBeVisible({ timeout: 5000 });
    await card.dblclick();

    await expect(this.window.getByTestId('canvas-card').first()).toBeVisible({ timeout: 10000 });
    await searchInput.fill('');
    await expect(searchInput).toHaveValue('');
    void testInfo;
  }

  async openPopupFromTriggerCard(cardIndex = 0): Promise<void> {
    const card = this.window.getByTestId('canvas-card').nth(cardIndex);
    await expect(card).toBeVisible();
    await card.getByTestId('popup-trigger-open').click();
  }

  async openPopupFromTapAction(cardIndex = 0): Promise<void> {
    const card = this.window.getByTestId('canvas-card').nth(cardIndex);
    await expect(card).toBeVisible();
    await card.click();
  }

  async expectPopupOpen(level = 0): Promise<void> {
    await expect(this.getModal(level)).toBeVisible({ timeout: 5000 });
  }

  async expectPopupTitle(title: string, level = 0): Promise<void> {
    await this.expectPopupOpen(level);
    await expect(this.getModal(level)).toContainText(title);
  }

  async expectPopupCardCount(count: number): Promise<void> {
    await expect(this.window.locator('[data-testid="popup-modal-content"] [data-testid="conditional-visibility-wrapper"]')).toHaveCount(count);
  }

  async closePopupWithButton(level = 0): Promise<void> {
    const modal = this.getModal(level);
    await expect(modal).toBeVisible();
    await modal.locator('.ant-modal-close').first().click();
    await expect(modal).toBeHidden({ timeout: 5000 });
  }

  async closePopupWithBackdrop(level = 0): Promise<void> {
    await this.expectPopupOpen(level);
    const wrap = this.window.locator('.ant-modal-wrap:visible').last();
    await expect(wrap).toBeVisible();
    await wrap.click({ position: { x: 2, y: 2 }, force: true });
    await expect(this.getModal(level)).toHaveCount(0, { timeout: 5000 });
  }

  async closePopupWithEsc(): Promise<void> {
    await this.window.keyboard.press('Escape');
  }

  async setPopupSize(size: 'auto' | 'small' | 'medium' | 'large' | 'fullscreen' | 'custom'): Promise<void> {
    const select = this.window.getByTestId('popup-size');
    await expect(select).toBeVisible();
    await this.openSelectDropdown(select);
    await this.selectOptionByText(new RegExp(`^${size}$`, 'i'));
    await expect(select).toContainText(new RegExp(size, 'i'));
  }

  async setCloseOnBackdrop(enabled: boolean): Promise<void> {
    const toggle = this.window.getByTestId('popup-close-on-backdrop');
    await expect(toggle).toBeVisible();
    const isChecked = await toggle.getAttribute('aria-checked');
    if ((isChecked === 'true') !== enabled) {
      await toggle.click();
    }
  }

  async focusFirstElementInPopup(level = 0): Promise<void> {
    const modal = this.getModal(level);
    await expect(modal).toBeVisible();
    const closeButton = modal.locator('.ant-modal-close').first();
    await closeButton.focus();
    await expect(closeButton).toBeFocused();
  }

  async expectFocusTrapped(): Promise<void> {
    await this.window.keyboard.press('Tab');
    const insidePopup = await this.window.evaluate(() => {
      const active = document.activeElement;
      if (!active) return false;
      return Boolean(active.closest('.ant-modal-wrap'));
    });
    expect(insidePopup).toBe(true);
  }

  async expectFocusReturnedToTrigger(): Promise<void> {
    await expect
      .poll(async () => {
        const isFocused = await this.window.getByTestId('popup-trigger-open').evaluate((el) => el === document.activeElement);
        return isFocused;
      }, { timeout: 5000 })
      .toBe(true);
  }

  async expectPopupScreenshot(name: string, level = 0): Promise<void> {
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
    const modal = this.getModal(level);
    await expect(modal).toBeVisible();
    await expect(modal).toHaveScreenshot(name, {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixels: 2500,
    });
  }
}
