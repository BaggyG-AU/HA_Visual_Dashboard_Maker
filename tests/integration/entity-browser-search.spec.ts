/**
 * Integration Test: UAT HA-02 (High, regression) — finding entities by integration.
 *
 * Owner's report, verbatim: "Filtering not working properly. Also 'X/page' does
 * not work. When selecting 'Integration' and searching for kia only one entity
 * is listed but there are 41 Kia Uvo integration entities."
 *
 * ⭐⭐⭐ THE FIXTURE IS THE ARGUMENT. Home Assistant names `kia_uvo` entities after
 * the CAR — "EV6 Odometer" — not the brand, so for 40 of the 41 the string "kia"
 * appears in NO searchable field. Only the owning integration knows they are
 * Kias. The browser offered "Group by: Integration" as a first-class axis while
 * the search box beside it was blind to that exact axis.
 *
 * ⚠⚠ THE OBVIOUS SUSPECT WAS WRONG, AND THIS FILE PINS THAT. The natural
 * hypothesis was the diagnostic cut (38 of the 41 are `entity_category:
 * diagnostic`, hidden by default). Measured: ticking "Show diagnostic & config"
 * left the search returning ONE. `finds every entity of an integration even with
 * the diagnostic cut ACTIVE` is the assertion that keeps that finding from being
 * re-litigated.
 */

import { test, expect } from '@playwright/test';
import {
  launchWithDSL,
  close,
  seedEntityCache,
  clearEntityCache,
  seedEntityRegistry,
  clearEntityRegistry,
} from '../support';

/**
 * ⭐⭐⭐ MEASURED AGAINST THE REFERENCE INSTANCE 2026-08-02, AND IT IS WORSE THAN
 * THE BUG REPORT. `config/entity_registry/list` returns **107 `kia_uvo` rows**
 * (105 with live states), split `diagnostic: 60`, `config: 4`, uncategorised 43
 * — which is why the tester saw a tab reading roughly forty.
 *
 * ⚠⚠⚠ AND **ZERO** OF THE 105 CONTAIN THE STRING "kia" IN THEIR entity_id OR
 * THEIR friendly_name. Not one. The owner named the car "Sparky", so the real
 * rows read `binary_sensor.ev5_front_left_door` / "Sparky Front Left Door".
 * The brand exists ONLY in the registry's `platform` field.
 *
 * ⚠ THE FIRST VERSION OF THIS FIXTURE WAS TOO KIND: it gave one of the 41 a
 * "Kia EV6 Charging" name, so the pre-fix search returned 1. Reality returns
 * NOTHING. A fixture that flatters the old behaviour understates the defect, so
 * the names below now follow the instance — no entity mentions the brand.
 */
const KIA_PRIMARY = [
  { id: 'sensor.ev5_battery_level', name: 'Sparky Battery Level', diagnostic: false },
  { id: 'device_tracker.ev5_location', name: 'Sparky Location', diagnostic: false },
  { id: 'binary_sensor.ev5_charging', name: 'Sparky Charging', diagnostic: false },
];
const KIA_DIAGNOSTIC = Array.from({ length: 38 }, (_, index) => ({
  id: `sensor.ev5_diag_${index + 1}`,
  name: `Sparky Diagnostic ${index + 1}`,
  diagnostic: true,
}));
const KIA = [...KIA_PRIMARY, ...KIA_DIAGNOSTIC];

const OTHERS = [
  { id: 'light.living_room', name: 'Living Room Light', platform: 'zha', state: 'on' },
  { id: 'sensor.solar_power', name: 'Solar Power', platform: 'sigen', state: '1200' },
  { id: 'climate.lounge', name: 'Lounge Climate', platform: 'actron_air', state: 'heat' },
  // Availability facet fixtures — one of each non-reporting state.
  { id: 'sensor.dead_probe', name: 'Dead Probe', platform: 'zha', state: 'unavailable' },
  { id: 'sensor.silent_probe', name: 'Silent Probe', platform: 'zha', state: 'unknown' },
];

const ENTITIES = [
  ...KIA.map((entity) => ({
    entity_id: entity.id,
    state: '42',
    attributes: { friendly_name: entity.name },
  })),
  ...OTHERS.map((entity) => ({
    entity_id: entity.id,
    state: entity.state,
    attributes: { friendly_name: entity.name },
  })),
];

const REGISTRY = [
  ...KIA.map((entity) => ({
    entity_id: entity.id,
    platform: 'kia_uvo',
    entity_category: entity.diagnostic ? 'diagnostic' : null,
    hidden_by: null,
    area_id: null,
    device_id: null,
  })),
  ...OTHERS.map((entity) => ({
    entity_id: entity.id,
    platform: entity.platform,
    entity_category: null,
    hidden_by: null,
    area_id: null,
    device_id: null,
  })),
];

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

const openBrowser = async (ctx: Ctx): Promise<void> => {
  await ctx.appDSL.waitUntilReady();
  await seedEntityCache(ctx.window, ENTITIES);
  await seedEntityRegistry(ctx.window, REGISTRY);
  await ctx.dashboard.createNew();
  await ctx.entityBrowser.open();
  await expect(ctx.window.getByTestId('entity-browser-search-input')).toBeVisible({
    timeout: 15000,
  });
};

/** Rows currently painted in the table body. */
const renderedRows = (ctx: Ctx) => ctx.window.locator('.ant-table-tbody tr.ant-table-row');

const search = async (ctx: Ctx, query: string): Promise<void> => {
  await ctx.window.getByTestId('entity-browser-search-input').fill(query);
};

const showDiagnostics = async (ctx: Ctx): Promise<void> => {
  await ctx.window.getByTestId('entity-browser-show-diagnostic').locator('input').check();
};

const groupByIntegration = async (ctx: Ctx): Promise<void> => {
  await ctx.window
    .getByTestId('entity-browser-group-by')
    .getByText('Integration', { exact: true })
    .click();
};

test.describe('HA-02: entity browser search and filtering', () => {
  test.beforeEach(async () => {
    // Each test seeds its own data; the launcher gives an isolated userDataDir.
  });

  test('finds every entity of an integration by typing the brand', async () => {
    const ctx = await launchWithDSL();
    try {
      await openBrowser(ctx);
      await showDiagnostics(ctx);
      await groupByIntegration(ctx);

      // ⭐ CONTROL LEG: with everything shown and no query, all 41 are reachable.
      // Without this, "41 rows after searching" could pass against a table that
      // simply never filtered.
      await expect(ctx.window.locator('.ant-tabs-tab', { hasText: 'Kia Uvo' })).toContainText('41');

      await search(ctx, 'kia');

      // ⭐⭐⭐ THE DEFECT: this returned NOTHING before the fix. On the reference
      // instance not one of the 105 live `kia_uvo` entities carries the brand in
      // any field the search read — the owner named the car, so they all say
      // "Sparky". The integration was the only thing that knew.
      await expect(ctx.window.locator('.ant-pagination-total-text')).toHaveText(
        'Total 41 entities',
      );
    } finally {
      await clearEntityRegistry(ctx.window);
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('matches the raw slug and the humanised label the tab shows', async () => {
    const ctx = await launchWithDSL();
    try {
      await openBrowser(ctx);
      await showDiagnostics(ctx);

      // The tab header reads "Kia Uvo", so typing what you read must work.
      await search(ctx, 'kia uvo');
      await expect(ctx.window.locator('.ant-pagination-total-text')).toHaveText(
        'Total 41 entities',
      );

      await search(ctx, 'kia_uvo');
      await expect(ctx.window.locator('.ant-pagination-total-text')).toHaveText(
        'Total 41 entities',
      );

      // ⚠ Still an AND across tokens — the integration must not become a wildcard.
      await search(ctx, 'kia location');
      await expect(ctx.window.locator('.ant-pagination-total-text')).toHaveText('Total 1 entities');
    } finally {
      await clearEntityRegistry(ctx.window);
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('a tab thinned by the diagnostic cut says so, rather than just showing 3', async () => {
    const ctx = await launchWithDSL();
    try {
      await openBrowser(ctx);
      await groupByIntegration(ctx);

      // ⭐⭐⭐ "Kia Uvo (3)" is arithmetically true and reads as "I own three".
      // The suffix is what turns a correct number into an honest one.
      await expect(ctx.window.locator('.ant-tabs-tab', { hasText: 'Kia Uvo' })).toContainText(
        '3 of 41',
      );

      // ⚠ And it must DISAPPEAR when nothing is being hidden — a permanent
      // "of N" would be noise that stops carrying information.
      await showDiagnostics(ctx);
      await expect(ctx.window.locator('.ant-tabs-tab', { hasText: 'Kia Uvo' })).not.toContainText(
        'of 41',
      );
      await expect(ctx.window.locator('.ant-tabs-tab', { hasText: 'Kia Uvo' })).toContainText('41');
    } finally {
      await clearEntityRegistry(ctx.window);
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('the page-size control actually changes how many rows are drawn', async () => {
    const ctx = await launchWithDSL();
    try {
      await openBrowser(ctx);
      await showDiagnostics(ctx);

      // CONTROL LEG: the default really is 10, so a later "20" is a change.
      await expect(renderedRows(ctx)).toHaveCount(10);

      await ctx.window.locator('.ant-pagination-options .ant-select').first().click();
      await ctx.window
        .locator('.ant-select-item-option')
        .filter({ hasText: /^20 \/ page$/ })
        .first()
        .click();

      // ⭐ THE DEFECT: `pageSize` was a controlled literal with no change
      // handler, so antd re-applied 10 on every render and this stayed at 10.
      await expect(renderedRows(ctx)).toHaveCount(20);
    } finally {
      await clearEntityRegistry(ctx.window);
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('the State column can isolate entities that are not reporting', async () => {
    const ctx = await launchWithDSL();
    try {
      await openBrowser(ctx);

      // ⚠ Availability is NOT free-text searchable, by decision — the old
      // placeholder claimed it was. The facet is where that question is asked.
      await ctx.window
        .locator('th')
        .filter({ hasText: 'State' })
        .locator('.ant-table-filter-trigger')
        .click();

      const dropdown = ctx.window.locator('.ant-table-filter-dropdown').last();
      await expect(dropdown).toBeVisible({ timeout: 5000 });
      await dropdown.getByText('Unavailable', { exact: true }).click();
      await dropdown.getByRole('button', { name: /OK/i }).click();

      await expect(renderedRows(ctx)).toHaveCount(1);
      await expect(renderedRows(ctx).first()).toContainText('sensor.dead_probe');
    } finally {
      await clearEntityRegistry(ctx.window);
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('the search box promises only what it delivers', async () => {
    const ctx = await launchWithDSL();
    try {
      await openBrowser(ctx);

      // ⭐⭐⭐ THE OLD TEXT SAID "state" AND THE SEARCH NEVER READ IT. Every Kia
      // entity here has state '42'; searching it returns nothing, which is why
      // the claim had to go rather than the behaviour being quietly tolerated.
      const placeholder = await ctx.window
        .getByTestId('entity-browser-search-input')
        .getAttribute('placeholder');

      expect(placeholder).toContain('integration');
      expect(placeholder).not.toContain('state');

      await showDiagnostics(ctx);
      await search(ctx, '42');
      await expect(ctx.window.getByText('No entities match your search.')).toBeVisible();
    } finally {
      await clearEntityRegistry(ctx.window);
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });
});
