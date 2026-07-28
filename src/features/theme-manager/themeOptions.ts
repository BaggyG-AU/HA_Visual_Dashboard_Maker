import type { Theme } from '../../types/homeassistant';
import type { SavedThemeRecord } from './types';

export interface ThemeOption {
  label: string;
  value: string;
}

/**
 * The single source of truth for "which themes can the user pick right now".
 *
 * ⭐ WHY THIS EXISTS (RC5). `themeStore.resolveThemeByName` has always resolved
 * `availableThemes[name] ?? savedThemes[name]?.theme`, but both pickers
 * (`ThemeSelector` and `ThemeSettingsDialog`) built their options from
 * `availableThemes` ALONE. A saved theme therefore resolved correctly but could
 * never be selected — the picker disagreed with the resolver. Both now call
 * this, so they cannot drift apart again.
 *
 * Ordering is deterministic: available themes first (built-ins and any from a
 * connected Home Assistant), then saved themes that are not already listed.
 */
export function buildThemeOptions(
  availableThemes: Record<string, Theme>,
  savedThemes: Record<string, SavedThemeRecord>,
): ThemeOption[] {
  const options: ThemeOption[] = Object.keys(availableThemes).map((name) => ({
    label: name,
    value: name,
  }));

  Object.keys(savedThemes).forEach((name) => {
    if (!availableThemes[name]) {
      options.push({ label: name, value: name });
    }
  });

  return options;
}
