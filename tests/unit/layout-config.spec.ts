import { describe, expect, it } from 'vitest';
import {
  clampLayoutGap,
  DEFAULT_LAYOUT_GAP,
  GAP_PRESET_VALUES,
  normalizeAlignItems,
  normalizeGapPreset,
  normalizeHorizontalStackLayout,
  normalizeVerticalStackLayout,
  normalizeGridLayout,
  normalizeWrapMode,
  resolveGapPreset,
} from '../../src/services/layoutConfig';
import type { GridCard, HorizontalStackCard, VerticalStackCard } from '../../src/types/dashboard';

describe('layoutConfig', () => {
  it('normalizes gap preset values', () => {
    expect(normalizeGapPreset('none')).toBe('none');
    expect(normalizeGapPreset('tight')).toBe('tight');
    expect(normalizeGapPreset('normal')).toBe('normal');
    expect(normalizeGapPreset('relaxed')).toBe('relaxed');
    expect(normalizeGapPreset('custom')).toBe('custom');
    expect(normalizeGapPreset('invalid')).toBe('normal');

    expect(resolveGapPreset(GAP_PRESET_VALUES.none)).toBe('none');
    expect(resolveGapPreset(GAP_PRESET_VALUES.tight)).toBe('tight');
    expect(resolveGapPreset(GAP_PRESET_VALUES.normal)).toBe('normal');
    expect(resolveGapPreset(GAP_PRESET_VALUES.relaxed)).toBe('relaxed');
    expect(resolveGapPreset(17)).toBe('custom');
  });

  it('parses and clamps numeric gap values', () => {
    expect(clampLayoutGap(16)).toBe(16);
    expect(clampLayoutGap('20')).toBe(20);
    expect(clampLayoutGap(-5)).toBe(0);
    expect(clampLayoutGap(999)).toBe(64);
    expect(clampLayoutGap('nope')).toBe(DEFAULT_LAYOUT_GAP);
  });

  it('validates alignment values with sane fallback', () => {
    expect(normalizeAlignItems('start', 'stretch')).toBe('start');
    expect(normalizeAlignItems('baseline', 'stretch')).toBe('baseline');
    expect(normalizeAlignItems('invalid', 'stretch')).toBe('stretch');

    const verticalCard: VerticalStackCard = {
      type: 'vertical-stack',
      cards: [],
      align_items: 'baseline' as VerticalStackCard['align_items'],
    };
    const vertical = normalizeVerticalStackLayout(verticalCard);
    expect(vertical.alignItemsValue).toBe('stretch');
    expect(vertical.alignItems).toBe('stretch');

    const horizontalCard: HorizontalStackCard = {
      type: 'horizontal-stack',
      cards: [],
      align_items: 'baseline',
      justify_content: 'space-between',
    };
    const horizontal = normalizeHorizontalStackLayout(horizontalCard);
    expect(horizontal.alignItemsValue).toBe('baseline');
    expect(horizontal.justifyContent).toBe('space-between');
  });

  it('normalizes wrap mode with fallback', () => {
    expect(normalizeWrapMode('wrap')).toBe('wrap');
    expect(normalizeWrapMode('wrap-reverse')).toBe('wrap-reverse');
    expect(normalizeWrapMode('invalid')).toBe('nowrap');
  });

  it('preserves backward-compatible defaults when layout properties are missing', () => {
    const vertical = normalizeVerticalStackLayout({
      type: 'vertical-stack',
      cards: [],
    } as VerticalStackCard);
    expect(vertical.gap).toBe(12);
    expect(vertical.alignItems).toBe('stretch');

    const horizontal = normalizeHorizontalStackLayout({
      type: 'horizontal-stack',
      cards: [],
    } as HorizontalStackCard);
    expect(horizontal.gap).toBe(12);
    expect(horizontal.alignItems).toBe('stretch');
    expect(horizontal.justifyContent).toBe('flex-start');
    expect(horizontal.wrap).toBe('nowrap');

    const grid = normalizeGridLayout({
      type: 'grid',
      cards: [],
    } as GridCard);
    expect(grid.rowGap).toBe(12);
    expect(grid.columnGap).toBe(12);
    expect(grid.alignItems).toBe('stretch');
    expect(grid.justifyItems).toBe('stretch');
  });
});
