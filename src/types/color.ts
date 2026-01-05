/**
 * Color type definitions for HAVDM Color Picker
 *
 * Supports multiple color formats: Hex, RGB, RGBA, HSL, HSLA
 */

/**
 * RGB color representation (0-255 for each channel)
 */
export interface RgbColor {
  r: number; // Red (0-255)
  g: number; // Green (0-255)
  b: number; // Blue (0-255)
}

/**
 * RGBA color representation (0-255 for RGB, 0-1 for alpha)
 */
export interface RgbaColor extends RgbColor {
  a: number; // Alpha (0-1)
}

/**
 * HSL color representation
 */
export interface HslColor {
  h: number; // Hue (0-360)
  s: number; // Saturation (0-100)
  l: number; // Lightness (0-100)
}

/**
 * HSLA color representation
 */
export interface HslaColor extends HslColor {
  a: number; // Alpha (0-1)
}

/**
 * Supported color formats for display and input
 */
export type ColorFormat = 'hex' | 'rgb' | 'hsl';

/**
 * Color picker props
 */
export interface ColorPickerProps {
  /** Current color value (hex or rgba string) */
  value?: string;

  /** Callback when color changes */
  onChange?: (color: string) => void;

  /** Preferred color format for display */
  format?: ColorFormat;

  /** Whether to show alpha channel control */
  showAlpha?: boolean;

  /** Whether to show format toggle buttons */
  showFormatToggle?: boolean;

  /** Whether to show recent colors */
  showRecentColors?: boolean;

  /** Maximum number of recent colors to display */
  maxRecentColors?: number;

  /** Whether picker is disabled */
  disabled?: boolean;

  /** ARIA label for accessibility */
  ariaLabel?: string;

  /** Test ID for E2E testing */
  'data-testid'?: string;
}

/**
 * Color picker input wrapper props
 */
export interface ColorPickerInputProps extends ColorPickerProps {
  /** Placeholder text */
  placeholder?: string;

  /** Whether the input is read-only */
  readOnly?: boolean;

  /** Size of the input */
  size?: 'small' | 'middle' | 'large';

  /** Custom class name */
  className?: string;

  /** Custom style */
  style?: React.CSSProperties;
}

/**
 * Recent colors storage interface
 */
export interface RecentColorsStorage {
  /** Array of recent colors (hex or rgba strings) */
  colors: string[];

  /** Timestamp of last update */
  lastUpdated?: number;
}

/**
 * Color validation result
 */
export interface ColorValidation {
  /** Whether the color is valid */
  valid: boolean;

  /** Error message if invalid */
  error?: string;

  /** Normalized color value if valid */
  normalized?: string;
}
