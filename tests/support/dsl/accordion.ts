import { Page, Locator, expect } from '@playwright/test';

export class AccordionDSL {
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

    // Retry once to handle focus/overlay timing in Electron + Ant Select portal rendering.
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

  private getAccordion(cardIndex = 0) {
    return this.getCard(cardIndex).getByTestId('accordion-card');
  }

  private getHeader(index: number, cardIndex = 0) {
    return this.getCard(cardIndex).getByTestId(`accordion-section-header-${index}`);
  }

  private getContent(index: number, cardIndex = 0) {
    return this.getCard(cardIndex).getByTestId(`accordion-section-content-${index}`);
  }

  async addAccordionCard(testInfo?: import('@playwright/test').TestInfo): Promise<void> {
    const searchInput = this.window.getByTestId('card-search');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('custom:accordion-card');

    const card = this.window.getByTestId('card-palette').getByTestId('palette-card-custom:accordion-card');
    await expect(card).toBeVisible({ timeout: 5000 });
    await card.dblclick();

    await expect(this.window.getByTestId('canvas-card').first()).toBeVisible({ timeout: 10000 });
    await searchInput.fill('');
    await expect(searchInput).toHaveValue('');

    void testInfo;
  }

  async expectVisible(cardIndex = 0): Promise<void> {
    await expect(this.getAccordion(cardIndex)).toBeVisible();
  }

  async clickSectionHeader(index: number, cardIndex = 0): Promise<void> {
    const header = this.getHeader(index, cardIndex);
    await expect(header).toBeVisible();
    await header.click();
  }

  async expectSectionExpanded(index: number, cardIndex = 0): Promise<void> {
    await expect(this.getHeader(index, cardIndex)).toHaveAttribute('aria-expanded', 'true');
    const content = this.getContent(index, cardIndex);
    await expect(content).toHaveCSS('opacity', '1');
  }

  async expectSectionCollapsed(index: number, cardIndex = 0): Promise<void> {
    await expect(this.getHeader(index, cardIndex)).toHaveAttribute('aria-expanded', 'false');
  }

  async expectSectionCount(count: number, cardIndex = 0): Promise<void> {
    await expect(this.getCard(cardIndex).locator('[data-testid^="accordion-section-header-"]')).toHaveCount(count);
  }

  async expectSectionTitle(index: number, title: string, cardIndex = 0): Promise<void> {
    await expect(this.getHeader(index, cardIndex)).toContainText(title);
  }

  async setSectionTitle(index: number, title: string): Promise<void> {
    const input = this.window.getByTestId(`accordion-section-${index}-title`);
    await expect(input).toBeVisible();
    await input.fill(title);
    await input.blur();
  }

  async setExpandMode(mode: 'single' | 'multi'): Promise<void> {
    const select = this.window.getByTestId('accordion-expand-mode');
    await expect(select).toBeVisible();
    await this.openSelectDropdown(select);
    await this.selectOptionByText(mode === 'single' ? /Single/i : /Multi/i);
    await expect(select).toContainText(mode === 'single' ? /Single/i : /Multi/i);
  }

  async setStyleMode(mode: 'bordered' | 'borderless' | 'ghost'): Promise<void> {
    const select = this.window.getByTestId('accordion-style-mode');
    await expect(select).toBeVisible();
    await this.openSelectDropdown(select);
    await this.selectOptionByText(new RegExp(`^${mode}$`, 'i'));
    await expect(select).toContainText(new RegExp(mode, 'i'));
  }

  async collapseAll(): Promise<void> {
    const button = this.window.getByTestId('accordion-collapse-all');
    await expect(button).toBeVisible();
    await button.click();
  }

  async expandAll(): Promise<void> {
    const button = this.window.getByTestId('accordion-expand-all');
    await expect(button).toBeVisible();
    await button.click();
  }

  async navigateToHeader(index: number, cardIndex = 0): Promise<void> {
    const header = this.getHeader(index, cardIndex);
    await expect(header).toBeVisible();
    await header.focus();
    await expect(header).toBeFocused();
  }

  async toggleViaKeyboard(key: 'Enter' | 'Space' = 'Enter'): Promise<void> {
    await this.window.keyboard.press(key === 'Space' ? ' ' : key);
  }

  async pressHeaderKey(key: 'ArrowUp' | 'ArrowDown' | 'Home' | 'End'): Promise<void> {
    await this.window.keyboard.press(key);
  }

  async expectCardScreenshot(name: string, cardIndex = 0): Promise<void> {
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

    await expect(this.getAccordion(cardIndex)).toBeVisible();
    await expect(this.getAccordion(cardIndex)).toHaveScreenshot(name, {
      animations: 'disabled',
      caret: 'hide',
      timeout: 15000,
    });
  }
}
