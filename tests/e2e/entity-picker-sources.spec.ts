import { expect, test } from '@playwright/test';
import { close, launchWithDSL, seedEntityCache, clearEntityCache } from '../support';

/**
 * Regression cover for the v1.0.0 UAT round-1 High defects HA-04 and PROPS-03,
 * both of which are caused by the SAME asymmetry: HAVDM had four entity pickers
 * reading the same dataset through three different sources.
 *
 *   EntityBrowser        -> getCachedEntities() directly ...... CACHE-ONLY
 *   EntitySelect         -> loadPickerEntities() ............... live -> cache  (correct)
 *   EntityMultiSelect    -> loadPickerEntities() ............... live -> cache  (correct)
 *   EntityRemappingModal -> availableEntities prop <- RemapWatcher
 *                           <- useHAEntities() inside
 *                              <HAEntityProvider enabled={isConnected}> ... LIVE-ONLY
 *
 * `entityPickerSource.ts` was written to fix exactly this class of bug — its own
 * header describes the "Not Connected wall with an empty dropdown" — but only the
 * two inline pickers ever got it. A fix applied to SOME consumers of a shared
 * dataset is not a fix; it is a new inconsistency, and the unconverted consumers
 * are where the next defects were duly found.
 *
 * HA-04, tester verbatim: "Missing entities listed. Auto-map All does nothing.
 * \"No data\" mesage in the entity browser (\"Select replacement entity\")".
 * Measured on `57de2ec` WITH THE CACHE DELIBERATELY SEEDED and no live
 * connection: available-count 0, and BOTH referenced entities reported missing
 * even though both were sitting in the cache. `detectMissing` filters the
 * referenced ids against the available set, so an EMPTY available set reports
 * EVERYTHING as missing — an empty list means "I do not know what exists", not
 * "nothing exists". That is the HA-03 dishonest-failure family again, and it is
 * strictly worse than the reported symptom: HAVDM asserted a fact about the
 * user's Home Assistant that it had no basis for.
 *
 * PROPS-03, tester verbatim: "Not connected to HA so no entities available" — on
 * a card whose own pre-condition reads "Works both connected and not". Measured:
 * with the cache cleared the picker offers 0 options and renders antd's "No
 * data"; with the cache seeded it offers real entities. So the offline fallback
 * is healthy and the actual defect is that the `source === 'none'` branch of
 * EntitySelect renders a Select with no options, no search and NO WAY TO TYPE A
 * KNOWN ENTITY ID — a read-only dead end, which contradicts THE VISION's
 * never-connected-is-PERMISSIVE ruling.
 */

const DASH = `title: Picker
views:
  - title: Home
    path: home
    cards:
      - type: button
        entity: light.living_room
      - type: gauge
        entity: sensor.temperature
`;

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

const load = async (ctx: Ctx, yamlText: string): Promise<void> => {
  await ctx.window.evaluate((s) => {
    (
      window as unknown as { __dashboardTestApi?: { loadYaml: (v: string) => void } }
    ).__dashboardTestApi?.loadYaml(s);
  }, yamlText);
  await ctx.window.waitForTimeout(800);
};

const remapDebug = (ctx: Ctx) =>
  ctx.window.evaluate(() => {
    const el = document.querySelector('[data-testid="remap-debug-state"]');
    if (!el) return null;
    return {
      missing: Number(el.getAttribute('data-missing-count')),
      available: Number(el.getAttribute('data-available-count')),
    };
  });

const openOptionCount = async (ctx: Ctx, testid: string): Promise<number> => {
  const node = ctx.window.getByTestId(testid).first();
  await node.click({ force: true });
  await ctx.window.waitForTimeout(700);
  return ctx.window.evaluate(
    () => document.querySelectorAll('.ant-select-dropdown .ant-select-item-option').length,
  );
};

test.describe('Entity picker data sources (HA-04, PROPS-03)', () => {
  test('HA-04: the remap path reads the offline cache instead of reporting everything missing', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    try {
      const { window: w } = ctx;
      await ctx.appDSL.waitUntilReady();

      // Cache seeded, NOT live-connected. The seeded cache contains
      // light.living_room and sensor.temperature — the two entities the
      // dashboard references — so nothing is genuinely missing.
      await seedEntityCache(w);
      await load(ctx, DASH);

      await w.getByTestId('remap-open-manual').click();
      await w.waitForTimeout(1200);
      await expect(w.getByTestId('entity-remapping-modal')).toHaveCount(1);

      const dbg = await remapDebug(ctx);
      expect(dbg).not.toBeNull();

      // ⭐ THE DEFECT. The cache holds entities, so the remap path must see them.
      expect(dbg!.available).toBeGreaterThan(0);

      // ⭐ AND THE HONESTY HALF, which matters more: entities present in the
      // entity list must NOT be reported as missing. Asserting only the
      // available count would pass while HAVDM still libelled the user's config.
      expect(dbg!.missing).toBe(0);
    } finally {
      await close(ctx);
    }
  });

  test('PROPS-03: an entity id can still be entered with no connection and no cache', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    try {
      const { window: w } = ctx;
      await ctx.appDSL.waitUntilReady();

      // The reported condition: never connected AND nothing cached.
      await clearEntityCache(w);
      await load(ctx, DASH);
      await w
        .getByTestId('canvas-card')
        .first()
        .click({ position: { x: 12, y: 12 } });
      await w.waitForTimeout(900);

      const field = w.getByTestId('entity-select').first();
      await expect(field).toBeVisible();

      // ⭐ THE DEFECT. The card's pre-condition is "Works both connected and
      // not", and THE VISION makes the never-connected default PERMISSIVE. A
      // user who knows the id must be able to type it.
      await field.fill('sensor.hand_typed_entity');
      await w.waitForTimeout(600);

      const committed = await w.evaluate(
        () =>
          (document.querySelector('[data-testid="entity-select"]') as HTMLInputElement | null)
            ?.value ?? null,
      );
      expect(committed).toBe('sensor.hand_typed_entity');
    } finally {
      await close(ctx);
    }
  });

  test('card-aware filtering: a gauge offers only numeric entities', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    try {
      const { window: w } = ctx;
      await ctx.appDSL.waitUntilReady();

      // The seeded cache mixes a light, a binary_sensor and numeric sensors.
      await seedEntityCache(w);
      await load(ctx, DASH);

      // Card 1 is the gauge.
      await w
        .getByTestId('canvas-card')
        .nth(1)
        .click({ position: { x: 12, y: 12 } });
      await w.waitForTimeout(900);

      const count = await openOptionCount(ctx, 'entity-select');
      expect(count).toBeGreaterThan(0);

      const labels = await w.evaluate(() =>
        Array.from(document.querySelectorAll('.ant-select-dropdown .ant-select-item-option'))
          .map((o) => o.getAttribute('title') ?? o.textContent ?? '')
          .join('\n'),
      );

      // ⭐ A gauge cannot render a light or a binary_sensor. This is the owner's
      // own example — "when creating a gauge, there are so many entities that it
      // is hard to find what you actually want to use".
      expect(labels).not.toContain('light.living_room');
      expect(labels).not.toContain('binary_sensor.motion_detected');

      // ⭐ CONTROL LEG: proving only an ABSENCE would pass just as well if the
      // filter had emptied the list entirely. A numeric entity must survive.
      expect(labels).toContain('sensor.temperature');
    } finally {
      await close(ctx);
    }
  });
});
