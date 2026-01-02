import { describe, it, expect } from 'vitest';
import {
  DASHBOARD_CATEGORIES,
  dashboardGeneratorService,
  Entity,
} from '../../src/services/dashboardGeneratorService';
import {
  sampleEntities,
  withExtraLights,
} from './fixtures/entities';

describe('dashboardGeneratorService', () => {
  it('filters available categories by required domains', () => {
    const cats = dashboardGeneratorService.getAvailableCategories(sampleEntities);
    const catIds = cats.map(c => c.id);

    expect(catIds).toContain('lights');
    expect(catIds).toContain('surveillance');
    expect(catIds).toContain('power');
    expect(catIds).toContain('rooms');

    const onlyLights = sampleEntities.filter(e => e.entity_id.startsWith('light.'));
    const lightsOnlyCategories = dashboardGeneratorService.getAvailableCategories(onlyLights);
    expect(lightsOnlyCategories.map(c => c.id)).toEqual(['lights']);
  });

  it('filters entities per category and limits to six sorted alphabetically', () => {
    const entities = withExtraLights(8); // many lights
    const lights = dashboardGeneratorService.getEntitiesForCategory('lights', entities);

    expect(lights.length).toBe(6);
    const sorted = [...lights].sort((a, b) => a.entity_id.localeCompare(b.entity_id));
    expect(lights).toEqual(sorted);
  });

  it('applies power sensor rules by device_class/unit', () => {
    const mixedSensors: Entity[] = [
      {
        entity_id: 'sensor.main_power',
        state: '100',
        attributes: { device_class: 'power', unit_of_measurement: 'W' },
      },
      {
        entity_id: 'sensor.voltage_line',
        state: '110',
        attributes: { device_class: 'voltage', unit_of_measurement: 'V' },
      },
      {
        entity_id: 'sensor.energy_total',
        state: '5',
        attributes: { device_class: 'energy', unit_of_measurement: 'kWh' },
      },
      {
        entity_id: 'sensor.battery_level',
        state: '90',
        attributes: { device_class: 'battery', unit_of_measurement: '%' },
      },
    ];

    const powerEntities = dashboardGeneratorService.getEntitiesForCategory('power', mixedSensors);
    const ids = powerEntities.map(e => e.entity_id);

    expect(ids).toContain('sensor.main_power');
    expect(ids).toContain('sensor.energy_total');
    expect(ids).toContain('sensor.battery_level');
    expect(ids).not.toContain('sensor.voltage_line');
  });

  it('generates dashboards with two-column layout and proper view metadata', () => {
    const entities = withExtraLights(3);
    const config = dashboardGeneratorService.generateDashboard('lights', entities);

    expect(config).not.toBeNull();
    expect(config?.views).toHaveLength(1);
    const view = config?.views[0];
    expect(view.path).toBe('lights');
    expect(Array.isArray((view as any).cards)).toBe(true);

    const cards = (view as any).cards;
    cards.forEach((card: any) => {
      expect([0, 6]).toContain(card.layout.x);
      expect(card.layout.w).toBe(6);
      expect(card.layout.h).toBe(4);
    });

    // y positions should increment every row (2 cards per row)
    const rows = new Map<number, number>();
    cards.forEach((card: any) => {
      rows.set(card.layout.y, (rows.get(card.layout.y) || 0) + 1);
    });
    rows.forEach(countInRow => expect(countInRow).toBeLessThanOrEqual(2));
  });

  it('caps category entity count at six', () => {
    const entities = withExtraLights(12);
    expect(dashboardGeneratorService.getCategoryEntityCount('lights', entities)).toBe(6);
  });

  it('returns null for unsupported categories or missing entities', () => {
    const config = dashboardGeneratorService.generateDashboard('unknown', sampleEntities);
    expect(config).toBeNull();

    const noMatch = dashboardGeneratorService.generateDashboard('surveillance', []);
    expect(noMatch).toBeNull();
  });

  it('keeps category help text and ids in sync with registry', () => {
    const ids = DASHBOARD_CATEGORIES.map(c => c.id);
    expect(ids).toContain('lights');
    expect(ids).toContain('power');
  });
});
