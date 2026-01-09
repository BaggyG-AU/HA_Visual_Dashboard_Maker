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

  test('state-based icon colors persist to YAML', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, iconColor, colorPicker, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      await iconColor.selectMode('State-based', testInfo);
      await colorPicker.openPopover('button-card-icon-color-state-on');
      await colorPicker.setColorInput('#00FF00', 'button-card-icon-color-state-on');
      await colorPicker.closePopover('button-card-icon-color-state-on');

      await colorPicker.openPopover('button-card-icon-color-state-off');
      await colorPicker.setColorInput('#FF0000', 'button-card-icon-color-state-off');
      await colorPicker.closePopover('button-card-icon-color-state-off');

      await colorPicker.openPopover('button-card-icon-color-state-unavailable');
      await colorPicker.setColorInput('#999999', 'button-card-icon-color-state-unavailable');
      await colorPicker.closePopover('button-card-icon-color-state-unavailable');

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value, diagnostics } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      debugLog('[yamlEditor diagnostics summary]', JSON.stringify(diagnostics, null, 2));
      const yamlLower = value.toLowerCase();
      expect(yamlLower).toContain('icon_color_mode');
      expect(yamlLower).toContain('state');
      expect(yamlLower).toContain('icon_color_states');
      expect(yamlLower).toContain('#00ff00');
      expect(yamlLower).toContain('#ff0000');
      expect(yamlLower).toContain('#999999');
    } finally {
      await close(ctx);
    }
  });

  test('attribute-based icon colors persist to YAML', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, iconColor, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      await iconColor.selectMode('Attribute-based', testInfo);
      await iconColor.setAttributeName('icon_color');

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value, diagnostics } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      debugLog('[yamlEditor diagnostics summary]', JSON.stringify(diagnostics, null, 2));
      const yamlLower = value.toLowerCase();
      expect(yamlLower).toContain('icon_color_mode');
      expect(yamlLower).toContain('attribute');
      expect(yamlLower).toContain('icon_color_attribute');
      expect(yamlLower).toContain('icon_color');
    } finally {
      await close(ctx);
    }
  });
});
