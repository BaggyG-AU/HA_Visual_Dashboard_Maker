/**
 * Theme Integration Tests (DSL)
 *
 * Verifies theme selector visibility, settings dialog, and basic toggles
 * using mocked Home Assistant theme data. Runs with the DSL launcher and
 * stable test IDs (see tests/TESTING_STANDARDS.md).
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';
import { mockThemes } from '../fixtures/mockThemeData';
import { mockHAWebSocket } from '../helpers/mockHelpers';

async function connectWithMockThemes(ctx: Awaited<ReturnType<typeof launchWithDSL>>) {
  await mockHAWebSocket(ctx.window, ctx.app, { isConnected: true, themes: mockThemes });

  await ctx.window.waitForFunction(() => Boolean((window as any).__testThemeApi), null, {
    timeout: 5000,
  });

  await ctx.window.evaluate((themes) => {
    (window as any).__testThemeApi?.setConnected(true);
    (window as any).__testThemeApi?.applyThemes(themes);
  }, mockThemes);

  // Open dropdown once to force option render and wait for at least one option
  const select = ctx.window.getByTestId('theme-select');
  await select.click();
  const options = ctx.window.locator('.ant-select-item-option');
  await expect(options.first()).toBeVisible({ timeout: 5000 });
  await ctx.window.keyboard.press('Escape');
}

test.describe('Theme Integration', () => {
  test('hides theme selector when disconnected', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await expect(ctx.window.getByTestId('theme-selector')).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });

  test('shows theme selector with available themes when connected', async () => {
    const ctx = await launchWithDSL();
  try {
    await ctx.appDSL.waitUntilReady();
    await connectWithMockThemes(ctx);

    const selector = ctx.window.getByTestId('theme-selector');
    await expect(selector).toBeVisible({ timeout: 5000 });

    const select = ctx.window.getByTestId('theme-select');
    await select.click();
    const options = ctx.window.locator('.ant-select-item-option');
    await expect(options.first()).toBeVisible({ timeout: 5000 });
    await ctx.window.keyboard.press('Escape');

      const syncBadge = ctx.window.getByTestId('theme-sync-badge');
      await expect(syncBadge).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('opens theme settings via Settings dialog and exposes tabs', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await connectWithMockThemes(ctx);

      const settingsBtn = ctx.window.getByRole('button', { name: /Settings/i });
      await expect(settingsBtn).toBeVisible();
      await settingsBtn.click();

      const dialog = ctx.window.getByRole('dialog', { name: /Settings/i });
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Click on Appearance tab (outer tabs)
      await ctx.window.getByRole('tab', { name: /Appearance/i }).click();

      // Now click on inner tabs (within theme settings)
      // Use .last() to get the nested tabs, not the outer "Appearance" tab
      await ctx.window.getByRole('tab', { name: /CSS Variables/i }).last().click();
      // Wait for Monaco editor container to be attached and visible
      await expect(ctx.window.getByTestId('theme-settings-css')).toBeAttached({ timeout: 10000 });
      await expect(ctx.window.getByTestId('theme-settings-css')).toBeVisible({ timeout: 10000 });

      await ctx.window.getByRole('tab', { name: /Theme JSON/i }).last().click();
      await expect(ctx.window.getByTestId('theme-settings-json')).toBeAttached({ timeout: 10000 });
      await expect(ctx.window.getByTestId('theme-settings-json')).toBeVisible({ timeout: 10000 });

      // Use .last() to get footer Close button, not modal X button (strict mode)
      await ctx.window.getByRole('button', { name: /Close/i }).last().click();
      await expect(dialog).toHaveCount(0, { timeout: 5000 });
    } finally {
      await close(ctx);
    }
  });

  test('toggles dark mode via theme selector', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await connectWithMockThemes(ctx);

      const toggle = ctx.window.getByTestId('theme-dark-toggle');
      await expect(toggle).toBeVisible();

      const initialState = await toggle.getAttribute('aria-checked');
      await toggle.click();
      const toggledState = await toggle.getAttribute('aria-checked');

      expect(toggledState).not.toBe(initialState);
    } finally {
      await close(ctx);
    }
  });
});
