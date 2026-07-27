/**
 * E2E: the application MENU reaches the CURRENT application state.
 *
 * Regression coverage for the v1.0.0 UAT round-1 defect behind FILE-06,
 * EXPORT-01 and half of SHELL-03 (`docs/testing/uat/reports/uat_summary_v1.0.0_2026-07-27.md`).
 *
 * The menu listeners in `src/App.tsx` subscribe once with an empty dependency
 * array, so before the fix every callback closed over FIRST-RENDER state — when
 * the app is on the welcome screen, `config` is null and `isDarkTheme` is at its
 * startup value. Save As... and Export for Home Assistant... therefore reported
 * "No dashboard loaded" forever, and Toggle Theme computed the same "next" theme
 * on every press so it never toggled back.
 *
 * ⚠ Native Electron menus are not in the DOM, so — reusing the approach in
 * `tests/e2e/version-control.spec.ts` — these tests send the same IPC channel
 * the menu click sends, from the main process.
 *
 * ⚠ Native file dialogs are not automatable in this harness
 * (`tests/e2e/file-operations.spec.ts` says so and skips accordingly). The save
 * test therefore loads the dashboard in the FILE-BACKED state via
 * `__dashboardTestApi.loadYaml(yaml, filePath)`, where Save writes straight
 * through `createBackup` + `writeFile` and never opens a dialog. That makes the
 * assertion stronger, not weaker: it checks the bytes on disk rather than the
 * absence of a warning toast.
 */
import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

const DASHBOARD_YAML = `title: Menu Regression
views:
  - title: Home
    path: home
    cards:
      - type: button
        name: Original Name
`;

const sendMenu = async (ctx: Ctx, channel: string) => {
  await ctx.app.evaluate(({ BrowserWindow }, ch) => {
    BrowserWindow.getAllWindows()[0]?.webContents.send(ch);
  }, channel);
};

const loadFileBacked = async (ctx: Ctx, yaml: string, filePath: string) => {
  await ctx.window.evaluate(
    ([y, p]) => {
      (
        window as unknown as {
          __dashboardTestApi: { loadYaml: (yaml: string, filePath?: string | null) => void };
        }
      ).__dashboardTestApi.loadYaml(y, p);
    },
    [yaml, filePath] as const,
  );
};

test.describe('Menu actions reach current state (UAT RC2)', () => {
  test('File > Save writes the open dashboard instead of reporting "No dashboard loaded"', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-menu-save-'));
    const target = path.join(tmpDir, 'menu-save.yaml');

    try {
      await ctx.appDSL.waitUntilReady();

      // Seed the file so Save has something to back up, and so a failure to write
      // is distinguishable from a write of the wrong content.
      fs.writeFileSync(target, 'title: Placeholder\nviews: []\n', 'utf8');

      await loadFileBacked(ctx, DASHBOARD_YAML, target);
      await ctx.canvas.expectCardCount(1);

      await sendMenu(ctx, 'menu:save-file');

      // ⭐ The whole point: before the fix the menu handler took the
      // `if (!config)` branch and returned, so the file kept its placeholder
      // content forever.
      await expect
        .poll(() => fs.readFileSync(target, 'utf8'), { timeout: 10000 })
        .toContain('Menu Regression');

      const written = fs.readFileSync(target, 'utf8');
      expect(written).toContain('Original Name');
      expect(written).not.toContain('Placeholder');
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('File > Export for Home Assistant does not claim there is no dashboard', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-menu-export-'));
    const target = path.join(tmpDir, 'menu-export.yaml');
    const warning = ctx.window.getByText('No dashboard loaded to export');

    try {
      await ctx.appDSL.waitUntilReady();

      // ⭐ CONTROL FIRST. With no dashboard open the warning is CORRECT, and
      // proving it appears here is what makes its absence below meaningful.
      // Without this leg the test would be asserting that a toast we never
      // showed to be observable is not observable.
      await sendMenu(ctx, 'menu:export-for-ha');
      await expect(warning).toBeVisible();

      // antd toasts auto-dismiss; wait for a clean slate rather than assuming one.
      await expect(warning).toHaveCount(0, { timeout: 15000 });

      await loadFileBacked(ctx, DASHBOARD_YAML, target);
      await ctx.canvas.expectCardCount(1);

      await sendMenu(ctx, 'menu:export-for-ha');

      // ⚠⚠ ASSERTING AN ABSENCE IS A TRAP HERE, AND IT CAUGHT THIS TEST TWICE.
      // `toHaveCount(0)` / `not.toBeVisible()` pass INSTANTLY against a toast
      // that has not mounted yet. Replacing them with a fixed 3000ms settle then
      // a count check failed the other way: antd's default message duration is
      // also 3s, so the warning appeared AND auto-dismissed inside the window.
      // Both drafts went green against the very bug they were written to catch.
      //
      // `waitFor({ state: 'visible' })` is the right primitive — it POLLS across
      // the whole window, so a toast that lives ~3s cannot slip between samples.
      // Resolving means the warning appeared (bad); rejecting means it never did.
      const appeared = await warning
        .waitFor({ state: 'visible', timeout: 2500 })
        .then(() => true)
        .catch(() => false);
      expect(appeared).toBe(false);
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('View > Toggle Theme alternates direction instead of repeating one', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      // The app starts dark, so the first press must announce light.
      await sendMenu(ctx, 'menu:toggle-theme');
      await expect(ctx.window.getByText('Switched to light theme')).toBeVisible();

      // ⭐ The second press is the whole assertion. Before the fix
      // `!isDarkTheme` was computed from the frozen first-render value, so press
      // two announced "light" again and the theme never came back — exactly what
      // UAT SHELL-03 reported: "Pressing CTRL-T does not switch it back but just
      // keeps saying 'Switched to Light Theme'".
      await sendMenu(ctx, 'menu:toggle-theme');
      await expect(ctx.window.getByText('Switched to dark theme')).toBeVisible();
    } finally {
      await close(ctx);
    }
  });
});
