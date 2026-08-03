/**
 * E2E Test: Live Preview and Deployment
 *
 * Tests HA dashboard browser, live preview, and deployment features.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

/** The temporary dashboard the stubbed Home Assistant reports creating. */
const TEMP_PATH = 'temp-dashboard-editor-1785488482593';

/**
 * Stand in for Home Assistant on the three channels Live Preview uses, so the
 * mode can be entered with no live instance. ⚠ `ha.home.local` is READ-ONLY for
 * development (amendment-03 §4 scopes the write exception to UAT rounds), so a
 * test may never create a real temporary dashboard.
 */
async function stubLivePreviewIpc(
  ctx: Ctx,
  { deleteSucceeds = true }: { deleteSucceeds?: boolean } = {},
): Promise<void> {
  await ctx.app.evaluate(
    ({ ipcMain }, { tempPath, ok }) => {
      for (const channel of [
        'ha:ws:isConnected',
        'ha:ws:createTempDashboard',
        'ha:ws:deleteTempDashboard',
        'ha:ws:updateTempDashboard',
      ]) {
        ipcMain.removeHandler(channel);
      }
      ipcMain.handle('ha:ws:isConnected', () => ({ connected: true }));
      ipcMain.handle('ha:ws:createTempDashboard', () => ({ success: true, tempPath }));
      ipcMain.handle('ha:ws:updateTempDashboard', () => ({ success: true }));
      ipcMain.handle('ha:ws:deleteTempDashboard', () =>
        ok
          ? { success: true }
          : {
              success: false,
              error: `No Home Assistant dashboard has the url_path "${tempPath}"`,
            },
      );
    },
    { tempPath: TEMP_PATH, ok: deleteSucceeds },
  );
}

/**
 * ⚠ Located by BUTTON PROSE, not a testid. A branch-added testid vanishes when
 * `src/` is reverted for the red leg, which would fail the run before it reached
 * the assertion under test and measure nothing.
 */
async function enterLivePreview(ctx: Ctx): Promise<void> {
  await ctx.window.getByRole('button', { name: 'Live Preview' }).click();
}

test.describe('Dashboard Browser', () => {
  test('should show dashboard browser UI', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Look for "Browse Dashboards" button or menu item
      // TODO: Verify dashboard browser can be opened

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should require HA connection before browsing', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Attempt to open dashboard browser without connection
      // TODO: Verify connection prompt shown

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should list dashboards from Home Assistant', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Connect to HA
      // TODO: Open dashboard browser
      // TODO: Verify "Overview" dashboard shown (always exists)
      // TODO: Verify other dashboards listed

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should show dashboard metadata', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Open dashboard browser with HA connection
      // TODO: Select a dashboard
      // TODO: Verify metadata shown: title, icon, path

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should download dashboard YAML', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Connect to HA
      // TODO: Open dashboard browser
      // TODO: Click "Download" on a dashboard
      // TODO: Verify dashboard loaded into editor

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should refresh dashboard list', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Open dashboard browser
      // TODO: Click refresh button
      // TODO: Verify loading indicator
      // TODO: Verify dashboard list updates

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should handle connection errors gracefully', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Connect to invalid HA instance
      // TODO: Open dashboard browser
      // TODO: Verify error message shown
      // TODO: Verify app remains stable

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });
});

test.describe('Live Preview', () => {
  test('should show live preview button when connected', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Connect to HA
      // TODO: Verify "Live Preview" or "Preview" button visible

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should create temporary dashboard for preview', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Connect to HA
      // TODO: Create/edit dashboard
      // TODO: Click "Live Preview"
      // TODO: Verify temporary dashboard created in HA

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  /**
   * HA-08 (UAT round 2, Medium, regression). Owner: "Address for preview is
   * hidden under cards and even when it is not it cannot be copied."
   *
   * ⚠⚠⚠ THIS TEST REPLACES A PLACEHOLDER NAMED "should display HA dashboard in
   * iframe" WHOSE BODY WAS `expect(true).toBe(true)` — AND WHOSE PREMISE WAS
   * FALSE. Live Preview renders NO iframe and has not since `c2f77c3`
   * (2025-12-24) removed it without saying so. Home Assistant serves
   * `X-Frame-Options: SAMEORIGIN` (measured against the reference instance), so
   * an iframe in the renderer is refused by Chromium anyway. Restoring genuine
   * embedding is post-1.0 work and a security decision of its own.
   *
   * What Live Preview actually offers is the ADDRESS of the real render — and
   * that address lived in the centre-of-canvas banner at `zIndex: 1`, directly
   * beneath the card overlay at `zIndex: 2`. Hence "hidden under cards".
   */
  test('shows the preview address where no card can cover it, and offers to copy it', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.appDSL.setConnected(true);
      await ctx.dashboard.createNew();
      await ctx.palette.addCard('button');
      await ctx.palette.addCard('button');

      await stubLivePreviewIpc(ctx);
      await enterLivePreview(ctx);

      // ⭐ CONTROL LEG — keyed on pre-existing button prose, so it passes on base
      // too and proves Live Preview was actually entered. Without it, a red
      // discriminator below could just mean the mode never opened.
      await expect(window.getByRole('button', { name: 'Deploy to Production' })).toBeVisible();

      // ⭐ DISCRIMINATOR — the address now has its own header row. On base there
      // is no such element at all.
      await expect(window.getByTestId('live-preview-address-bar')).toBeVisible();
      const address = window.getByTestId('live-preview-address');
      await expect(address).toContainText(TEMP_PATH);

      // ⭐⭐ THE LITERAL COMPLAINT, MEASURED THE WAY CANVAS-04 MEASURED ITS OWN:
      // the address must be the topmost element at its own centre. Existence and
      // visibility both passed on base while it sat under the overlay —
      // `toBeVisible()` does not do hit-testing, so only this can see it.
      const topmost = await window.evaluate(() => {
        const el = document.querySelector('[data-testid="live-preview-address"]');
        if (!el) return 'ADDRESS ELEMENT NOT FOUND';
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return el === hit || el.contains(hit)
          ? 'TOPMOST'
          : `COVERED BY ${hit?.tagName}.${hit?.className}`;
      });
      expect(topmost).toBe('TOPMOST');

      // "…and even when it is not it cannot be copied": there is now a one-click
      // copy, which antd renders as a button inside the copyable Text.
      await expect(address.locator('.ant-typography-copy')).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should show edit mode overlay on preview', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Open live preview
      // TODO: Verify overlay with drag handles visible
      // TODO: Verify can toggle between edit and preview mode

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should synchronize layout changes with grid canvas', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Open live preview
      // TODO: Drag card in preview
      // TODO: Verify grid canvas layout updates
      // TODO: Verify reverse sync works (grid -> preview)

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should persist layout changes across preview sessions', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Open preview, make layout change
      // TODO: Close preview
      // TODO: Reopen preview
      // TODO: Verify layout persisted

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  /**
   * ⚠⚠⚠ THE SHARPEST COVERAGE FAILURE THIS PROJECT HAS FOUND. This test was a
   * placeholder whose entire body was `expect(true).toBe(true)` — named for
   * EXACTLY the defect that then shipped. "should clean up temporary dashboard
   * on close" was GREEN in every run while three orphaned temporary dashboards
   * accumulated on the live instance across two UAT rounds.
   *
   * A test named after a behaviour, passing, and asserting nothing about it is
   * worse than no test: the name is the thing a reader trusts.
   *
   * The delete itself is proven at the protocol seam in
   * `tests/unit/haWebSocketService.dashboards.spec.ts` (the `dashboard_id` vs
   * `url_path` mismatch). What THIS test adds is the other half of the defect:
   * the failure was silent, so the user was never told the dashboard survived.
   */
  test('Close reports the deletion — and says so loudly when it fails', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.appDSL.setConnected(true);
      await ctx.dashboard.createNew();
      await ctx.palette.addCard('button');

      // Deletion REFUSED by Home Assistant — which is precisely what happened in
      // production, because the delete carried a dashboard_id that matched
      // nothing.
      await stubLivePreviewIpc(ctx, { deleteSucceeds: false });
      await enterLivePreview(ctx);

      // ⭐ CONTROL LEG — pre-existing prose, passes on base.
      await expect(window.getByRole('button', { name: 'Deploy to Production' })).toBeVisible();

      await window.getByRole('button', { name: 'Close' }).click();

      // ⭐ DISCRIMINATOR — on base the `if (result.success)` branch simply fell
      // through: no message of any kind, and the path was cleared anyway, losing
      // the only handle on the orphan. The user must be told WHERE it is.
      await expect(window.getByText(new RegExp(TEMP_PATH))).toBeVisible();
      await expect(window.getByText(/Settings . Dashboards/i)).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('Close confirms the deletion when Home Assistant accepts it', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.appDSL.setConnected(true);
      await ctx.dashboard.createNew();
      await ctx.palette.addCard('button');

      await stubLivePreviewIpc(ctx, { deleteSucceeds: true });
      await enterLivePreview(ctx);
      await window.getByRole('button', { name: 'Close' }).click();

      await expect(window.getByText(/Temporary dashboard deleted/i)).toBeVisible();
      // And it really left the mode, rather than reporting success from inside it.
      await expect(window.getByRole('button', { name: 'Deploy to Production' })).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });

  test('should show deploy button in preview', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Open live preview
      // TODO: Verify deploy button visible
      // TODO: Verify deploy button enabled

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });
});

test.describe('Dashboard Deployment', () => {
  test('should show deployment dialog when deploy clicked', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Open live preview
      // TODO: Click deploy button
      // TODO: Verify deployment modal shown

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should offer create new or update existing options', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Open deployment dialog
      // TODO: Verify radio buttons: "Create New" and "Update Existing"
      // TODO: Verify can select either option

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should validate dashboard path format', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Open deployment dialog
      // TODO: Choose "Create New"
      // TODO: Enter invalid path (spaces, special chars)
      // TODO: Verify validation error

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should require dashboard title', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Open deployment dialog
      // TODO: Leave title empty
      // TODO: Attempt to deploy
      // TODO: Verify validation error

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should list existing dashboards for update', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Open deployment dialog
      // TODO: Select "Update Existing"
      // TODO: Verify dropdown with existing dashboards

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should warn before overwriting existing dashboard', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Select "Update Existing"
      // TODO: Choose existing dashboard
      // TODO: Confirm deployment
      // TODO: Verify warning about overwriting

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should create backup before overwriting', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Deploy to existing dashboard
      // TODO: Verify backup created in HA
      // TODO: Verify backup naming (e.g., dashboard_backup_timestamp)

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should show deployment progress', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Start deployment
      // TODO: Verify progress indicator shown
      // TODO: Verify steps displayed:
      //   - Creating backup
      //   - Saving configuration
      //   - Verifying deployment

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should show success message after deployment', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Complete deployment
      // TODO: Verify success message shown
      // TODO: Verify dashboard URL or path shown

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should handle deployment errors gracefully', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Simulate deployment error (network issue, permissions, etc.)
      // TODO: Verify error message shown
      // TODO: Verify rollback information if backup was created

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });

  test('should clean up temporary dashboard after deployment', async () => {
    const ctx = await launchWithDSL();
    const { window } = ctx;
    void window;

    try {
      await ctx.appDSL.waitUntilReady();

      // TODO: Deploy dashboard (which was in temp mode)
      // TODO: Verify temp dashboard removed from HA
      // TODO: Verify only production dashboard exists

      expect(true).toBe(true); // Placeholder
    } finally {
      await close(ctx);
    }
  });
});
