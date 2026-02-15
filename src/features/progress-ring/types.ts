import type { BaseCard } from '../../types/dashboard';

export type ProgressRingDirection = 'clockwise' | 'counter-clockwise';
export type ProgressRingGradientType = 'linear' | 'radial';

export interface ProgressRingGradientStop {
  color: string;
  position: number;
}

export interface ProgressRingGradient {
  type?: ProgressRingGradientType;
  angle?: number;
  stops?: ProgressRingGradientStop[];
}

export interface ProgressRingThreshold {
  value: number;
  color: string;
}

export interface ProgressRingConfig {
  entity: string;
  label?: string;
  min?: number;
  max?: number;
  color?: string;
  thickness?: number;
  gradient?: ProgressRingGradient;
  thresholds?: ProgressRingThreshold[];
}

export interface ProgressRingCardConfig extends BaseCard {
  type: 'custom:modern-circular-gauge';
  title?: string;
  rings?: ProgressRingConfig[];
  thickness?: number;
  start_angle?: number;
  direction?: ProgressRingDirection;
  animate?: boolean;
  animation_duration_ms?: number;
  animation_easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  show_labels?: boolean;
  label_precision?: number;
}

export interface NormalizedProgressRingGradientStop {
  color: string;
  position: number;
}

export interface NormalizedProgressRingGradient {
  type: ProgressRingGradientType;
  angle: number;
  stops: NormalizedProgressRingGradientStop[];
}

export interface NormalizedProgressRingConfig {
  entity: string;
  label: string;
  min: number;
  max: number;
  color: string;
  thickness: number;
  gradient?: NormalizedProgressRingGradient;
  thresholds: Array<{ value: number; color: string }>;
}

export interface NormalizedProgressRingCardConfig {
  type: 'custom:modern-circular-gauge';
  title?: string;
  rings: NormalizedProgressRingConfig[];
  startAngle: number;
  direction: ProgressRingDirection;
  animate: boolean;
  animationDurationMs: number;
  animationEasing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  showLabels: boolean;
  labelPrecision: number;
}

export interface RingRuntimeState {
  entity: string;
  label: string;
  value: number;
  percent: number;
  displayValue: string;
  color: string;
  thickness: number;
  gradient?: NormalizedProgressRingGradient;
  thresholds: Array<{ value: number; color: string }>;
}

export interface RingGeometry {
  radius: number;
  circumference: number;
  thickness: number;
}
