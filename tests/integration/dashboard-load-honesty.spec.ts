/**
 * HA-03 seam coverage — a dashboard HAVDM cannot parse must FAIL HONESTLY.
 *
 * ⭐ Why an integration test and not a unit test: the round-1 defect lived
 * ENTIRELY in the seam. `yamlService.parseDashboard` correctly returned
 * `{ success: false }` the whole time and `dashboardStore.loadDashboard`
 * correctly stored the error — but no caller ever read either, so the app
 * announced success over content that never loaded. Every individual piece had
 * passing tests. A suite that only exercises one side of a seam cannot see it.
 *
 * ⭐ This drives the REAL production path: the real File->Open handler, the real
 * store, the real parser, the real antd message. Only the two file-system IPC
 * handlers are stubbed, in the MAIN process, so the renderer runs unmodified.
 *
 * ⚠ The HA-download path (`App.tsx handleDashboardDownload`) shares this exact
 * seam — parse, then report what actually happened — but reaching it needs a
 * Home Assistant WebSocket mock, which does not exist in this repo. Building
 * one is NOT folded into a remediation PR (the owner's "baseline what we have
 * before we move to new features" rule). Its parse-gate wording is pinned in
 * `tests/unit/dashboardLoadDiagnostics.spec.ts` instead, and that gap is stated
 * in the PR body rather than left silent.
 */
import { test, expect } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import { launchWithDSL, close } from '../support';

/**
 * The shape behind HA-03: a Home Assistant STRATEGY dashboard. It has no
 * `views` at all, which is legitimate — the frontend builds it on the fly.
 * Captured behaviour: `lovelace/config` for the default dashboard on the
 * reference instance answers `config_not_found` for exactly this reason.
 */
const STRATEGY_DASHBOARD_YAML = ['strategy:', '  type: original-states', ''].join('\n');

/** A real, loadable dashboard carrying exactly one card. */
const GOOD_DASHBOARD_YAML = [
  'title: Control Panel',
  'views:',
  '  - title: Home',
  '    path: home',
  '    cards:',
  '      - type: markdown',
  '        content: hello',
  '',
].join('\n');

/**
 * Make File -> Open return `content` for `filePath`, without a native dialog.
 * Stubs only the two main-process handlers; the renderer is untouched.
 */
async function stubFileOpen(
  app: ElectronApplication,
  filePath: string,
  content: string,
): Promise<void> {
  await app.evaluate(
    ({ ipcMain }, data) => {
      ipcMain.removeHandler('dialog:openFile');
      ipcMain.handle('dialog:openFile', () => ({ canceled: false, filePath: data.filePath }));

      ipcMain.removeHandler('fs:readFile');
      ipcMain.handle('fs:readFile', () => ({ success: true, content: data.content }));
    },
    { filePath, content },
  );
}

/**
 * Click Open (welcome screen before anything is loaded, toolbar afterwards) and
 * return the antd notice text.
 *
 * ⚠ testids, NOT accessible names: every antd icon renders
 * `role="img" aria-label="<icon>"`, so these buttons' accessible names are
 * "folder-open Open Local File" and "folder-open Open" — an anchored `/^Open/`
 * matches neither. This cost one Electron round to learn again.
 * ⚠ Waits for the notice to be VISIBLE (which POLLS) rather than sleeping —
 * antd's default message duration is 3s, so a fixed settle races the toast.
 */
async function openFileAndReadNotice(window: Page): Promise<string> {
  const welcome = window.getByTestId('welcome-open-local-file');
  const toolbar = window.getByTestId('toolbar-open-file');
  // The welcome screen is replaced by the editor chrome once a dashboard loads.
  const button = (await welcome.count()) > 0 ? welcome : toolbar;
  await button.waitFor({ state: 'visible' });
  await button.click();

  const notice = window.locator('.ant-message-notice-content').first();
  await notice.waitFor({ state: 'visible' });
  return (await notice.innerText()).trim();
}

/** Let the current antd message expire so the next read cannot see it. */
async function waitForNoticeToClear(window: Page): Promise<void> {
  await window
    .locator('.ant-message-notice-content')
    .first()
    .waitFor({ state: 'detached', timeout: 10_000 });
}

test.describe('HA-03: dashboards that cannot be parsed fail honestly', () => {
  test('a strategy dashboard is refused by name and leaves the canvas intact', async () => {
    const ctx = await launchWithDSL();
    const { window, app, appDSL, dashboard } = ctx;

    try {
      await appDSL.waitUntilReady();

      // ⭐ CONTROL LEG. Load a real dashboard FIRST. Without it, "the canvas has
      // no new content" would pass vacuously against an app that never loaded
      // anything, and asserting an absence is the most dangerous assertion in
      // this codebase.
      await stubFileOpen(app, '/tmp/havdm-good.yaml', GOOD_DASHBOARD_YAML);
      const successNotice = await openFileAndReadNotice(window);
      expect(successNotice).toContain('/tmp/havdm-good.yaml');
      expect(successNotice).not.toContain('Could not load');
      await dashboard.expectCardCount(1);

      await waitForNoticeToClear(window);

      // ---- the defect under test ----
      await stubFileOpen(app, '/tmp/havdm-overview.yaml', STRATEGY_DASHBOARD_YAML);
      const notice = await openFileAndReadNotice(window);

      // ⭐ The pre-fix behaviour announced "Dashboard loaded: /tmp/…" here — a
      // green success toast over content that never loaded. THAT is HA-03.
      expect(notice).toContain('Could not load');
      // It must NAME what HAVDM could not handle, not merely that it failed.
      expect(notice).toContain('original-states');
      // And carry the remedy, in words a non-expert can act on.
      expect(notice).toContain('Take control');
      // ⚠ The pre-fix parser message was 'Dashboard must contain a "views"
      // array' — true, and useless. Pin that it is gone.
      expect(notice).not.toContain('views" array');

      // ⭐ The control leg's real payoff: the dashboard that WAS loaded is still
      // there. A refused load must never silently destroy the user's work.
      await dashboard.expectCardCount(1);
    } finally {
      await close(ctx);
    }
  });
});
