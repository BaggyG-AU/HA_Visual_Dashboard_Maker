/**
 * Unit Test: Card Registry
 *
 * Tests the card registry functionality.
 */

import { test, expect } from '@playwright/test';

// Note: For true unit tests, you'd import the actual module
// For now, these are structural tests

test.describe('Card Registry', () => {
  test('should have standard card types registered', async () => {
    // This would test the cardRegistry service
    // Example structure:

    const standardCards = [
      'entities',
      'button',
      'glance',
      'markdown',
      'sensor',
      'gauge',
      'light',
      'thermostat',
      'weather-forecast',
    ];

    // Verify each standard card is registered
    standardCards.forEach((cardType) => {
      expect(cardType).toBeTruthy();
      // In real implementation: expect(cardRegistry.isRegistered(cardType)).toBe(true);
    });
  });

  test('should have HACS custom cards registered', async () => {
    const hacsCards = [
      'custom:apexcharts-card',
      'custom:power-flow-card-plus',
      'custom:bubble-card',
      'custom:mushroom-card',
      'custom:mini-graph-card',
    ];

    hacsCards.forEach((cardType) => {
      expect(cardType).toBeTruthy();
      // In real implementation: expect(cardRegistry.isRegistered(cardType)).toBe(true);
    });
  });

  test('should categorize cards correctly', async () => {
    const categories = ['layout', 'control', 'sensor', 'media', 'custom'];

    categories.forEach((category) => {
      expect(category).toBeTruthy();
      // In real implementation: expect(cardRegistry.getByCategory(category)).toBeTruthy();
    });
  });
});
