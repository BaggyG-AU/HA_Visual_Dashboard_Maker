import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

const BASE_YAML = `type: custom:slider-button-card
entity: input_number.office_brightness
name: Office Brightness
min: 0
max: 100
step: 5
precision: 0
orientation: horizontal
show_markers: true
show_value: true
commit_on_release: false
animate_fill: true
haptic:
  enabled: true
  pattern: light
`;

test.describe('Advanced Slider', () => {
  test('supports keyboard slider interaction and ARIA semantics', async ({ page }) => {
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
      await advancedSlider.expectAriaValueNow('0');
      await advancedSlider.pressArrowRight(2);
      await advancedSlider.expectAriaValueNow('10');
      await expect(ctx.window.getByTestId('advanced-slider-value')).toContainText('10');
    } finally {
      await close(ctx);
    }
  });

  test('persists slider form settings including haptics in YAML', async ({ page }) => {
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

      await advancedSlider.configure({
        min: 10,
        max: 90,
        step: 10,
        precision: 1,
        orientation: 'vertical',
        showMarkers: false,
        commitOnRelease: true,
        hapticEnabled: true,
      });

      await properties.switchTab('YAML');
      const yaml = await yamlEditor.getEditorContent();
      expect(yaml).toContain('type: custom:slider-button-card');
      expect(yaml).toContain('orientation: vertical');
      expect(yaml).toContain('min: 10');
      expect(yaml).toContain('max: 90');
      expect(yaml).toContain('step: 10');
      expect(yaml).toContain('precision: 1');
      expect(yaml).toContain('show_markers: false');
      expect(yaml).toContain('commit_on_release: true');
      expect(yaml).toContain('haptic:');
      expect(yaml).toContain('enabled: true');
    } finally {
      await close(ctx);
    }
  });
});
