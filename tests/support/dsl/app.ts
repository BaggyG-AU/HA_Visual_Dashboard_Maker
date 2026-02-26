/**
 * App DSL
 *
 * Top-level application interactions.
 * Encapsulates all app shell operations.
 */

import { Page, expect } from '@playwright/test';

export class AppDSL {
  constructor(private window: Page) {}

  private get historyDebug() {
    return this.window.getByTestId('history-debug-state');
  }

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
      await expect
        .poll(async () => {
          const visibleCount = await this.window
            .locator('.ant-modal-wrap:visible')
            .count()
            .catch(() => 0);
          return visibleCount;
        }, { timeout: 2000 })
        .toBe(0);
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

  /**
   * Toggle Home Assistant connection state (test-only hook)
   */
  async setConnected(connected: boolean): Promise<void> {
    await this.window.evaluate((isConnected) => {
      const testWindow = window as Window & { __testThemeApi?: { setConnected: (value: boolean) => void } };
      testWindow.__testThemeApi?.setConnected(isConnected);
    }, connected);
  }

  async undo(): Promise<void> {
    const usedStoreHook = await this.window.evaluate(() => {
      const testWindow = window as Window & {
        __dashboardTestApi?: { canUndo: () => boolean; undo: () => void };
      };
      if (testWindow.__dashboardTestApi?.canUndo?.()) {
        testWindow.__dashboardTestApi.undo();
        return true;
      }
      return false;
    });
    if (usedStoreHook) return;

    const clicked = await this.window.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.ant-layout-header button'));
      const undoButton = buttons.find((button) => button.querySelector('.anticon-undo'));
      if (!undoButton || undoButton.disabled) {
        return false;
      }
      undoButton.click();
      return true;
    });
    if (clicked) return;

    await this.window.evaluate(() => {
      const event = new KeyboardEvent('keydown', { key: 'z', code: 'KeyZ', ctrlKey: true, bubbles: true });
      window.dispatchEvent(event);
      document.dispatchEvent(event);
      (document.activeElement as HTMLElement | null)?.dispatchEvent(event);
    });
    await this.window.keyboard.press('Control+z').catch(() => undefined);
  }

  async redo(): Promise<void> {
    const usedStoreHook = await this.window.evaluate(() => {
      const testWindow = window as Window & {
        __dashboardTestApi?: { canRedo: () => boolean; redo: () => void };
      };
      if (testWindow.__dashboardTestApi?.canRedo?.()) {
        testWindow.__dashboardTestApi.redo();
        return true;
      }
      return false;
    });
    if (usedStoreHook) return;

    const clicked = await this.window.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.ant-layout-header button'));
      const redoButton = buttons.find((button) => button.querySelector('.anticon-redo'));
      if (!redoButton || redoButton.disabled) {
        return false;
      }
      redoButton.click();
      return true;
    });
    if (clicked) return;

    await this.window.evaluate(() => {
      const event = new KeyboardEvent('keydown', { key: 'y', code: 'KeyY', ctrlKey: true, bubbles: true });
      window.dispatchEvent(event);
      document.dispatchEvent(event);
      (document.activeElement as HTMLElement | null)?.dispatchEvent(event);
    });
    await this.window.keyboard.press('Control+y').catch(() => undefined);
  }

  async copy(): Promise<void> {
    await this.window.keyboard.press('Control+c');
  }

  async cut(): Promise<void> {
    await this.window.keyboard.press('Control+x');
  }

  async paste(): Promise<void> {
    await this.window.keyboard.press('Control+v');
  }

  async deleteSelection(): Promise<void> {
    await this.window.keyboard.press('Delete');
  }

  async expectCanUndo(expected: boolean): Promise<void> {
    await expect(this.historyDebug).toHaveAttribute('data-can-undo', expected ? '1' : '0');
  }

}
