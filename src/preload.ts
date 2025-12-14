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
