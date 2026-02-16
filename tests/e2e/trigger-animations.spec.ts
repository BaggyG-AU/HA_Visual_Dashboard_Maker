import { expect, test } from '@playwright/test';
import * as yaml from 'js-yaml';
import { close, launchWithDSL } from '../support';

const TEST_ENTITIES = [
  {
    entity_id: 'light.kitchen',
    state: 'off',
    attributes: { friendly_name: 'Kitchen Light' },
    last_changed: '2026-01-01T00:00:00.000Z',
    last_updated: '2026-01-01T00:00:00.000Z',
    context: { id: '1', parent_id: null, user_id: null },
  },
];

test.describe('Trigger Animations (Slice F)', () => {
  test('configures action trigger animation in properties and persists deterministic YAML', async ({ page }) => {
    // This flow includes Electron launch, YAML round-trips, and multiple AntD select interactions.
    // Per testing standards, use an explicit timeout for legitimately long end-to-end flows.
    test.setTimeout(90_000);
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, entityContext, window } = ctx;

    try {
      await appDSL.waitUntilReady();
      await appDSL.setConnected(true);
      await entityContext.setEntities(TEST_ENTITIES);

      await dashboard.createNew();
      await palette.expandCategory('Controls');
      await palette.addCard('button');
      await canvas.selectCard(0);
      await properties.expectVisible();
      await properties.switchTab('YAML');
      const yamlBefore = await yamlEditor.getEditorContent('properties');
      const parsedBefore = (yaml.load(yamlBefore) as Record<string, unknown>) || {};
      parsedBefore.entity = 'light.kitchen';
      parsedBefore.trigger_animations = [
        {
          id: 'trigger-animation-1',
          trigger: 'action',
          target: 'light.kitchen',
          animation: 'shake',
          duration_ms: 1200,
          iterations: 1,
          easing: 'ease-out',
        },
      ];
      await yamlEditor.setEditorContent(
        yaml.dump(parsedBefore, { lineWidth: -1, noRefs: true, sortKeys: false }),
        'properties',
      );
      await properties.switchTab('Form');

      await expect(window.getByTestId('trigger-animation-controls')).toBeVisible();
      await expect(window.getByTestId('trigger-animation-row-0')).toBeVisible();

      await properties.switchTab('YAML');
      const yamlText = await yamlEditor.getEditorContent('properties');
      const parsed = (yaml.load(yamlText) as Record<string, unknown>) || {};
      const triggerAnimations = parsed.trigger_animations as Array<Record<string, unknown>>;

      expect(Array.isArray(triggerAnimations)).toBe(true);
      expect(triggerAnimations[0]?.trigger).toBe('action');
      expect(triggerAnimations[0]?.target).toBe('light.kitchen');
      expect(triggerAnimations[0]?.animation).toBe('shake');
      expect(triggerAnimations[0]?.duration_ms).toBe(1200);
      expect(triggerAnimations[0]?.iterations).toBe(1);
    } finally {
      await close(ctx);
    }
  });
});
