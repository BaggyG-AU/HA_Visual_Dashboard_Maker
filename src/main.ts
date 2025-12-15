import { app, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import started from 'electron-squirrel-startup';
import { createApplicationMenu } from './menu';
import { settingsService } from './services/settingsService';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// ===== IPC Handlers - Register BEFORE creating window =====

// Handle file open dialog
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'YAML Files', extensions: ['yaml', 'yml'] },
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled) {
    return { canceled: true };
  }

  return { canceled: false, filePath: result.filePaths[0] };
});

// Handle file save dialog
ipcMain.handle('dialog:saveFile', async (event, defaultPath?: string) => {
  const result = await dialog.showSaveDialog({
    defaultPath,
    filters: [
      { name: 'YAML Files', extensions: ['yaml', 'yml'] },
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled) {
    return { canceled: true };
  }

  return { canceled: false, filePath: result.filePath };
});

// Handle file read
ipcMain.handle('fs:readFile', async (event, filePath: string) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Handle file write
ipcMain.handle('fs:writeFile', async (event, filePath: string, content: string) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Handle check if file exists
ipcMain.handle('fs:exists', async (event, filePath: string) => {
  try {
    await fs.access(filePath);
    return { exists: true };
  } catch {
    return { exists: false };
  }
});

// Handle opening external URLs
ipcMain.handle('shell:openExternal', async (event, url: string) => {
  await shell.openExternal(url);
});

// Handle getting theme preference
ipcMain.handle('settings:getTheme', async () => {
  return { theme: settingsService.getTheme() };
});

// Handle setting theme preference
ipcMain.handle('settings:setTheme', async (event, theme: 'light' | 'dark') => {
  settingsService.setTheme(theme);
  return { success: true };
});

// Handle getting HA connection
ipcMain.handle('ha:getConnection', async () => {
  return {
    url: settingsService.getHAUrl(),
    token: settingsService.getHAToken(),
  };
});

// Handle setting HA connection
ipcMain.handle('ha:setConnection', async (event, url: string, token: string) => {
  settingsService.setHAConnection(url, token);
  return { success: true };
});

// Handle clearing HA connection
ipcMain.handle('ha:clearConnection', async () => {
  settingsService.clearHAConnection();
  return { success: true };
});

// Handle HA API fetch (to bypass CORS)
ipcMain.handle('ha:fetch', async (event, url: string, token: string) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

// ===== End IPC Handlers =====

const createWindow = () => {
  // Get saved window state
  const windowState = settingsService.getWindowState();

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Restore maximized state
  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  // Save window state on resize and move
  const saveWindowState = () => {
    const bounds = mainWindow.getBounds();
    settingsService.setWindowState({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: mainWindow.isMaximized()
    });
  };

  // Debounce to avoid excessive writes
  let saveTimer: NodeJS.Timeout | null = null;
  const debouncedSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(saveWindowState, 500);
  };

  mainWindow.on('resize', debouncedSave);
  mainWindow.on('move', debouncedSave);
  mainWindow.on('maximize', saveWindowState);
  mainWindow.on('unmaximize', saveWindowState);

  // Save state before closing
  mainWindow.on('close', () => {
    saveWindowState();
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Set up application menu
  const menu = createApplicationMenu(mainWindow);
  Menu.setApplicationMenu(menu);

  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
