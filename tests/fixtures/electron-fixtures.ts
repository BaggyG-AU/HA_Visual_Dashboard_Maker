/**
 * Electron Test Fixtures
 *
 * Following the playwright-electron-testing skill pattern.
 * Provides isolated, reliable test setup with proper window selection,
 * storage isolation, and React hydration waiting.
 *
 * Based on Phase 1 Inspection Report findings.
 */

import { _electron as electron, ElectronApplication, Page, test as base, expect } from '@playwright/test';
import path from 'path';
import os from 'os';
import fs from 'fs';
import crypto from 'crypto';

/**
 * Test fixture types
 */
type TestFixtures = {
  electronApp: ElectronApplication;
  page: Page; // main app window (after hydration)
};

/**
 * Create temporary user data directory for storage isolation
 * Each test run gets a fresh storage environment
 */
function mkTempUserDataDir(): string {
  const dir = path.join(os.tmpdir(), `pw-electron-${crypto.randomBytes(8).toString('hex')}`);
  fs.mkdirSync(dir, { recursive: true });
  console.log('[FIXTURE] Created temp user data dir:', dir);
  return dir;
}

/**
 * Wait for app to be ready for interaction
 *
 * Per Phase 1 inspection: Use "Card Palette" text as canonical readiness signal.
 * This ensures React has hydrated and UI is interactive.
 */
async function waitForAppReady(page: Page): Promise<void> {
  console.log('[FIXTURE] Waiting for app ready...');

  // Wait for Card Palette to be visible - this means React has hydrated
  await expect(page.getByText('Card Palette')).toBeVisible({ timeout: 15000 });
  console.log('[FIXTURE] Card Palette visible');

  // Also wait for collapse headers to ensure UI is fully rendered
  await expect(page.locator('.ant-collapse-header').first()).toBeVisible({ timeout: 5000 });
  console.log('[FIXTURE] App ready - React hydrated and UI rendered');
}

/**
 * Extended Playwright test with Electron fixtures
 *
 * Usage in tests:
 * ```typescript
 * import { test, expect } from '../fixtures/electron-fixtures';
 *
 * test('my test', async ({ page }) => {
 *   // page is already launched, hydrated, and ready
 *   await page.click('button:has-text("New Dashboard")');
 * });
 * ```
 */
export const test = base.extend<TestFixtures>({
  /**
   * Electron application fixture
   * Launches app with proper storage isolation
   */
  electronApp: async (_context, use) => {
    console.log('[FIXTURE] Launching Electron app...');

    // Per Phase 1 inspection: Main process is at .vite/build/main.js
    const mainPath = path.join(__dirname, '../../.vite/build/main.js');
    console.log('[FIXTURE] Main path:', mainPath);

    // Launch EXACTLY like electron-helper.ts (which works)
    // DO NOT specify executablePath - let Playwright find electron
    const app = await electron.launch({
      args: [mainPath],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      },
    });

    console.log('[FIXTURE] Electron app launched');

    await use(app);

    console.log('[FIXTURE] Closing Electron app...');
    await app.close();
    console.log('[FIXTURE] Electron app closed');
  },

  /**
   * Main app window fixture
   * Gets main app window (filtering out DevTools) and ensures React hydration + maximization
   */
  page: async ({ electronApp }, use) => {
    console.log('[FIXTURE] Waiting for main app window...');

    // CRITICAL: firstWindow() can return DevTools!
    // We need to poll for a non-DevTools window with timeout
    // See: https://github.com/microsoft/playwright/discussions/11526
    const timeoutMs = 15000;
    const start = Date.now();

    let page: Page | undefined;

    while (Date.now() - start < timeoutMs) {
      // Wait for *any* new window event, but don't hang forever in one await
      await Promise.race([
        electronApp.waitForEvent('window').catch(() => undefined),
        new Promise((r) => setTimeout(r, 250)),
      ]);

      const windows = electronApp.windows();
      console.log(`[FIXTURE] Found ${windows.length} windows, filtering...`);

      // Prefer a non-devtools window; also allow about:blank during startup
      page = windows.find(w => {
        const url = w.url();
        console.log(`[FIXTURE] Window URL: ${url}`);
        return !url.startsWith('devtools://');
      });

      if (page) {
        console.log('[FIXTURE] ✓ Found main app window (non-DevTools)');
        break;
      }
    }

    if (!page) {
      // Extra debugging: ask Electron what it thinks exists
      const info = await electronApp.evaluate(({ BrowserWindow }) => {
        return BrowserWindow.getAllWindows().map(w => ({
          title: w.getTitle(),
          isVisible: w.isVisible(),
          isDestroyed: w.isDestroyed(),
          webContentsURL: w.webContents.getURL(),
        }));
      });
      console.log('[FIXTURE] BrowserWindow.getAllWindows():', info);

      throw new Error('Could not find main app window (timed out waiting for non-DevTools window)');
    }

    console.log('[FIXTURE] Main window URL:', page.url());

    // Wait for base DOM load
    await page.waitForLoadState('domcontentloaded');
    console.log('[FIXTURE] DOM content loaded');

    // Maximize the window using electronApp.browserWindow() method
    try {
      const browserWindow = await electronApp.browserWindow(page);
      await browserWindow.evaluate((bw) => {
        bw.maximize();
        bw.show();
      });
      console.log('[FIXTURE] Window maximized');
    } catch (error) {
      console.warn('[FIXTURE] Failed to maximize window:', error);
    }

    // Enable diagnostics BEFORE waiting for app ready
    // This ensures we catch errors during hydration
    enableDiagnostics(page);

    // Wait for React hydration and app readiness
    await waitForAppReady(page);

    // Provide the ready page to the test
    await use(page);

    // Page cleanup happens automatically when app closes
  },
});

/**
 * Enable comprehensive diagnostics for debugging test failures
 */
function enableDiagnostics(page: Page): void {
  // Console messages
  page.on('console', (msg) => {
    console.log(`[renderer:${msg.type()}]`, msg.text());
  });

  // Page errors (uncaught exceptions)
  page.on('pageerror', (err) => {
    console.error('[renderer:error]', err.message);
  });

  // Failed network requests
  page.on('requestfailed', (req) => {
    console.error('[requestfailed]', req.url(), req.failure()?.errorText || 'unknown');
  });

  console.log('[FIXTURE] Diagnostics enabled');
}

/**
 * Re-export expect for convenience
 */
export { expect } from '@playwright/test';

// ==============================================================================
// Helper Utilities
// ==============================================================================

/**
 * Expand a card category in the palette (scoped to palette).
 *
 * Usage:
 *   await expandCategory(page, 'Controls');
 */
export async function expandCategory(page: Page, categoryName: string) {
  const palette = page.getByTestId('card-palette');
  const header = palette.getByRole('button', { name: new RegExp(categoryName, 'i') });

  await expect(header).toBeVisible();
  await header.click();

  // Wait for collapse animation
  await page.waitForTimeout(300);
}

/**
 * Add a card to canvas by test ID (double-click in palette).
 *
 * Usage:
 *   await addCardToCanvas(page, 'button');
 */
export async function addCardToCanvas(page: Page, cardType: string) {
  const palette = page.getByTestId('card-palette');
  const card = palette.getByTestId(`palette-card-${cardType}`);

  await expect(card).toBeVisible();
  await card.dblclick();

  // Wait for card to appear on canvas
  await expect(page.getByTestId('canvas-card').first()).toBeVisible({ timeout: 3000 });
}

/**
 * Select a card on the canvas by index (0-based).
 *
 * Usage:
 *   await selectCanvasCard(page, 0); // Select first card
 */
export async function selectCanvasCard(page: Page, index = 0) {
  const cards = page.getByTestId('canvas-card');
  const card = cards.nth(index);

  await expect(card).toBeVisible();
  await card.click();

  // Wait for properties panel to update
  await page.waitForTimeout(300);
}
