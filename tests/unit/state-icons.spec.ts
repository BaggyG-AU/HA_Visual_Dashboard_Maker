import { describe, expect, it } from 'vitest';
import { getStateIcon, normalizeStateIconMapping } from '../../src/services/stateIcons';

describe('stateIcons service', () => {
  it('prioritizes user-defined mapping over domain defaults', () => {
    const resolved = getStateIcon({
      entityId: 'light.kitchen',
      state: 'on',
      stateIcons: {
        on: {
          icon: 'mdi:star',
          color: '#ff00ff',
        },
      },
    });

    expect(resolved).toEqual({
      icon: 'mdi:star',
      color: '#ff00ff',
      source: 'user',
    });
  });

  it('uses user default mapping when exact state is not present', () => {
    const resolved = getStateIcon({
      entityId: 'switch.office',
      state: 'unknown_state',
      stateIcons: {
        default: {
          icon: 'mdi:power-plug-outline',
          color: '#123456',
        },
      },
    });

    expect(resolved).toEqual({
      icon: 'mdi:power-plug-outline',
      color: '#123456',
      source: 'user',
    });
  });

  it('uses domain defaults when user mapping is missing', () => {
    const resolved = getStateIcon({
      entityId: 'climate.living_room',
      state: 'cool',
    });

    expect(resolved.icon).toBe('mdi:snowflake');
    expect(resolved.color).toBe('#2196F3');
    expect(resolved.source).toBe('domain');
  });

  it('supports binary_sensor device class defaults', () => {
    const openDoor = getStateIcon({
      entityId: 'binary_sensor.front_door',
      state: 'on',
      entityAttributes: { device_class: 'door' },
    });
    const closedWindow = getStateIcon({
      entityId: 'binary_sensor.office_window',
      state: 'off',
      entityAttributes: { device_class: 'window' },
    });

    expect(openDoor.icon).toBe('mdi:door-open');
    expect(closedWindow.icon).toBe('mdi:window-closed');
  });

  it('falls back to generic icon when no domain mapping exists', () => {
    const resolved = getStateIcon({
      entityId: 'custom_domain.thing',
      state: 'active',
    });

    expect(resolved).toEqual({
      icon: 'mdi:help-circle-outline',
      source: 'generic',
    });
  });

  it('includes domain mappings for common domains (12+)', () => {
    const examples: Array<{ entityId: string; state: string; expected: string }> = [
      { entityId: 'light.kitchen', state: 'on', expected: 'mdi:lightbulb' },
      { entityId: 'switch.pump', state: 'off', expected: 'mdi:toggle-switch-off' },
      { entityId: 'input_boolean.mode', state: 'on', expected: 'mdi:check-circle-outline' },
      { entityId: 'binary_sensor.motion', state: 'on', expected: 'mdi:radiobox-marked' },
      { entityId: 'lock.front_door', state: 'locked', expected: 'mdi:lock' },
      { entityId: 'cover.blinds', state: 'open', expected: 'mdi:window-shutter-open' },
      { entityId: 'climate.hvac', state: 'heat', expected: 'mdi:fire' },
      { entityId: 'fan.bedroom', state: 'on', expected: 'mdi:fan' },
      { entityId: 'media_player.tv', state: 'playing', expected: 'mdi:play-circle' },
      { entityId: 'person.micah', state: 'home', expected: 'mdi:home-account' },
      { entityId: 'alarm_control_panel.house', state: 'armed_home', expected: 'mdi:shield-home-outline' },
      { entityId: 'camera.driveway', state: 'streaming', expected: 'mdi:video' },
      { entityId: 'vacuum.robovac', state: 'cleaning', expected: 'mdi:robot-vacuum' },
      { entityId: 'sun.sun', state: 'above_horizon', expected: 'mdi:white-balance-sunny' },
      { entityId: 'weather.home', state: 'rainy', expected: 'mdi:weather-rainy' },
    ];

    for (const example of examples) {
      const resolved = getStateIcon({ entityId: example.entityId, state: example.state });
      expect(resolved.icon).toBe(example.expected);
      expect(resolved.source).toBe('domain');
    }
  });

  it('normalizes shorthand and object mappings', () => {
    const normalized = normalizeStateIconMapping({
      ON: 'mdi:lightbulb',
      Off: {
        icon: 'mdi:lightbulb-outline',
        color: '#222222',
      },
      empty: {
        icon: '   ',
      },
    });

    expect(normalized).toEqual({
      on: { icon: 'mdi:lightbulb' },
      off: { icon: 'mdi:lightbulb-outline', color: '#222222', size: undefined },
    });
  });
});
