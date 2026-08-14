import React from 'react';
import { Tag, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

/**
 * Marks a theme that defines none of the colours HAVDM's preview reads.
 *
 * ⭐ F3 / HA-06 (interim). `themeService.getThemeColors()` maps six theme keys
 * onto the two surfaces HAVDM previews: the canvas background/text pair in
 * `App.tsx` and the six swatches of `ThemePreviewPanel`, which returns `null`
 * for any unset field. A theme defining none of the six is selectable and
 * applies cleanly; ONCE APPLIED, the canvas falls back to HAVDM's own antd
 * token and the Theme Preview card renders no colour swatches.
 * Measured on the reference instance: four of its five installed themes.
 *
 * ⚠⚠ "ONCE APPLIED" IS LOAD-BEARING, AND NEITHER SURFACE IS "UNCHANGED" OR
 * "EMPTY". Saying otherwise cost a review round (Codex round 3, finding R3-M1).
 * `App.tsx` maps every absent colour to `undefined` and then resolves
 * `canvasThemeBackground ?? token.colorBgContainer`, so switching FROM a rich
 * theme REPLACES its colours rather than retaining them. And
 * `ThemePreviewPanel` always renders its Card, the theme name, the mode Tag, a
 * Divider and a "Colors" heading — only each missing SWATCH returns `null`. The
 * measurement is pinned in `tests/integration/theme-no-effect-badge.spec.ts`
 * ("a badged theme replaces the canvas colours with HAVDM own and empties the
 * swatches").
 *
 * ⚠⚠⚠ AND SAYING ANY OF IT IN THE TOOLTIP COST A FOURTH ROUND (Codex round 4,
 * finding R4-M1). NONE of the paragraph above may reach the user, because THIS
 * COMPONENT CANNOT TELL WHETHER ITS THEME IS APPLIED. The string's own docblock
 * below is the binding rule; read it before touching the wording.
 *
 * ⚠ THE WORDING IS NEGATIVE ON PURPOSE. The predicate establishes only what a
 * theme does NOT define. It never establishes what the theme DOES do, and one
 * member of the marked set (`Mushroom`) defines no variables at all — so
 * "styles cards only" or "shape only" would be a claim the measurement does not
 * support and that is false for that member.
 *
 * ⚠⚠⚠ AND IT IS NARROW ON PURPOSE — DO NOT WIDEN IT BACK TO "no preview
 * effect". That was the original wording, and Codex's round-1 review of PR #142
 * (finding M1, `docs/reviews/f3-theme-canvas-badge-codex-review.md`) proved it
 * false. `themeService.applyThemeToElement` publishes EVERY string-valued theme
 * key as a CSS custom property on the canvas element, `Theme` accepts any key
 * (`src/types/homeassistant.ts:81-84`), and the canvas subtree
 * (`App.tsx:3097-3460`) renders bundled stylesheets that consume hundreds of
 * them — Swiper via `BaseCard.tsx:759`, Allotment and Monaco via
 * `SplitViewEditor.tsx:486,525-550`. A theme defining only `swiper-theme-color`
 * is badged by this predicate while visibly recolouring the real carousel
 * arrow, measured `rgb(0, 122, 255)` → `rgb(255, 0, 0)`. The claim below is
 * therefore restricted to the thing the predicate can actually establish.
 * ⚠ `grep -rn 'var(--' src/` CANNOT enumerate that class: it sees this
 * repository's own sources, not the stylesheets its dependencies bundle.
 *
 * ⚠ This is the INTERIM marking, not the fix. The fix is a canvas fidelity
 * contract with real `var(--)` consumers over a fuller variable set, resolved
 * against computed styles rather than the theme object, which is its own scoped
 * item and the only mechanism that could support the wider claim.
 */

/**
 * ⚠⚠⚠ THIS STRING IS THE PRODUCT CLAIM, AND IT IS A CLAIM ABOUT THE THEME
 * OBJECT — NEVER ABOUT WHAT IS ON SCREEN. That distinction is the whole content
 * of Codex's round-4 review of PR #142 (finding R4-M1), and it is the thing
 * FOUR successive wordings got wrong, one adjacent clause at a time.
 *
 * ⚠⚠ WHY IT CANNOT DESCRIBE THE SCREEN. `definesNoCanvasColors` is a pure
 * function of a theme object. This one component renders in EIGHT contexts and
 * cannot tell them apart:
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

interface ThemeNoEffectBadgeProps {
  /**
   * Icon only, no text. Used for the SELECTED value, where `ThemeSelector`'s
   * Select is 200px wide and a theme name like "Mushroom Square Shadow"
   * already fills it, and for the two Theme Manager Selects that share their
   * row with Load/Delete or Clear buttons.
   *
   * ⚠ `compact` IS NOT "is this the collapsed value" — see `focusable`. Three
   * of the four collapsed renderers pass `compact`; `theme-settings-select`'s
   * passes the full Tag. They are independent axes and conflating them was
   * available as a bug and is called out here so nobody reintroduces it.
   */
  compact?: boolean;

  /**
   * ⭐⭐ Give this badge a KEYBOARD STOP — Codex round-5 finding R5-M2.
   *
   * Pass it at the four `labelRender` (collapsed-value) sites and NOWHERE else.
   * The explanation below is the qualification that keeps this badge from being
   * read as the wider "no effect" claim, and until round 5 it was reachable
   * ONLY by hovering a mouse: both arms rendered at `tabIndex=-1`, focus would
   * not land, and a keyboard user got the bare label "no preview colours".
   *
   * ⚠⚠ DO NOT PASS IT ON AN `optionRender` ROW. Those render inside an open
   * `listbox`, where arrow keys are the expected model and a tab stop per
   * option would fight the Select's own keyboard behaviour. Option rows carry
   * the full explanation as their `aria-label` instead (below), so it joins the
   * option's accessible name without adding a stop. Two contexts, two
   * mechanisms, one qualification — that split is deliberate and owner-ruled.
   */
  focusable?: boolean;
}

/**
 * ⚠ The component name and `data-testid` still say "no effect" while the
 * user-facing strings say "no preview colours". That is deliberate: the round-1
 * fix narrowed the CLAIM, and renaming the test id would have rippled through
 * six assertions in two specs for no user-visible gain. The strings above are
 * the contract; these identifiers are not.
 *
 * ⚠⚠ THE ACCESSIBLE NAME IS THE LABEL **THEN** THE WHOLE TOOLTIP — R5-M2, and
 * then a self-check correction on top of it. It used to be
 * `THEME_NO_PREVIEW_COLOURS_LABEL` alone, which handed assistive users the
 * three-word claim and withheld every qualification on it.
 *
 * ⚠⚠⚠ BUT REPLACING IT WITH THE SENTENCE ALONE BROKE **WCAG 2.5.3 "LABEL IN
 * NAME"**, and the accessibility fix therefore introduced an accessibility
 * defect. The visible Tag reads "no preview colours"; a speech-input user says
 * what they can see; and the accessible name did not contain that string at all,
 * so the spoken label could not match the control. **The name now BEGINS with
 * the visible label and continues into the qualification**, which satisfies
 * 2.5.3 and still denies nobody the limits. ⚠ Keep it in that order — a name
 * that merely CONTAINS the label somewhere is weaker for speech input than one
 * that starts with it.
 */
const ACCESSIBLE_NAME = `${THEME_NO_PREVIEW_COLOURS_LABEL}. ${THEME_NO_PREVIEW_COLOURS_TOOLTIP}`;

/**
 * ⚠ The component name and `data-testid` still say "no effect" while the
 * user-facing strings say "no preview colours" — see the note above the
 * component itself.
 */
export const ThemeNoEffectBadge: React.FC<ThemeNoEffectBadgeProps> = ({
  compact = false,
  focusable = false,
}) => {
  // A focusable child is also what lets antd's Tooltip open on `focus` at all.
  const keyboard = focusable ? { tabIndex: 0 } : {};

  return (
    <Tooltip
      title={THEME_NO_PREVIEW_COLOURS_TOOLTIP}
      trigger={focusable ? ['hover', 'focus'] : ['hover']}
    >
      {compact ? (
        <InfoCircleOutlined
          data-testid="theme-no-effect-badge"
          aria-label={ACCESSIBLE_NAME}
          {...keyboard}
          style={{ opacity: 0.65, flexShrink: 0 }}
        />
      ) : (
        <Tag
          data-testid="theme-no-effect-badge"
          aria-label={ACCESSIBLE_NAME}
          icon={<InfoCircleOutlined />}
          bordered={false}
          {...keyboard}
          style={{ marginInlineEnd: 0, flexShrink: 0 }}
        >
          {THEME_NO_PREVIEW_COLOURS_LABEL}
        </Tag>
      )}
    </Tooltip>
  );
};
