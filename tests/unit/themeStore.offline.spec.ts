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

  /**
   * F2 / UAT defect THEME-02. ⭐ THE MEASUREMENT THAT REFRAMED THIS CARD:
   * `saveCurrentTheme` is NOT broken. Its guard fires ONLY when no theme is
   * active, and saving succeeds the instant one is picked (the test above).
   * THEME-02's "No active theme to save" was the MISSING RESTORE seen from the
   * Manager tab — a returning user's selection had not come back.
   *
   * ⭐⭐ THIS TEST IS RED-LEGGABLE: `saveCurrentTheme` exists on base and returns
   * the OLD dead-end string there, so reverting `src/` fails it on the assertion
   * with the old text rather than at an import.
   */
  it('the refusal names the step that unblocks it, instead of stating a fact', () => {
    const result = useThemeStore.getState().saveCurrentTheme('UAT Theme');

    expect(result.success).toBe(false);
    // The old wording — "No active theme to save" — was correct and useless: it
    // is the first thing a user meets on this tab with nothing picked, and it
    // offers no way forward.
    expect(result.error).toBe('Pick an Active Theme on the Settings tab first, then save it here.');
    expect(result.error).not.toBe('No active theme to save');
  });

  it('still refuses an empty name, and that message is unchanged', () => {
    // ⭐ CONTROL — green on base AND on this branch. The name guard is a
    // different refusal and must not have been swept up in the reword.
    expect(useThemeStore.getState().saveCurrentTheme('   ')).toEqual({
      success: false,
      error: 'Theme name is required',
    });
  });
});

/**
 * F2 / UAT defect THEME-01 — restoring a selection a previous session persisted.
 *
 * ⭐⭐⭐ THE DEFECT, MEASURED BY RUNNING THE REAL STORE BEFORE ANY CODE WAS
 * WRITTEN: every pick was WRITTEN via `setSelectedTheme` and NEVER READ BACK.
 * `getSelectedTheme` existed in `settingsService`, `main.ts` and `preload.ts`
 * with ZERO renderer callers, and the boot effect restored only `darkMode` and
 * `syncWithHA`. Two of three theme preferences survived a restart; the third
 * vanished, though it was on disk the whole time.
 *
 * ⚠ RED-LEG HONESTY: `restoreSelectedTheme` is NEW, so these tests cannot be
 * red-legged — on base the action is undefined and they fail with a TypeError
 * rather than on an assertion. They are breadth over the outcome rules. The leg
 * that actually measures the defect is `tests/e2e/theme-restore.spec.ts`, which
 * restarts the real app against the same profile and fails on base because the
 * theme simply is not there.
 */
describe('themeStore restores a persisted selection (F2 / THEME-01)', () => {
  const freshState = (overrides = {}) => {
    useThemeStore.setState({
      availableThemes: { ...BUILT_IN_THEMES },
      savedThemes: {},
      baseThemeName: null,
      baseTheme: null,
      currentThemeName: null,
      currentTheme: null,
      syncWithHA: false,
      lastHAThemeName: null,
      viewOverrides: {},
      activeViewKey: null,
      ...overrides,
    });
  };

  beforeEach(() => freshState());

  it('re-applies a built-in theme the previous session chose', () => {
    const name = BUILT_IN_THEME_NAMES[0];

    const result = useThemeStore.getState().restoreSelectedTheme(name);

    expect(result).toEqual({ outcome: 'applied', themeName: name });
    expect(useThemeStore.getState().currentThemeName).toBe(name);
    expect(useThemeStore.getState().currentTheme).toEqual(BUILT_IN_THEMES[name]);
  });

  it('re-applies a SAVED theme too, not just a built-in', () => {
    // A saved theme is resolved from a different map; restoring must consult
    // both, exactly as `setTheme` does.
    const saved = { 'primary-color': '#123456' };
    freshState({ savedThemes: { Mine: { name: 'Mine', theme: saved, savedAt: 'x' } } });

    expect(useThemeStore.getState().restoreSelectedTheme('Mine')).toEqual({
      outcome: 'applied',
      themeName: 'Mine',
    });
    expect(useThemeStore.getState().currentTheme).toEqual(saved);
  });

  it('reports `none-saved` and changes nothing on a first run', () => {
    // The expected first-run case — NOT a problem, and must not be logged as one.
    expect(useThemeStore.getState().restoreSelectedTheme(undefined)).toEqual({
      outcome: 'none-saved',
      themeName: null,
    });
    expect(useThemeStore.getState().currentTheme).toBeNull();
  });

  it('⚠ reports `unresolved` — never silently — when the saved name is gone', () => {
    // ⭐⭐ THE CASE THAT MUST NOT BE SILENT. A persisted name is a REFERENCE, and
    // an HA theme is absent while disconnected. `setTheme` returns state
    // unchanged for a name it cannot resolve, which is invisible to everyone;
    // the restore path TELLS its caller, which is what lets App.tsx warn.
    const result = useThemeStore.getState().restoreSelectedTheme('A Theme From My HA Box');

    expect(result).toEqual({ outcome: 'unresolved', themeName: 'A Theme From My HA Box' });
    expect(useThemeStore.getState().currentThemeName).toBeNull();
    expect(useThemeStore.getState().currentTheme).toBeNull();
  });

  it('defers to Home Assistant when syncWithHA is on', () => {
    // ⚠ Signed off by the owner: sync is the more recent instruction. `setTheme`
    // turns sync OFF, so a persisted pick and sync-on can only coexist if the
    // user later re-enabled syncing — and that choice must win.
    freshState({ syncWithHA: true });

    expect(useThemeStore.getState().restoreSelectedTheme(BUILT_IN_THEME_NAMES[0])).toEqual({
      outcome: 'sync-owns-it',
      themeName: BUILT_IN_THEME_NAMES[0],
    });
    expect(useThemeStore.getState().currentTheme).toBeNull();
  });

  it('does NOT re-persist, and does NOT change the sync preference', () => {
    // ⭐ Restoring is not a new user instruction. `setTheme` deliberately sets
    // `syncWithHA: false` as a side effect of an explicit pick; a restore that
    // did the same would silently rewrite a preference it was only reading, and
    // writing back the value we just read would be pure noise.
    const before = useThemeStore.getState().syncWithHA;

    useThemeStore.getState().restoreSelectedTheme(BUILT_IN_THEME_NAMES[0]);

    expect(useThemeStore.getState().syncWithHA).toBe(before);
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
