import type { Theme } from '../../types/homeassistant';
import type { SavedThemeRecord } from './types';
import { themeService } from '../../services/themeService';
import { THEME_NO_PREVIEW_COLOURS_TOOLTIP, optionAccessibleName } from './themeBadgeCopy';

export interface ThemeOption {
  label: string;
  value: string;
  /**
   * True when this theme defines none of the colours HAVDM's preview reads.
   *
   * ⭐ F3 / HA-06 (interim). `themeService.getThemeColors()` is the funnel that
   * maps a theme onto the two surfaces HAVDM previews. It has THREE callers in
   * `src/`, of which TWO are the preview surfaces this predicate is about:
   *
   *   1. `App.tsx:496` — the RC5 canvas workaround, which reads
   *      `primaryBackground` and `primaryText` and applies them to the canvas
   *      `<Content>`.
   *   2. `ThemePreviewPanel.tsx:39` — the "Theme Preview" card, which renders
   *      one swatch per field for ALL SIX and returns `null` for any unset one.
   *
   * ⚠ The third is `definesNoCanvasColors` in THIS FILE, which is why
   * the count matters: it is a caller, not a surface, and it exists to describe
   * the other two. Codex's round-2 review (finding R2-N2) caught this docblock
   * calling the population "exactly TWO consumers" without saying two of WHAT.
   *
   * ⚠⚠ THAT UNION IS WHY THE PREDICATE TESTS ALL SIX AND NOT THE CANVAS'S TWO.
   * A theme defining, say, only `primary-color` sets no canvas colour but still
   * renders a Primary swatch — a visible effect, so it must NOT be marked. Only
   * a theme defining NONE of the six sets no colour on either surface: the
   * canvas falls back to HAVDM's own antd token, and the Theme Preview card
   * renders no colour swatches.
   *
   * ⚠⚠⚠ SAY "SETS NO COLOUR", NEVER "UNCHANGED" OR "EMPTY" — CORRECTED AFTER
   * CODEX'S ROUND-3 REVIEW (finding R3-M1). Both of those were measured false:
   * switching from a rich theme REPLACES the canvas colours with the antd
   * fallback rather than leaving them, and the Preview card keeps its title, the
   * theme name, the mode Tag and a "Colors" heading whatever the swatches do.
   *
   * ⚠⚠ AND NONE OF THIS PARAGRAPH MAY BE COPIED INTO THE USER-FACING TOOLTIP —
   * CODEX'S ROUND-4 REVIEW (finding R4-M1). What is written here describes the
   * APPLIED outcome, which is the right thing for a docblock about the predicate
   * and the wrong thing for a badge that also renders beside inactive option
   * rows and pending selections. `THEME_NO_PREVIEW_COLOURS_TOOLTIP` in
   * `src/components/ThemeNoEffectBadge.tsx` is now a pure absence claim about the
   * theme object; its docblock carries the binding rule.
   *
   * ⚠⚠⚠ WHAT THIS FLAG DOES **NOT** ESTABLISH — CORRECTED AFTER CODEX'S ROUND-1
   * REVIEW OF PR #142 (finding M1). It once carried the label "no preview
   * effect", on the reasoning that `grep -rn 'var(--' src/` returned only
   * comments and therefore nothing consumed a published theme variable. **That
   * reasoning was wrong, because a grep of this repository's sources cannot
   * enumerate the stylesheets its dependencies bundle.**
   * `themeService.applyThemeToElement` publishes EVERY string-valued theme key
   * as a custom property on the canvas element, `Theme` accepts any key
   * (`src/types/homeassistant.ts:81-84`), and the canvas subtree
   * (`App.tsx:3097-3460`) renders Swiper (`BaseCard.tsx:759`), Allotment and
   * Monaco (`SplitViewEditor.tsx:486,525-550`) — hundreds of `var(--…)`
   * consumers between them. A theme defining only `swiper-theme-color` is
   * marked here while visibly recolouring the real carousel arrow.
   * **So: this flag says the MAPPED PREVIEW COLOURS are absent. It does not say
   * the theme has no effect, and the badge must not either.** Deciding the
   * wider question needs computed styles over a rendered document — the canvas
   * fidelity contract's mechanism, which is its own scoped item.
   *
   * ⚠ Also not a claim about what the theme does in Home Assistant. Four of the
   * five themes on the reference instance satisfy the predicate, and one
   * (`Mushroom`) defines no variables whatsoever, so any positive reading
   * ("styles cards", "shape only") would be false of that member. The
   * user-facing wording is correspondingly negative.
   *
   * ⚠ Mode-sensitive, because both consumers are: computed for the `darkMode`
   * passed to `buildThemeOptions`, matching the argument its consumers pass to
   * `getThemeColors`.
   */
  definesNoCanvasColors: boolean;

  /**
   * ⭐⭐⭐ THE ONLY ROUTE BY WHICH THE QUALIFICATION REACHES ASSISTIVE TECHNOLOGY
   * IN AN OPEN DROPDOWN — Codex round-6 finding R6-M2.
   *
   * ⚠⚠⚠ DO NOT "SIMPLIFY" THESE ONTO THE RENDERED BADGE. antd v6.1.4 renders a
   * SEPARATE HIDDEN 0×0 `role="listbox"` whose `role="option"` children are the
   * real accessible options; the VISIBLE rows that `optionRender` decorates are
   * `role="generic"` and are not options at all. Measured in the real Electron
   * renderer: every `[role="option"]` in the document had `hasBadge: false` and
   * a 0px-wide box, and the hidden listbox held only `aria-label="<theme name>"`.
   * So the badge's own `aria-label` — however correct — is unreachable there.
   *
   * `@rc-component/select`'s `OptionList` spreads `pickAttrs(itemData, true)`
   * onto that hidden option AFTER its default `aria-label`, and `pickAttrs`
   * with `true` picks `role` plus every `aria-*` key. Putting them on the OPTION
   * DATA is therefore the supported hook, and it wins over antd's default.
   *
   * ⚠ Present ONLY on badged options, so an unbadged theme keeps antd's own
   * plain-name behaviour and the `__none__` override sentinel can never acquire
   * either field.
   */
  'aria-label'?: string;
  'aria-description'?: string;
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
 * ⭐⭐ AND SINCE PR #142's ROUND-1 FIX, ALL FOUR THEME **OPTION SELECTS** CALL IT
 * — not just the two obvious pickers. `theme-select` and `theme-settings-select`
 * call `setTheme`; `theme-manager-saved-select` + Load calls `loadSavedTheme`;
 * and `theme-manager-view-override` calls `setViewOverride`. The last two used
 * to build their own option shapes by hand and dropped the badge flag on the
 * floor. **If you add a fifth SELECT, build its options here.**
 *
 * ⚠⚠ FOUR IS THE POPULATION OF SELECTS, NOT OF THEME-APPLICATION ACTIONS —
 * CORRECTED AFTER CODEX'S ROUND-2 REVIEW (finding R2-N2), which caught this
 * docblock defining the class as the wider role "every control whose completed
 * action changes which theme is in effect" and then counting only four.
 * `setSyncWithHA(true)`, `importThemeManager`, clearing an override and changing
 * the active view all re-derive the effective theme through
 * `deriveEffectiveThemeState` (`src/store/themeStore.ts`), and none of them has
 * an option list to build. They need no badge of their own: the theme each
 * leaves in effect is displayed by a Select that does carry one.
 *
 * Ordering is deterministic: available themes first (built-ins and any from a
 * connected Home Assistant), then saved themes that are not already listed.
 *
 * ⚠ `label` stays a PLAIN STRING and the badge is a separate field, because
 * antd derives an option's `title` attribute from a string label and that
 * attribute is how every spec in the suite now selects a theme option
 * (`tests/e2e/theme-restore.spec.ts`, `tests/support/dsl/themeManager.ts`,
 * `tests/integration/theme-no-effect-badge.spec.ts`). Rendering the badge INTO
 * the label would destroy that identity. Consumers render it via antd's
 * `optionRender` / `labelRender` instead.
 * ⚠⚠ NOTE THE DIRECTION OF THAT ARGUMENT, because it was inverted once and
 * Codex's round-1 review (finding M2) caught it: keeping `label` a plain string
 * is a constraint on HOW the badge is rendered. It is NOT a reason to leave a
 * control unbadged. Every Select that applies a theme renders the badge; the
 * specs were retargeted to `title` rather than the product narrowed to fit
 * them.
 *
 * ⚠ `darkMode` defaults to `false` so the two-argument callers that predate the
 * badge keep compiling and keep meaning what they meant.
 */
/**
 * One option, with the accessibility fields attached when — and only when — the
 * theme is badged.
 *
 * ⚠ The two `aria-*` fields are what a screen reader actually receives for this
 * theme in an OPEN dropdown; see their docblock on `ThemeOption` for why nothing
 * `optionRender` draws can do that job. The NAME stays short (theme name plus
 * the three-word visible label) and the qualification rides on the DESCRIPTION,
 * owner-ruled 2026-08-14: four of the five themes on the reference instance are
 * badged, so a ~45-word name would be announced in front of almost every option
 * and make the list unusable by ear.
 */
function themeOption(name: string, theme: Theme, darkMode: boolean): ThemeOption {
  if (!definesNoCanvasColors(theme, darkMode)) {
    return { label: name, value: name, definesNoCanvasColors: false };
  }

  return {
    label: name,
    value: name,
    definesNoCanvasColors: true,
    'aria-label': optionAccessibleName(name),
    'aria-description': THEME_NO_PREVIEW_COLOURS_TOOLTIP,
  };
}

export function buildThemeOptions(
  availableThemes: Record<string, Theme>,
  savedThemes: Record<string, SavedThemeRecord>,
  darkMode = false,
): ThemeOption[] {
  const options: ThemeOption[] = Object.entries(availableThemes).map(([name, theme]) =>
    themeOption(name, theme, darkMode),
  );

  Object.entries(savedThemes).forEach(([name, record]) => {
    if (!availableThemes[name]) {
      options.push(themeOption(name, record.theme, darkMode));
    }
  });

  return options;
}
