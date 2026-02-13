import { Page, expect } from '@playwright/test';

export class AccordionDSL {
  constructor(private window: Page) {}

  private getCard(cardIndex = 0) {
    const cards = this.window.getByTestId('canvas-card');
    return cardIndex === 0 ? cards.first() : cards.nth(cardIndex);
  }

  private getExpander(cardIndex = 0) {
    return this.getCard(cardIndex).getByTestId('expander-card');
  }

  private getHeader(cardIndex = 0) {
    return this.getCard(cardIndex).getByTestId('expander-section-header-0');
  }

  private getContent(cardIndex = 0) {
    return this.getCard(cardIndex).getByTestId('expander-section-content-0');
  }

  async addAccordionCard(testInfo?: import('@playwright/test').TestInfo): Promise<void> {
    const searchInput = this.window.getByTestId('card-search');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('custom:expander-card');

    const card = this.window.getByTestId('card-palette').getByTestId('palette-card-custom:expander-card');
    await expect(card).toBeVisible({ timeout: 5000 });
    await card.dblclick();

    await expect(this.window.getByTestId('canvas-card').first()).toBeVisible({ timeout: 10000 });
    await searchInput.fill('');
    await expect(searchInput).toHaveValue('');

    void testInfo;
  }

  async expectVisible(cardIndex = 0): Promise<void> {
    await expect(this.getExpander(cardIndex)).toBeVisible();
  }

  async toggleExpanded(cardIndex = 0): Promise<void> {
    const header = this.getHeader(cardIndex);
    await expect(header).toBeVisible();
    await header.click();
  }

  async expectExpanded(cardIndex = 0): Promise<void> {
    await expect(this.getHeader(cardIndex)).toHaveAttribute('aria-expanded', 'true');
    await expect(this.getContent(cardIndex)).toHaveCSS('opacity', '1');
  }

  async expectCollapsed(cardIndex = 0): Promise<void> {
    await expect(this.getHeader(cardIndex)).toHaveAttribute('aria-expanded', 'false');
  }

  async setTitle(title: string): Promise<void> {
    const input = this.window.getByTestId('expander-title');
    await expect(input).toBeVisible();
    await input.fill(title);
    await input.blur();
  }

  async setTitleCard(cardYaml: string): Promise<void> {
    const input = this.window.getByTestId('expander-title-card');
    await expect(input).toBeVisible();
    await input.fill(cardYaml);
    await input.blur();
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

    await expect(this.getExpander(cardIndex)).toBeVisible();
    await expect(this.getExpander(cardIndex)).toHaveScreenshot(name, {
      animations: 'disabled',
      caret: 'hide',
      timeout: 15000,
    });
  }
}
