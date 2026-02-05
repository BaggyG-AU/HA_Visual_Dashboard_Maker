import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

const DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';

test.describe('Card Background Customization - Visual and Performance', () => {
  test('captures visual snapshots for background types', async ({ page }) => {
    test.slow();
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, backgroundCustomizer, colorPicker, gradientEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();
      await properties.switchTab('Advanced Options');

      await backgroundCustomizer.selectType('Solid color');
      await colorPicker.openPopover('advanced-style-solid-background-input');
      await colorPicker.setColorInput('#FF0000', 'advanced-style-solid-background-input');
      await colorPicker.closePopover('advanced-style-solid-background-input');
      await backgroundCustomizer.setNumericInput('background-opacity-input', 80);
      await canvas.expectBackgroundLayerCss(0, 'background-color', 'rgba(255, 0, 0, 0.8)');
      await canvas.expectBackgroundLayerScreenshot(0, 'card-background-solid.png');

      await backgroundCustomizer.selectType('Gradient');
      await gradientEditor.applyPreset('material-sunset');
      await canvas.expectBackgroundLayerScreenshot(0, 'card-background-gradient.png');

      await backgroundCustomizer.selectType('Image');
      await backgroundCustomizer.setImageUrl(DATA_URL);
      await backgroundCustomizer.setImagePosition('Center');
      await backgroundCustomizer.setImageSize('Cover');
      await backgroundCustomizer.setImageRepeat('No repeat');
      await backgroundCustomizer.setNumericInput('background-image-opacity-input', 85);
      await backgroundCustomizer.setNumericInput('background-image-blur-input', 2);
      await colorPicker.openPopover('background-overlay-color-input');
      await colorPicker.setColorInput('#000000', 'background-overlay-color-input');
      await colorPicker.closePopover('background-overlay-color-input');
      await backgroundCustomizer.setNumericInput('background-overlay-opacity-input', 15);
      await canvas.expectBackgroundLayerScreenshot(0, 'card-background-image.png');

      await backgroundCustomizer.selectType('Frosted glass');
      await backgroundCustomizer.setNumericInput('background-blur-input', 12);
      await colorPicker.openPopover('background-tint-color-input');
      await colorPicker.setColorInput('#334455', 'background-tint-color-input');
      await colorPicker.closePopover('background-tint-color-input');
      await backgroundCustomizer.setNumericInput('background-tint-opacity-input', 35);
      await canvas.expectBackgroundLayerScreenshot(0, 'card-background-blur.png');
    } finally {
      await close(ctx);
    }
  });

  test('background changes maintain target frame rate', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, backgroundCustomizer, gradientEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();
      await properties.switchTab('Advanced Options');

      await backgroundCustomizer.selectType('Gradient');
      await gradientEditor.applyPreset('material-sunset');

      const metrics = await canvas.measureBackgroundLayerFps(0, 60);
      expect(metrics.fps).toBeGreaterThan(10);
    } finally {
      await close(ctx);
    }
  });
});
