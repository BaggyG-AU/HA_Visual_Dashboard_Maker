import { test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BASE_YAML = `type: custom:slider-button-card
entity: input_number.office_brightness
name: Office Brightness
min: 0
max: 100
step: 10
orientation: horizontal
show_markers: true
show_value: true
`;

test.describe('Advanced Slider Visual Regression', () => {
  test('captures orientation and marker variants', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, advancedSlider, canvas, properties, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await advancedSlider.addAdvancedSliderCard();
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');
      await advancedSlider.verifySliderRendered();

      const card = ctx.window.getByTestId('canvas-card').first();
      await card.scrollIntoViewIfNeeded();
      const firstBox = await card.boundingBox();
      if (!firstBox) {
        throw new Error('Failed to capture canvas card bounding box for horizontal slider screenshot');
      }
      await test.expect(ctx.window).toHaveScreenshot('advanced-slider-horizontal-markers.png', {
        clip: {
          x: Math.floor(firstBox.x),
          y: Math.floor(firstBox.y),
          width: Math.ceil(firstBox.width) + 1,
          height: Math.ceil(firstBox.height) + 1,
        },
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixels: 2500,
      });

      await advancedSlider.configure({ orientation: 'vertical', showMarkers: false });
      const secondBox = await card.boundingBox();
      if (!secondBox) {
        throw new Error('Failed to capture canvas card bounding box for vertical slider screenshot');
      }
      await test.expect(ctx.window).toHaveScreenshot('advanced-slider-vertical-no-markers.png', {
        clip: {
          x: Math.floor(secondBox.x),
          y: Math.floor(secondBox.y),
          width: Math.ceil(secondBox.width) + 1,
          height: Math.ceil(secondBox.height) + 1,
        },
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixels: 2500,
      });
    } finally {
      await close(ctx);
    }
  });
});
