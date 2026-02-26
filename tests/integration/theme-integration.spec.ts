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

      await ctx.settings.open();
      await ctx.settings.selectTab('Appearance');

      // Now click on inner tabs (within theme settings)
      // Use .last() to get the nested tabs, not the outer "Appearance" tab
      await ctx.window.getByRole('tab', { name: /CSS Variables/i }).last().click();
      // Wait for Monaco editor container to be attached and visible
      await expect(ctx.window.getByTestId('theme-settings-css')).toBeAttached({ timeout: 10000 });
      await expect(ctx.window.getByTestId('theme-settings-css')).toBeVisible({ timeout: 10000 });

      await ctx.window.getByRole('tab', { name: /Theme JSON/i }).last().click();
      await expect(ctx.window.getByTestId('theme-settings-json')).toBeAttached({ timeout: 10000 });
      await expect(ctx.window.getByTestId('theme-settings-json')).toBeVisible({ timeout: 10000 });

      await ctx.settings.close();
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

  test('supports save/export/import workflows in theme manager tab', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await connectWithMockThemes(ctx);

      await ctx.settings.open();
      await ctx.settings.selectTab('Appearance');

      await ctx.window.getByRole('tab', { name: /Theme Manager/i }).last().click();

      await ctx.window.getByTestId('theme-manager-save-name').fill('snapshot-integration');
      await ctx.window.getByTestId('theme-manager-save').click();

      await ctx.window.getByTestId('theme-manager-saved-select').click();
      const options = ctx.window.locator('.ant-select-item-option');
      await expect(options.filter({ hasText: /^snapshot-integration$/ }).first()).toBeVisible({ timeout: 5000 });
      await options.filter({ hasText: /^snapshot-integration$/ }).first().click();

      await ctx.window.getByTestId('theme-manager-load').click();
      await expect(ctx.window.getByTestId('theme-settings-sync')).not.toBeChecked();

      await ctx.window.getByTestId('theme-manager-export').click();
      const exportJson = await ctx.window.getByTestId('theme-manager-json').inputValue();
      expect(exportJson).toContain('snapshot-integration');

      await ctx.window.getByTestId('theme-manager-delete').click();
      await ctx.window.getByTestId('theme-manager-json').fill(exportJson);
      await ctx.window.getByTestId('theme-manager-import').click();

      await ctx.window.getByTestId('theme-manager-saved-select').click();
      await expect(options.filter({ hasText: /^snapshot-integration$/ }).first()).toBeVisible({ timeout: 5000 });
      await ctx.window.keyboard.press('Escape');

      await ctx.settings.close();
    } finally {
      await close(ctx);
    }
  });
});
