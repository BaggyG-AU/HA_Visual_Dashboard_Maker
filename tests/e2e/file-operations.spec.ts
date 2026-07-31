/**
 * E2E Test: File Operations (DSL-Based)
 *
 * Focused on verifying dashboard dirty state hooks and file fixture presence.
 * Save/load dialogs are not automated yet; relevant tests are marked as skipped.
 *
 * ⚠⚠ THE TWO Ctrl+S TESTS BELOW WERE INERT UNTIL FILE-05, AND NOT ON PURPOSE.
 * `keyboard.press('Control+S')` delivers `event.key === 'S'`, and App's handler
 * compared `event.key === 's'` case-sensitively, so the keystroke reached
 * nothing — which is why assertions like "the title is unchanged after saving"
 * passed. FILE-05 made the match case-insensitive (Caps Lock produces the same
 * uppercase key on a real keyboard), so these presses now genuinely invoke Save.
 *
 * That mattered: both tests ran against a dashboard created in-app, where
 * `filePath` is null, and Save with no path delegates to `handleSaveFile()` —
 * which opens a NATIVE Save As dialog this harness cannot drive. They are
 * therefore file-backed now, via `__dashboardTestApi.loadYaml(yaml, filePath)`,
 * the state where Save writes straight through and never opens a dialog.
 *
 * ⭐ The full FILE-05 path — the dirty marker, the backup, and the re-read —
 * is covered in `tests/e2e/save-and-backup.spec.ts`. These two stay here as the
 * keyboard-shortcut leg of File Operations.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

const FILE_BACKED_YAML = `title: File Ops
views:
  - title: Home
    path: home
    cards:
      - type: button
        name: Existing Card
`;

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

test.describe('File Operations', () => {
  const testDashboardPath = path.join(__dirname, '../fixtures/test-dashboard.yaml');
  const layoutCardDashboardPath = path.join(__dirname, '../fixtures/layout-card-dashboard.yaml');

  test('should show app title when no file loaded', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      const title = await ctx.window.title();
      expect(title).toContain('HA Visual Dashboard Maker');
    } finally {
      await close(ctx);
    }
  });

  test('should show asterisk in title when dashboard is modified (pending dirty-state wiring)', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      const baseTitle = await ctx.appDSL.getTitle();
      void baseTitle; // TODO: assert dirty-title delta once indicator exists

      // Add a card to mark the dashboard dirty (reuse palette helper used in passing specs)
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');

      await ctx.canvas.expectCardCount(1);

      const dirtyTitle = await ctx.appDSL.getTitle();

      // Dirty indicator is not yet wired; for now, ensure the app stays responsive and title is present
      expect(dirtyTitle.length).toBeGreaterThan(0);
      expect(dirtyTitle).toContain('HA Visual Dashboard Maker');
      // TODO: tighten once dirty-state indicator is implemented (e.g., asterisk or explicit badge)
    } finally {
      await close(ctx);
    }
  });

  test('should remove the dirty marker after saving with Ctrl+S', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-fileops-save-'));
    const target = path.join(tmpDir, 'dash.yaml');
    try {
      await ctx.appDSL.waitUntilReady();
      fs.writeFileSync(target, 'title: Placeholder\nviews: []\n', 'utf8');
      await loadFileBacked(ctx, FILE_BACKED_YAML, target);
      await ctx.canvas.expectCardCount(1);

      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(2);

      // ⭐ CONTROL LEG. The marker must be PRESENT first, or its absence after
      // saving proves nothing — this test previously asserted only that the
      // window title had not changed, which no save could ever have altered.
      await expect(ctx.dashboard.dirtyIndicator).toBeVisible();

      // Focus sits in the palette search box after adding a card, and Ctrl+S is
      // deliberately guarded inside text fields (src/utils/keyboardShortcuts.ts).
      await ctx.window.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await ctx.window.keyboard.press('Control+S');

      await expect(ctx.dashboard.dirtyIndicator).toBeHidden();
      expect(fs.readFileSync(target, 'utf8')).toContain('File Ops');
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('should respond to Ctrl+O keyboard shortcut (pending dialog automation)', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.window.keyboard.press('Control+O');

      // No file dialog automation yet; smoke-check that the app remains responsive
      await ctx.appDSL.expectTitle(/HA Visual Dashboard Maker/);
    } finally {
      await close(ctx);
    }
  });

  test('should respond to the Ctrl+S keyboard shortcut by writing the file', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-fileops-ctrls-'));
    const target = path.join(tmpDir, 'dash.yaml');
    try {
      await ctx.appDSL.waitUntilReady();
      fs.writeFileSync(target, 'title: Placeholder\nviews: []\n', 'utf8');
      await loadFileBacked(ctx, FILE_BACKED_YAML, target);
      await ctx.canvas.expectCardCount(1);

      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(2);

      await ctx.window.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await ctx.window.keyboard.press('Control+S');

      // The bytes on disk, not "the app did not crash". Seeding the file with
      // distinct content first is what makes a failure to write distinguishable
      // from a write of the wrong content.
      await expect
        .poll(() => fs.readFileSync(target, 'utf8'), { timeout: 10000 })
        .toContain('File Ops');
      expect(fs.readFileSync(target, 'utf8')).not.toContain('Placeholder');
      await ctx.appDSL.expectTitle(/HA Visual Dashboard Maker/);
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('should validate YAML file fixtures exist', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      expect(fs.existsSync(testDashboardPath)).toBe(true);
      expect(fs.existsSync(layoutCardDashboardPath)).toBe(true);
    } finally {
      await close(ctx);
    }
  });

  test('should parse sample dashboard fixture', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      const yamlContent = fs.readFileSync(testDashboardPath, 'utf-8');
      expect(yamlContent).toContain('title: Test Dashboard');
      expect(yamlContent).toContain('views:');
      expect(yamlContent).toContain('type: entities');
    } finally {
      await close(ctx);
    }
  });

  test('should parse layout-card dashboard fixture', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      const yamlContent = fs.readFileSync(layoutCardDashboardPath, 'utf-8');
      expect(yamlContent).toContain('type: custom:grid-layout');
      expect(yamlContent).toContain('view_layout:');
      expect(yamlContent).toContain('grid_column:');
    } finally {
      await close(ctx);
    }
  });
});
