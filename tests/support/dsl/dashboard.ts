/**
 * Dashboard DSL
 *
 * Dashboard-level operations: creating, loading, saving.
 * Encapsulates all dashboard lifecycle interactions.
 */

import { Page, expect } from '@playwright/test';

type DashboardKind = 'blank' | 'template' | 'entityType';
interface CreateDashboardOptions {
  kind?: DashboardKind;
}

export class DashboardDSL {
  constructor(private window: Page) {}

  private async waitForCanvasOrEmpty(timeout = 10000): Promise<void> {
    const canvasOrEmpty = this.window
      .getByText(/No cards in this view/i)
      .or(this.window.locator('.react-grid-layout'))
      .first();

    await expect(async () => {
      const visible = await canvasOrEmpty.isVisible().catch(() => false);
      expect(visible).toBe(true);
    }).toPass({ timeout });
  }

  private async selectDashboardKind(kind: DashboardKind): Promise<void> {
    const optionTestIds: Record<DashboardKind, string> = {
      blank: 'new-dashboard-blank-option',
      template: 'new-dashboard-template-option',
      entityType: 'new-dashboard-entity-type-option',
    };

    const option = this.window.getByTestId(optionTestIds[kind]);
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
  }

  /**
   * Create a new blank dashboard
   */
  async createNew(options: CreateDashboardOptions = {}): Promise<void> {
    const kind = options.kind ?? 'blank';
    const dialog = this.window.getByTestId('new-dashboard-dialog');
    const newBtn = this.window.getByRole('button', { name: /New Dashboard/i });

    // If a dashboard is already active, nothing to do
    const existingGrid = await this.window.locator('.react-grid-layout').count();
    const existingEmpty = await this.window.getByText(/No cards in this view/i).count();
    if (existingGrid > 0 || existingEmpty > 0) {
      return;
    }

    // Ensure the dialog is open
    const dialogVisible = await dialog.isVisible().catch(() => false);
    if (!dialogVisible) {
      if ((await newBtn.count()) === 0) {
        throw new Error('New Dashboard button not found');
      }
      const button = newBtn.first();
      await expect(button).toBeVisible({ timeout: 5000 });
      await button.click();
    }

    // Wait for dialog content (target the option directly in case the root is hidden)
    await this.selectDashboardKind(kind);

    // Wait for dialog to close before checking canvas
    await expect(dialog).toBeHidden({ timeout: 10000 }).catch(() => {
      // If the root stays "hidden" while content disappears, tolerate and continue
    });

    // Wait for the canvas/empty-state to render (CI-safe)
    await this.waitForCanvasOrEmpty();
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
