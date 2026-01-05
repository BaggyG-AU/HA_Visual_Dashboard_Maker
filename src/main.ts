import { app, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import started from 'electron-squirrel-startup';
import { createApplicationMenu } from './menu';
import { settingsService, LoggingLevel } from './services/settingsService';
import { logger, loggerDefaults } from './services/logger';

// Normalize HA URLs while respecting the user-provided scheme (http or https)
const normalizeHAUrl = (url: string): string => {
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `http://${normalized}`;
  }
  if (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Initialize logger level from settings
logger.setLevel(settingsService.getLoggingLevel(loggerDefaults.defaultLevel));

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

// Handle creating backup of file before save
ipcMain.handle('fs:createBackup', async (event, filePath: string) => {
  try {
    // Check if original file exists
    try {
      await fs.access(filePath);
    } catch {
      // File doesn't exist, no backup needed
      return { success: true, message: 'No existing file to backup' };
    }

    // Create .backup folder next to the file
    const dir = path.dirname(filePath);
    const backupDir = path.join(dir, '.backup');

    // Create backup directory if it doesn't exist
    try {
      await fs.mkdir(backupDir, { recursive: true });
    } catch (error) {
      return { success: false, error: `Failed to create backup directory: ${(error as Error).message}` };
    }

    // Create backup filename with timestamp
    const filename = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const backupFilename = `${filename}.${timestamp}.backup`;
    const backupPath = path.join(backupDir, backupFilename);

    // Copy file to backup
    await fs.copyFile(filePath, backupPath);

    // Keep only last 5 backups - get all backup files for this file
    const files = await fs.readdir(backupDir);
    const backupFiles = files
      .filter(f => f.startsWith(filename) && f.endsWith('.backup'))
      .map(f => ({
        name: f,
        path: path.join(backupDir, f),
      }));

    // Sort by name (which includes timestamp) and remove oldest
    if (backupFiles.length > 5) {
      backupFiles.sort((a, b) => a.name.localeCompare(b.name));
      const toDelete = backupFiles.slice(0, backupFiles.length - 5);
      for (const file of toDelete) {
        await fs.unlink(file.path);
      }
    }

    return { success: true, backupPath };
  } catch (error) {
    return { success: false, error: (error as Error).message };
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

// Handle theme preference persistence
ipcMain.handle('settings:getSelectedTheme', async () => {
  return { theme: settingsService.getSelectedTheme() };
});

ipcMain.handle('settings:setSelectedTheme', async (event, themeName: string) => {
  settingsService.setSelectedTheme(themeName);
  return { success: true };
});

ipcMain.handle('settings:getThemeDarkMode', async () => {
  return { darkMode: settingsService.getThemeDarkMode() };
});

ipcMain.handle('settings:setThemeDarkMode', async (event, darkMode: boolean) => {
  settingsService.setThemeDarkMode(darkMode);
  return { success: true };
});

ipcMain.handle('settings:getThemeSyncWithHA', async () => {
  return { sync: settingsService.getThemeSyncWithHA() };
});

ipcMain.handle('settings:setThemeSyncWithHA', async (event, sync: boolean) => {
  settingsService.setThemeSyncWithHA(sync);
  return { success: true };
});

// Logging level
ipcMain.handle('settings:getLoggingLevel', async () => {
  return { level: settingsService.getLoggingLevel(loggerDefaults.defaultLevel) };
});

ipcMain.handle('settings:setLoggingLevel', async (_event, level: LoggingLevel) => {
  settingsService.setLoggingLevel(level);
  logger.setLevel(level);
  return { success: true };
});

ipcMain.handle('settings:getVerboseUIDebug', async () => {
  return { verbose: settingsService.getVerboseUIDebug() };
});

ipcMain.handle('settings:setVerboseUIDebug', async (_event, verbose: boolean) => {
  settingsService.setVerboseUIDebug(verbose);
  return { success: true };
});

ipcMain.handle('settings:resetUIState', async () => {
  settingsService.resetUIState();
  return { success: true };
});

ipcMain.handle('app:getVersion', async () => {
  return { version: app.getVersion() };
});

// Handle getting recent files
ipcMain.handle('settings:getRecentFiles', async () => {
  return { files: settingsService.getRecentFiles() };
});

// Handle adding recent file
ipcMain.handle('settings:addRecentFile', async (event, filePath: string) => {
  settingsService.addRecentFile(filePath);
  // Update menu to reflect new recent files
  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (mainWindow) {
    const menu = createApplicationMenu(mainWindow);
    Menu.setApplicationMenu(menu);
  }
  return { success: true };
});

// Handle getting cached entities
ipcMain.handle('entities:getCached', async () => {
  try {
    const entities = settingsService.getCachedEntities();
    return { success: true, entities };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Handle caching entities
ipcMain.handle('entities:cache', async (event, entities: any[]) => {
  try {
    settingsService.setCachedEntities(entities);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Handle clearing recent files
ipcMain.handle('settings:clearRecentFiles', async () => {
  settingsService.clearRecentFiles();
  // Update menu to reflect cleared recent files
  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (mainWindow) {
    const menu = createApplicationMenu(mainWindow);
    Menu.setApplicationMenu(menu);
  }
  return { success: true };
});

// Clear cached entities (maintenance)
ipcMain.handle('entities:clear', async () => {
  settingsService.clearCachedEntities();
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
    if (!url) {
      return { success: false, error: 'Missing Home Assistant URL' };
    }
    if (!token) {
      return { success: false, error: 'Missing Home Assistant token' };
    }
    const targetUrl = normalizeHAUrl(url);
    const response = await fetch(targetUrl, {
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
      console.error(`Failed to parse JSON response from ${targetUrl}:`, text);
      return {
        success: false,
        status: response.status,
        error: `Invalid JSON response from ${targetUrl}: ${text.substring(0, 100)}`,
        url: targetUrl,
      };
    }

    return {
      success: response.ok,
      status: response.status,
      data: data,
      url: targetUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
      url: normalizeHAUrl(url),
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
    if (!url) {
      return { success: false, error: 'Missing Home Assistant URL' };
    }
    if (!token) {
      return { success: false, error: 'Missing Home Assistant token' };
    }
    const normalizedUrl = normalizeHAUrl(url);
    await haWebSocketService.connect(normalizedUrl, token);
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

// Create dashboard resource
ipcMain.handle('ha:ws:createDashboard', async (_event, urlPath: string, title: string, icon?: string) => {
  try {
    await haWebSocketService.createDashboardResource(urlPath, title, icon);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Save dashboard config
ipcMain.handle('ha:ws:saveDashboardConfig', async (_event, urlPath: string | null, config: any) => {
  try {
    await haWebSocketService.saveDashboardConfig(urlPath || 'lovelace', config);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Delete dashboard resource/config
ipcMain.handle('ha:ws:deleteDashboard', async (_event, urlPath: string) => {
  try {
    await haWebSocketService.deleteDashboardConfig(urlPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
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

// Handle fetching all entities from HA
ipcMain.handle('ha:ws:fetchEntities', async () => {
  try {
    const entities = await haWebSocketService.fetchAllEntities();
    // Cache entities for offline use
    settingsService.setCachedEntities(entities);
    return { success: true, entities };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

// Handle fetching themes from HA
ipcMain.handle('ha:ws:getThemes', async () => {
  try {
    const themes = await haWebSocketService.getThemes();
    return { success: true, themes };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

// Handle subscribing to theme updates
let themeUnsubscribe: (() => void) | null = null;
ipcMain.handle('ha:ws:subscribeToThemes', async (event) => {
  try {
    // Unsubscribe from previous subscription if exists
    if (themeUnsubscribe) {
      themeUnsubscribe();
    }

    themeUnsubscribe = await haWebSocketService.subscribeToThemes((themes) => {
      // Send themes to renderer process
      event.sender.send('ha:ws:themesUpdated', themes);
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

// Handle unsubscribing from theme updates
ipcMain.handle('ha:ws:unsubscribeFromThemes', async () => {
  try {
    if (themeUnsubscribe) {
      themeUnsubscribe();
      themeUnsubscribe = null;
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

// Test-only IPC handlers (only available in test mode)
if (process.env.NODE_ENV === 'test') {
  ipcMain.handle('test:seedEntityCache', async (event, entities: any[]) => {
    try {
      settingsService.setCachedEntities(entities);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('test:clearEntityCache', async () => {
    try {
      settingsService.setCachedEntities([]);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}

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

  const isAutomatedTest = process.env.PLAYWRIGHT_TEST === '1' || process.env.E2E === '1';

  // Set Content Security Policy for production builds
  // In development, Vite needs 'unsafe-eval' for HMR, so we skip CSP
  if (!MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            [
              "default-src 'self'",
              "script-src 'self'",
              "style-src 'self' 'unsafe-inline'", // Ant Design uses inline styles
              "img-src 'self' data: https:", // Allow images from data URIs and HTTPS
              "font-src 'self' data:", // Allow fonts from data URIs
              "connect-src 'self' ws: wss: http: https:", // Allow WebSocket and HTTP(S) connections for Home Assistant
              "worker-src 'self' blob:", // Monaco Editor workers
              "child-src 'self' blob:", // Monaco Editor workers
            ].join('; ')
          ]
        }
      });
    });
  }

  // and load the index.html of the app.
  const shouldUseDevServer = Boolean(MAIN_WINDOW_VITE_DEV_SERVER_URL && !isAutomatedTest);

  if (shouldUseDevServer) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open DevTools only during development to keep production startup fast.
  if (shouldUseDevServer || (!app.isPackaged && !isAutomatedTest)) {
    mainWindow.webContents.openDevTools();
  }

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
