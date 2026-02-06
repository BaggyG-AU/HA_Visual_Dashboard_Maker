import { Page, expect, type TestInfo } from '@playwright/test';
import { attachDebugJson } from '../helpers/debug';

export class SmartActionsDSL {
  constructor(private window: Page) {}

  private getToggle(testIdPrefix: string) {
    return this.window.getByTestId(`${testIdPrefix}-smart-defaults-toggle`);
  }

  private getPreview(testIdPrefix: string) {
    return this.window.getByTestId(`${testIdPrefix}-smart-defaults-preview`);
  }

  async setEnabled(testIdPrefix: string, enabled: boolean, testInfo?: TestInfo): Promise<void> {
    const toggle = this.getToggle(testIdPrefix);
    await expect(toggle).toBeVisible();

    try {
      const checked = await toggle.getAttribute('aria-checked');
      const isChecked = checked === 'true';
      if (isChecked !== enabled) {
        await toggle.click();
      }
    } catch (error) {
      if (testInfo) {
        await this.attachDiagnostics(testInfo, testIdPrefix);
      }
      throw error;
    }
  }

  async expectPreviewContains(testIdPrefix: string, text: string | RegExp, testInfo?: TestInfo): Promise<void> {
    const preview = this.getPreview(testIdPrefix);
    try {
      await expect(preview).toBeVisible({ timeout: 5000 });
      await expect(preview).toContainText(text);
    } catch (error) {
      if (testInfo) {
        await this.attachDiagnostics(testInfo, testIdPrefix);
      }
      throw error;
    }
  }

  async attachDiagnostics(testInfo: TestInfo, testIdPrefix: string): Promise<void> {
    const diagnostics = await this.window.evaluate((prefix) => {
      const toggle = document.querySelector(`[data-testid="${prefix}-smart-defaults-toggle"]`) as HTMLElement | null;
      const preview = document.querySelector(`[data-testid="${prefix}-smart-defaults-preview"]`) as HTMLElement | null;
      return {
        toggleExists: Boolean(toggle),
        toggleAriaChecked: toggle?.getAttribute('aria-checked') ?? null,
        previewExists: Boolean(preview),
        previewText: preview?.textContent ?? null,
      };
    }, testIdPrefix);

    await attachDebugJson(testInfo, 'smart-actions-diagnostics.json', diagnostics);
  }
}

export default SmartActionsDSL;

