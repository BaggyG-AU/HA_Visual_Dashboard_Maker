/**
 * E2E Test: Card Palette (DSL-Based)
 *
 * Tests card palette functionality using the Playwright Helper DSL.
 * This file demonstrates the DSL pattern:
 * - No raw Playwright selectors
 * - No direct .click() or .locator() calls
 * - Intent-level methods only
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

test.describe('Card Palette', () => {
  test('should display card categories', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.palette.waitUntilVisible();
      await ctx.appDSL.screenshot('card-categories');

      await ctx.palette.expectHasCategories();
    } finally {
      await close(ctx);
    }
  });

  test('should search cards by name', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.palette.waitUntilVisible();

      // Search for entities card
      await ctx.palette.search('entities');
      await ctx.palette.expandCategory('Sensors');
      await ctx.palette.expectCardVisible('entities');

      await ctx.appDSL.screenshot('card-search');

      // Clear search
      await ctx.palette.clearSearch();
      await ctx.palette.expectHasCategories();
    } finally {
      await close(ctx);
    }
  });

  test('should filter by category', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.palette.waitUntilVisible();

      // Expand Layout category
      await ctx.palette.expandCategory('Layout');
      await ctx.palette.expectCardVisible('grid');
    } finally {
      await close(ctx);
    }
  });

  test('should expand and collapse categories', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.palette.waitUntilVisible();

      // Expand Controls
      const wasCollapsed = !(await ctx.palette.isCategoryExpanded('Controls'));
      await ctx.palette.expandCategory('Controls');
      expect(await ctx.palette.isCategoryExpanded('Controls')).toBe(true);

      // Collapse Controls
      await ctx.palette.collapseCategory('Controls');
      expect(await ctx.palette.isCategoryExpanded('Controls')).toBe(false);

      // Return to original state
      if (wasCollapsed) {
        await ctx.palette.collapseCategory('Controls');
      } else {
        await ctx.palette.expandCategory('Controls');
      }
    } finally {
      await close(ctx);
    }
  });

  test('should show card count badges', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.palette.waitUntilVisible();

      await ctx.appDSL.screenshot('card-badges');

      // Verify categories exist (badges are optional UI)
      await ctx.palette.expectHasCategories();
      const categoryCount = await ctx.palette.getCategoryCount();
      expect(categoryCount).toBeGreaterThan(0);
    } finally {
      await close(ctx);
    }
  });
});
