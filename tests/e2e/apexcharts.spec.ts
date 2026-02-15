import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BASE_YAML = `type: custom:apexcharts-card
graph_span: 24h
update_interval: 30s
header:
  title: Living Room Trends
  show: true
series:
  - entity: sensor.living_room_temperature
    name: Temperature
    type: line
    color: '#00d9ff'
apex_config:
  chart:
    type: line
    height: 280
  stroke:
    width: 2
    curve: smooth
  markers:
    size: 4
`;

test.describe('ApexCharts Advanced Integration', () => {
  test('configures apex chart from form and preserves advanced YAML pass-through', async ({ page }) => {
    // This flow performs multiple YAML↔Form round-trips and AntD select interactions in Electron.
    // Keep a realistic timeout headroom to avoid false negatives under Medium/Slow gate load.
    test.setTimeout(90_000);
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

      await apexCharts.configureApexChart({
        graphSpan: '7d',
        updateInterval: '1m',
        chartType: 'area',
        headerTitle: 'Daily Living Room Trends',
        strokeCurve: 'straight',
        chartHeight: 320,
        strokeWidth: 3,
      });
      await apexCharts.configureFirstSeries({
        name: 'Temperature Daily',
        color: '#4fa3ff',
      });

      await apexCharts.verifyApexRendered();

      await properties.switchTab('YAML');
      const yaml = await yamlEditor.getEditorContent();
      expect(yaml).toContain('type: custom:apexcharts-card');
      expect(yaml).toContain('graph_span: 7d');
      expect(yaml).toContain('update_interval: 1m');
      expect(yaml).toContain('title: Daily Living Room Trends');
      expect(yaml).toContain('type: area');
      expect(yaml).toContain('height: 320');
      expect(yaml).toContain('curve: straight');
      expect(yaml).toContain('markers:');
      expect(yaml).toContain('size: 4');
    } finally {
      await close(ctx);
    }
  });

  test('shows warning guardrail for malformed apex card config', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, apexCharts, canvas, properties, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await apexCharts.addApexChartsCard();
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(
        `type: custom:apexcharts-card
graph_span: invalid
series: []
apex_config:
  chart:
    type: radialBar
`,
        'properties',
      );
      await properties.switchTab('Form');

      await apexCharts.expectWarningVisible();
    } finally {
      await close(ctx);
    }
  });
});
