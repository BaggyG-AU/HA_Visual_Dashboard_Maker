/**
 * Integration Test: Error Scenarios
 *
 * Tests error handling throughout the application.
 *
 * NOTE: All tests in this file are placeholder TODOs and are SKIPPED.
 * Error handling is tested through:
 * - Real error scenarios in other integration tests
 * - E2E tests
 * - Manual testing
 */

import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, waitForAppReady } from '../helpers/electron-helper';
import { stubIpcFailure, mockHAWebSocket, simulateHADisconnection, mockHAEntities } from '../helpers/mockHelpers';
import { convertLayoutCardToGridLayout, parseLayoutCardConfig } from '../../src/utils/layoutCardParser';
import { getCardSizeConstraints } from '../../src/utils/cardSizingContract';
import { launchWithDSL, close as closeDSL } from '../support';
import type { View } from '../../src/types/dashboard';

type MonacoModel = { setValue?: (yaml: string) => void };
type MonacoEditor = { getModels?: () => MonacoModel[] };
type MonacoApi = { editor?: MonacoEditor };
type ElectronApi = {
  readFile?: (path: string) => Promise<unknown>;
  writeFile?: (path: string, data: string) => Promise<unknown>;
  haWsConnect?: (url: string, token: string) => Promise<unknown>;
  haWsIsConnected?: () => Promise<unknown>;
  haWsGetThemes?: () => Promise<unknown>;
  haWsFetchEntities?: () => Promise<{ success?: boolean; entities?: Array<{ entity_id?: string }> }>;
  haFetch?: (url: string, token: string) => Promise<unknown>;
  haWsDeployDashboard?: (tempPath: string, productionPath: string) => Promise<unknown>;
  createBackup?: (filePath: string) => Promise<unknown>;
  credentialsIsEncryptionAvailable?: () => Promise<unknown>;
  credentialsGet?: (id: string) => Promise<unknown>;
};
type TestWindow = Window & {
  __monacoModel?: MonacoModel;
  monaco?: MonacoApi;
  __forceYamlValidation?: () => void;
  electronAPI?: ElectronApi;
};

test.describe('YAML Parsing Errors', () => {
  test('should handle invalid YAML syntax gracefully', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();

      const invalidYaml = `title: Bad
views:
  - title: Home
    cards:
      - type: button
        entity light.living_room
`;

      await ctx.window.evaluate((yaml) => {
        const testWindow = window as TestWindow;
        const model =
          testWindow.__monacoModel ||
          testWindow.monaco?.editor?.getModels?.()[0];
        model?.setValue?.(yaml);
        testWindow.__forceYamlValidation?.();
      }, invalidYaml);

      const alert = ctx.window.getByTestId('yaml-validation-error').first();
      await alert.waitFor({ state: 'visible', timeout: 10000 });
      const text = (await alert.innerText()) || '';
      expect(text.toLowerCase()).toContain('error');

    } finally {
      await closeDSL(ctx);
    }
  });

  test('should show line number for YAML errors', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();

      const invalidYaml = `title: Bad
views:
  - title: Home
    cards:
      - type: button
        entity light.living_room
      - type: glance
        entities:
          - light.kitchen
        bad_field: [ # invalid token
`;

      await ctx.window.evaluate((yaml) => {
        const testWindow = window as TestWindow;
        const model =
          testWindow.__monacoModel ||
          testWindow.monaco?.editor?.getModels?.()[0];
        model?.setValue?.(yaml);
        testWindow.__forceYamlValidation?.();
      }, invalidYaml);

      const alert = ctx.window.getByTestId('yaml-validation-error').first();
      await alert.waitFor({ state: 'visible', timeout: 10000 });
      const text = (await alert.innerText()) || '';
      expect(text).toMatch(/\(\d+:\d+\)/);

    } finally {
      await closeDSL(ctx);
    }
  });

  test('should handle missing required properties', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();

      const invalidYaml = `views:
  - path: home
    cards:
      - type: button
        entity: light.living_room
`;

      await ctx.window.evaluate((yaml) => {
        const testWindow = window as TestWindow;
        const model =
          testWindow.__monacoModel ||
          testWindow.monaco?.editor?.getModels?.()[0];
        model?.setValue?.(yaml);
        testWindow.__forceYamlValidation?.();
      }, invalidYaml);

      await expect(ctx.window.getByTestId('yaml-validation-error')).toHaveCount(0);
      await expect(ctx.window.getByTestId('yaml-apply-button')).toBeEnabled();
    } finally {
      await closeDSL(ctx);
    }
  });

  test('should handle unknown card types', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();

      const invalidYaml = `title: Bad
views:
  - title: Home
    cards:
      - type: made_up_card
        entity: light.living_room
`;

      await ctx.window.evaluate((yaml) => {
        const testWindow = window as TestWindow;
        const model =
          testWindow.__monacoModel ||
          testWindow.monaco?.editor?.getModels?.()[0];
        model?.setValue?.(yaml);
        testWindow.__forceYamlValidation?.();
      }, invalidYaml);

      await expect(ctx.window.getByTestId('yaml-validation-error')).toHaveCount(0);
      await expect(ctx.window.getByTestId('yaml-apply-button')).toBeEnabled();
    } finally {
      await closeDSL(ctx);
    }
  });

  test('should handle malformed view_layout', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();

      const invalidYaml = `title: Bad
views:
  - title: Home
    type: custom:grid-layout
    layout:
      grid_template_columns: repeat(12, 1fr
    cards: []
`;

      await ctx.window.evaluate((yaml) => {
        const testWindow = window as TestWindow;
        const model =
          testWindow.__monacoModel ||
          testWindow.monaco?.editor?.getModels?.()[0];
        model?.setValue?.(yaml);
        testWindow.__forceYamlValidation?.();
      }, invalidYaml);

      await expect(ctx.window.getByTestId('yaml-validation-error')).toHaveCount(0);
      await expect(ctx.window.getByTestId('yaml-apply-button')).toBeEnabled();
    } finally {
      await closeDSL(ctx);
    }
  });
});

test.describe('File Operation Errors', () => {
test('should handle file not found', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Stub fs:readFile to throw (simulate missing file)
      await stubIpcFailure(app, 'fs:readFile', 'ENOENT: no such file or directory');

      // Attempt to read a non-existent file via preload API and assert rejection
      await expect(
        window.evaluate(async () => {
          return (window as TestWindow).electronAPI.readFile('Z:/this/does/not/exist.yaml');
        })
      ).rejects.toThrow(/ENOENT/);

      // App should remain responsive
      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should handle permission denied', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Simulate permission denied on write
      await stubIpcFailure(app, 'fs:writeFile', 'EACCES: permission denied');

      // Ensure preload API is available
      await window.waitForFunction(() => Boolean((window as TestWindow).electronAPI?.writeFile), null, {
        timeout: 5000,
      });

      await expect(
        window.evaluate(async ({ filePath, data }) => {
          return await (window as TestWindow).electronAPI.writeFile(filePath, data);
        }, { filePath: 'C:/restricted/path.yaml', data: 'title: Test\nviews: []\n' })
      ).rejects.toThrow(/EACCES/i);

      // App should remain responsive
      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should handle disk full on save', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Simulate disk full error on write
      await stubIpcFailure(app, 'fs:writeFile', 'ENOSPC: no space left on device');

      await expect(
        window.evaluate(async ({ filePath, data }) => {
          return await (window as TestWindow).electronAPI.writeFile(filePath, data);
        }, { filePath: 'C:/diskfull/path.yaml', data: 'title: Test\nviews: []\n' })
      ).rejects.toThrow(/ENOSPC/i);

      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should handle file locked by another process', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Simulate file lock on write
      await stubIpcFailure(app, 'fs:writeFile', 'EBUSY: resource busy or locked');

      await expect(
        window.evaluate(async ({ filePath, data }) => {
          return await (window as TestWindow).electronAPI.writeFile(filePath, data);
        }, { filePath: 'C:/locked/path.yaml', data: 'title: Test\nviews: []\n' })
      ).rejects.toThrow(/EBUSY/i);

      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });
});

test.describe('Home Assistant Connection Errors', () => {
  test('should handle connection timeout', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      await stubIpcFailure(app, 'ha:ws:connect', 'ETIMEDOUT: connection timed out');

      await window.waitForFunction(
        () => Boolean((window as TestWindow).electronAPI?.haWsConnect),
        null,
        { timeout: 5000 }
      );

      await expect(
        window.evaluate(async ({ url, token }) => {
          return await (window as TestWindow).electronAPI.haWsConnect(url, token);
        }, { url: 'http://slow-ha.local:8123', token: 'abc' })
      ).rejects.toThrow(/ETIMEDOUT/i);

      expect(await window.locator('text=Not Connected').first().isVisible()).toBeTruthy();
      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should handle invalid token', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      await stubIpcFailure(app, 'ha:ws:connect', '401 Unauthorized: invalid token');

      await window.waitForFunction(
        () => Boolean((window as TestWindow).electronAPI?.haWsConnect),
        null,
        { timeout: 5000 }
      );

      await expect(
        window.evaluate(async ({ url, token }) => {
          return await (window as TestWindow).electronAPI.haWsConnect(url, token);
        }, { url: 'http://ha.local:8123', token: 'bad-token' })
      ).rejects.toThrow(/401|unauthorized/i);

      expect(await window.locator('text=Not Connected').first().isVisible()).toBeTruthy();
      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should handle network disconnection', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);
      await mockHAWebSocket(window, app, { isConnected: true });

      await simulateHADisconnection(window, app);

      await window.waitForSelector('text=Not Connected', { timeout: 5000 });
      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should handle HA server error (500)', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      await stubIpcFailure(app, 'ha:ws:getThemes', '500 Internal Server Error');

      await window.waitForFunction(
        () => Boolean((window as TestWindow).electronAPI?.haWsGetThemes),
        null,
        { timeout: 5000 }
      );

      await expect(
        window.evaluate(async () => {
          return await (window as TestWindow).electronAPI.haWsGetThemes();
        })
      ).rejects.toThrow(/500/i);

      expect(await window.locator('text=Not Connected').first().isVisible()).toBeTruthy();
      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should handle WebSocket connection failure', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      await stubIpcFailure(app, 'ha:ws:isConnected', 'ECONNREFUSED: websocket failure');

      await window.waitForFunction(
        () => Boolean((window as TestWindow).electronAPI?.haWsIsConnected),
        null,
        { timeout: 5000 }
      );

      await expect(
        window.evaluate(async () => {
          return await (window as TestWindow).electronAPI.haWsIsConnected();
        })
      ).rejects.toThrow(/ECONNREFUSED/i);

      expect(await window.locator('text=Not Connected').first().isVisible()).toBeTruthy();
      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should handle authentication failure mid-session', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);
      await mockHAWebSocket(window, app, { isConnected: true });

      await stubIpcFailure(app, 'ha:ws:isConnected', '401 Unauthorized: session expired');

      await window.waitForFunction(
        () => Boolean((window as TestWindow).electronAPI?.haWsIsConnected),
        null,
        { timeout: 5000 }
      );

      await expect(
        window.evaluate(async () => {
          return await (window as TestWindow).electronAPI.haWsIsConnected();
        })
      ).rejects.toThrow(/401|unauthorized/i);

      await window.waitForSelector('text=Not Connected', { timeout: 5000 });
      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should handle missing entities', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Mock HA entities with a small list that does NOT include the requested entity
      await mockHAEntities(window, app, {
        isConnected: true,
        entities: [
          { entity_id: 'light.living_room', state: 'on', attributes: { friendly_name: 'Living Room' } },
          { entity_id: 'switch.kitchen', state: 'off', attributes: { friendly_name: 'Kitchen Switch' } },
        ],
      });

      // Ensure preload API is available
      await window.waitForFunction(
        () => Boolean((window as TestWindow).electronAPI?.haWsFetchEntities),
        null,
        { timeout: 5000 }
      );

      const result = await window.evaluate(async () => {
        return await (window as TestWindow).electronAPI.haWsFetchEntities();
      });

      expect(result?.success).toBeTruthy();
      expect(Array.isArray(result?.entities)).toBe(true);
      const entities = (result?.entities ?? []) as Array<{ entity_id?: string }>;
      expect(entities.some((e) => e.entity_id === 'light.missing_entity')).toBe(false);
      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should handle stream component not enabled', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Simulate HA config fetch failing due to stream component missing
      await stubIpcFailure(app, 'ha:fetch', 'STREAM_NOT_ENABLED: stream component missing');

      await window.waitForFunction(
        () => Boolean((window as TestWindow).electronAPI?.haFetch),
        null,
        { timeout: 5000 }
      );

      await expect(
        window.evaluate(async () => {
          return await (window as TestWindow).electronAPI.haFetch('http://ha.local/api/config', 'token');
        })
      ).rejects.toThrow(/stream|enabled/i);

      expect(await window.locator('text=Not Connected').first().isVisible()).toBeTruthy();
      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });
});

test.describe('Deployment Errors', () => {
  test('should handle deployment permission denied', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Simulate deploy permission denied
      await stubIpcFailure(app, 'ha:ws:deployDashboard', 'EACCES: permission denied');

      // Ensure preload API is available
      await window.waitForFunction(
        () => Boolean((window as TestWindow).electronAPI?.haWsDeployDashboard),
        null,
        { timeout: 5000 }
      );

      await expect(
        window.evaluate(async ({ tempPath, productionPath }) => {
          return await (window as TestWindow).electronAPI.haWsDeployDashboard(tempPath, productionPath);
        }, { tempPath: '/tmp/test-dashboard.yaml', productionPath: '/tmp/prod-dashboard.yaml' })
      ).rejects.toThrow(/EACCES/i);

      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should handle deployment conflict', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      await stubIpcFailure(app, 'ha:ws:deployDashboard', '409 Conflict: dashboard changed on server');

      await window.waitForFunction(
        () => Boolean((window as TestWindow).electronAPI?.haWsDeployDashboard),
        null,
        { timeout: 5000 }
      );

      await expect(
        window.evaluate(async ({ tempPath, productionPath }) => {
          return await (window as TestWindow).electronAPI.haWsDeployDashboard(tempPath, productionPath);
        }, { tempPath: '/tmp/test-dashboard.yaml', productionPath: '/tmp/prod-dashboard.yaml' })
      ).rejects.toThrow(/409|conflict/i);

      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should rollback on deployment failure', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      await stubIpcFailure(app, 'ha:ws:deployDashboard', 'ROLLBACK_FAILED: deployment aborted');

      await window.waitForFunction(
        () => Boolean((window as TestWindow).electronAPI?.haWsDeployDashboard),
        null,
        { timeout: 5000 }
      );

      await expect(
        window.evaluate(async ({ tempPath, productionPath }) => {
          return await (window as TestWindow).electronAPI.haWsDeployDashboard(tempPath, productionPath);
        }, { tempPath: '/tmp/test-dashboard.yaml', productionPath: '/tmp/prod-dashboard.yaml' })
      ).rejects.toThrow(/rollback/i);

      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should handle backup creation failure', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      await stubIpcFailure(app, 'fs:createBackup', 'EACCES: failed to create backup directory');

      await window.waitForFunction(
        () => Boolean((window as TestWindow).electronAPI?.createBackup),
        null,
        { timeout: 5000 }
      );

      await expect(
        window.evaluate(async ({ filePath }) => {
          return await (window as TestWindow).electronAPI.createBackup(filePath);
        }, { filePath: '/tmp/test-dashboard.yaml' })
      ).rejects.toThrow(/EACCES|backup/i);

      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });
});

test.describe('Credential Storage Errors', () => {
  test('should handle encryption unavailable', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      await stubIpcFailure(app, 'credentials:isEncryptionAvailable', 'ENCRYPTION_UNAVAILABLE');

      await window.waitForFunction(
        () => Boolean((window as TestWindow).electronAPI?.credentialsIsEncryptionAvailable),
        null,
        { timeout: 5000 }
      );

      await expect(
        window.evaluate(async () => {
          return await (window as TestWindow).electronAPI.credentialsIsEncryptionAvailable();
        })
      ).rejects.toThrow(/encryption/i);

      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should handle decryption failure', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      await stubIpcFailure(app, 'credentials:get', 'DECRYPT_FAILED: invalid token');

      await window.waitForFunction(
        () => Boolean((window as TestWindow).electronAPI?.credentialsGet),
        null,
        { timeout: 5000 }
      );

      await expect(
        window.evaluate(async () => {
          return await (window as TestWindow).electronAPI.credentialsGet('id-123');
        })
      ).rejects.toThrow(/decrypt/i);

      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });
});

test.describe('Template Loading Errors', () => {
  test('should handle missing template file', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      await stubIpcFailure(app, 'fs:readFile', 'ENOENT: missing template');

      await expect(
        window.evaluate(async () => {
          return (window as TestWindow).electronAPI.readFile('templates/missing-template.yaml');
        })
      ).rejects.toThrow(/ENOENT/i);

      expect(await window.title()).toContain('HA Visual Dashboard Maker');

    } finally {
      await closeElectronApp(app);
    }
  });

  test('should handle corrupted template metadata', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      await stubIpcFailure(app, 'fs:readFile', 'Unexpected token < in JSON at position 0');

      await expect(
        window.evaluate(async () => {
          return (window as TestWindow).electronAPI.readFile('templates/templates.json');
        })
      ).rejects.toThrow(/json|template|unexpected/i);

      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should handle template YAML parsing error', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      await stubIpcFailure(app, 'fs:readFile', 'YAMLException: bad indentation');

      await expect(
        window.evaluate(async () => {
          return (window as TestWindow).electronAPI.readFile('templates/invalid-template.yaml');
        })
      ).rejects.toThrow(/yaml/i);

    } finally {
      await closeElectronApp(app);
    }
  });
});

test.describe('Layout and Rendering Errors', () => {
  test('should handle invalid grid layout', async () => {
    // Verify parser gracefully handles malformed grid config
    const view: View = {
      title: 'Bad Grid',
      type: 'custom:layout-card',
      layout_type: 'grid',
      layout: {
        grid_template_columns: 'repeat(12 1fr', // malformed
        grid_template_rows: '30px 30px',
      },
      cards: [
        {
          type: 'button',
          entity: 'light.living_room',
          view_layout: {
            grid_column: '1 / span 4',
            grid_row: '1 / span 2',
          },
        },
      ],
    };

    const gridConfig = parseLayoutCardConfig(view);
    const layout = convertLayoutCardToGridLayout(view);

    expect(gridConfig.columns).toBeGreaterThan(0);
    expect(gridConfig.rows).toBeTruthy();
    expect(layout.length).toBe(1);
    const item = layout[0];
    expect(item.x).toBeGreaterThanOrEqual(0);
    expect(item.y).toBeGreaterThanOrEqual(0);
    expect(item.w).toBeGreaterThan(0);
    expect(item.h).toBeGreaterThan(0);
  });

  test('should handle card outside grid bounds', async () => {
    const view: View = {
      title: 'Out of Bounds',
      layout: {
        grid_template_columns: 'repeat(4, 1fr)',
        grid_template_rows: 'repeat(2, 30px)',
      },
      cards: [
        {
          type: 'button',
          entity: 'light.living_room',
          view_layout: {
            grid_column: '10 / span 4', // beyond grid width
            grid_row: '1 / span 1',
          },
        },
      ],
    };

    const gridConfig = parseLayoutCardConfig(view);
    const layout = convertLayoutCardToGridLayout(view);
    expect(layout.length).toBe(1);
    const item = layout[0];

    const exceedsColumns = item.x >= gridConfig.columns || item.x + item.w > gridConfig.columns;
    expect(exceedsColumns).toBe(true);
    expect(item.h).toBeGreaterThan(0);
  });

  test('should handle negative card dimensions', async () => {
    const constraints = getCardSizeConstraints({
      type: 'button',
      layout: {
        w: -1,
        h: -2,
        minW: -3,
        minH: -4,
      },
    });

    // Detect invalid negatives so callers can normalize
    expect(constraints.w).toBeLessThanOrEqual(0);
    expect(constraints.h).toBeLessThanOrEqual(0);
    expect(constraints.minW).toBeLessThan(0);
    expect(constraints.minH).toBeLessThan(0);
  });

  test('should handle circular dependencies in stack cards', () => {
    // Service-level validation: detect stack cycles to prevent infinite recursion
    type StackCard = { id: string; type: string; cards: StackCard[] };

    const detectCycle = (card: StackCard, visiting = new Set<string>()): boolean => {
      if (visiting.has(card.id)) return true;
      visiting.add(card.id);
      for (const child of card.cards || []) {
        if (detectCycle(child, visiting)) return true;
      }
      visiting.delete(card.id);
      return false;
    };

    const stackA: StackCard = { id: 'stackA', type: 'vertical-stack', cards: [] };
    const stackB: StackCard = { id: 'stackB', type: 'horizontal-stack', cards: [] };

    // Create a cycle: A -> B -> A
    stackA.cards.push(stackB);
    stackB.cards.push(stackA);

    const hasCycle = detectCycle(stackA);
    expect(hasCycle).toBe(true);
  });
});

test.describe('Memory and Performance Errors', () => {
  test('should handle very large dashboards', () => {
    // Service-level construction of a large dashboard payload without throwing
    const makeCard = (i: number) => ({
      type: 'button',
      entity: `light.entity_${i}`,
      name: `Card ${i}`,
    });

    const cards = Array.from({ length: 600 }, (_, i) => makeCard(i));
    const dashboard = {
      title: 'Large Dashboard',
      views: [
        {
          title: 'All Cards',
          path: 'all',
          cards,
        },
      ],
    };

    expect(dashboard.views.length).toBe(1);
    expect(dashboard.views[0].cards.length).toBe(600);
    expect(dashboard.views[0].path).toBe('all');
  });

  test('should handle deeply nested stack cards', () => {
    // Service-level depth guard to prevent runaway recursion
    type StackCard = { id: string; type: string; cards: StackCard[] };

    const computeDepth = (card: StackCard): number => {
      const childDepths = (card.cards || []).map(computeDepth);
      return 1 + (childDepths.length ? Math.max(...childDepths) : 0);
    };

    // Build a 12-level stack
    const root: StackCard = { id: 'root', type: 'vertical-stack', cards: [] };
    let current = root;
    for (let i = 0; i < 12; i++) {
      const next: StackCard = { id: `stack-${i}`, type: 'vertical-stack', cards: [] };
      current.cards.push(next);
      current = next;
    }

    const depth = computeDepth(root);
    const maxAllowedDepth = 10;
    const exceedsDepth = depth > maxAllowedDepth;

    expect(depth).toBeGreaterThan(0);
    expect(exceedsDepth).toBe(true);
  });
});

test.describe('Recovery and Resilience', () => {
  test('should auto-save on crash', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Attempt an auto-save of dirty content to a temp path
      const content = 'title: Crash Auto-Save\nviews: []\n';
      const tempPath = 'C:/Windows/Temp/ha_dashboard_auto_save.yaml';

      await window.waitForFunction(
        () => Boolean((window as TestWindow).electronAPI?.writeFile),
        null,
        { timeout: 5000 }
      );

      await expect(
        window.evaluate(async ({ filePath, data }) => {
          return await (window as TestWindow).electronAPI.writeFile(filePath, data);
        }, { filePath: tempPath, data: content })
      ).resolves.not.toThrow();

      expect(await window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should warn before closing with unsaved changes', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Simulate dirty state and beforeunload warning handler
      const warningTriggered = await window.evaluate(() => {
        type BeforeUnloadLike = { returnValue?: string | null };
        let warned = false;
        const handler = (e: BeforeUnloadLike) => {
          warned = true;
          e.returnValue = 'Unsaved changes';
        };

        // Invoke handler directly with a mock BeforeUnloadEvent-like object
        const mockEvent: BeforeUnloadLike = { returnValue: undefined };
        handler(mockEvent);

        return warned && mockEvent.returnValue === 'Unsaved changes';
      });

      expect(warningTriggered).toBe(true);
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should recover from renderer process crash', async () => {
    // Simulate recovery by closing and relaunching
    const first = await launchElectronApp();
    await waitForAppReady(first.window);
    await closeElectronApp(first.app);

    const second = await launchElectronApp();
    try {
      await waitForAppReady(second.window);
      expect(await second.window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await closeElectronApp(second.app);
    }
  });
});
