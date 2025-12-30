/**
 * Mock Helpers for Testing
 * Utilities to inject mocks into the Electron app during tests
 */

import type { ElectronApplication, Page } from '@playwright/test';
import { mockThemes } from '../fixtures/mockThemeData';

/**
 * Mock the Home Assistant WebSocket connection and responses
 * This injects mock data into the renderer process
 */
export async function mockHAWebSocket(
  page: Page,
  app: ElectronApplication,
  options?: {
    isConnected?: boolean;
    themes?: any;
    entities?: any[];
  }
) {
  const isConnected = options?.isConnected ?? true;
  const themes = options?.themes ?? mockThemes;
  const entities = options?.entities ?? [];

  // Mock the IPC handlers in the MAIN process instead of trying to override contextBridge
  await app.evaluate(({ ipcMain }, mockData) => {
    console.log('[MOCK MAIN] Installing IPC handler mocks');

    // Override the IPC handlers with mocked responses
    ipcMain.removeHandler('ha:ws:isConnected');
    ipcMain.handle('ha:ws:isConnected', () => {
      console.log('[MOCK MAIN] ha:ws:isConnected called, returning:', mockData.isConnected);
      return { connected: mockData.isConnected };
    });

    ipcMain.removeHandler('ha:ws:connect');
    ipcMain.handle('ha:ws:connect', () => {
      console.log('[MOCK MAIN] ha:ws:connect called');
      return { success: mockData.isConnected };
    });

    ipcMain.removeHandler('ha:ws:getThemes');
    ipcMain.handle('ha:ws:getThemes', () => {
      console.log('[MOCK MAIN] ha:ws:getThemes called, returning themes');
      return { success: true, themes: mockData.themes };
    });

    ipcMain.removeHandler('ha:ws:fetchEntities');
    ipcMain.handle('ha:ws:fetchEntities', () => {
      console.log('[MOCK MAIN] ha:ws:fetchEntities called');
      return { success: true, entities: mockData.entities };
    });

    console.log('[MOCK MAIN] IPC handlers mocked successfully');
  }, { isConnected, themes, entities });

  // Store mock data in renderer for localStorage-based settings
  await page.evaluate(() => {
    console.log('[MOCK RENDERER] Mock data stored');
  });
}

/**
 * Simulate connecting to Home Assistant
 * This triggers the connection flow with mock data and updates React state
 */
export async function simulateHAConnection(
  page: Page,
  app: ElectronApplication,
  options?: {
    url?: string;
    token?: string;
    themes?: any;
    clickConnectButton?: boolean;
  }
) {
  const url = options?.url ?? 'http://homeassistant.local:8123';
  const token = options?.token ?? 'mock-token-12345';
  const themes = options?.themes ?? mockThemes;
  const clickButton = options?.clickConnectButton ?? true;

  // First, mock the WebSocket
  await mockHAWebSocket(page, app, { isConnected: true, themes });

  if (clickButton) {
    // Click the "Connect to HA" button if it exists
    const connectButton = page.locator('button:has-text("Connect to HA")');
    if (await connectButton.isVisible().catch(() => false)) {
      await connectButton.click();
      await page.waitForTimeout(300);

      // Fill in the connection dialog if it appears
      const urlInput = page.locator('input[placeholder*="http"]').first();
      const tokenInput = page.locator('input[type="password"]').first();

      if (await urlInput.isVisible().catch(() => false)) {
        await urlInput.fill(url);
      }
      if (await tokenInput.isVisible().catch(() => false)) {
        await tokenInput.fill(token);
      }

      // Click connect button in dialog
      const dialogConnectButton = page.locator('.ant-modal button:has-text("Connect")');
      if (await dialogConnectButton.isVisible().catch(() => false)) {
        await dialogConnectButton.click();
        await page.waitForTimeout(500);
      }
    }
  } else {
    // Just inject connection state directly
    await page.evaluate(async (connectionData) => {
      // Simulate successful connection
      if ((window as any).electronAPI) {
        const result = await (window as any).electronAPI.haWsConnect(
          connectionData.url,
          connectionData.token
        );
        console.log('[MOCK] Connection result:', result);
      }
    }, { url, token });
  }

  // Wait for the app to process the connection and fetch themes
  await page.waitForTimeout(1000);
}

/**
 * Simulate disconnecting from Home Assistant
 */
export async function simulateHADisconnection(page: Page, app: ElectronApplication) {
  await page.evaluate(async () => {
    if ((window as any).electronAPI) {
      await (window as any).electronAPI.haWsClose();
    }
  });

  // Update mock to show disconnected state
  await mockHAWebSocket(page, app, { isConnected: false });
}

/**
 * Simulate theme update event from Home Assistant
 * This is useful for testing live theme updates
 */
export async function simulateThemeUpdate(page: Page, newThemes: any) {
  await page.evaluate((themes) => {
    // Find any active theme subscription callbacks
    if ((window as any).__mockThemeCallbacks) {
      (window as any).__mockThemeCallbacks.forEach((callback: any) => {
        callback(themes);
      });
    }
  }, newThemes);
}

/**
 * Wait for theme selector to appear in the UI
 * Useful for verifying the theme UI renders after connection
 */
export async function waitForThemeSelector(page: Page, timeout = 5000): Promise<boolean> {
  try {
    // Wait for any element with theme-related text or icon
    await page.waitForSelector('[aria-label*="theme"], button:has-text("Theme")', {
      timeout,
      state: 'visible',
    });
    return true;
  } catch (error) {
    console.log('Theme selector did not appear within timeout');
    return false;
  }
}

/**
 * Get current theme from the app state
 * Useful for verifying theme changes
 */
export async function getCurrentTheme(page: Page): Promise<{
  name: string | null;
  darkMode: boolean;
  syncWithHA: boolean;
}> {
  return await page.evaluate(() => {
    const stored = {
      name: localStorage.getItem('mockSelectedTheme'),
      darkMode: localStorage.getItem('mockThemeDarkMode') === 'true',
      syncWithHA: localStorage.getItem('mockThemeSyncWithHA') !== 'false',
    };
    return stored;
  });
}

/**
 * Clear all mock data from localStorage
 */
export async function clearMockData(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('mockSelectedTheme');
    localStorage.removeItem('mockThemeDarkMode');
    localStorage.removeItem('mockThemeSyncWithHA');
  });
}

/**
 * Mock entity-related IPC handlers
 * Useful for testing entity browser and entity caching without a live HA connection
 */
export async function mockHAEntities(
  page: Page,
  app: import('@playwright/test').ElectronApplication,
  options?: {
    entities?: any[];
    isConnected?: boolean;
  }
) {
  const entities = options?.entities ?? [];
  const isConnected = options?.isConnected ?? true;

  await app.evaluate(({ ipcMain }, mockData) => {
    console.log('[MOCK MAIN] Installing entity IPC handler mocks');

    // Mock connection status
    ipcMain.removeHandler('ha:ws:isConnected');
    ipcMain.handle('ha:ws:isConnected', () => {
      console.log('[MOCK MAIN] ha:ws:isConnected called, returning:', mockData.isConnected);
      return { connected: mockData.isConnected };
    });

    // Mock entity fetching
    ipcMain.removeHandler('ha:ws:fetchEntities');
    ipcMain.handle('ha:ws:fetchEntities', () => {
      console.log('[MOCK MAIN] ha:ws:fetchEntities called, returning', mockData.entities.length, 'entities');
      return { success: true, entities: mockData.entities };
    });

    // Mock cached entities retrieval
    ipcMain.removeHandler('entities:getCached');
    ipcMain.handle('entities:getCached', () => {
      console.log('[MOCK MAIN] entities:getCached called, returning cached entities');
      return { success: true, entities: mockData.entities };
    });

    // Mock entity caching
    ipcMain.removeHandler('entities:cache');
    ipcMain.handle('entities:cache', (event, entitiesToCache) => {
      console.log('[MOCK MAIN] entities:cache called with', entitiesToCache.length, 'entities');
      mockData.entities = entitiesToCache;
      return { success: true };
    });

    // Mock cache seeding (for tests)
    ipcMain.removeHandler('test:seedEntityCache');
    ipcMain.handle('test:seedEntityCache', (event, testEntities) => {
      console.log('[MOCK MAIN] test:seedEntityCache called with', testEntities.length, 'entities');
      mockData.entities = testEntities;
      return { success: true };
    });

    // Mock cache clearing (for tests)
    ipcMain.removeHandler('test:clearEntityCache');
    ipcMain.handle('test:clearEntityCache', () => {
      console.log('[MOCK MAIN] test:clearEntityCache called');
      mockData.entities = [];
      return { success: true };
    });

    console.log('[MOCK MAIN] Entity IPC handlers mocked successfully');
  }, { entities, isConnected });
}

/**
 * Create mock entity data for testing
 * Returns an array of realistic Home Assistant entities
 */
export function createMockEntities(count: number = 4): any[] {
  const mockEntities = [
    {
      entity_id: 'light.living_room',
      state: 'on',
      attributes: {
        friendly_name: 'Living Room Light',
        brightness: 255,
        supported_features: 41,
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
        device_class: 'temperature',
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

  return mockEntities.slice(0, count);
}

/**
 * Stub a specific IPC channel to fail (throws an Error in the handler).
 * Reuses the existing ipcMain override pattern used in other mocks.
 */
export async function stubIpcFailure(
  app: import('@playwright/test').ElectronApplication,
  channel: string,
  message: string
) {
  await app.evaluate(({ ipcMain }, data) => {
    ipcMain.removeHandler(data.channel);
    ipcMain.handle(data.channel, () => {
      throw new Error(data.message);
    });
    console.log(`[MOCK MAIN] Stubbed IPC failure for ${data.channel}: ${data.message}`);
  }, { channel, message });
}
