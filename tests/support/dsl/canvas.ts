/**
 * Canvas DSL
 *
 * Canvas operations: selecting cards, deselecting, positioning.
 * CRITICAL: react-grid-layout intercepts pointer events - must use mouse coordinates.
 */

import { Page, expect } from '@playwright/test';

export class CanvasDSL {
  constructor(private window: Page) {}

  /**
   * Select a card on the canvas by index
   * CRITICAL: Clicks the actual card content (data-testid="canvas-card")
   * NOT the .react-grid-item layout wrapper
   */
  async selectCard(index = 0): Promise<void> {
    const cards = this.window.getByTestId('canvas-card');
    const card = index === 0 ? cards.first() : cards.nth(index);
    await expect(card).toBeVisible();
    await card.click();

    // Wait for properties panel to appear (confirms selection)
    await expect(this.window.getByTestId('properties-panel')).toBeVisible({ timeout: 2000 });
  }

  /**
   * Deselect current card by clicking empty canvas area
   */
  async deselectCard(): Promise<void> {
    // Click the canvas container (not a card)
    const canvas = this.window.locator('.react-grid-layout');
    await canvas.click({ position: { x: 10, y: 10 } });

    // Wait for properties panel to disappear
    await expect(this.window.getByTestId('properties-panel')).toHaveCount(0, { timeout: 2000 });
  }

  /**
   * Get count of cards on canvas
   */
  async getCardCount(): Promise<number> {
    return await this.window.getByTestId('canvas-card').count();
  }

  /**
   * Verify card is selected (properties panel is visible)
   */
  async expectCardSelected(): Promise<void> {
    await expect(this.window.getByTestId('properties-panel')).toBeVisible();
  }

  /**
   * Verify no card is selected (properties panel not rendered)
   */
  async expectNoSelection(): Promise<void> {
    await expect(this.window.getByTestId('properties-panel')).toHaveCount(0);
  }

  /**
   * Verify canvas has specific number of cards
   */
  async expectCardCount(count: number, timeout = 3000): Promise<void> {
    await expect(this.window.getByTestId('canvas-card')).toHaveCount(count, { timeout });
  }

  /**
   * Verify canvas is empty
   */
  async expectEmpty(): Promise<void> {
    await this.expectCardCount(0);
  }

  /**
   * Check if canvas is empty
   */
  async isEmpty(): Promise<boolean> {
    const count = await this.getCardCount();
    return count === 0;
  }

  /**
   * Get the Nth card element (0-indexed)
   */
  getCard(index = 0) {
    const cards = this.window.getByTestId('canvas-card');
    return index === 0 ? cards.first() : cards.nth(index);
  }
}
