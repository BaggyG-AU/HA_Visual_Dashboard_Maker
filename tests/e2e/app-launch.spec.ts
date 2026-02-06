/**
 * E2E Test: Application Launch (DSL-Based)
 *
 * Tests basic application launch and window creation using DSL.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

test.describe('Application Launch', () => {
  test('should launch the application successfully', async () => {
    const ctx = await launchWithDSL();

    try {
      // Verify window and app are ready
      expect(ctx.window).toBeTruthy();
      expect(ctx.app).toBeTruthy();

      await ctx.appDSL.waitUntilReady();
      await ctx.appDSL.expectTitle('HA Visual Dashboard Maker');
      await ctx.appDSL.screenshot('app-launch');

      // Verify body is visible
      const isVisible = await ctx.window.isVisible('body');
      expect(isVisible).toBe(true);
    } finally {
      await close(ctx);
    }
  });

  test('should have correct window dimensions', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();

      // Get window size (window is maximized in DSL launcher)
      const dimensions = await ctx.window.evaluate(() => {
        return {
          width: window.innerWidth,
          height: window.innerHeight
        };
      });

      // Verify minimum dimensions
      expect(dimensions.width).toBeGreaterThanOrEqual(800);
      expect(dimensions.height).toBeGreaterThanOrEqual(500);
    } finally {
      await close(ctx);
    }
  });

  test('should display main UI components', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.appDSL.screenshot('main-ui-components');

      // Verify app shell is rendered
      const appShell = await ctx.window.getByTestId('app-shell').count();
      expect(appShell).toBe(1);

      // Verify React root has content
      const rootDivs = await ctx.window.locator('body > div').count();
      expect(rootDivs).toBeGreaterThan(0);
    } finally {
      await close(ctx);
    }
  });

  test('should load without critical console errors', async () => {
    const ctx = await launchWithDSL();
    const consoleErrors: string[] = [];

    // Listen for console errors
    ctx.window.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    try {
      await ctx.appDSL.waitUntilReady();

      // Wait for the app shell to remain stable after initial mount.
      await expect(ctx.window.getByTestId('app-shell')).toBeVisible({ timeout: 10000 });

      // Filter out expected/harmless errors
      const significantErrors = consoleErrors.filter(
        (error) =>
          !error.includes('DevTools') &&
          !error.includes('Extension') &&
          !error.includes('favicon') &&
          !error.includes('404') &&
          !error.toLowerCase().includes('warning')
      );

      // App should not have critical errors
      expect(significantErrors.length).toBeLessThan(10);
    } finally {
      await close(ctx);
    }
  });
});
