// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Dialog APIs
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  saveFileDialog: (defaultPath?: string) => ipcRenderer.invoke('dialog:saveFile', defaultPath),

  // File system APIs
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  fileExists: (filePath: string) => ipcRenderer.invoke('fs:exists', filePath),
  createBackup: (filePath: string) => ipcRenderer.invoke('fs:createBackup', filePath),
  getTemplatePath: (filename: string) => ipcRenderer.invoke('fs:getTemplatePath', filename),

  // Shell APIs
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),

  // Settings APIs
  getTheme: () => ipcRenderer.invoke('settings:getTheme'),
  setTheme: (theme: 'light' | 'dark') => ipcRenderer.invoke('settings:setTheme', theme),
  getRecentFiles: () => ipcRenderer.invoke('settings:getRecentFiles'),
  addRecentFile: (filePath: string) => ipcRenderer.invoke('settings:addRecentFile', filePath),
  clearRecentFiles: () => ipcRenderer.invoke('settings:clearRecentFiles'),
  getSelectedTheme: () => ipcRenderer.invoke('settings:getSelectedTheme'),
  setSelectedTheme: (themeName: string) => ipcRenderer.invoke('settings:setSelectedTheme', themeName),
  getThemeDarkMode: () => ipcRenderer.invoke('settings:getThemeDarkMode'),
  setThemeDarkMode: (darkMode: boolean) => ipcRenderer.invoke('settings:setThemeDarkMode', darkMode),
  getThemeSyncWithHA: () => ipcRenderer.invoke('settings:getThemeSyncWithHA'),
  setThemeSyncWithHA: (sync: boolean) => ipcRenderer.invoke('settings:setThemeSyncWithHA', sync),
  getLoggingLevel: () => ipcRenderer.invoke('settings:getLoggingLevel'),
  setLoggingLevel: (level: 'off' | 'error' | 'warn' | 'info' | 'debug' | 'trace') => ipcRenderer.invoke('settings:setLoggingLevel', level),
  getVerboseUIDebug: () => ipcRenderer.invoke('settings:getVerboseUIDebug'),
  setVerboseUIDebug: (verbose: boolean) => ipcRenderer.invoke('settings:setVerboseUIDebug', verbose),
  getHapticSettings: () => ipcRenderer.invoke('settings:getHaptics'),
  setHapticSettings: (settings: { enabled: boolean; intensity: number }) => ipcRenderer.invoke('settings:setHaptics', settings),
  resetUIState: () => ipcRenderer.invoke('settings:resetUIState'),
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),

  // Entity caching APIs
  getCachedEntities: () => ipcRenderer.invoke('entities:getCached'),
  cacheEntities: (entities: any[]) => ipcRenderer.invoke('entities:cache', entities),
  clearCachedEntities: () => ipcRenderer.invoke('entities:clear'),

  // Home Assistant connection APIs
  getHAConnection: () => ipcRenderer.invoke('ha:getConnection'),
  setHAConnection: (url: string, token: string) => ipcRenderer.invoke('ha:setConnection', url, token),
  clearHAConnection: () => ipcRenderer.invoke('ha:clearConnection'),
  haFetch: (url: string, token: string) => ipcRenderer.invoke('ha:fetch', url, token),

  // Home Assistant WebSocket APIs
  haWsConnect: (url: string, token: string) => ipcRenderer.invoke('ha:ws:connect', url, token),
  haWsListDashboards: () => ipcRenderer.invoke('ha:ws:listDashboards'),
  haWsGetDashboardConfig: (urlPath: string | null) => ipcRenderer.invoke('ha:ws:getDashboardConfig', urlPath),
  haWsClose: () => ipcRenderer.invoke('ha:ws:close'),
  haWsIsConnected: () => ipcRenderer.invoke('ha:ws:isConnected'),
  haWsCreateTempDashboard: (config: any) => ipcRenderer.invoke('ha:ws:createTempDashboard', config),
  haWsUpdateTempDashboard: (tempPath: string, config: any) => ipcRenderer.invoke('ha:ws:updateTempDashboard', tempPath, config),
  haWsDeployDashboard: (tempPath: string, productionPath: string | null) => ipcRenderer.invoke('ha:ws:deployDashboard', tempPath, productionPath),
  haWsDeleteTempDashboard: (tempPath: string) => ipcRenderer.invoke('ha:ws:deleteTempDashboard', tempPath),
  haWsCreateDashboard: (urlPath: string, title: string, icon?: string) => ipcRenderer.invoke('ha:ws:createDashboard', urlPath, title, icon),
  haWsSaveDashboardConfig: (urlPath: string | null, config: any) => ipcRenderer.invoke('ha:ws:saveDashboardConfig', urlPath, config),
  haWsDeleteDashboard: (urlPath: string) => ipcRenderer.invoke('ha:ws:deleteDashboard', urlPath),
  haWsFetchEntities: () => ipcRenderer.invoke('ha:ws:fetchEntities'),
  haWsGetThemes: () => ipcRenderer.invoke('ha:ws:getThemes'),
  haWsSubscribeToThemes: (callback: (themes: any) => void) => {
    const channel = 'ha:ws:themesUpdated';
    ipcRenderer.on(channel, (_event, themes) => callback(themes));
    ipcRenderer.invoke('ha:ws:subscribeToThemes');
    return () => {
      ipcRenderer.removeAllListeners(channel);
      ipcRenderer.invoke('ha:ws:unsubscribeFromThemes');
    };
  },

  // Credentials APIs
  credentialsSave: (name: string, url: string, token: string, id?: string) => ipcRenderer.invoke('credentials:save', name, url, token, id),
  credentialsGetAll: () => ipcRenderer.invoke('credentials:getAll'),
  credentialsGet: (id: string) => ipcRenderer.invoke('credentials:get', id),
  credentialsGetLastUsed: () => ipcRenderer.invoke('credentials:getLastUsed'),
  credentialsMarkAsUsed: (id: string) => ipcRenderer.invoke('credentials:markAsUsed', id),
  credentialsDelete: (id: string) => ipcRenderer.invoke('credentials:delete', id),
  credentialsIsEncryptionAvailable: () => ipcRenderer.invoke('credentials:isEncryptionAvailable'),

  // Test-only APIs (only available when NODE_ENV=test)
  testSeedEntityCache: (entities: any[]) => ipcRenderer.invoke('test:seedEntityCache', entities),
  testClearEntityCache: () => ipcRenderer.invoke('test:clearEntityCache'),

  // Menu event listeners
  onMenuOpenFile: (callback: () => void) => {
    ipcRenderer.on('menu:open-file', callback);
    return () => ipcRenderer.removeListener('menu:open-file', callback);
  },
  onMenuSaveFile: (callback: () => void) => {
    ipcRenderer.on('menu:save-file', callback);
    return () => ipcRenderer.removeListener('menu:save-file', callback);
  },
  onMenuSaveFileAs: (callback: () => void) => {
    ipcRenderer.on('menu:save-file-as', callback);
    return () => ipcRenderer.removeListener('menu:save-file-as', callback);
  },
  onMenuToggleTheme: (callback: () => void) => {
    ipcRenderer.on('menu:toggle-theme', callback);
    return () => ipcRenderer.removeListener('menu:toggle-theme', callback);
  },
  onMenuShowAbout: (callback: () => void) => {
    ipcRenderer.on('menu:show-about', callback);
    return () => ipcRenderer.removeListener('menu:show-about', callback);
  },
  onMenuOpenRecentFile: (callback: (filePath: string) => void) => {
    ipcRenderer.on('menu:open-recent-file', (_event, filePath) => callback(filePath));
    return () => ipcRenderer.removeAllListeners('menu:open-recent-file');
  },
});

// Type definitions for TypeScript
export interface ElectronAPI {
  openFileDialog: () => Promise<{ canceled: boolean; filePath?: string }>;
  saveFileDialog: (defaultPath?: string) => Promise<{ canceled: boolean; filePath?: string }>;
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  fileExists: (filePath: string) => Promise<{ exists: boolean }>;
  createBackup: (filePath: string) => Promise<{ success: boolean; backupPath?: string; message?: string; error?: string }>;
  openExternal: (url: string) => Promise<void>;
  getTheme: () => Promise<{ theme: 'light' | 'dark' }>;
  setTheme: (theme: 'light' | 'dark') => Promise<{ success: boolean }>;
  getRecentFiles: () => Promise<{ files: string[] }>;
  addRecentFile: (filePath: string) => Promise<{ success: boolean }>;
  clearRecentFiles: () => Promise<{ success: boolean }>;
  getSelectedTheme: () => Promise<{ theme?: string }>;
  setSelectedTheme: (themeName: string) => Promise<{ success: boolean }>;
  getThemeDarkMode: () => Promise<{ darkMode: boolean }>;
  setThemeDarkMode: (darkMode: boolean) => Promise<{ success: boolean }>;
  getThemeSyncWithHA: () => Promise<{ sync: boolean }>;
  setThemeSyncWithHA: (sync: boolean) => Promise<{ success: boolean }>;
  getLoggingLevel: () => Promise<{ level: 'off' | 'error' | 'warn' | 'info' | 'debug' | 'trace' }>;
  setLoggingLevel: (level: 'off' | 'error' | 'warn' | 'info' | 'debug' | 'trace') => Promise<{ success: boolean }>;
  getVerboseUIDebug: () => Promise<{ verbose: boolean }>;
  setVerboseUIDebug: (verbose: boolean) => Promise<{ success: boolean }>;
  getHapticSettings: () => Promise<{ enabled: boolean; intensity: number }>;
  setHapticSettings: (settings: { enabled: boolean; intensity: number }) => Promise<{ success: boolean }>;
  resetUIState: () => Promise<{ success: boolean }>;
  getAppVersion: () => Promise<{ version: string }>;
  getCachedEntities: () => Promise<{ success: boolean; entities?: any[]; error?: string }>;
  cacheEntities: (entities: any[]) => Promise<{ success: boolean; error?: string }>;
  clearCachedEntities: () => Promise<{ success: boolean }>;
  getHAConnection: () => Promise<{ url?: string; token?: string }>;
  setHAConnection: (url: string, token: string) => Promise<{ success: boolean }>;
  clearHAConnection: () => Promise<{ success: boolean }>;
  haFetch: (url: string, token: string) => Promise<{ success: boolean; status?: number; data?: any; error?: string }>;
  haWsConnect: (url: string, token: string) => Promise<{ success: boolean; error?: string }>;
  haWsListDashboards: () => Promise<{ success: boolean; dashboards?: any[]; error?: string }>;
  haWsGetDashboardConfig: (urlPath: string | null) => Promise<{ success: boolean; config?: any; error?: string }>;
  haWsClose: () => Promise<{ success: boolean; error?: string }>;
  haWsIsConnected: () => Promise<{ connected: boolean }>;
  haWsCreateTempDashboard: (config: any) => Promise<{ success: boolean; tempPath?: string; error?: string }>;
  haWsUpdateTempDashboard: (tempPath: string, config: any) => Promise<{ success: boolean; error?: string }>;
  haWsDeployDashboard: (tempPath: string, productionPath: string | null) => Promise<{ success: boolean; backupPath?: string; error?: string }>;
  haWsDeleteTempDashboard: (tempPath: string) => Promise<{ success: boolean; error?: string }>;
  haWsCreateDashboard: (urlPath: string, title: string, icon?: string) => Promise<{ success: boolean; error?: string }>;
  haWsSaveDashboardConfig: (urlPath: string | null, config: any) => Promise<{ success: boolean; error?: string }>;
  haWsDeleteDashboard: (urlPath: string) => Promise<{ success: boolean; error?: string }>;
  haWsFetchEntities: () => Promise<{ success: boolean; entities?: any[]; error?: string }>;
  haWsGetThemes: () => Promise<{ success: boolean; themes?: any; error?: string }>;
  haWsSubscribeToThemes: (callback: (themes: any) => void) => (() => void);
  credentialsSave: (name: string, url: string, token: string, id?: string) => Promise<{ success: boolean; credential?: any; error?: string }>;
  credentialsGetAll: () => Promise<{ success: boolean; credentials?: any[]; error?: string }>;
  credentialsGet: (id: string) => Promise<{ success: boolean; credential?: any; error?: string }>;
  credentialsGetLastUsed: () => Promise<{ success: boolean; credential?: any; error?: string }>;
  credentialsMarkAsUsed: (id: string) => Promise<{ success: boolean; error?: string }>;
  credentialsDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  credentialsIsEncryptionAvailable: () => Promise<{ available: boolean }>;
  testSeedEntityCache: (entities: any[]) => Promise<{ success: boolean; error?: string }>;
  testClearEntityCache: () => Promise<{ success: boolean; error?: string }>;
  onMenuOpenFile: (callback: () => void) => (() => void);
  onMenuSaveFile: (callback: () => void) => (() => void);
  onMenuSaveFileAs: (callback: () => void) => (() => void);
  onMenuToggleTheme: (callback: () => void) => (() => void);
  onMenuShowAbout: (callback: () => void) => (() => void);
  onMenuOpenRecentFile: (callback: (filePath: string) => void) => (() => void);
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
