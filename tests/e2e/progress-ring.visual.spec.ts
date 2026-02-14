import { test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const SINGLE_RING_YAML = `type: custom:modern-circular-gauge
title: Single Ring
thickness: 14
rings:
  - entity: sensor.daily_energy_progress
    label: Daily
    min: 0
    max: 100
    color: '#4fa3ff'
`;

const NESTED_RING_YAML = `type: custom:modern-circular-gauge
title: Nested Rings
thickness: 12
rings:
  - entity: sensor.daily_energy_progress
    label: Daily
    min: 0
    max: 100
    color: '#4fa3ff'
  - entity: sensor.monthly_energy_progress
    label: Monthly
    min: 0
    max: 100
    gradient:
      type: linear
      angle: 90
      stops:
        - color: '#6ccf7f'
          position: 0
        - color: '#2ca58d'
          position: 100
`;

test.describe('Progress Ring Visual Regression', () => {
  test('captures single and nested ring variants', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, progressRing, canvas, properties, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await progressRing.addProgressRingCard();
      await canvas.selectCard(0);

      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(SINGLE_RING_YAML, 'properties');
      await properties.switchTab('Form');

      await progressRing.verifyRendered();
      const card = ctx.window.getByTestId('canvas-card').first();
      await card.scrollIntoViewIfNeeded();

      const firstBox = await card.boundingBox();
      if (!firstBox) {
        throw new Error('Failed to capture card bounding box for single progress ring screenshot');
      }

      await test.expect(ctx.window).toHaveScreenshot('progress-ring-single.png', {
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

      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(NESTED_RING_YAML, 'properties');
      await properties.switchTab('Form');

      const secondBox = await card.boundingBox();
      if (!secondBox) {
        throw new Error('Failed to capture card bounding box for nested progress ring screenshot');
      }

      await test.expect(ctx.window).toHaveScreenshot('progress-ring-nested.png', {
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
