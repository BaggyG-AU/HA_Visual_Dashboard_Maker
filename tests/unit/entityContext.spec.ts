import { describe, expect, it } from 'vitest';
import {
  parseEntityContextVariables,
  resolveEntityContext,
  hasEntityContextVariables,
  extractEntityReferences,
} from '../../src/services/entityContext';
import type { EntityStates } from '../../src/services/haWebSocketService';

const entities: EntityStates = {
  'light.living_room': {
    entity_id: 'light.living_room',
    state: 'on',
    attributes: { friendly_name: 'Living Room Light', battery: 97.4 },
    last_changed: '2026-01-14T10:00:00.000Z',
    last_updated: '2026-01-14T10:05:00.000Z',
    context: { id: '1', parent_id: null, user_id: null },
  },
  'sensor.temperature': {
    entity_id: 'sensor.temperature',
    state: '22.56',
    attributes: { friendly_name: 'Temperature', unit_of_measurement: 'C' },
    last_changed: '2026-01-14T09:00:00.000Z',
    last_updated: '2026-01-14T09:05:00.000Z',
    context: { id: '2', parent_id: null, user_id: null },
  },
};

describe('entityContext', () => {
  it('parses context variables', () => {
    const vars = parseEntityContextVariables('Hello [[entity.state]] and {{entity.domain}}');
    expect(vars).toHaveLength(2);
    expect(vars[0].raw).toBe('[[entity.state]]');
    expect(vars[1].raw).toBe('{{entity.domain}}');
  });

  it('detects context variables', () => {
    expect(hasEntityContextVariables('No variables')).toBe(false);
    expect(hasEntityContextVariables('[[entity.state]]')).toBe(true);
  });

  it('resolves default entity properties', () => {
    const template = 'State: [[entity.state]] | [[entity.friendly_name]] | [[entity.domain]] | [[entity.entity_id]]';
    const result = resolveEntityContext(template, 'light.living_room', entities);
    expect(result).toBe('State: on | Living Room Light | light | light.living_room');
  });

  it('resolves attributes and timestamps', () => {
    const template = 'Battery [[entity.attributes.battery]] @ [[entity.last_updated]]';
    const result = resolveEntityContext(template, 'light.living_room', entities);
    expect(result).toBe('Battery 97.4 @ 2026-01-14T10:05:00.000Z');
  });

  it('supports explicit entity references', () => {
    const template = 'Temp [[sensor.temperature.state]]°C';
    const result = resolveEntityContext(template, 'light.living_room', entities);
    expect(result).toBe('Temp 22.56°C');
  });

  it('supports entity_id shorthand', () => {
    const template = 'ID [[entity_id]]';
    const result = resolveEntityContext(template, 'light.living_room', entities);
    expect(result).toBe('ID light.living_room');
  });

  it('handles missing properties gracefully', () => {
    const template = 'Missing [[entity.attributes.not_here]]';
    const result = resolveEntityContext(template, 'light.living_room', entities);
    expect(result).toBe('Missing ');
  });

  it('applies formatting filters', () => {
    const template = 'State [[entity.state|upper]] temp [[sensor.temperature.state|round(1)]] default [[entity.attributes.none|default("n/a")]]';
    const result = resolveEntityContext(template, 'light.living_room', entities);
    expect(result).toBe('State ON temp 22.6 default n/a');
  });

  it('extracts entity references', () => {
    const refs = extractEntityReferences('[[light.living_room.state]] [[entity.state]]', 'sensor.temperature');
    expect(refs.sort()).toEqual(['light.living_room', 'sensor.temperature']);
  });
});
