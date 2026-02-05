import { test, expect } from '@playwright/test';
import * as yaml from 'js-yaml';
import { launchWithDSL, close } from '../support';

test.describe('Smart Default Actions (Feature 3.1)', () => {
  test('computes smart defaults per domain and persists smart_defaults to YAML', async ({ page }, testInfo) => {
    test.setTimeout(120000);
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, smartActions } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.expandCategory('Custom');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // Smart defaults are enabled by default for new cards.
      await smartActions.expectPreviewContains('custom-button-card', /Tap action used:/i, testInfo);

      const domainCases: Array<{ entity: string; expected: RegExp }> = [
        { entity: 'switch.kitchen', expected: /\btoggle\b/i },
        { entity: 'light.living_room', expected: /\btoggle\b/i },
        { entity: 'climate.thermostat', expected: /\bmore-info\b/i },
        { entity: 'camera.driveway', expected: /\bmore-info\b/i },
        { entity: 'lock.front_door', expected: /call-service:\s*lock\.unlock/i },
        { entity: 'script.good_morning', expected: /call-service:\s*script\.turn_on/i },
        { entity: 'vacuum.roomba', expected: /call-service:\s*vacuum\.start/i },
      ];

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value: baseYaml } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      const yamlState = (yaml.load(baseYaml) as Record<string, unknown>) || {};

      for (const { entity, expected } of domainCases) {
        yamlState.entity = entity;
        yamlState.smart_defaults = true;
        const next = yaml.dump(yamlState, { lineWidth: -1, noRefs: true, sortKeys: false });
        await yamlEditor.setEditorContent(next, 'properties', testInfo);

        await properties.switchTab('Form');
        await smartActions.expectPreviewContains('custom-button-card', expected, testInfo);
        await smartActions.expectPreviewContains('custom-button-card', /\(smart default\)/i, testInfo);
        await properties.switchTab('YAML');
      }

      // Toggle off and confirm YAML persists the setting.
      await properties.switchTab('Form');
      await smartActions.setEnabled('custom-button-card', false, testInfo);

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value: yamlAfterToggle } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      expect(yamlAfterToggle.toLowerCase()).toContain('smart_defaults');

      // User-defined tap_action should take precedence.
      const parsed = (yaml.load(yamlAfterToggle) as Record<string, unknown>) || {};
      parsed.entity = 'switch.kitchen';
      parsed.smart_defaults = true;
      parsed.tap_action = { action: 'more-info' };
      const overrideYaml = yaml.dump(parsed, { lineWidth: -1, noRefs: true, sortKeys: false });
      await yamlEditor.setEditorContent(overrideYaml, 'properties', testInfo);

      await properties.switchTab('Form');
      await smartActions.expectPreviewContains('custom-button-card', /\bmore-info\b/i, testInfo);
      await smartActions.expectPreviewContains('custom-button-card', /\(user-defined\)/i, testInfo);

      // Persist across selection changes (state held in dashboard store).
      await canvas.deselectCard();
      await canvas.selectCard(0);
      await properties.expectVisible();
      await smartActions.expectPreviewContains('custom-button-card', /\bmore-info\b/i, testInfo);
      await smartActions.expectPreviewContains('custom-button-card', /\(user-defined\)/i, testInfo);
    } finally {
      await close(ctx);
    }
  });
});
