/**
 * Card Palette DSL
 *
 * Card palette interactions: searching, expanding categories, adding cards.
 * Uses ONLY stable data-testid selectors.
 */

import { Page, expect } from '@playwright/test';

export class CardPaletteDSL {
  constructor(private window: Page) {}

  private get palette() {
    return this.window.getByTestId('card-palette');
  }

  /**
   * Wait for palette to be visible
   */
  async waitUntilVisible(timeout = 10000): Promise<void> {
    await expect(this.palette).toBeVisible({ timeout });
  }

  /**
   * Verify palette is visible (alias for waitUntilVisible for API consistency)
   */
  async expectVisible(timeout = 10000): Promise<void> {
    await this.waitUntilVisible(timeout);
  }

  /**
   * Search for cards by name
   */
  async search(query: string): Promise<void> {
    const searchInput = this.window.getByTestId('card-search');
    await expect(searchInput).toBeVisible();
    await searchInput.fill(query);
    await expect(searchInput).toHaveValue(query);
  }

  /**
   * Clear search
   */
  async clearSearch(): Promise<void> {
    const searchInput = this.window.getByTestId('card-search');
    await searchInput.fill('');
    await expect(searchInput).toHaveValue('');
  }

  /**
   * Expand a category by name (if collapsed)
   */
  async expandCategory(categoryName: string): Promise<void> {
    await this.waitUntilVisible(15000);

    const header = this.palette.getByRole('button', { name: new RegExp(categoryName, 'i') });
    await expect(header).toBeVisible({ timeout: 10000 });

    const isExpanded = await header.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await header.click();
      await expect(header).toHaveAttribute('aria-expanded', 'true');
    }
  }

  /**
   * Collapse a category by name (if expanded)
   */
  async collapseCategory(categoryName: string): Promise<void> {
    const header = this.palette.getByRole('button', { name: new RegExp(categoryName, 'i') });
    await expect(header).toBeVisible();

    const isExpanded = await header.getAttribute('aria-expanded');
    if (isExpanded === 'true') {
      await header.click();
      await expect(header).toHaveAttribute('aria-expanded', 'false');
    }
  }

  /**
   * Check if category is expanded
   */
  async isCategoryExpanded(categoryName: string): Promise<boolean> {
    const header = this.palette.getByRole('button', { name: new RegExp(categoryName, 'i') });
    const ariaExpanded = await header.getAttribute('aria-expanded');
    return ariaExpanded === 'true';
  }

  /**
   * Add card to canvas by double-clicking palette card
   * MUST provide exact card type matching data-testid (e.g., 'button', 'entities', 'grid')
   */
  async addCard(cardType: string, testInfo?: import('@playwright/test').TestInfo): Promise<void> {
    // Make the card visible: search for it to avoid collapsed categories/virtualization issues.
    const searchInput = this.window.getByTestId('card-search');
    await expect(searchInput).toBeVisible();
    await searchInput.fill(cardType);
    await expect(searchInput).toHaveValue(cardType);

    const card = this.palette.getByTestId(`palette-card-${cardType}`);
    try {
      await expect(card).toBeVisible({ timeout: 5000 });
    } catch (error) {
      await this.attachPaletteDiagnostics(`palette-card-${cardType}`, testInfo);
      throw error;
    }
    await card.scrollIntoViewIfNeeded();
    await card.dblclick();

    // Wait for card to appear on canvas
    const canvasCard = this.window.getByTestId('canvas-card').first();
    try {
      await expect(canvasCard).toBeVisible({ timeout: 3000 });
    } catch (error) {
      await this.attachPaletteDiagnostics(`palette-card-${cardType}`, testInfo);
      throw error;
    }

    // Clear search to leave palette clean for later steps
    await searchInput.fill('');
    await expect(searchInput).toHaveValue('');
  }

  private async attachPaletteDiagnostics(targetTestId: string, testInfo?: import('@playwright/test').TestInfo): Promise<void> {
    if (!testInfo) return;
    const palette = this.window.getByTestId('card-palette');
    const diagnostics = await this.window.evaluate((testId) => {
      const paletteRoot = document.querySelector('[data-testid="card-palette"]');
      const searchInput = document.querySelector<HTMLInputElement>('[data-testid="card-search"]');
      const cards = Array.from(paletteRoot?.querySelectorAll<HTMLElement>('[data-testid^="palette-card-"]') ?? []);
      const categoryButtons = Array.from(paletteRoot?.querySelectorAll<HTMLElement>('[role="button"]') ?? []);
      return {
        targetTestId: testId,
        searchValue: searchInput?.value ?? '',
        paletteVisible: !!paletteRoot,
        cardCount: cards.length,
        cards: cards.map((node) => ({
          testId: node.dataset.testid ?? null,
          text: node.innerText?.slice(0, 120) ?? '',
        })),
        categories: categoryButtons.map((node) => ({
          text: node.innerText?.slice(0, 120) ?? '',
          ariaExpanded: node.getAttribute('aria-expanded') ?? null,
        })),
      };
    }, targetTestId);

    await testInfo.attach('palette-diagnostics.json', {
      body: JSON.stringify(diagnostics, null, 2),
      contentType: 'application/json',
    });

    await palette.screenshot({ path: testInfo.outputPath('palette-screenshot.png') });
    await testInfo.attach('palette-screenshot.png', {
      path: testInfo.outputPath('palette-screenshot.png'),
      contentType: 'image/png',
    });

    await this.window.screenshot({ path: testInfo.outputPath('fullpage-screenshot.png'), fullPage: true });
    await testInfo.attach('fullpage-screenshot.png', {
      path: testInfo.outputPath('fullpage-screenshot.png'),
      contentType: 'image/png',
    });
  }

  /**
   * Verify card exists in palette
   */
  async expectCardVisible(cardType: string): Promise<void> {
    const card = this.palette.getByTestId(`palette-card-${cardType}`);
    await expect(card).toBeVisible();
  }

  /**
   * Get count of visible categories
   */
  async getCategoryCount(): Promise<number> {
    return await this.palette.locator('.ant-collapse-item').count();
  }

  /**
   * Verify palette has categories
   */
  async expectHasCategories(): Promise<void> {
    const count = await this.getCategoryCount();
    expect(count).toBeGreaterThan(0);
  }
}
