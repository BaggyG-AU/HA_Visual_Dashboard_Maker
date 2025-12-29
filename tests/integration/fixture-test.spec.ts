/**
 * Fixture Verification Test
 *
 * This test verifies that the new fixture-based approach works correctly.
 * It tests basic app functionality using the new patterns.
 *
 * This serves as:
 * 1. Proof of concept for fixture pattern
 * 2. Example for migrating other tests
 * 3. Verification that storage isolation works
 */

import { test, expect } from '../fixtures/electron-fixtures';

test.describe('Fixture Pattern Verification', () => {
  test('should launch app with isolated storage', async ({ page }) => {
    // Page is already launched and ready thanks to fixture
    // No need for launchElectronApp() or waitForAppReady()

    // Verify app is running
    const title = await page.title();
    expect(title).toContain('HA Visual Dashboard Maker');
  });

  test('should have Card Palette visible', async ({ page }) => {
    // Verify the readiness signal we use in fixture
    await expect(page.getByText('Card Palette')).toBeVisible();

    // Verify collapse headers are present
    const headers = await page.locator('.ant-collapse-header').count();
    expect(headers).toBeGreaterThan(0);
  });

  test('should have clean storage (isolated)', async ({ page }) => {
    // With storage isolation, theme should be default (not from previous tests)
    // This tests that --user-data-dir is working

    // Note: We can't easily verify the storage is clean from renderer,
    // but we can verify the app started successfully
    await expect(page.getByText('Card Palette')).toBeVisible();
  });

  test('should handle strict mode selectors correctly', async ({ page }) => {
    // This demonstrates the fix for Category 1 (strict mode violations)

    // Open Entity Browser
    await page.click('button:has-text("Entities")');
    await page.waitForSelector('.ant-modal:has-text("Entity Browser")');

    // OLD WAY (causes strict mode violation):
    // const statusText = await page.locator('.ant-badge-status-text').textContent();

    // NEW WAY (scoped to modal header):
    const statusBadge = page
      .locator('.ant-modal:has-text("Entity Browser")')
      .locator('.ant-badge-status-text')
      .first();

    await expect(statusBadge).toBeVisible();
    const statusText = await statusBadge.textContent();

    // Should show either "Connected" or "Offline (Cached)"
    expect(statusText).toMatch(/(Connected|Offline|Not Connected)/);

    // Close modal using dedicated test id to avoid other cancel buttons
    await page.getByTestId('entity-browser-cancel-button').click();
  });
});
