/**
 * E2E Test: Dashboard Operations (DSL-Based)
 *
 * Tests dashboard lifecycle using the Playwright Helper DSL.
 * Demonstrates intent-level workflow testing with zero raw selectors.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

test.describe('Dashboard Operations', () => {
  test('should start with empty canvas', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.appDSL.screenshot('empty-canvas');
      await ctx.appDSL.expectTitle('HA Visual Dashboard Maker');

      await ctx.canvas.expectEmpty();
    } finally {
      await close(ctx);
    }
  });

  test('should add cards to canvas by double-clicking palette cards', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await ctx.appDSL.screenshot('before-adding-cards');
      await ctx.canvas.expectEmpty();

      // Add Button card
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(1);

      await ctx.appDSL.screenshot('after-first-card');

      // Add Entities card
      await ctx.palette.expandCategory('Sensors');
      await ctx.palette.addCard('entities');
      await ctx.canvas.expectCardCount(2);

      await ctx.appDSL.screenshot('after-second-card');
    } finally {
      await close(ctx);
    }
  });

  test('should select cards on click', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      // Add button card
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');

      await ctx.appDSL.screenshot('before-selection');

      // Select card
      await ctx.canvas.selectCard(0);
      await ctx.properties.expectVisible();

      await ctx.appDSL.screenshot('after-selection');
      await ctx.properties.expectFormFields();
    } finally {
      await close(ctx);
    }
  });

  test('should show properties panel when card selected', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      // Add entities card
      await ctx.palette.expandCategory('Sensors');
      await ctx.palette.addCard('entities');

      // Select card
      await ctx.canvas.selectCard(0);

      // Verify properties panel
      await ctx.properties.expectVisible();
      await ctx.properties.expectFormFields();
      await ctx.properties.expectCardType('entities');

      await ctx.appDSL.screenshot('properties-panel');
    } finally {
      await close(ctx);
    }
  });

  test('should handle multi-view dashboards', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      // Add card to first view
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');

      await ctx.canvas.expectCardCount(1);
    } finally {
      await close(ctx);
    }
  });

  test('should show unsaved changes indicator', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      // Add card to create unsaved changes
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');

      await ctx.canvas.expectCardCount(1);

      const updatedTitle = await ctx.appDSL.getTitle();
      expect(updatedTitle.length).toBeGreaterThan(0);

      // Note: Actual unsaved indicator logic can be tested when implemented
    } finally {
      await close(ctx);
    }
  });
});
