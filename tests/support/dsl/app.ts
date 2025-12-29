/**
 * App DSL
 *
 * Top-level application interactions.
 * Encapsulates all app shell operations.
 */

import { Page, expect } from '@playwright/test';

export class AppDSL {
  constructor(private window: Page) {}

  /**
   * Wait for app to be fully ready
   */
  async waitUntilReady(timeout = 10000): Promise<void> {
    const shell = this.window.getByTestId('app-shell');
    const palette = this.window.getByText('Card Palette', { exact: false });

    await expect(async () => {
      const shellVisible = await shell.isVisible().catch(() => false);
      const paletteVisible = await palette.isVisible().catch(() => false);
      expect(shellVisible || paletteVisible).toBeTruthy();
    }).toPass({ timeout });
  }

  /**
   * Ensure no blocking modal overlays are present
   * Closes any open modals by pressing Escape until none remain
   */
  async ensureNoBlockingOverlays(): Promise<void> {
    // Try up to 3 times to close any modal overlays
    for (let i = 0; i < 3; i++) {
      const modalWraps = this.window.locator('.ant-modal-wrap');
      const count = await modalWraps.count();

      if (count === 0) {
        // No modals, we're good
        return;
      }

      // Check if any are visible
      let hasVisibleModal = false;
      for (let j = 0; j < count; j++) {
        const isVisible = await modalWraps.nth(j).isVisible().catch(() => false);
        if (isVisible) {
          hasVisibleModal = true;
          break;
        }
      }

      if (!hasVisibleModal) {
        // Modals exist in DOM but aren't visible, we're good
        return;
      }

      // Press Escape to close visible modals
      await this.window.keyboard.press('Escape');
      await this.window.waitForTimeout(400);
    }
  }

  /**
   * Get window title
   */
  async getTitle(): Promise<string> {
    return await this.window.title();
  }

  /**
   * Verify title contains expected text
   */
  async expectTitle(text: string | RegExp): Promise<void> {
    const title = await this.getTitle();
    if (typeof text === 'string') {
      expect(title).toContain(text);
    } else {
      expect(title).toMatch(text);
    }
  }

  /**
   * Take screenshot for debugging
   */
  async screenshot(name: string, fullPage = false): Promise<void> {
    const screenshotPath = `test-results/screenshots/${name}.png`;
    await this.window.screenshot({ path: screenshotPath, fullPage });
  }
}
