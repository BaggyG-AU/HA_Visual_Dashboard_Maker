import type { Action } from '../types/dashboard';
import type { HapticCardConfig, HapticPattern, HapticSettings } from '../types/haptics';

type VibrationPattern = number | number[];

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);

const BASE_PATTERNS: Record<HapticPattern, number[]> = {
  light: [10],
  medium: [25],
  heavy: [50],
  double: [10, 30, 10],
  success: [50, 30, 25],
  error: [25, 30, 25, 30, 25],
};

const DEFAULT_SETTINGS: HapticSettings = {
  enabled: false,
  intensity: 100,
};

let currentSettings: HapticSettings = { ...DEFAULT_SETTINGS };

const getVibrationFn = (): ((pattern: VibrationPattern) => boolean) | null => {
  if (typeof navigator === 'undefined') return null;
  const vibrate = navigator.vibrate;
  return typeof vibrate === 'function' ? vibrate.bind(navigator) : null;
};

const scalePattern = (pattern: number[], intensity: number): number[] => {
  const normalized = clamp(intensity, 0, 100);
  if (normalized <= 0) return [];
  const scale = normalized / 100;
  return pattern.map((value) => Math.max(1, Math.round(value * scale)));
};

const resolvePatternForAction = (action?: Action): HapticPattern | null => {
  switch (action?.action) {
    case 'toggle':
      return 'medium';
    case 'navigate':
    case 'url':
    case 'more-info':
      return 'light';
    case 'call-service':
      return 'success';
    case 'none':
    default:
      return null;
  }
};

const getEffectiveSettings = (override?: HapticCardConfig): HapticSettings => {
  const enabled = override?.enabled ?? currentSettings.enabled;
  const intensity = override?.intensity ?? currentSettings.intensity;
  return {
    enabled,
    intensity: clamp(intensity, 0, 100),
  };
};

export const getHapticSettings = (): HapticSettings => ({ ...currentSettings });

export const setHapticSettings = (next: Partial<HapticSettings>): HapticSettings => {
  currentSettings = {
    ...currentSettings,
    ...next,
    intensity: clamp(next.intensity ?? currentSettings.intensity, 0, 100),
  };
  return getHapticSettings();
};

export const triggerHapticPattern = (pattern: HapticPattern, override?: HapticCardConfig): boolean => {
  const vibrate = getVibrationFn();
  const effective = getEffectiveSettings(override);
  if (!effective.enabled || !vibrate) return false;

  const scaled = scalePattern(BASE_PATTERNS[pattern], effective.intensity);
  if (!scaled.length) return false;

  return vibrate(scaled);
};

export const triggerHapticForAction = (action: Action | undefined, override?: HapticCardConfig): boolean => {
  if (override?.enabled === false) return false;
  const pattern = override?.pattern ?? resolvePatternForAction(action);
  if (!pattern) return false;
  return triggerHapticPattern(pattern, override);
};

export const previewHapticPattern = (pattern: HapticPattern): boolean => {
  return triggerHapticPattern(pattern);
};

export const hasHapticSupport = (): boolean => Boolean(getVibrationFn());

export const getHapticPattern = (pattern: HapticPattern): number[] => [...BASE_PATTERNS[pattern]];
