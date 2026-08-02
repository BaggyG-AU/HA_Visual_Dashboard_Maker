/**
 * PROPS-03 — the Properties-panel entity picker must disclose what it hid.
 *
 * ⭐ Round-2 UAT, card PROPS-03 (High), owner verbatim, in full:
 * **"'light' not found in entity list."**
 *
 * ⭐⭐⭐ THE FIXTURE IS BUILT FROM THE INSTANCE, NOT THE REPORT. Measured read-only
 * against `ha.home.local` (HA 2026.7.4) on 2026-08-02: 725 live entities, 1397
 * registry rows, and **ZERO entities in the `light` domain** — live or
 * registered. Exactly THREE live entities match the word "light", and all three
 * are UniFi Protect camera status lights carrying `entity_category: diagnostic`.
 * So the owner's search returned nothing for two compounding reasons, and the
 * picker disclosed neither: it applied the diagnostic cut unconditionally
 * (`filterEntitiesByRegistry` was called with no `showDiagnostic` option), and
 * antd's default empty state says the bare word "No data".
 *
 * ⚠⚠ A fixture built from the bug report would have CONTAINED lights, which
 * would have "reproduced" the defect against the wrong mechanism entirely — the
 * triage predicted `filterEntitiesForCard` was the culprit, and measurement
 * showed it removes NOTHING here while the registry cut removes 287 of 725.
 *
 * The Entity Browser has disclosed all of this since slice 2. This spec is about
 * the OTHER entity surface, which applied the same cut in silence.
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
 * A faithful miniature: no `light` domain at all, and the only entities whose
 * NAME contains "light" are diagnostic camera status lights.
 */
const ENTITIES = [
  {
    entity_id: 'sensor.sigen_battery_soc',
    state: '87',
    attributes: { friendly_name: 'Battery SOC', unit_of_measurement: '%' },
  },
  {
    entity_id: 'sensor.bom_temperature',
    state: '21',
    attributes: { friendly_name: 'Outside Temperature', unit_of_measurement: '°C' },
  },
  {
    entity_id: 'binary_sensor.garage_360_status_light',
    state: 'off',
    attributes: { friendly_name: 'Garage 360 Status light' },
  },
  {
    entity_id: 'binary_sensor.front_door_status_light',
    state: 'on',
    attributes: { friendly_name: 'Front Door Status light' },
  },
  {
    entity_id: 'binary_sensor.front_yard_status_light',
    state: 'unavailable',
    attributes: { friendly_name: 'Front Yard Status light' },
  },
];

const REGISTRY = [
  { entity_id: 'sensor.sigen_battery_soc', platform: 'sigen', entity_category: null },
  {
    entity_id: 'sensor.bom_temperature',
    platform: 'bureau_of_meteorology',
    entity_category: null,
  },
  {
    entity_id: 'binary_sensor.garage_360_status_light',
    platform: 'unifiprotect',
    entity_category: 'diagnostic',
  },
  {
    entity_id: 'binary_sensor.front_door_status_light',
    platform: 'unifiprotect',
    entity_category: 'diagnostic',
  },
  {
    entity_id: 'binary_sensor.front_yard_status_light',
    platform: 'unifiprotect',
    entity_category: 'diagnostic',
  },
];

/** Open the primary entity picker of the currently selected card and type a query. */
async function searchPicker(ctx: Awaited<ReturnType<typeof launchWithDSL>>, query: string) {
  const select = ctx.window.getByTestId('entity-select').first();
  await expect(select).toBeVisible({ timeout: 10000 });
  await select.click();
  const input = select.locator('input[role="combobox"]:not([readonly])').first();
  await expect(input).toBeVisible({ timeout: 5000 });
  // ⚠⚠ `pressSequentially`, NOT `fill`. An antd Select's combobox ignores a
  // programmatic value set — `fill` left the query unregistered, so the first
  // run came back with the search apparently not applied at all (5 options for
  // a query matching 3). This is a documented project trap; `fill` is for an
  // antd `Input`, `pressSequentially` for a Select combobox.
  await input.pressSequentially(query);
}

test.describe('PROPS-03: the entity picker discloses what it hid', () => {
  test('searching "light" names the hidden matches instead of saying "No data"', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window, ENTITIES);
      await seedEntityRegistry(ctx.window, REGISTRY);
      await ctx.dashboard.createNew();
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(1);
      await ctx.canvas.selectCard(0);

      await searchPicker(ctx, 'light');

      // ⭐⭐⭐ THE DEFECT. Pre-fix the dropdown showed antd's bare "No data" — the
      // same answer it gives for "you have none", so the three entities that DO
      // match were indistinguishable from entities that do not exist.
      const empty = ctx.window.getByTestId('entity-select-empty');
      await expect(empty).toBeVisible({ timeout: 5000 });
      await expect(empty).toContainText('3 entities that match are marked diagnostic or config');
      await expect(empty).toContainText('Show diagnostic & config');
    } finally {
      await clearEntityRegistry(ctx.window);
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('⭐ CONTROL: the toggle brings those three within reach', async () => {
    // A disclosure without an escape hatch would tell the user three entities
    // exist and still refuse to let them pick one — worse than silence.
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window, ENTITIES);
      await seedEntityRegistry(ctx.window, REGISTRY);
      await ctx.dashboard.createNew();
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(1);
      await ctx.canvas.selectCard(0);

      await ctx.window
        .getByTestId('entity-select-show-diagnostic')
        .locator('input[type="checkbox"]')
        .check();

      await searchPicker(ctx, 'light');

      const dropdown = ctx.window.locator(
        '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option',
      );
      await expect(dropdown).toHaveCount(3, { timeout: 5000 });
      await expect(ctx.window.getByTestId('entity-select-empty')).toBeHidden();
    } finally {
      await clearEntityRegistry(ctx.window);
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('the count line says how many were hidden, and survives the toggle', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window, ENTITIES);
      await seedEntityRegistry(ctx.window, REGISTRY);
      await ctx.dashboard.createNew();
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(1);
      await ctx.canvas.selectCard(0);

      const count = ctx.window.getByTestId('entity-select-count');
      await expect(count).toBeVisible({ timeout: 10000 });
      await expect(count).toHaveText('Showing 2 of 5 (3 hidden)');

      // ⚠⚠ THE BUG I ALMOST SHIPPED: the disclosure row was first rendered on
      // "is anything hidden RIGHT NOW", which is empty the moment the box is
      // ticked — so the row unmounted and the toggle could be turned on but
      // never off. It must key on what the cut WOULD remove, not on the current
      // toggle state.
      const toggle = ctx.window
        .getByTestId('entity-select-show-diagnostic')
        .locator('input[type="checkbox"]');
      await toggle.check();
      await expect(count).toBeVisible();
      await expect(count).toHaveText('Showing 5');
      await toggle.uncheck();
      await expect(count).toHaveText('Showing 2 of 5 (3 hidden)');
    } finally {
      await clearEntityRegistry(ctx.window);
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('a Light card blames the CARD, not the search — the owner’s actual case', async () => {
    // ⭐⭐⭐ On an instance with no `light` domain, a Light card's picker has a pool
    // of ZERO and the old UI answered "No data". This is almost certainly the
    // literal thing behind "'light' not found in entity list".
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window, ENTITIES);
      await seedEntityRegistry(ctx.window, REGISTRY);
      await ctx.dashboard.createNew();
      await ctx.palette.addCard('light');
      await ctx.canvas.expectCardCount(1);
      await ctx.canvas.selectCard(0);

      const select = ctx.window.getByTestId('entity-select').first();
      await expect(select).toBeVisible({ timeout: 10000 });
      await select.click();

      const empty = ctx.window.getByTestId('entity-select-empty');
      await expect(empty).toBeVisible({ timeout: 5000 });
      // ⚠ The Light card's field narrows by `filterDomains={['light']}` and passes
      // NO `cardType`, so the honest sentence names the DOMAIN rather than the
      // card. Blaming the diagnostic cut here would be a lie: unticking the box
      // produces nothing, because the instance has no lights at all.
      await expect(empty).toHaveText('No entity on this Home Assistant is in the light domain.');

      // ⚠ And it must NOT offer a diagnostic toggle here: no amount of unhiding
      // produces a light, so the control would be a false promise.
      await expect(ctx.window.getByTestId('entity-select-show-diagnostic')).toBeHidden();
    } finally {
      await clearEntityRegistry(ctx.window);
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('⭐ CONTROL: a picker with nothing hidden stays clean', async () => {
    // "A safety prompt that fires when nothing is at risk spends attention."
    // Without this leg, every assertion above would pass against a build that
    // rendered the disclosure row unconditionally.
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window, ENTITIES.slice(0, 2));
      await seedEntityRegistry(ctx.window, REGISTRY.slice(0, 2));
      await ctx.dashboard.createNew();
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(1);
      await ctx.canvas.selectCard(0);

      await expect(ctx.window.getByTestId('entity-select').first()).toBeVisible({ timeout: 10000 });
      await expect(ctx.window.getByTestId('entity-select-count')).toBeHidden();
      await expect(ctx.window.getByTestId('entity-select-show-diagnostic')).toBeHidden();
    } finally {
      await clearEntityRegistry(ctx.window);
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });
});
