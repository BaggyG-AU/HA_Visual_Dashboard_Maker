import { expect, Locator, Page, type TestInfo } from '@playwright/test';
import { attachDebugJson } from '../helpers/debug';

export class StateIconsDSL {
  constructor(private window: Page) {}

  private controls() {
    return this.window.getByTestId('state-icon-mapping-controls');
  }

  async expectVisible(): Promise<void> {
    await expect(this.controls()).toBeVisible();
  }

  async addMapping(): Promise<void> {
    await this.expectVisible();
    await this.window.getByTestId('state-icon-add-mapping').click();
  }

  async setState(index: number, stateValue: string): Promise<void> {
    const input = this.window.getByTestId(`state-icon-state-${index}`);
    await expect(input).toBeVisible();
    await input.fill(stateValue);
  }

  async setIcon(index: number, iconName: string): Promise<void> {
    const select = this.window.getByTestId(`state-icon-icon-${index}`);
    await expect(select).toBeVisible();
    await this.selectIconValue(select, iconName);
    await expect(select).toContainText(iconName, { timeout: 5000 });
  }

  async setDefaultIcon(iconName: string): Promise<void> {
    const select = this.window.getByTestId('state-icon-default-icon');
    await expect(select).toBeVisible();
    await this.selectIconValue(select, iconName);
    await expect(select).toContainText(iconName, { timeout: 5000 });
  }

  async setMappingColor(index: number, color: string): Promise<void> {
    const input = this.window.getByTestId(`state-icon-color-${index}`);
    await expect(input).toBeVisible();
    await input.fill(color);
    await input.blur();
    await expect(input).toHaveValue(color);
  }

  async setDefaultColor(color: string): Promise<void> {
    const input = this.window.getByTestId('state-icon-default-color');
    await expect(input).toBeVisible();
    await input.fill(color);
    await input.blur();
    await expect(input).toHaveValue(color);
  }

  async expectPreviewSource(source: 'user' | 'domain' | 'generic'): Promise<void> {
    await expect(this.window.getByTestId('state-icon-preview-source')).toContainText(source);
  }

  async expectPreviewState(stateValue: string): Promise<void> {
    await expect(this.window.getByTestId('state-icon-preview-state')).toContainText(stateValue);
  }

  async attachDiagnostics(testInfo: TestInfo): Promise<void> {
    const diagnostics = await this.window.evaluate(() => {
      const controls = Boolean(document.querySelector('[data-testid="state-icon-mapping-controls"]'));
      const add = Boolean(document.querySelector('[data-testid="state-icon-add-mapping"]'));
      const preview = document.querySelector('[data-testid="state-icon-preview-source"]')?.textContent ?? null;
      const allTestIds = Array.from(document.querySelectorAll<HTMLElement>('[data-testid]'))
        .map((el) => el.getAttribute('data-testid'))
        .filter(Boolean);

      return {
        controls,
        add,
        preview,
        stateIconTestIds: allTestIds?.filter((value) => value?.includes('state-icon')),
      };
    });

    await attachDebugJson(testInfo, 'state-icons-diagnostics.json', diagnostics);
  }

  private async selectIconValue(select: Locator, iconName: string): Promise<void> {
    await select.click();
    const dropdown = this.window.locator('.ant-select-dropdown:visible').last();
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    const optionByText = dropdown.locator('.ant-select-item-option', { hasText: iconName }).first();
    const found = await optionByText
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);

    if (found) {
      await optionByText.click();
      return;
    }

    // Fallback: search input + exact option by role.
    const input = select.locator('input[role="combobox"]');
    if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
      await input.pressSequentially(iconName, { delay: 0 });
      const optionByRole = dropdown.getByRole('option', { name: new RegExp(`^${iconName}$`, 'i') }).first();
      if (await optionByRole.waitFor({ state: 'visible', timeout: 2000 }).catch(() => false)) {
        await optionByRole.click();
        return;
      }
      await this.window.keyboard.press('Enter');
      return;
    }

    // Final fallback: keyboard entry against active element.
    await this.window.keyboard.type(iconName);
    await this.window.keyboard.press('Enter');
  }
}

export default StateIconsDSL;
