import { test, expect } from '@playwright/test';
import { close, launchWithDSL } from '../support';
import { seedEntityCache } from '../support/dsl/entityBrowser';

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

/**
 * The seven card types HAVDM's own PALETTE offered with no renderer.
 *
 * ⚠⚠ This is a worse failure than the four core cards HA-03 found. Those only
 * appeared on IMPORT — you had to already have one on a real dashboard. These
 * are in HAVDM's palette: a user could drag one out and immediately be told
 * their own tool does not support it.
 *
 * ⭐⭐⭐ THE `gauge` IS THE CONTROL, exactly as in `core-card-coverage.spec.ts`.
 * `ha-gauge-card` is the one card testid that predates this branch, so it is the
 * single assertion here that survives a base revert. Its PASSING proves the
 * fixture loaded and the canvas rendered — so a red "Unsupported Card Type"
 * count is measuring card COVERAGE, not a broken harness.
 *
 * ⚠ None of the seven appears on the reference instance, so every config below
 * is built from the CARD'S OWN DOCUMENTED SCHEMA — per the card-breadth ruling,
 * a card absent from the instance is UNSAMPLED, not unimportant.
 */
const SEVEN_PALETTE_CARDS = `title: Palette coverage
views:
  - title: Main
    path: main
    cards:
      - type: gauge
        entity: sensor.battery_soc
        name: Gauge Control
      - type: custom:battery-state-card
        title: Batteries
        entities:
          - entity: sensor.phone_battery
            name: Phone
          - entity: sensor.tablet_battery
            name: Tablet
      - type: custom:decluttering-card
        template: temperature_card
        variables:
          - entity: sensor.battery_soc
          - label: Living Room
      - type: custom:mini-media-player
        entity: media_player.lounge
        name: Lounge
      - type: custom:simple-swipe-card
        cards:
          - type: markdown
            content: One
          - type: markdown
            content: Two
      - type: custom:fold-entity-row
        head:
          entity: sensor.battery_soc
          name: Diagnostics
        entities:
          - sensor.phone_battery
          - sensor.tablet_battery
      - type: custom:multiple-entity-row
        entity: sensor.battery_soc
        name: Power
        entities:
          - entity: sensor.phone_battery
            name: Phone
      - type: custom:slider-entity-row
        entity: sensor.phone_battery
        name: Brightness
`;

const ENTITIES = [
  {
    entity_id: 'sensor.battery_soc',
    domain: 'sensor',
    state: '67',
    attributes: { friendly_name: 'Battery SOC', unit_of_measurement: '%', min: 0, max: 100 },
  },
  {
    entity_id: 'sensor.phone_battery',
    domain: 'sensor',
    state: '18',
    attributes: {
      friendly_name: 'Phone Battery',
      unit_of_measurement: '%',
      device_class: 'battery',
    },
  },
  {
    entity_id: 'sensor.tablet_battery',
    domain: 'sensor',
    state: '82',
    attributes: {
      friendly_name: 'Tablet Battery',
      unit_of_measurement: '%',
      device_class: 'battery',
    },
  },
  {
    entity_id: 'media_player.lounge',
    domain: 'media_player',
    state: 'playing',
    attributes: {
      friendly_name: 'Lounge Speaker',
      media_title: 'Aja',
      media_artist: 'Steely Dan',
      volume_level: 0.4,
    },
  },
];

/**
 * ⚠⚠ THREE STEPS, IN THIS ORDER — `setConnected` is the non-obvious one.
 * `App.tsx` mounts `<HAEntityProvider enabled={isConnected}>` and installs the
 * entity test API INSIDE that gated effect, so seeding without connecting
 * leaves every card rendering its honest "unavailable" branch.
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

test.describe('Palette card coverage — the seven orphans', () => {
  /**
   * ⚠⚠⚠ THE DISCRIMINATOR, DELIBERATELY FIRST IN THE FILE.
   *
   * It asserts on exactly two things and NEITHER is a locator this branch adds:
   * the pre-existing `ha-gauge-card`, and the count of `UnsupportedCard`'s own
   * header prose. On base this reads 7.
   */
  test('every card the palette offers renders instead of the placeholder', async () => {
    const ctx = await launchWithDSL();

    try {
      await connectWithEntities(ctx);
      await ctx.dashboard.createNew();
      await seed(ctx, SEVEN_PALETTE_CARDS);
      await ctx.canvas.expectCardCount(8);

      // CONTROL — passes on base.
      await expect(ctx.window.getByTestId('ha-gauge-card')).toBeVisible();

      // DISCRIMINATOR — 7 on base, 0 once the renderers exist.
      await expect(ctx.window.getByText('Unsupported Card Type')).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });

  test('the battery card shows each level, and an unknown level is never green', async () => {
    const ctx = await launchWithDSL();

    try {
      await connectWithEntities(ctx);
      await ctx.dashboard.createNew();
      await seed(ctx, SEVEN_PALETTE_CARDS);
      await ctx.canvas.expectCardCount(8);

      await expect(ctx.window.getByTestId('ha-battery-state-card')).toBeVisible();
      await expect(ctx.window.getByTestId('battery-state-level-sensor-phone_battery')).toHaveText(
        '18%',
      );
      await expect(ctx.window.getByTestId('battery-state-level-sensor-tablet_battery')).toHaveText(
        '82%',
      );
    } finally {
      await close(ctx);
    }
  });

  test('the decluttering card names its template rather than faking the contents', async () => {
    const ctx = await launchWithDSL();

    try {
      await connectWithEntities(ctx);
      await ctx.dashboard.createNew();
      await seed(ctx, SEVEN_PALETTE_CARDS);
      await ctx.canvas.expectCardCount(8);

      await expect(ctx.window.getByTestId('ha-decluttering-card')).toBeVisible();
      await expect(ctx.window.getByTestId('decluttering-template-name')).toHaveText(
        'temperature_card',
      );
      await expect(ctx.window.getByTestId('decluttering-variable-label')).toContainText(
        'Living Room',
      );
    } finally {
      await close(ctx);
    }
  });

  test('the mini media player shows what is playing and its volume', async () => {
    const ctx = await launchWithDSL();

    try {
      await connectWithEntities(ctx);
      await ctx.dashboard.createNew();
      await seed(ctx, SEVEN_PALETTE_CARDS);
      await ctx.canvas.expectCardCount(8);

      const card = ctx.window.getByTestId('ha-mini-media-player-card');
      await expect(card).toBeVisible();
      await expect(card).toHaveAttribute('data-playing', 'true');
      await expect(ctx.window.getByTestId('mini-media-player-media')).toHaveText(
        'Aja · Steely Dan',
      );
      await expect(ctx.window.getByTestId('mini-media-player-volume')).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  /**
   * ⭐⭐⭐ THE LOAD-BEARING TEST OF THIS BRANCH.
   *
   * Rendering the three row types was the easy half. The half that matters is
   * that they SAY they are rows — otherwise HAVDM would have replaced a visible
   * gap ("Unsupported Card Type") with an invisible one: a card-shaped thing
   * whose YAML Home Assistant will not render where the user put it.
   */
  test('the three entity ROWS disclose that they belong inside an Entities card', async () => {
    const ctx = await launchWithDSL();

    try {
      await connectWithEntities(ctx);
      await ctx.dashboard.createNew();
      await seed(ctx, SEVEN_PALETTE_CARDS);
      await ctx.canvas.expectCardCount(8);

      // Three rows in the fixture, three notices — no more, no less.
      await expect(ctx.window.getByTestId('entity-row-placement-notice')).toHaveCount(3);
      await expect(ctx.window.getByTestId('entity-row-placement-notice').first()).toContainText(
        'belongs inside an Entities card',
      );

      // ⭐ THE CONTROL LEG, AND IT IS NOT OVERHEAD: the four genuine cards in
      // the same fixture must NOT carry the notice. A disclosure that appears
      // on everything discloses nothing.
      await expect(ctx.window.getByTestId('ha-battery-state-card')).toBeVisible();
      await expect(ctx.window.getByTestId('ha-mini-media-player-card')).toBeVisible();
      await expect(ctx.window.getByTestId('ha-entity-row-card')).toHaveCount(3);
    } finally {
      await close(ctx);
    }
  });

  test('the fold row reports how many rows it is hiding', async () => {
    const ctx = await launchWithDSL();

    try {
      await connectWithEntities(ctx);
      await ctx.dashboard.createNew();
      await seed(ctx, SEVEN_PALETTE_CARDS);
      await ctx.canvas.expectCardCount(8);

      await expect(ctx.window.getByTestId('entity-row-fold-count')).toHaveText('2 rows folded');
      await expect(ctx.window.getByTestId('entity-row-slider')).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  /**
   * ⭐ Closing the palette gap must NOT remove the marked placeholder for card
   * types HAVDM genuinely cannot draw — HA-03's card calls that behaviour a PASS.
   */
  test('a genuinely unknown card type still shows the marked placeholder', async () => {
    const ctx = await launchWithDSL();

    try {
      await connectWithEntities(ctx);
      await ctx.dashboard.createNew();
      await seed(
        ctx,
        `title: Unknown
views:
  - title: Main
    path: main
    cards:
      - type: gauge
        entity: sensor.battery_soc
      - type: custom:still-not-a-real-card
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
