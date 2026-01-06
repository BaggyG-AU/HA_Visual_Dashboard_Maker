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
    await this.window.waitForTimeout(500); // Debounce
  }

  /**
   * Clear search
   */
  async clearSearch(): Promise<void> {
    const searchInput = this.window.getByTestId('card-search');
    await searchInput.clear();
    await this.window.waitForTimeout(500);
  }

  /**
   * Expand a category by name (if collapsed)
   */
  async expandCategory(categoryName: string): Promise<void> {
    const header = this.palette.getByRole('button', { name: new RegExp(categoryName, 'i') });
    await expect(header).toBeVisible();

    const isExpanded = await header.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await header.click();
      await this.window.waitForTimeout(300); // Animation
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
      await this.window.waitForTimeout(300); // Animation
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
  async addCard(cardType: string): Promise<void> {
    // Make the card visible: search for it to avoid collapsed categories/virtualization issues.
    const searchInput = this.window.getByTestId('card-search');
    await expect(searchInput).toBeVisible();
    await searchInput.fill(cardType);
    await this.window.waitForTimeout(200); // debounce / filter render

    // Prefer explicit palette test id; fall back to role/name match when ids are missing.
    let card = this.palette.getByTestId(`palette-card-${cardType}`);
    if ((await card.count()) === 0) {
      card = this.palette.getByRole('button', {
        name: new RegExp(cardType.replace(/_/g, ' '), 'i'),
      });
    }

    await expect(card).toBeVisible();
    await card.scrollIntoViewIfNeeded();
    await card.dblclick();

    // Wait for card to appear on canvas
    await expect(this.window.getByTestId('canvas-card').first()).toBeVisible({ timeout: 3000 });

    // Clear search to leave palette clean for later steps
    await searchInput.fill('');
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
