import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BASE_YAML = `type: custom:modern-circular-gauge
title: Energy Progress
thickness: 12
start_angle: 0
direction: clockwise
animate: true
animation_duration_ms: 500
show_labels: true
label_precision: 1
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

test.describe('Progress Ring', () => {
  test('renders nested rings from YAML and exposes accessible summary labels', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, progressRing, canvas, properties, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await progressRing.addProgressRingCard();
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await progressRing.verifyRendered();
      await progressRing.expectRingSummaryCount(2);
      await expect(ctx.window.getByTestId('progress-ring-visual')).toHaveAttribute('aria-label', /Daily:/i);
      await expect(ctx.window.getByTestId('progress-ring-visual')).toHaveAttribute('aria-label', /Monthly:/i);
    } finally {
      await close(ctx);
    }
  });

  test('updates direction and geometry controls through form and persists YAML', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, progressRing, canvas, properties, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await progressRing.addProgressRingCard();
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await progressRing.configure({
        startAngle: 135,
        direction: 'counter-clockwise',
        thickness: 18,
        animate: false,
        labelPrecision: 0,
      });

      await properties.switchTab('YAML');
      const yaml = await yamlEditor.getEditorContent();

      expect(yaml).toContain('type: custom:modern-circular-gauge');
      expect(yaml).toContain('start_angle: 135');
      expect(yaml).toContain('direction: counter-clockwise');
      expect(yaml).toContain('thickness: 18');
      expect(yaml).toContain('animate: false');
      expect(yaml).toContain('label_precision: 0');
    } finally {
      await close(ctx);
    }
  });
});
