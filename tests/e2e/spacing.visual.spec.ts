import { test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BUTTON_BASE_YAML = `type: button
entity: light.living_room
name: "Living Room"
`;

test.describe('Spacing Visual Regression', () => {
  test('captures spacing presets and per-side configuration', async ({ page }, testInfo) => {
    // Electron launch + card setup + three screenshot assertions can exceed 60s on CI/WSL2.
    test.setTimeout(120_000);
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, spacing } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.addCard('button', testInfo);
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BUTTON_BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await spacing.expectSpacingScreenshot('spacing-default.png', 0);

      await spacing.setCardMargin('relaxed');
      await spacing.setCardPadding('tight');
      await spacing.expectSpacingScreenshot('spacing-presets-relaxed-tight.png', 0);

      await spacing.setCardMargin({ top: 4, right: 16, bottom: 24, left: 8 });
      await spacing.setCardPadding({ top: 12, right: 4, bottom: 12, left: 20 });
      await spacing.expectSpacingScreenshot('spacing-per-side-custom.png', 0);
    } finally {
      await close(ctx);
    }
  });
});
