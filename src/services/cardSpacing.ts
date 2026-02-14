import type { CSSProperties } from 'react';
import type { Card } from '../types/dashboard';
import type {
  CardSpacingValue,
  NormalizedSpacing,
  SpacingMode,
  SpacingPreset,
  SpacingSide,
  SpacingSideObject,
  SpacingSides,
} from '../types/spacing';

export const MIN_CARD_SPACING = 0;
export const MAX_CARD_SPACING = 64;
export const DEFAULT_CARD_SPACING = 0;

export const SPACING_PRESET_VALUES: Record<Exclude<SpacingPreset, 'custom'>, number> = {
  none: 0,
  tight: 4,
  normal: 8,
  relaxed: 16,
  spacious: 24,
};

const PRESET_SET = new Set<SpacingPreset>(['none', 'tight', 'normal', 'relaxed', 'spacious', 'custom']);
const SPACING_SIDES: SpacingSide[] = ['top', 'right', 'bottom', 'left'];

const asFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

export const clampCardSpacing = (
  value: unknown,
  fallback = DEFAULT_CARD_SPACING,
  min = MIN_CARD_SPACING,
  max = MAX_CARD_SPACING,
): number => {
  const parsed = asFiniteNumber(value);
  const candidate = typeof parsed === 'number' ? parsed : fallback;
  return Math.min(max, Math.max(min, Math.round(candidate)));
};

export const isSpacingPreset = (value: unknown): value is SpacingPreset => {
  return typeof value === 'string' && PRESET_SET.has(value as SpacingPreset);
};

const parseCssToken = (token: string): number | undefined => {
  const trimmed = token.trim().toLowerCase();
  if (!trimmed) return undefined;

  if (trimmed.endsWith('px')) {
    return asFiniteNumber(trimmed.slice(0, -2));
  }

  return asFiniteNumber(trimmed);
};

const parseCssShorthand = (value: string): SpacingSides | null => {
  const tokens = value.trim().split(/\s+/).filter(Boolean);
  if (tokens.length < 1 || tokens.length > 4) {
    return null;
  }

  const parsed = tokens.map(parseCssToken);
  if (parsed.some((token) => typeof token !== 'number')) {
    return null;
  }

  const safe = parsed.map((token) => clampCardSpacing(token, DEFAULT_CARD_SPACING));

  if (safe.length === 1) {
    return { top: safe[0], right: safe[0], bottom: safe[0], left: safe[0] };
  }

  if (safe.length === 2) {
    return { top: safe[0], right: safe[1], bottom: safe[0], left: safe[1] };
  }

  if (safe.length === 3) {
    return { top: safe[0], right: safe[1], bottom: safe[2], left: safe[1] };
  }

  return { top: safe[0], right: safe[1], bottom: safe[2], left: safe[3] };
};

const normalizeSides = (value: SpacingSideObject, fallback = DEFAULT_CARD_SPACING): SpacingSides => {
  return {
    top: clampCardSpacing(value.top, fallback),
    right: clampCardSpacing(value.right, fallback),
    bottom: clampCardSpacing(value.bottom, fallback),
    left: clampCardSpacing(value.left, fallback),
  };
};

const toAllSides = (value: number): SpacingSides => ({
  top: value,
  right: value,
  bottom: value,
  left: value,
});

export const normalizeSpacingValue = (
  value: unknown,
  fallback = DEFAULT_CARD_SPACING,
): NormalizedSpacing => {
  if (isSpacingPreset(value) && value !== 'custom') {
    return {
      ...toAllSides(SPACING_PRESET_VALUES[value]),
      mode: 'all',
    };
  }

  if (typeof value === 'number') {
    const next = clampCardSpacing(value, fallback);
    return {
      ...toAllSides(next),
      mode: 'all',
    };
  }

  if (typeof value === 'string') {
    const parsedNumber = asFiniteNumber(value);
    if (typeof parsedNumber === 'number') {
      const next = clampCardSpacing(parsedNumber, fallback);
      return {
        ...toAllSides(next),
        mode: 'all',
      };
    }

    const shorthand = parseCssShorthand(value);
    if (shorthand) {
      const mode: SpacingMode = shorthand.top === shorthand.right
        && shorthand.top === shorthand.bottom
        && shorthand.top === shorthand.left
        ? 'all'
        : 'per-side';
      return {
        ...shorthand,
        mode,
      };
    }
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const sides = normalizeSides(value as SpacingSideObject, fallback);
    return {
      ...sides,
      mode: 'per-side',
    };
  }

  return {
    ...toAllSides(clampCardSpacing(undefined, fallback)),
    mode: 'all',
  };
};

export const resolveSpacingPreset = (value: unknown): SpacingPreset => {
  if (isSpacingPreset(value)) {
    return value;
  }

  const normalized = normalizeSpacingValue(value, DEFAULT_CARD_SPACING);
  const allSame = normalized.top === normalized.right
    && normalized.top === normalized.bottom
    && normalized.top === normalized.left;

  if (!allSame) {
    return 'custom';
  }

  if (normalized.top === SPACING_PRESET_VALUES.none) return 'none';
  if (normalized.top === SPACING_PRESET_VALUES.tight) return 'tight';
  if (normalized.top === SPACING_PRESET_VALUES.normal) return 'normal';
  if (normalized.top === SPACING_PRESET_VALUES.relaxed) return 'relaxed';
  if (normalized.top === SPACING_PRESET_VALUES.spacious) return 'spacious';

  return 'custom';
};

export const spacingValueToFormValue = (mode: SpacingMode, spacing: NormalizedSpacing): CardSpacingValue => {
  if (mode === 'all') {
    return spacing.top;
  }

  return {
    top: spacing.top,
    right: spacing.right,
    bottom: spacing.bottom,
    left: spacing.left,
  };
};

export const toSpacingCssShorthand = (value: unknown, fallback = DEFAULT_CARD_SPACING): string => {
  const normalized = normalizeSpacingValue(value, fallback);
  return `${normalized.top}px ${normalized.right}px ${normalized.bottom}px ${normalized.left}px`;
};

export const resolveCardSpacingStyles = (card: Card): CSSProperties => {
  const rawMargin = (card as { card_margin?: unknown }).card_margin;
  const rawPadding = (card as { card_padding?: unknown }).card_padding;

  if (typeof rawMargin === 'undefined' && typeof rawPadding === 'undefined') {
    return {};
  }

  const style: CSSProperties = {
    boxSizing: 'border-box',
  };

  if (typeof rawMargin !== 'undefined') {
    style.margin = toSpacingCssShorthand(rawMargin);
  }

  if (typeof rawPadding !== 'undefined') {
    style.padding = toSpacingCssShorthand(rawPadding);
  }

  return style;
};

export const updateSpacingSide = (
  value: unknown,
  side: SpacingSide,
  next: unknown,
): CardSpacingValue => {
  const normalized = normalizeSpacingValue(value, DEFAULT_CARD_SPACING);
  const updated = {
    top: normalized.top,
    right: normalized.right,
    bottom: normalized.bottom,
    left: normalized.left,
  };

  updated[side] = clampCardSpacing(next, normalized[side]);

  return updated;
};

export const isPerSideSpacing = (value: unknown): boolean => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return true;
  }

  const normalized = normalizeSpacingValue(value, DEFAULT_CARD_SPACING);
  return normalized.mode === 'per-side';
};

export const getSpacingSideValues = (value: unknown): SpacingSides => {
  const normalized = normalizeSpacingValue(value, DEFAULT_CARD_SPACING);
  return {
    top: normalized.top,
    right: normalized.right,
    bottom: normalized.bottom,
    left: normalized.left,
  };
};

export const defaultPerSideSpacing = (value = DEFAULT_CARD_SPACING): SpacingSides => {
  const clamped = clampCardSpacing(value, DEFAULT_CARD_SPACING);
  return {
    top: clamped,
    right: clamped,
    bottom: clamped,
    left: clamped,
  };
};

export const normalizeSpacingSide = (side: unknown): SpacingSide => {
  if (side === 'top' || side === 'right' || side === 'bottom' || side === 'left') {
    return side;
  }
  return 'top';
};

export const spacingSides = SPACING_SIDES;
