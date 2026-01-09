import { Page, expect, type TestInfo } from '@playwright/test';
import { attachDebugJson } from '../helpers/debug';

export class IconColorDSL {
  constructor(private window: Page) {}

  async attachDiagnostics(testInfo: TestInfo): Promise<void> {
    const diagnostics = await this.window.evaluate(() => {
      const testIds = Array.from(document.querySelectorAll<HTMLElement>('[data-testid]'))
        .map((el) => el.getAttribute('data-testid') || '')
        .filter(Boolean);

      const iconColorTestIds = testIds.filter((id) => id.includes('icon-color'));
      const modeExists = Boolean(document.querySelector('[data-testid="button-card-icon-color-mode"]'));
      const propertiesPanelExists = Boolean(document.querySelector('[data-testid="properties-panel"]'));
      const listboxes = Array.from(document.querySelectorAll<HTMLElement>('[role="listbox"]'));
      const visibleListboxes = listboxes.filter((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      });
      const dropdowns = Array.from(document.querySelectorAll<HTMLElement>('.ant-select-dropdown'));
      const visibleDropdowns = dropdowns.filter((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      });

      return {
        propertiesPanelExists,
        modeExists,
        listboxCount: listboxes.length,
        visibleListboxCount: visibleListboxes.length,
        dropdownCount: dropdowns.length,
        visibleDropdownCount: visibleDropdowns.length,
        iconColorTestIds,
      };
    });

    await attachDebugJson(testInfo, 'icon-color-diagnostics.json', diagnostics);
  }

  async selectMode(
    mode: 'Default' | 'Custom' | 'State-based' | 'Attribute-based',
    testInfo?: TestInfo
  ): Promise<void> {
    const labelByMode: Record<typeof mode, string> = {
      Default: 'Default (follow button)',
      Custom: 'Custom',
      'State-based': 'State-based',
      'Attribute-based': 'Attribute-based',
    };
    const expectedLabel = labelByMode[mode];
    const escaped = expectedLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const selector = this.window.getByTestId('button-card-icon-color-mode');
    try {
      await expect(selector).toHaveCount(1);
    } catch (error) {
      if (testInfo) {
        await this.attachDiagnostics(testInfo);
      }
      throw error;
    }
    await selector.scrollIntoViewIfNeeded().catch(() => undefined);
    if (!(await selector.isVisible().catch(() => false))) {
      const panel = this.window.getByTestId('properties-panel');
      await panel.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
    }
    await expect(selector).toBeVisible();
    // Reuse the known-good Ant Select dropdown approach from `tests/support/dsl/settings.ts`
    await selector.click();

    // Wait for dropdown to appear - it's rendered in a portal
    const dropdown = this.window.locator('.ant-select-dropdown').last();
    try {
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      // Select the option by class name (Ant Design v6 uses .ant-select-item-option)
      const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(`^${escaped}$`, 'i') });
      await expect(option).toBeVisible({ timeout: 5000 });
      await option.click();

      // Wait for dropdown to close after selection
      await expect(dropdown).not.toBeVisible({ timeout: 5000 });
    } catch (error) {
      if (testInfo) {
        await this.attachDiagnostics(testInfo);
      }
      throw error;
    }
  }

  async setAttributeName(name: string): Promise<void> {
    const input = this.window.getByTestId('button-card-icon-color-attribute');
    await expect(input).toBeVisible();
    await input.fill(name);
  }
}

export default IconColorDSL;
