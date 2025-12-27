import { create } from 'zustand';
import { Theme, Themes } from '../types/homeassistant';

interface ThemeStore {
  // State
  currentThemeName: string | null;
  currentTheme: Theme | null;
  availableThemes: Record<string, Theme>;
  darkMode: boolean;
  syncWithHA: boolean;

  // Actions
  setAvailableThemes: (themes: Themes) => void;
  setTheme: (themeName: string) => void;
  toggleDarkMode: () => void;
  setSyncWithHA: (sync: boolean) => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  // Initial state
  currentThemeName: null,
  currentTheme: null,
  availableThemes: {},
  darkMode: true,
  syncWithHA: true,

  // Set available themes from HA
  setAvailableThemes: (themes: Themes) => {
    set({
      availableThemes: themes.themes,
      darkMode: themes.darkMode,
    });

    // If syncing with HA, apply HA's current theme
    if (get().syncWithHA) {
      const haTheme = themes.themes[themes.theme];
      if (haTheme) {
        set({
          currentThemeName: themes.theme,
          currentTheme: haTheme,
        });
      }
    }
  },

  // Set current theme
  setTheme: (themeName: string) => {
    const theme = get().availableThemes[themeName];
    if (theme) {
      set({
        currentThemeName: themeName,
        currentTheme: theme,
        syncWithHA: false, // Manual selection disables sync
      });
      // Persist to settings
      window.electronAPI?.setSelectedTheme(themeName);
      window.electronAPI?.setThemeSyncWithHA(false);
    }
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
    set({ syncWithHA: sync });
    // Persist to settings
    window.electronAPI?.setThemeSyncWithHA(sync);
  },
}));
