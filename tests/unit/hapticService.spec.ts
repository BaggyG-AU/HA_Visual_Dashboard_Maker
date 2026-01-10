import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getHapticPattern,
  getHapticSettings,
  setHapticSettings,
  triggerHapticForAction,
  triggerHapticPattern,
} from '../../src/services/hapticService';

describe('hapticService', () => {
  beforeEach(() => {
    setHapticSettings({ enabled: false, intensity: 100 });
  });

  it('returns immutable base patterns', () => {
    const pattern = getHapticPattern('double');
    expect(pattern).toEqual([10, 30, 10]);
    pattern.push(99);
    expect(getHapticPattern('double')).toEqual([10, 30, 10]);
  });

  it('does not vibrate when disabled', () => {
    const mock = vi.fn().mockReturnValue(true);
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: mock },
      configurable: true,
    });

    const result = triggerHapticPattern('light');
    expect(result).toBe(false);
    expect(mock).not.toHaveBeenCalled();
  });

  it('scales patterns by intensity', () => {
    const mock = vi.fn().mockReturnValue(true);
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: mock },
      configurable: true,
    });

    setHapticSettings({ enabled: true, intensity: 50 });
    const result = triggerHapticPattern('medium');
    expect(result).toBe(true);
    expect(mock).toHaveBeenCalledWith([13]);
  });

  it('resolves action defaults for haptics', () => {
    const mock = vi.fn().mockReturnValue(true);
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: mock },
      configurable: true,
    });

    setHapticSettings({ enabled: true, intensity: 100 });
    const result = triggerHapticForAction({ action: 'toggle' });
    expect(result).toBe(true);
    expect(mock).toHaveBeenCalledWith([25]);
  });

  it('stores haptic settings updates', () => {
    setHapticSettings({ enabled: true, intensity: 80 });
    expect(getHapticSettings()).toEqual({ enabled: true, intensity: 80 });
  });
});
