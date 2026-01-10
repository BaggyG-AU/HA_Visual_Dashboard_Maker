import { Page, expect, type TestInfo } from '@playwright/test';
import { attachDebugJson } from '../helpers/debug';

export type BackgroundTypeLabel = 'None (transparent)' | 'Solid color' | 'Gradient' | 'Image' | 'Frosted glass';

export class BackgroundCustomizerDSL {
  constructor(private window: Page) {}

  private getTypeSelect() {
    return this.window.getByTestId('advanced-style-background-type');
  }

  private getVisibleDropdown() {
    return this.window.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
  }

  async selectType(type: BackgroundTypeLabel, testInfo?: TestInfo): Promise<void> {
    const select = this.getTypeSelect();
    await expect(select).toBeVisible();
    await select.scrollIntoViewIfNeeded();
    await select.click();

    const dropdown = this.getVisibleDropdown();
    try {
      await expect(dropdown).toBeVisible({ timeout: 5000 });
      const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(`^${type}$`, 'i') });
      await expect(option).toBeVisible({ timeout: 5000 });
      await option.click();
      await expect(dropdown).not.toBeVisible({ timeout: 5000 });
    } catch (error) {
      if (testInfo) {
        const diagnostics = await this.window.evaluate(() => {
          const options = Array.from(document.querySelectorAll<HTMLElement>('.ant-select-item-option'))
            .map((el) => el.textContent || '')
            .filter(Boolean);
          return { options };
        });
        await attachDebugJson(testInfo, 'background-type-select-diagnostics.json', diagnostics);
      }
      throw error;
    }
  }

  async setImageUrl(url: string): Promise<void> {
    const input = this.window.getByTestId('background-image-url-input');
    await expect(input).toBeVisible();
    await input.fill(url);
  }

  async setImagePosition(label: string): Promise<void> {
    const select = this.window.getByTestId('background-image-position-select');
    await expect(select).toBeVisible();
    await select.scrollIntoViewIfNeeded();
    await select.click();
    const dropdown = this.getVisibleDropdown();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(`^${label}$`, 'i') });
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
    await expect(dropdown).not.toBeVisible({ timeout: 5000 });
  }

  async setImageSize(label: string): Promise<void> {
    const select = this.window.getByTestId('background-image-size-select');
    await expect(select).toBeVisible();
    await select.scrollIntoViewIfNeeded();
    await select.click();
    const dropdown = this.getVisibleDropdown();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(`^${label}$`, 'i') });
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
    await expect(dropdown).not.toBeVisible({ timeout: 5000 });
  }

  async setImageRepeat(label: string): Promise<void> {
    const select = this.window.getByTestId('background-image-repeat-select');
    await expect(select).toBeVisible();
    await select.scrollIntoViewIfNeeded();
    await select.click();
    const dropdown = this.getVisibleDropdown();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(`^${label}$`, 'i') });
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
    await expect(dropdown).not.toBeVisible({ timeout: 5000 });
  }

  async setNumericInput(testId: string, value: number): Promise<void> {
    const input = this.window.getByTestId(testId);
    await expect(input).toBeVisible();
    await input.fill(String(value));
    await input.blur();
  }
}

export default BackgroundCustomizerDSL;
