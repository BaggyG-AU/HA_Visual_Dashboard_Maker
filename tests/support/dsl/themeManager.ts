import { Page, expect } from '@playwright/test';

/**
 * ⚠⚠ OPTIONS ARE SELECTED BY THE antd-DERIVED `title`, NEVER BY ANCHORED ROW TEXT.
 *
 * Both Selects this DSL drives — `theme-manager-saved-select` and
 * `theme-manager-view-override` — render the "no preview colours" badge, which
 * appends text to the option row. An anchored `^<name>$` matcher therefore
 * misses any badged option, and this file previously used three of them.
 *
 * ⚠⚠⚠ THAT WAS NOT A HARMLESS SELECTOR CHOICE. Codex's round-1 review of PR
 * #142 (finding M2, `docs/reviews/f3-theme-canvas-badge-codex-review.md`) found
 * that those matchers were the stated reason both Selects were left unbadged —
 * the product's warning population had been derived from what these lines could
 * match. `label` stays a plain string precisely so antd keeps deriving `title`
 * from it, which makes identity-based selection available and removes any
 * reason to shape the product around the test.
 */
export class ThemeManagerDSL {
  constructor(private window: Page) {}

  async openThemeManagerTab(): Promise<void> {
    await this.window
      .getByRole('tab', { name: /Theme Manager/i })
      .last()
      .click();
    await expect(this.window.getByTestId('theme-manager-save')).toBeVisible({ timeout: 5000 });
  }

  async saveCurrentTheme(name: string): Promise<void> {
    await this.window.getByTestId('theme-manager-save-name').fill(name);
    await this.window.getByTestId('theme-manager-save').click();
  }

  async selectSavedTheme(name: string): Promise<void> {
    await this.window.getByTestId('theme-manager-saved-select').click();
    const option = this.window.locator(`.ant-select-item-option[title="${name}"]`).first();
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
    const dropdown = this.window
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
      .last();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const option = dropdown.locator(`.ant-select-item-option[title="${optionText}"]`).first();
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
  }

  async expectSavedThemeVisible(name: string): Promise<void> {
    await this.window.getByTestId('theme-manager-saved-select').click();
    const option = this.window.locator(`.ant-select-item-option[title="${name}"]`).first();
    await expect(option).toBeVisible({ timeout: 5000 });
    await this.window.keyboard.press('Escape');
  }
}
