/**
 * Color conversion utilities for HAVDM Color Picker
 *
 * Provides conversions between Hex, RGB, HSL color formats
 * All functions handle alpha channel when present
 */

import type { RgbColor, RgbaColor, HslColor, HslaColor, ColorValidation } from '../types/color';

/**
 * Convert hex color to RGBA
 * Supports: #RGB, #RRGGBB, #RRGGBBAA
 */
export function hexToRgba(hex: string): RgbaColor {
  // Remove # if present
  let cleanHex = hex.replace(/^#/, '');

  // Expand shorthand (#RGB -> #RRGGBB)
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Parse alpha if present
  let a = 1;
  if (cleanHex.length === 8) {
    a = parseInt(cleanHex.substring(6, 8), 16) / 255;
  }

  return { r, g, b, a };
}

/**
 * Convert RGBA to hex color
 * Returns #RRGGBB or #RRGGBBAA if alpha < 1
 */
export function rgbaToHex(rgba: RgbaColor): string {
  const r = Math.round(rgba.r).toString(16).padStart(2, '0');
  const g = Math.round(rgba.g).toString(16).padStart(2, '0');
  const b = Math.round(rgba.b).toString(16).padStart(2, '0');

  let hex = `#${r}${g}${b}`;

  // Add alpha if not fully opaque
  if (rgba.a < 1) {
    const a = Math.round(rgba.a * 255)
      .toString(16)
      .padStart(2, '0');
    hex += a;
  }

  return hex;
}

/**
 * Convert RGB to HSL
 * Algorithm from https://en.wikipedia.org/wiki/HSL_and_HSV
 */
export function rgbToHsl(rgb: RgbColor): HslColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert RGBA to HSLA
 */
export function rgbaToHsla(rgba: RgbaColor): HslaColor {
  const hsl = rgbToHsl({ r: rgba.r, g: rgba.g, b: rgba.b });
  return { ...hsl, a: rgba.a };
}

/**
 * Convert HSL to RGB
 * Algorithm from https://en.wikipedia.org/wiki/HSL_and_HSV
 */
export function hslToRgb(hsl: HslColor): RgbColor {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // Achromatic (gray)
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert HSLA to RGBA
 */
export function hslaToRgba(hsla: HslaColor): RgbaColor {
  const rgb = hslToRgb({ h: hsla.h, s: hsla.s, l: hsla.l });
  return { ...rgb, a: hsla.a };
}

/**
 * Convert hex to HSL
 */
export function hexToHsl(hex: string): HslColor {
  const rgba = hexToRgba(hex);
  return rgbToHsl({ r: rgba.r, g: rgba.g, b: rgba.b });
}

/**
 * Convert hex to HSLA
 */
export function hexToHsla(hex: string): HslaColor {
  const rgba = hexToRgba(hex);
  return rgbaToHsla(rgba);
}

/**
 * Convert HSL to hex
 */
export function hslToHex(hsl: HslColor): string {
  const rgb = hslToRgb(hsl);
  return rgbaToHex({ ...rgb, a: 1 });
}

/**
 * Convert HSLA to hex
 */
export function hslaToHex(hsla: HslaColor): string {
  const rgba = hslaToRgba(hsla);
  return rgbaToHex(rgba);
}

/**
 * Validate hex color format
 * Accepts: #RGB, #RRGGBB, #RRGGBBAA
 */
export function validateHex(hex: string): ColorValidation {
  if (!hex) {
    return { valid: false, error: 'Color value is required' };
  }

  const hexPattern = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

  if (!hexPattern.test(hex)) {
    return {
      valid: false,
      error: 'Invalid hex format. Use #RGB, #RRGGBB, or #RRGGBBAA',
    };
  }

  // Normalize and return
  const normalized = normalizeHex(hex);
  return { valid: true, normalized };
}

/**
 * Normalize hex color to standard format
 * #RGB -> #RRGGBB
 * Ensures # prefix
 */
export function normalizeHex(hex: string): string {
  let cleanHex = hex.replace(/^#/, '');

  // Expand shorthand
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  return `#${cleanHex.toUpperCase()}`;
}

/**
 * Format RGBA as CSS string
 * rgb(255, 0, 0) or rgba(255, 0, 0, 0.5)
 */
export function formatRgba(rgba: RgbaColor): string {
  if (rgba.a < 1) {
    return `rgba(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)}, ${rgba.a.toFixed(2)})`;
  }
  return `rgb(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)})`;
}

/**
 * Format HSL as CSS string
 * hsl(360, 100%, 50%) or hsla(360, 100%, 50%, 0.5)
 */
export function formatHsla(hsla: HslaColor): string {
  if (hsla.a < 1) {
    return `hsla(${Math.round(hsla.h)}, ${Math.round(hsla.s)}%, ${Math.round(hsla.l)}%, ${hsla.a.toFixed(2)})`;
  }
  return `hsl(${Math.round(hsla.h)}, ${Math.round(hsla.s)}%, ${Math.round(hsla.l)}%)`;
}

/**
 * Parse CSS color string to RGBA
 * Supports: hex, rgb(), rgba(), hsl(), hsla()
 */
export function parseColor(color: string): RgbaColor | null {
  if (!color) return null;

  // Hex color
  if (color.startsWith('#')) {
    try {
      return hexToRgba(color);
    } catch {
      return null;
    }
  }

  // RGB/RGBA color
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
    };
  }

  // HSL/HSLA color
  const hslMatch = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/);
  if (hslMatch) {
    const hsla: HslaColor = {
      h: parseInt(hslMatch[1]),
      s: parseInt(hslMatch[2]),
      l: parseInt(hslMatch[3]),
      a: hslMatch[4] ? parseFloat(hslMatch[4]) : 1,
    };
    return hslaToRgba(hsla);
  }

  return null;
}

/**
 * Convert any color format to hex
 */
export function toHex(color: string): string {
  const rgba = parseColor(color);
  if (!rgba) return '#000000';
  return rgbaToHex(rgba);
}

/**
 * Convert any color format to RGBA string
 */
export function toRgbaString(color: string): string {
  const rgba = parseColor(color);
  if (!rgba) return 'rgba(0, 0, 0, 1)';
  return formatRgba(rgba);
}

/**
 * Convert any color format to HSLA string
 */
export function toHslaString(color: string): string {
  const rgba = parseColor(color);
  if (!rgba) return 'hsla(0, 0%, 0%, 1)';
  const hsla = rgbaToHsla(rgba);
  return formatHsla(hsla);
}
