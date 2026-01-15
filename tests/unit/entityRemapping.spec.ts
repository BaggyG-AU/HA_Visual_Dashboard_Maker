import { describe, it, expect } from 'vitest';
import { entityRemappingService } from '../../src/services/entityRemapping';
import type { DashboardConfig } from '../../src/types/dashboard';
import type { EntityState } from '../../src/services/haWebSocketService';

const sampleConfig: DashboardConfig = {
  title: 'Test',
  views: [
    {
      title: 'Main',
      path: 'main',
      cards: [
        { type: 'button', entity: 'light.lounge' },
        { type: 'sensor', entity: 'sensor.temp_bedroom' },
        {
          type: 'entities',
          entities: [
            'switch.kitchen',
            { entity: 'light.dining_room' }
          ]
        }
      ]
    }
  ],
};

const available: EntityState[] = [
  {
    entity_id: 'light.living_room',
    state: 'on',
    attributes: { friendly_name: 'Living Room Light' },
    last_changed: '', last_updated: '', context: { id: '', parent_id: null, user_id: null }
  },
  {
    entity_id: 'switch.kitchen',
    state: 'off',
    attributes: { friendly_name: 'Kitchen Switch' },
    last_changed: '', last_updated: '', context: { id: '', parent_id: null, user_id: null }
  },
  {
    entity_id: 'sensor.bedroom_temperature',
    state: '21.0',
    attributes: { friendly_name: 'Bedroom Temperature' },
    last_changed: '', last_updated: '', context: { id: '', parent_id: null, user_id: null }
  }
];

describe('entityRemappingService', () => {
  it('extracts entity ids from dashboard config', () => {
    const ids = entityRemappingService.extractEntityIds(sampleConfig);
    expect(ids).toEqual(expect.arrayContaining(['light.lounge', 'sensor.temp_bedroom', 'switch.kitchen', 'light.dining_room']));
  });

  it('detects missing entities', () => {
    const ids = entityRemappingService.extractEntityIds(sampleConfig);
    const missing = entityRemappingService.detectMissing(ids, available);
    expect(missing).toEqual(expect.arrayContaining(['light.lounge', 'sensor.temp_bedroom', 'light.dining_room']));
    expect(missing).not.toContain('switch.kitchen');
  });

  it('scores fuzzy suggestions prioritizing domain and name', () => {
    const suggestions = entityRemappingService.buildSuggestions('sensor.temp_bedroom', available);
    const top = suggestions[0];
    expect(top.entityId).toBe('sensor.bedroom_temperature');
    expect(top.score).toBeGreaterThan(0.6);
  });

  it('applies mappings across config', () => {
    const mapped = entityRemappingService.applyMappings(sampleConfig, [
      { from: 'light.lounge', to: 'light.living_room' },
      { from: 'sensor.temp_bedroom', to: 'sensor.bedroom_temperature' },
    ]);
    const ids = entityRemappingService.extractEntityIds(mapped);
    expect(ids).toContain('light.living_room');
    expect(ids).toContain('sensor.bedroom_temperature');
    expect(ids).not.toContain('light.lounge');
  });
});

