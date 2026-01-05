import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

test.describe('Settings', () => {
  test('should open settings dialog', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.settings.open();

      // Verify dialog is visible
      await expect(ctx.window.getByText('Settings')).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should have three tabs: Appearance, Connection, Diagnostics', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.settings.open();

      // Verify all three tabs are visible
      await expect(ctx.window.getByRole('tab', { name: 'Appearance' })).toBeVisible();
      await expect(ctx.window.getByRole('tab', { name: 'Connection' })).toBeVisible();
      await expect(ctx.window.getByRole('tab', { name: 'Diagnostics' })).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should switch between tabs', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.settings.open();

      // Test switching to each tab
      await ctx.settings.selectTab('Appearance');
      await expect(ctx.window.getByRole('tab', { name: 'Appearance', selected: true })).toBeVisible();

      await ctx.settings.selectTab('Connection');
      await expect(ctx.window.getByRole('tab', { name: 'Connection', selected: true })).toBeVisible();

      await ctx.settings.selectTab('Diagnostics');
      await expect(ctx.window.getByRole('tab', { name: 'Diagnostics', selected: true })).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should change logging level and persist across dialog opens', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();

      // Set logging level to Debug
      await ctx.settings.open();
      await ctx.settings.selectTab('Diagnostics');
      await ctx.settings.setLoggingLevel('Debug');
      await ctx.settings.expectLoggingLevel('Debug');

      // Close settings dialog
      const closeButton = ctx.window.getByRole('button', { name: /Close/i }).last();
      await closeButton.click();
      await expect(ctx.window.getByText('Settings')).not.toBeVisible({ timeout: 2000 });

      // Reopen settings and verify Debug persisted
      await ctx.settings.open();
      await ctx.settings.selectTab('Diagnostics');
      await ctx.settings.expectLoggingLevel('Debug');
    } finally {
      await close(ctx);
    }
  });

  test('should support all logging levels', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.settings.open();
      await ctx.settings.selectTab('Diagnostics');

      const levels = ['Off', 'Error', 'Warn', 'Info', 'Debug', 'Trace'];

      for (const level of levels) {
        await ctx.settings.setLoggingLevel(level);
        await ctx.settings.expectLoggingLevel(level);
      }
    } finally {
      await close(ctx);
    }
  });

  test('should have verbose UI debug toggle', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.settings.open();
      await ctx.settings.selectTab('Diagnostics');

      // Verify the switch is visible
      const verboseSwitch = ctx.window.locator('.ant-switch').first();
      await expect(verboseSwitch).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should have copy diagnostics button', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.settings.open();
      await ctx.settings.selectTab('Diagnostics');

      // Verify copy diagnostics button exists
      const copyButton = ctx.window.getByRole('button', { name: /Copy diagnostic info/i });
      await expect(copyButton).toBeVisible();
      await expect(copyButton).toBeEnabled();
    } finally {
      await close(ctx);
    }
  });

  test('should have maintenance buttons', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.settings.open();
      await ctx.settings.selectTab('Diagnostics');

      // Verify maintenance buttons exist
      const clearCacheButton = ctx.window.getByRole('button', { name: /Clear entity cache/i });
      const resetUIButton = ctx.window.getByRole('button', { name: /Reset UI state/i });

      await expect(clearCacheButton).toBeVisible();
      await expect(resetUIButton).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should show confirmation for clear entity cache', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.settings.open();
      await ctx.settings.selectTab('Diagnostics');

      // Click clear cache button
      const clearCacheButton = ctx.window.getByRole('button', { name: /Clear entity cache/i });
      await clearCacheButton.click();

      // Verify confirmation popup appears
      await expect(ctx.window.getByText(/Clear cached entities/i)).toBeVisible();
      await expect(ctx.window.getByText(/This will remove cached entity data/i)).toBeVisible();

      // Cancel the operation
      const cancelButton = ctx.window.getByRole('button', { name: /Cancel/i }).last();
      await cancelButton.click();
    } finally {
      await close(ctx);
    }
  });

  test('should show confirmation for reset UI state', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.settings.open();
      await ctx.settings.selectTab('Diagnostics');

      // Click reset UI button
      const resetUIButton = ctx.window.getByRole('button', { name: /Reset UI state/i });
      await resetUIButton.click();

      // Verify confirmation popup appears
      await expect(ctx.window.getByText(/Reset UI state\?/i)).toBeVisible();
      await expect(ctx.window.getByText(/This resets window\/layout\/theme preferences/i)).toBeVisible();

      // Cancel the operation
      const cancelButton = ctx.window.getByRole('button', { name: /Cancel/i }).last();
      await cancelButton.click();
    } finally {
      await close(ctx);
    }
  });

  test('should close settings dialog', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.settings.open();

      // Verify dialog is open
      await expect(ctx.window.getByText('Settings')).toBeVisible();

      // Close the dialog
      const closeButton = ctx.window.getByRole('button', { name: /Close/i }).last();
      await closeButton.click();

      // Verify dialog is closed (give it a moment to animate out)
      await expect(ctx.window.getByText('Settings')).not.toBeVisible({ timeout: 2000 });
    } finally {
      await close(ctx);
    }
  });
});
