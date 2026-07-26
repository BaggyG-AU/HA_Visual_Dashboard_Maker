import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

// The layout-card EDITOR half (Tier 4, slice 4.7b).
//
// Slice 4.7a made a user's real layout-card view survive HAVDM: it renders on
// the canvas, reads as itself in the type editor, and is no longer destroyed at
// the export boundary. What it deliberately deferred is AUTHORING — this slice.
//
// 4.7b adds: a view-level grid editor (grid_template_columns / rows / gap), an
// explicit "convert this view into a real layout-card view" action, canvas
// row-height fidelity, and view/dashboard `strategy:` preservation.

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

const loadYaml = async (ctx: Ctx, yaml: string): Promise<void> => {
  await ctx.window.evaluate((y) => {
    const api = (window as unknown as { __dashboardTestApi?: { loadYaml: (y: string) => void } })
      .__dashboardTestApi;
    api?.loadYaml(y);
  }, yaml);
};

// A real layout-card grid view: 6 columns on 30px rows, per-card `view_layout`.
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

// A view whose cards Home Assistant generates from a strategy. It has no `cards`
// of its own — that is the point, and what made it so easy to destroy.
const STRATEGY_YAML = `title: Generated
views:
  - title: Auto
    path: auto
    strategy:
      type: original-states
`;

test.describe('Layout-card editor (Tier 4, slice 4.7b)', () => {
  test('exposes a grid editor for a real layout-card view, and edits round-trip', async ({
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

      // The grid editor is present and pre-filled from the user's own config.
      await expect(window.getByTestId('view-settings-grid-editor')).toBeVisible();
      await expect(window.getByTestId('view-settings-grid-columns')).toHaveValue('repeat(6, 1fr)');
      await expect(window.getByTestId('view-settings-grid-rows')).toHaveValue(
        'repeat(auto-fill, 30px)',
      );
      await expect(window.getByTestId('view-settings-grid-gap')).toHaveValue('4px');

      // Edit the column count and save.
      await window.getByTestId('view-settings-grid-columns').fill('repeat(3, 1fr)');
      await window.getByTestId('view-settings-save').click();
      await expect(window.getByTestId('view-settings-type')).toHaveCount(0);

      // Re-open: the edit stuck.
      await window.getByTestId('view-settings-button').click();
      await expect(window.getByTestId('view-settings-grid-columns')).toHaveValue('repeat(3, 1fr)');
      // ...and the keys the editor does not manage were not disturbed.
      await expect(window.getByTestId('view-settings-grid-gap')).toHaveValue('4px');
    } finally {
      await close(ctx);
    }
  });

  test('does NOT offer the grid editor for an ordinary masonry view', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      // createNew() stamps HAVDM's scaffold, which reads as Masonry.
      await ctx.dashboard.createNew();

      await window.getByTestId('view-settings-button').click();
      await expect(window.getByTestId('view-settings-save')).toBeVisible();
      await expect(window.getByTestId('view-settings-grid-editor')).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });

  test('converts an ordinary view into a real layout-card view, warning first', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await window.getByTestId('view-settings-button').click();
      await expect(window.getByTestId('view-settings-save')).toBeVisible();

      await window.getByTestId('view-settings-type').click();
      await window
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option', {
          hasText: /Layout card grid/,
        })
        .click();

      // layout-card is a HACS custom card — saying so before the save IS the
      // FR-026 confirmation, and the grid editor appears for the pending type.
      await expect(window.getByText(/needs the layout-card custom card installed/)).toBeVisible();
      await expect(window.getByTestId('view-settings-grid-editor')).toBeVisible();

      await window.getByTestId('view-settings-save').click();
      await expect(window.getByTestId('view-settings-type')).toHaveCount(0);

      // Re-open: the view is now a real layout-card view, not the scaffold, and
      // it reads as itself rather than as Masonry.
      await window.getByTestId('view-settings-button').click();
      await expect(window.getByTestId('view-settings-type')).toContainText('custom:grid-layout');
      await expect(window.getByTestId('view-settings-grid-editor')).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('reopening view settings shows the CURRENT values, not the first-opened ones', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      // Edit, save, reopen. Before 4.7b the dialog reopened holding the values
      // from the FIRST time it was opened: `destroyOnHidden` destroys the
      // Modal's DOM but not the component, so the antd form instance created by
      // Form.useForm() survived every close and its retained store beat
      // `initialValues` when the fields re-registered. Saving a second time then
      // wrote those stale values back OVER the user's edit — which for a grid
      // editor means silently reverting their layout.
      await window.getByTestId('view-settings-button').click();
      await expect(window.getByTestId('view-settings-save')).toBeVisible();
      await window.getByTestId('view-settings-title').fill('Bedroom');
      await window.getByTestId('view-settings-save').click();
      await expect(window.getByTestId('view-settings-save')).toHaveCount(0);

      await window.getByTestId('view-settings-button').click();
      await expect(window.getByTestId('view-settings-title')).toHaveValue('Bedroom');
    } finally {
      await close(ctx);
    }
  });

  test('shows a strategy view as generated by Home Assistant, not as an empty view', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, STRATEGY_YAML);

      // Before 4.7b this rendered the generic "No cards in this view. Drag cards
      // from the palette" placeholder — inviting the user to author cards that
      // cannot coexist with the strategy, on a view whose strategy the export
      // boundary was about to destroy.
      await expect(window.getByTestId('strategy-view-placeholder')).toBeVisible();
      await expect(window.getByText(/Home Assistant generates this view/)).toBeVisible();
      await expect(window.getByText(/original-states/)).toBeVisible();
    } finally {
      await close(ctx);
    }
  });
});
