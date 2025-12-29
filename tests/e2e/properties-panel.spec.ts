/**
 * E2E Test: Properties Panel (DSL-Based)
 *
 * Tests property editing using the Playwright Helper DSL.
 * Zero raw selectors - pure intent-level workflow testing.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

test.describe('Properties Panel', () => {
  test('should not render panel when no card is selected', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.properties.expectHidden();
    } finally {
      await close(ctx);
    }
  });

  test('should show properties when card is selected', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.canvas.selectCard(0);

      await ctx.properties.expectVisible();
      await ctx.properties.expectFormFields();
    } finally {
      await close(ctx);
    }
  });

  test('should show card type in properties panel', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.canvas.selectCard(0);

      await ctx.properties.expectCardType('button');
    } finally {
      await close(ctx);
    }
  });

  test('should edit button card name property', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.canvas.selectCard(0);

      await ctx.properties.setCardName('Test Button');
      const name = await ctx.properties.getCardName();
      expect(name).toBe('Test Button');
    } finally {
      await close(ctx);
    }
  });

  test('should allow switching between Form and YAML tabs', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.canvas.selectCard(0);

      await ctx.properties.expectVisible();
      await ctx.properties.expectActiveTab('Form');

      // Switch to YAML tab
      await ctx.properties.switchTab('YAML');
      await ctx.properties.expectActiveTab('YAML');
      await ctx.properties.expectYamlEditor();

      // Switch back to Form
      await ctx.properties.switchTab('Form');
      await ctx.properties.expectActiveTab('Form');
      await ctx.properties.expectFormFields();
    } finally {
      await close(ctx);
    }
  });

  test('should persist property changes when switching tabs', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.canvas.selectCard(0);

      // Edit name in Form tab
      await ctx.properties.setCardName('Persistent Button');

      // Switch to YAML and back
      await ctx.properties.switchTab('YAML');
      await ctx.properties.switchTab('Form');

      // Verify value persisted
      const name = await ctx.properties.getCardName();
      expect(name).toBe('Persistent Button');
    } finally {
      await close(ctx);
    }
  });
});
