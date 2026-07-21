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

vi.mock('../../src/services/settingsService', () => ({
  settingsService: {
    getRecentFiles: () => [],
    clearRecentFiles: () => {},
  },
}));

import { createApplicationMenu } from '../../src/menu';

type MenuItemLike = {
  label?: string;
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
