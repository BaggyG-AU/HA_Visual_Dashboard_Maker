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

  test('opens theme settings dialog and exposes tabs', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
    await connectWithMockThemes(ctx);

    const settingsBtn = ctx.window.getByTestId('theme-settings-button');
    await expect(settingsBtn).toBeVisible();
      await settingsBtn.click();

      const modal = ctx.window.getByTestId('theme-settings-modal');
      const dialog = ctx.window.getByRole('dialog', { name: /Theme Settings/i });
      await ctx.window.waitForFunction(() => {
        const el =
          document.querySelector('[data-testid="theme-settings-modal"] .ant-modal') ||
          document.querySelector('[role="dialog"]');
        if (!el) return false;
        const box = (el as HTMLElement).getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      }, null, { timeout: 5000 });

      await ctx.window.getByRole('tab', { name: /CSS Variables/i }).click();
      await expect(ctx.window.getByTestId('theme-settings-css')).toBeVisible();

      await ctx.window.getByRole('tab', { name: /Theme JSON/i }).click();
      await expect(ctx.window.getByTestId('theme-settings-json')).toBeVisible();

      await ctx.window.getByTestId('theme-settings-cancel').click();
      await expect(modal).toHaveCount(0, { timeout: 5000 });
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
