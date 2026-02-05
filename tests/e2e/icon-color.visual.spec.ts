import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

test.describe('Icon Color visual regression', () => {
  test('captures solid and gradient icon colors', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, iconColor, colorPicker, window } = ctx;

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

      const icon = window.getByTestId('custom-button-card-icon-glyph');
      await expect(icon).toBeVisible();
      await expect(icon).toHaveScreenshot('icon-color-solid.png', { animations: 'disabled', caret: 'hide' });

      await iconColor.setCustomColorValue('linear-gradient(90deg, #ff4d4f 0%, #40a9ff 100%)');
      await expect(icon).toHaveScreenshot('icon-color-gradient.png', { animations: 'disabled', caret: 'hide' });
    } finally {
      await close(ctx);
    }
  });
});
