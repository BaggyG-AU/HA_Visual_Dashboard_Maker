/**
 * Integration Test: Dashboard Generator Service
 *
 * Unit tests for the dashboard generator service logic.
 * Tests category filtering, entity selection, and dashboard generation.
 */

import { test, expect } from '@playwright/test';
import {
  dashboardGeneratorService,
  DASHBOARD_CATEGORIES,
  Entity,
} from '../../src/services/dashboardGeneratorService';
import { launchWithDSL, close, TestContext } from '../support';

let ctx: TestContext | null = null;

test.beforeAll(async () => {
  ctx = await launchWithDSL();
  await ctx.appDSL.waitUntilReady();
});

test.afterAll(async () => {
  if (ctx) {
    await close(ctx);
    ctx = null;
  }
});

// NOTE: These are pure service tests already covered by Vitest at tests/unit/dashboard-generator.spec.ts.
// Keep here only as a safety net, but skip in Playwright to avoid false “passes” without UI work.
test.describe.skip('Dashboard Generator Service (covered by unit tests)', () => {
  const mockEntities: Entity[] = [
    // Lights
    { entity_id: 'light.living_room', state: 'on', attributes: { friendly_name: 'Living Room' } },
    { entity_id: 'light.bedroom', state: 'off', attributes: { friendly_name: 'Bedroom' } },
    // Cameras
    { entity_id: 'camera.front_door', state: 'idle', attributes: { friendly_name: 'Front Door' } },
    { entity_id: 'camera.back_yard', state: 'recording', attributes: { friendly_name: 'Back Yard' } },
    // Sensors
    { entity_id: 'sensor.temperature', state: '22', attributes: { device_class: 'temperature', unit_of_measurement: '°C' } },
    { entity_id: 'sensor.power', state: '150', attributes: { device_class: 'power', unit_of_measurement: 'W' } },
    // Climate
    { entity_id: 'climate.thermostat', state: 'heat', attributes: { friendly_name: 'Thermostat' } },
    // Presence
    { entity_id: 'person.john', state: 'home', attributes: { friendly_name: 'John' } },
    { entity_id: 'person.jane', state: 'away', attributes: { friendly_name: 'Jane' } },
    { entity_id: 'device_tracker.phone_john', state: 'home', attributes: { friendly_name: "John's Phone" } },
    // Covers
    { entity_id: 'cover.garage_door', state: 'closed', attributes: { friendly_name: 'Garage Door', device_class: 'garage' } },
    { entity_id: 'cover.living_room_blinds', state: 'open', attributes: { friendly_name: 'Living Room Blinds', device_class: 'shade' } },
    // Security
    { entity_id: 'alarm_control_panel.home', state: 'disarmed', attributes: { friendly_name: 'Home Alarm' } },
    { entity_id: 'lock.front_door', state: 'locked', attributes: { friendly_name: 'Front Door Lock' } },
    { entity_id: 'binary_sensor.front_door', state: 'off', attributes: { device_class: 'door', friendly_name: 'Front Door Sensor' } },
    { entity_id: 'binary_sensor.motion_living', state: 'off', attributes: { device_class: 'motion', friendly_name: 'Living Room Motion' } },
    // Rooms (switches)
    { entity_id: 'switch.coffee_maker', state: 'off', attributes: { friendly_name: 'Coffee Maker' } },
    { entity_id: 'switch.fan', state: 'on', attributes: { friendly_name: 'Fan' } },
    // Media
    { entity_id: 'media_player.living_room_tv', state: 'playing', attributes: { friendly_name: 'Living Room TV' } },
    { entity_id: 'media_player.bedroom_speaker', state: 'idle', attributes: { friendly_name: 'Bedroom Speaker' } },
  ];

  test('should return available categories based on entities', () => {
    const categories = dashboardGeneratorService.getAvailableCategories(mockEntities);

    // Should have all 9 categories
    expect(categories.length).toBe(9);
    expect(categories.some(c => c.id === 'lights')).toBe(true);
    expect(categories.some(c => c.id === 'surveillance')).toBe(true);
    expect(categories.some(c => c.id === 'power')).toBe(true);
    expect(categories.some(c => c.id === 'climate')).toBe(true);
    expect(categories.some(c => c.id === 'presence')).toBe(true);
    expect(categories.some(c => c.id === 'covers')).toBe(true);
    expect(categories.some(c => c.id === 'security')).toBe(true);
    expect(categories.some(c => c.id === 'rooms')).toBe(true);
    expect(categories.some(c => c.id === 'media')).toBe(true);
  });

  test('should return empty array when no entities match any category', () => {
    const emptyEntities: Entity[] = [
      { entity_id: 'unknown.entity', state: 'on', attributes: {} },
    ];

    const categories = dashboardGeneratorService.getAvailableCategories(emptyEntities);
    expect(categories.length).toBe(0);
  });

  test('should filter entities for lights category', () => {
    const lightEntities = dashboardGeneratorService.getEntitiesForCategory('lights', mockEntities);

    expect(lightEntities.length).toBe(2);
    expect(lightEntities.every(e => e.entity_id.startsWith('light.'))).toBe(true);
  });

  test('should filter entities for surveillance category', () => {
    const cameraEntities = dashboardGeneratorService.getEntitiesForCategory('surveillance', mockEntities);

    expect(cameraEntities.length).toBe(2);
    expect(cameraEntities.every(e => e.entity_id.startsWith('camera.'))).toBe(true);
  });

  test('should limit entities to 6 per category', () => {
    const manyLights: Entity[] = Array.from({ length: 10 }, (_, i) => ({
      entity_id: `light.room_${i}`,
      state: 'on',
      attributes: { friendly_name: `Room ${i}` },
    }));

    const filteredLights = dashboardGeneratorService.getEntitiesForCategory('lights', manyLights);
    expect(filteredLights.length).toBe(6);
  });

  test('should sort entities alphabetically by entity_id', () => {
    const unsortedLights: Entity[] = [
      { entity_id: 'light.zebra', state: 'on', attributes: {} },
      { entity_id: 'light.alpha', state: 'on', attributes: {} },
      { entity_id: 'light.beta', state: 'on', attributes: {} },
    ];

    const sorted = dashboardGeneratorService.getEntitiesForCategory('lights', unsortedLights);
    expect(sorted[0].entity_id).toBe('light.alpha');
    expect(sorted[1].entity_id).toBe('light.beta');
    expect(sorted[2].entity_id).toBe('light.zebra');
  });

  test('should generate lights dashboard with correct structure', () => {
    const dashboard = dashboardGeneratorService.generateDashboard('lights', mockEntities);

    expect(dashboard).not.toBeNull();
    expect(dashboard?.title).toBe('Lights Dashboard');
    expect(dashboard?.views).toHaveLength(1);
    expect(dashboard?.views[0].title).toBe('Lights');
    expect(dashboard?.views[0].cards).toHaveLength(2); // 2 light entities
    expect(dashboard?.views[0].cards?.[0].type).toBe('light');
  });

  test('should generate surveillance dashboard with picture-entity cards', () => {
    const dashboard = dashboardGeneratorService.generateDashboard('surveillance', mockEntities);

    expect(dashboard).not.toBeNull();
    expect(dashboard?.title).toBe('Surveillance Dashboard');
    expect(dashboard?.views[0].cards).toHaveLength(2);
    expect(dashboard?.views[0].cards?.[0].type).toBe('picture-entity');
    expect(dashboard?.views[0].cards?.[0].camera_view).toBe('live');
  });

  test('should generate power dashboard with sensor cards', () => {
    const dashboard = dashboardGeneratorService.generateDashboard('power', mockEntities);

    expect(dashboard).not.toBeNull();
    expect(dashboard?.title).toBe('Power Management Dashboard');
    expect(dashboard?.views[0].cards?.[0].type).toBe('sensor');
    expect(dashboard?.views[0].cards?.[0].graph).toBe('line');
  });

  test('should generate climate dashboard with thermostat cards', () => {
    const dashboard = dashboardGeneratorService.generateDashboard('climate', mockEntities);

    expect(dashboard).not.toBeNull();
    expect(dashboard?.title).toBe('Climate Dashboard');
    expect(dashboard?.views[0].cards?.some(c => c.type === 'thermostat')).toBe(true);
  });

  test('should return null when no entities available for category', () => {
    const noLights: Entity[] = [
      { entity_id: 'sensor.temp', state: '22', attributes: {} },
    ];

    const dashboard = dashboardGeneratorService.generateDashboard('lights', noLights);
    expect(dashboard).toBeNull();
  });

  test('should assign grid layout positions to cards', () => {
    const dashboard = dashboardGeneratorService.generateDashboard('lights', mockEntities);

    expect(dashboard?.views[0].cards?.[0].layout).toBeDefined();
    expect(dashboard?.views[0].cards?.[0].layout.x).toBeGreaterThanOrEqual(0);
    expect(dashboard?.views[0].cards?.[0].layout.y).toBeGreaterThanOrEqual(0);
    expect(dashboard?.views[0].cards?.[0].layout.w).toBeGreaterThan(0);
    expect(dashboard?.views[0].cards?.[0].layout.h).toBeGreaterThan(0);
  });

  test('should get correct entity count for category', () => {
    const lightsCount = dashboardGeneratorService.getCategoryEntityCount('lights', mockEntities);
    const surveillanceCount = dashboardGeneratorService.getCategoryEntityCount('surveillance', mockEntities);

    expect(lightsCount).toBe(2);
    expect(surveillanceCount).toBe(2);
  });

  test('all dashboard categories should have required fields', () => {
    DASHBOARD_CATEGORIES.forEach(category => {
      expect(category.id).toBeDefined();
      expect(category.name).toBeDefined();
      expect(category.description).toBeDefined();
      expect(category.icon).toBeDefined();
      expect(category.requiredDomains).toBeDefined();
      expect(category.requiredDomains.length).toBeGreaterThan(0);
      expect(category.helpText).toBeDefined();
    });
  });

  test('should generate presence dashboard with person and tracker entities', () => {
    const dashboard = dashboardGeneratorService.generateDashboard('presence', mockEntities);

    expect(dashboard).not.toBeNull();
    expect(dashboard?.title).toBe('Presence Dashboard');
    expect(dashboard?.views[0].title).toBe('House Status');
    expect(dashboard?.views[0].cards?.length).toBe(3); // 2 persons + 1 tracker
    expect(dashboard?.views[0].cards?.every(c => c.type === 'entities')).toBe(true);
  });

  test('should generate covers dashboard with cover cards', () => {
    const dashboard = dashboardGeneratorService.generateDashboard('covers', mockEntities);

    expect(dashboard).not.toBeNull();
    expect(dashboard?.title).toBe('Covers & Shades Dashboard');
    expect(dashboard?.views[0].title).toBe('Openings');
    expect(dashboard?.views[0].cards?.length).toBe(2);
    expect(dashboard?.views[0].cards?.[0].type).toBe('cover');
  });

  test('should generate security dashboard with alarm, lock, and sensor cards', () => {
    const dashboard = dashboardGeneratorService.generateDashboard('security', mockEntities);

    expect(dashboard).not.toBeNull();
    expect(dashboard?.title).toBe('Security Dashboard');
    expect(dashboard?.views[0].title).toBe('Security');
    expect(dashboard?.views[0].cards?.some(c => c.type === 'alarm-panel')).toBe(true);
    expect(dashboard?.views[0].cards?.some(c => c.type === 'lock')).toBe(true);
    expect(dashboard?.views[0].cards?.some(c => c.type === 'entity')).toBe(true);
  });

  test('should generate rooms dashboard with switch and sensor cards', () => {
    const dashboard = dashboardGeneratorService.generateDashboard('rooms', mockEntities);

    expect(dashboard).not.toBeNull();
    expect(dashboard?.title).toBe('Rooms Dashboard');
    expect(dashboard?.views[0].title).toBe('Rooms');
    expect(dashboard?.views[0].cards?.some(c => c.type === 'switch')).toBe(true);
    expect(dashboard?.views[0].cards?.some(c => c.type === 'sensor')).toBe(true);
  });

  test('should generate media dashboard with media-control cards', () => {
    const dashboard = dashboardGeneratorService.generateDashboard('media', mockEntities);

    expect(dashboard).not.toBeNull();
    expect(dashboard?.title).toBe('Media Dashboard');
    expect(dashboard?.views[0].title).toBe('Entertainment');
    expect(dashboard?.views[0].cards?.length).toBe(2);
    expect(dashboard?.views[0].cards?.[0].type).toBe('media-control');
  });
});
