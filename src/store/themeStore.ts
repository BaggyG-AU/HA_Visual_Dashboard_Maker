import { create } from 'zustand';
import { useDashboardStore } from './dashboardStore';
import { Theme, Themes } from '../types/homeassistant';
import { themeService } from '../services/themeService';
import {
  BUILT_IN_THEMES,
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
  /**
   * Re-apply a theme selection persisted by a previous session (F2 / THEME-01).
   * Returns what actually happened so the caller can log or surface it — a
   * restore that silently does nothing is the defect this fixes, not a fix.
   */
  restoreSelectedTheme: (themeName: string | null | undefined) => ThemeRestoreResult;
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

/**
 * Why a restore did or did not apply (F2). Every outcome is NAMED rather than
 * folded into a boolean, because the failure this feature exists to fix was
 * precisely an outcome nobody could see.
 *
 * - `applied`      — the persisted name resolved and is now the active theme.
 * - `none-saved`   — no selection was ever persisted. The expected first-run
 *                    case, and NOT a problem.
 * - `sync-owns-it` — `syncWithHA` is on, so Home Assistant's theme governs and
 *                    an explicit selection must not fight it. (`setTheme` turns
 *                    sync off, so a persisted pick and sync-on can only coexist
 *                    if the user later re-enabled sync — in which case sync is
 *                    the more recent instruction and wins.)
 * - `unresolved`   — a name WAS persisted but no longer names a theme we have,
 *                    e.g. an HA theme that is gone, or one only present while
 *                    connected. ⚠ THIS IS THE CASE THAT MUST NEVER BE SILENT:
 *                    a persisted name is a REFERENCE, and a reference that no
 *                    longer resolves is information the user needs.
 */
export type ThemeRestoreOutcome = 'applied' | 'none-saved' | 'sync-owns-it' | 'unresolved';

export interface ThemeRestoreResult {
  outcome: ThemeRestoreOutcome;
  themeName: string | null;
}

const persisted = readPersistedThemeManagerState();

function resolveThemeByName(
  themeName: string | null,
  availableThemes: Record<string, Theme>,
  savedThemes: Record<string, SavedThemeRecord>,
): Theme | null {
  if (!themeName) return null;
  return availableThemes[themeName] ?? savedThemes[themeName]?.theme ?? null;
}

function deriveEffectiveThemeState(
  state: ThemeStore,
): Pick<ThemeStore, 'currentThemeName' | 'currentTheme'> {
  const overrideThemeName = state.activeViewKey
    ? (state.viewOverrides[state.activeViewKey]?.themeName ?? null)
    : null;

  const preferredThemeName = overrideThemeName ?? state.baseThemeName;
  const preferredTheme = resolveThemeByName(
    preferredThemeName,
    state.availableThemes,
    state.savedThemes,
  );

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
  // ⭐ RC5: seeded with HAVDM's own themes so the picker is usable with NO Home
  // Assistant connection. Was `{}`, populated only by `setAvailableThemes` from
  // HA, which left THEME-01/02/03 with nothing to select and no theme to save.
  // ⚠ `baseThemeName` stays null, so `currentTheme` stays null and no theme is
  // auto-applied — seeding the catalogue changes no pixel until a user picks one.
  availableThemes: { ...BUILT_IN_THEMES },
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
      // ⭐ RC5: MERGE, never replace. The built-ins must survive a connection so
      // the picker keeps working after a later disconnect.
      // ⚠ HA WINS ON COLLISION — the instance's themes are spread SECOND, so a
      // user's real HA theme always shadows a built-in of the same name. Never
      // invert this spread.
      const mergedThemes = { ...BUILT_IN_THEMES, ...themes.themes };

      const nextBaseThemeName = state.syncWithHA ? themes.theme : state.baseThemeName;
      const nextBaseTheme = resolveThemeByName(nextBaseThemeName, mergedThemes, state.savedThemes);

      const nextState: ThemeStore = {
        ...state,
        availableThemes: mergedThemes,
        darkMode: themes.darkMode,
        lastHAThemeName: themes.theme,
        baseThemeName: nextBaseThemeName,
        baseTheme: nextBaseTheme,
        ...deriveEffectiveThemeState({
          ...state,
          availableThemes: mergedThemes,
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

  /**
   * Re-apply the theme a previous session persisted (F2 / UAT defect THEME-01).
   *
   * ⭐⭐⭐ THE DEFECT THIS FIXES, MEASURED BY RUNNING THE REAL STORE: every pick
   * was WRITTEN (`setTheme` calls `setSelectedTheme`) and NEVER READ BACK.
   * `getSelectedTheme` existed in `settingsService`, `main.ts` and `preload.ts`
   * with **zero renderer callers**, and the boot effect restored only `darkMode`
   * and `syncWithHA`. So two of three theme preferences came back after a
   * restart and the third silently did not.
   *
   * ⭐⭐ AND IT IS ALSO THE ROOT OF THE *OTHER* REPORTED SYMPTOM. THEME-02's
   * "No active theme to save" is not a defect in `saveCurrentTheme` — measured,
   * that guard fires ONLY when nothing is active, and saving succeeds the moment
   * a theme is picked. A returning user hit it because their previous selection
   * had not come back. One missing read, two failed cards.
   *
   * ⚠ THIS IS DELIBERATELY NOT `setTheme`. `setTheme` is a USER INSTRUCTION and
   * turns `syncWithHA` off as a side effect; restoring is not a new instruction
   * and must not silently change what the user chose about syncing. It also does
   * not re-persist — writing back what we just read would be pure noise.
   */
  restoreSelectedTheme: (themeName: string | null | undefined) => {
    const state = get();

    if (!themeName) {
      return { outcome: 'none-saved' as const, themeName: null };
    }

    // Sync is the more recent instruction — see ThemeRestoreOutcome.
    if (state.syncWithHA) {
      return { outcome: 'sync-owns-it' as const, themeName };
    }

    // ⚠⚠ RE-RESOLVE, ALWAYS. A persisted name is a REFERENCE to a theme that
    // may no longer exist — an HA theme removed from the instance, or one only
    // present while connected. `setTheme` returns state unchanged for a name it
    // cannot resolve, which is invisible; here the caller is TOLD.
    const restoredTheme = resolveThemeByName(themeName, state.availableThemes, state.savedThemes);
    if (!restoredTheme) {
      return { outcome: 'unresolved' as const, themeName };
    }

    set((current) => {
      const nextState: ThemeStore = {
        ...current,
        baseThemeName: themeName,
        baseTheme: restoredTheme,
        ...deriveEffectiveThemeState({
          ...current,
          baseThemeName: themeName,
          baseTheme: restoredTheme,
        } as ThemeStore),
      };
      return nextState;
    });

    return { outcome: 'applied' as const, themeName };
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
        const syncedTheme = resolveThemeByName(
          syncedThemeName,
          state.availableThemes,
          state.savedThemes,
        );

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
      // ⚠ F2: THE GUARD IS CORRECT — THE OLD WORDING WAS A DEAD END. "No active
      // theme to save" states a fact and offers no way out, and it is the first
      // thing a user meets on this tab with nothing picked. Measured: this fires
      // ONLY when no theme is active, and saving succeeds immediately once one
      // is. So the message now names the step that unblocks it.
      //
      // ⭐ A returning user should never see this at all once the boot restore
      // above works — but a brand-new profile legitimately reaches it, and that
      // user is exactly the one with no idea what to do next.
      return {
        success: false,
        error: 'Pick an Active Theme on the Settings tab first, then save it here.',
      };
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

      const nextViewOverrides = Object.entries(state.viewOverrides).reduce<
        Record<string, ThemeViewOverride>
      >((acc, [key, override]) => {
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

    const importedSavedThemes = payload.savedThemes.reduce<Record<string, SavedThemeRecord>>(
      (acc, record) => {
        acc[record.name] = record;
        return acc;
      },
      {},
    );

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
