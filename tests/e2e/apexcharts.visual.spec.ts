import { test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BASE_YAML = `type: custom:apexcharts-card
graph_span: 24h
update_interval: 30s
header:
  title: Visual Apex
  show: true
series:
  - entity: sensor.living_room_temperature
    name: Temperature
    type: line
    color: '#00d9ff'
  - entity: sensor.living_room_humidity
    name: Humidity
    type: area
    color: '#6ccf7f'
apex_config:
  chart:
    type: line
    height: 280
`;

test.describe('ApexCharts Visual Regression', () => {
  test('captures line, area, and bar preview snapshots', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, apexCharts, canvas, properties, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await apexCharts.addApexChartsCard();
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BASE_YAML, 'properties');
      await properties.switchTab('Form');

      await apexCharts.configureApexChart({ chartType: 'line' });
      await apexCharts.expectApexScreenshot('apexcharts-line.png');

      await apexCharts.configureApexChart({ chartType: 'area' });
      await apexCharts.expectApexScreenshot('apexcharts-area.png');

      await apexCharts.configureApexChart({ chartType: 'bar' });
      await apexCharts.expectApexScreenshot('apexcharts-bar.png');
    } finally {
      await close(ctx);
    }
  });
});
