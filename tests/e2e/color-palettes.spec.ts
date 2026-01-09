import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

test.describe('Color Palettes - Favorites integration', () => {
  test('user can create palette, add current color, apply favorite, and persist to YAML', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, colorPicker, colorPalettes, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Open color picker for button card color
      await colorPicker.openPopover('button-card-color-input');
      await colorPicker.expectVisible('button-card-color-input');
      const ids = await ctx.window.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>('[data-testid]'))
          .map((el) => el.getAttribute('data-testid') || '')
          .filter((id) => id.includes('picker'))
      );
      // eslint-disable-next-line no-console
      console.log('[picker test ids]', ids);
      await colorPalettes.openFavoritesTab('button-card-color-input-picker', testInfo);

      // Create new palette and add current color
      await colorPalettes.createPalette('button-card-color-input-picker');
      await colorPicker.setColorInput('#112233', 'button-card-color-input');
      await colorPalettes.addCurrentColor('button-card-color-input-picker');
      await colorPalettes.expectFavoriteCount(1, 'button-card-color-input-picker');

      // Apply favorite swatch
      await colorPalettes.applyFavorite(0, 'button-card-color-input-picker');
      await colorPicker.closePopover('button-card-color-input');

      // YAML should contain the color
      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value, diagnostics } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      // eslint-disable-next-line no-console
      console.log('[yamlEditor diagnostics summary]', JSON.stringify(diagnostics, null, 2));
      expect(value.toLowerCase()).toContain('#112233');
    } finally {
      await close(ctx);
    }
  });
});
