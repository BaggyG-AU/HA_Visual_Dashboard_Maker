/**
 * FILE-04 — File > Open must not discard unsaved work in silence.
 *
 * ⭐ Round-2 UAT, card FILE-04 (High, regression), owner verbatim: "Expected
 * behavior would be if there is an existing dashboard open (dirty state) if I
 * try to open or create another dashboard, a 'Do you want to save' dialogue
 * should be displayed to allow users to save. If user answers no, existing
 * dashboard is discarded. If yes then save or save as process is activated."
 *
 * Pre-fix, `handleOpenFile` and `handleOpenRecentFile` (`src/App.tsx`) called
 * `loadDashboard` with NO dirty check of any kind, so the file landed on the
 * canvas over whatever the user had been working on.
 *
 * ⭐⭐⭐ WHY THIS IS AN INTEGRATION TEST AND NEEDS NO MANUAL STEP. The round-2
 * triage recorded FILE-04 as needing the NATIVE FILE DIALOG and therefore a
 * manual run. It does not: `dialog:openFile` and `fs:readFile` are MAIN-process
 * IPC handlers and can be replaced from the test, exactly as
 * `tests/integration/dashboard-load-honesty.spec.ts` (HA-03) already does. The
 * renderer is untouched — the real toolbar button, the real `handleOpenFile`,
 * the real `fileService.openAndReadFile`, the real store and the real parser all
 * run. Only the file system is simulated. Check the repo before accepting a
 * "no automated coverage is possible" note.
 */
import { test, expect } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import { launchWithDSL, close } from '../support';

/**
 * ⚠ TWO cards, deliberately. Every scenario below starts from a one-card
 * document, so a card count of 2 is proof the opened file actually landed —
 * and unlike the `dashboard-title` testid (added by this branch) it is
 * observable on the PRE-FIX build too. That matters for the control leg in the
 * history test, which must be able to fail for the history reason rather than
 * for a missing locator.
 */
const OPENED_DASHBOARD_YAML = [
  'title: Opened From Disk',
  'views:',
  '  - title: Home',
  '    path: home',
  '    cards:',
  '      - type: markdown',
  '        content: from disk',
  '      - type: markdown',
  '        content: second card',
  '',
].join('\n');

/**
 * Make File > Open return `content` for `filePath`, without a native dialog.
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
 * Capture Save As so the "Save" branch can be driven and then INSPECTED.
 * `canceled` models the user backing out of the native Save As dialog.
 */
async function stubSaveAs(app: ElectronApplication, canceled: boolean): Promise<void> {
  await app.evaluate(
    ({ ipcMain }, data) => {
      const globalWithLog = globalThis as typeof globalThis & { __savedFiles?: string[] };
      globalWithLog.__savedFiles = [];

      ipcMain.removeHandler('dialog:saveFile');
      ipcMain.handle('dialog:saveFile', () =>
        data.canceled ? { canceled: true } : { canceled: false, filePath: '/tmp/havdm-saved.yaml' },
      );

      ipcMain.removeHandler('fs:writeFile');
      ipcMain.handle('fs:writeFile', (_e: unknown, filePath: string) => {
        globalWithLog.__savedFiles?.push(filePath);
        return { success: true };
      });
    },
    { canceled },
  );
}

const savedFiles = (app: ElectronApplication): Promise<string[]> =>
  app.evaluate(
    () => (globalThis as typeof globalThis & { __savedFiles?: string[] }).__savedFiles ?? [],
  );

/** Click Open — welcome screen before anything is loaded, toolbar afterwards. */
async function clickOpen(window: Page): Promise<void> {
  const welcome = window.getByTestId('welcome-open-local-file');
  const toolbar = window.getByTestId('toolbar-open-file');
  const button = (await welcome.count()) > 0 ? welcome : toolbar;
  await button.waitFor({ state: 'visible' });
  await button.click();
}

const guard = (window: Page) => window.getByTestId('unsaved-changes-dialog');

test.describe('FILE-04: opening a dashboard over unsaved work', () => {
  test('a CLEAN document opens the new file immediately, with no prompt', async () => {
    const ctx = await launchWithDSL();
    const { window, app, appDSL, dashboard } = ctx;

    try {
      await appDSL.waitUntilReady();

      // ⭐ CONTROL LEG. Nothing is at risk here, so the gate must NOT appear —
      // "a safety prompt that fires when nothing is at risk spends attention".
      // Without this leg, "the prompt appeared" below could pass against a
      // build that prompts unconditionally.
      await stubFileOpen(app, '/tmp/havdm-first.yaml', OPENED_DASHBOARD_YAML);
      await clickOpen(window);

      await dashboard.expectCardCount(2);
      await expect(guard(window)).toBeHidden();
    } finally {
      await close(ctx);
    }
  });

  test('a DIRTY document raises the gate, and Cancel abandons the open', async () => {
    const ctx = await launchWithDSL();
    const { window, app, appDSL, canvas, palette } = ctx;

    try {
      await appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await palette.expandCategory('Controls');
      await palette.addCard('button');
      await canvas.expectCardCount(1);

      await stubFileOpen(app, '/tmp/havdm-opened.yaml', OPENED_DASHBOARD_YAML);
      await clickOpen(window);

      // Pre-fix: no gate at all — the file loaded straight over the button.
      await expect(guard(window)).toBeVisible({ timeout: 10000 });
      await window.getByTestId('unsaved-changes-cancel').click();

      // Cancel means the open never happened: the user's card is still there,
      // and the opened dashboard's markdown card is not.
      await expect(guard(window)).toBeHidden();
      await canvas.expectCardCount(1);
      await expect(window.getByTestId('dashboard-title')).toHaveText('New Dashboard');
    } finally {
      await close(ctx);
    }
  });

  test('"Don\'t Save" discards the changes and loads the opened file', async () => {
    const ctx = await launchWithDSL();
    const { window, app, appDSL, canvas, palette, dashboard } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();
      await palette.expandCategory('Controls');
      await palette.addCard('button');
      await canvas.expectCardCount(1);

      await stubFileOpen(app, '/tmp/havdm-opened.yaml', OPENED_DASHBOARD_YAML);
      await clickOpen(window);
      await expect(guard(window)).toBeVisible({ timeout: 10000 });

      await window.getByTestId('unsaved-changes-discard').click();

      await expect(window.getByTestId('dashboard-title')).toHaveText('Opened From Disk', {
        timeout: 10000,
      });
    } finally {
      await close(ctx);
    }
  });

  test('"Save" writes the document first, THEN opens the new file', async () => {
    const ctx = await launchWithDSL();
    const { window, app, appDSL, canvas, palette, dashboard } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();
      await palette.expandCategory('Controls');
      await palette.addCard('button');
      await canvas.expectCardCount(1);

      await stubSaveAs(app, false);
      await stubFileOpen(app, '/tmp/havdm-opened.yaml', OPENED_DASHBOARD_YAML);
      await clickOpen(window);
      await expect(guard(window)).toBeVisible({ timeout: 10000 });

      await window.getByTestId('unsaved-changes-save').click();

      // The work is preserved on disk...
      await expect
        .poll(() => savedFiles(app), { timeout: 10000 })
        .toContain('/tmp/havdm-saved.yaml');
      // ...AND the open the user asked for still happens.
      await expect(window.getByTestId('dashboard-title')).toHaveText('Opened From Disk', {
        timeout: 10000,
      });
    } finally {
      await close(ctx);
    }
  });

  test('backing out of Save As abandons the open instead of discarding the work', async () => {
    const ctx = await launchWithDSL();
    const { window, app, appDSL, canvas, palette, dashboard } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();
      await palette.expandCategory('Controls');
      await palette.addCard('button');
      await canvas.expectCardCount(1);

      // ⚠⚠ THE SUBTLE ONE. The user asks to Save, then cancels the native Save
      // As dialog — so nothing was written. Falling through to the open here
      // would destroy the work they had just tried to protect, which is the
      // exact data loss FILE-04 reports, reached by the opposite route.
      await stubSaveAs(app, true);
      await stubFileOpen(app, '/tmp/havdm-opened.yaml', OPENED_DASHBOARD_YAML);
      await clickOpen(window);
      await expect(guard(window)).toBeVisible({ timeout: 10000 });

      await window.getByTestId('unsaved-changes-save').click();

      await expect(guard(window)).toBeHidden({ timeout: 10000 });
      await canvas.expectCardCount(1);
      await expect(window.getByTestId('dashboard-title')).toHaveText('New Dashboard');
      expect(await savedFiles(app)).toEqual([]);
    } finally {
      await close(ctx);
    }
  });
});

test.describe('FILE-04: a freshly opened dashboard carries no history from the last one', () => {
  test('Undo is unavailable immediately after opening a second dashboard', async () => {
    const ctx = await launchWithDSL();
    const { window, app, appDSL, canvas, palette, dashboard } = ctx;

    try {
      await appDSL.waitUntilReady();
      await dashboard.createNew();
      await palette.expandCategory('Controls');
      await palette.addCard('button');
      await canvas.expectCardCount(1);

      // ⚠⚠ SAVE FIRST, DELIBERATELY, SO THIS TEST NEVER TOUCHES THE GATE.
      //
      // The obvious way to write this is to leave the document dirty and answer
      // "Don't Save" — but then on the PRE-FIX build it fails at "the gate
      // appeared", i.e. for Defect A's reason, and says nothing about Defect B.
      // A red leg that fails for the wrong reason measures nothing. Saving makes
      // the document CLEAN while LEAVING its history intact, so the open below
      // raises no prompt and the only thing this test can fail on is the
      // history. (It is also the more realistic sequence: save your work, then
      // open something else.)
      await stubSaveAs(app, false);
      await dashboard.toolbarSave.click();
      await expect(dashboard.dirtyIndicator).toBeHidden({ timeout: 10000 });

      // ⭐ CONTROL: saving does not wipe the undo stack, so history exists here.
      // Without this leg the assertion below could pass against a build that
      // cleared history wholesale rather than scoping it to the document.
      expect(
        await window.evaluate(() =>
          (
            window as unknown as { __dashboardTestApi: { canUndo: () => boolean } }
          ).__dashboardTestApi.canUndo(),
        ),
      ).toBe(true);

      await stubFileOpen(app, '/tmp/havdm-opened.yaml', OPENED_DASHBOARD_YAML);
      await clickOpen(window);
      // Clean document — no gate is raised, and none should be.
      await expect(guard(window)).toBeHidden();
      // ⚠ Wait for the open to land using the CARD COUNT, not the
      // `dashboard-title` testid: that testid is added by this branch, so
      // waiting on it here would make the pre-fix run fail for a missing
      // locator instead of for the defect, and a red leg that fails for the
      // wrong reason measures nothing.
      await canvas.expectCardCount(2);

      // ⭐⭐⭐ THE REVERT, AT THE SEAM. Pre-fix this was TRUE: the freshly opened,
      // CLEAN document offered an enabled Undo that walked into the PREVIOUS
      // dashboard. That is what the owner hit after adding a button — the card
      // palette's search box is the one field that passes Ctrl+Z through to
      // document undo (CANVAS-07), so reaching for it is routine.
      expect(
        await window.evaluate(() =>
          (
            window as unknown as { __dashboardTestApi: { canUndo: () => boolean } }
          ).__dashboardTestApi.canUndo(),
        ),
      ).toBe(false);
      // Only now the branch-added affordances, once the discriminating
      // assertion above has already been made.
      await expect(window.getByTestId('toolbar-undo')).toBeDisabled();
      await expect(window.getByTestId('dashboard-title')).toHaveText('Opened From Disk');
    } finally {
      await close(ctx);
    }
  });
});
