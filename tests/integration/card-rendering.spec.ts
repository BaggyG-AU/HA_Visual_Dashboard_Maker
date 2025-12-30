/**
 * Integration Test: Card Rendering (DSL + mocks)
 *
 * Verifies that common cards render on the canvas using the shared DSL and
 * mocked HA entities (no real HA connection required).
 */

import { test } from '@playwright/test';
import { launchWithDSL, close } from '../support';
import { mockHAEntities, createMockEntities } from '../helpers/mockHelpers';

test.describe('Card Rendering', () => {
  test.beforeEach(async ({}, testInfo) => {
    // nothing global; per-test setup happens inside each test to keep isolation
  });

  test('should render entities card with mock entities', async () => {
    const ctx = await launchWithDSL();
    try {
      // Mock HA entities to keep UI in "connected" state
      await mockHAEntities(ctx.window, ctx.app, { entities: createMockEntities(4), isConnected: true });

      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      // Match working pattern: expand Sensors category before adding card
      await ctx.palette.expandCategory('Sensors');
      await ctx.palette.addCard('entities');
      await ctx.canvas.expectCardCount(1);

      await ctx.canvas.selectCard(0);
      await ctx.properties.expectVisible();
      await ctx.properties.expectCardType(/entities/i);
    } finally {
      await close(ctx);
    }
  });

  test('should render glance card with mock entities', async () => {
    const ctx = await launchWithDSL();
    try {
      await mockHAEntities(ctx.window, ctx.app, { entities: createMockEntities(4), isConnected: true });

      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await ctx.palette.expandCategory('Sensors');
      await ctx.palette.addCard('glance');
      await ctx.canvas.expectCardCount(1);

      await ctx.canvas.selectCard(0);
      await ctx.properties.expectVisible();
      await ctx.properties.expectCardType(/glance/i);
    } finally {
      await close(ctx);
    }
  });

  test('should render button card', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(1);

      await ctx.canvas.selectCard(0);
      await ctx.properties.expectVisible();
      await ctx.properties.expectCardType(/button/i);
    } finally {
      await close(ctx);
    }
  });
});
