import { test, expect } from '@playwright/test';
import * as yaml from 'js-yaml';
import { launchWithDSL, close, seedEntityRegistry } from '../support';

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
    const {
      appDSL,
      dashboard,
      palette,
      canvas,
      properties,
      yamlEditor,
      entityContext,
      entityRemapping,
    } = ctx;

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
          debugState:
            (document.querySelector('[data-testid="remap-debug-state"]') as HTMLElement | null)
              ?.dataset ?? null,
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
          const state = document.querySelector(
            '[data-testid="remap-debug-state"]',
          ) as HTMLElement | null;
          const root = document.querySelector(
            '[data-testid="entity-remapping-modal"]',
          ) as HTMLElement | null;
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
              ? {
                  display: root.style.display,
                  visibility: root.style.visibility,
                  classes: root.className,
                }
              : null,
            wrapStyle: wrap
              ? {
                  display: wrap.style.display,
                  visibility: wrap.style.visibility,
                  classes: wrap.className,
                }
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
        .poll(
          async () => {
            return await yamlEditor.anyYamlContains(/light\.missing_lamp_local/);
          },
          { timeout: 8000 },
        )
        .toBe(true);
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value: after } = await yamlEditor.getEditorContentWithDiagnostics(
        testInfo,
        'properties',
      );
      const updated = yaml.load(after) as Record<string, any>;
      expect(updated.entity).toBe('light.missing_lamp_local');
    } finally {
      await close(ctx);
    }
  });

  /**
   * HA-04 (UAT round 2, Medium). Owner: "Not enough information to be able to map
   * the missing entities. It would be helpful have the integration that the
   * entity belongs to so I could find the mapping. Auto-map doesn't work".
   *
   * ⭐ MEASURED FIRST, AND THE OBVIOUS READING WAS WRONG. Run against the
   * reference instance's real 725 entities, the matcher is CORRECT: a genuinely
   * renamed entity (`sensor.sigen_plant_battery_state_of_charge_old`) scores its
   * true counterpart at 100% and auto-maps it. What it returns nothing for is
   * `light.does_not_exist_uat` — HA-04 step 1's OWN worked example — because that
   * name is built to resemble nothing, and the reference instance has no `light`
   * domain at all, so even the domain component of the score is unavailable.
   *
   * So the defect is not the matching. It is that the button never reported an
   * outcome, and that the effect on mount already runs the SAME call with the
   * SAME arguments — meaning in the ordinary case pressing it cannot change
   * anything, and it silently changed nothing. A control that cannot report its
   * own outcome is indistinguishable from a dead one.
   *
   * ⚠ Why the cited coverage could not see it: `entity-remapping.spec.ts` above
   * and `tests/unit/entityRemapping.spec.ts` both assert that auto-map DOES map
   * — they only ever drive the success path, where the button appears to work
   * because the YAML changes. Neither has a case where auto-map matches nothing,
   * which is the only case in which the silence is visible.
   */
  test('auto-map says what it did when nothing scores high enough', async ({ page }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, entityContext } = ctx;
    const { window } = ctx;

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

      // HA-04 step 1's own example: a name designed to resemble nothing, in a
      // domain no fixture entity uses. Auto-map SHOULD decline this.
      const { value } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      const parsed = (yaml.load(value) as Record<string, unknown>) || {};
      parsed.entity = 'climate.does_not_exist_uat';
      await yamlEditor.setEditorContent(
        yaml.dump(parsed, { lineWidth: -1, noRefs: true, sortKeys: false }),
        'properties',
        testInfo,
      );
      await properties.switchTab('Form');

      await ctx.entityRemapping.openManual();
      await ctx.entityRemapping.expectModalVisible(testInfo);

      // ⭐ CONTROL LEG — pre-existing locators only, so it passes on base as well.
      // It proves the dialog opened on the right missing entity, so a red
      // discriminator below cannot be "the modal never rendered".
      await expect(window.getByTestId('remap-select-climate.does_not_exist_uat')).toBeVisible();
      await expect(window.getByTestId('remap-auto-map')).toBeVisible();

      await ctx.entityRemapping.autoMapAll();

      // ⭐ DISCRIMINATOR — on base the button merges an empty result into state
      // and renders nothing at all, so this element does not exist.
      const outcome = window.getByTestId('remap-auto-map-outcome');
      await expect(outcome).toBeVisible();
      await expect(outcome).toContainText(/scored high enough/i);
    } finally {
      await close(ctx);
    }
  });

  /**
   * HA-04's other half — "not enough information to be able to map".
   *
   * `buildSuggestions` ends `.slice(0, 5)` and the dropdown rendered exactly
   * those five, so `showSearch` filtered *within five options*. On an instance
   * with hundreds of entities, an entity outside the top five was unreachable by
   * any amount of typing. The picker now lists every entity behind the ranked
   * five, and carries each entity's integration so the search can find it by the
   * name the owner asked for.
   *
   * ⚠ The fixture deliberately puts the wanted entity OUTSIDE the top five and
   * gives it an id that does NOT contain the integration name — the same shape
   * as the real Kia Uvo case, where 41 entities are named after the car model
   * and only one contains the string "kia".
   */
  test('the replacement picker reaches past the top five and searches by integration', async ({
    page,
  }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, entityContext } = ctx;
    const { window } = ctx;

    // Nine same-domain entities: suggestions cap at five, so at least four can
    // only be reached if the picker lists more than the ranked set.
    const MANY = Array.from({ length: 9 }, (_, i) => ({
      entity_id: `sensor.ev6_probe_${i}`,
      state: '42',
      attributes: { friendly_name: `EV6 Probe ${i}` },
      last_changed: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      context: { id: `m${i}`, parent_id: null, user_id: null },
    }));

    try {
      await appDSL.waitUntilReady();
      // The integration lives in Home Assistant's entity registry, which is what
      // supplies the label the owner asked for. Seeded BEFORE connecting so the
      // picker's load sees it.
      await seedEntityRegistry(
        ctx.window,
        MANY.map((entity) => ({
          entity_id: entity.entity_id,
          platform: 'kia_uvo',
          entity_category: null,
        })),
      );
      await appDSL.setConnected(true);
      await entityContext.setEntities(MANY, testInfo);

      await dashboard.createNew();
      await palette.expandCategory('Controls');
      await palette.addCard('button');
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);

      const { value } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      const parsed = (yaml.load(value) as Record<string, unknown>) || {};
      parsed.entity = 'sensor.gone_away_uat';
      await yamlEditor.setEditorContent(
        yaml.dump(parsed, { lineWidth: -1, noRefs: true, sortKeys: false }),
        'properties',
        testInfo,
      );
      await properties.switchTab('Form');

      await ctx.entityRemapping.openManual();
      await ctx.entityRemapping.expectModalVisible(testInfo);

      const select = window.getByTestId('remap-select-sensor.gone_away_uat');
      // ⭐ CONTROL LEG — pre-existing locator, passes on base.
      await expect(select).toBeVisible();

      await select.click();
      // The combobox input lives inside the Select field, NOT the dropdown
      // portal, and `pressSequentially` avoids the per-keystroke re-render
      // penalty of `keyboard.type`.
      const combobox = select.locator('input[role="combobox"]');
      const search = async (text: string) => {
        await combobox.press('ControlOrMeta+a');
        await combobox.press('Backspace');
        await combobox.pressSequentially(text, { delay: 0 });
      };

      // ⚠ Each search below narrows to ONE match on purpose. rc-select
      // VIRTUALISES the dropdown — only the first handful of filtered options
      // are in the DOM at all — so asserting a specific far-down entity while
      // many match would fail for a rendering reason rather than a filtering
      // one, and measure nothing.

      // ⭐ DISCRIMINATOR 1 — an entity OUTSIDE the ranked five. Scores here tie,
      // so the suggestion list breaks ties alphabetically and holds probes 0-4;
      // on base the dropdown contained only those five and this matches nothing.
      await search('probe_8');
      await expect(
        window.locator('.ant-select-item-option').filter({ hasText: 'sensor.ev6_probe_8' }),
      ).toBeVisible();

      // ⭐ DISCRIMINATOR 2 — search by INTEGRATION. Not one of these ids contains
      // the string "kia"; base searched `optionFilterProp="label"` where the
      // label was the entity id alone, so this yielded "No data". The same shape
      // as the real Kia Uvo case behind HA-02.
      await search('kia');
      const firstOption = window.locator('.ant-select-item-option').first();
      await expect(firstOption).toBeVisible();
      // ⭐ And the integration is on screen, which is what was actually asked for.
      await expect(firstOption).toContainText('Kia Uvo');
    } finally {
      await close(ctx);
    }
  });

  /**
   * Control for the test above: with NO registry seeded there is no integration
   * to show, and the picker must still list every entity rather than falling
   * back to the ranked five. This is the leg that would catch "the option list
   * silently depends on the registry loading".
   */
  test('the picker lists every entity even when the registry is unavailable', async ({
    page,
  }, testInfo) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, entityContext } = ctx;
    const { window } = ctx;

    const MANY = Array.from({ length: 9 }, (_, i) => ({
      entity_id: `sensor.ev6_probe_${i}`,
      state: '42',
      attributes: { friendly_name: `EV6 Probe ${i}` },
      last_changed: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      context: { id: `n${i}`, parent_id: null, user_id: null },
    }));

    try {
      await appDSL.waitUntilReady();
      await appDSL.setConnected(true);
      await entityContext.setEntities(MANY, testInfo);

      await dashboard.createNew();
      await palette.expandCategory('Controls');
      await palette.addCard('button');
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);

      const { value } = await yamlEditor.getEditorContentWithDiagnostics(testInfo, 'properties');
      const parsed = (yaml.load(value) as Record<string, unknown>) || {};
      parsed.entity = 'sensor.gone_away_uat';
      await yamlEditor.setEditorContent(
        yaml.dump(parsed, { lineWidth: -1, noRefs: true, sortKeys: false }),
        'properties',
        testInfo,
      );
      await properties.switchTab('Form');

      await ctx.entityRemapping.openManual();
      await ctx.entityRemapping.expectModalVisible(testInfo);

      const select = window.getByTestId('remap-select-sensor.gone_away_uat');
      await expect(select).toBeVisible();
      await select.click();

      const combobox = select.locator('input[role="combobox"]');
      await combobox.pressSequentially('probe_7', { delay: 0 });
      await expect(
        window.locator('.ant-select-item-option').filter({ hasText: 'sensor.ev6_probe_7' }),
      ).toBeVisible();
    } finally {
      await close(ctx);
    }
  });
});
