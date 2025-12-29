/**
 * Theme Integration Tests (Mocked IPC)
 *
 * Validates that our IPC mocks respond with theme data and integrate with
 * the DSL launch flow. These are lightweight sanity checks; richer UI
 * coverage lives in theme-integration.spec.ts.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';
import { mockThemes } from '../fixtures/mockThemeData';
import { mockHAWebSocket, simulateHADisconnection } from '../helpers/mockHelpers';

test.describe('Theme Integration - Mocked IPC', () => {
  test('returns mocked themes over IPC and wires test hooks', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await mockHAWebSocket(ctx.window, ctx.app, { isConnected: true, themes: mockThemes });

      await ctx.window.waitForFunction(() => Boolean((window as any).__testThemeApi), null, {
        timeout: 5000,
      });

      const result = await ctx.window.evaluate(async () => {
        return (window as any).electronAPI.haWsGetThemes();
      });

      expect(result?.success).toBeTruthy();
      expect(Object.keys(result.themes?.themes || {})).toContain('mushroom');

      // Apply themes via the test hook to validate wiring
      await ctx.window.evaluate((themes) => {
        (window as any).__testThemeApi?.setConnected(true);
        (window as any).__testThemeApi?.applyThemes(themes);
      }, mockThemes);

      await expect(ctx.window.getByTestId('theme-selector')).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('handles mocked disconnect path', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await mockHAWebSocket(ctx.window, ctx.app, { isConnected: true, themes: mockThemes });
      await ctx.window.waitForFunction(() => Boolean((window as any).__testThemeApi), null, {
        timeout: 5000,
      });
      await ctx.window.evaluate((themes) => {
        (window as any).__testThemeApi?.setConnected(true);
        (window as any).__testThemeApi?.applyThemes(themes);
      }, mockThemes);

      await expect(ctx.window.getByTestId('theme-selector')).toBeVisible();

      await simulateHADisconnection(ctx.window, ctx.app);
      await ctx.window.evaluate(() => (window as any).__testThemeApi?.setConnected(false));

      await expect(ctx.window.getByTestId('theme-selector')).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });
});
