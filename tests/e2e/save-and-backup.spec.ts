/**
 * E2E: Save writes the file, clears the dirty marker and leaves a backup.
 *
 * Automated coverage for UAT card FILE-05, which carried `auto_covered: N` —
 * nothing in the suite drove this path end to end. Amendment-03 §3.1 criterion 4
 * requires every defect that failed an uncovered card to gain that coverage, and
 * §7 restates it, so this spec is owed even though the reported symptom turned
 * out to be already fixed.
 *
 * ⚠⚠ WHAT FILE-05 ACTUALLY WAS. The tester reported Save showing
 * "No dashboard loaded to save". That is ROOT CAUSE 2 — the stale menu closures —
 * and it was fixed in PR #90 before this spec existed. Measured on `cafd22c`
 * before any change on this branch: the menu, the toolbar button and Ctrl+S all
 * save correctly, clear the asterisk and write a backup. The tester's control
 * cannot have been the toolbar, because that button is rendered INSIDE the
 * `config` branch (src/App.tsx renders `config.title` beside it) and therefore
 * does not exist when `config` is null; and FILE-06's note is the same string
 * verbatim from `File > Save As...`, which is unambiguously the menu. So tests
 * 1-4 below are CHARACTERISATION of a working path, not a red-then-green fix —
 * they exist so it cannot silently regress again.
 *
 * ⚠ Native file dialogs are not automatable in this harness
 * (`tests/e2e/file-operations.spec.ts` says so). Every test here therefore loads
 * the dashboard in the FILE-BACKED state via `__dashboardTestApi.loadYaml(yaml,
 * filePath)`, the same approach `tests/e2e/menu-actions.spec.ts` uses, where Save
 * writes straight through `createBackup` + `writeFile` and never opens a dialog.
 * That makes the assertions stronger, not weaker: they read the bytes on disk.
 *
 * ⭐ A HANDLER REACHABLE FROM A MENU, A TOOLBAR AND A KEYBOARD SHORTCUT IS THREE
 * SEPARATE WIRINGS AND EACH NEEDS ITS OWN EVIDENCE. All three are driven here.
 */
import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as yaml from 'js-yaml';

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

/** Content the tester would see replaced — distinctive so a stale file is obvious. */
const PREVIOUS_CONTENT = 'title: Previous Content\nviews: []\n';

const DASHBOARD_YAML = `title: Save Regression
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

/** Every `<filename>.<timestamp>.backup` in the hidden `.backup/` folder beside `file`. */
const backupsFor = (file: string): string[] => {
  const dir = path.join(path.dirname(file), '.backup');
  if (!fs.existsSync(dir)) return [];
  const base = path.basename(file);
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(base) && f.endsWith('.backup'))
    .sort();
};

const readBackup = (file: string, name: string): string =>
  fs.readFileSync(path.join(path.dirname(file), '.backup', name), 'utf8');

/**
 * Put the dashboard in the dirty state the card's step 1 produces.
 *
 * The card says "drag any card to a different position". Adding a card is used
 * instead: react-grid-layout drags are pointer-timing sensitive and this spec's
 * subject is SAVE, not dragging — a flaky dirtying step would turn every
 * assertion below into a test of the drag. Test 3 still proves a POSITION change
 * survives the round-trip, which is what the card's Expected 3 is really about.
 */
const makeDirty = async (ctx: Ctx, expectedCount: number) => {
  await ctx.palette.expandCategory('Controls');
  await ctx.palette.addCard('button');
  await ctx.canvas.expectCardCount(expectedCount);
};

test.describe('FILE-05: Save writes, clears the dirty marker and leaves a backup', () => {
  test('Expected 1: the dirty indicator appears and the toolbar Save button enables', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-save-dirty-'));
    const target = path.join(tmpDir, 'dash.yaml');
    try {
      await ctx.appDSL.waitUntilReady();
      fs.writeFileSync(target, PREVIOUS_CONTENT, 'utf8');
      await loadFileBacked(ctx, DASHBOARD_YAML, target);
      await ctx.canvas.expectCardCount(2);

      // ⭐ CONTROL LEG. A freshly loaded dashboard is CLEAN, so the indicator
      // must be absent and Save disabled. Without this the assertions below
      // would pass against an indicator that is simply always on.
      await expect(ctx.dashboard.dirtyIndicator).toBeHidden();
      await expect(ctx.dashboard.toolbarSave).toBeDisabled();

      await makeDirty(ctx, 3);

      await expect(ctx.dashboard.dirtyIndicator).toBeVisible();
      await expect(ctx.dashboard.toolbarSave).toBeEnabled();
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('Expected 2 + 4 (TOOLBAR): saving reports success, clears the marker and backs up the previous content', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-save-toolbar-'));
    const target = path.join(tmpDir, 'dash.yaml');
    try {
      await ctx.appDSL.waitUntilReady();
      fs.writeFileSync(target, PREVIOUS_CONTENT, 'utf8');
      await loadFileBacked(ctx, DASHBOARD_YAML, target);
      await ctx.canvas.expectCardCount(2);
      await makeDirty(ctx, 3);

      expect(backupsFor(target), 'no backup should exist before the first save').toHaveLength(0);

      await ctx.dashboard.toolbarSave.click();

      // ⭐ The success message must NAME WHERE THE BACKUP WENT. The card's
      // Expected 4 says the backup lives "alongside" the file; it actually lives
      // in a HIDDEN `.backup/` subfolder, and Windows Explorer hides
      // dot-directories by default — so a tester looking beside the file sees
      // nothing and marks Fail on a data-safety expectation while the backup
      // exists and is correct. The card wording is corrected in the same change;
      // this assertion is the product half.
      await expect(ctx.window.getByText(/Dashboard saved/)).toBeVisible();
      await expect(ctx.window.getByText(/\.backup/)).toBeVisible();

      // Expected 2: the marker clears.
      await expect(ctx.dashboard.dirtyIndicator).toBeHidden();

      // The bytes on disk, not the absence of a toast.
      const written = fs.readFileSync(target, 'utf8');
      expect(written).toContain('Save Regression');
      expect(written).not.toContain('Previous Content');

      // Expected 4: a backup holding the PREVIOUS content, not the new one.
      const backups = backupsFor(target);
      expect(backups).toHaveLength(1);
      const backed = readBackup(target, backups[0]);
      expect(backed).toContain('Previous Content');
      expect(backed).not.toContain('Save Regression');
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('Expected 3: re-reading the file shows the card in its NEW position', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-save-position-'));
    const target = path.join(tmpDir, 'dash.yaml');
    try {
      await ctx.appDSL.waitUntilReady();
      fs.writeFileSync(target, PREVIOUS_CONTENT, 'utf8');
      await loadFileBacked(ctx, DASHBOARD_YAML, target);
      await ctx.canvas.expectCardCount(2);
      await makeDirty(ctx, 3);

      // ⚠⚠⚠ SETTLED, AND RELATIVE TO THE GRID RATHER THAN THE VIEWPORT. Those are
      // TWO repairs to this leg, for two different defects, and only the second
      // one was understood when it was made:
      //
      //   • RELATIVE cancels a movement of the grid WITHIN THE WINDOW. Measured
      //     locally, the toolbar loses its dirty asterisk between the two samples
      //     and the whole canvas rises by 8 px — an origin shift that the old
      //     viewport-relative form reported as a layout change on every card.
      //   • SETTLED closes the race that actually produced the CI failures.
      //     `expectCardCount(3)` resolves when the third card EXISTS, and
      //     react-grid-layout then reflows the others around it over
      //     `transition: transform 0.2s`. Amplify that to 3 s and the sample
      //     below catches the second card with its final transform already
      //     applied but its measured box still 416 px away in x and 448 px in y.
      //     On this machine the animation is over before the sample lands, which
      //     is why nine local runs read exactly zero; on a GitHub runner it is
      //     not, and the residue is whatever was left of the flight. Run
      //     31876211967 failed by 2.317108154296875 px at head f52ccf13, where
      //     the comparison was ALREADY relative — so an origin shift cannot
      //     explain that one, and it is the run that proved relative coordinates
      //     alone were not enough.
      //
      // ⚠ The earlier record listed "a settling race" among the REFUTED
      // hypotheses. That refutation sampled twice in a row with no amplifier, so
      // both readings were already settled and it could not have failed.
      // See tests/support/dsl/canvas.ts for the full measurement.
      const before = await ctx.canvas.getCardRectsRelativeToGridSettled();
      await ctx.dashboard.toolbarSave.click();
      await expect(ctx.dashboard.dirtyIndicator).toBeHidden();

      // Re-open the SAME file the way FILE-05 step 6 does. Loading from the
      // bytes just written is the automatable equivalent of the native
      // File > Open Dashboard... dialog.
      const written = fs.readFileSync(target, 'utf8');

      // ⭐ THE DATA HALF, ASSERTED DIRECTLY RATHER THAN INFERRED. The docblock of
      // the old leg worried that "a serializer that dropped geometry" would slip
      // through a count-only check, and answered it by comparing pixels. Pixels
      // are a PROXY for that; the file either carries each card's grid geometry
      // or it does not, and that is exact integers on disk. Assert it outright,
      // and keep the rendered comparison below for what it is uniquely good at —
      // proving the geometry is not merely stored but honoured on reload.
      const parsed = yaml.load(written) as {
        views?: Array<{ cards?: Array<Record<string, unknown>> }>;
      };
      const savedCards = parsed.views?.[0]?.cards ?? [];
      expect(savedCards, 'the save must write all three cards').toHaveLength(3);

      // ⚠ MEASURED, NOT ASSUMED — the first draft of this assertion demanded a
      // layout on EVERY card and was simply wrong about the format. Only the card
      // the user placed carries one: the two seeded from DASHBOARD_YAML have no
      // `_havdm_layout` key at all, because nothing ever positioned them
      // explicitly. So the assertion is scoped to the card whose NEW POSITION is
      // what Expected 3 is actually about.
      expect(
        savedCards[savedCards.length - 1]._havdm_layout,
        'the placed card lost its grid geometry in the save',
      ).toEqual({
        x: expect.any(Number),
        y: expect.any(Number),
        w: expect.any(Number),
        h: expect.any(Number),
      });

      await loadFileBacked(ctx, written, target);
      await ctx.canvas.expectCardCount(3);

      // ⭐ The layout must SURVIVE the round-trip. Comparing rectangles rather
      // than just the card count is the difference between "the file has three
      // cards" and "the file has the layout the user saw" — the latter is what
      // Expected 3 asks.
      // ⓘ Settled here too, though the reload half is measurably NOT the racing
      // one: amplified to a 3 s transition it reported an exact zero — ONE
      // observation, not a proof that a reload can never animate. Whether
      // a reload can ever animate is a JUDGEMENT about react-grid-layout's
      // reconciliation, and settling an already-static grid costs a few frames
      // and removes the judgement — the same reasoning that applied
      // `hoverWhenSettled` to all four hovers in the Class B repair rather than
      // only to the one that had been seen to flake.
      const after = await ctx.canvas.getCardRectsRelativeToGridSettled();
      expect(after).toHaveLength(before.length);
      after.forEach((rect, i) => {
        expect(Math.abs(rect.x - before[i].x)).toBeLessThanOrEqual(2);
        expect(Math.abs(rect.y - before[i].y)).toBeLessThanOrEqual(2);
        expect(Math.abs(rect.w - before[i].w)).toBeLessThanOrEqual(2);
        expect(Math.abs(rect.h - before[i].h)).toBeLessThanOrEqual(2);
      });
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('the MENU is a separate wiring and saves the same way (UAT RC2 stays fixed)', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-save-menu-'));
    const target = path.join(tmpDir, 'dash.yaml');
    const warning = ctx.window.getByText('No dashboard loaded to save');
    try {
      await ctx.appDSL.waitUntilReady();

      // ⭐ CONTROL LEG. With nothing open the warning is CORRECT, and proving it
      // is observable here is what makes its absence below mean something.
      // Asserting an absence without this leg asserts nothing at all.
      await sendMenu(ctx, 'menu:save-file');
      await expect(warning).toBeVisible();
      await expect(warning).toHaveCount(0, { timeout: 15000 });

      fs.writeFileSync(target, PREVIOUS_CONTENT, 'utf8');
      await loadFileBacked(ctx, DASHBOARD_YAML, target);
      await ctx.canvas.expectCardCount(2);
      await makeDirty(ctx, 3);

      await sendMenu(ctx, 'menu:save-file');

      await expect
        .poll(() => fs.readFileSync(target, 'utf8'), { timeout: 10000 })
        .toContain('Save Regression');
      await expect(ctx.dashboard.dirtyIndicator).toBeHidden();
      expect(backupsFor(target)).toHaveLength(1);

      // The RC2 symptom itself: the warning must not have appeared. `waitFor`
      // POLLS, so a toast that lives ~3s cannot slip between samples the way it
      // does past a fixed settle plus a count check.
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

  test('Ctrl+S is the third wiring, and it survives Caps Lock', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-save-ctrls-'));
    const target = path.join(tmpDir, 'dash.yaml');
    try {
      await ctx.appDSL.waitUntilReady();
      fs.writeFileSync(target, PREVIOUS_CONTENT, 'utf8');
      await loadFileBacked(ctx, DASHBOARD_YAML, target);
      await ctx.canvas.expectCardCount(2);
      await makeDirty(ctx, 3);

      // The palette search box holds focus after adding a card, and Ctrl+S is
      // DELIBERATELY guarded inside text fields (src/utils/keyboardShortcuts.ts).
      // Blur first, or this tests the guard instead of the save.
      await ctx.window.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

      // ⚠⚠ `press('Control+S')` delivers `event.key === 'S'` — verified by
      // sniffing the events, not assumed — which is exactly what a real keyboard
      // sends with CAPS LOCK ON. The handler matched `event.key === 's'`
      // case-sensitively, so Save silently did nothing in that state while
      // undo/redo, which lowercase their key, kept working. This is the leg that
      // was RED before the fix.
      await ctx.window.keyboard.press('Control+S');

      await expect
        .poll(() => fs.readFileSync(target, 'utf8'), { timeout: 10000 })
        .toContain('Save Regression');
      await expect(ctx.dashboard.dirtyIndicator).toBeHidden();
      expect(backupsFor(target)).toHaveLength(1);
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('CONTROL LEG: a first save with no existing file succeeds and claims no backup', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-save-new-'));
    const target = path.join(tmpDir, 'never-existed.yaml');
    try {
      await ctx.appDSL.waitUntilReady();

      // NOTE: `target` deliberately does NOT exist. `fs:createBackup` returns
      // `{success:true, message:'No existing file to backup'}` with no
      // backupPath, which is correct — there is nothing to preserve.
      await loadFileBacked(ctx, DASHBOARD_YAML, target);
      await ctx.canvas.expectCardCount(2);
      await makeDirty(ctx, 3);

      await ctx.dashboard.toolbarSave.click();

      await expect(ctx.window.getByText(/Dashboard saved/)).toBeVisible();
      await expect(ctx.dashboard.dirtyIndicator).toBeHidden();
      expect(fs.existsSync(target)).toBe(true);

      // ⭐ THE POINT OF THIS LEG. A naive "a backup always exists" assertion
      // would fail here, and a naive success message would claim a backup that
      // was never written. Neither is acceptable on a data-safety affordance:
      // the message must not promise a file the user cannot find.
      expect(backupsFor(target)).toHaveLength(0);
      expect(fs.existsSync(path.join(tmpDir, '.backup'))).toBe(false);
      await expect(ctx.window.getByText(/\.backup/)).toHaveCount(0);
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
