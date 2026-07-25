import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

// View-level authoring (Tier 4, slice 4.6a): add / remove / reorder VIEWS and
// edit a view's identity properties via the ViewSettingsDialog. Runs in the
// default visual (Tabs) mode, where the view tab bar carries the add-view /
// view-settings triggers in its (height-neutral) extra-content slot.

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

const expectSelectedView = async (ctx: Ctx, index: string) =>
  expect(ctx.window.getByTestId('selection-debug-state')).toHaveAttribute(
    'data-selected-view',
    index,
  );

test.describe('View management (Tier 4, slice 4.6a)', () => {
  test('adds a view and renames it via View settings', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      // Starts with a single view, selected.
      await expect(window.getByRole('tab')).toHaveCount(1);
      await expectSelectedView(ctx, '0');

      // Add a view — it is appended AND selected.
      await window.getByTestId('view-add-button').click();
      await expect(window.getByRole('tab')).toHaveCount(2);
      await expectSelectedView(ctx, '1');

      // Rename the selected view through the settings dialog.
      await window.getByTestId('view-settings-button').click();
      await expect(window.getByTestId('view-settings-save')).toBeVisible();
      await window.getByTestId('view-settings-title').fill('Bedroom');
      await window.getByTestId('view-settings-save').click();

      // The dialog closes and the tab reflects the new title.
      await expect(window.getByTestId('view-settings-save')).toHaveCount(0);
      await expect(window.getByRole('tab', { name: 'Bedroom' })).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('reorders views with Move left / Move right', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      // Two views: "Home" (0) and "View 2" (1). The new view is selected.
      await window.getByTestId('view-add-button').click();
      await expect(window.getByRole('tab')).toHaveCount(2);
      await expectSelectedView(ctx, '1');

      // Move the selected view (index 1) left; selection follows it to index 0.
      await window.getByTestId('view-settings-button').click();
      await window.getByTestId('view-settings-move-left').click();
      await expectSelectedView(ctx, '0');
      // "View 2" is now the first tab.
      await expect(window.getByRole('tab').first()).toContainText('View 2');

      // At index 0, Move left is disabled; Move right is available.
      await expect(window.getByTestId('view-settings-move-left')).toBeDisabled();
      await window.getByTestId('view-settings-move-right').click();
      await expectSelectedView(ctx, '1');
      await expect(window.getByRole('tab').first()).toContainText('Home');
    } finally {
      await close(ctx);
    }
  });

  test('deletes a view and refuses to remove the last remaining one', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      // With a single view, Delete is disabled (a dashboard needs >= 1 view).
      await window.getByTestId('view-settings-button').click();
      await expect(window.getByTestId('view-settings-delete')).toBeDisabled();
      await window.getByTestId('view-settings-cancel').click();

      // Add a second (empty) view, then delete it — no confirm needed as it is empty.
      await window.getByTestId('view-add-button').click();
      await expect(window.getByRole('tab')).toHaveCount(2);
      await window.getByTestId('view-settings-button').click();
      await expect(window.getByTestId('view-settings-delete')).toBeEnabled();
      await window.getByTestId('view-settings-delete').click();

      // Back to one view, selection clamped to a survivor.
      await expect(window.getByRole('tab')).toHaveCount(1);
      await expectSelectedView(ctx, '0');
    } finally {
      await close(ctx);
    }
  });
});
