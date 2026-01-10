import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

test.describe('Card Background Customization - PropertiesPanel', () => {
  test('solid and gradient backgrounds update preview + YAML', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, backgroundCustomizer, colorPicker, gradientEditor, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();
      await properties.switchTab('Advanced Options');

      await backgroundCustomizer.selectType('Solid color', testInfo);
      await colorPicker.openPopover('advanced-style-solid-background-input');
      await colorPicker.setColorInput('#FF0000', 'advanced-style-solid-background-input');
      await colorPicker.closePopover('advanced-style-solid-background-input');
      await backgroundCustomizer.setNumericInput('background-opacity-input', 70);

      await canvas.expectBackgroundLayerVisible(0);
      await canvas.expectBackgroundLayerCss(0, 'background-color', /rgba\(255, 0, 0, 0\.7/);

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const solidYaml = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      expect(solidYaml.value.toLowerCase()).toContain('background: rgba(255, 0, 0');

      await properties.switchTab('Advanced Options');
      await backgroundCustomizer.selectType('Gradient', testInfo);
      await gradientEditor.applyPreset('material-sunset', testInfo);
      await canvas.expectBackgroundLayerCss(0, 'background-image', /linear-gradient/i);

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const gradientYaml = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      expect(gradientYaml.value.toLowerCase()).toContain('linear-gradient');
    } finally {
      await close(ctx);
    }
  });

  test.skip('image and blur backgrounds update preview + YAML', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, backgroundCustomizer, colorPicker, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();
      await properties.switchTab('Advanced Options');

      await backgroundCustomizer.selectType('Image', testInfo);
      await backgroundCustomizer.setImageUrl('https://example.com/background.jpg');
      await backgroundCustomizer.setImagePosition('Center');
      await backgroundCustomizer.setImageSize('Cover');
      await backgroundCustomizer.setImageRepeat('No repeat');
      await backgroundCustomizer.setNumericInput('background-image-opacity-input', 80);
      await backgroundCustomizer.setNumericInput('background-image-blur-input', 4);

      await colorPicker.openPopover('background-overlay-color-input');
      await colorPicker.setColorInput('#112233', 'background-overlay-color-input');
      await colorPicker.closePopover('background-overlay-color-input');
      await backgroundCustomizer.setNumericInput('background-overlay-opacity-input', 25);

      await canvas.expectBackgroundLayerVisible(0);
      await canvas.expectBackgroundLayerCss(0, 'background-image', /url\("https:\/\/example\.com\/background\.jpg"\)/);
      await canvas.expectBackgroundLayerCss(0, 'filter', /blur\(4px\)/);

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const imageYaml = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      expect(imageYaml.value.toLowerCase()).toContain('background-image:');
      expect(imageYaml.value.toLowerCase()).toContain('url("https://example.com/background.jpg")');

      await properties.switchTab('Advanced Options');
      await backgroundCustomizer.selectType('Frosted glass', testInfo);
      await backgroundCustomizer.setNumericInput('background-blur-input', 12);
      await colorPicker.openPopover('background-tint-color-input');
      await colorPicker.setColorInput('#334455', 'background-tint-color-input');
      await colorPicker.closePopover('background-tint-color-input');
      await backgroundCustomizer.setNumericInput('background-tint-opacity-input', 35);

      await canvas.expectBackgroundLayerCss(0, 'backdrop-filter', /blur\(12px\)/);

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const blurYaml = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      expect(blurYaml.value.toLowerCase()).toContain('backdrop-filter: blur(12px)');
    } finally {
      await close(ctx);
    }
  });
});
