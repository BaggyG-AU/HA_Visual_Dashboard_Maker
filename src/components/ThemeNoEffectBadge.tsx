import React from 'react';
import { Tag, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  THEME_NO_PREVIEW_COLOURS_LABEL,
  THEME_NO_PREVIEW_COLOURS_TOOLTIP,
} from '../features/theme-manager/themeBadgeCopy';

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
 * ⚠⚠ THE TWO USER-FACING STRINGS MOVED OUT OF THIS FILE IN ROUND 6, VERBATIM AND
 * UNCHANGED, TO `src/features/theme-manager/themeBadgeCopy.ts`. The binding rule
 * that governs the wording moved WITH the string, so it is still the docblock
 * directly above it — read it there before touching either.
 *
 * ⭐ WHY THEY MOVED — Codex round-6 finding R6-M2. The qualification has to reach
 * assistive technology through antd's HIDDEN accessibility listbox, which is
 * built from the OPTION DATA in `buildThemeOptions`, not from anything this
 * component renders. `buildThemeOptions` therefore needs these strings, and it
 * must not import a React component: `tests/unit/themeBadge.spec.ts` imports it
 * directly, and `src/features/` must not depend on `src/components/`.
 *
 * They are RE-EXPORTED here so every existing import keeps working and there is
 * still exactly one definition of each. ⚠ Do not reintroduce a local copy.
 */
export {
  THEME_NO_PREVIEW_COLOURS_TOOLTIP,
  THEME_NO_PREVIEW_COLOURS_LABEL,
} from '../features/theme-manager/themeBadgeCopy';

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
   * option would fight the Select's own keyboard behaviour. Two contexts, two
   * mechanisms, one qualification — that split is deliberate and owner-ruled.
   *
   * ⚠⚠⚠ CORRECTED AFTER CODEX ROUND-6 FINDING R6-M2. This paragraph used to end
   * "Option rows carry the full explanation as their `aria-label` instead, so it
   * joins the option's accessible name without adding a stop." **THAT WAS FALSE,
   * and it is the claim round 6 disproved.** antd renders a SEPARATE HIDDEN 0×0
   * `role="listbox"` whose `role="option"` children are the real accessible
   * options; the visible rows this component renders into are `role="generic"`
   * and are not options at all, so an `aria-label` here joins nothing. Measured:
   * every `[role="option"]` in the document had `hasBadge: false`.
   * **The option rows' qualification now comes from the OPTION DATA** —
   * `buildThemeOptions` in `../features/theme-manager/themeOptions.ts` attaches
   * `aria-label` and `aria-description` to badged options, which antd spreads
   * onto that hidden node. ⚠ The `aria-label` this component still sets is for
   * the COLLAPSED value, where the badge is a real focusable node with a role
   * that accepts a name; it is not what an option row announces.
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
