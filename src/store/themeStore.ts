import { create } from 'zustand';
import { useDashboardStore } from './dashboardStore';
import { Theme, Themes } from '../types/homeassistant';
import { themeService } from '../services/themeService';
import {
  readPersistedThemeManagerState,
  writePersistedThemeManagerState,
  type SavedThemeRecord,
  type ThemeManagerImportResult,
  type ThemeViewOverride,
} from '../features/theme-manager';

interface ThemeStore {
  // State
  currentThemeName: string | null;
  currentTheme: Theme | null;
  availableThemes: Record<string, Theme>;
  darkMode: boolean;
  syncWithHA: boolean;

  // Additive theme-manager state
  baseThemeName: string | null;
  baseTheme: Theme | null;
  lastHAThemeName: string | null;
  savedThemes: Record<string, SavedThemeRecord>;
  viewOverrides: Record<string, ThemeViewOverride>;
  activeViewKey: string | null;

  // Actions
  setAvailableThemes: (themes: Themes) => void;
  setTheme: (themeName: string) => void;
  toggleDarkMode: () => void;
  setSyncWithHA: (sync: boolean) => void;

  saveCurrentTheme: (name: string) => { success: boolean; error?: string };
  loadSavedTheme: (name: string) => { success: boolean; error?: string };
  deleteSavedTheme: (name: string) => void;
  exportThemeManager: () => string;
  importThemeManager: (rawJson: string) => ThemeManagerImportResult;
  setViewOverride: (viewKey: string, themeName: string | null) => void;
  setActiveViewKey: (viewKey: string | null) => void;
}

const persisted = readPersistedThemeManagerState();

function resolveThemeByName(
  themeName: string | null,
  availableThemes: Record<string, Theme>,
  savedThemes: Record<string, SavedThemeRecord>
): Theme | null {
  if (!themeName) return null;
  return availableThemes[themeName] ?? savedThemes[themeName]?.theme ?? null;
}

function deriveEffectiveThemeState(state: ThemeStore): Pick<ThemeStore, 'currentThemeName' | 'currentTheme'> {
  const overrideThemeName = state.activeViewKey
    ? state.viewOverrides[state.activeViewKey]?.themeName ?? null
    : null;

  const preferredThemeName = overrideThemeName ?? state.baseThemeName;
  const preferredTheme = resolveThemeByName(preferredThemeName, state.availableThemes, state.savedThemes);

  return {
    currentThemeName: preferredThemeName,
    currentTheme: preferredTheme,
  };
}

function persistThemeManagerState(state: ThemeStore): void {
  writePersistedThemeManagerState({
    savedThemes: state.savedThemes,
    viewOverrides: state.viewOverrides,
  });
}

function resolveViewKeyFromDashboardStore(): string | null {
  const dashboardState = useDashboardStore.getState();
  const viewIndex = dashboardState.selectedViewIndex;
  const config = dashboardState.config;

  if (viewIndex === null || !config?.views?.[viewIndex]) {
    return null;
  }

  const view = config.views[viewIndex];
  return view.path || view.title || `view-${viewIndex}`;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  // Initial state
  currentThemeName: null,
  currentTheme: null,
  availableThemes: {},
  darkMode: true,
  syncWithHA: true,

  baseThemeName: null,
  baseTheme: null,
  lastHAThemeName: null,
  savedThemes: persisted.savedThemes,
  viewOverrides: persisted.viewOverrides,
  activeViewKey: null,

  // Set available themes from HA
  setAvailableThemes: (themes: Themes) => {
    set((state) => {
      const nextBaseThemeName = state.syncWithHA ? themes.theme : state.baseThemeName;
      const nextBaseTheme = resolveThemeByName(nextBaseThemeName, themes.themes, state.savedThemes);

      const nextState: ThemeStore = {
        ...state,
        availableThemes: themes.themes,
        darkMode: themes.darkMode,
        lastHAThemeName: themes.theme,
        baseThemeName: nextBaseThemeName,
        baseTheme: nextBaseTheme,
        ...deriveEffectiveThemeState({
          ...state,
          availableThemes: themes.themes,
          darkMode: themes.darkMode,
          lastHAThemeName: themes.theme,
          baseThemeName: nextBaseThemeName,
          baseTheme: nextBaseTheme,
        } as ThemeStore),
      };

      return nextState;
    });
  },

  // Set current global theme
  setTheme: (themeName: string) => {
    set((state) => {
      const nextBaseTheme = resolveThemeByName(themeName, state.availableThemes, state.savedThemes);
      if (!nextBaseTheme) {
        return state;
      }

      const nextState: ThemeStore = {
        ...state,
        baseThemeName: themeName,
        baseTheme: nextBaseTheme,
        syncWithHA: false,
        ...deriveEffectiveThemeState({
          ...state,
          baseThemeName: themeName,
          baseTheme: nextBaseTheme,
          syncWithHA: false,
        } as ThemeStore),
      };

      // Persist to settings
      window.electronAPI?.setSelectedTheme(themeName);
      window.electronAPI?.setThemeSyncWithHA(false);

      return nextState;
    });
  },

  // Toggle dark/light mode
  toggleDarkMode: () => {
    const newDarkMode = !get().darkMode;
    set({ darkMode: newDarkMode });
    // Persist to settings
    window.electronAPI?.setThemeDarkMode(newDarkMode);
  },

  // Enable/disable sync with HA
  setSyncWithHA: (sync: boolean) => {
    set((state) => {
      if (sync) {
        const syncedThemeName = state.lastHAThemeName;
        const syncedTheme = resolveThemeByName(syncedThemeName, state.availableThemes, state.savedThemes);

        const syncedState = {
          ...state,
          syncWithHA: true,
          baseThemeName: syncedThemeName,
          baseTheme: syncedTheme,
        } as ThemeStore;

        return {
          ...syncedState,
          ...deriveEffectiveThemeState(syncedState),
        };
      }

      return {
        syncWithHA: false,
      };
    });

    // Persist to settings
    window.electronAPI?.setThemeSyncWithHA(sync);
  },

  saveCurrentTheme: (name: string) => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      return { success: false, error: 'Theme name is required' };
    }

    const state = get();
    if (!state.currentTheme) {
      return { success: false, error: 'No active theme to save' };
    }

    const now = new Date().toISOString();
    const existing = state.savedThemes[normalizedName];

    const savedTheme: SavedThemeRecord = {
      name: normalizedName,
      theme: state.currentTheme,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    const nextSavedThemes = {
      ...state.savedThemes,
      [normalizedName]: savedTheme,
    };

    set((current) => {
      const nextState = {
        ...current,
        savedThemes: nextSavedThemes,
      } as ThemeStore;

      return {
        savedThemes: nextSavedThemes,
        ...deriveEffectiveThemeState(nextState),
      };
    });

    persistThemeManagerState({ ...state, savedThemes: nextSavedThemes } as ThemeStore);

    return { success: true };
  },

  loadSavedTheme: (name: string) => {
    const state = get();
    const record = state.savedThemes[name];

    if (!record) {
      return { success: false, error: `Saved theme not found: ${name}` };
    }

    const nextAvailableThemes = {
      ...state.availableThemes,
      [name]: record.theme,
    };

    set((current) => {
      const nextState = {
        ...current,
        availableThemes: nextAvailableThemes,
        baseThemeName: name,
        baseTheme: record.theme,
        syncWithHA: false,
      } as ThemeStore;

      return {
        availableThemes: nextAvailableThemes,
        baseThemeName: name,
        baseTheme: record.theme,
        syncWithHA: false,
        ...deriveEffectiveThemeState(nextState),
      };
    });

    window.electronAPI?.setSelectedTheme(name);
    window.electronAPI?.setThemeSyncWithHA(false);

    return { success: true };
  },

  deleteSavedTheme: (name: string) => {
    set((state) => {
      if (!state.savedThemes[name]) {
        return state;
      }

      const nextSavedThemes = { ...state.savedThemes };
      delete nextSavedThemes[name];

      const nextViewOverrides = Object.entries(state.viewOverrides).reduce<Record<string, ThemeViewOverride>>((acc, [key, override]) => {
        if (override.themeName !== name) {
          acc[key] = override;
        }
        return acc;
      }, {});

      const nextState = {
        ...state,
        savedThemes: nextSavedThemes,
        viewOverrides: nextViewOverrides,
      } as ThemeStore;

      const effective = deriveEffectiveThemeState(nextState);
      persistThemeManagerState(nextState);

      return {
        savedThemes: nextSavedThemes,
        viewOverrides: nextViewOverrides,
        ...effective,
      };
    });
  },

  exportThemeManager: () => {
    const state = get();

    return themeService.serializeThemeManagerPayload({
      exportedAt: new Date().toISOString(),
      savedThemes: Object.values(state.savedThemes),
      viewOverrides: state.viewOverrides,
    });
  },

  importThemeManager: (rawJson: string) => {
    const payload = themeService.parseThemeManagerPayload(rawJson);

    const importedSavedThemes = payload.savedThemes.reduce<Record<string, SavedThemeRecord>>((acc, record) => {
      acc[record.name] = record;
      return acc;
    }, {});

    const importedOverrides = payload.viewOverrides;

    set((state) => {
      const nextSavedThemes = {
        ...state.savedThemes,
        ...importedSavedThemes,
      };

      const nextViewOverrides = {
        ...state.viewOverrides,
        ...importedOverrides,
      };

      const nextAvailableThemes = {
        ...state.availableThemes,
      };

      Object.values(importedSavedThemes).forEach((record) => {
        if (!nextAvailableThemes[record.name]) {
          nextAvailableThemes[record.name] = record.theme;
        }
      });

      const nextState = {
        ...state,
        savedThemes: nextSavedThemes,
        viewOverrides: nextViewOverrides,
        availableThemes: nextAvailableThemes,
      } as ThemeStore;

      persistThemeManagerState(nextState);

      return {
        savedThemes: nextSavedThemes,
        viewOverrides: nextViewOverrides,
        availableThemes: nextAvailableThemes,
        ...deriveEffectiveThemeState(nextState),
      };
    });

    return {
      importedThemeCount: Object.keys(importedSavedThemes).length,
      importedOverrideCount: Object.keys(importedOverrides).length,
    };
  },

  setViewOverride: (viewKey: string, themeName: string | null) => {
    const normalizedViewKey = viewKey.trim();
    if (!normalizedViewKey) return;

    set((state) => {
      const nextOverrides = { ...state.viewOverrides };

      if (!themeName) {
        delete nextOverrides[normalizedViewKey];
      } else {
        nextOverrides[normalizedViewKey] = { themeName };
      }

      const nextState = {
        ...state,
        viewOverrides: nextOverrides,
      } as ThemeStore;

      persistThemeManagerState(nextState);

      return {
        viewOverrides: nextOverrides,
        ...deriveEffectiveThemeState(nextState),
      };
    });
  },

  setActiveViewKey: (viewKey: string | null) => {
    set((state) => {
      if (state.activeViewKey === viewKey) {
        return state;
      }

      const nextState = {
        ...state,
        activeViewKey: viewKey,
      } as ThemeStore;

      return {
        activeViewKey: viewKey,
        ...deriveEffectiveThemeState(nextState),
      };
    });
  },
}));

// Keep per-view theme overrides synchronized with active dashboard view selection.
useDashboardStore.subscribe(() => {
  const nextViewKey = resolveViewKeyFromDashboardStore();
  useThemeStore.getState().setActiveViewKey(nextViewKey);
});

// Initialize active view once store subscriptions are wired.
useThemeStore.getState().setActiveViewKey(resolveViewKeyFromDashboardStore());
