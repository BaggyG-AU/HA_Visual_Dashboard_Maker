import type { Theme, ThemeVars } from '../../types/homeassistant';

/**
 * Built-in themes shipped with HAVDM.
 *
 * ⭐ WHY THESE EXIST (RC5). Themes are LOCAL content, but `themeStore`'s
 * `availableThemes` was only ever populated from Home Assistant
 * (`setAvailableThemes`), so with no connection there was genuinely nothing to
 * select — the Active Theme picker rendered empty AND `ant-select-disabled`,
 * and `saveCurrentTheme` refused with "No active theme to save" because
 * `currentTheme` was null. That made UAT cards THEME-01, THEME-02 and THEME-03
 * impossible to execute, and all three were Skipped in the v1.0.0 round-1 UAT
 * with the tester's note "No themes available".
 *
 * ⭐ THE PATTERN THIS FOLLOWS is already proven in this repo: the Preset
 * Marketplace ships a local seed catalogue (`PRESET_MARKETPLACE_SEED` in
 * `src/features/preset-marketplace/catalog.ts`) and works with no HA. Themes now
 * do the same. A Home Assistant connection ADDS that instance's themes
 * alongside these; it is never a precondition.
 *
 * ⚠ COLLISION RULE: HA wins. `setAvailableThemes` spreads the built-ins FIRST
 * and the instance's themes second, so a user's real HA theme always shadows a
 * built-in of the same name. Never invert that spread.
 *
 * ⚠ CONTRAST CONTRACT: every mode below satisfies the owner's standing rule
 * from the round-1 direction — "if dark background then must be light text and
 * vice versa". `tests/unit/builtInThemes.spec.ts` enforces it mechanically with
 * a Rec.709 luma check, so a future edit cannot quietly reintroduce dark-on-dark.
 *
 * ⚠ `ThemeVars` makes six keys REQUIRED, so every `modes.dark` / `modes.light`
 * block below is exhaustive rather than a partial override. Note that Home
 * Assistant carries BOTH `primary-text-color` and `text-primary-color`;
 * `themeService.getThemeColors` falls back from the first to the second, so both
 * are supplied.
 */

/**
 * Keys every built-in theme must define in BOTH modes.
 *
 * `themeService.getThemeColors` reads exactly this set to drive the theme
 * preview, and the canvas surface reads `primary-background-color` and
 * `primary-text-color`. A theme missing one renders a blank swatch.
 */
export const BUILT_IN_THEME_REQUIRED_KEYS = [
  'primary-color',
  'accent-color',
  'primary-text-color',
  'text-primary-color',
  'secondary-text-color',
  'primary-background-color',
  'card-background-color',
] as const;

const havdmDefaultDark: ThemeVars = {
  'primary-color': '#03a9f4',
  'accent-color': '#ff9800',
  'primary-text-color': '#ffffff',
  'text-primary-color': '#ffffff',
  'secondary-text-color': '#b3c1cc',
  'primary-background-color': '#111417',
  'card-background-color': '#1c2126',
  'divider-color': '#2b3238',
};

const havdmDefaultLight: ThemeVars = {
  'primary-color': '#0277bd',
  'accent-color': '#e65100',
  'primary-text-color': '#16191c',
  'text-primary-color': '#16191c',
  'secondary-text-color': '#4a555f',
  'primary-background-color': '#fafbfc',
  'card-background-color': '#ffffff',
  'divider-color': '#dfe3e8',
};

const havdmMidnightDark: ThemeVars = {
  'primary-color': '#7c9cff',
  'accent-color': '#c792ea',
  'primary-text-color': '#e8ecff',
  'text-primary-color': '#e8ecff',
  'secondary-text-color': '#a3adcc',
  'primary-background-color': '#0b1020',
  'card-background-color': '#151c33',
  'divider-color': '#232c4a',
};

const havdmMidnightLight: ThemeVars = {
  'primary-color': '#3d5afe',
  'accent-color': '#7b1fa2',
  'primary-text-color': '#111634',
  'text-primary-color': '#111634',
  'secondary-text-color': '#454d70',
  'primary-background-color': '#f3f5ff',
  'card-background-color': '#ffffff',
  'divider-color': '#d8ddf2',
};

const havdmSolarDark: ThemeVars = {
  'primary-color': '#f59e0b',
  'accent-color': '#14b8a6',
  'primary-text-color': '#fdf3e3',
  'text-primary-color': '#fdf3e3',
  'secondary-text-color': '#d3bfa0',
  'primary-background-color': '#1d1710',
  'card-background-color': '#2a2118',
  'divider-color': '#3d3125',
};

const havdmSolarLight: ThemeVars = {
  'primary-color': '#b45309',
  'accent-color': '#0f766e',
  'primary-text-color': '#2b2015',
  'text-primary-color': '#2b2015',
  'secondary-text-color': '#6b5942',
  'primary-background-color': '#fdf8ef',
  'card-background-color': '#fffdf8',
  'divider-color': '#e8dcc6',
};

const havdmHighContrastDark: ThemeVars = {
  'primary-color': '#00e5ff',
  'accent-color': '#ffea00',
  'primary-text-color': '#ffffff',
  'text-primary-color': '#ffffff',
  'secondary-text-color': '#e0e0e0',
  'primary-background-color': '#000000',
  'card-background-color': '#0d0d0d',
  'divider-color': '#ffffff',
};

const havdmHighContrastLight: ThemeVars = {
  'primary-color': '#0000cc',
  'accent-color': '#8b0000',
  'primary-text-color': '#000000',
  'text-primary-color': '#000000',
  'secondary-text-color': '#1f1f1f',
  'primary-background-color': '#ffffff',
  'card-background-color': '#ffffff',
  'divider-color': '#000000',
};

export const BUILT_IN_THEMES: Record<string, Theme> = {
  'HAVDM Default': {
    ...havdmDefaultDark,
    modes: { dark: havdmDefaultDark, light: havdmDefaultLight },
  },
  'HAVDM Midnight': {
    ...havdmMidnightDark,
    modes: { dark: havdmMidnightDark, light: havdmMidnightLight },
  },
  'HAVDM Solar': {
    ...havdmSolarDark,
    modes: { dark: havdmSolarDark, light: havdmSolarLight },
  },
  'HAVDM High Contrast': {
    ...havdmHighContrastDark,
    modes: { dark: havdmHighContrastDark, light: havdmHighContrastLight },
  },
};

/** Stable list of built-in theme names, for tests and UI affordances. */
export const BUILT_IN_THEME_NAMES = Object.keys(BUILT_IN_THEMES);

/** True when `name` is one of HAVDM's own themes rather than an HA-supplied one. */
export function isBuiltInThemeName(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(BUILT_IN_THEMES, name);
}
