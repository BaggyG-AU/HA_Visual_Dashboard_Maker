import { describe, it, expect, vi } from 'vitest';

// menu.ts imports the electron main-process API and settingsService (which pulls
// in electron-store). Mock both so the pure menu-template construction can be
// unit-tested. Menu.buildFromTemplate is stubbed to return the template array
// verbatim so we can traverse it and invoke item click handlers.
vi.mock('electron', () => ({
  app: { name: 'HAVDM' },
  Menu: {
    buildFromTemplate: (template: unknown) => template,
    setApplicationMenu: () => {},
  },
  shell: {},
  BrowserWindow: class {},
}));

// The recent-file list is swapped per test (F7). A mutable module-level array
// keeps the existing `getRecentFiles: () => []` behaviour for every test that
// does not care, while letting the F7 block below supply real paths.
const recentFilesFixture: string[] = [];

vi.mock('../../src/services/settingsService', () => ({
  settingsService: {
    getRecentFiles: () => recentFilesFixture,
    clearRecentFiles: () => {},
  },
}));

import { createApplicationMenu } from '../../src/menu';

type MenuItemLike = {
  label?: string;
  sublabel?: string;
  enabled?: boolean;
  submenu?: MenuItemLike[];
  click?: () => void;
};

const findItem = (items: MenuItemLike[], label: string): MenuItemLike | undefined => {
  for (const item of items) {
    if (item.label === label) return item;
    if (Array.isArray(item.submenu)) {
      const found = findItem(item.submenu, label);
      if (found) return found;
    }
  }
  return undefined;
};

const buildTemplate = () => {
  const send = vi.fn();
  const win = { webContents: { send } } as unknown as Parameters<typeof createApplicationMenu>[0];
  const template = createApplicationMenu(win) as unknown as MenuItemLike[];
  return { template, send };
};

// Slice B4: "Export for Home Assistant" is a NEW File-menu action that writes
// the sanitised (HA-ready) YAML, distinct from Save (which keeps HAVDM-internal
// keys so files round-trip). This guards the menu wiring — it fails on main,
// where no such item exists.
describe('createApplicationMenu — Export for Home Assistant (B4)', () => {
  it('adds a File > "Export for Home Assistant..." item wired to menu:export-for-ha', () => {
    const { template, send } = buildTemplate();

    const exportItem = findItem(template, 'Export for Home Assistant...');
    expect(exportItem).toBeDefined();
    expect(typeof exportItem?.click).toBe('function');

    exportItem?.click?.();
    expect(send).toHaveBeenCalledWith('menu:export-for-ha');
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('keeps Save and Save As... as their own (raw) actions', () => {
    const { template, send } = buildTemplate();

    const save = findItem(template, 'Save');
    const saveAs = findItem(template, 'Save As...');
    expect(save).toBeDefined();
    expect(saveAs).toBeDefined();

    save?.click?.();
    expect(send).toHaveBeenCalledWith('menu:save-file');

    saveAs?.click?.();
    expect(send).toHaveBeenCalledWith('menu:save-file-as');
  });
});

/**
 * F7 / UAT defect FILE-06's second half, ruling R5.
 *
 * ⭐⭐ THIS IS THE RED-LEGGABLE LEG for the label work: `createApplicationMenu`
 * exists on base, so reverting `src/` in the same checkout fails these tests on
 * the ASSERTION — with the base label `1. uat_dashboard4.yaml` and no path —
 * rather than at an import. Verified on base: the four label tests fail, and the
 * "click sends the full path" and "no recent files" tests PASS on both sides.
 *
 * The tester's words: "hovering over a recent file does not show the full path
 * in the tool-tip". The `sublabel` that was meant to do that is macOS-ONLY, so
 * on their Windows build it renders nothing. R5 puts the path in the LABEL.
 */
describe('createApplicationMenu — Recent Files carry their path (F7 / FILE-06, R5)', () => {
  const withRecentFiles = (paths: string[]) => {
    recentFilesFixture.length = 0;
    recentFilesFixture.push(...paths);
    return buildTemplate();
  };

  const recentItems = (template: MenuItemLike[]): MenuItemLike[] => {
    const openRecent = findItem(template, 'Recent Files');
    return (openRecent?.submenu ?? []).filter((item) => /^\d+\. /.test(item.label ?? ''));
  };

  it('renders the middle-elided directory in the LABEL, not only the file name', () => {
    const { template } = withRecentFiles(['C:\\dev\\dashboards\\uat_dashboard4.yaml']);
    const [first] = recentItems(template);

    // Ruling R5's own worked example.
    expect(first.label).toBe('1. uat_dashboard4.yaml — C:\\dev\\dashboards');
  });

  it('distinguishes two same-named files in different folders', () => {
    // ⭐ THE USER-VISIBLE POINT. On the Windows build the tester ran, both of
    // these render as "N. dashboard.yaml" and are indistinguishable in the menu.
    //
    // ⚠⚠ THIS TEST ASSERTS THE EXACT LABEL, AND THE REASON IS A TRAP THAT CAUGHT
    // THIS VERY SPEC. Its first draft asserted `label` CONTAINS "alpha" — and
    // that PASSED ON BASE, which would have made it worthless. Not because the
    // product worked: because the base implementation calls `path.basename`, and
    // under POSIX (this suite runs on Linux) `\` is an ordinary filename
    // character, so `path.basename('C:\\dev\\alpha\\dashboard.yaml')` returns
    // THE ENTIRE STRING — which of course contains "alpha". The old code renders
    // Windows paths as basename-only on Windows and as the whole path here.
    // A substring assertion therefore measured the platform, not the fix.
    // Exact labels are immune to that, and this is the same lesson as "a red leg
    // that fails — or passes — for the wrong reason measures nothing".
    const { template } = withRecentFiles([
      'C:\\dev\\alpha\\dashboard.yaml',
      'D:\\work\\beta\\dashboard.yaml',
    ]);
    const [first, second] = recentItems(template);

    expect(first.label).toBe('1. dashboard.yaml — C:\\dev\\alpha');
    expect(second.label).toBe('2. dashboard.yaml — D:\\work\\beta');
    expect(first.label).not.toBe(second.label);
  });

  it('POSIX control: the base implementation really did render basename-only', () => {
    // The companion to the trap above. With a POSIX path, `path.basename` on
    // this platform behaves as it does on Windows with a Windows path — so this
    // pair of assertions is what the OLD behaviour looked like, and the label
    // below is what it looks like now. This test FAILS on base with
    // "1. dashboard.yaml", naming the defect precisely.
    const { template } = withRecentFiles(['/home/micah/alpha/dashboard.yaml']);
    const [first] = recentItems(template);

    expect(first.label).toBe('1. dashboard.yaml — /home/micah/alpha');
  });

  it('elides a deep path but never the file name', () => {
    const { template } = withRecentFiles([
      'C:\\Users\\micah\\projects\\HA_Visual_Dashboard_Maker\\tests\\fixtures\\known-good.yaml',
    ]);
    const [first] = recentItems(template);

    expect(first.label).toContain('known-good.yaml');
    expect(first.label).toContain('…');
  });

  it('handles a POSIX path too', () => {
    const { template } = withRecentFiles(['/home/micah/dashboards/a.yaml']);
    const [first] = recentItems(template);

    expect(first.label).toBe('1. a.yaml — /home/micah/dashboards');
  });

  it('CONTROL: clicking still sends the FULL path, never the elided label', () => {
    // ⭐⭐ Designed to pass on base AND on this branch. The elision is a display
    // concern; if it ever leaked into the click payload, Open Recent would try
    // to open a path containing "…". A leg green both sides shows the label
    // change did not disturb the wiring.
    const fullPath = 'C:\\Users\\micah\\projects\\HA_Visual_Dashboard_Maker\\tests\\a.yaml';
    const { template, send } = withRecentFiles([fullPath]);
    const [first] = recentItems(template);

    first.click?.();
    expect(send).toHaveBeenCalledWith('menu:open-recent-file', fullPath);
  });

  it('CONTROL: still says "No recent files" when there are none', () => {
    // Also green both sides — the empty branch must be untouched.
    const { template } = withRecentFiles([]);
    const openRecent = findItem(template, 'Recent Files');

    expect(openRecent?.submenu?.[0]?.label).toBe('No recent files');
    expect(openRecent?.submenu?.[0]?.enabled).toBe(false);
  });

  it('keeps the macOS sublabel as well, per R5', () => {
    // R5 explicitly keeps `sublabel`: a genuine improvement on macOS, ignored
    // elsewhere. Removing it would be a regression for Mac users.
    const fullPath = '/home/micah/dashboards/a.yaml';
    const { template } = withRecentFiles([fullPath]);
    const [first] = recentItems(template);

    expect(first.sublabel).toBe(fullPath);
  });
});
