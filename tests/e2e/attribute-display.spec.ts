import { test, expect } from '@playwright/test';
import * as yaml from 'js-yaml';
import { launchWithDSL, close, seedEntityCache } from '../support';

const TEST_ENTITIES = [
  {
    entity_id: 'sensor.environment',
    state: '22.5',
    attributes: {
      friendly_name: 'Environment Sensor',
      battery: 97.4,
      is_online: true,
      last_seen: '2025-01-01T12:30:00.000Z',
      unit_of_measurement: 'C',
    },
    last_changed: '2025-01-01T12:30:00.000Z',
    last_updated: '2025-01-01T12:30:00.000Z',
    context: { id: 'test1', parent_id: null, user_id: null },
  },
];

test.describe('Entity Attribute Display (Feature 3.4)', () => {
  test('sets entity via YAML and shows attribute controls', async ({ page }, testInfo) => {
    // This test performs multiple sequential UI operations (Electron launch, YAML round-trip,
    // Ant Design multi-select interactions). On slower environments this can exceed 60s.
    test.setTimeout(100_000);

    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, entityContext, attributeDisplay } = ctx;

    try {
      await appDSL.waitUntilReady();
      await appDSL.setConnected(true);
      await entityContext.setEntities(TEST_ENTITIES, testInfo);
      await seedEntityCache(ctx.window, [
        {
          entity_id: 'sensor.environment',
          domain: 'sensor',
          state: '22.5',
          attributes: {
            friendly_name: 'Environment Sensor',
            battery: 97.4,
            is_online: true,
            last_seen: '2025-01-01T12:30:00.000Z',
            unit_of_measurement: 'C',
          },
        },
      ]);

      await dashboard.createNew();
      await palette.expandCategory('Controls');
      await palette.addCard('button');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value: entityYaml } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      const parsedEntity = (yaml.load(entityYaml) as Record<string, unknown>) || {};
      parsedEntity.entity = 'sensor.environment';
      const nextEntityYaml = yaml.dump(parsedEntity, { lineWidth: -1, noRefs: true, sortKeys: false });
      await yamlEditor.setEditorContent(nextEntityYaml, 'properties', testInfo);
      await properties.switchTab('Form');

      await attributeDisplay.selectAttributes(['battery', 'is_online', 'last_seen'], testInfo);
      await attributeDisplay.expectPreview('battery', /97\.4/);
      await attributeDisplay.expectPreview('is_online', /On|True|true/);
      await attributeDisplay.expectPreview('last_seen', /\d/);
    } finally {
      await close(ctx);
    }
  });

  test.describe('Attribute display workflow', () => {
    test.describe.configure({ timeout: 120000 });

    test('formats, reorders, persists, and updates attribute display', async ({ page }, testInfo) => {
      // This workflow adds multiple attributes, changes formats, reorders rows, and verifies YAML.
      // On slower environments this can exceed 120s.
      test.setTimeout(180_000);

      void page;
      const ctx = await launchWithDSL();
      const { appDSL, dashboard, palette, canvas, properties, yamlEditor, entityContext, attributeDisplay } = ctx;

      try {
        await appDSL.waitUntilReady();
        await appDSL.setConnected(true);
        await entityContext.setEntities(TEST_ENTITIES, testInfo);
        await seedEntityCache(ctx.window, [
          {
            entity_id: 'sensor.environment',
            domain: 'sensor',
            state: '22.5',
            attributes: {
              friendly_name: 'Environment Sensor',
              battery: 97.4,
              is_online: true,
              last_seen: '2025-01-01T12:30:00.000Z',
              unit_of_measurement: 'C',
            },
          },
        ]);

        await dashboard.createNew();
        await palette.expandCategory('Controls');
        await palette.addCard('button');
        await canvas.expectCardCount(1);
        await canvas.selectCard(0);
        await properties.expectVisible();

        await properties.switchTab('YAML');
        await yamlEditor.expectMonacoVisible('properties', testInfo);
        const { value: entityYaml } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
        const parsedEntity = (yaml.load(entityYaml) as Record<string, unknown>) || {};
        parsedEntity.entity = 'sensor.environment';
        const nextEntityYaml = yaml.dump(parsedEntity, { lineWidth: -1, noRefs: true, sortKeys: false });
        await yamlEditor.setEditorContent(nextEntityYaml, 'properties', testInfo);
        await properties.switchTab('Form');

        await attributeDisplay.selectAttributes(['battery', 'is_online', 'last_seen'], testInfo);
        await attributeDisplay.setLayout('table');
        await attributeDisplay.setNumberFormat('battery', 0, '%', testInfo);
        await attributeDisplay.setBooleanFormat('is_online', 'Online', 'Offline');
        await attributeDisplay.setTimestampFormat('last_seen', 'absolute');

        await attributeDisplay.expectPreview('battery', '97 %');
        await attributeDisplay.expectPreview('is_online', 'Online');
        await attributeDisplay.expectPreview('last_seen', '2025');

        await attributeDisplay.reorderAttribute('last_seen', 'battery');

        await attributeDisplay.expectRenderedAttribute('battery', '97 %');
        await attributeDisplay.expectRenderedAttribute('is_online', 'Online');
        await attributeDisplay.expectRenderedAttribute('last_seen', '2025');

        await attributeDisplay.expectLayoutVisible('table');
        await attributeDisplay.expectLayoutScreenshot('table', 'attribute-display-table.png');

        await entityContext.patchEntity('sensor.environment', { attributes: { battery: 55.2 } }, testInfo);
        await attributeDisplay.expectRenderedAttribute('battery', '55 %');

        await properties.switchTab('YAML');
        await yamlEditor.expectMonacoVisible('properties', testInfo);
        const { value: buttonYaml } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
        const parsed = (yaml.load(buttonYaml) as Record<string, unknown>) || {};
        expect(parsed.attribute_display_layout).toBe('table');
        const attributeDisplayConfig = parsed.attribute_display as Array<Record<string, unknown>>;
        expect(Array.isArray(attributeDisplayConfig)).toBe(true);
        expect(attributeDisplayConfig[0]?.attribute).toBe('last_seen');
        expect(attributeDisplayConfig[1]?.attribute).toBe('battery');
      } finally {
        await close(ctx);
      }
    });
  });
});
