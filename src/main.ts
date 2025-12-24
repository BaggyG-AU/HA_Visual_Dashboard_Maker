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

// Handle get template path
ipcMain.handle('fs:getTemplatePath', async (event, filename: string) => {
  try {
    const path = await import('path');
    const templatePath = path.join(__dirname, '..', '..', 'templates', filename);
    return templatePath;
  } catch (error) {
    throw new Error(`Failed to get template path: ${(error as Error).message}`);
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

    // Get the response text first
    const text = await response.text();

    // Try to parse as JSON
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', text);
      return {
        success: false,
        status: response.status,
        error: `Invalid JSON response: ${text.substring(0, 100)}`,
      };
    }

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

// Home Assistant WebSocket API handlers
import { haWebSocketService } from './services/haWebSocketService';

// Credentials service
import { credentialsService } from './services/credentialsService';

// Connect to HA WebSocket
ipcMain.handle('ha:ws:connect', async (event, url: string, token: string) => {
  try {
    await haWebSocketService.connect(url, token);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

// List dashboards via WebSocket
ipcMain.handle('ha:ws:listDashboards', async () => {
  try {
    const dashboards = await haWebSocketService.listDashboards();
    return { success: true, dashboards };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

// Get dashboard config via WebSocket
ipcMain.handle('ha:ws:getDashboardConfig', async (event, urlPath: string | null) => {
  try {
    const config = await haWebSocketService.getDashboardConfig(urlPath);
    return { success: true, config };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

// Close WebSocket connection
ipcMain.handle('ha:ws:close', async () => {
  try {
    haWebSocketService.close();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

// Check WebSocket connection status
ipcMain.handle('ha:ws:isConnected', async () => {
  return { connected: haWebSocketService.isConnected() };
});

// Create temporary dashboard
ipcMain.handle('ha:ws:createTempDashboard', async (event, config: any) => {
  try {
    const tempPath = await haWebSocketService.createTempDashboard(config);
    return { success: true, tempPath };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

// Update temporary dashboard
ipcMain.handle('ha:ws:updateTempDashboard', async (event, tempPath: string, config: any) => {
  try {
    await haWebSocketService.updateTempDashboard(tempPath, config);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

// Deploy temporary dashboard
ipcMain.handle('ha:ws:deployDashboard', async (event, tempPath: string, productionPath: string | null) => {
  try {
    const result = await haWebSocketService.deployDashboard(tempPath, productionPath);
    return result;
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

// Delete temporary dashboard
ipcMain.handle('ha:ws:deleteTempDashboard', async (event, tempPath: string) => {
  try {
    await haWebSocketService.deleteTempDashboard(tempPath);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

// Credentials API handlers
ipcMain.handle('credentials:save', async (event, name: string, url: string, token: string, id?: string) => {
  try {
    const credential = credentialsService.saveCredential(name, url, token, id);
    return { success: true, credential };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

ipcMain.handle('credentials:getAll', async () => {
  try {
    const credentials = credentialsService.getAllCredentials();
    return { success: true, credentials };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

ipcMain.handle('credentials:get', async (event, id: string) => {
  try {
    const credential = credentialsService.getCredential(id);
    if (!credential) {
      return {
        success: false,
        error: 'Credential not found',
      };
    }
    return { success: true, credential };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

ipcMain.handle('credentials:getLastUsed', async () => {
  try {
    const credential = credentialsService.getLastUsedCredential();
    return { success: true, credential };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

ipcMain.handle('credentials:markAsUsed', async (event, id: string) => {
  try {
    credentialsService.markAsUsed(id);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

ipcMain.handle('credentials:delete', async (event, id: string) => {
  try {
    const deleted = credentialsService.deleteCredential(id);
    if (!deleted) {
      return {
        success: false,
        error: 'Credential not found',
      };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

ipcMain.handle('credentials:isEncryptionAvailable', async () => {
  return { available: credentialsService.isEncryptionAvailable() };
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
