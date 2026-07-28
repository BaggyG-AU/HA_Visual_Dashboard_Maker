import { test, expect } from '@playwright/test';
import * as yaml from 'js-yaml';
import { launchWithDSL, close } from '../support';

/** Read the properties-panel YAML as data, so assertions never pin formatting. */
const readCardYaml = (value: string): Record<string, unknown> =>
  (yaml.load(value) as Record<string, unknown>) || {};

test.describe('Smart Default Actions (Feature 3.1)', () => {
  test('computes smart defaults per domain and persists smart_defaults to YAML', async ({
    page,
  }, testInfo) => {
    test.setTimeout(120000);
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, smartActions } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.expandCategory('Controls');
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
      const { value: baseYaml } = await yamlEditor.getEditorContentWithDiagnostics(
        testInfo,
        'properties',
      );
      const yamlState = (yaml.load(baseYaml) as Record<string, unknown>) || {};

      for (const { entity, expected } of domainCases) {
        yamlState.entity = entity;
        yamlState.smart_defaults = true;
        const next = yaml.dump(yamlState, { lineWidth: -1, noRefs: true, sortKeys: false });
        await yamlEditor.setEditorContent(next, 'properties', testInfo);

        await properties.switchTab('Form');
        await smartActions.expectPreviewContains('custom-button-card', expected, testInfo);
        await smartActions.expectPreviewContains(
          'custom-button-card',
          /\(smart default\)/i,
          testInfo,
        );
        await properties.switchTab('YAML');
      }

      // Toggle off and confirm YAML persists the setting.
      await properties.switchTab('Form');
      await smartActions.setEnabled('custom-button-card', false, testInfo);

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const { value: yamlAfterToggle } = await yamlEditor.getEditorContentWithDiagnostics(
        testInfo,
        'properties',
      );
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

  /**
   * v1.0.0 UAT round-1 defect PROPS-04 (High) — "Could only find Smart Default
   * Actions. No other options available."
   *
   * ⚠ The test above drives `tap_action` in through the MONACO YAML EDITOR and
   * asserts the read-only preview. It proves the YAML -> preview direction and
   * says nothing at all about whether an author can SET an action — which is
   * why the suite stayed green for the whole period no picker existed. This
   * test drives the FORM and asserts the YAML BYTES, i.e. the other direction.
   *
   * ⭐ An enabled control is not an outcome: every assertion below lands on YAML
   * content or on a DOM element, never on "the select exists".
   */
  test('lets an author set tap/hold actions from the form, and the choice reaches the YAML', async ({
    page,
  }, testInfo) => {
    test.setTimeout(180000);
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, smartActions } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.expandCategory('Controls');
      await palette.addCard('custom:button-card');
      await canvas.expectCardCount(1);
      await canvas.selectCard(0);
      await properties.expectVisible();

      // ── Control leg for every absence assertion in this test ──────────────
      // Prove the block is observable BEFORE asserting it is absent.
      // `toHaveCount(0)` passes instantly against an element that never mounted,
      // so an unpaired absence assertion here would prove nothing.
      await smartActions.setEnabled('custom-button-card', false, testInfo);
      await smartActions.expectManualActionsVisible('custom-button-card', testInfo);

      // Owner ruling: the pickers are hidden while Smart Defaults are on.
      await smartActions.setEnabled('custom-button-card', true, testInfo);
      await smartActions.expectManualActionsHidden('custom-button-card', testInfo);

      // ── The defect: with the toggle OFF the author must be able to choose ──
      await smartActions.setEnabled('custom-button-card', false, testInfo);
      await smartActions.expectManualActionsVisible('custom-button-card', testInfo);

      // Toggle — a type that needs no sub-field. ⚠ The control leg for THIS
      // absence lands later in the same test: the Navigate step below proves
      // `navigation-path` is observable at all. Order does not matter; pairing
      // does.
      await smartActions.setAction('custom-button-card', 'tap', 'Toggle', testInfo);
      await smartActions.expectSubFieldAbsent(
        'custom-button-card',
        'tap',
        'navigation-path',
        testInfo,
      );

      await properties.switchTab('YAML');
      await yamlEditor.expectMonacoVisible('properties', testInfo);
      const toggleYaml = await yamlEditor.waitForEditorContent(/tap_action:/, {
        scopeHint: 'properties',
      });
      // ⚠ Parse rather than regex the dump — block vs flow style is a js-yaml
      // formatting detail, and a test that pins formatting fails for reasons
      // that have nothing to do with the defect.
      expect(readCardYaml(toggleYaml).tap_action).toEqual({ action: 'toggle' });

      // ── Navigate adapts the form and the path reaches the YAML ────────────
      await properties.switchTab('Form');
      await smartActions.setAction('custom-button-card', 'tap', 'Navigate', testInfo);
      await smartActions.expectSubFieldVisible(
        'custom-button-card',
        'tap',
        'navigation-path',
        testInfo,
      );
      await smartActions.fillActionSubField(
        'custom-button-card',
        'tap',
        'navigation-path',
        '/lovelace/1',
        testInfo,
      );

      await properties.switchTab('YAML');
      const navigateYaml = await yamlEditor.waitForEditorContent(
        /navigation_path:\s*\/lovelace\/1/,
        {
          scopeHint: 'properties',
        },
      );
      expect(readCardYaml(navigateYaml).tap_action).toEqual({
        action: 'navigate',
        navigation_path: '/lovelace/1',
      });

      // ── Call Service adapts too, AND prunes the navigate sub-field ────────
      // The control leg for this absence is the assertion directly above:
      // navigation_path was provably in the YAML a moment ago.
      await properties.switchTab('Form');
      await smartActions.setAction('custom-button-card', 'tap', 'Call Service', testInfo);
      await smartActions.expectSubFieldVisible('custom-button-card', 'tap', 'service', testInfo);
      await smartActions.expectSubFieldAbsent(
        'custom-button-card',
        'tap',
        'navigation-path',
        testInfo,
      );
      await smartActions.fillActionSubField(
        'custom-button-card',
        'tap',
        'service',
        'light.turn_on',
        testInfo,
      );

      await properties.switchTab('YAML');
      const serviceYaml = await yamlEditor.waitForEditorContent(/service:\s*light\.turn_on/, {
        scopeHint: 'properties',
      });
      // ⭐ No half-configured leftovers: the navigate key is GONE, not merely
      // hidden. `tap_action: { action: call-service, navigation_path: ... }`
      // parses fine and means nothing to Home Assistant. toEqual is exact, so
      // this asserts the pruning rather than merely the new key.
      expect(readCardYaml(serviceYaml).tap_action).toEqual({
        action: 'call-service',
        service: 'light.turn_on',
      });

      // ── Hold is separate wiring and needs its own evidence ────────────────
      await properties.switchTab('Form');
      await smartActions.setAction('custom-button-card', 'hold', 'More Info', testInfo);

      await properties.switchTab('YAML');
      const holdYaml = await yamlEditor.waitForEditorContent(/hold_action:/, {
        scopeHint: 'properties',
      });
      expect(readCardYaml(holdYaml).hold_action).toEqual({ action: 'more-info' });

      // ── "Not set" is the way back — the first pick must not be a one-way ──
      // door out of smart defaults.
      await properties.switchTab('Form');
      await smartActions.setAction(
        'custom-button-card',
        'tap',
        'Not set (use Smart Defaults)',
        testInfo,
      );

      await properties.switchTab('YAML');
      // ⚠ A disappearance, so it must POLL — a single sample taken before the
      // 800 ms commit debounce lands would pass for the wrong reason.
      await expect
        .poll(
          async () => 'tap_action' in readCardYaml(await yamlEditor.getEditorContent('properties')),
          { timeout: 15000 },
        )
        .toBe(false);
      // hold_action survives, proving the clear was targeted rather than a reset.
      const clearedCard = readCardYaml(await yamlEditor.getEditorContent('properties'));
      expect(clearedCard.hold_action).toEqual({ action: 'more-info' });

      // ── A hidden control that is still in force must say so ───────────────
      await properties.switchTab('Form');
      await smartActions.setEnabled('custom-button-card', true, testInfo);
      await smartActions.expectManualActionsHidden('custom-button-card', testInfo);
      await smartActions
        .getOverrideNotice('custom-button-card')
        .waitFor({ state: 'visible', timeout: 5000 });
    } finally {
      await close(ctx);
    }
  });
});
