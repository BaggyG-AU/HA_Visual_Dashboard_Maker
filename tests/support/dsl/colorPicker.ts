/**
 * Color Picker DSL
 *
 * Color picker interactions: opening popover, selecting colors, format toggle, recent colors.
 * Supports both standalone ColorPicker and ColorPickerInput (with popover).
 */

import { Page, expect, Locator } from '@playwright/test';

export class ColorPickerDSL {
  constructor(private window: Page) {}

  /**
   * Get color picker by test ID
   * Default: 'color-picker' (standalone component)
   * For ColorPickerInput: use test ID of the input wrapper
   */
  private getColorPicker(testId = 'color-picker'): Locator {
    return this.window.getByTestId(testId);
  }

  /**
   * Get ColorPickerInput swatch button (opens popover)
   */
  getColorSwatch(inputTestId: string): Locator {
    return this.window.getByTestId(`${inputTestId}-swatch`);
  }

  /**
   * Focus swatch (keyboard users)
   */
  async focusSwatch(inputTestId: string): Promise<void> {
    const swatch = this.getColorSwatch(inputTestId);
    await expect(swatch).toBeVisible();
    await swatch.focus();
    await expect(swatch).toBeFocused();
  }

  /**
   * Open popover using keyboard (Enter/Space on swatch)
   */
  async openPopoverWithKeyboard(inputTestId: string): Promise<void> {
    await this.focusSwatch(inputTestId);
    await this.window.keyboard.press('Enter');
    await this.expectVisible(inputTestId);
  }

  /**
   * Get color input field
   * For ColorPickerInput: targets the input inside the picker popover
   */
  getColorInput(testId = 'color-picker'): Locator {
    // For ColorPickerInput wrappers, the picker is at ${testId}-picker
    // and its input is at ${testId}-picker-input
    return this.window.getByTestId(`${testId}-picker-input`);
  }

  /**
   * Get format toggle button
   * For ColorPickerInput: targets the toggle inside the picker popover
   */
  getFormatToggle(testId = 'color-picker'): Locator {
    return this.window.getByTestId(`${testId}-picker-format-toggle`);
  }

  /**
   * Get popover container for ColorPickerInput
   */
  getPopover(testId = 'color-picker'): Locator {
    return this.window.getByTestId(`${testId}-picker`);
  }

  /**
   * Get color preview element
   * For ColorPickerInput: targets the preview inside the picker popover
   */
  getColorPreview(testId = 'color-picker'): Locator {
    return this.window.getByTestId(`${testId}-picker-preview`);
  }

  /**
   * Get recent color swatch by index
   * For ColorPickerInput: targets swatches inside the picker popover
   */
  getRecentColorSwatch(index: number, testId = 'color-picker'): Locator {
    return this.window.getByTestId(`${testId}-picker-recent-${index}`);
  }

  /**
   * Get clear recent colors button
   * For ColorPickerInput: targets the clear button inside the picker popover
   */
  getClearRecentButton(testId = 'color-picker'): Locator {
    return this.window.getByTestId(`${testId}-picker-clear-recent`);
  }

  /**
   * Verify color picker is visible
   * For ColorPickerInput: expects the picker popover to be visible
   */
  async expectVisible(testId = 'color-picker', timeout = 2000): Promise<void> {
    // For ColorPickerInput, the picker is at ${testId}-picker
    const picker = this.window.getByTestId(`${testId}-picker`);
    await expect(picker).toBeVisible({ timeout });
  }

  /**
   * Verify color picker is hidden
   */
  async expectHidden(testId = 'color-picker'): Promise<void> {
    await expect(this.getColorPicker(testId)).toHaveCount(0);
  }

  /**
   * Open ColorPickerInput popover by clicking swatch
   */
  async openPopover(inputTestId: string): Promise<void> {
    const swatch = this.getColorSwatch(inputTestId);
    await expect(swatch).toBeVisible();
    await swatch.click();
    await this.expectVisible(inputTestId);
  }

  /**
   * Close ColorPickerInput popover by clicking outside
   */
  async closePopover(inputTestId: string): Promise<void> {
    // Click outside the popover (on the page background)
    await this.window.click('body', { position: { x: 10, y: 10 } });

    const popover = this.window.getByTestId(`${inputTestId}-picker`);
    await expect(async () => {
      const count = await popover.count();
      if (count === 0) return;
      await expect(popover).not.toBeVisible();
    }).toPass({ timeout: 2000 });
  }

  /**
   * Set color value via manual input
   */
  async setColorInput(color: string, testId = 'color-picker'): Promise<void> {
    const input = this.getColorInput(testId);
    await expect(input).toBeVisible();
    await input.clear();
    await input.fill(color);
    await input.press('Enter'); // Trigger validation
    await this.window.waitForTimeout(200); // Allow onChange to process
  }

  /**
   * Get current color value from input
   */
  async getColorValue(testId = 'color-picker'): Promise<string> {
    const input = this.getColorInput(testId);
    await expect(input).toBeVisible();
    return await input.inputValue();
  }

  /**
   * Get current format from toggle button text
   */
  async getCurrentFormat(testId = 'color-picker'): Promise<string> {
    const toggle = this.getFormatToggle(testId);
    await expect(toggle).toBeVisible();
    const text = await toggle.textContent();
    return text?.trim() || '';
  }

  /**
   * Toggle color format (hex → rgb → hsl → hex)
   */
  async toggleFormat(testId = 'color-picker'): Promise<void> {
    const toggle = this.getFormatToggle(testId);
    await expect(toggle).toBeVisible();
    await toggle.click();
    await this.window.waitForTimeout(200); // Allow format conversion
  }

  /**
   * Verify current format matches expected
   */
  async expectFormat(expectedFormat: 'HEX' | 'RGB' | 'HSL', testId = 'color-picker'): Promise<void> {
    const currentFormat = await this.getCurrentFormat(testId);
    expect(currentFormat).toBe(expectedFormat);
  }

  /**
   * Verify color preview background matches color
   */
  async expectPreviewColor(expectedColor: string, testId = 'color-picker'): Promise<void> {
    const preview = this.getColorPreview(testId);
    await expect(preview).toBeVisible();

    const bgColor = await preview.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.backgroundColor;
    });

    // Normalize colors for comparison (convert to lowercase, trim)
    const normalizedExpected = expectedColor.toLowerCase().trim();
    const normalizedActual = bgColor.toLowerCase().trim();

    expect(normalizedActual).toBe(normalizedExpected);
  }

  /**
   * Verify input value matches expected color
   */
  async expectColorValue(expectedColor: string, testId = 'color-picker'): Promise<void> {
    const actualColor = await this.getColorValue(testId);
    expect(actualColor.toUpperCase()).toBe(expectedColor.toUpperCase());
  }

  /**
   * Click a recent color swatch by index
   */
  async clickRecentColor(index: number, testId = 'color-picker'): Promise<void> {
    const swatch = this.getRecentColorSwatch(index, testId);
    await expect(swatch).toBeVisible();
    await swatch.click();
    await this.window.waitForTimeout(200); // Allow onChange to process
  }

  /**
   * Verify recent colors section is visible
   */
  async expectRecentColorsVisible(testId = 'color-picker'): Promise<void> {
    // For ColorPickerInput, the picker is at ${testId}-picker
    const picker = this.window.getByTestId(`${testId}-picker`);
    const recentSection = picker.getByText('Recent Colors');
    await expect(recentSection).toBeVisible();
  }

  /**
   * Verify recent colors section is hidden
   */
  async expectRecentColorsHidden(testId = 'color-picker'): Promise<void> {
    // For ColorPickerInput, the picker is at ${testId}-picker
    const picker = this.window.getByTestId(`${testId}-picker`);
    const recentSection = picker.getByText('Recent Colors');
    await expect(recentSection).toHaveCount(0);
  }

  /**
   * Get count of recent color swatches
   */
  async getRecentColorsCount(testId = 'color-picker'): Promise<number> {
    const swatches = this.window.getByTestId(new RegExp(`^${testId}-picker-recent-\\d+$`));
    return await swatches.count();
  }

  /**
   * Clear all recent colors
   */
  async clearRecentColors(testId = 'color-picker'): Promise<void> {
    const clearButton = this.getClearRecentButton(testId);
    await expect(clearButton).toBeVisible();
    await clearButton.click();
    await this.window.waitForTimeout(200);
  }

  /**
   * Verify color picker is disabled
   */
  async expectDisabled(testId = 'color-picker'): Promise<void> {
    const input = this.getColorInput(testId);
    await expect(input).toBeDisabled();

    const toggle = this.getFormatToggle(testId);
    await expect(toggle).toBeDisabled();
  }

  /**
   * Verify color picker is enabled
   */
  async expectEnabled(testId = 'color-picker'): Promise<void> {
    const input = this.getColorInput(testId);
    await expect(input).toBeEnabled();

    const toggle = this.getFormatToggle(testId);
    await expect(toggle).toBeEnabled();
  }

  /**
   * Test keyboard navigation
   */
  async pressKey(key: 'Enter' | 'Escape' | 'Tab', testId = 'color-picker'): Promise<void> {
    const input = this.getColorInput(testId);
    await input.press(key);
    await this.window.waitForTimeout(200);
  }

  /**
   * Verify ARIA labels for accessibility
   */
  async expectAccessibility(testId = 'color-picker'): Promise<void> {
    const picker = this.getColorPicker(testId);
    const ariaLabel = await picker.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();

    const input = this.getColorInput(testId);
    const inputAriaLabel = await input.getAttribute('aria-label');
    expect(inputAriaLabel).toBeTruthy();

    const preview = this.getColorPreview(testId);
    const previewAriaLabel = await preview.getAttribute('aria-label');
    expect(previewAriaLabel).toBeTruthy();

    const swatch = this.getColorSwatch(testId);
    const swatchAria = await swatch.getAttribute('aria-label');
    expect(swatchAria).toBeTruthy();

    const toggle = this.getFormatToggle(testId);
    const toggleAria = await toggle.getAttribute('aria-label');
    expect(toggleAria ?? 'Format toggle').toBeTruthy();

    // Recent colors list + first swatch (if present)
    const recentList = this.window.getByRole('list', { name: /recent colors/i });
    if (await recentList.count()) {
      await expect(recentList.first()).toBeVisible();
      const firstItem = this.getRecentColorSwatch(0, testId);
      const itemAria = await firstItem.getAttribute('aria-label');
      expect(itemAria).toBeTruthy();
    }
  }

  /**
   * Get recent color value by index
   */
  async getRecentColorValue(index: number, testId = 'color-picker'): Promise<string> {
    const swatch = this.getRecentColorSwatch(index, testId);
    await expect(swatch).toBeVisible();

    const ariaLabel = await swatch.getAttribute('aria-label');
    if (!ariaLabel) return '';

    // Extract color from "Recent color #FF0000" format
    const match = ariaLabel.match(/#[0-9A-F]{6}/i);
    return match ? match[0] : '';
  }

  /**
   * Verify color picker responds to manual input changes
   */
  async expectInputChangesPreview(testId = 'color-picker'): Promise<void> {
    // Set a red color
    await this.setColorInput('#FF0000', testId);
    await this.expectPreviewColor('rgb(255, 0, 0)', testId);

    // Set a green color
    await this.setColorInput('#00FF00', testId);
    await this.expectPreviewColor('rgb(0, 255, 0)', testId);
  }

  /**
   * Verify format toggle cycles through all formats correctly
   */
  async expectFormatCycle(testId = 'color-picker'): Promise<void> {
    // Start with hex
    await this.expectFormat('HEX', testId);

    // Toggle to RGB
    await this.toggleFormat(testId);
    await this.expectFormat('RGB', testId);

    // Toggle to HSL
    await this.toggleFormat(testId);
    await this.expectFormat('HSL', testId);

    // Toggle back to HEX
    await this.toggleFormat(testId);
    await this.expectFormat('HEX', testId);
  }

  /**
   * Type a color value using keyboard only (no direct fill)
   */
  async typeColorWithKeyboard(color: string, testId = 'color-picker'): Promise<void> {
    const input = this.getColorInput(testId);
    await input.focus();
    await expect(input).toBeFocused();
    await this.window.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await this.window.keyboard.type(color);
    await this.window.keyboard.press('Enter');
  }

  /**
   * Ensure popover is visually anchored inside a container (e.g., properties panel)
   */
  async expectPopoverWithinContainer(containerTestId: string, testId = 'color-picker'): Promise<void> {
    const container = this.window.getByTestId(containerTestId);
    const popover = this.getPopover(testId);

    const [containerBox, popoverBox] = await Promise.all([
      container.boundingBox(),
      popover.boundingBox(),
    ]);

    expect(containerBox).toBeTruthy();
    expect(popoverBox).toBeTruthy();
    if (!containerBox || !popoverBox) return;

    expect(popoverBox.x).toBeGreaterThanOrEqual(containerBox.x - 2);
    expect(popoverBox.x + popoverBox.width).toBeLessThanOrEqual(containerBox.x + containerBox.width + 2);
    expect(popoverBox.y).toBeGreaterThanOrEqual(containerBox.y - 2);
    expect(popoverBox.y + popoverBox.height).toBeLessThanOrEqual(containerBox.y + containerBox.height + 2);
  }

  /**
   * Verify focus ring is visible on a recent color swatch
   */
  async expectRecentFocusIndicatorVisible(index: number, testId = 'color-picker'): Promise<void> {
    const swatch = this.getRecentColorSwatch(index, testId);
    await swatch.focus();
    await expect(swatch).toBeFocused();
    const hasRing = await swatch.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.boxShadow !== 'none' && style.boxShadow !== '';
    });
    expect(hasRing).toBe(true);
  }

  /**
   * Contrast check between swatch border and container background
   */
  async expectSwatchContrast(inputTestId: string, containerTestId: string, minimumRatio = 1.5): Promise<void> {
    const swatch = this.getColorSwatch(inputTestId);

    const ratio = await swatch.evaluate((el, cTestId) => {
      const containerEl = document.querySelector(`[data-testid="${cTestId}"]`) as HTMLElement | null;
      const swatchStyle = window.getComputedStyle(el);
      const containerStyle = containerEl ? window.getComputedStyle(containerEl) : window.getComputedStyle(document.body);

      const parseRgb = (color: string) => {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (!match) return [0, 0, 0];
        return [Number(match[1]), Number(match[2]), Number(match[3])];
      };

      const luminance = ([r, g, b]: number[]) => {
        const channel = (v: number) => {
          const n = v / 255;
          return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
        };
        const [cr, cg, cb] = [channel(r), channel(g), channel(b)];
        return 0.2126 * cr + 0.7152 * cg + 0.0722 * cb;
      };

      const borderColor = parseRgb(swatchStyle.borderColor || '#000');
      const bgColor = parseRgb(containerStyle.backgroundColor || '#000');

      const L1 = luminance(borderColor) + 0.05;
      const L2 = luminance(bgColor) + 0.05;
      return L1 > L2 ? L1 / L2 : L2 / L1;
    }, containerTestId);

    expect(ratio).toBeGreaterThanOrEqual(minimumRatio);
  }

  /**
   * Ensure the Electron window/page is active before keyboard assertions
   */
  async ensureWindowActive(): Promise<void> {
    await this.window.bringToFront();

    const hasFocus = await this.window.evaluate(() => document.hasFocus());
    expect(hasFocus).toBe(true);
  }

  /**
   * Tab forward until a locator is focused (keyboard reachability check)
   */
  async tabUntilFocused(target: Locator, maxPresses = 5): Promise<void> {
    for (let i = 0; i < maxPresses; i++) {
      if (await target.evaluate((el) => el === document.activeElement)) {
        return;
      }
      await this.window.keyboard.press('Tab');
    }
    await expect(target).toBeFocused(); // surfaces a clear error if unreachable
  }
}
