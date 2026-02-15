import { test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BASE_YAML = `type: custom:mini-graph-card
name: Sparkline Preview
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

test.describe('Sparkline Visual Regression', () => {
  test('captures line and area compact sparkline snapshots', async ({ page }) => {
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

      await sparkline.configure({ style: 'line', density: 'regular', showMinMax: true, showCurrent: true });
      await sparkline.verifyRendered();
      await sparkline.expectSparklineScreenshot('sparkline-line-regular.png');

      await sparkline.configure({ style: 'area', density: 'compact', showMinMax: true, showCurrent: true });
      await sparkline.verifyRendered();
      await sparkline.expectSparklineScreenshot('sparkline-area-compact.png');
    } finally {
      await close(ctx);
    }
  });
});
