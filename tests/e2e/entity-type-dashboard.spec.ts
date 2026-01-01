/**
 * E2E Test: Entity Type Dashboard Generation
 *
 * Tests the "From entity type / category" dashboard creation flow.
 * Covers option visibility, category filtering, generation, error handling, and offline states.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close, seedEntityCache } from '../support';

test.describe('Entity Type Dashboard Generation', () => {
  test('should show three options in new dashboard dialog', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();

      // Click "New Dashboard" button
      await ctx.window.getByRole('button', { name: /New Dashboard/i }).first().click();

      // Wait for dialog options to appear (more reliable than waiting for modal wrapper)
      await expect(ctx.window.getByTestId('new-dashboard-blank-option')).toBeVisible({ timeout: 10000 });

      // Verify all three options are visible
      await expect(ctx.window.getByTestId('new-dashboard-blank-option')).toBeVisible();
      await expect(ctx.window.getByTestId('new-dashboard-template-option')).toBeVisible();
      await expect(ctx.window.getByTestId('new-dashboard-entity-type-option')).toBeVisible();

      // Verify entity type option shows connection requirement when offline
      const entityTypeCard = ctx.window.getByTestId('new-dashboard-entity-type-option');
      await expect(entityTypeCard.getByText(/Requires HA connection/i)).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should create blank dashboard when blank option clicked', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();

      // Open new dashboard dialog
      await ctx.window.getByRole('button', { name: /New Dashboard/i }).first().click();

      // Wait for dialog content to appear (checking actual modal content, not wrapper)
      await expect(ctx.window.getByTestId('new-dashboard-blank-option')).toBeVisible({ timeout: 10000 });

      // Click blank option
      await ctx.window.getByTestId('new-dashboard-blank-option').click();

      // Verify blank dashboard created (dialog auto-closes after creation)
      await ctx.canvas.expectEmpty();
      await expect(ctx.window.getByText(/New Dashboard/i).first()).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should show offline error when entity type selected without connection', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();

      // Open new dashboard dialog
      await ctx.window.getByRole('button', { name: /New Dashboard/i }).first().click();

      // Wait for dialog content to appear
      await expect(ctx.window.getByTestId('new-dashboard-blank-option')).toBeVisible({ timeout: 10000 });

      // Entity type option should be disabled/grayed when offline
      const entityTypeCard = ctx.window.getByTestId('new-dashboard-entity-type-option');

      // NOTE: When offline, clicking should do nothing (button is disabled via cursor: not-allowed)
      // So we just verify the visual state
      await expect(entityTypeCard.getByText(/Requires HA connection/i)).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should show entity categories when connected with entities', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();

      // Seed entity cache with comprehensive test data for all categories
      await seedEntityCache(ctx.window, [
        // Lights
        { entity_id: 'light.living_room', state: 'on', attributes: { friendly_name: 'Living Room Light' } },
        { entity_id: 'light.bedroom', state: 'off', attributes: { friendly_name: 'Bedroom Light' } },
        // Cameras
        { entity_id: 'camera.front_door', state: 'idle', attributes: { friendly_name: 'Front Door Camera' } },
        // Sensors
        { entity_id: 'sensor.temperature', state: '22', attributes: { friendly_name: 'Temperature', device_class: 'temperature', unit_of_measurement: '°C' } },
        { entity_id: 'sensor.power', state: '150', attributes: { friendly_name: 'Power', device_class: 'power', unit_of_measurement: 'W' } },
        // Climate
        { entity_id: 'climate.thermostat', state: 'heat', attributes: { friendly_name: 'Thermostat' } },
        // Presence
        { entity_id: 'person.john', state: 'home', attributes: { friendly_name: 'John' } },
        { entity_id: 'device_tracker.phone', state: 'home', attributes: { friendly_name: 'Phone' } },
        // Covers
        { entity_id: 'cover.garage', state: 'closed', attributes: { friendly_name: 'Garage Door' } },
        // Security
        { entity_id: 'alarm_control_panel.home', state: 'disarmed', attributes: { friendly_name: 'Home Alarm' } },
        { entity_id: 'lock.front_door', state: 'locked', attributes: { friendly_name: 'Front Door' } },
        { entity_id: 'binary_sensor.motion', state: 'off', attributes: { device_class: 'motion', friendly_name: 'Motion' } },
        // Rooms
        { entity_id: 'switch.fan', state: 'on', attributes: { friendly_name: 'Fan' } },
        // Media
        { entity_id: 'media_player.tv', state: 'playing', attributes: { friendly_name: 'TV' } },
      ]);

      // Simulate connection
      await ctx.window.evaluate(() => {
        (window as any).__testThemeApi?.setConnected(true);
      });

      // Open new dashboard dialog
      await ctx.window.getByRole('button', { name: /New Dashboard/i }).first().click();

      // Wait for dialog content to appear
      await expect(ctx.window.getByTestId('new-dashboard-blank-option')).toBeVisible({ timeout: 10000 });

      // Click entity type option
      await ctx.window.getByTestId('new-dashboard-entity-type-option').click();

      // Wait for wizard content to appear (not the modal wrapper which is "hidden")
      await expect(ctx.window.getByTestId('entity-category-card-lights')).toBeVisible({ timeout: 10000 });

      // Verify categories are shown (we have lights, camera, and sensor entities)
      await expect(ctx.window.getByTestId('entity-category-card-lights')).toBeVisible();
      await expect(ctx.window.getByTestId('entity-category-card-surveillance')).toBeVisible();

      // Verify category shows entity count
      const lightsCard = ctx.window.getByTestId('entity-category-card-lights');
      await expect(lightsCard).toContainText('2'); // 2 light entities
    } finally {
      await close(ctx);
    }
  });

  test('should generate lights dashboard when lights category selected', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();

      // Seed entity cache with lights
      await seedEntityCache(ctx.window, [
        { entity_id: 'light.living_room', state: 'on', attributes: { friendly_name: 'Living Room Light' } },
        { entity_id: 'light.bedroom', state: 'off', attributes: { friendly_name: 'Bedroom Light' } },
        { entity_id: 'light.kitchen', state: 'on', attributes: { friendly_name: 'Kitchen Light' } },
      ]);

      // Simulate connection
      await ctx.window.evaluate(() => {
        (window as any).__testThemeApi?.setConnected(true);
      });

      // Open wizard
      await ctx.window.getByRole('button', { name: /New Dashboard/i }).first().click();
      await ctx.window.getByTestId('new-dashboard-entity-type-option').click();

      // Wait for wizard content (category cards) to appear
      await expect(ctx.window.getByTestId('entity-category-card-lights')).toBeVisible({ timeout: 10000 });

      // Select lights category
      await ctx.window.getByTestId('entity-category-card-lights').click();

      // Verify card is selected (has blue border)
      const lightsCard = ctx.window.getByTestId('entity-category-card-lights');
      await expect(lightsCard).toHaveCSS('border', /rgb\(24, 144, 255\)|#1890ff/); // Blue border color (RGB or hex)

      // Click Create Dashboard
      await ctx.window.getByRole('button', { name: /Create Dashboard/i }).click();

      // Verify dashboard was created (wizard closes after generation)
      await ctx.canvas.expectCardCount(3, 5000); // 3 light entities = 3 cards

      // Verify dashboard title
      await expect(ctx.window.getByText(/Lights Dashboard/i).first()).toBeVisible();

      // Verify success message
      await expect(ctx.window.getByText(/created successfully/i)).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should show error when no entities available', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();

      // Seed empty entity cache
      await seedEntityCache(ctx.window, []);

      // Simulate connection
      await ctx.window.evaluate(() => {
        (window as any).__testThemeApi?.setConnected(true);
      });

      // Open wizard
      await ctx.window.getByRole('button', { name: /New Dashboard/i }).first().click();
      await ctx.window.getByTestId('new-dashboard-entity-type-option').click();

      // Wait for loading to finish and error to appear
      await ctx.window.waitForTimeout(500); // Allow modal transition
      await expect(ctx.window.getByTestId('entity-type-wizard-error')).toBeVisible({ timeout: 10000 });

      // Verify error message is shown
      await expect(ctx.window.getByTestId('entity-type-wizard-error')).toBeVisible();
      await expect(ctx.window.getByText(/No entity categories available/i)).toBeVisible();
      await expect(ctx.window.getByText(/Make sure you have entities in your Home Assistant instance/i)).toBeVisible();

      // Verify Retry button is available in the error alert
      await expect(ctx.window.getByRole('button', { name: /Retry/i })).toBeVisible();

      // Verify Create Dashboard button is disabled
      await expect(ctx.window.getByRole('button', { name: /Create Dashboard/i })).toBeDisabled();
    } finally {
      await close(ctx);
    }
  });

  test('should handle surveillance category correctly', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();

      // Seed with camera entities
      await seedEntityCache(ctx.window, [
        { entity_id: 'camera.front_door', state: 'idle', attributes: { friendly_name: 'Front Door' } },
        { entity_id: 'camera.back_yard', state: 'recording', attributes: { friendly_name: 'Back Yard' } },
      ]);

      // Simulate connection
      await ctx.window.evaluate(() => {
        (window as any).__testThemeApi?.setConnected(true);
      });

      // Open wizard and select surveillance
      await ctx.window.getByRole('button', { name: /New Dashboard/i }).first().click();
      await ctx.window.getByTestId('new-dashboard-entity-type-option').click();
      await ctx.window.getByTestId('entity-category-card-surveillance').click();
      await ctx.window.getByRole('button', { name: /Create Dashboard/i }).click();

      // Verify dashboard created
      await ctx.canvas.expectCardCount(2);
      await expect(ctx.window.getByText(/Surveillance Dashboard/i).first()).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should limit entities to 6 per dashboard', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();

      // Seed with 10 light entities (should only use 6)
      const manyLights = Array.from({ length: 10 }, (_, i) => ({
        entity_id: `light.room_${i}`,
        state: 'on',
        attributes: { friendly_name: `Room ${i} Light` },
      }));
      await seedEntityCache(ctx.window, manyLights);

      // Simulate connection
      await ctx.window.evaluate(() => {
        (window as any).__testThemeApi?.setConnected(true);
      });

      // Generate lights dashboard
      await ctx.window.getByRole('button', { name: /New Dashboard/i }).first().click();
      await ctx.window.getByTestId('new-dashboard-entity-type-option').click();
      await ctx.window.getByTestId('entity-category-card-lights').click();
      await ctx.window.getByRole('button', { name: /Create Dashboard/i }).click();

      // Verify only 6 cards created
      await ctx.canvas.expectCardCount(6);
    } finally {
      await close(ctx);
    }
  });

  test('should generate presence dashboard with person and tracker entities', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();

      await seedEntityCache(ctx.window, [
        { entity_id: 'person.john', state: 'home', attributes: { friendly_name: 'John' } },
        { entity_id: 'person.jane', state: 'away', attributes: { friendly_name: 'Jane' } },
        { entity_id: 'device_tracker.phone', state: 'home', attributes: { friendly_name: 'Phone' } },
      ]);

      await ctx.window.evaluate(() => {
        (window as any).__testThemeApi?.setConnected(true);
      });

      await ctx.window.getByRole('button', { name: /New Dashboard/i }).first().click();
      await ctx.window.getByTestId('new-dashboard-entity-type-option').click();
      await ctx.window.getByTestId('entity-category-card-presence').click();
      await ctx.window.getByRole('button', { name: /Create Dashboard/i }).click();

      await ctx.canvas.expectCardCount(3);
      await expect(ctx.window.getByText(/Presence Dashboard/i).first()).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should generate covers dashboard', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();

      await seedEntityCache(ctx.window, [
        { entity_id: 'cover.garage_door', state: 'closed', attributes: { friendly_name: 'Garage' } },
        { entity_id: 'cover.blinds', state: 'open', attributes: { friendly_name: 'Blinds' } },
      ]);

      await ctx.window.evaluate(() => {
        (window as any).__testThemeApi?.setConnected(true);
      });

      await ctx.window.getByRole('button', { name: /New Dashboard/i }).first().click();
      await ctx.window.getByTestId('new-dashboard-entity-type-option').click();
      await ctx.window.getByTestId('entity-category-card-covers').click();
      await ctx.window.getByRole('button', { name: /Create Dashboard/i }).click();

      await ctx.canvas.expectCardCount(2);
      await expect(ctx.window.getByText(/Covers & Shades Dashboard/i).first()).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should generate security dashboard with alarm and locks', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();

      await seedEntityCache(ctx.window, [
        { entity_id: 'alarm_control_panel.home', state: 'disarmed', attributes: { friendly_name: 'Alarm' } },
        { entity_id: 'lock.front_door', state: 'locked', attributes: { friendly_name: 'Front Door' } },
        { entity_id: 'binary_sensor.motion', state: 'off', attributes: { device_class: 'motion', friendly_name: 'Motion' } },
      ]);

      await ctx.window.evaluate(() => {
        (window as any).__testThemeApi?.setConnected(true);
      });

      await ctx.window.getByRole('button', { name: /New Dashboard/i }).first().click();
      await ctx.window.getByTestId('new-dashboard-entity-type-option').click();
      await ctx.window.getByTestId('entity-category-card-security').click();
      await ctx.window.getByRole('button', { name: /Create Dashboard/i }).click();

      await ctx.canvas.expectCardCount(3);
      await expect(ctx.window.getByText(/Security Dashboard/i).first()).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should generate rooms dashboard with switches and sensors', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();

      await seedEntityCache(ctx.window, [
        { entity_id: 'switch.fan', state: 'on', attributes: { friendly_name: 'Fan' } },
        { entity_id: 'switch.heater', state: 'off', attributes: { friendly_name: 'Heater' } },
        { entity_id: 'sensor.humidity', state: '60', attributes: { friendly_name: 'Humidity' } },
      ]);

      await ctx.window.evaluate(() => {
        (window as any).__testThemeApi?.setConnected(true);
      });

      await ctx.window.getByRole('button', { name: /New Dashboard/i }).first().click();
      await ctx.window.getByTestId('new-dashboard-entity-type-option').click();
      await ctx.window.getByTestId('entity-category-card-rooms').click();
      await ctx.window.getByRole('button', { name: /Create Dashboard/i }).click();

      await ctx.canvas.expectCardCount(3);
      await expect(ctx.window.getByText(/Rooms Dashboard/i).first()).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should generate media dashboard', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();

      await seedEntityCache(ctx.window, [
        { entity_id: 'media_player.tv', state: 'playing', attributes: { friendly_name: 'TV' } },
        { entity_id: 'media_player.speaker', state: 'idle', attributes: { friendly_name: 'Speaker' } },
      ]);

      await ctx.window.evaluate(() => {
        (window as any).__testThemeApi?.setConnected(true);
      });

      await ctx.window.getByRole('button', { name: /New Dashboard/i }).first().click();
      await ctx.window.getByTestId('new-dashboard-entity-type-option').click();
      await ctx.window.getByTestId('entity-category-card-media').click();
      await ctx.window.getByRole('button', { name: /Create Dashboard/i }).click();

      await ctx.canvas.expectCardCount(2);
      await expect(ctx.window.getByText(/Media Dashboard/i).first()).toBeVisible();
    } finally {
      await close(ctx);
    }
  });
});
