import type { CSSProperties } from 'react';
import type { GridCard, HorizontalStackCard, VerticalStackCard } from '../types/dashboard';

export const DEFAULT_LAYOUT_GAP = 12;
export const MIN_LAYOUT_GAP = 0;
export const MAX_LAYOUT_GAP = 64;

export type LayoutGapPreset = 'none' | 'tight' | 'normal' | 'relaxed' | 'custom';
export type LayoutAlignItems = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type LayoutJustifyContent =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
export type LayoutJustifyItems = 'start' | 'center' | 'end' | 'stretch';
export type LayoutWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export const GAP_PRESET_VALUES: Record<Exclude<LayoutGapPreset, 'custom'>, number> = {
  none: 0,
  tight: 4,
  normal: DEFAULT_LAYOUT_GAP,
  relaxed: 24,
};

const parseGapNumber = (value: unknown): number | undefined => {
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

export const clampLayoutGap = (
  value: unknown,
  fallback = DEFAULT_LAYOUT_GAP,
  min = MIN_LAYOUT_GAP,
  max = MAX_LAYOUT_GAP,
): number => {
  const parsed = parseGapNumber(value);
  const candidate = typeof parsed === 'number' ? parsed : fallback;
  return Math.min(max, Math.max(min, Math.round(candidate)));
};

export const normalizeGapPreset = (value: unknown): LayoutGapPreset => {
  if (value === 'none' || value === 'tight' || value === 'normal' || value === 'relaxed' || value === 'custom') {
    return value;
  }
  return 'normal';
};

export const resolveGapPreset = (value: unknown, fallback = DEFAULT_LAYOUT_GAP): LayoutGapPreset => {
  const normalized = clampLayoutGap(value, fallback);
  if (normalized === GAP_PRESET_VALUES.none) return 'none';
  if (normalized === GAP_PRESET_VALUES.tight) return 'tight';
  if (normalized === GAP_PRESET_VALUES.normal) return 'normal';
  if (normalized === GAP_PRESET_VALUES.relaxed) return 'relaxed';
  return 'custom';
};

const ALIGN_ITEMS_TO_CSS: Record<LayoutAlignItems, CSSProperties['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const JUSTIFY_CONTENT_TO_CSS: Record<LayoutJustifyContent, CSSProperties['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
};

const JUSTIFY_ITEMS_TO_CSS: Record<LayoutJustifyItems, CSSProperties['justifyItems']> = {
  start: 'start',
  center: 'center',
  end: 'end',
  stretch: 'stretch',
};

export const normalizeAlignItems = (value: unknown, fallback: LayoutAlignItems = 'stretch'): LayoutAlignItems => {
  if (value === 'start' || value === 'center' || value === 'end' || value === 'stretch' || value === 'baseline') {
    return value;
  }
  return fallback;
};

export const normalizeJustifyContent = (
  value: unknown,
  fallback: LayoutJustifyContent = 'start',
): LayoutJustifyContent => {
  if (
    value === 'start'
    || value === 'center'
    || value === 'end'
    || value === 'space-between'
    || value === 'space-around'
    || value === 'space-evenly'
  ) {
    return value;
  }
  return fallback;
};

export const normalizeJustifyItems = (value: unknown, fallback: LayoutJustifyItems = 'stretch'): LayoutJustifyItems => {
  if (value === 'start' || value === 'center' || value === 'end' || value === 'stretch') {
    return value;
  }
  return fallback;
};

export const normalizeWrapMode = (value: unknown, fallback: LayoutWrap = 'nowrap'): LayoutWrap => {
  if (value === 'nowrap' || value === 'wrap' || value === 'wrap-reverse') {
    return value;
  }
  return fallback;
};

export const toAlignItemsCss = (value: LayoutAlignItems): CSSProperties['alignItems'] => ALIGN_ITEMS_TO_CSS[value];
export const toJustifyContentCss = (value: LayoutJustifyContent): CSSProperties['justifyContent'] => JUSTIFY_CONTENT_TO_CSS[value];
export const toJustifyItemsCss = (value: LayoutJustifyItems): CSSProperties['justifyItems'] => JUSTIFY_ITEMS_TO_CSS[value];

export interface NormalizedVerticalStackLayout {
  gap: number;
  alignItems: CSSProperties['alignItems'];
  alignItemsValue: LayoutAlignItems;
}

export interface NormalizedHorizontalStackLayout {
  gap: number;
  alignItems: CSSProperties['alignItems'];
  alignItemsValue: LayoutAlignItems;
  justifyContent: CSSProperties['justifyContent'];
  justifyContentValue: LayoutJustifyContent;
  wrap: LayoutWrap;
}

export interface NormalizedGridLayout {
  rowGap: number;
  columnGap: number;
  alignItems: CSSProperties['alignItems'];
  alignItemsValue: LayoutAlignItems;
  justifyItems: CSSProperties['justifyItems'];
  justifyItemsValue: LayoutJustifyItems;
}

export const normalizeVerticalStackLayout = (card: VerticalStackCard): NormalizedVerticalStackLayout => {
  const normalizedAlignItems = normalizeAlignItems(card.align_items, 'stretch');
  const alignItemsValue = normalizedAlignItems === 'baseline' ? 'stretch' : normalizedAlignItems;
  return {
    gap: clampLayoutGap(card.gap),
    alignItemsValue,
    alignItems: toAlignItemsCss(alignItemsValue),
  };
};

export const normalizeHorizontalStackLayout = (card: HorizontalStackCard): NormalizedHorizontalStackLayout => {
  const alignItemsValue = normalizeAlignItems(card.align_items, 'stretch');
  const justifyContentValue = normalizeJustifyContent(card.justify_content, 'start');
  return {
    gap: clampLayoutGap(card.gap),
    alignItemsValue,
    alignItems: toAlignItemsCss(alignItemsValue),
    justifyContentValue,
    justifyContent: toJustifyContentCss(justifyContentValue),
    wrap: normalizeWrapMode(card.wrap, 'nowrap'),
  };
};

export const normalizeGridLayout = (card: GridCard): NormalizedGridLayout => {
  const normalizedAlignItems = normalizeAlignItems(card.align_items, 'stretch');
  const alignItemsValue = normalizedAlignItems === 'baseline' ? 'stretch' : normalizedAlignItems;
  const justifyItemsValue = normalizeJustifyItems(card.justify_items, 'stretch');
  return {
    rowGap: clampLayoutGap(card.row_gap),
    columnGap: clampLayoutGap(card.column_gap),
    alignItemsValue,
    alignItems: toAlignItemsCss(alignItemsValue),
    justifyItemsValue,
    justifyItems: toJustifyItemsCss(justifyItemsValue),
  };
};
