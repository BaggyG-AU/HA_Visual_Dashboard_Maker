import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const GAUGE_PRO_YAML = `type: custom:gauge-card-pro
entity: sensor.water_tank_level
header: Water Tank
min: 0
max: 100
needle: true
gradient: true
segments:
  - from: 0
    color: "#ff6b6b"
    label: "Low"
  - from: 30
    color: "#ffd166"
    label: "Medium"
  - from: 70
    color: "#6ccf7f"
    label: "High"
value_texts:
  primary_unit: "%"
`;

const BUILTIN_GAUGE_YAML = `type: gauge
entity: sensor.water_tank_level
name: Water Tank Gauge
min: 0
max: 100
unit: "%"
needle: true
severity:
  green: 0
  yellow: 30
  red: 70
`;

test.describe('Gauge Alignment', () => {
  test('renders Gauge Card Pro from upstream-compatible YAML', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, gaugePro, canvas, properties, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await gaugePro.addGaugeCardProCard();
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(GAUGE_PRO_YAML, 'properties');
      await properties.switchTab('Form');

      await gaugePro.verifyGaugeCardProRendered();

      await gaugePro.configureGaugePro({ min: 5, max: 95, unit: 'psi', needle: false, gradient: false });
      await gaugePro.setSegment(0, { from: 5, label: 'Low Band' });

      await properties.switchTab('YAML');
      const yaml = await yamlEditor.getEditorContent();
      expect(yaml).toContain('type: custom:gauge-card-pro');
      expect(yaml).toContain('min: 5');
      expect(yaml).toContain('max: 95');
      expect(yaml).toContain('primary_unit: psi');
      expect(yaml).toContain('needle: false');
      expect(yaml).toContain('gradient: false');
      expect(yaml).toContain('label: Low Band');
    } finally {
      await close(ctx);
    }
  });

  test('preserves built-in gauge workflow with enhanced form controls', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, gaugePro, canvas, properties, yamlEditor } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await gaugePro.addBuiltInGaugeCard();
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(BUILTIN_GAUGE_YAML, 'properties');
      await properties.switchTab('Form');

      await gaugePro.configureBuiltInGauge({ min: 10, max: 90, unit: 'kPa', needle: false });
      await gaugePro.verifyBuiltInGaugeRendered();

      await properties.switchTab('YAML');
      const yaml = await yamlEditor.getEditorContent();
      expect(yaml).toContain('type: gauge');
      expect(yaml).toMatch(/min:\s*'?10'?/);
      expect(yaml).toMatch(/max:\s*'?90'?/);
      expect(yaml).toContain('unit: kPa');
      expect(yaml).toContain('needle: false');
    } finally {
      await close(ctx);
    }
  });
});
