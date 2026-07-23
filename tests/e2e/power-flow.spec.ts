import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

// Phase 4 PR-7 — power-flow-card (ulic75) and power-flow-card-plus (flixlix) are
// different cards. Only power-flow-card-plus requires a battery state-of-charge
// entity, so its form (and only its form) offers that field.
//
// RED-BEFORE-GREEN: with the PropertiesPanel change git-stashed, the base build
// shares one power-flow form with no `power-flow-plus-soc` field, so the "shows a
// required state-of-charge field" assertion fails.

const PLUS_WITH_BATTERY = `type: custom:power-flow-card-plus
entities:
  battery:
    entity: sensor.battery_power
`;

test.describe('Power Flow Card Plus state-of-charge', () => {
  test('shows a state-of-charge field for power-flow-card-plus with a battery', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, yamlEditor, window } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.addCard('custom:power-flow-card-plus');
      await canvas.selectCard(0);
      await properties.switchTab('YAML');
      await yamlEditor.setEditorContent(PLUS_WITH_BATTERY, 'properties');
      await properties.switchTab('Form');

      await expect(window.getByTestId('power-flow-plus-soc')).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('does not offer a state-of-charge field on the non-plus power-flow-card', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, dashboard, palette, canvas, properties, window } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();

      await palette.addCard('custom:power-flow-card');
      await canvas.selectCard(0);
      await properties.switchTab('Form');

      await expect(window.getByTestId('power-flow-plus-soc')).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });
});
