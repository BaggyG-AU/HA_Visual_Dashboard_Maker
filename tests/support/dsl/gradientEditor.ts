import { Locator, Page, expect } from '@playwright/test';

/**
 * Gradient Editor DSL
 *
 * Minimal helpers for interacting with the GradientEditor popover inside the PropertiesPanel.
 * Uses data-testid hooks added to the Advanced Styling tab.
 */
export class GradientEditorDSL {
  private baseTestId: string;
  constructor(private window: Page, baseTestId = 'advanced-style-gradient-input') {
    this.baseTestId = baseTestId;
  }

  getUseGradientToggle(): Locator {
    return this.window.getByTestId('advanced-style-use-gradient');
  }

  getGradientInput(): Locator {
    return this.window.getByTestId(this.baseTestId);
  }

  async enableGradient(): Promise<void> {
    const toggle = this.getUseGradientToggle();
    await expect(toggle).toBeVisible();
    const isChecked = await toggle.isChecked();
    if (!isChecked) {
      await toggle.click();
    }
  }

  async openGradientPopover(): Promise<void> {
    await this.enableGradient();
    const swatch = this.window.getByTestId(`${this.baseTestId}-swatch`);
    await expect(swatch).toBeVisible();
    await swatch.click();
    // Wait for editor container rendered in body
    await expect(this.window.getByTestId(`${this.baseTestId}-editor`)).toBeVisible({ timeout: 5000 });
  }

  async applyPreset(presetId: string): Promise<void> {
    await this.openGradientPopover();
    const presetButton = this.window.getByTestId(`${this.baseTestId}-editor-preset-${presetId}`);
    await presetButton.scrollIntoViewIfNeeded();
    await expect(presetButton).toBeVisible({ timeout: 5000 });
    await presetButton.click();
  }

  async expectPreview(): Promise<void> {
    await expect(this.window.getByTestId(`${this.baseTestId}-preview`)).toBeVisible();
  }
}

export default GradientEditorDSL;
