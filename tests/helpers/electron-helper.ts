/**
 * Electron Test Helper
 *
 * Utilities for launching and controlling the Electron app during tests.
 */

import { _electron as electron, ElectronApplication, Page } from 'playwright';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as crypto from 'crypto';

export interface ElectronTestApp {
  app: ElectronApplication;
  window: Page;
  userDataDir?: string; // Temp directory for isolated storage
}

/**
 * Create a temporary isolated user data directory
 * Ensures localStorage/sessionStorage/IndexedDB don't leak between tests
 */
function createTempUserDataDir(): string {
  const dir = path.join(
    os.tmpdir(),
    `pw-electron-test-${crypto.randomBytes(8).toString('hex')}`
  );
  fs.mkdirSync(dir, { recursive: true });
  console.log('[HELPER] Created isolated user data dir:', dir);
  return dir;
}

/**
 * Launch the Electron application for testing with isolated storage
 * Each launch gets a fresh localStorage/sessionStorage/IndexedDB
 */
export async function launchElectronApp(): Promise<ElectronTestApp> {
  // Path to the main process file (after Vite build)
  const mainPath = path.join(__dirname, '../../.vite/build/main.js');

  // Create isolated user data directory for this test
  const userDataDir = createTempUserDataDir();

  const wslFlags = ['--no-sandbox', '--disable-gpu'];
  const baseEnv = { ...process.env };
  // If Electron is forced into Node mode, Playwright's injected Electron flags (e.g. --remote-debugging-port)
  // are rejected by Node, causing the app to fail to launch.
  delete baseEnv.ELECTRON_RUN_AS_NODE;

  // Launch Electron app with isolated storage
  const app = await electron.launch({
    args: [
      mainPath,
      // CRITICAL: Isolate storage to prevent state leakage between tests
      `--user-data-dir=${userDataDir}`,
      ...wslFlags,
    ],
    env: {
      ...baseEnv,
      NODE_ENV: 'test',
      E2E: '1',
      // Keep in sync with tests/support/electron.ts so test-only IPC handlers are enabled
      PLAYWRIGHT_TEST: '1',
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    },
  });

  // Select the main app window (skip devtools/blank windows if they appear first)
  const isMainWindow = (page: Page) => {
    const url = page.url();
    if (url.startsWith('devtools://')) return false;
    return url.includes('main_window/index.html') || url.includes('index.html') || url === 'about:blank';
  };

  let window = app.windows().find(isMainWindow);
  if (!window) {
    window = await app.waitForEvent('window', isMainWindow);
  }

  // Wait for app to be ready
  await window.waitForLoadState('domcontentloaded');

  // Match main launcher: maximize and show for consistent layout sizing
  await app.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      win.maximize();
      win.show();
    }
  });

  console.log('[HELPER] Electron app launched with isolated storage');

  return { app, window, userDataDir };
}

/**
 * Close the Electron application and cleanup temp storage
 */
export async function closeElectronApp(app: ElectronApplication, userDataDir?: string): Promise<void> {
  await app.close();

  // Clean up temp user data directory
  if (userDataDir) {
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
      console.log('[HELPER] Cleaned up user data dir:', userDataDir);
    } catch (error) {
      console.warn('[HELPER] Failed to cleanup user data dir:', error);
    }
  }
}

/**
 * Wait for React hydration to complete
 * OPTIONAL: Call this explicitly in tests that need it
 * This prevents clicking on elements before event handlers are bound
 */
export async function waitForReactHydration(window: Page, timeout = 10000): Promise<void> {
  try {
    await window.waitForFunction(
      () => (window as any).__REACT_HYDRATED__ === true,
      { timeout }
    );
    console.log('[TEST] React hydration confirmed');
  } catch (error) {
    // Hydration signal might not be present - use minimal fallback
    console.log('[TEST] Hydration signal not found, using minimal fallback');
    await window.waitForTimeout(500);
  }
}

/**
 * Wait for the application to be fully loaded
 * REVERTED to original working version
 */
export async function waitForAppReady(window: Page, timeout = 10000): Promise<void> {
  void timeout;
  try {
    // Wait for React to render (body should have content)
    await window.waitForSelector('body', { timeout: 5000 });

    // Wait a moment for React hydration
    await window.waitForTimeout(1000);

    // Try to wait for main app elements (but don't fail if not found)
    await window.waitForSelector('body > div', { timeout: 3000, state: 'attached' }).catch(() => {
      console.log('Main div not found, continuing anyway...');
    });

    // Give the app a bit more time to settle
    await window.waitForTimeout(500);
  } catch (error) {
    console.log('Warning: waitForAppReady timeout, but continuing...', error);
    // Don't throw - let tests continue even if app isn't "ready"
  }
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(
  window: Page,
  name: string,
  fullPage = false
): Promise<void> {
  const screenshotPath = path.join(__dirname, '../../test-results/screenshots', `${name}.png`);
  await window.screenshot({
    path: screenshotPath,
    fullPage,
  });
  console.log(`Screenshot saved: ${screenshotPath}`);
}

/**
 * Get the window title
 */
export async function getWindowTitle(window: Page): Promise<string> {
  return await window.title();
}

/**
 * Simulate keyboard shortcut
 */
export async function pressShortcut(window: Page, shortcut: string): Promise<void> {
  await window.keyboard.press(shortcut);
}

/**
 * Wait for file dialog and handle it
 */
export async function handleFileDialog(
  app: ElectronApplication,
  filePath: string
): Promise<void> {
  // This is a placeholder - Electron file dialogs need special handling
  // You'll need to mock the dialog or use IPC to bypass it in tests
  console.log(`Would select file: ${filePath}`);
}

/**
 * Seed the entity cache with test data via IPC
 * Useful for testing entity-related features without requiring a live HA connection
 */
export async function seedEntityCache(window: Page): Promise<void> {
  // Create test entities
  const testEntities = [
    {
      entity_id: 'light.living_room',
      state: 'on',
      attributes: {
        friendly_name: 'Living Room Light',
        brightness: 255,
      },
      last_changed: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      context: { id: 'test1', parent_id: null, user_id: null },
    },
    {
      entity_id: 'sensor.temperature',
      state: '72',
      attributes: {
        friendly_name: 'Temperature Sensor',
        unit_of_measurement: '°F',
      },
      last_changed: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      context: { id: 'test2', parent_id: null, user_id: null },
    },
    {
      entity_id: 'switch.bedroom',
      state: 'off',
      attributes: {
        friendly_name: 'Bedroom Switch',
      },
      last_changed: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      context: { id: 'test3', parent_id: null, user_id: null },
    },
    {
      entity_id: 'binary_sensor.door',
      state: 'off',
      attributes: {
        friendly_name: 'Front Door',
        device_class: 'door',
      },
      last_changed: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      context: { id: 'test4', parent_id: null, user_id: null },
    },
  ];

  // Call IPC handler to seed cache
  await window.evaluate(async (entities) => {
    const result = await (window as any).electronAPI.testSeedEntityCache(entities);
    if (result.success) {
      console.log(`Seeded ${entities.length} test entities into cache`);
    } else {
      console.error('Failed to seed entities:', result.error);
    }
  }, testEntities);
}

/**
 * Clear the entity cache via IPC
 */
export async function clearEntityCache(window: Page): Promise<void> {
  await window.evaluate(async () => {
    const result = await (window as any).electronAPI.testClearEntityCache();
    if (result.success) {
      console.log('Cleared entity cache');
    } else {
      console.error('Failed to clear cache:', result.error);
    }
  });
}

/**
 * Expand a card palette category by name
 * Categories are collapsed by default in the Ant Design Collapse component
 */
export async function expandCardCategory(window: Page, categoryName: string): Promise<boolean> {
  try {
    // Look for the category header
    const categoryHeader = window.locator('.ant-collapse-header').filter({ hasText: categoryName });
    const headerExists = await categoryHeader.count();

    if (headerExists === 0) {
      console.log(`Category "${categoryName}" not found`);
      return false;
    }

    // Check if already expanded by looking at the parent item
    const isExpanded = await categoryHeader.evaluate((el) => {
      const item = el.closest('.ant-collapse-item');
      return item?.classList.contains('ant-collapse-item-active') ?? false;
    });

    if (isExpanded) {
      console.log(`Category "${categoryName}" already expanded`);
      return true;
    }

    // Click to expand
    console.log(`Expanding category "${categoryName}"...`);
    await categoryHeader.click();

    // Wait for animation to complete
    await window.waitForTimeout(300);

    // Verify it expanded
    const nowExpanded = await categoryHeader.evaluate((el) => {
      const item = el.closest('.ant-collapse-item');
      return item?.classList.contains('ant-collapse-item-active') ?? false;
    });

    console.log(`Category "${categoryName}" expanded: ${nowExpanded}`);
    return nowExpanded;
  } catch (error) {
    console.log(`Error expanding category "${categoryName}":`, error);
    return false;
  }
}

/**
 * Expand all card palette categories
 * Useful for making all cards visible in tests
 */
export async function expandAllCardCategories(window: Page): Promise<void> {
  try {
    console.log('Expanding all card palette categories...');

    // Get all collapse headers
    const headers = await window.locator('.ant-collapse-header').all();
    console.log(`Found ${headers.length} categories`);

    // Click each one that isn't already expanded
    for (const header of headers) {
      const isExpanded = await header.evaluate((el) => {
        const item = el.closest('.ant-collapse-item');
        return item?.classList.contains('ant-collapse-item-active') ?? false;
      });

      if (!isExpanded) {
        const categoryName = await header.textContent();
        console.log(`Expanding category: ${categoryName}`);
        await header.click();
        await window.waitForTimeout(200); // Brief wait between clicks
      }
    }

    // Final wait for all animations to complete
    await window.waitForTimeout(300);
    console.log('All categories expanded');
  } catch (error) {
    console.log('Error expanding all categories:', error);
  }
}

/**
 * Wait for the card palette to be ready
 * The palette should have at least one collapse panel header
 */
export async function waitForCardPalette(window: Page, timeout = 5000): Promise<boolean> {
  try {
    console.log('Waiting for card palette to render...');
    await window.waitForSelector('.ant-collapse-header', { timeout, state: 'attached' });
    const headers = await window.locator('.ant-collapse-header').count();
    console.log(`Card palette ready with ${headers} categories`);
    return headers > 0;
  } catch (error) {
    console.log('Card palette did not render in time:', error);
    return false;
  }
}

/**
 * Create a new blank dashboard
 * Required before adding cards to canvas
 */
export async function createNewDashboard(window: Page): Promise<boolean> {
  try {
    console.log('Creating new dashboard...');

    // Look for "New Dashboard" button
    const newDashboardButton = window.locator('button:has-text("New Dashboard")');
    const buttonExists = await newDashboardButton.count();

    if (buttonExists === 0) {
      console.log('New Dashboard button not found - dashboard may already be active');
      // Check if canvas already exists (dashboard is active)
      // Look for either the grid layout or the empty message
      const canvasExists = await window.locator('.react-grid-layout').count();
      const emptyMessage = await window.locator('text="No cards in this view"').count();
      if (canvasExists > 0 || emptyMessage > 0) {
        console.log('Dashboard already active (canvas found)');
        return true;
      }
      return false;
    }

    // Click the New Dashboard button
    console.log('Clicking New Dashboard button...');
    await newDashboardButton.first().click();

    // Wait for dashboard to initialize - just use a simple timeout
    await window.waitForTimeout(1500);

    // Check if canvas appeared
    const gridLayout = await window.locator('.react-grid-layout').count();
    const emptyMessage = await window.locator('text="No cards in this view"').count();
    const canvasExists = gridLayout > 0 || emptyMessage > 0;
    console.log(`Dashboard created: ${canvasExists} (grid: ${gridLayout}, empty msg: ${emptyMessage})`);

    return canvasExists;
  } catch (error) {
    console.log('Error creating new dashboard:', error);
    return false;
  }
}
