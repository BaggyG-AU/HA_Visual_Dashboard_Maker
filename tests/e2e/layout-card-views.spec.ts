import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

// First-class layout-card views (Tier 4, slice 4.7a).
//
// HAVDM stamps `type: custom:grid-layout` on its own flat-canvas scaffold, and
// the export boundary strips that type so the view deploys as plain HA masonry.
// A user's REAL layout-card grid view carries the SAME type — so before this
// slice it read as "Masonry" in the type editor and had its grid config
// destroyed on export. The scaffold now carries an internal marker, so HAVDM
// can tell the two apart and treats a real layout-card view as first-class.

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

const loadYaml = async (ctx: Ctx, yaml: string): Promise<void> => {
  await ctx.window.evaluate((y) => {
    const api = (window as unknown as { __dashboardTestApi?: { loadYaml: (y: string) => void } })
      .__dashboardTestApi;
    api?.loadYaml(y);
  }, yaml);
};

// A REAL layout-card grid view: a 6-column grid on 30px rows, with per-card
// `view_layout` positions. Nothing HAVDM would ever generate.
const REAL_LAYOUT_CARD_YAML = `title: Layout Card
views:
  - title: Grid
    path: grid
    type: custom:grid-layout
    layout_type: grid
    layout:
      grid_template_columns: repeat(6, 1fr)
      grid_template_rows: repeat(auto-fill, 30px)
      grid_gap: 4px
    cards:
      - type: button
        entity: light.a
        view_layout:
          grid_column: 1 / 4
          grid_row: 1 / 5
      - type: button
        entity: light.b
        view_layout:
          grid_column: 4 / 7
          grid_row: 1 / 5
`;

test.describe('First-class layout-card views (Tier 4, slice 4.7a)', () => {
  test("renders a user's real layout-card grid view on the canvas", async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, REAL_LAYOUT_CARD_YAML);

      // Both cards render on the flat canvas (not the sections canvas).
      await expect(window.getByTestId('canvas-card')).toHaveCount(2);
      await expect(window.getByTestId('sections-canvas')).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });

  test('the type editor shows a real layout-card view as itself, not as Masonry', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, REAL_LAYOUT_CARD_YAML);

      await window.getByTestId('view-settings-button').click();
      await expect(window.getByTestId('view-settings-save')).toBeVisible();

      // Before 4.7a this read "Masonry" — the user's own view type was hidden
      // from them, and saving anything could silently convert it.
      await expect(window.getByTestId('view-settings-type')).toContainText('custom:grid-layout');

      // ...and it stays selectable alongside the four standard HA types.
      await window.getByTestId('view-settings-type').click();
      const options = window.locator(
        '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option',
      );
      await expect(options).toHaveCount(5);
      const texts = (await options.allInnerTexts()).map((t) => t.trim());
      expect(texts.join(' ')).toMatch(/custom:grid-layout/);
    } finally {
      await close(ctx);
    }
  });

  test('warns before switching a layout-card view to a type that cannot deploy its grid', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, REAL_LAYOUT_CARD_YAML);

      await window.getByTestId('view-settings-button').click();
      await expect(window.getByTestId('view-settings-save')).toBeVisible();

      await window.getByTestId('view-settings-type').click();
      await window
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option', {
          hasText: /^Masonry$/,
        })
        .click();

      // The visible warning + an explicit Save IS the FR-026 confirmation:
      // nothing about the user's grid is discarded silently.
      await expect(window.getByText(/uses a layout-card grid/)).toBeVisible();

      await window.getByTestId('view-settings-save').click();
      await expect(window.getByTestId('view-settings-type')).toHaveCount(0);
      // Cards survive the type change.
      await expect(window.getByTestId('canvas-card')).toHaveCount(2);
    } finally {
      await close(ctx);
    }
  });
});
