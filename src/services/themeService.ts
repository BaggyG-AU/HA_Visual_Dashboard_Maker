import { Theme } from '../types/homeassistant';
import { logger } from './logger';
// ⚠ Imported from the leaf modules, NOT the `../features/theme-manager` barrel.
// The barrel re-exports `themeOptions`, which now calls back into this service
// to compute the "no preview effect" badge — going through the barrel would
// make that a circular import (themeService → barrel → themeOptions →
// themeService). `types` and `storage` import nothing from `src/services`, so
// this direction is acyclic. Do not collapse these back into the barrel.
import {
  THEME_MANAGER_EXPORT_VERSION,
  type ThemeManagerExportPayload,
} from '../features/theme-manager/types';
import { normalizeThemeManagerExportPayload } from '../features/theme-manager/storage';

/**
 * Theme Service
 * Handles applying Home Assistant themes to DOM elements
 */
export class ThemeService {
  /**
   * Apply theme CSS variables to an element
   */
  applyThemeToElement(element: HTMLElement, theme: Theme, darkMode: boolean): void {
    logger.debug('Applying theme to element', { darkMode });

    // Merge base theme with mode-specific overrides
    const baseVars = { ...theme };
    delete baseVars.modes;

    const modeVars = darkMode ? theme.modes?.dark || {} : theme.modes?.light || {};

    const finalVars = { ...baseVars, ...modeVars };

    // Apply CSS variables
    Object.entries(finalVars).forEach(([key, value]) => {
      if (typeof value === 'string') {
        element.style.setProperty(`--${key}`, value);
      }
    });

    logger.debug(`Applied ${Object.keys(finalVars).length} CSS variables`);
  }

  /**
   * Generate CSS stylesheet from theme
   */
  generateThemeCSS(theme: Theme, darkMode: boolean): string {
    const baseVars = { ...theme };
    delete baseVars.modes;

    const modeVars = darkMode ? theme.modes?.dark || {} : theme.modes?.light || {};

    const finalVars = { ...baseVars, ...modeVars };

    const cssVars = Object.entries(finalVars)
      .filter(([, value]) => typeof value === 'string')
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n');

    return `:root {\n${cssVars}\n}`;
  }

  /**
   * Clear all theme CSS variables from element
   */
  clearThemeFromElement(element: HTMLElement): void {
    // Get all custom properties
    const styles = element.style;
    const propsToRemove: string[] = [];

    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      if (prop.startsWith('--')) {
        propsToRemove.push(prop);
      }
    }

    // Remove them
    propsToRemove.forEach((prop) => {
      element.style.removeProperty(prop);
    });
  }

  /**
   * Extract color palette from theme for preview
   */
  getThemeColors(theme: Theme, darkMode: boolean): Record<string, string> {
    const baseVars = { ...theme };
    delete baseVars.modes;

    const modeVars = darkMode ? theme.modes?.dark || {} : theme.modes?.light || {};

    const finalVars = { ...baseVars, ...modeVars } as unknown as Record<string, string>;

    // Extract commonly used colors
    return {
      primary: finalVars['primary-color'] as string,
      accent: finalVars['accent-color'] as string,
      primaryText:
        (finalVars['primary-text-color'] as string) || (finalVars['text-primary-color'] as string),
      secondaryText: finalVars['secondary-text-color'] as string,
      primaryBackground: finalVars['primary-background-color'] as string,
      cardBackground: finalVars['card-background-color'] as string,
    };
  }

  /**
   * Serialize theme manager payload to JSON
   */
  serializeThemeManagerPayload(payload: Omit<ThemeManagerExportPayload, 'version'>): string {
    return JSON.stringify(
      {
        version: THEME_MANAGER_EXPORT_VERSION,
        ...payload,
      },
      null,
      2,
    );
  }

  /**
   * Parse and normalize imported theme manager payload
   */
  parseThemeManagerPayload(rawJson: string): ThemeManagerExportPayload {
    const parsed = JSON.parse(rawJson) as unknown;
    return normalizeThemeManagerExportPayload(parsed);
  }
}

export const themeService = new ThemeService();
