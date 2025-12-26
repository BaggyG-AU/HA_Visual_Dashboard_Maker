import { app, Menu, shell, BrowserWindow, MenuItemConstructorOptions } from 'electron';
import { settingsService } from './services/settingsService';
import path from 'node:path';

export function createApplicationMenu(mainWindow: BrowserWindow): Menu {
  const isMac = process.platform === 'darwin';

  // Get recent files and create menu items
  const recentFiles = settingsService.getRecentFiles();
  const recentFilesMenuItems: MenuItemConstructorOptions[] = recentFiles.length > 0
    ? [
        ...recentFiles.map((filePath, index) => ({
          label: `${index + 1}. ${path.basename(filePath)}`,
          click: () => {
            mainWindow.webContents.send('menu:open-recent-file', filePath);
          },
          // Show full path in tooltip (not all platforms support this)
          sublabel: filePath,
        })),
        { type: 'separator' as const },
        {
          label: 'Clear Recent Files',
          click: async () => {
            settingsService.clearRecentFiles();
            // Rebuild menu after clearing
            const newMenu = createApplicationMenu(mainWindow);
            Menu.setApplicationMenu(newMenu);
          },
        },
      ]
    : [{ label: 'No recent files', enabled: false }];

  const template: MenuItemConstructorOptions[] = [
    // App Menu (macOS only)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' as const },
        { type: 'separator' as const },
        { role: 'services' as const },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const }
      ]
    }] : []),

    // File Menu
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Dashboard...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('menu:open-file');
          }
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu:save-file');
          }
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.send('menu:save-file-as');
          }
        },
        { type: 'separator' },
        {
          label: 'Recent Files',
          submenu: recentFilesMenuItems
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },

    // Edit Menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' as const },
          { role: 'delete' as const },
          { role: 'selectAll' as const },
          { type: 'separator' as const },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' as const },
              { role: 'stopSpeaking' as const }
            ]
          }
        ] : [
          { role: 'delete' as const },
          { type: 'separator' as const },
          { role: 'selectAll' as const }
        ])
      ]
    },

    // View Menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: 'Toggle Theme',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow.webContents.send('menu:toggle-theme');
          }
        }
      ]
    },

    // Window Menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' as const },
          { role: 'front' as const },
          { type: 'separator' as const },
          { role: 'window' as const }
        ] : [
          { role: 'close' as const }
        ])
      ]
    },

    // Help Menu
    {
      role: 'help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker#readme');
          }
        },
        {
          label: 'View on GitHub',
          click: async () => {
            await shell.openExternal('https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker');
          }
        },
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal('https://github.com/BaggyG-AU/HA_Visual_Dashboard_Maker/issues');
          }
        },
        { type: 'separator' },
        {
          label: 'About',
          click: () => {
            mainWindow.webContents.send('menu:show-about');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  return menu;
}
