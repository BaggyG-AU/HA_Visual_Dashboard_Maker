import { test, expect } from '@playwright/test';
import * as yaml from 'js-yaml';
import { launchWithDSL, close } from '../support';

const AVAILABLE_ENTITIES = [
  {
    entity_id: 'light.missing_lamp_local',
    state: 'on',
    attributes: { friendly_name: 'Missing Lamp Local' },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    context: { id: 'a', parent_id: null, user_id: null },
  },
  {
    entity_id: 'switch.kitchen',
    state: 'off',
    attributes: { friendly_name: 'Kitchen Switch' },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    context: { id: 'b', parent_id: null, user_id: null },
  },
];

test.describe('Entity Remapping (Feature 3.3)', () => {
  test('auto-maps missing entities and updates YAML', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, entityContext, entityRemapping } = ctx;

    try {
      await appDSL.waitUntilReady();
      await appDSL.setConnected(true);
      await entityContext.setEntities(AVAILABLE_ENTITIES, testInfo);

      await dashboard.createNew();
      await palette.expandCategory('Controls');
      await palette.addCard('button');
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);

      const { value } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      const parsed = (yaml.load(value) as Record<string, unknown>) || {};
      parsed.entity = 'light.missing_lamp';
      const next = yaml.dump(parsed, { lineWidth: -1, noRefs: true, sortKeys: false });
      await yamlEditor.setEditorContent(next, 'properties', testInfo);
      await properties.switchTab('Form');

      await entityRemapping.openManual();
      await entityRemapping.expectModalVisible(testInfo);
      await entityRemapping.autoMapAll();
      await entityRemapping.apply(testInfo);

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value: after } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      const updated = yaml.load(after) as Record<string, any>;
      expect(updated.entity).toBe('light.missing_lamp_local');
    } finally {
      await close(ctx);
    }
  });
});
