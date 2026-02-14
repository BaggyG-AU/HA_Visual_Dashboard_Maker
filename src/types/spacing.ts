export type SpacingPreset = 'none' | 'tight' | 'normal' | 'relaxed' | 'spacious' | 'custom';

export type SpacingMode = 'all' | 'per-side';

export type SpacingSide = 'top' | 'right' | 'bottom' | 'left';

export interface SpacingSides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SpacingSideObject {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
}

export type CardSpacingValue = number | string | SpacingSideObject;

export interface NormalizedSpacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
  mode: SpacingMode;
}
