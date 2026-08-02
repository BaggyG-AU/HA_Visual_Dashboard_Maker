import { test, expect } from '@playwright/test';
import { close, launchWithDSL } from '../support';
import { seedEntityCache } from '../support/dsl/entityBrowser';

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

/**
 * HA-03's fixture.
 *
 * ⭐⭐⭐ THE `gauge` IS NOT DECORATION — IT IS THE CONTROL. `ha-gauge-card` is
 * the only card testid that exists on the BASE commit, so it is the one
 * assertion in this file that survives `git stash push -u src/`. Its PASSING on
 * base is what proves the fixture loaded and the canvas rendered, which in turn
 * proves a red "Unsupported Card Type" count is measuring card COVERAGE rather
 * than a broken harness. (#113's model: a red leg where one assertion passes on
 * base tells you which behaviour you are measuring.)
 *
 * ⚠ The four card configs are built from each card's DOCUMENTED SCHEMA, not
 * copied off the reference instance — per the card-breadth ruling, an instance
 * samples which cards exist, it does not specify which options they accept. The
 * instance's own `tile` only ever uses six keys and would have under-specified
 * every card here.
 */
const FOUR_CORE_CARDS = `title: HA-03 core cards
views:
  - title: Main
    path: main
    cards:
      - type: gauge
        entity: sensor.battery_soc
        name: Gauge Control
        min: 0
        max: 100
      - type: tile
        entity: sensor.battery_soc
        name: Battery SOC
        icon: mdi:battery
        color: green
        features:
          - type: numeric-input
            style: slider
      - type: heading
        heading: Energy
        heading_style: title
        icon: mdi:home-battery-outline
      - type: entity
        entity: sensor.grid_import
        name: Grid Import
      - type: statistics-graph
        title: Battery Charge
        entities:
          - sensor.battery_charge_energy
        chart_type: line
        period: 5minute
        days_to_show: 7
        stat_types:
          - state
`;

/**
 * Entities the fixture references.
 *
 * ⚠⚠⚠ GETTING LIVE STATE ONTO A CARD OFFLINE TAKES **THREE** STEPS IN THIS
 * ORDER, AND TWO MEASURED RUNS WERE SPENT LEARNING IT:
 *
 *   1. `seedEntityCache`            — the PERSISTED cache, which the entity
 *                                     PICKERS read. Does NOT reach the canvas.
 *   2. `appDSL.setConnected(true)`  — ⭐ THE NON-OBVIOUS ONE. `App.tsx` mounts
 *                                     `<HAEntityProvider enabled={isConnected}>`,
 *                                     and the provider installs its
 *                                     `window.__testEntityApi` INSIDE the effect
 *                                     that gate guards. Disconnected, the test
 *                                     API never exists at all — so step 3 fails
 *                                     with "Timeout 8000ms exceeded while
 *                                     waiting on the predicate", not with a
 *                                     wrong value.
 *   3. `entityContext.setEntities`  — what actually feeds `useHAEntities`, and
 *                                     therefore every card renderer.
 *
 * ⭐ Skipping step 2 does not fail loudly: `getEntity()` simply returns null and
 * EVERY card renders its honest "unavailable" branch. The first run of this
 * spec read `Received: "unavailable"` and looked like a renderer bug when the
 * renderers were correct and the fixture was starving them.
 */
const ENTITIES = [
  {
    entity_id: 'sensor.battery_soc',
    domain: 'sensor',
    state: '67',
    attributes: {
      friendly_name: 'Battery SOC',
      unit_of_measurement: '%',
      min: 0,
      max: 100,
      step: 1,
    },
  },
  {
    entity_id: 'sensor.grid_import',
    domain: 'sensor',
    state: '1.42',
    attributes: { friendly_name: 'Grid Import', unit_of_measurement: 'kW' },
  },
  {
    entity_id: 'sensor.battery_charge_energy',
    domain: 'sensor',
    state: '12.8',
    attributes: { friendly_name: 'Battery Charge Energy', unit_of_measurement: 'kWh' },
  },
];

/**
 * Bring the app up with live entity state available offline.
 *
 * ⚠ Must run BEFORE any card is on the canvas — `setConnected` remounts the
 * provider subtree, and seeding after that races the renderers.
 */
const connectWithEntities = async (ctx: Ctx): Promise<void> => {
  await ctx.appDSL.waitUntilReady();
  await seedEntityCache(ctx.window, ENTITIES);
  await ctx.appDSL.setConnected(true);
  await ctx.entityContext.setEntities(ENTITIES);
};

const seed = async (ctx: Ctx, yaml: string): Promise<void> => {
  await ctx.window.evaluate((source) => {
    const api = (window as unknown as { __dashboardTestApi?: { loadYaml: (y: string) => void } })
      .__dashboardTestApi;
    api?.loadYaml(source);
  }, yaml);
};

test.describe('Core HA card coverage (HA-03)', () => {
  /**
   * ⚠⚠⚠ THE DISCRIMINATOR, AND IT IS DELIBERATELY THE FIRST TEST IN THE FILE.
   *
   * It asserts on exactly two things, and NEITHER is a locator this branch
   * added:
   *   1. `ha-gauge-card`             — exists on base, must PASS on base
   *   2. the literal "Unsupported Card Type" — `UnsupportedCard`'s own header
   *      prose, which exists on base and DISAPPEARS when the fix lands
   *
   * That ordering matters. `git stash push -u src/` deletes the four new
   * renderers AND every testid they introduce, so a leg keyed on `ha-tile-card`
   * would go red for a missing locator instead of for the defect — which
   * measures nothing (#111's trap).
   *
   * On base this reads 4: `tile`, `heading`, `entity` and `statistics-graph`
   * all fell through `BaseCard`'s `default:` to `<UnsupportedCard>`. On the
   * owner's real dashboards that was 29 cards.
   */
  test('the four core HA cards render instead of falling through to the placeholder (HA-03)', async () => {
    const ctx = await launchWithDSL();

    try {
      await connectWithEntities(ctx);
      await ctx.dashboard.createNew();
      await seed(ctx, FOUR_CORE_CARDS);
      await ctx.canvas.expectCardCount(5);

      // CONTROL — passes on base. If this fails, the fixture never loaded and
      // nothing below can be trusted.
      await expect(ctx.window.getByTestId('ha-gauge-card')).toBeVisible();

      // DISCRIMINATOR — 4 on base, 0 once the renderers exist.
      await expect(ctx.window.getByText('Unsupported Card Type')).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });

  test('the tile card shows its icon, name, state and feature row', async () => {
    const ctx = await launchWithDSL();

    try {
      await connectWithEntities(ctx);
      await ctx.dashboard.createNew();
      await seed(ctx, FOUR_CORE_CARDS);
      await ctx.canvas.expectCardCount(5);

      await expect(ctx.window.getByTestId('ha-tile-card')).toBeVisible();
      await expect(ctx.window.getByTestId('tile-card-name')).toHaveText('Battery SOC');
      await expect(ctx.window.getByTestId('tile-card-state')).toHaveText('67');

      // The features row is the part of `tile` that carries real behaviour, and
      // this exact config (`numeric-input` + `style: slider`) is verbatim from
      // the reference instance — the cross-check that the schema matched reality.
      await expect(ctx.window.getByTestId('tile-card-features')).toBeVisible();
      const feature = ctx.window.getByTestId('tile-feature-numeric-input');
      await expect(feature).toHaveAttribute('data-feature-control', 'slider');
      await expect(ctx.window.getByTestId('tile-feature-numeric-input-value')).toHaveText('67%');
    } finally {
      await close(ctx);
    }
  });

  test('the heading card renders as a section label, not a framed card', async () => {
    const ctx = await launchWithDSL();

    try {
      await connectWithEntities(ctx);
      await ctx.dashboard.createNew();
      await seed(ctx, FOUR_CORE_CARDS);
      await ctx.canvas.expectCardCount(5);

      await expect(ctx.window.getByTestId('ha-heading-card')).toBeVisible();
      await expect(ctx.window.getByTestId('heading-card-text')).toHaveText('Energy');
      await expect(ctx.window.getByTestId('heading-card-text')).toHaveAttribute(
        'data-heading-style',
        'title',
      );
      await expect(ctx.window.getByTestId('heading-card-icon')).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('the entity card shows the entity state with its unit', async () => {
    const ctx = await launchWithDSL();

    try {
      await connectWithEntities(ctx);
      await ctx.dashboard.createNew();
      await seed(ctx, FOUR_CORE_CARDS);
      await ctx.canvas.expectCardCount(5);

      await expect(ctx.window.getByTestId('ha-entity-card')).toBeVisible();
      await expect(ctx.window.getByTestId('entity-card-name')).toHaveText('Grid Import');
      await expect(ctx.window.getByTestId('entity-card-state')).toHaveText('1.42');
    } finally {
      await close(ctx);
    }
  });

  test('the statistics-graph card reports its real period, span and series', async () => {
    const ctx = await launchWithDSL();

    try {
      await connectWithEntities(ctx);
      await ctx.dashboard.createNew();
      await seed(ctx, FOUR_CORE_CARDS);
      await ctx.canvas.expectCardCount(5);

      const card = ctx.window.getByTestId('ha-statistics-graph-card');
      await expect(card).toBeVisible();
      await expect(card).toHaveAttribute('data-chart-type', 'line');

      // ⭐ The plot is indicative (HAVDM queries no statistics API, exactly as it
      // queries no history API) — but everything READ FROM THE CONFIG is real,
      // so that is what this asserts.
      await expect(ctx.window.getByTestId('statistics-graph-span')).toHaveText(
        '5-minute · last 7 days · state',
      );
      await expect(
        ctx.window.getByTestId('statistics-graph-series-sensor-battery_charge_energy'),
      ).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  /**
   * ⭐ The other half of the promise. Closing the coverage gap must NOT quietly
   * remove the marked placeholder for cards HAVDM genuinely cannot draw —
   * HA-03's card calls that placeholder a PASS ("cards that HAVDM cannot render
   * show a marked placeholder, not a crash and not a blank space").
   */
  test('a genuinely unknown card type still shows the marked placeholder', async () => {
    const ctx = await launchWithDSL();

    try {
      await connectWithEntities(ctx);
      await ctx.dashboard.createNew();
      await seed(
        ctx,
        `title: HA-03 unknown
views:
  - title: Main
    path: main
    cards:
      - type: gauge
        entity: sensor.battery_soc
      - type: custom:not-a-real-card
        entity: sensor.battery_soc
`,
      );
      await ctx.canvas.expectCardCount(2);

      await expect(ctx.window.getByTestId('ha-gauge-card')).toBeVisible();
      await expect(ctx.window.getByText('Unsupported Card Type')).toHaveCount(1);
    } finally {
      await close(ctx);
    }
  });
});
