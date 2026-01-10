import { describe, it, expect } from 'vitest';
import {
  extractStyleBackground,
  upsertStyleBackground,
  removeStyleBackground,
  extractStyleColor,
  upsertStyleColor,
} from '../../src/utils/styleBackground';

describe('styleBackground helpers', () => {
  it('extracts background value', () => {
    const style = 'color: #fff; background: #000; padding: 4px;';
    expect(extractStyleBackground(style)).toBe('#000');
  });

  it('upserts background value', () => {
    const style = 'color: #fff; background: #000;';
    expect(upsertStyleBackground(style, '#111')).toContain('background: #111');
  });

  it('removes background value', () => {
    const style = 'color: #fff; background: #000; padding: 4px;';
    expect(removeStyleBackground(style)).toBe('color: #fff; padding: 4px;');
  });

  it('extracts and upserts color value', () => {
    const style = 'background: #000; color: #fff;';
    expect(extractStyleColor(style)).toBe('#fff');
    expect(upsertStyleColor(style, '#123')).toContain('color: #123');
  });
});
