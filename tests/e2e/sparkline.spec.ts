import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BASE_YAML = `type: custom:mini-graph-card
name: Living Room Temperature
entities:
  - sensor.living_room_temperature
hours_to_show: 24
points_per_hour: 2
line_width: 2
height: 96
show:
  fill: false
  extrema: true
  state: true
`;

test.describe('Sparkline Mini-graphs', () => {
  test('renders sparkline from YAML with accessibility and numeric fallback labels', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, sparkline, canvas, properties, yamlEditor, window } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await sparkline.addSparklineCard();
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await sparkline.verifyRendered();
      await expect(window.getByTestId('sparkline-graph')).toHaveAttribute('aria-label', /Current/i);
      await expect(window.getByTestId('sparkline-fallback-labels')).toContainText('Min');
      await expect(window.getByTestId('sparkline-fallback-labels')).toContainText('Max');
      await expect(window.getByTestId('sparkline-fallback-labels')).toContainText('Current');
    } finally {
      await close(ctx);
    }
  });

  test('updates range and style controls and persists YAML', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, sparkline, canvas, properties, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await sparkline.addSparklineCard();
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await sparkline.configure({
        rangeHours: 168,
        style: 'area',
        density: 'compact',
        lineWidth: 3,
        showMinMax: true,
        showCurrent: true,
      });
      await sparkline.verifyRendered();

      await properties.switchTab('YAML');
      const yaml = await yamlEditor.getEditorContent();

      expect(yaml).toContain('type: custom:mini-graph-card');
      expect(yaml).toContain('hours_to_show: 168');
      // Strict: line_width must be a NUMBER, not a quoted string. The old regex
      // (/line_width:\s*'?3'?/) tolerated the `line_width: '3'` string-drift the
      // `<Input type="number">` bug produced. Phase 2 makes the field emit a
      // real number via <InputNumber>.
      expect(yaml).toContain('line_width: 3');
      expect(yaml).not.toMatch(/line_width:\s*'/);
      expect(yaml).toContain('height: 64');
      expect(yaml).toContain('fill: true');
      expect(yaml).toContain('extrema: true');
      expect(yaml).toContain('state: true');
    } finally {
      await close(ctx);
    }
  });
});
