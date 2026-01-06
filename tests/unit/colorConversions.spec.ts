/**
 * Unit tests for color conversion utilities
 *
 * Tests all conversion functions and validation logic
 */

import { describe, it, expect } from 'vitest';
import {
  hexToRgba,
  rgbaToHex,
  rgbToHsl,
  rgbaToHsla,
  hslToRgb,
  hslaToRgba,
  hexToHsl,
  hexToHsla,
  hslToHex,
  hslaToHex,
  validateHex,
  normalizeHex,
  formatRgba,
  formatHsla,
  parseColor,
  toHex,
  toRgbaString,
  toHslaString,
} from '../../src/utils/colorConversions';

describe('colorConversions', () => {
  describe('hexToRgba', () => {
    it('should convert 6-digit hex to RGBA', () => {
      const result = hexToRgba('#FF0000');
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it('should convert 8-digit hex with alpha to RGBA', () => {
      const result = hexToRgba('#FF000080');
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 0.5019607843137255 });
    });

    it('should convert 3-digit hex shorthand to RGBA', () => {
      const result = hexToRgba('#F00');
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it('should handle hex without # prefix', () => {
      const result = hexToRgba('00FF00');
      expect(result).toEqual({ r: 0, g: 255, b: 0, a: 1 });
    });

    it('should handle lowercase hex', () => {
      const result = hexToRgba('#ff00ff');
      expect(result).toEqual({ r: 255, g: 0, b: 255, a: 1 });
    });
  });

  describe('rgbaToHex', () => {
    it('should convert RGBA to 6-digit hex when alpha is 1', () => {
      const result = rgbaToHex({ r: 255, g: 0, b: 0, a: 1 });
      expect(result).toBe('#ff0000');
    });

    it('should convert RGBA to 8-digit hex when alpha < 1', () => {
      const result = rgbaToHex({ r: 255, g: 0, b: 0, a: 0.5 });
      expect(result).toBe('#ff000080');
    });

    it('should handle rounding for RGB values', () => {
      const result = rgbaToHex({ r: 255.4, g: 127.6, b: 63.2, a: 1 });
      expect(result).toBe('#ff803f');
    });

    it('should handle zero values', () => {
      const result = rgbaToHex({ r: 0, g: 0, b: 0, a: 1 });
      expect(result).toBe('#000000');
    });
  });

  describe('rgbToHsl', () => {
    it('should convert pure red to HSL', () => {
      const result = rgbToHsl({ r: 255, g: 0, b: 0 });
      expect(result).toEqual({ h: 0, s: 100, l: 50 });
    });

    it('should convert pure green to HSL', () => {
      const result = rgbToHsl({ r: 0, g: 255, b: 0 });
      expect(result).toEqual({ h: 120, s: 100, l: 50 });
    });

    it('should convert pure blue to HSL', () => {
      const result = rgbToHsl({ r: 0, g: 0, b: 255 });
      expect(result).toEqual({ h: 240, s: 100, l: 50 });
    });

    it('should convert gray to HSL with zero saturation', () => {
      const result = rgbToHsl({ r: 128, g: 128, b: 128 });
      expect(result.s).toBe(0);
      expect(result.l).toBe(50);
    });

    it('should convert white to HSL', () => {
      const result = rgbToHsl({ r: 255, g: 255, b: 255 });
      expect(result).toEqual({ h: 0, s: 0, l: 100 });
    });

    it('should convert black to HSL', () => {
      const result = rgbToHsl({ r: 0, g: 0, b: 0 });
      expect(result).toEqual({ h: 0, s: 0, l: 0 });
    });
  });

  describe('hslToRgb', () => {
    it('should convert red HSL to RGB', () => {
      const result = hslToRgb({ h: 0, s: 100, l: 50 });
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should convert green HSL to RGB', () => {
      const result = hslToRgb({ h: 120, s: 100, l: 50 });
      expect(result).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should convert blue HSL to RGB', () => {
      const result = hslToRgb({ h: 240, s: 100, l: 50 });
      expect(result).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should convert gray HSL to RGB', () => {
      const result = hslToRgb({ h: 0, s: 0, l: 50 });
      expect(result).toEqual({ r: 128, g: 128, b: 128 });
    });

    it('should convert white HSL to RGB', () => {
      const result = hslToRgb({ h: 0, s: 0, l: 100 });
      expect(result).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should convert black HSL to RGB', () => {
      const result = hslToRgb({ h: 0, s: 0, l: 0 });
      expect(result).toEqual({ r: 0, g: 0, b: 0 });
    });
  });

  describe('rgbaToHsla', () => {
    it('should convert RGBA to HSLA preserving alpha', () => {
      const result = rgbaToHsla({ r: 255, g: 0, b: 0, a: 0.5 });
      expect(result).toEqual({ h: 0, s: 100, l: 50, a: 0.5 });
    });
  });

  describe('hslaToRgba', () => {
    it('should convert HSLA to RGBA preserving alpha', () => {
      const result = hslaToRgba({ h: 0, s: 100, l: 50, a: 0.5 });
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
    });
  });

  describe('hexToHsl', () => {
    it('should convert hex to HSL', () => {
      const result = hexToHsl('#FF0000');
      expect(result).toEqual({ h: 0, s: 100, l: 50 });
    });
  });

  describe('hexToHsla', () => {
    it('should convert hex to HSLA', () => {
      const result = hexToHsla('#FF000080');
      expect(result.h).toBe(0);
      expect(result.s).toBe(100);
      expect(result.l).toBe(50);
      expect(result.a).toBeCloseTo(0.5, 1);
    });
  });

  describe('hslToHex', () => {
    it('should convert HSL to hex', () => {
      const result = hslToHex({ h: 0, s: 100, l: 50 });
      expect(result.toUpperCase()).toBe('#FF0000');
    });
  });

  describe('hslaToHex', () => {
    it('should convert HSLA to hex with alpha', () => {
      const result = hslaToHex({ h: 0, s: 100, l: 50, a: 0.5 });
      expect(result).toBe('#ff000080');
    });
  });

  describe('validateHex', () => {
    it('should validate correct 6-digit hex', () => {
      const result = validateHex('#FF0000');
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('#FF0000');
    });

    it('should validate correct 3-digit hex', () => {
      const result = validateHex('#F00');
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('#FF0000');
    });

    it('should validate correct 8-digit hex with alpha', () => {
      const result = validateHex('#FF000080');
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('#FF000080');
    });

    it('should validate hex without # prefix', () => {
      const result = validateHex('FF0000');
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('#FF0000');
    });

    it('should reject invalid hex', () => {
      const result = validateHex('#GG0000');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject empty string', () => {
      const result = validateHex('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Color value is required');
    });

    it('should reject invalid length', () => {
      const result = validateHex('#FF00');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid hex format');
    });
  });

  describe('normalizeHex', () => {
    it('should add # prefix if missing', () => {
      const result = normalizeHex('FF0000');
      expect(result).toBe('#FF0000');
    });

    it('should expand 3-digit hex to 6-digit', () => {
      const result = normalizeHex('#F00');
      expect(result).toBe('#FF0000');
    });

    it('should uppercase hex letters', () => {
      const result = normalizeHex('#ff0000');
      expect(result).toBe('#FF0000');
    });

    it('should handle already normalized hex', () => {
      const result = normalizeHex('#FF0000');
      expect(result).toBe('#FF0000');
    });
  });

  describe('formatRgba', () => {
    it('should format RGBA with alpha < 1', () => {
      const result = formatRgba({ r: 255, g: 0, b: 0, a: 0.5 });
      expect(result).toBe('rgba(255, 0, 0, 0.50)');
    });

    it('should format RGB without alpha when alpha is 1', () => {
      const result = formatRgba({ r: 255, g: 0, b: 0, a: 1 });
      expect(result).toBe('rgb(255, 0, 0)');
    });

    it('should round RGB values', () => {
      const result = formatRgba({ r: 255.4, g: 127.6, b: 63.2, a: 1 });
      expect(result).toBe('rgb(255, 128, 63)');
    });
  });

  describe('formatHsla', () => {
    it('should format HSLA with alpha < 1', () => {
      const result = formatHsla({ h: 0, s: 100, l: 50, a: 0.5 });
      expect(result).toBe('hsla(0, 100%, 50%, 0.50)');
    });

    it('should format HSL without alpha when alpha is 1', () => {
      const result = formatHsla({ h: 0, s: 100, l: 50, a: 1 });
      expect(result).toBe('hsl(0, 100%, 50%)');
    });

    it('should round HSL values', () => {
      const result = formatHsla({ h: 120.4, s: 75.6, l: 50.2, a: 1 });
      expect(result).toBe('hsl(120, 76%, 50%)');
    });
  });

  describe('parseColor', () => {
    it('should parse 6-digit hex', () => {
      const result = parseColor('#FF0000');
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it('should parse 8-digit hex with alpha', () => {
      const result = parseColor('#FF000080');
      expect(result?.r).toBe(255);
      expect(result?.a).toBeCloseTo(0.5, 1);
    });

    it('should parse rgb() string', () => {
      const result = parseColor('rgb(255, 0, 0)');
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it('should parse rgba() string', () => {
      const result = parseColor('rgba(255, 0, 0, 0.5)');
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
    });

    it('should parse hsl() string', () => {
      const result = parseColor('hsl(0, 100%, 50%)');
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });

    it('should parse hsla() string', () => {
      const result = parseColor('hsla(0, 100%, 50%, 0.5)');
      expect(result).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
    });

    it('should return null for invalid color', () => {
      const result = parseColor('invalid');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = parseColor('');
      expect(result).toBeNull();
    });
  });

  describe('toHex', () => {
    it('should convert hex to hex (passthrough)', () => {
      const result = toHex('#FF0000');
      expect(result.toUpperCase()).toBe('#FF0000');
    });

    it('should convert rgb() to hex', () => {
      const result = toHex('rgb(255, 0, 0)');
      expect(result.toUpperCase()).toBe('#FF0000');
    });

    it('should convert hsl() to hex', () => {
      const result = toHex('hsl(0, 100%, 50%)');
      expect(result.toUpperCase()).toBe('#FF0000');
    });

    it('should return black for invalid color', () => {
      const result = toHex('invalid');
      expect(result).toBe('#000000');
    });
  });

  describe('toRgbaString', () => {
    it('should convert hex to rgba string', () => {
      const result = toRgbaString('#FF0000');
      expect(result).toBe('rgb(255, 0, 0)');
    });

    it('should convert hex with alpha to rgba string', () => {
      const result = toRgbaString('#FF000080');
      expect(result).toContain('rgba(255, 0, 0,');
    });

    it('should return black rgba for invalid color', () => {
      const result = toRgbaString('invalid');
      expect(result).toBe('rgba(0, 0, 0, 1)');
    });
  });

  describe('toHslaString', () => {
    it('should convert hex to hsla string', () => {
      const result = toHslaString('#FF0000');
      expect(result).toBe('hsl(0, 100%, 50%)');
    });

    it('should convert hex with alpha to hsla string', () => {
      const result = toHslaString('#FF000080');
      expect(result).toContain('hsla(0, 100%, 50%,');
    });

    it('should return black hsla for invalid color', () => {
      const result = toHslaString('invalid');
      expect(result).toBe('hsla(0, 0%, 0%, 1)');
    });
  });

  describe('round-trip conversions', () => {
    it('should maintain color integrity through hex → RGB → hex', () => {
      const original = '#FF8000';
      const rgba = hexToRgba(original);
      const result = rgbaToHex(rgba);
      expect(result.toUpperCase()).toBe(original);
    });

    it('should maintain color integrity through hex → HSL → hex', () => {
      const original = '#FF0000';
      const hsl = hexToHsl(original);
      const result = hslToHex(hsl);
      expect(result.toUpperCase()).toBe(original);
    });

    it('should maintain color integrity through RGB → HSL → RGB', () => {
      const original = { r: 128, g: 64, b: 192 };
      const hsl = rgbToHsl(original);
      const result = hslToRgb(hsl);
      // Allow small rounding differences
      expect(Math.abs(result.r - original.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.g - original.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(result.b - original.b)).toBeLessThanOrEqual(1);
    });
  });
});
