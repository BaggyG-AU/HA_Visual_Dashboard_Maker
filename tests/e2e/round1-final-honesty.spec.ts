/**
 * E2E: the last three v1.0.0 UAT round-1 defects, all of them honesty defects.
 *
 * PROPS-05 (High)  — the conditional-visibility builder was hidden entirely on a
 *                    card with no entity, and its entity list was empty offline.
 * VIEWS-06 (Medium) — convert-to-sections dropped card geometry silently.
 * EXPORT-04 (Medium) — the palette never said WHY nothing is marked unavailable
 *                    when HAVDM has never connected.
 *
 * ⭐ The shared shape is THE VISION's "translate what you can, honestly MARK what
 * you cannot": in all three the product did something defensible and simply did
 * not say so. None of these is a data-loss bug; all three are the app failing to
 * tell the truth about its own state.
 */
import { expect, test } from '@playwright/test';
import { close, launchWithDSL, seedEntityCache } from '../support';

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

const FLAT_VIEW_WITH_GEOMETRY = `title: Geometry Loss
views:
  - title: Home
    path: home
    cards:
      - type: button
        name: Card A
        _havdm_layout: { x: 0, y: 0, w: 3, h: 2 }
      - type: button
        name: Card B
        _havdm_layout: { x: 3, y: 0, w: 3, h: 2 }
`;

const loadYaml = async (ctx: Ctx, yaml: string) => {
  await ctx.window.evaluate((y) => {
    (
      window as unknown as { __dashboardTestApi: { loadYaml: (yaml: string) => void } }
    ).__dashboardTestApi.loadYaml(y);
  }, yaml);
};

test.describe('PROPS-05: the conditional-visibility builder is reachable and usable', () => {
  test('the builder appears on a card that has NO entity set', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(1);
      await ctx.canvas.selectCard(0);

      // ⭐ THE DEFECT. A freshly added button card has no `entity`, and the
      // section was gated on the card having one — so the tester found "no
      // conditions option for Button card". The gate was wrong by construction:
      // each RULE carries its own entity picker, so a condition is about some
      // OTHER entity and the card's own entity is irrelevant.
      await ctx.conditionalVisibility.expectControlsVisible();
      await expect(ctx.window.getByTestId('visibility-add-root-condition')).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('a condition can pick an entity with NO Home Assistant connection', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      // Seed the PERSISTED offline cache, then disconnect. That is precisely
      // the state PROPS-03 defined as supported: HAVDM has seen the instance
      // before and must still let you author against it with no live socket.
      // Without the seed this would assert that an empty cache yields an empty
      // list, which is true and uninteresting.
      await seedEntityCache(ctx.window);
      await ctx.appDSL.setConnected(false);
      await ctx.dashboard.createNew();
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(1);
      await ctx.canvas.selectCard(0);

      await ctx.conditionalVisibility.addRootCondition();

      // ⭐⭐ THE SECOND DEFECT, AND IT IS PROPS-03 VERBATIM IN A FIFTH PICKER.
      // PR #102 unified "all four pickers" onto `loadPickerEntities()` (the
      // cached, offline-capable source). ConditionalVisibilityControls was
      // missed and still read the LIVE state map, which is empty with no
      // connection — so the entity dropdown offered nothing and the card could
      // not be tested at all. The count was wrong: there were five.
      const entitySelect = ctx.window.getByTestId('visibility-condition-entity-0');
      await expect(entitySelect).toBeVisible();
      await entitySelect.locator('.ant-select-content').click();

      const dropdown = ctx.window.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
      await expect(dropdown).toBeVisible();
      // ⚠ Assert the VISIBLE virtual-list option, never getByRole('option') —
      // antd v6 renders a hidden 0x0 a11y listbox that Playwright will happily
      // click to no effect.
      await expect(dropdown.locator('.ant-select-item-option').first()).toBeVisible();
    } finally {
      await close(ctx);
    }
  });
});

test.describe('VIEWS-06: convert-to-sections says that geometry was not carried over', () => {
  test('the conversion notice names the loss and how to recover', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, FLAT_VIEW_WITH_GEOMETRY);
      await ctx.canvas.expectCardCount(2);

      // ⚠⚠ THE CONTROL THAT MATTERS IS *NOT* THE CANVAS BANNER. GridCanvas
      // renders that banner only inside `if (cards.length === 0)`, so a
      // populated view has no banner at all — converting one goes through
      // View Settings -> Type -> Sections, and that is the only path on which
      // geometry can actually be lost. Driving the banner here would have
      // tested a conversion that migrates nothing.
      await ctx.window.getByTestId('view-settings-button').click();

      // ⚠ NOT `expect(getByTestId('view-settings-dialog')).toBeVisible()` —
      // antd puts a Modal's testid on `.ant-modal-root`, which is ALWAYS
      // reported hidden (the visible node is `.ant-modal-wrap`). Wait for a
      // real control inside the dialog instead.
      const typeSelect = ctx.window.getByTestId('view-settings-type');
      await expect(typeSelect).toBeVisible();
      await typeSelect.locator('.ant-select-content').click();
      const dropdown = ctx.window.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
      await dropdown.locator('.ant-select-item-option[title="Sections"]').click();

      // ⭐ CONTROL LEG: the dialog already warns BEFORE saving, and that warning
      // is accurate. Asserting it here proves the pre-save half was never the
      // defect — so the post-save notice below is an addition, not a duplicate.
      await expect(ctx.window.getByTestId('view-settings-type-warning')).toBeVisible();

      await ctx.window.getByTestId('view-settings-save').click();

      // ⭐ The card's Expected is explicit: the layout is NOT expected to
      // survive, but HAVDM must SAY SO. Silent geometric loss is the defect,
      // and before this change the app said only "View updated".
      await expect(ctx.window.getByText(/positions were not carried over/i)).toBeVisible();
      // The recovery route must be named too — the notice is useless if it
      // reports a loss the user cannot undo.
      await expect(ctx.window.getByText(/Ctrl\+Z/i)).toBeVisible();
    } finally {
      await close(ctx);
    }
  });
});

test.describe('EXPORT-04: the palette is honest about a never-connected profile', () => {
  test('it says why nothing is marked unavailable when HAVDM has never connected', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.appDSL.setConnected(false);
      await ctx.dashboard.createNew();
      await ctx.palette.waitUntilVisible();

      // ⭐ Showing every card as Available with no connection is CORRECT — it is
      // ratified vision answer 5 (never-connected = PERMISSIVE), and the round-1
      // tester marked EXPORT-04 Fail precisely because nothing was marked. The
      // defect is not the permissiveness; it is that the palette never said the
      // list is unverified. An unexplained default is indistinguishable from a
      // broken one.
      const notice = ctx.window.getByTestId('palette-availability-notice');
      await expect(notice).toBeVisible();
      await expect(notice).toContainText(/not connected/i);

      // ⚠⚠⚠ EXPORT-04 defect 2 — THIS ASSERTION IS THE POINT, AND ITS ABSENCE IS
      // WHY THIS SPEC WAS GREEN THROUGH A DEFECT IT IS NAMED AFTER.
      //
      // `toBeVisible()` above passed for months while the tester wrote "There is
      // no 'pallet footer' that I can see". Playwright calls an element visible
      // when it has a non-empty bounding box and is not `visibility: hidden` — an
      // element CLIPPED AWAY by an ancestor's `overflow: hidden` still has a
      // bounding box, so the notice satisfied `toBeVisible()` at y≈1096 on a 1080
      // viewport. The Sider was `height: 100vh` beneath a 64px Header.
      //
      // ⭐ A CONTROL IS NOT VISIBLE BECAUSE THE DOM SAYS SO — IT IS VISIBLE WHEN
      // IT IS INSIDE THE VIEWPORT. Measure the geometry, not the node. This is
      // the same family as the recorded trap that Playwright counts an
      // `opacity: 0` element as visible.
      const box = await notice.boundingBox();
      expect(box, 'the availability notice must have a layout box').not.toBeNull();
      const viewportHeight = await ctx.window.evaluate(() => window.innerHeight);
      expect(
        box!.y + box!.height,
        `the notice must sit INSIDE the ${viewportHeight}px viewport without scrolling, ` +
          `but its bottom edge is at ${box!.y + box!.height}px`,
      ).toBeLessThanOrEqual(viewportHeight);
    } finally {
      await close(ctx);
    }
  });

  test('CONTROL LEG: canvas-only cards are STILL marked when disconnected', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.appDSL.setConnected(false);
      await ctx.dashboard.createNew();
      await ctx.palette.waitUntilVisible();
      // Categories start collapsed, so no badge renders until one is opened.
      // `custom:native-graph-card` and `custom:havdm-progress-ring` are both
      // canvas-only and both filed under Sensors & Display.
      await ctx.palette.expandCategory('Sensors & Display');

      // ⭐⭐ THIS LEG IS WHY THE FIX IS SCOPED THE WAY IT IS. `resolveCardState`
      // checks the canvas-only set BEFORE the never-connected permissive branch,
      // so phantom card types stay marked with no connection — that half already
      // worked and must not regress while the notice is added. Without this leg
      // a "fix" that made everything unmarked offline would look correct.
      await expect(ctx.window.getByText('HAVDM-only').first()).toBeVisible();
    } finally {
      await close(ctx);
    }
  });
});
