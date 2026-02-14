import { describe, expect, it } from 'vitest';
import {
  clampCardSpacing,
  normalizeSpacingValue,
  resolveSpacingPreset,
  SPACING_PRESET_VALUES,
  toSpacingCssShorthand,
} from '../../src/services/cardSpacing';

describe('cardSpacing', () => {
  it('parses and normalizes all supported formats', () => {
    expect(normalizeSpacingValue(8)).toEqual({ top: 8, right: 8, bottom: 8, left: 8, mode: 'all' });
    expect(normalizeSpacingValue('8')).toEqual({ top: 8, right: 8, bottom: 8, left: 8, mode: 'all' });
    expect(normalizeSpacingValue('8px 16px')).toEqual({ top: 8, right: 16, bottom: 8, left: 16, mode: 'per-side' });
    expect(normalizeSpacingValue('8px 12px 16px 4px')).toEqual({ top: 8, right: 12, bottom: 16, left: 4, mode: 'per-side' });
    expect(normalizeSpacingValue({ top: 1, right: 2, bottom: 3, left: 4 })).toEqual({
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
      mode: 'per-side',
    });
  });

  it('maps presets and resolves custom values', () => {
    expect(normalizeSpacingValue('none')).toEqual({ top: 0, right: 0, bottom: 0, left: 0, mode: 'all' });
    expect(normalizeSpacingValue('tight')).toEqual({ top: 4, right: 4, bottom: 4, left: 4, mode: 'all' });
    expect(normalizeSpacingValue('normal')).toEqual({ top: 8, right: 8, bottom: 8, left: 8, mode: 'all' });
    expect(normalizeSpacingValue('relaxed')).toEqual({ top: 16, right: 16, bottom: 16, left: 16, mode: 'all' });
    expect(normalizeSpacingValue('spacious')).toEqual({ top: 24, right: 24, bottom: 24, left: 24, mode: 'all' });

    expect(resolveSpacingPreset(SPACING_PRESET_VALUES.none)).toBe('none');
    expect(resolveSpacingPreset(SPACING_PRESET_VALUES.tight)).toBe('tight');
    expect(resolveSpacingPreset(SPACING_PRESET_VALUES.normal)).toBe('normal');
    expect(resolveSpacingPreset(SPACING_PRESET_VALUES.relaxed)).toBe('relaxed');
    expect(resolveSpacingPreset(SPACING_PRESET_VALUES.spacious)).toBe('spacious');
    expect(resolveSpacingPreset(13)).toBe('custom');
    expect(resolveSpacingPreset({ top: 1, right: 2, bottom: 3, left: 4 })).toBe('custom');
  });

  it('clamps invalid or out-of-range values to 0..64', () => {
    expect(clampCardSpacing(-10)).toBe(0);
    expect(clampCardSpacing(128)).toBe(64);
    expect(clampCardSpacing(8.8)).toBe(9);

    expect(normalizeSpacingValue({ top: -1, right: 80, bottom: 20.2, left: '7' })).toEqual({
      top: 0,
      right: 64,
      bottom: 20,
      left: 7,
      mode: 'per-side',
    });
  });

  it('converts shorthand and preserves backward-compatible defaults', () => {
    expect(toSpacingCssShorthand('8px 16px')).toBe('8px 16px 8px 16px');
    expect(toSpacingCssShorthand(undefined)).toBe('0px 0px 0px 0px');
    expect(toSpacingCssShorthand('invalid')).toBe('0px 0px 0px 0px');
  });
});
