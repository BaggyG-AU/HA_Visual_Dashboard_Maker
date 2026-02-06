import { test } from '@playwright/test';
import * as yaml from 'js-yaml';
import { launchWithDSL, close } from '../support';

const TEST_ENTITIES = [
  {
    entity_id: 'light.living_room',
    state: 'on',
    attributes: {
      friendly_name: 'Living Room Light',
      battery: 97.4,
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    context: { id: 'test1', parent_id: null, user_id: null },
  },
  {
    entity_id: 'light.bedroom',
    state: 'off',
    attributes: {
      friendly_name: 'Bedroom Light',
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    context: { id: 'test2', parent_id: null, user_id: null },
  },
  {
    entity_id: 'sensor.temperature',
    state: '22.56',
    attributes: {
      friendly_name: 'Temperature',
      unit_of_measurement: 'C',
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    context: { id: 'test3', parent_id: null, user_id: null },
  },
];

test.describe('Entity Context Variables (Feature 3.2)', () => {
  test('resolves context variables in text fields and updates on state changes', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, entityContext } = ctx;

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

      await properties.setCardName('[[entity.friendly_name]]: [[entity.state|upper]]');

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value: buttonYaml } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      const parsedButton = (yaml.load(buttonYaml) as Record<string, unknown>) || {};
      parsedButton.entity = 'light.living_room';
      parsedButton.name = '[[entity.friendly_name]]: [[entity.state|upper]]';
      const nextButton = yaml.dump(parsedButton, { lineWidth: -1, noRefs: true, sortKeys: false });
      await yamlEditor.setEditorContent(nextButton, 'properties', testInfo);
      await properties.switchTab('Form');

      await entityContext.expectPreviewValue('name', 'Living Room Light: ON', testInfo);
      await entityContext.expectButtonCardName('Living Room Light: ON');

      await entityContext.patchEntity('light.living_room', { state: 'off' }, testInfo);
      await entityContext.expectPreviewValue('name', 'Living Room Light: OFF', testInfo);
      await entityContext.expectButtonCardName('Living Room Light: OFF');

      await properties.setCardName('Battery [[entity.attributes.battery|round(0)]]% ([[entity.attributes.missing|default("n/a")]])');
      await entityContext.expectPreviewValue('name', 'Battery 97% (n/a)', testInfo);
      await entityContext.expectButtonCardName('Battery 97% (n/a)');

      await palette.addCard('markdown');
      await canvas.expectCardCount(2);
      await canvas.selectCard(1);
      await properties.expectVisible();

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value: yamlBefore } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      const parsed = (yaml.load(yamlBefore) as Record<string, unknown>) || {};
      parsed.content = 'Room: [[light.living_room.state]] | [[light.bedroom.state]]';
      parsed.title = 'Status';
      const next = yaml.dump(parsed, { lineWidth: -1, noRefs: true, sortKeys: false });
      await yamlEditor.setEditorContent(next, 'properties', testInfo);

      await properties.switchTab('Form');
      await entityContext.expectMarkdownPreview('Room: off | off');

      await entityContext.patchEntity('light.bedroom', { state: 'on' }, testInfo);
      await entityContext.expectMarkdownPreview('Room: off | on');
    } finally {
      await close(ctx);
    }
  });
});
