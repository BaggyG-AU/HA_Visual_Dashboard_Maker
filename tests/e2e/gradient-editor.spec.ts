/**
 * E2E - Gradient Editor integration with PropertiesPanel
 * Validates preset application and YAML round-trip using DSLs.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

test.describe('Gradient Editor - PropertiesPanel Integration', () => {
  test.skip('gradient editor applies preset and persists to yaml (skipped: PW cannot disambiguate PropertiesPanel YAML editor portal)', async () => {
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

      const presetRegex = /background:\s*linear-gradient\(120deg,\s*#ff5858\s*0%?,\s*#f09819\s*100%?\)/i;
      await expect
        .poll(async () => yamlEditor.anyYamlContains(presetRegex))
        .toBe(true);
    } finally {
      await close();
    }
  });
});
