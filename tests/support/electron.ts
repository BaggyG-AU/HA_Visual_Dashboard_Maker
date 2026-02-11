/**
 * Electron Test Launcher
 *
 * Handles all Electron boot logic with isolated storage for every test.
 * This is the SINGLE source of truth for launching Electron in tests.
 *
 * MANDATORY RULES:
 * - Every test gets isolated userDataDir (prevents localStorage/IndexedDB leakage)
 * - Cleanup happens automatically after test completion
 * - Window maximization for consistent viewport
 * - Minimal wait times with explicit state checks
 */

import { _electron as electron, ElectronApplication, Page } from 'playwright';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as crypto from 'crypto';

export interface ElectronTestContext {
  app: ElectronApplication;
  window: Page;
  userDataDir: string;
}

/**
 * Find the main app window, filtering out DevTools (which can appear first)
 */
async function findMainWindow(app: ElectronApplication, timeoutMs = 15000): Promise<Page> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    await Promise.race([
      app.waitForEvent('window').catch(() => undefined),
      new Promise((resolve) => setTimeout(resolve, 250)),
    ]);

    const window = app.windows().find((page) => !page.url().startsWith('devtools://'));
    if (window) {
      return window;
    }
  }

  throw new Error('Could not find main app window (non-DevTools)');
}

/**
 * Create isolated temporary user data directory
 * Ensures no state leakage between tests
 */
function createIsolatedUserDataDir(): string {
  const dir = path.join(
    os.tmpdir(),
    `pw-electron-${crypto.randomBytes(8).toString('hex')}`
  );
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Launch Electron app with isolated storage
 * This is the ONLY way to launch Electron in tests
 */
export async function launch(): Promise<ElectronTestContext> {
  const mainPath = path.join(__dirname, '../../.vite/build/main.js');
  const userDataDir = createIsolatedUserDataDir();

  const wslFlags = [
    '--no-sandbox',
    '--disable-gpu',
    '--disable-gpu-compositing',
    '--disable-gpu-rasterization',
  ];
  const baseEnv = { ...process.env };
  delete baseEnv.ELECTRON_RUN_AS_NODE;

  const app = await electron.launch({
    args: [
      mainPath,
      `--user-data-dir=${userDataDir}`,
      ...wslFlags,
    ],
    env: {
      ...baseEnv,
      NODE_ENV: 'test',
      E2E: '1',
      PLAYWRIGHT_TEST: '1',
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    },
  });

  // Prefer an already-open main window if available; otherwise wait for one
  const window = await findMainWindow(app);

  // Wait for renderer to load its DOM
  await window.waitForLoadState('domcontentloaded');

  // Diagnostics: log window count and URL for debugging blank window cases
  try {
    const info = await app.evaluate(({ BrowserWindow }) => {
      const wins = BrowserWindow.getAllWindows();
      const primary = wins[0];
      return {
        count: wins.length,
        primary: primary
          ? {
              url: primary.webContents.getURL(),
              isVisible: primary.isVisible(),
              isDestroyed: primary.isDestroyed(),
              isMinimized: primary.isMinimized(),
              loading: primary.webContents.isLoading()
            }
          : null
      };
    });
    // eslint-disable-next-line no-console
    console.log('[electron launch] window info', JSON.stringify(info));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('[electron launch] diagnostics failed', String(err));
  }

  // Use a fixed large window size to avoid responsive wrapping without the instability
  // that can come from maximize/fullscreen transitions during startup.
  await app.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      win.setBounds({ x: 0, y: 0, width: 1920, height: 1080 });
      win.show();
    }
  });

  // Keep renderer viewport in sync with the full-size window for stable locator visibility.
  await window.setViewportSize({ width: 1920, height: 1080 });

  // Wait for React to hydrate
  // First wait for the root div to exist
  await window.waitForSelector('#root', { timeout: 10000, state: 'attached' });

  // Then wait for React to actually render content inside root
  // The App component should render its content
  await window.waitForSelector('#root > *', { timeout: 20000, state: 'attached' });

  // Wait for the app shell to become interactable instead of sleeping.
  await window.waitForFunction(() => {
    const shell = document.querySelector('[data-testid="app-shell"]');
    const root = document.querySelector('#root');
    const hasRenderedContent = Boolean(root && root.children.length > 0);
    return Boolean(shell) || hasRenderedContent;
  }, null, { timeout: 15000 });

  // Ensure renderer can detect test mode even when built in production mode
  await window.evaluate(() => {
    type TestFlagWindow = Window & { E2E?: string; PLAYWRIGHT_TEST?: string };
    const testWindow = window as TestFlagWindow;
    testWindow.E2E = '1';
    testWindow.PLAYWRIGHT_TEST = '1';
  });

  return { app, window, userDataDir };
}

/**
 * Close Electron app and cleanup isolated storage
 * Never throws - always attempts cleanup even if close fails
 */
export async function close(ctx: ElectronTestContext): Promise<void> {
  // Close Electron app (don't throw on failure)
  try {
    await ctx.app.close();
  } catch (error) {
    console.warn('[electron.ts] Failed to close Electron app:', error);
  }

  // Cleanup temp directory (always attempt even if close failed)
  try {
    fs.rmSync(ctx.userDataDir, { recursive: true, force: true });
  } catch (error) {
    console.warn('[electron.ts] Failed to cleanup userDataDir:', error);
  }
}
