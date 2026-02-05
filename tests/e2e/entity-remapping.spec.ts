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
      await entityRemapping.apply();

      // Capture debug state immediately after Apply click
      const debugAfterApply = await ctx.window.evaluate(() => {
        const testWindow = window as Window & { __remapDebug?: unknown };
        return {
          remapDebug: testWindow.__remapDebug ?? null,
          modalCount: document.querySelectorAll('[data-testid="entity-remapping-modal"]').length,
          debugState: (document.querySelector('[data-testid="remap-debug-state"]') as HTMLElement | null)?.dataset ?? null,
        };
      });
      await testInfo.attach('debug-after-apply.json', {
        body: JSON.stringify(debugAfterApply, null, 2),
        contentType: 'application/json',
      });

      const modal = ctx.window.getByTestId('entity-remapping-modal');
      await expect.poll(async () => (await modal.count()) === 0, { timeout: 5000 }).toBe(true);
      if (await modal.count()) {
        const diag = await ctx.window.evaluate(() => {
          const testWindow = window as Window & { __remapDebug?: unknown };
          const state = document.querySelector('[data-testid="remap-debug-state"]') as HTMLElement | null;
          const root = document.querySelector('[data-testid="entity-remapping-modal"]') as HTMLElement | null;
          const wrap = document.querySelector('.ant-modal-wrap') as HTMLElement | null;
          return {
            remapDebug: testWindow.__remapDebug ?? null,
            stateDataset: state ? { ...state.dataset } : null,
            modalAttrs: root
              ? {
                  ariaHidden: root.getAttribute('aria-hidden'),
                  dataHasConfig: root.getAttribute('data-has-config'),
                  dataMappingCount: root.getAttribute('data-mapping-count'),
                }
              : null,
            rootStyle: root
              ? { display: root.style.display, visibility: root.style.visibility, classes: root.className }
              : null,
            wrapStyle: wrap
              ? { display: wrap.style.display, visibility: wrap.style.visibility, classes: wrap.className }
              : null,
          };
        });
        await testInfo.attach('remap-modal-not-closed.json', {
          body: JSON.stringify(diag, null, 2),
          contentType: 'application/json',
        });
      }
      await properties.switchTab('YAML');
      const yamlProbe = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      await testInfo.attach('remap-yaml-after-apply.json', {
        body: JSON.stringify({ value: yamlProbe.value }, null, 2),
        contentType: 'application/json',
      });
      await expect
        .poll(async () => {
          return await yamlEditor.anyYamlContains(/light\.missing_lamp_local/);
        }, { timeout: 8000 })
        .toBe(true);
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value: after } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      const updated = yaml.load(after) as Record<string, any>;
      expect(updated.entity).toBe('light.missing_lamp_local');
    } finally {
      await close(ctx);
    }
  });
});
