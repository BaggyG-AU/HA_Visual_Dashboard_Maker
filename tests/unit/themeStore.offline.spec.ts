import { beforeEach, describe, expect, it } from 'vitest';
import { useThemeStore } from '../../src/store/themeStore';
import { BUILT_IN_THEMES, BUILT_IN_THEME_NAMES } from '../../src/features/theme-manager';

/**
 * RC5 — `availableThemes` used to initialise to `{}` and was only ever populated
 * by `setAvailableThemes` from Home Assistant. With no connection there was
 * genuinely nothing to select, which is why UAT cards THEME-01, THEME-02 and
 * THEME-03 were all Skipped in the v1.0.0 round-1 UAT.
 */
describe('themeStore with no Home Assistant connection', () => {
  beforeEach(() => {
    useThemeStore.setState({
      availableThemes: { ...BUILT_IN_THEMES },
      savedThemes: {},
      baseThemeName: null,
      baseTheme: null,
      currentThemeName: null,
      currentTheme: null,
      syncWithHA: true,
      lastHAThemeName: null,
    });
  });

  it('starts with the built-in themes available', () => {
    const { availableThemes } = useThemeStore.getState();
    expect(Object.keys(availableThemes).length).toBeGreaterThan(0);
    BUILT_IN_THEME_NAMES.forEach((name) => {
      expect(availableThemes[name]).toBeDefined();
    });
  });

  it('does NOT auto-apply a theme, so no snapshot can move until a user picks one', () => {
    // ⚠ Load-bearing for the ZERO-REBASELINE policy: every visual baseline is
    // captured with currentTheme === null, and the canvas falls back to its antd
    // token in that state.
    const { currentTheme, currentThemeName } = useThemeStore.getState();
    expect(currentTheme).toBeNull();
    expect(currentThemeName).toBeNull();
  });

  it('can select a built-in theme with no connection', () => {
    const name = BUILT_IN_THEME_NAMES[0];
    useThemeStore.getState().setTheme(name);

    const { currentThemeName, currentTheme } = useThemeStore.getState();
    expect(currentThemeName).toBe(name);
    expect(currentTheme).toEqual(BUILT_IN_THEMES[name]);
  });

  it('can save a built-in theme under a new name (THEME-02 was blocked on this)', () => {
    useThemeStore.getState().setTheme(BUILT_IN_THEME_NAMES[0]);

    // Previously returned { success: false, error: 'No active theme to save' }
    // because currentTheme was null with no HA connection.
    const result = useThemeStore.getState().saveCurrentTheme('UAT Theme');
    expect(result.success).toBe(true);
    expect(useThemeStore.getState().savedThemes['UAT Theme']).toBeDefined();
  });
});

describe('themeStore when Home Assistant connects', () => {
  beforeEach(() => {
    useThemeStore.setState({
      availableThemes: { ...BUILT_IN_THEMES },
      savedThemes: {},
      baseThemeName: null,
      baseTheme: null,
      currentThemeName: null,
      currentTheme: null,
      syncWithHA: true,
      lastHAThemeName: null,
    });
  });

  it('keeps the built-ins alongside the instance themes', () => {
    useThemeStore.getState().setAvailableThemes({
      default_theme: 'HA Theme',
      default_dark_theme: null,
      themes: { 'HA Theme': { 'primary-color': '#abcdef' } },
      darkMode: true,
      theme: 'HA Theme',
    });

    const { availableThemes } = useThemeStore.getState();
    expect(availableThemes['HA Theme']).toBeDefined();
    // MERGE, not replace — otherwise a later disconnect leaves an empty picker.
    BUILT_IN_THEME_NAMES.forEach((name) => {
      expect(availableThemes[name]).toBeDefined();
    });
  });

  it('lets a real HA theme SHADOW a built-in of the same name', () => {
    const collidingName = BUILT_IN_THEME_NAMES[0];
    const haVersion = { 'primary-color': '#ff0000' };

    useThemeStore.getState().setAvailableThemes({
      default_theme: collidingName,
      default_dark_theme: null,
      themes: { [collidingName]: haVersion },
      darkMode: true,
      theme: collidingName,
    });

    // ⚠ The instance's own theme must win — it is the user's real configuration.
    expect(useThemeStore.getState().availableThemes[collidingName]).toEqual(haVersion);
  });
});
