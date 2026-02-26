import type { Theme } from '../../types/homeassistant';

export const THEME_MANAGER_EXPORT_VERSION = 1;
export const THEME_MANAGER_STORAGE_KEY = 'havdm.theme-manager.v1';

export interface SavedThemeRecord {
  name: string;
  theme: Theme;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeViewOverride {
  themeName: string;
}

export interface ThemeManagerExportPayload {
  version: number;
  exportedAt: string;
  savedThemes: SavedThemeRecord[];
  viewOverrides: Record<string, ThemeViewOverride>;
}

export interface ThemeManagerPersistedState {
  savedThemes: Record<string, SavedThemeRecord>;
  viewOverrides: Record<string, ThemeViewOverride>;
}

export interface ThemeManagerImportResult {
  importedThemeCount: number;
  importedOverrideCount: number;
}
