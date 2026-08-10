import type { Theme } from '../../types/homeassistant';
import type { SavedThemeRecord } from './types';
import { themeService } from '../../services/themeService';

export interface ThemeOption {
  label: string;
  value: string;
  /**
   * True when selecting this theme will change nothing the user can see.
   *
   * ⭐ F3 / HA-06 (interim). `themeService.applyThemeToElement` publishes a
   * theme as ~30 CSS custom properties, but nothing in `src/` reads a single
   * `var(--…)` — so a theme reaches the user through exactly ONE funnel,
   * `themeService.getThemeColors()`, and that function has exactly TWO
   * consumers:
   *
   *   1. `App.tsx` — the RC5 canvas workaround, which reads `primaryBackground`
   *      and `primaryText` and applies them to the canvas `<Content>`.
   *   2. `ThemePreviewPanel.tsx` — the "Theme Preview" card, which renders one
   *      swatch per field for ALL SIX and returns `null` for any that is unset.
   *
   * ⚠⚠ THAT UNION IS WHY THE PREDICATE TESTS ALL SIX AND NOT THE CANVAS'S TWO.
   * A theme defining, say, only `primary-color` leaves the canvas untouched but
   * still renders a Primary swatch — a visible effect, so it must NOT be
   * marked. Only a theme defining NONE of the six is inert on both surfaces:
   * canvas unchanged AND the Theme Preview card completely empty. That is what
   * makes "no preview effect" literally accurate rather than approximate.
   *
   * ⚠ This is NOT a claim about what the theme does elsewhere. It is a purely
   * NEGATIVE fact about HAVDM — four of the five themes on the reference
   * instance satisfy it, and one of those (`Mushroom`) defines no variables
   * whatsoever, so any positive reading ("styles cards", "shape only") would be
   * false of that member. The user-facing wording is correspondingly negative.
   *
   * ⚠ Mode-sensitive, because both consumers are: computed for the `darkMode`
   * passed to `buildThemeOptions`, matching the argument its consumers pass to
   * `getThemeColors`.
   */
  definesNoCanvasColors: boolean;
}

/**
 * True when `getThemeColors` yields nothing usable for this theme in this mode.
 *
 * ⚠ Deliberately calls the SHIPPED function rather than re-reading the CSS
 * variable names itself. A second list of "the keys that matter" would be a
 * second theory of what HAVDM consumes, free to drift from the first; the badge
 * would then be marking a rule the app no longer follows. There is already one
 * such duplicate in the repository — `BUILT_IN_THEME_REQUIRED_KEYS` — and its
 * docblock has to assert by hand that it matches this function.
 *
 * ⚠ `every(...)` over ALL fields, so this is false as soon as ONE is defined.
 * That is the conservative direction on purpose: a theme wrongly marked inert
 * tells the user a lie about their own theme, whereas one wrongly left unmarked
 * merely leaves them where they were before this feature existed.
 */
function definesNoCanvasColors(theme: Theme, darkMode: boolean): boolean {
  const colors = themeService.getThemeColors(theme, darkMode);

  return Object.values(colors).every((value) => !value);
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
 *
 * ⚠ `label` stays a PLAIN STRING and the badge is a separate field. antd
 * derives an option's `title` attribute from a string label, and
 * `tests/e2e/theme-restore.spec.ts` selects
 * `.ant-select-item-option[title="<name>"]` while
 * `tests/support/dsl/themeManager.ts` matches anchored `^<name>$` text.
 * Rendering the badge into the label would break both. Consumers render it via
 * antd's `optionRender` / `labelRender` instead.
 *
 * ⚠ `darkMode` defaults to `false` so the two-argument callers that predate the
 * badge keep compiling and keep meaning what they meant.
 */
export function buildThemeOptions(
  availableThemes: Record<string, Theme>,
  savedThemes: Record<string, SavedThemeRecord>,
  darkMode = false,
): ThemeOption[] {
  const options: ThemeOption[] = Object.entries(availableThemes).map(([name, theme]) => ({
    label: name,
    value: name,
    definesNoCanvasColors: definesNoCanvasColors(theme, darkMode),
  }));

  Object.entries(savedThemes).forEach(([name, record]) => {
    if (!availableThemes[name]) {
      options.push({
        label: name,
        value: name,
        definesNoCanvasColors: definesNoCanvasColors(record.theme, darkMode),
      });
    }
  });

  return options;
}
