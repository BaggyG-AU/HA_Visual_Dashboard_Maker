/**
 * Electron Test Helper
 *
 * Utilities for launching and controlling the Electron app during tests.
 */

import { _electron as electron, ElectronApplication, Page } from 'playwright';
import * as path from 'path';

export interface ElectronTestApp {
  app: ElectronApplication;
  window: Page;
}

/**
 * Launch the Electron application for testing
 */
export async function launchElectronApp(): Promise<ElectronTestApp> {
  // Path to the main process file (after Vite build)
  const mainPath = path.join(__dirname, '../../.vite/build/main.js');

  // Launch Electron app
  const app = await electron.launch({
    args: [mainPath],
    env: {
      ...process.env,
      NODE_ENV: 'test',
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    },
  });

  // Wait for the first window to open
  const window = await app.firstWindow();

  // Wait for app to be ready
  await window.waitForLoadState('domcontentloaded');

  return { app, window };
}

/**
 * Close the Electron application
 */
export async function closeElectronApp(app: ElectronApplication): Promise<void> {
  await app.close();
}

/**
 * Wait for the application to be fully loaded
 */
export async function waitForAppReady(window: Page, timeout = 10000): Promise<void> {
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
      const canvasExists = await window.locator('.react-grid-layout').count();
      if (canvasExists > 0) {
        console.log('Dashboard already active (canvas found)');
        return true;
      }
      return false;
    }

    // Click the New Dashboard button
    await newDashboardButton.first().click();
    await window.waitForTimeout(500);

    // Verify canvas appeared
    const canvasExists = await window.locator('.react-grid-layout').count();
    console.log(`Dashboard created: ${canvasExists > 0}`);

    return canvasExists > 0;
  } catch (error) {
    console.log('Error creating new dashboard:', error);
    return false;
  }
}
