import { expect, test } from '@playwright/test';
import { launchWithDSL, close } from '../support';

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

test.describe('Native Graphs', () => {
  test('adds graph card and renders from YAML', async ({ page }) => {
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

      await graphs.verifyGraphRendered();
      await graphs.verifyGraphData(2);
    } finally {
      await close(ctx);
    }
  });

  test('updates chart mode and refresh settings from form and persists to yaml', async ({ page }) => {
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

      await graphs.configureGraph({ chartType: 'area', timeRange: '7d', refreshInterval: '1m', zoomPan: true });
      await graphs.verifyGraphRendered();

      await properties.switchTab('YAML');
      const yaml = await yamlEditor.getEditorContent();
      expect(yaml).toContain('type: custom:native-graph-card');
      expect(yaml).toContain('chart_type: area');
      expect(yaml).toContain('time_range: 7d');
      expect(yaml).toContain('refresh_interval: 1m');
      expect(yaml).toContain('zoom_pan: true');
    } finally {
      await close(ctx);
    }
  });
});
