import { describe, expect, it } from 'vitest';
import {
  attributeEquals,
  attributeGreaterThan,
  attributeLessThan,
  entityExists,
  evaluateVisibilityCondition,
  evaluateVisibilityConditions,
  stateEquals,
  stateIn,
  stateNotEquals,
  stateNotIn,
} from '../../src/services/conditionalVisibility';
import type { EntityStates } from '../../src/services/haWebSocketService';
import type { VisibilityCondition } from '../../src/types/dashboard';

const entityStates: EntityStates = {
  'light.living_room': {
    entity_id: 'light.living_room',
    state: 'on',
    attributes: { brightness: 210, battery: 80, mode: 'day' },
    last_changed: '2026-01-01T00:00:00.000Z',
    last_updated: '2026-01-01T00:00:00.000Z',
    context: { id: '1', parent_id: null, user_id: null },
  },
  'sensor.temperature': {
    entity_id: 'sensor.temperature',
    state: '21.5',
    attributes: { unit_of_measurement: 'C', battery: 55 },
    last_changed: '2026-01-01T00:00:00.000Z',
    last_updated: '2026-01-01T00:00:00.000Z',
    context: { id: '2', parent_id: null, user_id: null },
  },
};

describe('conditionalVisibility service', () => {
  it('evaluates state conditions', () => {
    expect(stateEquals('light.living_room', 'on', entityStates)).toBe(true);
    expect(stateNotEquals('light.living_room', 'off', entityStates)).toBe(true);
    expect(stateIn('light.living_room', ['off', 'on'], entityStates)).toBe(true);
    expect(stateNotIn('light.living_room', ['off', 'idle'], entityStates)).toBe(true);
  });

  it('evaluates attribute conditions', () => {
    expect(attributeEquals('light.living_room', 'mode', 'day', entityStates)).toBe(true);
    expect(attributeGreaterThan('light.living_room', 'battery', 60, entityStates)).toBe(true);
    expect(attributeLessThan('sensor.temperature', 'battery', 60, entityStates)).toBe(true);
  });

  it('evaluates entity existence checks', () => {
    expect(entityExists('light.living_room', entityStates)).toBe(true);
    expect(entityExists('light.missing', entityStates)).toBe(false);
  });

  it('evaluates nested AND/OR condition groups', () => {
    const condition: VisibilityCondition = {
      condition: 'or',
      conditions: [
        {
          condition: 'and',
          conditions: [
            { condition: 'state_equals', entity: 'light.living_room', value: 'on' },
            { condition: 'attribute_greater_than', entity: 'light.living_room', attribute: 'battery', value: 70 },
          ],
        },
        { condition: 'entity_exists', entity: 'switch.nonexistent' },
      ],
    };

    expect(evaluateVisibilityCondition(condition, entityStates)).toBe(true);
  });

  it('defaults to visible when no conditions are configured', () => {
    expect(evaluateVisibilityConditions(undefined, entityStates)).toBe(true);
    expect(evaluateVisibilityConditions([], entityStates)).toBe(true);
  });

  it('evaluates top-level conditions using AND by default', () => {
    const conditions: VisibilityCondition[] = [
      { condition: 'state_equals', entity: 'light.living_room', value: 'on' },
      { condition: 'attribute_greater_than', entity: 'light.living_room', attribute: 'battery', value: 90 },
    ];

    expect(evaluateVisibilityConditions(conditions, entityStates)).toBe(false);
    expect(evaluateVisibilityConditions(conditions, entityStates, 'or')).toBe(true);
  });
});
