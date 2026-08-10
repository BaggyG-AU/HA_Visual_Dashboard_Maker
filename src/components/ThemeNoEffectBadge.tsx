import React from 'react';
import { Tag, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

/**
 * Marks a theme that will not change the HAVDM canvas when selected.
 *
 * ⭐ F3 / HA-06 (interim). `themeService.applyThemeToElement` publishes a theme
 * as ~30 CSS custom properties, but nothing in `src/` reads a single
 * `var(--…)`, so a theme reaches the user through one funnel only —
 * `themeService.getThemeColors()` — feeding the canvas surface in `App.tsx`
 * and the six swatches of `ThemePreviewPanel`. A theme defining none of that
 * function's fields is selectable, applies cleanly, and changes nothing on
 * either: the canvas is untouched and the Theme Preview card is empty.
 * Measured on the reference instance: four of its five installed themes.
 *
 * ⚠ THE WORDING IS NEGATIVE ON PURPOSE. The predicate behind this badge
 * establishes only what a theme does NOT define. It never establishes what the
 * theme DOES do, and one member of the marked set (`Mushroom`) defines no
 * variables at all — so "styles cards only" or "shape only" would be a claim
 * the measurement does not support and that is false for that member.
 *
 * ⚠ This is the INTERIM marking, not the fix. The fix is a canvas fidelity
 * contract with real `var(--)` consumers over a fuller variable set, which is
 * its own scoped item.
 */

export const THEME_NO_EFFECT_TOOLTIP =
  'This theme has no effect on the HAVDM preview — it defines none of the colours ' +
  'HAVDM reads. Your Home Assistant dashboard is unaffected either way.';

export const THEME_NO_EFFECT_LABEL = 'no preview effect';

interface ThemeNoEffectBadgeProps {
  /**
   * Icon only, no text. Used for the SELECTED value, where `ThemeSelector`'s
   * Select is 200px wide and a theme name like "Mushroom Square Shadow"
   * already fills it. The tooltip carries the explanation in both forms.
   */
  compact?: boolean;
}

export const ThemeNoEffectBadge: React.FC<ThemeNoEffectBadgeProps> = ({ compact = false }) => (
  <Tooltip title={THEME_NO_EFFECT_TOOLTIP}>
    {compact ? (
      <InfoCircleOutlined
        data-testid="theme-no-effect-badge"
        aria-label={THEME_NO_EFFECT_LABEL}
        style={{ opacity: 0.65, flexShrink: 0 }}
      />
    ) : (
      <Tag
        data-testid="theme-no-effect-badge"
        icon={<InfoCircleOutlined />}
        bordered={false}
        style={{ marginInlineEnd: 0, flexShrink: 0 }}
      >
        {THEME_NO_EFFECT_LABEL}
      </Tag>
    )}
  </Tooltip>
);
