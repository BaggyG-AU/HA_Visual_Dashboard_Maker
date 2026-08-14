/**
 * The user-facing copy for the F3 / HA-06 "no preview colours" badge.
 *
 * ⚠⚠ WHY THIS IS ITS OWN MODULE AND NOT PART OF THE COMPONENT — Codex round-6
 * finding R6-M2. The qualification has to reach assistive technology through
 * antd's HIDDEN accessibility listbox, which is built from the OPTION DATA
 * (`buildThemeOptions` in `./themeOptions.ts`), not from anything `optionRender`
 * draws. So the option builder needs these strings — and the option builder must
 * stay free of React and antd, because `tests/unit/themeBadge.spec.ts` imports it
 * directly and the feature layer must not depend on `src/components/`.
 *
 * `src/components/ThemeNoEffectBadge.tsx` re-exports both constants, so every
 * existing import keeps working and there is still exactly ONE definition of
 * each string.
 */

/**
 * ⚠⚠⚠ THIS STRING IS THE PRODUCT CLAIM, AND IT IS A CLAIM ABOUT THE THEME
 * OBJECT — NEVER ABOUT WHAT IS ON SCREEN. That distinction is the whole content
 * of Codex's round-4 review of PR #142 (finding R4-M1), and it is the thing
 * FOUR successive wordings got wrong, one adjacent clause at a time.
 *
 * ⚠⚠ WHY IT CANNOT DESCRIBE THE SCREEN. `definesNoCanvasColors` is a pure
 * function of a theme object. One component renders this string in EIGHT
 * contexts and cannot tell them apart:
 *
 *   - `ThemeSelector`'s `theme-select` — `optionRender` + `labelRender`.
 *     `onChange={setTheme}`, so the collapsed value APPLIES IMMEDIATELY.
 *   - `ThemeSettingsDialog`'s `theme-settings-select` — `onChange` only sets
 *     local state; `setTheme` runs in `handleApply`, so it is PENDING.
 *   - `theme-manager-saved-select` — `loadSavedTheme` runs in
 *     `handleLoadSavedTheme`, so it is PENDING until Load.
 *   - `theme-manager-view-override` — `setViewOverride` APPLIES IMMEDIATELY.
 *
 * FOUR of the eight are option rows in an open dropdown, where the hovered
 * theme is not applied at all; TWO more are collapsed values still waiting for
 * Apply or Load. So SIX of the eight can show this badge while the canvas is
 * painted by some OTHER theme. Codex measured exactly that: with Material You
 * applied, hovering Mushroom's option badge left the canvas at
 * `rgb(238, 237, 244)` / `rgb(26, 27, 33)` and all six swatches on screen, while
 * the round-4 tooltip claimed HAVDM's defaults and no swatches.
 *
 * ⚠⚠⚠ THE BINDING RULE, AND DO NOT REGRESS IT: THIS STRING MAY STATE ONLY WHAT
 * IS TRUE OF THE THEME. It may not say what the canvas or the panel shows, in
 * any tense, because no tense is true in all eight contexts — a "would" wording
 * is right on an option row and wrong on the applied value, and a present-tense
 * one is wrong the other way round. Round 4 put both to the owner and he chose
 * the absence claim on 2026-08-11, his FOURTH sign-off of this one string.
 * **Do not re-word a user-facing claim here without putting it to him.**
 *
 * ⚠ THE FIVE RETRACTED WORDINGS, so that nobody rebuilds one:
 *   1. "no preview EFFECT" — round 1, finding M1. Bundled canvas CSS (Swiper,
 *      Allotment, Monaco) consumes published theme variables.
 *   2. "the canvas … WILL NOT CHANGE" — round 2, finding R2-M1. The same
 *      disproved claim moved into the tooltip rather than retracted.
 *   3. "STAY AS THEY ARE" / "STAYS EMPTY" — round 3, finding R3-M1. False on
 *      the transition, and false of the rendered panel.
 *   4. "uses HAVDM's own DEFAULT COLOURS" / "shows NO COLOUR SWATCHES" —
 *      round 4, finding R4-M1. True only AFTER selection.
 *   5. "sets none of the colours HAVDM's canvas … READ" — round 5, finding
 *      R5-M1. The object of "sets none" was WIDER THAN THE PREDICATE: the
 *      canvas subtree really does read colours this predicate cannot see.
 * All five are asserted ABSENT by the wording legs in
 * `tests/integration/theme-no-effect-badge.spec.ts` — see `RETRACTED_CLAIMS`,
 * which is appended to and never replaced — and the fourth is additionally
 * asserted absent from the INACTIVE-OPTION and PENDING contexts that disproved
 * it.
 *
 * ⚠⚠⚠ R5-M1 IS WHY THE SENTENCE NOW NAMES THE NUMBER SIX. The fifth wording was
 * the right KIND of claim — a property of the theme object — but its object was
 * "the colours HAVDM's canvas reads", and on the ordinary reading that includes
 * the colour custom properties bundled stylesheets below the canvas consume.
 * `applyThemeToElement` publishes EVERY string-valued key, so a theme whose only
 * key is `swiper-theme-color` is badged by this predicate AND sets a colour the
 * canvas subtree reads — the executable counterexample pinned at
 * `tests/unit/themeBadge.spec.ts` ("still marks a theme whose only key is
 * consumed by bundled canvas CSS"). **A downstream "other styling may differ"
 * caveat cannot cure a false first sentence**, which is the R2-M1 shape all over
 * again. The object of "sets none" must therefore be exactly what
 * `getThemeColors` maps: SIX values, named as such.
 *
 * ⚠ The subtree concession has survived all six wordings and must keep
 * surviving — and R5-M1 also required it to be WIDENED. "Other styling" read as
 * non-colour styling, which is precisely how the first sentence came to look
 * like a denial of all canvas colour. It now says "including colours used by
 * cards and editors on the canvas" in so many words.
 */
export const THEME_NO_PREVIEW_COLOURS_TOOLTIP =
  'This theme sets none of the six colour values HAVDM maps to its canvas and Theme ' +
  'Preview panel. Other styling — including colours used by cards and editors on the ' +
  'canvas — may still differ. Your Home Assistant dashboard is unaffected.';

export const THEME_NO_PREVIEW_COLOURS_LABEL = 'no preview colours';

/**
 * What a screen reader announces for a badged theme in an OPEN dropdown —
 * Codex round-6 finding R6-M2, owner-signed-off 2026-08-14.
 *
 * ⚠⚠⚠ THE MECHANISM, BECAUSE IT IS NOT THE ONE THE REVIEW NAMED. Round 6 said
 * the option `Tag`'s `aria-label` is ignored because WAI-ARIA prohibits naming
 * on the implicit `generic` role. **Measured in the real Electron renderer, that
 * is false — Chromium DOES compute it** (`role=generic name="no preview
 * colours. This theme sets none of the six…"`, confirmed independently by
 * Playwright's own accessible-name implementation). The conclusion is right and
 * the reason is worse:
 *
 * antd v6.1.4 (`@rc-component/select`) renders a SEPARATE HIDDEN 0×0
 * `role="listbox"` — `<div role="listbox" id="…_list" style="height:0;width:0;
 * overflow:hidden">` — holding just THREE `role="option"` divs (the active index
 * and its two neighbours), each `<div role="option" aria-label={label}>{value}
 * </div>`. **The VISIBLE dropdown rows that `optionRender` decorates are
 * `role="generic"` and are not the accessible options at all**, so nothing
 * `optionRender` draws — badge, tooltip, `aria-label` or otherwise — can reach a
 * reader arrowing the list. Measured: every `[role="option"]` in the document
 * had `hasBadge: false` and a bounding box 0px wide.
 *
 * ⭐ THE SUPPORTED HOOK is `OptionList.js`, which spreads
 * `pickAttrs(itemData, true)` onto that hidden option div AFTER its default
 * `aria-label`, and `pickAttrs(props, true)` picks `role` and every `aria-*`
 * key. So aria attributes placed on the OPTION DATA OBJECT win — which is why
 * these two live on `ThemeOption` and are set in `buildThemeOptions`.
 *
 * ⚠ NAME SHORT, DESCRIPTION LONG. The owner ruled the split on 2026-08-14: the
 * name carries the theme name and the three-word visible label so arrowing the
 * list stays terse, and the qualification rides on `aria-description` so it is
 * announced after the name rather than in front of every option. Four of the
 * five themes on the reference instance are badged, so putting ~45 words into
 * the NAME would make the list unusable by ear.
 */
export const optionAccessibleName = (themeName: string): string =>
  `${themeName}, ${THEME_NO_PREVIEW_COLOURS_LABEL}`;
