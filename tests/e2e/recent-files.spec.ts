/**
 * E2E: Save As registers the file in Recent Files, and retargets the document.
 *
 * Automated coverage for UAT card FILE-06, which carried `auto_covered: false` —
 * nothing in the suite drove this path end to end. Amendment-03 §3.1 criterion 4
 * and UAT_STRATEGY.md §7 both make that coverage NON-NEGOTIABLE for a defect
 * that failed an uncovered card, and FILE-06 is the one such defect in round 3.
 *
 * The tester's words: "New file did not appear in Recent Files. Also, hovering
 * over a recent file does not show the full path in the tool-tip". The tooltip
 * half is `sublabel`, which is macOS-only, and is fixed in the menu LABEL and
 * covered by `tests/unit/menu.spec.ts`. THIS spec covers the registration half —
 * and the second, unreported defect that shares its root cause.
 *
 * ⭐⭐ WHY THIS DRIVES `menu:save-file-as` AND NOT A DSL HELPER. UAT_STRATEGY.md's
 * `auto_covered` audit lists "a test that drives the DSL instead of the user" as
 * failure form 18. Save As is reachable only from the File menu, so the menu
 * channel IS the user's control here; the only thing stubbed is the native OS
 * dialog, which no harness can click.
 *
 * ⚠ A NOTE THAT CORRECTS A NEIGHBOURING SPEC'S HEADER. `save-and-backup.spec.ts`
 * and `file-operations.spec.ts` both say native file dialogs "are not automatable
 * in this harness". That is true of CLICKING one — but the main-process handler
 * behind it can be replaced outright, which `tests/support/dsl/gradientEditor.ts`
 * has been doing all along. Swapping `dialog:saveFile` for a stub returning a
 * temp path makes the whole Save As path drivable, including the parts that were
 * previously assumed untestable.
 */
import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

const DASHBOARD_YAML = `title: Recent Files Regression
views:
  - title: Home
    path: home
    cards:
      - type: button
        name: First Card
      - type: button
        name: Second Card
`;

const sendMenu = async (ctx: Ctx, channel: string) => {
  await ctx.app.evaluate(({ BrowserWindow }, ch) => {
    BrowserWindow.getAllWindows()[0]?.webContents.send(ch);
  }, channel);
};

/**
 * Replace the native Save As dialog with one that "picks" `filePath`.
 *
 * This is the seam that makes Save As testable at all. It replaces ONLY the OS
 * dialog — everything after it (the write, the recent-file registration, the
 * retarget) is the real product code path.
 */
const stubSaveDialog = async (ctx: Ctx, filePath: string) => {
  await ctx.app.evaluate(({ ipcMain }, chosen) => {
    ipcMain.removeHandler('dialog:saveFile');
    ipcMain.handle('dialog:saveFile', () => ({ canceled: false, filePath: chosen }));
  }, filePath);
};

/** Make the native Save As dialog report that the user cancelled. */
const stubCancelledSaveDialog = async (ctx: Ctx) => {
  await ctx.app.evaluate(({ ipcMain }) => {
    ipcMain.removeHandler('dialog:saveFile');
    ipcMain.handle('dialog:saveFile', () => ({ canceled: true }));
  });
};

const loadDashboard = async (ctx: Ctx, yaml: string, filePath: string | null) => {
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

/** What the app itself believes is in Recent Files — read through the real IPC. */
const recentFiles = async (ctx: Ctx): Promise<string[]> => {
  const result = await ctx.window.evaluate(async () => {
    const api = (
      window as unknown as { electronAPI: { getRecentFiles: () => Promise<{ files: string[] }> } }
    ).electronAPI;
    return await api.getRecentFiles();
  });
  return result.files;
};

/** How many cards the written YAML holds. Name-agnostic on purpose. */
const countCards = (yaml: string): number => (yaml.match(/^\s*- type: /gm) ?? []).length;

const makeDirty = async (ctx: Ctx, expectedCount: number) => {
  await ctx.palette.expandCategory('Controls');
  await ctx.palette.addCard('button');
  await ctx.canvas.expectCardCount(expectedCount);
};

test.describe('FILE-06: Save As registers the file and retargets the document', () => {
  test('THE DEFECT: a Save As target appears in Recent Files', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-recent-saveas-'));
    const target = path.join(tmpDir, 'saved-as.yaml');
    try {
      await ctx.appDSL.waitUntilReady();

      // ⭐ CONTROL. Every test gets an isolated userDataDir, so Recent Files
      // starts EMPTY. Proving that is what makes the assertion below mean
      // "Save As added it" rather than "something was already there".
      expect(await recentFiles(ctx), 'a fresh profile has no recent files').toEqual([]);

      // A NEW, never-saved document — exactly the card's scenario. filePath is
      // null, so File > Save As is the only way to write it.
      await loadDashboard(ctx, DASHBOARD_YAML, null);
      await ctx.canvas.expectCardCount(2);

      await stubSaveDialog(ctx, target);
      await sendMenu(ctx, 'menu:save-file-as');

      // The bytes reached disk...
      await expect
        .poll(() => (fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : ''), {
          timeout: 10000,
        })
        .toContain('Recent Files Regression');

      // ...AND the app registered it. This is the tester's report, asserted.
      await expect.poll(() => recentFiles(ctx), { timeout: 10000 }).toContain(target);

      // Most recent first, so a fresh Save As lands at the front.
      expect((await recentFiles(ctx))[0]).toBe(target);
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('THE SECOND DEFECT: Save As retargets the document, so the NEXT save goes to the new file', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-recent-retarget-'));
    const original = path.join(tmpDir, 'original.yaml');
    const savedAs = path.join(tmpDir, 'saved-as.yaml');
    try {
      await ctx.appDSL.waitUntilReady();

      // Open a document backed by `original`, then Save As to a DIFFERENT file.
      fs.writeFileSync(original, 'title: Original\nviews: []\n', 'utf8');
      await loadDashboard(ctx, DASHBOARD_YAML, original);
      await ctx.canvas.expectCardCount(2);

      await stubSaveDialog(ctx, savedAs);
      await sendMenu(ctx, 'menu:save-file-as');
      await expect
        .poll(() => (fs.existsSync(savedAs) ? fs.readFileSync(savedAs, 'utf8') : ''), {
          timeout: 10000,
        })
        .toContain('Recent Files Regression');

      const originalAfterSaveAs = fs.readFileSync(original, 'utf8');
      // Two cards at this point. Counting card entries is the assertion rather
      // than matching a card NAME: the palette's default name is its own
      // concern, and a test that encodes it measures the palette, not the save.
      expect(countCards(fs.readFileSync(savedAs, 'utf8'))).toBe(2);

      // ⭐⭐ THE MEASUREMENT. Edit again and press the ORDINARY Save. Before F7
      // the document still pointed at `original`, so this wrote the user's new
      // work into the file they had just saved AWAY from — silently, because
      // Save reports success either way.
      await makeDirty(ctx, 3);
      await sendMenu(ctx, 'menu:save-file');

      await expect
        .poll(() => countCards(fs.readFileSync(savedAs, 'utf8')), { timeout: 10000 })
        .toBe(3);

      // And the file it was saved away FROM is untouched by that second save.
      expect(
        fs.readFileSync(original, 'utf8'),
        'the ordinary Save must not write back into the pre-Save-As file',
      ).toBe(originalAfterSaveAs);
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('CONTROL: cancelling the Save As dialog registers nothing and retargets nothing', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-recent-cancel-'));
    const original = path.join(tmpDir, 'original.yaml');
    try {
      await ctx.appDSL.waitUntilReady();

      fs.writeFileSync(original, 'title: Original\nviews: []\n', 'utf8');
      await loadDashboard(ctx, DASHBOARD_YAML, original);
      await ctx.canvas.expectCardCount(2);

      await stubCancelledSaveDialog(ctx);
      await sendMenu(ctx, 'menu:save-file-as');

      // ⭐ Backing out of the dialog must change NOTHING. A fix that registered
      // the path before confirming the write would fail here — and this leg is
      // green on base too, so it also proves the fix did not break the cancel
      // path that already worked.
      await expect.poll(() => recentFiles(ctx), { timeout: 5000 }).toEqual([]);

      // The document still points at `original`: an ordinary Save writes there.
      await makeDirty(ctx, 3);
      await sendMenu(ctx, 'menu:save-file');
      await expect
        .poll(() => fs.readFileSync(original, 'utf8'), { timeout: 10000 })
        .toContain('Recent Files Regression');
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('CONTROL: Export for Home Assistant does NOT enter Recent Files', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-recent-export-'));
    const exported = path.join(tmpDir, 'dashboard-ha.yaml');
    try {
      await ctx.appDSL.waitUntilReady();

      await loadDashboard(ctx, DASHBOARD_YAML, null);
      await ctx.canvas.expectCardCount(2);

      await stubSaveDialog(ctx, exported);
      await sendMenu(ctx, 'menu:export-for-ha');

      await expect
        .poll(() => (fs.existsSync(exported) ? fs.readFileSync(exported, 'utf8') : ''), {
          timeout: 10000,
        })
        .toContain('Recent Files Regression');

      // ⭐⭐ THE DISCRIMINATOR FOR THE FIX'S SCOPE. Both commands route through
      // `saveFileAs`, so a fix applied there rather than at the call site would
      // register the export too. An HA export is a sanitised derivative that
      // HAVDM cannot even re-open faithfully today (F9) — putting it in Recent
      // Files would advertise the broken path as the useful one.
      await expect.poll(() => recentFiles(ctx), { timeout: 5000 }).toEqual([]);
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
