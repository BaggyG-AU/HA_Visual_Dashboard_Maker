export type HapticPattern = 'light' | 'medium' | 'heavy' | 'double' | 'success' | 'error';

export interface HapticSettings {
  enabled: boolean;
  intensity: number; // 0-100
}

export interface HapticCardConfig {
  enabled?: boolean;
  pattern?: HapticPattern;
  intensity?: number;
}
