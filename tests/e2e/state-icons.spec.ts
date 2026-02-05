import { expect, test } from '@playwright/test';
import * as yaml from 'js-yaml';
import { launchWithDSL, close } from '../support';

const TEST_ENTITIES = [
  {
    entity_id: 'light.living_room',
    state: 'on',
    attributes: {
      friendly_name: 'Living Room Light',
      device_class: 'light',
    },
    last_changed: '2026-01-01T00:00:00.000Z',
    last_updated: '2026-01-01T00:00:00.000Z',
    context: { id: '1', parent_id: null, user_id: null },
  },
];

test.describe('State Icons (Feature 3.6)', () => {
  test('maps state icons, updates live, and persists YAML', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const {
      appDSL,
      dashboard,
      palette,
      canvas,
      properties,
      stateIcons,
      entityContext,
      yamlEditor,
      window,
    } = ctx;

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
      await yamlEditor.setEditorContent(
        yaml.dump(initialParsed, { lineWidth: -1, noRefs: true, sortKeys: false }),
        'properties',
        testInfo,
      );
      await properties.switchTab('Form');

      await stateIcons.expectVisible();
      await stateIcons.addMapping();
      await stateIcons.setState(0, 'on');
      await stateIcons.setIcon(0, 'mdi:fire');
      await stateIcons.setMappingColor(0, '#FF6600');

      await stateIcons.setDefaultIcon('mdi:power');
      await stateIcons.setDefaultColor('#00AAFF');

      await stateIcons.expectPreviewState('on');
      await stateIcons.expectPreviewSource('user');

      const buttonIcon = window.getByTestId('button-card-state-icon');
      await expect(buttonIcon).toHaveClass(/mdi-fire/);
      await expect(buttonIcon).toHaveCSS('color', 'rgb(255, 102, 0)');

      await entityContext.patchEntity('light.living_room', { state: 'off' }, testInfo);
      await stateIcons.expectPreviewState('off');
      await stateIcons.expectPreviewSource('user');
      await expect(buttonIcon).toHaveClass(/mdi-power/);
      await expect(buttonIcon).toHaveCSS('color', 'rgb(0, 170, 255)');

      await entityContext.patchEntity('light.living_room', { state: 'party' }, testInfo);
      await stateIcons.expectPreviewState('party');
      await stateIcons.expectPreviewSource('user');
      await expect(buttonIcon).toHaveClass(/mdi-power/);
      await expect(buttonIcon).toHaveCSS('color', 'rgb(0, 170, 255)');

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      const parsed = (yaml.load(value) as Record<string, any>) || {};

      expect(parsed.state_icons).toBeTruthy();
      expect(parsed.state_icons.on.icon).toBe('mdi:fire');
      expect(parsed.state_icons.on.color).toBe('#FF6600');
      expect(parsed.state_icons.default.icon).toBe('mdi:power');
      expect(parsed.state_icons.default.color).toBe('#00AAFF');
    } catch (error) {
      await stateIcons.attachDiagnostics(testInfo);
      throw error;
    } finally {
      await close(ctx);
    }
  });
});
