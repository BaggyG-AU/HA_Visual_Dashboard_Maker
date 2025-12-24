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

  // Shell APIs
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),

  // Settings APIs
  getTheme: () => ipcRenderer.invoke('settings:getTheme'),
  setTheme: (theme: 'light' | 'dark') => ipcRenderer.invoke('settings:setTheme', theme),

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

  // Credentials APIs
  credentialsSave: (name: string, url: string, token: string, id?: string) => ipcRenderer.invoke('credentials:save', name, url, token, id),
  credentialsGetAll: () => ipcRenderer.invoke('credentials:getAll'),
  credentialsGet: (id: string) => ipcRenderer.invoke('credentials:get', id),
  credentialsGetLastUsed: () => ipcRenderer.invoke('credentials:getLastUsed'),
  credentialsMarkAsUsed: (id: string) => ipcRenderer.invoke('credentials:markAsUsed', id),
  credentialsDelete: (id: string) => ipcRenderer.invoke('credentials:delete', id),
  credentialsIsEncryptionAvailable: () => ipcRenderer.invoke('credentials:isEncryptionAvailable'),

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
});

// Type definitions for TypeScript
export interface ElectronAPI {
  openFileDialog: () => Promise<{ canceled: boolean; filePath?: string }>;
  saveFileDialog: (defaultPath?: string) => Promise<{ canceled: boolean; filePath?: string }>;
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  fileExists: (filePath: string) => Promise<{ exists: boolean }>;
  openExternal: (url: string) => Promise<void>;
  getTheme: () => Promise<{ theme: 'light' | 'dark' }>;
  setTheme: (theme: 'light' | 'dark') => Promise<{ success: boolean }>;
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
  credentialsSave: (name: string, url: string, token: string, id?: string) => Promise<{ success: boolean; credential?: any; error?: string }>;
  credentialsGetAll: () => Promise<{ success: boolean; credentials?: any[]; error?: string }>;
  credentialsGet: (id: string) => Promise<{ success: boolean; credential?: any; error?: string }>;
  credentialsGetLastUsed: () => Promise<{ success: boolean; credential?: any; error?: string }>;
  credentialsMarkAsUsed: (id: string) => Promise<{ success: boolean; error?: string }>;
  credentialsDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  credentialsIsEncryptionAvailable: () => Promise<{ available: boolean }>;
  onMenuOpenFile: (callback: () => void) => (() => void);
  onMenuSaveFile: (callback: () => void) => (() => void);
  onMenuSaveFileAs: (callback: () => void) => (() => void);
  onMenuToggleTheme: (callback: () => void) => (() => void);
  onMenuShowAbout: (callback: () => void) => (() => void);
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
