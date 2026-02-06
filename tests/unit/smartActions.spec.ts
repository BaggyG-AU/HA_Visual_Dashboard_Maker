import { describe, expect, it } from 'vitest';
import type { Action, Card } from '../../src/types/dashboard';
import { formatActionLabel, getSmartDefaultAction, resolveTapAction } from '../../src/services/smartActions';

describe('smartActions', () => {
  it('maps common domains to expected default actions', () => {
    const cases: Array<{ entity: string; expectAction: Action }> = [
      { entity: 'switch.kitchen', expectAction: { action: 'toggle' } },
      { entity: 'light.living_room', expectAction: { action: 'toggle' } },
      { entity: 'climate.thermostat', expectAction: { action: 'more-info' } },
      { entity: 'sensor.temperature', expectAction: { action: 'more-info' } },
      { entity: 'binary_sensor.motion', expectAction: { action: 'more-info' } },
      { entity: 'cover.garage', expectAction: { action: 'toggle' } },
      {
        entity: 'lock.front_door',
        expectAction: { action: 'call-service', service: 'lock.unlock', service_data: { entity_id: 'lock.front_door' } },
      },
      {
        entity: 'script.good_morning',
        expectAction: { action: 'call-service', service: 'script.turn_on', service_data: { entity_id: 'script.good_morning' } },
      },
      { entity: 'automation.lights', expectAction: { action: 'toggle' } },
      { entity: 'camera.driveway', expectAction: { action: 'more-info' } },
      { entity: 'media_player.tv', expectAction: { action: 'toggle' } },
      { entity: 'fan.bedroom', expectAction: { action: 'toggle' } },
      {
        entity: 'vacuum.roomba',
        expectAction: { action: 'call-service', service: 'vacuum.start', service_data: { entity_id: 'vacuum.roomba' } },
      },
    ];

    for (const testCase of cases) {
      expect(getSmartDefaultAction(testCase.entity)).toEqual(testCase.expectAction);
    }
  });

  it('falls back to more-info for malformed entity ids', () => {
    expect(getSmartDefaultAction('')).toEqual({ action: 'more-info' });
    expect(getSmartDefaultAction('not_an_entity')).toEqual({ action: 'more-info' });
  });

  it('uses user-defined tap_action when present, regardless of smart_defaults', () => {
    const card = {
      type: 'button',
      entity: 'switch.kitchen',
      smart_defaults: true,
      tap_action: { action: 'more-info' },
    } as unknown as Card;

    const result = resolveTapAction(card);
    expect(result.source).toBe('user');
    expect(result.action).toEqual({ action: 'more-info' });
  });

  it('uses smart defaults only when enabled', () => {
    const card = { type: 'button', entity: 'switch.kitchen', smart_defaults: true } as unknown as Card;
    const result = resolveTapAction(card);
    expect(result.source).toBe('smart');
    expect(result.action).toEqual({ action: 'toggle' });
  });

  it('preserves legacy toggle default when smart_defaults is absent (button types only)', () => {
    const button = { type: 'button', entity: 'sensor.temperature' } as unknown as Card;
    const customButton = { type: 'custom:button-card', entity: 'sensor.temperature' } as unknown as Card;
    const sensor = { type: 'sensor', entity: 'sensor.temperature' } as unknown as Card;

    expect(resolveTapAction(button)).toEqual({ action: { action: 'toggle' }, source: 'legacy' });
    expect(resolveTapAction(customButton)).toEqual({ action: { action: 'toggle' }, source: 'legacy' });
    expect(resolveTapAction(sensor)).toEqual({ action: undefined, source: 'none' });
  });

  it('formats action labels for UI preview', () => {
    expect(formatActionLabel({ action: 'toggle' })).toBe('toggle');
    expect(formatActionLabel({ action: 'call-service', service: 'lock.unlock' })).toBe('call-service: lock.unlock');
    expect(formatActionLabel(undefined)).toBe('None');
  });
});

