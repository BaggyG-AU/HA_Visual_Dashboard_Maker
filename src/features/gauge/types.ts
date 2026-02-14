import type { BaseCard } from '../../types/dashboard';

export interface GaugeCardProSegment {
  from: number;
  color: string;
  label?: string;
}

export interface GaugeCardProConfig extends BaseCard {
  type: 'custom:gauge-card-pro';
  entity?: string;
  header?: string;
  min?: number;
  max?: number;
  needle?: boolean;
  gradient?: boolean;
  segments?: GaugeCardProSegment[];
  value_texts?: {
    primary_unit?: string;
  };
}

export interface NormalizedGaugeCardProSegment {
  from: number;
  color: string;
  label?: string;
  isActive: boolean;
}

export interface NormalizedGaugeCardProConfig {
  type: 'custom:gauge-card-pro';
  min: number;
  max: number;
  value: number;
  percentage: number;
  unit: string;
  needle: boolean;
  gradient: boolean;
  header?: string;
  unavailable: boolean;
  segments: NormalizedGaugeCardProSegment[];
  activeColor: string;
  valuePrecision: number;
}
