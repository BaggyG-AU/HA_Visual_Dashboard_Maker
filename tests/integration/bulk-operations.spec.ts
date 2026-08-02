import { test, expect } from '@playwright/test';
import { close, launchWithDSL } from '../support';

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

// ⭐ CLIP-04's fixture, and the point of it: the cards DIFFER on the axes the
// bulk write must PRESERVE (entity, icon). Every pre-existing bulk spec used
// identical blank cards, which is exactly why none of them could ever have
// caught a write that clones the edited card over the whole selection.
const DISTINCT_BUTTONS = `title: CLIP-04
views:
  - title: Main
    path: main
    cards:
      - type: button
        entity: sensor.alpha
        name: Alpha
        icon: mdi:alpha
      - type: button
        entity: sensor.beta
        name: Beta
        icon: mdi:beta
      - type: button
        entity: sensor.gamma
        name: Gamma
        icon: mdi:gamma
`;

const MIXED_TYPES = `title: CLIP-04 mixed
views:
  - title: Main
    path: main
    cards:
      - type: button
        entity: sensor.alpha
        name: Alpha
      - type: button
        entity: sensor.beta
        name: Beta
      - type: markdown
        content: Gamma markdown
`;

const SECTIONS_BUTTONS = `title: CLIP-04 sections
views:
  - title: Home
    path: home
    type: sections
    max_columns: 3
    sections:
      - type: grid
        title: Buttons
        cards:
          - type: button
            entity: sensor.alpha
            name: Alpha
          - type: button
            entity: sensor.beta
            name: Beta
          - type: button
            entity: sensor.gamma
            name: Gamma
`;

const seed = async (ctx: Ctx, yaml: string): Promise<void> => {
  await ctx.window.evaluate((source) => {
    const api = (window as unknown as { __dashboardTestApi?: { loadYaml: (y: string) => void } })
      .__dashboardTestApi;
    api?.loadYaml(source);
  }, yaml);
};

/**
 * Read the whole dashboard back through the real YAML editor.
 *
 * ⚠ Call this ONCE per test and leave the modal open — `yamlEditor.close()`
 * asserts `toHaveCount(0)` on the modal, and a closed antd Modal KEEPS its DOM.
 */
const readDashboardYaml = async (ctx: Ctx): Promise<string> => {
  await ctx.yamlEditor.open();
  return ctx.yamlEditor.getEditorContent('modal');
};

const selectThreeWithCtrlClick = async (ctx: Ctx): Promise<void> => {
  await ctx.canvas.selectCard(0);
  await ctx.canvas.toggleCardSelection(1);
  await ctx.canvas.toggleCardSelection(2);
  await ctx.canvas.expectSelectedCards([0, 1, 2]);
};

test.describe('Bulk Operations Integration', () => {
  /**
   * ⚠⚠⚠ CLIP-04's DISCRIMINATOR, AND IT IS DELIBERATELY THE FIRST TEST IN THE
   * FILE. It asserts only on YAML and on `selection-debug-state`, both of which
   * exist on the base commit — so when `src/` is stashed for the red leg it
   * fails because the DEFECT is back, not because a testid this branch added
   * has gone missing.
   *
   * On base: editing the name of card 2 with all three selected rewrote cards 0
   * and 1 to `sensor.gamma` / `mdi:gamma` as well. One field changed, four
   * values silently destroyed, and the app said "Updated 3 cards".
   */
  test('a bulk edit changes ONLY the edited field, not the whole card (CLIP-04)', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await seed(ctx, DISTINCT_BUTTONS);
      await ctx.canvas.expectCardCount(3);

      // Ctrl+Click to three — the exact input path CLIP-04's step 1 specifies.
      // (The e2e spec reaches three by SHIFT-range instead, so this path had no
      // coverage at N=3 at all.)
      await selectThreeWithCtrlClick(ctx);

      await ctx.properties.setCardName('CLIP04 Bulk');
      await ctx.window.waitForTimeout(2000); // outlast the 800ms debounced commit

      const yaml = await readDashboardYaml(ctx);

      // The edit reaches every selected card...
      expect(yaml.match(/name: CLIP04 Bulk/g) ?? []).toHaveLength(3);

      // ...and every property the user did NOT touch survives, per card.
      expect(yaml).toContain('sensor.alpha');
      expect(yaml).toContain('sensor.beta');
      expect(yaml).toContain('sensor.gamma');
      expect(yaml).toContain('mdi:alpha');
      expect(yaml).toContain('mdi:beta');
      expect(yaml).toContain('mdi:gamma');
    } finally {
      await close(ctx);
    }
  });

  test('the panel says how many cards it is editing (CLIP-04)', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await seed(ctx, DISTINCT_BUTTONS);
      await ctx.canvas.expectCardCount(3);

      // ⭐ The control leg, and it is not overhead: a single selection must NOT
      // grow a "editing N cards" notice, or the disclosure means nothing.
      await ctx.canvas.selectCard(0);
      await ctx.properties.expectNoMultiSelectNotice();

      await selectThreeWithCtrlClick(ctx);
      await ctx.properties.expectMultiSelectNotice(3);
    } finally {
      await close(ctx);
    }
  });

  /**
   * Owner decision 2026-08-02, option C1: keep the type guard, disclose it.
   * The guard itself is correct and was never the CLIP-04 defect — what was
   * wrong is that it skipped cards in total silence.
   */
  test('a mixed-type selection is told which cards will not change (CLIP-04)', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await seed(ctx, MIXED_TYPES);
      await ctx.canvas.expectCardCount(3);

      // Primary is card 2, the markdown — so the two buttons are the ones the
      // guard will skip.
      await selectThreeWithCtrlClick(ctx);

      await ctx.properties.expectMultiSelectNotice(3);
      await ctx.properties.expectMultiSelectTypeNotice(/1 of 3 is a .* card and will change/);
      await ctx.properties.expectMultiSelectTypeNotice(/other 2 cards are a different type/);
    } finally {
      await close(ctx);
    }
  });

  /**
   * Owner-added scope, 2026-08-02. `App.tsx` took a `selectedSectionIndex
   * !== null` early return commented "sections are single-select this slice, so
   * no bulk apply" and never reached `applyBulkCardUpdate` — while
   * `selectSectionCardWithMode` multi-selected within a section perfectly well.
   * So the canvas reported three cards selected and the edit landed on one.
   */
  test('a bulk edit fans out on a SECTIONS view too (CLIP-04)', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await seed(ctx, SECTIONS_BUTTONS);
      await ctx.canvas.expectCardCount(3);

      await selectThreeWithCtrlClick(ctx);

      await ctx.properties.setCardName('Section Bulk');
      await ctx.window.waitForTimeout(2000);

      const yaml = await readDashboardYaml(ctx);
      expect(yaml.match(/name: Section Bulk/g) ?? []).toHaveLength(3);

      // Untouched entities still survive per card, exactly as on the flat canvas.
      expect(yaml).toContain('sensor.alpha');
      expect(yaml).toContain('sensor.beta');
      expect(yaml).toContain('sensor.gamma');
    } finally {
      await close(ctx);
    }
  });

  test('applies bulk delete and single-step undo history', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.palette.addCard('button');
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(3);

      await ctx.canvas.selectCard(0);
      await ctx.canvas.toggleCardSelection(2);
      await ctx.canvas.expectSelectedCards([0, 2]);

      await ctx.appDSL.deleteSelection();
      await ctx.canvas.expectCardCount(1);
      await ctx.appDSL.expectCanUndo(true);

      await ctx.appDSL.undo();
      await ctx.canvas.expectCardCount(3);
    } finally {
      await close(ctx);
    }
  });

  // NOTE: undo granularity was never the problem — that part of this test's name
  // is a leftover from a misdiagnosis. A bulk multi-select edit records exactly
  // ONE history entry and ONE undo restores BOTH cards. What kept this skipped
  // was the assertion path: expectCardName() reads the properties form, and the
  // form kept showing the edited value after undo because antd's setFieldsValue
  // merges. Unskipped once PropertiesPanel began clearing fields the reloaded
  // card no longer has.
  test('applies bulk property edit to selected cards and preserves undo granularity', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(2);

      await ctx.canvas.selectCard(0);
      const firstOriginal = await ctx.properties.getCardName();

      await ctx.canvas.selectCard(1);
      const secondOriginal = await ctx.properties.getCardName();

      await ctx.canvas.selectCard(0);
      await ctx.canvas.toggleCardSelection(1);
      await ctx.canvas.expectSelectedCards([0, 1]);

      await ctx.properties.setCardName('Bulk Edited');

      await ctx.canvas.selectCard(0);
      await ctx.properties.expectCardName('Bulk Edited');
      await ctx.canvas.selectCard(1);
      await ctx.properties.expectCardName('Bulk Edited');

      await ctx.appDSL.expectCanUndo(true);
      await ctx.appDSL.undo();

      await ctx.canvas.selectCard(0);
      await ctx.properties.expectCardName(firstOriginal);
      await ctx.canvas.selectCard(1);
      await ctx.properties.expectCardName(secondOriginal);

      expect(firstOriginal).not.toBe('Bulk Edited');
      expect(secondOriginal).not.toBe('Bulk Edited');
    } finally {
      await close(ctx);
    }
  });
});
