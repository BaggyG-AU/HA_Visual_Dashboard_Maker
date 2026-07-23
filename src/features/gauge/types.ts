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
    // Phase 4 PR-7: upstream gauge-card-pro (benjamin-dcs) nests the primary unit
    // under value_texts.primary.unit_of_measurement. `primary_unit` (a flat,
    // never-valid HAVDM shape) is retained only so configs authored before PR-7
    // still resolve a unit on the canvas.
    primary?: {
      unit_of_measurement?: string;
    };
    /** @deprecated pre-PR-7 flat shape — read-only fallback, never emitted anew. */
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
