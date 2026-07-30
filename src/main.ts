import { app, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import started from 'electron-squirrel-startup';
import { createApplicationMenu } from './menu';
import { settingsService, LoggingLevel } from './services/settingsService';
import { logger, loggerDefaults } from './services/logger';
import {
  buildBranchArgv,
  buildDiffFileArgv,
  buildGitEnv,
  buildIsRepoArgv,
  buildLogArgv,
  buildShowAtRevArgv,
  buildStatusArgv,
  GIT_MAX_OUTPUT_BYTES,
  GIT_TIMEOUT_MS,
  isContainedPath,
  isSafeRepoRelativePath,
  isValidLogDepth,
  isValidRev,
  parseBranchOutput,
  parseIsRepoOutput,
  parseLogOutput,
  parseStatusPorcelainZ,
} from './services/versionControlService';
import { resolveTemplatePath } from './utils/templatePaths';

const isE2ETestMode = process.env.E2E === '1' || process.env.PLAYWRIGHT_TEST === '1';

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

// E2E on Linux can intermittently render white/partial-white regions when GPU
// compositing is enabled. Force software rendering for deterministic tests.
if (isE2ETestMode) {
  app.disableHardwareAcceleration();
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
      { name: 'All Files', extensions: ['*'] },
    ],
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
      { name: 'All Files', extensions: ['*'] },
    ],
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
      return {
        success: false,
        error: `Failed to create backup directory: ${(error as Error).message}`,
      };
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
      .filter((f) => f.startsWith(filename) && f.endsWith('.backup'))
      .map((f) => ({
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
//
// ⚠⚠ FILE-03: this used to join `__dirname/../../templates` unconditionally,
// which is the repo folder in dev and `resources/app.asar/templates` — a path
// that does not exist — in a packaged app. The templates were therefore reachable
// in development and absent from every installer, so a dialog-only fix would have
// passed every gate and still failed the card, because the tester runs the
// installer. `resolveTemplatePath` picks the right root and refuses a filename
// that escapes the templates directory.
ipcMain.handle('fs:getTemplatePath', async (event, filename: string) => {
  try {
    return resolveTemplatePath(filename, {
      isPackaged: app.isPackaged,
      dirname: __dirname,
      resourcesPath: process.resourcesPath,
    });
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

ipcMain.handle('settings:getHaptics', async () => {
  return {
    enabled: settingsService.getHapticsEnabled(),
    intensity: settingsService.getHapticsIntensity(),
  };
});

ipcMain.handle(
  'settings:setHaptics',
  async (_event, settings: { enabled: boolean; intensity: number }) => {
    settingsService.setHapticsEnabled(settings.enabled);
    settingsService.setHapticsIntensity(settings.intensity);
    return { success: true };
  },
);

ipcMain.handle('settings:getSounds', async () => {
  return {
    enabled: settingsService.getSoundsEnabled(),
    volume: settingsService.getSoundsVolume(),
  };
});

ipcMain.handle(
  'settings:setSounds',
  async (_event, settings: { enabled: boolean; volume: number }) => {
    settingsService.setSoundsEnabled(settings.enabled);
    settingsService.setSoundsVolume(settings.volume);
    return { success: true };
  },
);

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

// Handle getting the cached entity registry (slice 2).
//
// Separate from `entities:getCached` so the two caches stay independent — a
// registry read failing must never take the entity list down with it.
ipcMain.handle('entities:getCachedRegistry', async () => {
  try {
    const entries = settingsService.getCachedEntityRegistry();
    return { success: true, entries };
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
        Authorization: `Bearer ${token}`,
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
      void parseError;
      logger.error(`Failed to parse JSON response from ${targetUrl}`, text);
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
import { projectRegistryEntries } from './utils/entityRegistry';

// Credentials service
import { credentialsService } from './services/credentialsService';

// Phase 3 capability inventory (I3)
import { capabilityProfileService } from './services/capabilityProfileService';
import { resolveCapability } from './services/capability/capabilityResolver';
import { buildCapabilityProfile, type CardOverride } from './services/capability/capabilityProfile';

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
ipcMain.handle(
  'ha:ws:createDashboard',
  async (_event, urlPath: string, title: string, icon?: string) => {
    try {
      await haWebSocketService.createDashboardResource(urlPath, title, icon);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
);

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

// --- Phase 3 capability inventory (I0/I1) — READ-ONLY probes ---------------

// HA version captured from the auth_ok frame
ipcMain.handle('ha:ws:getHaVersion', async () => {
  return { haVersion: haWebSocketService.getHaVersion() };
});

// Installed Lovelace resources (frontend presence signal, I0)
ipcMain.handle('ha:ws:getResources', async () => {
  try {
    const resources = await haWebSocketService.getResources();
    return { success: true, resources };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Installed HACS repositories + versions (I1). Fails gracefully when HACS is
// absent — the command is unknown there, and callers fall back to presence.
ipcMain.handle('ha:ws:getHacsRepositories', async () => {
  try {
    const repositories = await haWebSocketService.getHacsRepositories();
    return { success: true, repositories };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// --- Phase 3 capability profile (I3) — persisted, offline-editable ----------

// Capture the capability profile from the live instance and persist it. Call
// after a successful connect (READ-ONLY reads only). HACS-absent is tolerated.
ipcMain.handle('capability:capture', async () => {
  try {
    const resources = await haWebSocketService.getResources();
    const haVersion = haWebSocketService.getHaVersion();
    let hacsRepos: Awaited<ReturnType<typeof haWebSocketService.getHacsRepositories>> = [];
    try {
      hacsRepos = await haWebSocketService.getHacsRepositories();
    } catch {
      // HACS not installed / command unknown — presence still resolves from resources.
    }
    const resolved = resolveCapability(resources, hacsRepos);
    const existing = capabilityProfileService.getProfile();
    const profile = buildCapabilityProfile(
      resolved,
      { haVersion, capturedAt: new Date().toISOString() },
      existing.userOverrides,
    );
    capabilityProfileService.saveProfile(profile);
    return { success: true, profile };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Read the persisted profile (or the permissive never-connected default). This is
// what the palette resolves against — never a live query at render time.
ipcMain.handle('capability:getProfile', async () => {
  return { profile: capabilityProfileService.getProfile() };
});

// Set or clear (override === null) a manual per-card override.
ipcMain.handle(
  'capability:setOverride',
  async (_event, cardType: string, override: CardOverride | null) => {
    const profile = capabilityProfileService.setOverride(cardType, override);
    return { profile };
  },
);

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
ipcMain.handle(
  'ha:ws:deployDashboard',
  async (event, tempPath: string, productionPath: string | null) => {
    try {
      const result = await haWebSocketService.deployDashboard(tempPath, productionPath);
      return result;
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  },
);

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

    // Refresh the entity registry in the same breath, so one user-visible
    // "Refresh" keeps both caches in step.
    //
    // ⚠ DELIBERATELY NOT AWAITED INTO THE RESULT AND DELIBERATELY SWALLOWED.
    // `config/entity_registry/list` is admin-only and WebSocket-only; a
    // non-admin token, or a WebSocket leg that failed while the REST leg
    // succeeded, must not turn a working entity fetch into a failed one.
    try {
      const registry = await haWebSocketService.fetchEntityRegistry();
      settingsService.setCachedEntityRegistry(projectRegistryEntries(registry));
    } catch (registryError) {
      logger.warn(
        `Entity registry unavailable; pickers will fall back to showing everything: ${(registryError as Error).message}`,
      );
    }

    return { success: true, entities };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});

// Fetch the entity registry on its own, caching the narrowed projection.
//
// ⚠ Returns `success: false` rather than throwing so the renderer can degrade
// to the cache — and then to "no registry at all", which is a fully supported
// state in which nothing is hidden.
ipcMain.handle('ha:ws:fetchEntityRegistry', async () => {
  try {
    const raw = await haWebSocketService.fetchEntityRegistry();
    const entries = projectRegistryEntries(raw);
    settingsService.setCachedEntityRegistry(entries);
    return { success: true, entries };
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

  // Seed the registry the same way, so a test can exercise integration grouping
  // and the diagnostic cut without a live Home Assistant.
  //
  // ⚠ Seeded through `projectRegistryEntries`, exactly like the production
  // path, so a test cannot accidentally rely on a field shape the real
  // `config/entity_registry/list` never produces.
  ipcMain.handle('test:seedEntityRegistry', async (event, entries: unknown[]) => {
    try {
      settingsService.setCachedEntityRegistry(projectRegistryEntries(entries));
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('test:clearEntityRegistry', async () => {
    try {
      settingsService.setCachedEntityRegistry([]);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}

// Credentials API handlers
ipcMain.handle(
  'credentials:save',
  async (event, name: string, url: string, token: string, id?: string) => {
    try {
      const credential = credentialsService.saveCredential(name, url, token, id);
      return { success: true, credential };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  },
);

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

// ===== Version control (WS3 Phase 7 slice E) =====
//
// Implements docs/governance/phases/phase-7-slice-e-command-contract.md.
// READ-ONLY: six operations, no `commitFiles` in this slice.
//
// ⚠ THE THREE RULES THAT MAKE THIS SAFE, all enforced here in main:
//   1. The renderer names an OPERATION from a closed set — one channel each. It
//      never supplies a command, a flag, or an argv element that is not a
//      validated path/rev/depth. Every argv is built by versionControlService.
//   2. NO SHELL, EVER. execFile with an argument array; `shell` is never set.
//   3. The repo root must be one the user DESIGNATED in-app, and every file
//      path must resolve (after realpath, so symlinks cannot escape) to
//      somewhere strictly inside it.

/** Serialises git invocations per repo root — bounded, non-blocking polling. */
const gitQueues = new Map<string, Promise<unknown>>();

const runGitQueued = <T>(repoRoot: string, task: () => Promise<T>): Promise<T> => {
  const previous = gitQueues.get(repoRoot) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(task);
  gitQueues.set(
    repoRoot,
    next.catch(() => undefined),
  );
  return next;
};

type GitRunResult = { success: true; stdout: string } | { success: false; error: string };

const runGit = async (repoRoot: string, argv: string[]): Promise<GitRunResult> => {
  const { execFile } = await import('node:child_process');
  return runGitQueued(repoRoot, () => {
    return new Promise<GitRunResult>((resolve) => {
      execFile(
        'git',
        argv,
        {
          cwd: repoRoot,
          // No `shell` option — the default is false. A string is never handed
          // to /bin/sh, cmd.exe or PowerShell anywhere in this path.
          timeout: GIT_TIMEOUT_MS,
          maxBuffer: GIT_MAX_OUTPUT_BYTES,
          windowsHide: true,
          env: buildGitEnv(process.env as Record<string, string | undefined>),
        },
        (error, stdout, stderr) => {
          if (error) {
            const err = error as NodeJS.ErrnoException & { killed?: boolean; code?: unknown };
            if (err.code === 'ENOENT') {
              // git absent is a first-class state, not a crash.
              resolve({ success: false, error: 'GIT_NOT_AVAILABLE' });
              return;
            }
            if (err.killed) {
              resolve({ success: false, error: `git timed out after ${GIT_TIMEOUT_MS}ms` });
              return;
            }
            if (/maxBuffer/i.test(err.message)) {
              resolve({ success: false, error: 'git output exceeded the size limit' });
              return;
            }
            // A non-zero exit is an error, never a silent success.
            resolve({ success: false, error: (stderr || err.message).trim() });
            return;
          }
          resolve({ success: true, stdout });
        },
      );
    });
  });
};

/** Resolve + validate a repo root against the user's designated list. */
const resolveDesignatedRepoRoot = async (
  repoRoot: unknown,
): Promise<{ ok: true; root: string } | { ok: false; error: string }> => {
  if (typeof repoRoot !== 'string' || repoRoot.length === 0) {
    return { ok: false, error: 'repoRoot must be a non-empty string' };
  }
  if (!path.isAbsolute(repoRoot)) {
    return { ok: false, error: 'repoRoot must be an absolute path' };
  }

  let real: string;
  try {
    real = await fs.realpath(repoRoot);
    const stat = await fs.stat(real);
    if (!stat.isDirectory()) return { ok: false, error: 'repoRoot is not a directory' };
  } catch {
    return { ok: false, error: 'repoRoot does not exist' };
  }

  // ⚠ Without this check, "is the file inside repoRoot?" is trivially satisfied
  // by a renderer that supplies both halves.
  const designated = settingsService.getVcsRepoRoots();
  const isDesignated = designated.some((entry) => entry === real || entry === repoRoot);
  if (!isDesignated) {
    return { ok: false, error: 'repoRoot has not been designated in the app' };
  }

  return { ok: true, root: real };
};

/** Resolve a renderer-supplied path to a repo-relative path inside the root. */
const resolveContainedRelativePath = async (
  realRoot: string,
  filePath: unknown,
): Promise<{ ok: true; relative: string } | { ok: false; error: string }> => {
  if (typeof filePath !== 'string' || filePath.length === 0) {
    return { ok: false, error: 'file must be a non-empty string' };
  }
  if (filePath.includes('\0')) {
    return { ok: false, error: 'file contains a NUL byte' };
  }

  const absolute = path.resolve(realRoot, filePath);
  let real: string;
  try {
    real = await fs.realpath(absolute);
    const stat = await fs.stat(real);
    if (!stat.isFile()) return { ok: false, error: 'file is not a regular file' };
  } catch {
    return { ok: false, error: 'file does not exist' };
  }

  // Symlinks are resolved on BOTH sides before comparing, so a link pointing
  // out of the tree fails here rather than reaching git.
  if (!isContainedPath(realRoot, real)) {
    return { ok: false, error: 'file is outside the designated repository' };
  }

  const relative = path.relative(realRoot, real).split(path.sep).join('/');
  if (!isSafeRepoRelativePath(relative)) {
    return { ok: false, error: 'file resolves to an unsafe repository path' };
  }

  return { ok: true, relative };
};

ipcMain.handle('vcs:listRepoRoots', async () => {
  return { success: true, roots: settingsService.getVcsRepoRoots() };
});

ipcMain.handle('vcs:designateRepoRoot', async () => {
  // The user picks the repository through the native dialog — the renderer
  // cannot designate a path, only ask that the user be prompted.
  const result = await dialog.showOpenDialog({
    title: 'Select a git repository',
    properties: ['openDirectory'],
  });
  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, canceled: true };
  }

  const chosen = result.filePaths[0];
  let real: string;
  try {
    real = await fs.realpath(chosen);
  } catch {
    return { success: false, error: 'Selected directory could not be resolved' };
  }

  const check = await runGit(real, buildIsRepoArgv());
  if (!check.success) {
    return {
      success: false,
      error:
        check.error === 'GIT_NOT_AVAILABLE'
          ? 'git is not available on this system'
          : 'Selected directory is not a git repository',
    };
  }
  if (!parseIsRepoOutput(check.stdout)) {
    return { success: false, error: 'Selected directory is not a git repository' };
  }

  settingsService.addVcsRepoRoot(real);
  return { success: true, root: real };
});

ipcMain.handle('vcs:clearRepoRoots', async () => {
  settingsService.clearVcsRepoRoots();
  return { success: true };
});

ipcMain.handle('vcs:isRepo', async (_event, repoRoot: unknown) => {
  const resolved = await resolveDesignatedRepoRoot(repoRoot);
  if (!resolved.ok) return { success: false, error: resolved.error };

  const result = await runGit(resolved.root, buildIsRepoArgv());
  if (!result.success) return { success: false, error: result.error };
  return { success: true, isRepo: parseIsRepoOutput(result.stdout) };
});

ipcMain.handle('vcs:status', async (_event, repoRoot: unknown) => {
  const resolved = await resolveDesignatedRepoRoot(repoRoot);
  if (!resolved.ok) return { success: false, error: resolved.error };

  const result = await runGit(resolved.root, buildStatusArgv());
  if (!result.success) return { success: false, error: result.error };
  return { success: true, entries: parseStatusPorcelainZ(result.stdout) };
});

ipcMain.handle('vcs:branch', async (_event, repoRoot: unknown) => {
  const resolved = await resolveDesignatedRepoRoot(repoRoot);
  if (!resolved.ok) return { success: false, error: resolved.error };

  const result = await runGit(resolved.root, buildBranchArgv());
  if (!result.success) return { success: false, error: result.error };
  return { success: true, ...parseBranchOutput(result.stdout) };
});

ipcMain.handle('vcs:log', async (_event, repoRoot: unknown, filePath: unknown, depth: unknown) => {
  const resolved = await resolveDesignatedRepoRoot(repoRoot);
  if (!resolved.ok) return { success: false, error: resolved.error };

  const file = await resolveContainedRelativePath(resolved.root, filePath);
  if (!file.ok) return { success: false, error: file.error };

  if (!isValidLogDepth(depth)) {
    return { success: false, error: 'depth must be an integer between 1 and 100' };
  }

  const result = await runGit(resolved.root, buildLogArgv(file.relative, depth));
  if (!result.success) return { success: false, error: result.error };
  return { success: true, commits: parseLogOutput(result.stdout) };
});

ipcMain.handle('vcs:diffFile', async (_event, repoRoot: unknown, filePath: unknown) => {
  const resolved = await resolveDesignatedRepoRoot(repoRoot);
  if (!resolved.ok) return { success: false, error: resolved.error };

  const file = await resolveContainedRelativePath(resolved.root, filePath);
  if (!file.ok) return { success: false, error: file.error };

  const result = await runGit(resolved.root, buildDiffFileArgv(file.relative));
  if (!result.success) return { success: false, error: result.error };
  return { success: true, diff: result.stdout, path: file.relative };
});

ipcMain.handle(
  'vcs:showAtRev',
  async (_event, repoRoot: unknown, filePath: unknown, rev: unknown) => {
    const resolved = await resolveDesignatedRepoRoot(repoRoot);
    if (!resolved.ok) return { success: false, error: resolved.error };

    const file = await resolveContainedRelativePath(resolved.root, filePath);
    if (!file.ok) return { success: false, error: file.error };

    if (!isValidRev(rev)) {
      return { success: false, error: 'rev must be a hex object id or HEAD' };
    }

    const result = await runGit(resolved.root, buildShowAtRevArgv(file.relative, rev));
    if (!result.success) return { success: false, error: result.error };
    return { success: true, content: result.stdout };
  },
);

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
    // The debounced save can outlive the window (resize or move, then quit
    // within the debounce interval). Touching a destroyed BrowserWindow throws
    // "Object has been destroyed" as an uncaught main-process exception, which
    // Electron surfaces as a modal error dialog.
    if (mainWindow.isDestroyed()) return;

    const bounds = mainWindow.getBounds();
    settingsService.setWindowState({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: mainWindow.isMaximized(),
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
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    saveWindowState();
  });

  mainWindow.on('closed', () => {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
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
            ].join('; '),
          ],
        },
      });
    });
  }

  // and load the index.html of the app.
  const shouldUseDevServer = Boolean(MAIN_WINDOW_VITE_DEV_SERVER_URL && !isAutomatedTest);

  if (shouldUseDevServer) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
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
app.on('ready', async () => {
  if (isE2ETestMode) {
    app.on('gpu-info-update', async () => {
      try {
        const features = app.getGPUFeatureStatus();
        const basicInfo = await app.getGPUInfo('basic');
        logger.info('[E2E][GPU] feature status', features);
        logger.info('[E2E][GPU] basic info', basicInfo);
      } catch (error) {
        logger.warn('[E2E][GPU] diagnostics failed', error);
      }
    });
  }

  createWindow();
});

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
