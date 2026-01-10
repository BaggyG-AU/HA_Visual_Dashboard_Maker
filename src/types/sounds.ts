export type SoundEffect = 'click' | 'success' | 'error' | 'toggle-on' | 'toggle-off' | 'notification';

export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0-100
}

export interface SoundCardConfig {
  enabled?: boolean;
  effect?: SoundEffect;
  volume?: number;
}
