import React from 'react';
import { Tag, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

/**
 * Marks a theme that defines none of the colours HAVDM's preview reads.
 *
 * ⭐ F3 / HA-06 (interim). `themeService.getThemeColors()` maps six theme keys
 * onto the two surfaces HAVDM previews: the canvas background/text pair in
 * `App.tsx` and the six swatches of `ThemePreviewPanel`, which returns `null`
 * for any unset field. A theme defining none of the six is selectable, applies
 * cleanly, and changes neither surface's colours — the canvas falls back to
 * HAVDM's own antd token and the Theme Preview card renders no colour swatches.
 * Measured on the reference instance: four of its five installed themes.
 *
 * ⚠⚠ NEITHER OF THOSE IS "UNCHANGED" OR "EMPTY", AND SAYING SO COST A REVIEW
 * ROUND (Codex round 3, finding R3-M1). `App.tsx` maps every absent colour to
 * `undefined` and then resolves `canvasThemeBackground ?? token.colorBgContainer`,
 * so switching FROM a rich theme REPLACES its colours rather than retaining
 * them. And `ThemePreviewPanel` always renders its Card, the theme name, the
 * mode Tag, a Divider and a "Colors" heading — only each missing SWATCH returns
 * `null`. The measurement is pinned in
 * `tests/integration/theme-no-effect-badge.spec.ts` ("a badged theme replaces
 * the canvas colours with HAVDM own and empties the swatches").
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
 * ⚠⚠⚠ THIS STRING IS THE PRODUCT CLAIM. IT MAY PROMISE ONLY WHAT
 * `definesNoCanvasColors` ESTABLISHES — the canvas `<Content>`'s OWN
 * background/text pair and the six `ThemePreviewPanel` swatches. It may NOT
 * speak for the canvas SUBTREE, whose bundled stylesheets consume hundreds of
 * custom properties this predicate cannot see.
 *
 * ⚠⚠ CORRECTED AFTER CODEX'S ROUND-2 REVIEW OF PR #142 (finding R2-M1). The
 * round-1 fix narrowed the LABEL to "no preview colours" but left this string
 * reading *"…so the canvas and the Theme Preview panel will not change. Other
 * styling may still differ."* — which moved M1's disproved canvas-wide claim
 * rather than retracting it, and then contradicted itself in the next sentence.
 * A user reads "the canvas" as everything they see on it, not as the `<Content>`
 * root as distinct from its descendants. The wording below names the two
 * surfaces and concedes the third in the user's own vocabulary.
 * ⓘ The owner signed off this wording on 2026-08-11, as he did the label before
 * it. **Do not re-word a user-facing claim here without putting it to him.**
 */
export const THEME_NO_PREVIEW_COLOURS_TOOLTIP =
  "This theme defines none of the colours HAVDM reads, so the canvas uses HAVDM's own " +
  'default colours and the Theme Preview panel shows no colour swatches. Cards, editors ' +
  'and other styling on the canvas may still change. Your Home Assistant dashboard is ' +
  'unaffected either way.';

export const THEME_NO_PREVIEW_COLOURS_LABEL = 'no preview colours';

interface ThemeNoEffectBadgeProps {
  /**
   * Icon only, no text. Used for the SELECTED value, where `ThemeSelector`'s
   * Select is 200px wide and a theme name like "Mushroom Square Shadow"
   * already fills it, and for the two Theme Manager Selects that share their
   * row with Load/Delete or Clear buttons. The tooltip carries the explanation
   * in both forms.
   */
  compact?: boolean;
}

/**
 * ⚠ The component name and `data-testid` still say "no effect" while the
 * user-facing strings say "no preview colours". That is deliberate: the round-1
 * fix narrowed the CLAIM, and renaming the test id would have rippled through
 * six assertions in two specs for no user-visible gain. The strings above are
 * the contract; these identifiers are not.
 */
export const ThemeNoEffectBadge: React.FC<ThemeNoEffectBadgeProps> = ({ compact = false }) => (
  <Tooltip title={THEME_NO_PREVIEW_COLOURS_TOOLTIP}>
    {compact ? (
      <InfoCircleOutlined
        data-testid="theme-no-effect-badge"
        aria-label={THEME_NO_PREVIEW_COLOURS_LABEL}
        style={{ opacity: 0.65, flexShrink: 0 }}
      />
    ) : (
      <Tag
        data-testid="theme-no-effect-badge"
        icon={<InfoCircleOutlined />}
        bordered={false}
        style={{ marginInlineEnd: 0, flexShrink: 0 }}
      >
        {THEME_NO_PREVIEW_COLOURS_LABEL}
      </Tag>
    )}
  </Tooltip>
);
