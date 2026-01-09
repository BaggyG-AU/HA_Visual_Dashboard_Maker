export type GradientType = 'linear' | 'radial';

export interface GradientStop {
  id: string;
  color: string;
  position: number; // 0 - 100 percent
}

export interface GradientDefinition {
  type: GradientType;
  angle: number; // degrees for linear
  shape: 'circle' | 'ellipse';
  position: string; // e.g., 'center', 'top left'
  stops: GradientStop[];
}

export interface GradientPreset {
  id: string;
  name: string;
  css: string;
  category: 'Material' | 'Nature' | 'Tech' | 'Monochrome' | 'Custom';
  description?: string;
  createdAt?: number;
}

export interface GradientPresetCollection {
  kind: 'havdm-gradient-presets';
  version: 1;
  presets: GradientPreset[];
  lastUpdated: number;
}
