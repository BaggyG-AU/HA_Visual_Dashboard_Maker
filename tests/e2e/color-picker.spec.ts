/**
 * E2E Tests - Color Picker Component
 *
 * Tests ColorPickerInput integration in PropertiesPanel using the ColorPickerDSL.
 * Covers: popover interactions, format toggle, recent colors, manual input, persistence.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';
import { debugLog } from '../support/helpers/debug';

test.describe('Color Picker - PropertiesPanel Integration', () => {
test.skip('visual regression and accessibility in scrollable PropertiesPanel (skipped: Electron focus inactive in PW)', async ({ page }, testInfo) => {
  void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker, window } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Place button card and open its properties
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Scroll panel to ensure popover anchors within scroll container
      await properties.scrollTo(400);

      const colorInput = window.getByTestId('button-card-color-input');
      await expect(colorInput).toBeVisible();
      await colorInput.scrollIntoViewIfNeeded();

      // Closed state snapshot
      await expect(colorInput).toHaveScreenshot('color-picker-input-closed.png', {
        animations: 'disabled',
        caret: 'hide',
      });

      // Keyboard-only open via swatch
      await colorPicker.openPopoverWithKeyboard('button-card-color-input');
      const popover = colorPicker.getPopover('button-card-color-input');
      await expect(popover).toBeVisible();

      // Popover should stay within scrollable panel bounds
      await colorPicker.expectPopoverWithinContainer('properties-panel', 'button-card-color-input');

      // Open state snapshot (default color)
      await expect(popover).toHaveScreenshot('color-picker-popover-default.png', {
        animations: 'disabled',
        caret: 'hide',
      });

      // Keyboard-only color entry and confirmation
      await colorPicker.typeColorWithKeyboard('#3366FF', 'button-card-color-input');
      await colorPicker.expectColorValue('#3366FF', 'button-card-color-input');

      // Recent colors should appear after selection
      await colorPicker.expectRecentColorsVisible('button-card-color-input');
      await colorPicker.expectRecentFocusIndicatorVisible(0, 'button-card-color-input');

      // Snapshot after selection with recents
      await expect(popover).toHaveScreenshot('color-picker-popover-selected-with-recents.png', {
        animations: 'disabled',
        caret: 'hide',
      });

      // Accessibility assertions
      await colorPicker.expectAccessibility('button-card-color-input');

      // Keyboard reachability: swatch -> main input -> format toggle -> popover input (order can vary; ensure each is reachable)
      await colorPicker.ensureWindowActive();
      await colorPicker.focusSwatch('button-card-color-input');
      await colorPicker.tabUntilFocused(window.getByTestId('button-card-color-input'), 2, testInfo);
      await colorPicker.tabUntilFocused(colorPicker.getFormatToggle('button-card-color-input'), 3, testInfo);
      await colorPicker.tabUntilFocused(colorPicker.getColorInput('button-card-color-input'), 3, testInfo);

      // Contrast of swatch border vs dark panel background
      await colorPicker.expectSwatchContrast('button-card-color-input', 'properties-panel');

      // Close popover via keyboard to verify Escape handling
      await window.keyboard.press('Escape');
      await expect(popover).not.toBeVisible({ timeout: 1000 });
    } finally {
      await close(ctx);
    }
  });

  test('should open color picker popover when clicking swatch', async () => {
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker } = ctx;

    try {
      // Wait for app to be ready and create dashboard
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Add a button card that has a color field
      await palette.expectVisible();
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');

      // Wait for card to appear on canvas
      await canvas.expectCardCount(1);

      // Select the card to open properties panel
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Open the color picker popover (auto-switches to Advanced Options tab)
      await colorPicker.openPopover('button-card-color-input');

      // Verify color picker is now visible
      await colorPicker.expectVisible('button-card-color-input');

      // Verify format toggle is visible and shows HEX by default
      await colorPicker.expectFormat('HEX', 'button-card-color-input');
    } finally {
      await close(ctx);
    }
  });

  test('should allow manual color input via text field', async () => {
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Add button card
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Open color picker
      await colorPicker.openPopover('button-card-color-input');

      // Set a red color via manual input
      await colorPicker.setColorInput('#FF0000', 'button-card-color-input');

      // Verify the color was accepted
      await colorPicker.expectColorValue('#FF0000', 'button-card-color-input');

      // Verify preview shows red
      await colorPicker.expectPreviewColor('rgb(255, 0, 0)', 'button-card-color-input');
    } finally {
      await close(ctx);
    }
  });

  test('should toggle between color formats (hex → rgb → hsl)', async () => {
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Add button card
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Open color picker and set initial color
      await colorPicker.openPopover('button-card-color-input');
      await colorPicker.setColorInput('#FF0000', 'button-card-color-input');

      // Verify format cycle works correctly
      await colorPicker.expectFormatCycle('button-card-color-input');
    } finally {
      await close(ctx);
    }
  });

  test('should save colors to recent colors history', async () => {
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Add button card
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Open color picker
      await colorPicker.openPopover('button-card-color-input');

      // Initially, recent colors should be hidden (empty)
      await colorPicker.expectRecentColorsHidden('button-card-color-input');

      // Add a color (blur triggers saving to recent colors)
      await colorPicker.setColorInput('#FF0000', 'button-card-color-input');

      // Wait a moment for the color to be saved
      await ctx.window.waitForTimeout(300);

      // Recent colors section should now be visible
      await colorPicker.expectRecentColorsVisible('button-card-color-input');

      // Should have at least 1 recent color
      const count = await colorPicker.getRecentColorsCount('button-card-color-input');
      expect(count).toBeGreaterThan(0);
    } finally {
      await close(ctx);
    }
  });

  test('should click recent color to apply it', async () => {
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Add button card
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Open color picker
      await colorPicker.openPopover('button-card-color-input');

      // Add two different colors to build history
      await colorPicker.setColorInput('#FF0000', 'button-card-color-input');
      await ctx.window.waitForTimeout(300);

      await colorPicker.setColorInput('#00FF00', 'button-card-color-input');
      await ctx.window.waitForTimeout(300);

      // Recent colors should now be visible
      await colorPicker.expectRecentColorsVisible('button-card-color-input');

      // Click the first recent color (most recent = green)
      await colorPicker.clickRecentColor(0, 'button-card-color-input');

      // Color should be applied
      await colorPicker.expectColorValue('#00FF00', 'button-card-color-input');
    } finally {
      await close(ctx);
    }
  });

  test('should clear recent colors history', async () => {
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Add button card
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Open color picker
      await colorPicker.openPopover('button-card-color-input');

      // Add a color to history
      await colorPicker.setColorInput('#FF0000', 'button-card-color-input');
      await ctx.window.waitForTimeout(300);

      // Verify recent colors are visible
      await colorPicker.expectRecentColorsVisible('button-card-color-input');

      // Clear recent colors
      await colorPicker.clearRecentColors('button-card-color-input');
      await ctx.window.waitForTimeout(300);

      // Recent colors section should now be hidden
      await colorPicker.expectRecentColorsHidden('button-card-color-input');
    } finally {
      await close(ctx);
    }
  });

  test('should handle format conversion when toggling formats', async () => {
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Add button card
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Open color picker
      await colorPicker.openPopover('button-card-color-input');

      // Set a hex color
      await colorPicker.setColorInput('#FF0000', 'button-card-color-input');
      await colorPicker.expectFormat('HEX', 'button-card-color-input');

      // Toggle to RGB
      await colorPicker.toggleFormat('button-card-color-input');
      await colorPicker.expectFormat('RGB', 'button-card-color-input');

      // The color value should be converted to RGB format
      const rgbValue = await colorPicker.getColorValue('button-card-color-input');
      expect(rgbValue).toContain('rgb');
      expect(rgbValue).toContain('255');

      // Toggle to HSL
      await colorPicker.toggleFormat('button-card-color-input');
      await colorPicker.expectFormat('HSL', 'button-card-color-input');

      // The color value should be converted to HSL format
      const hslValue = await colorPicker.getColorValue('button-card-color-input');
      expect(hslValue).toContain('hsl');
    } finally {
      await close(ctx);
    }
  });

  test('should support keyboard navigation (Enter to confirm)', async () => {
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Add button card
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Open color picker
      await colorPicker.openPopover('button-card-color-input');

      // Type a color and press Enter
      const input = colorPicker.getColorInput('button-card-color-input');
      await input.clear();
      await input.fill('#0000FF');
      await colorPicker.pressKey('Enter', 'button-card-color-input');

      // Color should be applied
      await colorPicker.expectColorValue('#0000FF', 'button-card-color-input');
    } finally {
      await close(ctx);
    }
  });

  test('should support keyboard navigation (Escape to revert)', async () => {
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Add button card
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Open color picker
      await colorPicker.openPopover('button-card-color-input');

      // Set initial color
      await colorPicker.setColorInput('#FF0000', 'button-card-color-input');

      // Type a different color but press Escape
      const input = colorPicker.getColorInput('button-card-color-input');
      await input.clear();
      await input.fill('#00FF00');
      await colorPicker.pressKey('Escape', 'button-card-color-input');

      // Should revert to previous value
      await colorPicker.expectColorValue('#FF0000', 'button-card-color-input');
    } finally {
      await close(ctx);
    }
  });

  test('should persist recent colors across sessions (localStorage)', async () => {
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Add button card
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Open color picker
      await colorPicker.openPopover('button-card-color-input');

      // Add a color
      await colorPicker.setColorInput('#FFAA00', 'button-card-color-input');
      await ctx.window.waitForTimeout(300);

      // Verify it's in recent colors
      await colorPicker.expectRecentColorsVisible('button-card-color-input');

      // Close and reopen the popover
      await colorPicker.closePopover('button-card-color-input');
      await ctx.window.waitForTimeout(300);
      await colorPicker.openPopover('button-card-color-input');

      // Recent colors should still be visible (persisted)
      await colorPicker.expectRecentColorsVisible('button-card-color-input');

      // Verify the count is still > 0
      const count = await colorPicker.getRecentColorsCount('button-card-color-input');
      expect(count).toBeGreaterThan(0);
    } finally {
      await close(ctx);
    }
  });

  test('should handle invalid color input gracefully', async () => {
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Add button card
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Open color picker
      await colorPicker.openPopover('button-card-color-input');

      // Set a valid color first
      await colorPicker.setColorInput('#FF0000', 'button-card-color-input');

      // Try to enter an invalid color
      const input = colorPicker.getColorInput('button-card-color-input');
      await input.clear();
      await input.fill('invalid-color');
      await input.blur();
      await ctx.window.waitForTimeout(200);

      // Should revert to last valid color
      await colorPicker.expectColorValue('#FF0000', 'button-card-color-input');
    } finally {
      await close(ctx);
    }
  });

  test('should allow typing "auto" as a valid value', async () => {
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, window } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Add button card
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();
      await properties.switchTab('Advanced Options');

      // Type "auto" directly in the main input (not the popover)
      const mainInput = window.getByTestId('button-card-color-input');
      await expect(mainInput).toBeVisible();
      await mainInput.clear();
      await mainInput.fill('auto');
      await mainInput.press('Enter');
      await ctx.window.waitForTimeout(200);

      // Verify "auto" was accepted
      const value = await mainInput.inputValue();
      expect(value.toLowerCase()).toBe('auto');
    } finally {
      await close(ctx);
    }
  });

  test('should have proper ARIA labels for accessibility', async () => {
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Add button card
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Open color picker
      await colorPicker.openPopover('button-card-color-input');

      // Verify accessibility attributes
      await colorPicker.expectAccessibility('button-card-color-input');
    } finally {
      await close(ctx);
    }
  });

  // SKIPPED: Multiple attempts to fix this test failed. The YAML editor Monaco model
  // is not being properly exposed/detected by the test despite adding global window references.
  // The visual UI shows the YAML is updating correctly, but the test cannot read the content.
  // See FOUNDATION_LAYER_IMPLEMENTATION.md for details and future investigation.
  test('should update YAML when color is changed', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Add button card
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Open color picker and set a color
      await colorPicker.openPopover('button-card-color-input');
      await colorPicker.setColorInput('#FF0000', 'button-card-color-input');
      await ctx.window.waitForTimeout(300);

      // Switch to YAML tab and verify via Monaco model value (authoritative)
      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible();
      const { value, diagnostics } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      debugLog('[yamlEditor diagnostics summary]', JSON.stringify(diagnostics, null, 2));
      await expect(value.toLowerCase()).toContain('#ff0000');
      await expect(value.toLowerCase()).toContain('color');
    } finally {
      await close(ctx);
    }
  });

  // Skipped due to intermittent Monaco/YAML visibility issues in properties panel (tracked in Phase 3)
  test('button card color + icon color should update preview and YAML', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker, iconColor, yamlEditor, window } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Set border/card color
      await colorPicker.openPopover('button-card-color-input');
      await colorPicker.setColorInput('#336699', 'button-card-color-input');
      await colorPicker.closePopover('button-card-color-input');

      // Select custom icon color mode first
      await iconColor.selectMode('Custom', testInfo);

      // Set icon color separately
      await colorPicker.openPopover('button-card-icon-color-input');
      await colorPicker.setColorInput('#FF8800', 'button-card-icon-color-input');
      await colorPicker.closePopover('button-card-icon-color-input');

      // Preview should reflect both colors
      const visual = window.getByTestId('custom-button-card-visual');
      await expect(visual).toHaveCSS('border-color', 'rgb(51, 102, 153)');

      const icon = window.getByTestId('custom-button-card-icon');
      await expect(icon).toHaveCSS('color', 'rgb(255, 136, 0)');

      // YAML tab should include both values
      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible();
      const { value, diagnostics } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      debugLog('[yamlEditor diagnostics summary]', JSON.stringify(diagnostics, null, 2));
      expect(value.toLowerCase()).toContain("color: '#336699'");
      expect(value.toLowerCase()).toContain("icon_color: '#ff8800'");
    } finally {
      await close(ctx);
    }
  });

  test('should handle duplicate colors in recent history (case-insensitive)', async () => {
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Add button card
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Open color picker
      await colorPicker.openPopover('button-card-color-input');

      // Add the same color in different cases
      await colorPicker.setColorInput('#ff0000', 'button-card-color-input');
      await ctx.window.waitForTimeout(300);

      await colorPicker.setColorInput('#FF0000', 'button-card-color-input');
      await ctx.window.waitForTimeout(300);

      // Should only have 1 recent color (duplicate removed)
      const count = await colorPicker.getRecentColorsCount('button-card-color-input');
      expect(count).toBe(1);
    } finally {
      await close(ctx);
    }
  });

  test('should limit recent colors to max (default 10)', async () => {
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      // Add button card
      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Open color picker
      await colorPicker.openPopover('button-card-color-input');

      // Add 15 different colors
      for (let i = 0; i < 15; i++) {
        const color = `#${i.toString(16).padStart(2, '0')}0000`;
        await colorPicker.setColorInput(color, 'button-card-color-input');
        await ctx.window.waitForTimeout(100);
      }

      // Should have maximum 10 recent colors
      const count = await colorPicker.getRecentColorsCount('button-card-color-input');
      expect(count).toBeLessThanOrEqual(10);
    } finally {
      await close(ctx);
    }
  });
});
