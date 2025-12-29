/**
 * Dashboard DSL
 *
 * Dashboard-level operations: creating, loading, saving.
 * Encapsulates all dashboard lifecycle interactions.
 */

import { Page, expect } from '@playwright/test';

export class DashboardDSL {
  constructor(private window: Page) {}

  /**
   * Create a new blank dashboard
   */
  async createNew(): Promise<void> {
    const newBtn = this.window.getByRole('button', { name: /New Dashboard/i });
    await expect(newBtn).toBeVisible({ timeout: 5000 });
    await newBtn.click();

    // Wait for canvas to initialize (either empty message or grid layout)
    await expect(
      this.window.getByText(/No cards in this view/i)
        .or(this.window.locator('.react-grid-layout'))
        .first()
    ).toBeVisible({ timeout: 3000 });
  }

  /**
   * Check if a dashboard is currently active
   */
  async isActive(): Promise<boolean> {
    const gridExists = await this.window.locator('.react-grid-layout').count();
    const emptyMsg = await this.window.getByText(/No cards in this view/i).count();
    return gridExists > 0 || emptyMsg > 0;
  }

  /**
   * Get count of cards on canvas
   */
  async getCardCount(): Promise<number> {
    return await this.window.getByTestId('canvas-card').count();
  }

  /**
   * Verify dashboard has no cards
   */
  async expectEmpty(): Promise<void> {
    await expect(this.window.getByTestId('canvas-card')).toHaveCount(0);
  }

  /**
   * Verify dashboard has specific number of cards
   */
  async expectCardCount(count: number, timeout = 3000): Promise<void> {
    await expect(this.window.getByTestId('canvas-card')).toHaveCount(count, { timeout });
  }
}
