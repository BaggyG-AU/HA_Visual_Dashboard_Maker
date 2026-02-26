import { Page, expect } from '@playwright/test';

export class ThemeManagerDSL {
  constructor(private window: Page) {}

  async openThemeManagerTab(): Promise<void> {
    await this.window.getByRole('tab', { name: /Theme Manager/i }).last().click();
    await expect(this.window.getByTestId('theme-manager-save')).toBeVisible({ timeout: 5000 });
  }

  async saveCurrentTheme(name: string): Promise<void> {
    await this.window.getByTestId('theme-manager-save-name').fill(name);
    await this.window.getByTestId('theme-manager-save').click();
  }

  async selectSavedTheme(name: string): Promise<void> {
    await this.window.getByTestId('theme-manager-saved-select').click();
    const option = this.window.locator('.ant-select-item-option', { hasText: new RegExp(`^${name}$`) }).first();
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
  }

  async loadSelectedTheme(): Promise<void> {
    await this.window.getByTestId('theme-manager-load').click();
  }

  async deleteSelectedTheme(): Promise<void> {
    await this.window.getByTestId('theme-manager-delete').click();
  }

  async exportJson(): Promise<string> {
    await this.window.getByTestId('theme-manager-export').click();
    return this.window.getByTestId('theme-manager-json').inputValue();
  }

  async importJson(json: string): Promise<void> {
    await this.window.getByTestId('theme-manager-json').fill(json);
    await this.window.getByTestId('theme-manager-import').click();
  }

  async expectSyncUnchecked(): Promise<void> {
    await expect(this.window.getByTestId('theme-settings-sync')).not.toBeChecked();
  }

  async expectActiveViewDetected(): Promise<void> {
    await expect(this.window.getByTestId('theme-manager-active-view')).not.toContainText('None');
  }

  async setViewOverride(themeName: string | null): Promise<void> {
    const select = this.window.getByTestId('theme-manager-view-override');
    await select.click();

    const optionText = themeName ?? 'No override (use global theme)';
    const dropdown = this.window.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(`^${optionText}$`) }).first();
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
  }

  async expectSavedThemeVisible(name: string): Promise<void> {
    await this.window.getByTestId('theme-manager-saved-select').click();
    const option = this.window.locator('.ant-select-item-option', { hasText: new RegExp(`^${name}$`) }).first();
    await expect(option).toBeVisible({ timeout: 5000 });
    await this.window.keyboard.press('Escape');
  }
}
