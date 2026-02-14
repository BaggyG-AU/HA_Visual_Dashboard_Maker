import { test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BASE_YAML = `type: custom:native-graph-card
chart_type: line
time_range: 24h
refresh_interval: 30s
x_axis:
  mode: time
y_axis:
  min: auto
  max: auto
zoom_pan: true
series:
  - entity: sensor.living_room_temperature
    label: Temperature
    color: '#4fa3ff'
    axis: left
  - entity: sensor.living_room_humidity
    label: Humidity
    color: '#6ccf7f'
    axis: right
`;

test.describe('Native Graphs Visual Regression', () => {
  test('captures line, bar, area, and pie snapshots', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, graphs, canvas, properties, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await graphs.addGraphCard('custom:native-graph-card');
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await graphs.configureGraph({ chartType: 'line' });
      await graphs.expectNoRendererFallback();
      await graphs.expectGraphScreenshot('native-graph-line.png');

      await graphs.configureGraph({ chartType: 'bar' });
      await graphs.expectNoRendererFallback();
      await graphs.expectGraphScreenshot('native-graph-bar.png');

      await graphs.configureGraph({ chartType: 'area' });
      await graphs.expectNoRendererFallback();
      await graphs.expectGraphScreenshot('native-graph-area.png');

      await graphs.configureGraph({ chartType: 'pie' });
      await graphs.expectNoRendererFallback();
      await graphs.expectGraphScreenshot('native-graph-pie.png');
    } finally {
      await close(ctx);
    }
  });
});
