/**
 * E2E smoke: the version-control panel — WS3 Phase 7 slice E.
 *
 * The Slice E prompt asks for "E2E smoke for invoking VCS workflow from UI".
 *
 * ⚠ The entry point is the File > Version Control... MENU item, not a toolbar
 * button — deliberately, so nothing is added to the in-flow layout above the
 * canvas (which would shift the boundingBox clip layout.visual.spec.ts
 * captures). Native Electron menus are not in the DOM, so these tests drive the
 * same channel the menu click sends, from the main process.
 */
import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

const openVersionControl = async (ctx: Ctx) => {
  await ctx.app.evaluate(({ BrowserWindow }) => {
    BrowserWindow.getAllWindows()[0]?.webContents.send('menu:version-control');
  });
  // ⚠ Assert the PANEL, not the dialog root: antd puts data-testid on
  // .ant-modal-root, which is itself hidden.
  await expect(ctx.window.getByTestId('version-control-panel')).toBeVisible();
};

test.describe('Version control panel (slice E)', () => {
  test('is inert until opened, then offers repository selection', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      // Stability Rule: unused VCS features change nothing about the editor.
      await expect(window.getByTestId('version-control-panel')).toHaveCount(0);
      await expect(window.getByTestId('selection-debug-state')).toBeAttached();

      await openVersionControl(ctx);

      // No repository designated yet, so the panel asks for one.
      await expect(window.getByTestId('vcs-choose-repo')).toBeVisible();
      await expect(window.getByTestId('vcs-repo-root')).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });

  test('explains what the panel is for before a repository is chosen', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await openVersionControl(ctx);

      await expect(window.getByText(/keep their whole config directory in git/i)).toBeVisible();
      await expect(window.getByText(/No repository selected/i)).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('closes cleanly and unmounts, so a re-open starts fresh', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await openVersionControl(ctx);
      await window.getByTestId('vcs-close').click();
      await expect(window.getByTestId('version-control-panel')).toHaveCount(0);

      // Re-open: the dialog is mounted only while open, so this is a fresh
      // instance rather than the retained one.
      await openVersionControl(ctx);
      await expect(window.getByTestId('vcs-choose-repo')).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('leaves the canvas and selection untouched while open', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.palette.addCard('button');
      await window.getByTestId('canvas-card').first().click();
      await expect(window.getByTestId('selection-debug-state')).toHaveAttribute(
        'data-selected-card',
        '0',
      );

      await openVersionControl(ctx);
      await window.getByTestId('vcs-close').click();
      await expect(window.getByTestId('version-control-panel')).toHaveCount(0);

      // The panel is a portal modal — it must not disturb store selection.
      await expect(window.getByTestId('selection-debug-state')).toHaveAttribute(
        'data-selected-card',
        '0',
      );
      await expect(window.getByTestId('canvas-card')).toHaveCount(1);
    } finally {
      await close(ctx);
    }
  });

  /**
   * VCS-02 (UAT round 2, Medium, regression). Owner: "No ability to change repo
   * once one is already selected (you can only forget)."
   *
   * `handleDesignate` was wired to exactly one button, and that button lived
   * only in the `!repoRoot` branch — so the control existed but was unreachable
   * from the state the tester was actually in. The repo root persists between
   * sessions, which is why round 1 (no repo, button present) and round 2 (repo
   * already designated, no button) saw different dialogs from the same build.
   *
   * ⚠ Why the cited coverage could not see it: `tests/integration/version-control.spec.ts`
   * runs deliberately with NO repository designated — that is its whole security
   * premise — so it only ever exercises the branch that already had the button.
   * This test is the first to open the panel with a repository already set.
   *
   * The native folder picker never runs: `vcs:designateRepoRoot` is stubbed in
   * main, which is also the only way to assert the SECOND repository arrives.
   */
  test('offers a way to change the repository when one is already designated', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    const FIRST = '/tmp/havdm-vcs02-first';
    const SECOND = '/tmp/havdm-vcs02-second';
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await ctx.app.evaluate(
        ({ ipcMain }, { first, second }) => {
          for (const channel of [
            'vcs:listRepoRoots',
            'vcs:designateRepoRoot',
            'vcs:branch',
            'vcs:status',
          ]) {
            ipcMain.removeHandler(channel);
          }
          // Already designated when the dialog opens — the round-2 entry state.
          ipcMain.handle('vcs:listRepoRoots', () => ({ success: true, roots: [first] }));
          // Standing in for the native folder dialog choosing a DIFFERENT repo.
          ipcMain.handle('vcs:designateRepoRoot', () => ({ success: true, root: second }));
          ipcMain.handle('vcs:branch', () => ({ success: true, branch: 'main', detached: false }));
          ipcMain.handle('vcs:status', () => ({ success: true, entries: [] }));
        },
        { first: FIRST, second: SECOND },
      );

      await openVersionControl(ctx);

      // ⭐ CONTROL LEG — pre-existing locators only, so it passes on base too.
      // It proves the stub took and that we are in the repository-PRESENT
      // branch, which is the branch the defect is about. Without this, a red
      // discriminator below could just mean the panel never loaded.
      await expect(window.getByTestId('vcs-repo-root')).toHaveText(FIRST);
      await expect(window.getByTestId('vcs-refresh')).toBeVisible();
      await expect(window.getByTestId('vcs-forget-repo')).toBeVisible();

      // ⭐ DISCRIMINATOR — on base there is no such control at all, and the only
      // route to another repository is Forget first.
      await window.getByTestId('vcs-change-repo').click();

      // Changing actually switches: the panel now reads the second repository,
      // with no Forget step in between.
      await expect(window.getByTestId('vcs-repo-root')).toHaveText(SECOND);
      await expect(window.getByTestId('vcs-choose-repo')).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });
});
