import type { Theme } from '../../types/homeassistant';
import {
  THEME_MANAGER_EXPORT_VERSION,
  THEME_MANAGER_STORAGE_KEY,
  type SavedThemeRecord,
  type ThemeManagerExportPayload,
  type ThemeManagerPersistedState,
  type ThemeViewOverride,
} from './types';

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isThemeLike(value: unknown): value is Theme {
  return isObjectLike(value);
}

function sanitizeSavedThemeRecord(value: unknown): SavedThemeRecord | null {
  if (!isObjectLike(value)) return null;

  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const theme = isThemeLike(value.theme) ? value.theme : null;
  const createdAt = typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString();
  const updatedAt = typeof value.updatedAt === 'string' ? value.updatedAt : createdAt;

  if (!name || !theme) {
    return null;
  }

  return {
    name,
    theme,
    createdAt,
    updatedAt,
  };
}

function sanitizeViewOverrides(value: unknown): Record<string, ThemeViewOverride> {
  if (!isObjectLike(value)) return {};

  return Object.entries(value).reduce<Record<string, ThemeViewOverride>>((acc, [viewKey, rawOverride]) => {
    if (!isObjectLike(rawOverride)) return acc;
    const themeName = typeof rawOverride.themeName === 'string' ? rawOverride.themeName.trim() : '';
    if (!themeName) return acc;
    acc[viewKey] = { themeName };
    return acc;
  }, {});
}

export function normalizePersistedThemeManagerState(raw: unknown): ThemeManagerPersistedState {
  if (!isObjectLike(raw)) {
    return { savedThemes: {}, viewOverrides: {} };
  }

  const savedThemesArray = Array.isArray(raw.savedThemes) ? raw.savedThemes : [];
  const savedThemes = savedThemesArray.reduce<Record<string, SavedThemeRecord>>((acc, entry) => {
    const record = sanitizeSavedThemeRecord(entry);
    if (!record) return acc;
    acc[record.name] = record;
    return acc;
  }, {});

  const viewOverrides = sanitizeViewOverrides(raw.viewOverrides);

  return {
    savedThemes,
    viewOverrides,
  };
}

export function normalizeThemeManagerExportPayload(raw: unknown): ThemeManagerExportPayload {
  if (!isObjectLike(raw)) {
    throw new Error('Theme import payload must be an object');
  }

  const version = typeof raw.version === 'number' ? raw.version : NaN;
  if (version !== THEME_MANAGER_EXPORT_VERSION) {
    throw new Error(`Unsupported theme export version: ${String(raw.version)}`);
  }

  const exportedAt = typeof raw.exportedAt === 'string'
    ? raw.exportedAt
    : new Date().toISOString();

  const savedThemesRaw = Array.isArray(raw.savedThemes) ? raw.savedThemes : [];
  const savedThemes = savedThemesRaw
    .map(sanitizeSavedThemeRecord)
    .filter((item): item is SavedThemeRecord => item !== null);

  const viewOverrides = sanitizeViewOverrides(raw.viewOverrides);

  return {
    version,
    exportedAt,
    savedThemes,
    viewOverrides,
  };
}

export function readPersistedThemeManagerState(): ThemeManagerPersistedState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { savedThemes: {}, viewOverrides: {} };
  }

  const raw = window.localStorage.getItem(THEME_MANAGER_STORAGE_KEY);
  if (!raw) {
    return { savedThemes: {}, viewOverrides: {} };
  }

  try {
    return normalizePersistedThemeManagerState(JSON.parse(raw));
  } catch {
    return { savedThemes: {}, viewOverrides: {} };
  }
}

export function writePersistedThemeManagerState(state: ThemeManagerPersistedState): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  const payload: ThemeManagerExportPayload = {
    version: THEME_MANAGER_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    savedThemes: Object.values(state.savedThemes),
    viewOverrides: state.viewOverrides,
  };

  window.localStorage.setItem(THEME_MANAGER_STORAGE_KEY, JSON.stringify(payload));
}
