import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';
import { debugLog } from '../support/helpers/debug';

test.describe('Icon Color modes - PropertiesPanel', () => {
  test('custom icon color applies and persists to YAML', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, iconColor, colorPicker, yamlEditor, window } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      await iconColor.selectMode('Custom', testInfo);
      await colorPicker.openPopover('button-card-icon-color-input');
      await colorPicker.setColorInput('#FF8800', 'button-card-icon-color-input');
      await colorPicker.closePopover('button-card-icon-color-input');

      const icon = window.getByTestId('custom-button-card-icon');
      await expect(icon).toHaveCSS('color', 'rgb(255, 136, 0)');

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value, diagnostics } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      debugLog('[yamlEditor diagnostics summary]', JSON.stringify(diagnostics, null, 2));
      expect(value.toLowerCase()).toContain('icon_color');
      expect(value.toLowerCase()).toContain('icon_color_mode');
      expect(value.toLowerCase()).toContain('#ff8800');
    } finally {
      await close(ctx);
    }
  });
});
