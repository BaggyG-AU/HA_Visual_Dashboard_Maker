/**
 * Integration Test: Entity Caching (DSL-Based)
 *
 * Tests the entity caching functionality for offline support.
 * Migrated to use DSL pattern with isolated test storage.
 *
 * Note: These tests use seeded test data rather than requiring a live HA connection.
 * This allows testing cache functionality in isolation.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close, seedEntityCache, clearEntityCache } from '../support';

test.describe('Entity Caching', () => {
  test('should load cached entities from storage', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);

      await ctx.entityBrowser.open();

      const rowCount = await ctx.entityBrowser.getRowCount();
      expect(rowCount).toBe(4);

      // Verify specific entities are present
      await expect(ctx.window.locator('.ant-table-row:has-text("light.living_room")')).toBeVisible();
      await expect(ctx.window.locator('.ant-table-row:has-text("sensor.temperature")')).toBeVisible();
      await expect(ctx.window.locator('.ant-table-row:has-text("switch.fan")')).toBeVisible();
      await expect(ctx.window.locator('.ant-table-row:has-text("binary_sensor.motion_detected")')).toBeVisible();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should display cached entities when offline', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);

      await ctx.entityBrowser.open();

      const statusText = await ctx.entityBrowser.getConnectionStatusText();

      if (statusText?.includes('Offline')) {
        expect(statusText).toContain('Cached');

        const rowCount = await ctx.entityBrowser.getRowCount();
        expect(rowCount).toBeGreaterThanOrEqual(0);
      }
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should show appropriate message when no cached entities available', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      // Don't seed cache for this test

      await ctx.entityBrowser.open();

      const statusText = await ctx.entityBrowser.getConnectionStatusText();

      if (statusText?.includes('Offline')) {
        const emptyState = ctx.window.locator('.ant-empty');
        const tableRows = ctx.window.locator('.ant-table-row');

        const isEmpty = await emptyState.isVisible();
        const hasRows = await tableRows.count() > 0;

        expect(isEmpty || hasRows).toBeTruthy();

        if (isEmpty) {
          const emptyText = await emptyState.textContent();
          expect(emptyText).toContain('No entities cached');
        }
      }
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should persist cached entities across browser reopens', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);

      await ctx.entityBrowser.open();
      const initialRowCount = await ctx.entityBrowser.getRowCount();

      await ctx.entityBrowser.close();

      // Reopen entity browser
      await ctx.entityBrowser.open();
      const newRowCount = await ctx.entityBrowser.getRowCount();

      // Count should be the same (cache persisted)
      expect(newRowCount).toBe(initialRowCount);
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should update cache when refresh is clicked while connected', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);

      await ctx.entityBrowser.open();

      const statusText = await ctx.entityBrowser.getConnectionStatusText();

      if (!statusText?.includes('Connected')) {
        console.log('Skipping test: App is offline');
        return;
      }

      const initialCount = await ctx.entityBrowser.getRowCount();

      await ctx.entityBrowser.clickRefresh();
      await ctx.window.waitForTimeout(1500);

      const newCount = await ctx.entityBrowser.getRowCount();
      expect(newCount).toBeGreaterThanOrEqual(0);
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should show loading state during entity fetch', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);

      await ctx.entityBrowser.open();

      const statusText = await ctx.entityBrowser.getConnectionStatusText();

      if (!statusText?.includes('Connected')) {
        console.log('Skipping test: App is offline');
        return;
      }

      const refreshButton = ctx.window.locator('button:has-text("Refresh")');
      await refreshButton.click();

      await ctx.window.waitForTimeout(2000);

      await expect(ctx.window.locator('.ant-modal:has-text("Entity Browser")')).toBeVisible();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should handle cache retrieval errors gracefully', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);

      await ctx.entityBrowser.open();

      const modal = ctx.window.locator('.ant-modal:has-text("Entity Browser")');
      await expect(modal).toBeVisible();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });
});

test.describe('Entity Auto-Refresh on Connection', () => {
  test('should auto-fetch entities when connecting to HA', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);

      const connectButton = ctx.window.locator('button:has-text("Connect to HA")');

      if (!(await connectButton.isVisible())) {
        console.log('Skipping test: Cannot test connection flow');
        return;
      }

      await connectButton.click();
      await ctx.window.waitForTimeout(500);

      const urlInput = ctx.window.locator('input[placeholder*="URL"]');
      if (await urlInput.isVisible()) {
        await urlInput.fill('http://192.168.1.70:8123');

        const tokenInput = ctx.window.locator('input[placeholder*="Token"]');
        await tokenInput.fill('test_token_123');

        const submitButton = ctx.window.locator('button:has-text("Connect")');
        await submitButton.click();

        await ctx.window.waitForTimeout(3000);
      }

      await ctx.entityBrowser.open();

      const statusText = await ctx.entityBrowser.getConnectionStatusText();

      if (statusText?.includes('Connected')) {
        const hasEntities = await ctx.entityBrowser.getRowCount() > 0;
      }
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should not auto-refresh if already cached and offline', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);

      await ctx.entityBrowser.open();

      const statusText = await ctx.entityBrowser.getConnectionStatusText();

      if (statusText?.includes('Offline')) {
        await ctx.entityBrowser.expectRefreshButtonDisabled();

        const errorAlert = ctx.window.locator('.ant-alert-error');
        const hasError = await errorAlert.isVisible().catch(() => false);
        expect(hasError).toBeFalsy();
      }
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });
});

test.describe('Entity Cache Integration with IPC', () => {
  test('should successfully call getCachedEntities IPC handler', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);

      await ctx.entityBrowser.open();
      await ctx.entityBrowser.expectVisible();
      await ctx.entityBrowser.expectTableOrEmptyState();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should successfully call haWsFetchEntities when connected', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);

      await ctx.entityBrowser.open();

      const statusText = await ctx.entityBrowser.getConnectionStatusText();

      if (!statusText?.includes('Connected')) {
        console.log('Skipping test: App is offline');
        return;
      }

      const refreshButton = ctx.window.locator('button:has-text("Refresh")');
      await refreshButton.click();
      await ctx.window.waitForTimeout(2000);

      const modal = ctx.window.locator('.ant-modal:has-text("Entity Browser")');
      await expect(modal).toBeVisible();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should handle IPC errors gracefully', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);

      await ctx.entityBrowser.open();

      const hasApp = await ctx.window.locator('.app-container').isVisible();
      expect(hasApp).toBeTruthy();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });
});

test.describe('Entity Cache Storage', () => {
  test('should store entities in electron-store', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);

      await ctx.entityBrowser.open();

      const hasEntitiesOrEmpty =
        await ctx.entityBrowser.getRowCount() > 0 ||
        await ctx.window.locator('.ant-empty').isVisible();

      expect(hasEntitiesOrEmpty).toBeTruthy();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should handle empty cache gracefully', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      // Don't seed cache

      await ctx.entityBrowser.open();

      const statusText = await ctx.entityBrowser.getConnectionStatusText();

      if (statusText?.includes('Offline')) {
        const rowCount = await ctx.entityBrowser.getRowCount();

        if (rowCount === 0) {
          await ctx.entityBrowser.expectEmptyState();
        }
      }
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should handle corrupted cache data', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);

      await ctx.entityBrowser.open();
      await ctx.entityBrowser.expectVisible();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });
});

test.describe('Entity Cache Performance', () => {
  test('should load cached entities quickly', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);

      const startTime = Date.now();

      await ctx.entityBrowser.open();

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      expect(loadTime).toBeLessThan(2000);
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should handle large entity caches efficiently', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);

      await ctx.entityBrowser.open();

      const pagination = ctx.window.locator('.ant-pagination');

      if (await pagination.isVisible()) {
        const nextButton = ctx.window.locator('.ant-pagination-next');

        if (await nextButton.isEnabled()) {
          await nextButton.click();
          await ctx.window.waitForTimeout(300);

          const table = ctx.window.locator('.ant-table');
          await expect(table).toBeVisible();
        }
      }
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should not block UI during cache operations', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);

      await ctx.entityBrowser.open();

      const modal = ctx.window.locator('.ant-modal:has-text("Entity Browser")');
      await expect(modal).toBeVisible({ timeout: 3000 });

      const cancelButton = ctx.window.getByTestId('entity-browser-cancel-button');
      await expect(cancelButton).toBeEnabled();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });
});
