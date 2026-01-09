/**
 * E2E - Gradient Editor integration with PropertiesPanel
 * Covers presets, keyboard navigation, and YAML round-trip using DSLs only.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

const setupGradientEditor = async () => {
  const ctx = await launchWithDSL();
  const { appDSL, dashboard, palette, canvas, properties } = ctx;

  await appDSL.waitUntilReady();
  await dashboard.createNew();

  await palette.expandCategory('Custom');
  await palette.addCard('custom:button-card');
  await canvas.expectCardCount(1);
  await canvas.selectCard(0);
  await properties.expectVisible();
  await properties.switchTab('Advanced Styling');

  return ctx;
};

test.describe('Gradient Editor - PropertiesPanel Integration', () => {
  test('user can save, export, and import presets', async ({ page }, testInfo) => {
    void page;
    const ctx = await setupGradientEditor();
    const { gradientEditor } = ctx;

    try {
      await gradientEditor.changeStopColorByIndex(0, '#112233');
      await gradientEditor.adjustStopPositionByIndex(0, 25);
      await gradientEditor.setAngle(45);
      await gradientEditor.expectCssContains('#112233');
      await gradientEditor.savePreset('Custom Sunset', testInfo);
      const exportJson = await gradientEditor.exportPresets(testInfo);
      expect(exportJson).toContain('Custom Sunset');

      const exportPath = testInfo.outputPath('gradient-presets.json');

      await gradientEditor.deleteUserPresetByIndex(0, testInfo);
      await gradientEditor.expectUserPresetCount(0);

      await gradientEditor.importPresets(exportPath, testInfo);
      await gradientEditor.expectUserPresetCount(1);
    } finally {
      await close(ctx);
    }
  });

  test('keyboard-only flow adjusts angle and stops', async ({ page }, testInfo) => {
    void page;
    const ctx = await setupGradientEditor();
    const { gradientEditor } = ctx;

    try {
      await gradientEditor.openGradientPopoverWithKeyboard();
      await gradientEditor.tabToStop(0, 20, testInfo);
      await gradientEditor.expectStopFocused(0, testInfo);
      await gradientEditor.pressEnter();
      await gradientEditor.tabToAngleInput(20, testInfo);
      await gradientEditor.pressArrowKey('ArrowRight');
      await gradientEditor.adjustStopPositionWithArrow(0, 'ArrowRight', true);
      await gradientEditor.pressDelete();
    } finally {
      await close(ctx);
    }
  });

  test('yaml round-trip updates gradient UI', async ({ page }, testInfo) => {
    void page;
    const ctx = await setupGradientEditor();
    const { properties, gradientEditor, yamlEditor } = ctx;

    try {
      await gradientEditor.enableGradient();
      await gradientEditor.applyPreset('material-sunset', testInfo);

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value, diagnostics } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      // eslint-disable-next-line no-console
      console.log('[yamlEditor diagnostics summary]', JSON.stringify(diagnostics, null, 2));
      expect(value.toLowerCase()).toContain('linear-gradient(120deg, #ff5858 0%, #f09819 100%)');

      const updatedYaml = yamlEditor.updateCardStyleBackground(
        value,
        'radial-gradient(circle at center, #111111 0%, #222222 100%)'
      );
      await yamlEditor.setEditorContent(updatedYaml, 'properties', testInfo);

      await properties.switchTab('Advanced Styling');
      await gradientEditor.expectUseGradientEnabled(true);
      await gradientEditor.expectType('radial');
    } finally {
      await close(ctx);
    }
  });

  test('gradient editor works on multiple card types', async () => {
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, gradientEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.addCard('markdown');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();
      await properties.switchTab('Advanced Styling');
      await gradientEditor.applyPreset('material-sky');
      await gradientEditor.expectPreview();
    } finally {
      await close(ctx);
    }
  });
});
