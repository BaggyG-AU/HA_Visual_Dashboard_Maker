import { Page, expect } from '@playwright/test';

export class SettingsDSL {
  constructor(private window: Page) {}

  async open(): Promise<void> {
    const settingsButton = this.window.getByRole('button', { name: /Settings/i });
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();
    await expect(this.window.getByText('Settings')).toBeVisible({ timeout: 10000 });
  }

  async close(): Promise<void> {
    const closeButton = this.window.getByRole('button', { name: /^Close$/i }).last();
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    await expect(this.window.getByText('Settings')).toHaveCount(0, { timeout: 10000 });
  }

  async selectTab(tab: 'Appearance' | 'Connection' | 'Diagnostics'): Promise<void> {
    const tabNode = this.window.getByRole('tab', { name: tab });
    await expect(tabNode).toBeVisible();
    await tabNode.click();
  }

  async setLoggingLevel(level: string): Promise<void> {
    await this.selectTab('Diagnostics');

    // Get the root Select element by data-testid (Ant Design v6 applies it to root)
    const select = this.window.getByTestId('logging-level-select');
    await expect(select).toBeVisible({ timeout: 10000 });

    // Click directly on the Select element to open dropdown
    // Ant Design v6 handles the click event on the root element
    await select.click();

    // Wait for dropdown to appear - it's rendered in a portal
    const dropdown = this.window.locator('.ant-select-dropdown').last();
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Select the option by class name (Ant Design v6 uses .ant-select-item-option)
    // Reference: tests/integration/theme-integration.spec.ts:29
    const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(`^${level}$`, 'i') });
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click({ timeout: 5000 });

    // Wait for dropdown to close after selection
    await expect(dropdown).not.toBeVisible({ timeout: 5000 });

    // Verify selection
    await expect(select).toContainText(new RegExp(level, 'i'));
  }

  async expectLoggingLevel(level: string): Promise<void> {
    await this.selectTab('Diagnostics');
    const select = this.window.getByTestId('logging-level-select');
    await expect(select).toContainText(new RegExp(level, 'i'));
  }

  async setHapticsEnabled(enabled: boolean): Promise<void> {
    await this.selectTab('Diagnostics');
    const toggle = this.window.getByTestId('haptic-feedback-toggle');
    await expect(toggle).toBeVisible();
    const isChecked = await toggle.getAttribute('aria-checked');
    if ((isChecked === 'true') !== enabled) {
      await toggle.click();
    }
  }

  async setHapticsIntensity(value: number): Promise<void> {
    await this.selectTab('Diagnostics');
    const input = this.window.getByTestId('haptic-feedback-intensity-input');
    await expect(input).toBeVisible();
    await input.fill(String(value));
    await input.blur();
  }

  async selectHapticsPattern(label: string): Promise<void> {
    await this.selectTab('Diagnostics');
    const select = this.window.getByTestId('haptic-feedback-pattern-select');
    await expect(select).toBeVisible();
    await select.click();
    const dropdown = this.window.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(`^${label}$`, 'i') });
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
    await expect(dropdown).not.toBeVisible({ timeout: 5000 });
  }

  async clickHapticsTest(): Promise<void> {
    await this.selectTab('Diagnostics');
    const button = this.window.getByTestId('haptic-feedback-test-button');
    await expect(button).toBeVisible();
    await button.click();
  }

  async setSoundsEnabled(enabled: boolean): Promise<void> {
    await this.selectTab('Diagnostics');
    const toggle = this.window.getByTestId('ui-sounds-toggle');
    await expect(toggle).toBeVisible();
    const isChecked = await toggle.getAttribute('aria-checked');
    if ((isChecked === 'true') !== enabled) {
      await toggle.click();
    }
  }

  async setSoundsVolume(value: number): Promise<void> {
    await this.selectTab('Diagnostics');
    const input = this.window.getByTestId('ui-sounds-volume-input');
    await expect(input).toBeVisible();
    await input.fill(String(value));
    await input.blur();
  }

  async selectSoundEffect(label: string): Promise<void> {
    await this.selectTab('Diagnostics');
    const select = this.window.getByTestId('ui-sounds-effect-select');
    await expect(select).toBeVisible();
    await select.click();
    const dropdown = this.window.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(`^${label}$`, 'i') });
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
    await expect(dropdown).not.toBeVisible({ timeout: 5000 });
  }

  async clickSoundTest(): Promise<void> {
    await this.selectTab('Diagnostics');
    const button = this.window.getByTestId('ui-sounds-test-button');
    await expect(button).toBeVisible();
    await button.click();
  }
}
