import { Theme } from '../types/homeassistant';

/**
 * Theme Service
 * Handles applying Home Assistant themes to DOM elements
 */
export class ThemeService {
  /**
   * Apply theme CSS variables to an element
   */
  applyThemeToElement(
    element: HTMLElement,
    theme: Theme,
    darkMode: boolean
  ): void {
    console.log('Applying theme to element:', { darkMode });

    // Merge base theme with mode-specific overrides
    const baseVars = { ...theme };
    delete baseVars.modes;

    const modeVars = darkMode
      ? theme.modes?.dark || {}
      : theme.modes?.light || {};

    const finalVars = { ...baseVars, ...modeVars };

    // Apply CSS variables
    Object.entries(finalVars).forEach(([key, value]) => {
      if (typeof value === 'string') {
        element.style.setProperty(`--${key}`, value);
      }
    });

    console.log(`Applied ${Object.keys(finalVars).length} CSS variables`);
  }

  /**
   * Generate CSS stylesheet from theme
   */
  generateThemeCSS(theme: Theme, darkMode: boolean): string {
    const baseVars = { ...theme };
    delete baseVars.modes;

    const modeVars = darkMode
      ? theme.modes?.dark || {}
      : theme.modes?.light || {};

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
    propsToRemove.forEach(prop => {
      element.style.removeProperty(prop);
    });
  }

  /**
   * Extract color palette from theme for preview
   */
  getThemeColors(
    theme: Theme,
    darkMode: boolean
  ): Record<string, string> {
    const baseVars = { ...theme };
    delete baseVars.modes;

    const modeVars = darkMode
      ? theme.modes?.dark || {}
      : theme.modes?.light || {};

    const finalVars = { ...baseVars, ...modeVars };

    // Extract commonly used colors
    return {
      primary: finalVars['primary-color'] as string,
      accent: finalVars['accent-color'] as string,
      primaryText: finalVars['primary-text-color'] as string || finalVars['text-primary-color'] as string,
      secondaryText: finalVars['secondary-text-color'] as string,
      primaryBackground: finalVars['primary-background-color'] as string,
      cardBackground: finalVars['card-background-color'] as string,
    };
  }
}

export const themeService = new ThemeService();
