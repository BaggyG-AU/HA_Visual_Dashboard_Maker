import { beforeEach, describe, expect, it } from 'vitest';
import { themeService } from '../../src/services/themeService';
import { useThemeStore } from '../../src/store/themeStore';
import { useDashboardStore } from '../../src/store/dashboardStore';
import type { Theme, Themes } from '../../src/types/homeassistant';

const defaultTheme: Theme = {
  'primary-color': '#03a9f4',
  'accent-color': '#ff9800',
  'primary-text-color': '#ffffff',
  'text-primary-color': '#ffffff',
  'secondary-text-color': 'rgba(255, 255, 255, 0.7)',
  'primary-background-color': '#111111',
  'card-background-color': '#1c1c1c',
};

const oceanTheme: Theme = {
  'primary-color': '#4fc3f7',
  'accent-color': '#00acc1',
  'primary-text-color': '#ffffff',
  'text-primary-color': '#ffffff',
  'secondary-text-color': '#d9f6ff',
  'primary-background-color': '#0f1a25',
  'card-background-color': '#142231',
};

const mockThemes: Themes = {
  default_theme: 'default',
  default_dark_theme: null,
  darkMode: true,
  theme: 'default',
  themes: {
    default: defaultTheme,
    ocean: oceanTheme,
  },
};

const resetThemeStore = () => {
  useThemeStore.setState({
    currentThemeName: null,
    currentTheme: null,
    availableThemes: {},
    darkMode: true,
    syncWithHA: true,
    baseThemeName: null,
    baseTheme: null,
    lastHAThemeName: null,
    savedThemes: {},
    viewOverrides: {},
    activeViewKey: null,
  });
};

const resetDashboardStore = () => {
  useDashboardStore.setState({
    config: null,
    filePath: null,
    isLoading: false,
    error: null,
    isDirty: false,
    selectedViewIndex: null,
    selectedCardIndex: null,
    isBatching: false,
    past: [],
    future: [],
  });
};

describe('theme manager service and store workflows', () => {
  beforeEach(() => {
    localStorage.clear();
    resetDashboardStore();
    resetThemeStore();
  });

  it('serializes and parses theme manager payloads deterministically', () => {
    useThemeStore.getState().setAvailableThemes(mockThemes);

    const saveResult = useThemeStore.getState().saveCurrentTheme('snapshot-main');
    expect(saveResult.success).toBe(true);

    useThemeStore.getState().setViewOverride('view-main', 'snapshot-main');

    const exportedJson = useThemeStore.getState().exportThemeManager();
    const parsedExport = themeService.parseThemeManagerPayload(exportedJson);

    expect(parsedExport.version).toBe(1);
    expect(parsedExport.savedThemes).toHaveLength(1);
    expect(parsedExport.savedThemes[0].name).toBe('snapshot-main');
    expect(parsedExport.viewOverrides['view-main']?.themeName).toBe('snapshot-main');
  });

  it('imports saved themes and per-view overrides additively', () => {
    const json = themeService.serializeThemeManagerPayload({
      exportedAt: '2026-02-16T00:00:00.000Z',
      savedThemes: [
        {
          name: 'snapshot-ocean',
          theme: oceanTheme,
          createdAt: '2026-02-16T00:00:00.000Z',
          updatedAt: '2026-02-16T00:00:00.000Z',
        },
      ],
      viewOverrides: {
        'view-living': {
          themeName: 'snapshot-ocean',
        },
      },
    });

    const result = useThemeStore.getState().importThemeManager(json);

    expect(result.importedThemeCount).toBe(1);
    expect(result.importedOverrideCount).toBe(1);

    const state = useThemeStore.getState();
    expect(state.savedThemes['snapshot-ocean']?.theme['primary-color']).toBe('#4fc3f7');
    expect(state.viewOverrides['view-living']?.themeName).toBe('snapshot-ocean');
    expect(state.availableThemes['snapshot-ocean']).toBeDefined();
  });

  it('applies and clears active view overrides without mutating global sync semantics', () => {
    useThemeStore.getState().setAvailableThemes(mockThemes);
    useThemeStore.getState().setTheme('default');
    useThemeStore.getState().saveCurrentTheme('snapshot-default');
    useThemeStore.getState().loadSavedTheme('snapshot-default');

    useThemeStore.getState().setActiveViewKey('view-living');
    useThemeStore.getState().setViewOverride('view-living', 'ocean');

    const withOverride = useThemeStore.getState();
    expect(withOverride.currentThemeName).toBe('ocean');
    expect(withOverride.currentTheme?.['primary-color']).toBe('#4fc3f7');
    expect(withOverride.syncWithHA).toBe(false);

    useThemeStore.getState().setViewOverride('view-living', null);
    const afterClear = useThemeStore.getState();
    expect(afterClear.currentThemeName).toBe('snapshot-default');
    expect(afterClear.viewOverrides['view-living']).toBeUndefined();
  });

  it('rejects malformed import payloads', () => {
    expect(() => useThemeStore.getState().importThemeManager('{"version":2}')).toThrow(
      /Unsupported theme export version/
    );
  });
});
