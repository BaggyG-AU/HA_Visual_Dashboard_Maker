import { describe, expect, it } from 'vitest';
import {
  allOff,
  allOn,
  anyOff,
  anyOn,
  averageState,
  buildAggregateSnapshot,
  countOn,
  evaluateAggregateFunction,
  executeBatchAction,
  isDestructiveBatchAction,
  maxState,
  minState,
  normalizeEntityIdList,
  resolveMultiEntityIds,
  summarizeAggregateState,
} from '../../src/services/multiEntity';
import type { EntityStates } from '../../src/services/haWebSocketService';

const states: EntityStates = {
  'light.a': {
    entity_id: 'light.a',
    state: 'on',
    attributes: {},
    last_changed: '2026-02-01T00:00:00.000Z',
    last_updated: '2026-02-01T00:00:00.000Z',
    context: { id: '1', parent_id: null, user_id: null },
  },
  'switch.b': {
    entity_id: 'switch.b',
    state: 'off',
    attributes: {},
    last_changed: '2026-02-01T00:00:00.000Z',
    last_updated: '2026-02-01T00:00:00.000Z',
    context: { id: '2', parent_id: null, user_id: null },
  },
  'sensor.c': {
    entity_id: 'sensor.c',
    state: '11.5',
    attributes: {},
    last_changed: '2026-02-01T00:00:00.000Z',
    last_updated: '2026-02-01T00:00:00.000Z',
    context: { id: '3', parent_id: null, user_id: null },
  },
  'sensor.d': {
    entity_id: 'sensor.d',
    state: '4.5',
    attributes: {},
    last_changed: '2026-02-01T00:00:00.000Z',
    last_updated: '2026-02-01T00:00:00.000Z',
    context: { id: '4', parent_id: null, user_id: null },
  },
};

describe('multiEntity service', () => {
  it('normalizes and resolves entity ids from card config', () => {
    expect(normalizeEntityIdList(['light.a', { entity: 'switch.b' }, { not_entity: true } as unknown as string])).toEqual([
      'light.a',
      'switch.b',
    ]);

    expect(resolveMultiEntityIds({ entity: 'light.a', entities: ['light.a', 'switch.b'] as unknown[] })).toEqual([
      'light.a',
      'switch.b',
    ]);
    expect(resolveMultiEntityIds({ entity: 'light.a', entities: undefined })).toEqual(['light.a']);
  });

  it('evaluates boolean aggregates', () => {
    const ids = ['light.a', 'switch.b'];

    expect(allOn(ids, states)).toBe(false);
    expect(anyOn(ids, states)).toBe(true);
    expect(allOff(ids, states)).toBe(false);
    expect(anyOff(ids, states)).toBe(true);
    expect(countOn(ids, states)).toBe(1);
  });

  it('evaluates numeric aggregates', () => {
    const ids = ['sensor.c', 'sensor.d'];

    expect(averageState(ids, states)).toBe(8);
    expect(minState(ids, states)).toBe(4.5);
    expect(maxState(ids, states)).toBe(11.5);
  });

  it('returns null for numeric aggregates without numeric values', () => {
    const ids = ['light.a', 'switch.b'];
    expect(averageState(ids, states)).toBeNull();
    expect(minState(ids, states)).toBeNull();
    expect(maxState(ids, states)).toBeNull();
  });

  it('supports aggregate function dispatcher and summary', () => {
    const ids = ['light.a', 'switch.b'];

    expect(evaluateAggregateFunction('count_on', ids, states)).toBe(1);
    expect(evaluateAggregateFunction('any_on', ids, states)).toBe(true);
    expect(summarizeAggregateState(ids, states)).toBe('1/2 on');

    const snapshot = buildAggregateSnapshot(ids, states);
    expect(snapshot.total).toBe(2);
    expect(snapshot.available).toBe(2);
    expect(snapshot.onCount).toBe(1);
    expect(snapshot.offCount).toBe(1);
  });

  it('plans and executes batch actions per entity domain', () => {
    const ids = ['light.a', 'switch.b'];

    const turnOff = executeBatchAction('turn_off', ids, states);
    expect(turnOff.operations).toEqual([
      { entityId: 'light.a', service: 'light.turn_off', serviceData: { entity_id: 'light.a' } },
      { entityId: 'switch.b', service: 'switch.turn_off', serviceData: { entity_id: 'switch.b' } },
    ]);

    const toggle = executeBatchAction('toggle', ids, states);
    expect(toggle.operations).toEqual([
      { entityId: 'light.a', service: 'light.turn_off', serviceData: { entity_id: 'light.a' } },
      { entityId: 'switch.b', service: 'switch.turn_on', serviceData: { entity_id: 'switch.b' } },
    ]);

    const customService = executeBatchAction({ type: 'call_service', service: 'homeassistant.toggle' }, ids, states);
    expect(customService.operations[0].service).toBe('homeassistant.toggle');
    expect(customService.operations[1].service).toBe('homeassistant.toggle');
  });

  it('marks destructive batch actions', () => {
    expect(isDestructiveBatchAction('turn_off')).toBe(true);
    expect(isDestructiveBatchAction('toggle')).toBe(false);
    expect(isDestructiveBatchAction({ type: 'set_state', value: 'off' })).toBe(true);
    expect(isDestructiveBatchAction({ type: 'set_state', value: 'on' })).toBe(false);
  });
});
