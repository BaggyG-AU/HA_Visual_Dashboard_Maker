import type { BaseCard } from '../../types/dashboard';
import type { HapticCardConfig } from '../../types/haptics';
import type { SoundCardConfig } from '../../types/sounds';

export type AdvancedSliderOrientation = 'horizontal' | 'vertical';

export interface AdvancedSliderZone {
  from: number;
  to: number;
  color: string;
  label?: string;
}

export interface AdvancedSliderCardConfig extends BaseCard {
  type: 'custom:slider-button-card';
  entity?: string;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  orientation?: AdvancedSliderOrientation;
  show_markers?: boolean;
  show_value?: boolean;
  commit_on_release?: boolean;
  animate_fill?: boolean;
  zones?: AdvancedSliderZone[];
  haptic?: HapticCardConfig;
  sound?: SoundCardConfig;
}

export interface NormalizedAdvancedSliderZone {
  from: number;
  to: number;
  color: string;
  label: string;
}

export interface SliderMarker {
  value: number;
  label: string;
  color?: string;
}

export interface NormalizedAdvancedSliderConfig {
  type: 'custom:slider-button-card';
  min: number;
  max: number;
  step: number;
  precision: number;
  orientation: AdvancedSliderOrientation;
  showMarkers: boolean;
  showValue: boolean;
  commitOnRelease: boolean;
  animateFill: boolean;
  value: number;
  unavailable: boolean;
  zones: NormalizedAdvancedSliderZone[];
  markers: SliderMarker[];
  activeColor: string;
}

export interface SliderUpdateResolution {
  draftValue: number;
  committedValue: number;
  shouldCommit: boolean;
}
