/**
 * E2E: right-clicking a card on the canvas opens the Cut/Copy/Paste/Delete menu.
 *
 * Regression coverage for the v1.0.0 UAT round-1 defect CANVAS-06 — "No
 * right-click context menu display" — which is an `auto_covered: false` card, so
 * `docs/testing/UAT_STRATEGY.md` §7 requires it gain automated coverage as part
 * of the fix. §7 puts a workflow defect at the e2e layer.
 *
 * The unit spec (tests/unit/card-context-menu.spec.tsx) pins the CONTRACT —
 * BaseCard stays transparent to the props antd's Dropdown injects by
 * cloneElement. This one pins the OUTCOME a person actually experiences, on the
 * real canvas, with a real right-click.
 *
 * ⚠ CANVAS-06 also blocked the stated method of CLIP-01, CLIP-02 and CLIP-03,
 * all of which instruct the tester to right-click and choose Copy/Cut/Paste.
 */
import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

test.describe('Card context menu (UAT CANVAS-06)', () => {
  test('right-click on a canvas card offers Cut, Copy, Paste and Delete', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(1);

      await window.getByTestId('canvas-card').first().click({ button: 'right' });

      // ⭐ Before the fix nothing appeared at all: antd's injected
      // onContextMenu never reached a DOM node, so the menu never mounted.
      await expect(window.getByText('Cut', { exact: true })).toBeVisible();
      await expect(window.getByText('Copy', { exact: true })).toBeVisible();
      await expect(window.getByText('Paste', { exact: true })).toBeVisible();
      await expect(window.getByText('Delete', { exact: true })).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('right-clicking an UNSELECTED card selects it, so the action has a target', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(2);

      // Deselect everything so the right-click target is definitely unselected.
      await ctx.canvas.deselectCard();
      await ctx.canvas.expectNoSelection();

      await window.getByTestId('canvas-card').first().click({ button: 'right' });

      // ⭐ THE SECOND DEFECT, found only once the menu became visible at all.
      // Selection used to be set inside each ITEM handler and read back in the
      // same tick, so the action ran against an uncommitted selection and Delete
      // silently did nothing. Selecting on OPEN is what makes the menu usable.
      await ctx.canvas.expectCardSelected();
    } finally {
      await close(ctx);
    }
  });

  test('choosing Delete from the context menu removes that card', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(2);

      await window.getByTestId('canvas-card').first().click({ button: 'right' });
      await window.getByText('Delete', { exact: true }).click();

      // The menu is wired end to end, not merely rendered.
      await ctx.canvas.expectCardCount(1);
    } finally {
      await close(ctx);
    }
  });
});
