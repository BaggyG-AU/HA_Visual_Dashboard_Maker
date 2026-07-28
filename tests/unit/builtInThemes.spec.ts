import { describe, expect, it } from 'vitest';
import {
  BUILT_IN_THEMES,
  BUILT_IN_THEME_NAMES,
  BUILT_IN_THEME_REQUIRED_KEYS,
  buildThemeOptions,
  isBuiltInThemeName,
  type SavedThemeRecord,
} from '../../src/features/theme-manager';
import type { Theme, ThemeMode } from '../../src/types/homeassistant';

/**
 * RC5 — HAVDM ships built-in themes so the theme picker works with no Home
 * Assistant connection. These tests pin the two properties that a future edit
 * could silently break: the owner's contrast rule, and the HA-wins merge order.
 */

/** Rec.709 relative luminance of a #rrggbb / #rgb colour, 0 (black) .. 1 (white). */
function luminance(hex: string): number {
  const normalized =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex.toLowerCase();

  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function modeVars(themeName: string, mode: 'dark' | 'light'): Record<string, string> {
  const themeValue: Theme = BUILT_IN_THEMES[themeName];
  const base = { ...themeValue };
  delete base.modes;

  const overrides = (themeValue.modes as ThemeMode | undefined)?.[mode] ?? {};

  return { ...base, ...overrides } as unknown as Record<string, string>;
}

describe('built-in themes', () => {
  it('ships at least two themes so a per-view override is distinguishable', () => {
    // THEME-03 asks the tester to tell an overridden view from a global one.
    expect(BUILT_IN_THEME_NAMES.length).toBeGreaterThanOrEqual(2);
  });

  it.each(BUILT_IN_THEME_NAMES)('%s declares every required key in both modes', (themeName) => {
    (['dark', 'light'] as const).forEach((mode) => {
      const vars = modeVars(themeName, mode);
      BUILT_IN_THEME_REQUIRED_KEYS.forEach((key) => {
        expect(vars[key], `${themeName} / ${mode} is missing ${key}`).toBeTruthy();
      });
    });
  });

  /**
   * ⭐ The owner's standing rule, from the v1.0.0 UAT round-1 direction:
   * "if dark background then must be light text and vice versa".
   * Encoded mechanically so nobody can reintroduce dark-on-dark by hand.
   */
  it.each(BUILT_IN_THEME_NAMES)('%s keeps text legible against its background', (themeName) => {
    (['dark', 'light'] as const).forEach((mode) => {
      const vars = modeVars(themeName, mode);

      const background = luminance(vars['primary-background-color']);
      const primaryText = luminance(vars['primary-text-color']);
      const secondaryText = luminance(vars['secondary-text-color']);
      const cardBackground = luminance(vars['card-background-color']);

      if (background < 0.5) {
        expect(primaryText, `${themeName}/${mode}: dark bg needs light text`).toBeGreaterThan(0.5);
        expect(
          secondaryText,
          `${themeName}/${mode}: dark bg needs light secondary text`,
        ).toBeGreaterThan(0.4);
      } else {
        expect(primaryText, `${themeName}/${mode}: light bg needs dark text`).toBeLessThan(0.5);
        expect(
          secondaryText,
          `${themeName}/${mode}: light bg needs dark secondary text`,
        ).toBeLessThan(0.6);
      }

      // A card must not vanish into the canvas behind it.
      expect(
        Math.abs(cardBackground - primaryText),
        `${themeName}/${mode}: card background and text are too close`,
      ).toBeGreaterThan(0.3);
    });
  });

  it('recognises its own theme names and rejects others', () => {
    expect(isBuiltInThemeName(BUILT_IN_THEME_NAMES[0])).toBe(true);
    expect(isBuiltInThemeName('Some HA Theme')).toBe(false);
  });
});

describe('buildThemeOptions', () => {
  const saved = (name: string): SavedThemeRecord => ({
    name,
    theme: { 'primary-color': '#123456' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  });

  it('offers the built-in themes with no HA connection and no saved themes', () => {
    const options = buildThemeOptions({ ...BUILT_IN_THEMES }, {});
    expect(options.length).toBe(BUILT_IN_THEME_NAMES.length);
    expect(options.map((o) => o.value)).toEqual(expect.arrayContaining(BUILT_IN_THEME_NAMES));
  });

  it('unions saved themes that are not already available', () => {
    // Before RC5 the pickers read availableThemes alone, so a saved theme
    // resolved via resolveThemeByName but could never be selected.
    const options = buildThemeOptions({ ...BUILT_IN_THEMES }, { 'My Saved': saved('My Saved') });
    expect(options.map((o) => o.value)).toContain('My Saved');
  });

  it('does not duplicate a saved theme that is also available', () => {
    const name = BUILT_IN_THEME_NAMES[0];
    const options = buildThemeOptions({ ...BUILT_IN_THEMES }, { [name]: saved(name) });
    expect(options.filter((o) => o.value === name)).toHaveLength(1);
  });

  it('returns an empty list only when both sources are empty', () => {
    expect(buildThemeOptions({}, {})).toEqual([]);
  });
});
