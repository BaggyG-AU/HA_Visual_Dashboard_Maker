import { expect, test } from '@playwright/test';
import * as yaml from 'js-yaml';
import { launchWithDSL, close } from '../support';
import { attachDebugJson } from '../support/helpers/debug';

const TEST_ENTITIES = [
  {
    entity_id: 'light.living_room',
    state: 'on',
    attributes: { friendly_name: 'Living Room Light', brightness: 180 },
    last_changed: '2026-01-01T00:00:00.000Z',
    last_updated: '2026-01-01T00:00:00.000Z',
    context: { id: '1', parent_id: null, user_id: null },
  },
  {
    entity_id: 'input_boolean.show_controls',
    state: 'off',
    attributes: { friendly_name: 'Show Controls' },
    last_changed: '2026-01-01T00:00:00.000Z',
    last_updated: '2026-01-01T00:00:00.000Z',
    context: { id: '2', parent_id: null, user_id: null },
  },
];

test.describe('Conditional Visibility (Feature 3.5)', () => {
  test('applies state-based visibility, updates live, and persists YAML', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, entityContext, conditionalVisibility } = ctx;

    try {
      await appDSL.waitUntilReady();
      await appDSL.setConnected(true);
      await entityContext.setEntities(TEST_ENTITIES, testInfo);

      await dashboard.createNew();
      await palette.expandCategory('Controls');
      await palette.addCard('button');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();
      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value: initialYaml } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      const initialParsed = (yaml.load(initialYaml) as Record<string, unknown>) || {};
      initialParsed.entity = 'light.living_room';
      await yamlEditor.setEditorContent(yaml.dump(initialParsed, { lineWidth: -1, noRefs: true, sortKeys: false }), 'properties', testInfo);
      await properties.switchTab('Form');

      await conditionalVisibility.expectControlsVisible();
      await conditionalVisibility.addRootCondition();
      await conditionalVisibility.setRule(
        '0',
        {
          type: 'State equals',
          entity: 'input_boolean.show_controls',
          value: 'on',
        },
        testInfo,
      );

      await conditionalVisibility.expectPreviewState('Hidden');
      await conditionalVisibility.expectCardHidden(0);

      await entityContext.patchEntity('input_boolean.show_controls', { state: 'on' }, testInfo);
      await conditionalVisibility.expectPreviewState('Visible');
      await conditionalVisibility.expectCardVisible(0);

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value: yamlContent } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      const parsed = (yaml.load(yamlContent) as Record<string, unknown>) || {};

      await attachDebugJson(testInfo, 'conditional-visibility-yaml.json', parsed);

      const conditions = parsed.visibility_conditions as Array<Record<string, unknown>>;
      expect(Array.isArray(conditions)).toBe(true);
      expect(conditions[0]?.condition).toBe('state_equals');
      expect(conditions[0]?.entity).toBe('input_boolean.show_controls');
      expect(conditions[0]?.value).toBe('on');
    } finally {
      await close(ctx);
    }
  });
});
