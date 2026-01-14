/**
 * Color Picker DSL
 *
 * Color picker interactions: opening popover, selecting colors, format toggle, recent colors.
 * Supports both standalone ColorPicker and ColorPickerInput (with popover).
 */

import { Page, expect, Locator, type TestInfo } from '@playwright/test';
import { PropertiesPanelDSL } from './propertiesPanel';

export class ColorPickerDSL {
  private propertiesPanel: PropertiesPanelDSL;

  constructor(private window: Page) {
    this.propertiesPanel = new PropertiesPanelDSL(window);
  }

  /**
   * Get color picker by test ID
   * Default: 'color-picker' (standalone component)
   * For ColorPickerInput: use test ID of the input wrapper
   */
  private getColorPicker(testId = 'color-picker'): Locator {
    return this.window.getByTestId(testId);
  }

  private getPickerPopover(testId = 'color-picker'): Locator {
    return this.window.getByTestId(`${testId}-picker`);
  }

  private async ensurePopoverOpen(testId: string): Promise<void> {
    const picker = this.getPickerPopover(testId);
    const isVisible = await picker.isVisible().catch(() => false);
    if (!isVisible) {
      await this.openPopover(testId);
      await expect(picker).toBeVisible({ timeout: 5000 });
    }
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
    const picker = this.getPickerPopover(testId);
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
   *
   * Flow-defensive: Automatically switches to Advanced Options tab for button-card styling fields.
   * This handles the UI reorganization where button card color/icon inputs moved from Form tab
   * to Advanced Options tab, making the flow transparent to test authors.
   */
  async openPopover(inputTestId: string): Promise<void> {
    // Flow-defensive: Detect if this is a button-card styling field that requires Advanced Options tab
    const requiresAdvancedOptionsTab = this.isButtonCardStylingField(inputTestId);

    if (requiresAdvancedOptionsTab) {
      // Check if properties panel is visible and if we need to switch tabs
      const panelVisible = await this.propertiesPanel.isVisible();
      if (panelVisible) {
        const currentTab = await this.propertiesPanel.getActiveTab();
        if (currentTab !== 'Advanced Options') {
          // Auto-switch to Advanced Options tab
          await this.propertiesPanel.switchTab('Advanced Options');
        }
      }
    }

    const swatch = this.getColorSwatch(inputTestId);
    await swatch.scrollIntoViewIfNeeded();
    await expect(swatch).toBeVisible();
    await swatch.click({ trial: false, force: true });
    await this.expectVisible(inputTestId);
  }

  /**
   * Determine if a testid corresponds to a button-card styling field
   * that requires the Advanced Options tab to be active
   */
  private isButtonCardStylingField(testId: string): boolean {
    // Button card styling fields that live in Advanced Options tab
    const stylingFields = [
      'button-card-color-input',
      'button-card-icon-color-input',
      'button-card-icon-color-state-on',
      'button-card-icon-color-state-off',
      'button-card-icon-color-state-unavailable',
      // Add other button card styling fields here as needed
    ];
    return stylingFields.includes(testId);
  }

  /**
   * Close ColorPickerInput popover by clicking outside
   */
  async closePopover(inputTestId: string): Promise<void> {
    const popover = this.getPickerPopover(inputTestId);
    const isVisible = await popover.isVisible().catch(() => false);
    if (!isVisible) return;

    await this.window.keyboard.press('Escape');
    await expect(async () => {
      const count = await popover.count();
      if (count === 0) return;
      await expect(popover).not.toBeVisible();
    }).toPass({ timeout: 2000 });
  }

  private normalizeRecentHex(color: string): string {
    return color.trim().toUpperCase();
  }

  private async getRecentColorsFromStorage(): Promise<string[]> {
    return await this.window.evaluate(() => {
      try {
        const raw = localStorage.getItem('havdm-recent-colors');
        if (!raw) return [];
        const parsed = JSON.parse(raw) as { colors?: unknown };
        if (!parsed || !Array.isArray(parsed.colors)) return [];
        return parsed.colors.filter((c): c is string => typeof c === 'string');
      } catch {
        return [];
      }
    });
  }

  async waitForRecentColorPersisted(color: string): Promise<void> {
    const normalized = this.normalizeRecentHex(color);
    await expect
      .poll(async () => {
        const colors = await this.getRecentColorsFromStorage();
        return colors.map((c) => c.toUpperCase()).includes(normalized);
      }, { timeout: 5000 })
      .toBe(true);
  }

  async waitForRecentColorsCount(expectedCount: number, testId = 'color-picker'): Promise<void> {
    const picker = this.getPickerPopover(testId);
    const isVisible = await picker.isVisible().catch(() => false);
    if (!isVisible) {
      await this.openPopover(testId);
    }

    await this.switchTab('recent', testId);

    const swatches = this.window.getByTestId(new RegExp(`^${testId}-picker-recent-\\d+$`));
    await expect
      .poll(async () => swatches.count(), { timeout: 5000 })
      .toBe(expectedCount);
  }

  async waitForRecentColorsEmpty(testId = 'color-picker'): Promise<void> {
    await this.waitForRecentColorsCount(0, testId);
    const picker = this.getPickerPopover(testId);
    await expect(picker.getByText('No recent colors yet.')).toBeVisible({ timeout: 5000 });
  }

  private async ensureFormat(expected: 'HEX' | 'RGB' | 'HSL', testId = 'color-picker'): Promise<void> {
    const toggle = this.getFormatToggle(testId);
    await expect(toggle).toBeVisible();
    for (let i = 0; i < 3; i++) {
      const text = (await toggle.textContent())?.trim().toUpperCase() ?? '';
      if (text === expected) return;
      await this.toggleFormat(testId);
      await expect(toggle).toHaveText(expected, { timeout: 2000 });
    }
    await expect(toggle).toHaveText(expected);
  }

  /**
   * Set color value via manual input
   * Automatically switches to HEX format if a hex color is provided
   */
  async setColorInput(color: string, testId = 'color-picker'): Promise<void> {
    const input = this.getColorInput(testId);
    await expect(input).toBeVisible();

    // If color starts with #, ensure we're in HEX format
    if (color.startsWith('#')) {
      await this.ensureFormat('HEX', testId);
    }

    await input.clear();
    await input.fill(color);
    await input.press('Enter'); // Triggers handleInputBlur -> addRecentColor
    const escaped = color.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    await expect(input).toHaveValue(new RegExp(escaped, 'i'));

    // Ensure recent colors persistence for HEX inputs (avoids flakes when popover is reopened)
    if (color.startsWith('#')) {
      await this.waitForRecentColorPersisted(color);
    }
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
    await this.ensurePopoverOpen(testId);
    const toggle = this.getFormatToggle(testId);
    await expect(toggle).toBeVisible();
    await toggle.scrollIntoViewIfNeeded();
    await toggle.click();
  }

  /**
   * Verify current format matches expected
   */
  async expectFormat(expectedFormat: 'HEX' | 'RGB' | 'HSL', testId = 'color-picker'): Promise<void> {
    const toggle = this.getFormatToggle(testId);
    await expect(toggle).toHaveText(expectedFormat);
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
    const input = this.getColorInput(testId);
    const escaped = expectedColor.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    await expect(input).toHaveValue(new RegExp(`^${escaped}$`, 'i'));
  }

  /**
   * Switch between Favorites and Recent tabs in the color picker
   */
  async switchTab(tab: 'favorites' | 'recent', testId = 'color-picker'): Promise<void> {
    await this.ensurePopoverOpen(testId);
    // Tab buttons are at ${testId}-picker-tab-favorites and ${testId}-picker-tab-recents
    // because ColorPickerInput passes `${testId}-picker` as the testId to ColorPicker
    const tabButton = this.window.getByTestId(`${testId}-picker-tab-${tab === 'recent' ? 'recents' : 'favorites'}`);
    await expect(tabButton).toBeVisible();
    await tabButton.scrollIntoViewIfNeeded();
    await tabButton.click();

    // State-based content check (avoids arbitrary waits)
    if (tab === 'recent') {
      const picker = this.getPickerPopover(testId);
      await expect(picker.getByText('Recent Colors', { exact: true })).toBeVisible({ timeout: 5000 });
    }
  }

  /**
   * Click a recent color swatch by index
   */
  async clickRecentColor(index: number, testId = 'color-picker'): Promise<void> {
    await this.ensurePopoverOpen(testId);

    // Switch to recent tab first
    await this.switchTab('recent', testId);

    const swatch = this.getRecentColorSwatch(index, testId);
    await expect(swatch).toBeVisible();
    await swatch.click();
  }

  /**
   * Verify recent colors section is visible (with at least one color)
   */
  async expectRecentColorsVisible(testId = 'color-picker'): Promise<void> {
    await this.ensurePopoverOpen(testId);
    const picker = this.getPickerPopover(testId);

    // Switch to recent tab first
    await this.switchTab('recent', testId);

    // For ColorPickerInput, the picker is at ${testId}-picker
    const recentSection = picker.getByText('Recent Colors', { exact: true });
    await expect(recentSection).toBeVisible();

    // Verify there's at least one recent color swatch
    const swatches = this.window.getByTestId(new RegExp(`^${testId}-picker-recent-\\d+$`));
    await expect
      .poll(async () => swatches.count(), { timeout: 5000 })
      .toBeGreaterThan(0);
  }

  /**
   * Verify recent colors section is empty (no colors saved yet)
   */
  async expectRecentColorsHidden(testId = 'color-picker'): Promise<void> {
    await this.waitForRecentColorsEmpty(testId);
  }

  /**
   * Get count of recent color swatches
   */
  async getRecentColorsCount(testId = 'color-picker'): Promise<number> {
    await this.ensurePopoverOpen(testId);

    // Switch to recent tab first
    await this.switchTab('recent', testId);

    const swatches = this.window.getByTestId(new RegExp(`^${testId}-picker-recent-\\d+$`));
    return await swatches.count();
  }

  /**
   * Clear all recent colors
   */
  async clearRecentColors(testId = 'color-picker'): Promise<void> {
    await this.ensurePopoverOpen(testId);

    // Switch to recent tab first
    await this.switchTab('recent', testId);

    const clearButton = this.getClearRecentButton(testId);
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    await this.waitForRecentColorsEmpty(testId);
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
  async ensureWindowActive(testInfo?: TestInfo): Promise<void> {
    await this.window.bringToFront();

    const active = await this.window.waitForFunction(() => document.hasFocus(), null, { timeout: 3000 }).catch(() => false);
    if (active) return;

    const diag = await this.collectFocusDiagnostics(undefined, 0);
    await this.attachAndLogDiagnostics(testInfo, diag, 'color-picker-focus-diagnostics.json');
    throw new Error('Window not focused (document.hasFocus() false)');
  }

  /**
   * Tab forward until a locator is focused (keyboard reachability check)
   */
  async tabUntilFocused(target: Locator, maxPresses = 5, testInfo?: TestInfo): Promise<void> {
    await this.ensureWindowActive(testInfo);
    const history: Array<Record<string, unknown>> = [];
    let attempts = 0;
    for (; attempts < maxPresses; attempts++) {
      if (await target.evaluate((el) => el === document.activeElement)) {
        return;
      }
      await this.window.keyboard.press('Tab');
      history.push(await this.captureActiveElementSummary());
    }
    // One last activation attempt before fail
    await this.ensureWindowActive(testInfo);
    const diag = await this.collectFocusDiagnostics(target, attempts, history);
    await this.attachAndLogDiagnostics(testInfo, diag, 'color-picker-focus-diagnostics.json');
    if (testInfo?.attach) {
      const screenshot = await this.window.screenshot({ fullPage: true });
      await testInfo.attach('color-picker-focus.png', { body: screenshot, contentType: 'image/png' });
    }
    await expect(target).toBeFocused(); // will throw with standard message
  }

  /**
   * Collect focus diagnostics (JSON-safe)
   */
  private async collectFocusDiagnostics(target?: Locator, attempts?: number, history?: Array<Record<string, unknown>>): Promise<Record<string, unknown>> {
    const diag: Record<string, unknown> = { attempts, history };
    diag.document = await this.captureActiveElementSummary();

    if (target) {
      const box = await target.boundingBox();
      const visible = await target.isVisible().catch(() => false);
      const attrs = await target.evaluate((el) => {
        const elem = el as HTMLElement;
        const closestPopover = elem.closest('[data-testid*="picker"]');
        const tabbables = (root: Element | Document) =>
          Array.from(
            root.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          )
            .filter((n) => !n.hasAttribute('disabled') && n.offsetParent !== null)
            .slice(0, 10)
            .map((n) => ({
              tag: n.tagName,
              id: n.id || null,
              testId: n.getAttribute('data-testid') || null,
              aria: n.getAttribute('aria-label') || null,
            }));

        const scope = closestPopover || document;
        return {
          tag: elem.tagName,
          id: elem.id || null,
          testId: elem.getAttribute('data-testid') || null,
          aria: elem.getAttribute('aria-label') || null,
          scopeTabbables: tabbables(scope),
          scopeHasTarget: scope.contains(elem),
        };
      }).catch(() => ({}));
      diag.target = { visible, box, ...attrs };
    }
    return diag;
  }

  private async attachAndLogDiagnostics(testInfo: TestInfo | undefined, diagnostics: Record<string, unknown>, label: string): Promise<void> {
    const body = JSON.stringify(diagnostics, null, 2);
    if (testInfo?.attach) {
      await testInfo.attach(label, {
        body: Buffer.from(body),
        contentType: 'application/json',
      });
    }
    // eslint-disable-next-line no-console
    console.log(`[colorPicker diagnostics] ${body}`);
  }

  private async captureActiveElementSummary(): Promise<Record<string, unknown>> {
    return await this.window.evaluate(() => {
      const ae = document.activeElement as HTMLElement | null;
      return {
        hasFocus: document.hasFocus(),
        visibilityState: document.visibilityState,
        activeTag: ae?.tagName,
        activeId: ae?.id || null,
        activeTestId: ae?.getAttribute?.('data-testid') || null,
        activeAria: ae?.getAttribute?.('aria-label') || null,
      };
    });
  }
}
