import { expect, test, type TestInfo } from '@playwright/test';
import * as yaml from 'js-yaml';
import { close, launchWithDSL, seedEntityCache } from '../support';

const TEST_ENTITIES = [
  {
    entity_id: 'light.alpha',
    state: 'on',
    attributes: { friendly_name: 'Alpha Light' },
    last_changed: '2026-02-05T00:00:00.000Z',
    last_updated: '2026-02-05T00:00:00.000Z',
    context: { id: '1', parent_id: null, user_id: null },
  },
  {
    entity_id: 'switch.beta',
    state: 'off',
    attributes: { friendly_name: 'Beta Switch' },
    last_changed: '2026-02-05T00:00:00.000Z',
    last_updated: '2026-02-05T00:00:00.000Z',
    context: { id: '2', parent_id: null, user_id: null },
  },
  {
    entity_id: 'light.gamma',
    state: 'on',
    attributes: { friendly_name: 'Gamma Light' },
    last_changed: '2026-02-05T00:00:00.000Z',
    last_updated: '2026-02-05T00:00:00.000Z',
    context: { id: '3', parent_id: null, user_id: null },
  },
];

test.describe('Multi-entity Support (Feature 3.7)', () => {
  test.describe.configure({ timeout: 90000 });

  async function reopenPropertiesYamlContext(
    canvas: { selectCard: (index: number) => Promise<void> },
    properties: {
      expectVisible: (timeout?: number) => Promise<void>;
      switchTab: (tab: 'Form' | 'Advanced Options' | 'YAML') => Promise<void>;
      expectActiveTab: (tab: 'Form' | 'Advanced Options' | 'YAML') => Promise<void>;
    },
    yamlEditor: { expectMonacoVisible: (scope?: 'properties' | 'modal' | 'canvas', testInfo?: TestInfo) => Promise<void> },
    testInfo: TestInfo,
  ): Promise<void> {
    const openYaml = async () => {
      await canvas.selectCard(0);
      await properties.expectVisible(5000);
      await properties.switchTab('Form');
      await properties.switchTab('YAML');
      await properties.expectActiveTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
    };

    try {
      await openYaml();
    } catch {
      // Recover from transient tab/content desync by re-seating selection once.
      await canvas.selectCard(0);
      await properties.expectVisible(5000);
      await properties.switchTab('YAML');
      await properties.expectActiveTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
    }
  }

  test('supports add, reorder, aggregate mode, and realtime aggregate updates', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const {
      appDSL,
      dashboard,
      palette,
      canvas,
      properties,
      yamlEditor,
      entityContext,
      multiEntity,
      window,
    } = ctx;

    try {
      await appDSL.waitUntilReady();
      await appDSL.setConnected(true);
      await entityContext.setEntities(TEST_ENTITIES, testInfo);
      await seedEntityCache(window, TEST_ENTITIES.map((entity) => ({
        entity_id: entity.entity_id,
        state: entity.state,
        attributes: entity.attributes,
      })));

      await dashboard.createNew();
      await palette.expandCategory('Controls');
      await palette.addCard('button');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);

      await properties.expectVisible();
      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value: initialYaml } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      const parsed = (yaml.load(initialYaml) as Record<string, unknown>) || {};
      parsed.entities = ['light.alpha', 'switch.beta', 'light.gamma'];
      parsed.entity = 'light.alpha';
      parsed.multi_entity_mode = 'aggregate';
      parsed.aggregate_function = 'count_on';
      await yamlEditor.setEditorContent(
        yaml.dump(parsed, { lineWidth: -1, noRefs: true, sortKeys: false }),
        'properties',
        testInfo,
      );
      await canvas.selectCard(0);
      await properties.expectVisible();
      await properties.switchTab('Form');

      await multiEntity.expectVisible();

      await multiEntity.reorderDown('light.alpha');
      await multiEntity.expectOrder(['switch.beta', 'light.alpha', 'light.gamma']);

      await multiEntity.setMode('aggregate');
      await multiEntity.setAggregateFunction('count_on');
      await multiEntity.expectAggregateIndicator('2/3 on');

      await entityContext.patchEntity('switch.beta', { state: 'on' }, testInfo);
      await multiEntity.expectAggregateIndicator('3/3 on');
    } catch (error) {
      await multiEntity.attachDiagnostics(testInfo);
      throw error;
    } finally {
      await close(ctx);
    }
  });

  test('supports batch mode confirmation and YAML persistence via seeded config', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const {
      appDSL,
      dashboard,
      palette,
      canvas,
      properties,
      yamlEditor,
      entityContext,
      multiEntity,
      window,
    } = ctx;

    try {
      await appDSL.waitUntilReady();
      await appDSL.setConnected(true);
      await entityContext.setEntities(TEST_ENTITIES, testInfo);
      await seedEntityCache(window, TEST_ENTITIES.map((entity) => ({
        entity_id: entity.entity_id,
        state: entity.state,
        attributes: entity.attributes,
      })));

      await dashboard.createNew();
      await palette.expandCategory('Controls');
      await palette.addCard('button');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);

      await properties.expectVisible();
      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value: initialYaml } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      const parsed = (yaml.load(initialYaml) as Record<string, unknown>) || {};
      parsed.entities = ['switch.beta', 'light.alpha', 'light.gamma'];
      parsed.entity = 'switch.beta';
      parsed.multi_entity_mode = 'batch';
      parsed.aggregate_function = 'count_on';
      parsed.batch_actions = ['turn_on', 'turn_off', 'toggle'];
      await yamlEditor.setEditorContent(
        yaml.dump(parsed, { lineWidth: -1, noRefs: true, sortKeys: false }),
        'properties',
        testInfo,
      );
      await canvas.selectCard(0);
      await properties.expectVisible();
      await properties.switchTab('Form');

      await multiEntity.expectVisible();
      await multiEntity.runBatchAction('turn_off', false);
      await multiEntity.runBatchAction('turn_off', true);
      await expect(window.getByTestId('multi-entity-batch-panel')).toBeVisible();

      await reopenPropertiesYamlContext(canvas, properties, yamlEditor, testInfo);
      const { value: finalYaml } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      const finalParsed = (yaml.load(finalYaml) as Record<string, unknown>) || {};

      expect(finalParsed.entities).toEqual(['switch.beta', 'light.alpha', 'light.gamma']);
      expect(finalParsed.multi_entity_mode).toBe('batch');
      expect(finalParsed.aggregate_function).toBe('count_on');
      expect(finalParsed.batch_actions).toEqual(['turn_on', 'turn_off', 'toggle']);

      await testInfo.attach('multi-entity-yaml.json', {
        body: JSON.stringify(finalParsed, null, 2),
        contentType: 'application/json',
      });
    } catch (error) {
      await multiEntity.attachDiagnostics(testInfo);
      throw error;
    } finally {
      await close(ctx);
    }
  });
});
