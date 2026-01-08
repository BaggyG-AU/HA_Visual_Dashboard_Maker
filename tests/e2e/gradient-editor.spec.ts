/**
 * E2E - Gradient Editor integration with PropertiesPanel
 * Validates preset application and YAML round-trip using DSLs.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

test.describe('Gradient Editor - PropertiesPanel Integration', () => {
  test('gradient editor applies preset and persists to yaml', async ({}, testInfo) => {
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, gradientEditor, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      await properties.switchTab('Advanced Styling');
      await gradientEditor.enableGradient();
      await gradientEditor.applyPreset('material-sunset');
      await gradientEditor.expectPreview();

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible();
      const { value, diagnostics } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      // eslint-disable-next-line no-console
      console.log('[yamlEditor diagnostics summary]', JSON.stringify(diagnostics, null, 2));
      expect(value.toLowerCase()).toContain('linear-gradient(120deg, #ff5858 0%, #f09819 100%)');
    } finally {
      await close();
    }
  });
});
