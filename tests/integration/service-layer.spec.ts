/**
 * Service-layer integration tests (non-UI)
 *
 * These tests exercise utility/service modules directly with light stubbing
 * of the Electron bridge where needed. They intentionally avoid UI flows so
 * they run fast and deterministically.
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { cardRegistry } from '../../src/services/cardRegistry';
import { fileService } from '../../src/services/fileService';
import { haConnectionService } from '../../src/services/haConnectionService';
import { getCardSizeConstraints, generateMasonryLayout } from '../../src/utils/cardSizingContract';
import {
  isLayoutCardGrid,
  parseViewLayout,
  convertLayoutCardToGridLayout,
  convertGridLayoutToViewLayout,
} from '../../src/utils/layoutCardParser';

const testDashboardPath = path.join(__dirname, '../fixtures/test-dashboard.yaml');
const layoutCardPath = path.join(__dirname, '../fixtures/layout-card-dashboard.yaml');
let credentialsService: any;

const ensureWindow = () => {
  if (!(globalThis as any).window) {
    (globalThis as any).window = {} as any;
  }
  if (!(globalThis as any).window.electronAPI) {
    (globalThis as any).window.electronAPI = {} as any;
  }
};

const originalWindow = (globalThis as any).window;

test.afterAll(() => {
  (globalThis as any).window = originalWindow;
});

test.describe('YAML Service Integration', () => {
  test('should parse and serialize dashboard round-trip', async () => {
    const yamlContent = fs.readFileSync(testDashboardPath, 'utf-8');
    const parsed = yaml.load(yamlContent) as any;
    const dumped = yaml.dump(parsed);
    const reParsed = yaml.load(dumped);

    expect(parsed).toBeTruthy();
    expect(reParsed).toEqual(parsed);
    expect((reParsed as any).views?.length).toBe((parsed as any).views?.length);
  });

  test('should validate YAML syntax before parsing', async () => {
    const invalidYaml = 'title: Test:\nviews:\n  - path: home\n    cards:\n      - type: button\n        entity light.kitchen'; // missing colon
    expect(() => yaml.load(invalidYaml)).toThrow();
    try {
      yaml.load(invalidYaml);
    } catch (err) {
      expect((err as Error).message.toLowerCase()).toContain('mapping');
    }
  });

  test('should handle YAML with comments', async () => {
    const yamlWithComments = `
title: Commented
# top level comment
views:
  - path: main
    # view comment
    cards:
      - type: button # inline comment
        entity: light.kitchen
`;
    const parsed = yaml.load(yamlWithComments) as any;
    expect(parsed.title).toBe('Commented');
    expect(parsed.views?.length).toBe(1);
    expect(parsed.views?.[0]?.cards?.[0]?.entity).toBe('light.kitchen');
  });

  test('should parse layout-card format correctly', async () => {
    const yamlContent = fs.readFileSync(layoutCardPath, 'utf-8');
    const parsed = yaml.load(yamlContent) as any;
    const firstView = parsed.views?.[0];

    expect(firstView?.type).toBe('custom:grid-layout');
    expect(firstView?.layout).toBeDefined();
    expect(firstView?.layout?.grid_template_columns).toBeTruthy();
  });
});

test.describe('Card Registry Integration', () => {
  test('should have all standard HA cards registered', async () => {
    const standardCards = [
      'entities',
      'button',
      'glance',
      'markdown',
      'sensor',
      'gauge',
      'light',
      'thermostat',
      'weather-forecast',
      'media-control',
      'horizontal-stack',
      'vertical-stack',
      'grid',
      'alarm-panel',
      'history-graph',
      'map',
      'picture',
      'picture-entity',
      'picture-glance',
      'plant-status',
    ];

    standardCards.forEach(type => {
      const meta = cardRegistry.get(type);
      expect(meta?.type).toBe(type);
      expect(meta?.isCustom).toBe(false);
    });
  });

  test('should have HACS custom cards registered', async () => {
    const customCards = [
      'custom:apexcharts-card',
      'custom:power-flow-card-plus',
      'custom:bubble-card',
      'custom:mushroom-entity-card', // example mushroom card
      'custom:mini-graph-card',
      'custom:better-thermostat-ui-card',
    ];

    customCards.forEach(type => {
      const meta = cardRegistry.get(type);
      expect(meta?.type).toBe(type);
      expect(meta?.isCustom).toBe(true);
      expect(meta?.source).toBe('hacs');
    });
  });

  test('should categorize cards correctly', async () => {
    const layoutCards = cardRegistry.getByCategory('layout');
    const controlCards = cardRegistry.getByCategory('control');
    const sensorCards = cardRegistry.getByCategory('sensor');

    expect(layoutCards.map(c => c.type)).toEqual(expect.arrayContaining(['horizontal-stack', 'grid']));
    expect(controlCards.map(c => c.type)).toEqual(expect.arrayContaining(['button', 'light']));
    expect(sensorCards.map(c => c.type)).toEqual(expect.arrayContaining(['entities', 'glance', 'sensor', 'gauge']));
  });

  test('should filter cards by source', async () => {
    const builtin = cardRegistry.getBySource('builtin');
    const hacs = cardRegistry.getBySource('hacs');

    expect(builtin.find(c => c.type === 'button')).toBeTruthy();
    expect(hacs.find(c => c.type === 'custom:apexcharts-card')).toBeTruthy();
    expect(hacs.every(c => c.isCustom)).toBe(true);
  });
});

test.describe('File Service Integration', () => {
  const tempPath = path.join(__dirname, '../fixtures/temp-file-service.txt');

  test.beforeEach(() => {
    ensureWindow();
    (globalThis as any).window.electronAPI.readFile = async (filePath: string) => {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return { success: true, content };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    };
    (globalThis as any).window.electronAPI.writeFile = async (filePath: string, content: string) => {
      try {
        fs.writeFileSync(filePath, content, 'utf-8');
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    };
    (globalThis as any).window.electronAPI.fileExists = async (filePath: string) => {
      return { exists: fs.existsSync(filePath) };
    };
  });

  test.afterEach(() => {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  });

  test('should read file via IPC', async () => {
    const content = 'file service read test';
    fs.writeFileSync(tempPath, content, 'utf-8');
    const result = await fileService.readFile(tempPath);
    expect(result.success).toBe(true);
    expect(result.content).toBe(content);
  });

  test('should write file via IPC', async () => {
    const content = 'file service write test';
    const result = await fileService.writeFile(tempPath, content);
    expect(result.success).toBe(true);
    expect(fs.readFileSync(tempPath, 'utf-8')).toBe(content);
  });

  test('should check file existence', async () => {
    fs.writeFileSync(tempPath, 'exists', 'utf-8');
    expect(await fileService.fileExists(tempPath)).toBe(true);
    expect(await fileService.fileExists(path.join(__dirname, 'missing-file.txt'))).toBe(false);
  });
});

test.describe('HA Connection Service Integration', () => {
  const sampleEntities = [
    { entity_id: 'light.one', state: 'on', attributes: { friendly_name: 'Light One' } },
    { entity_id: 'sensor.temp', state: '20', attributes: { friendly_name: 'Temp' } },
    { entity_id: 'switch.outlet', state: 'off', attributes: { friendly_name: 'Outlet' } },
  ];

  test.beforeEach(() => {
    ensureWindow();
    let callCount = 0;
    (globalThis as any).window.electronAPI.haFetch = async (url: string, _token: string) => {
      callCount += 1;
      if (url.endsWith('/api/states')) {
        return { success: true, data: sampleEntities, status: 200, callCount };
      }
      return { success: true, data: { version: '2024.5.0', components: ['stream'] }, status: 200, callCount };
    };
    (haConnectionService as any).entitiesCache = [];
    (haConnectionService as any).lastFetchTime = 0;
  });

  test.afterEach(() => {
    haConnectionService.disconnect();
  });

  test('should normalize HA URL format', async () => {
    haConnectionService.setConfig({ url: 'homeassistant.local/', token: 'abc' });
    expect(haConnectionService.getConfig()?.url).toBe('http://homeassistant.local');

    haConnectionService.setConfig({ url: 'https://ha.example.com/', token: 'abc' });
    expect(haConnectionService.getConfig()?.url).toBe('https://ha.example.com');
  });

  test('should cache entities with TTL', async () => {
    haConnectionService.setConfig({ url: 'http://ha.local', token: 'abc' });
    const first = await haConnectionService.fetchEntities();
    expect(first.length).toBe(sampleEntities.length);

    const second = await haConnectionService.fetchEntities();
    expect(second).toEqual(first);

    // Force cache expiry
    (haConnectionService as any).lastFetchTime = Date.now() - 31000;
    const third = await haConnectionService.fetchEntities();
    expect(third).toEqual(first);
  });

  test('should group entities by domain', async () => {
    haConnectionService.setConfig({ url: 'http://ha.local', token: 'abc' });
    const entities = await haConnectionService.fetchEntities();
    const grouped = entities.reduce<Record<string, any[]>>((acc, entity) => {
      const [domain] = entity.entity_id.split('.');
      acc[domain] = acc[domain] || [];
      acc[domain].push(entity);
      return acc;
    }, {});

    expect(grouped.light?.length).toBe(1);
    expect(grouped.sensor?.length).toBe(1);
    expect(grouped.switch?.length).toBe(1);
  });

  test('should validate entity existence', async () => {
    haConnectionService.setConfig({ url: 'http://ha.local', token: 'abc' });
    expect(await haConnectionService.validateEntity('light.one')).toBe(true);
    expect(await haConnectionService.validateEntity('light.unknown')).toBe(false);
  });

  test('should batch validate multiple entities', async () => {
    haConnectionService.setConfig({ url: 'http://ha.local', token: 'abc' });
    const results = await haConnectionService.validateEntities(['light.one', 'sensor.temp', 'light.unknown']);
    expect(results.get('light.one')).toBe(true);
    expect(results.get('sensor.temp')).toBe(true);
    expect(results.get('light.unknown')).toBe(false);
  });
});

test.describe('Template Service Integration', () => {
  test('should load template metadata from JSON', async () => {
    const templatesPath = path.join(__dirname, '../../templates/templates.json');
    const raw = fs.readFileSync(templatesPath, 'utf-8');
    const parsed = JSON.parse(raw);

    expect(Array.isArray(parsed.templates)).toBe(true);
    expect(parsed.templates.length).toBe(7);
    expect(Array.isArray(parsed.categories)).toBe(true);
    expect(parsed.categories.length).toBe(7);
  });

  const loadTemplateMetadata = () => {
    const templatesPath = path.join(__dirname, '../../templates/templates.json');
    const raw = fs.readFileSync(templatesPath, 'utf-8');
    return JSON.parse(raw);
  };

  test('should load template YAML content', async () => {
    const meta = loadTemplateMetadata();
    const first = meta.templates[0];
    const templatePath = path.join(__dirname, '../../templates', first.file);
    const raw = fs.readFileSync(templatePath, 'utf-8');
    const parsed = yaml.load(raw) as any;

    expect(raw).toContain('views');
    expect(parsed).toBeTruthy();
    expect(Array.isArray(parsed.views)).toBe(true);
    expect(parsed.views.length).toBeGreaterThan(0);
  });

  test('should check required entities for template', async () => {
    const meta = loadTemplateMetadata();
    const tpl = meta.templates.find((t: any) => t.requiredEntities?.length >= 2)!;

    const userEntities = tpl.requiredEntities.slice(0, tpl.requiredEntities.length - 1);
    const missing = tpl.requiredEntities.filter((e: string) => !userEntities.includes(e));
    const present = tpl.requiredEntities.filter((e: string) => userEntities.includes(e));

    expect(missing.length).toBeGreaterThan(0);
    expect(present.length).toBeGreaterThan(0);
    expect(missing.length + present.length).toBe(tpl.requiredEntities.length);
  });

  test('should recommend templates based on entities', async () => {
    const meta = loadTemplateMetadata();
    const userEntities = ['sensor.grid_power', 'sensor.solar_power', 'sensor.home_power', 'sensor.current_power_usage'];

    const recommendations = meta.templates
      .map((tpl: any) => {
        const present = tpl.requiredEntities.filter((e: string) => userEntities.includes(e));
        const score = present.length / tpl.requiredEntities.length;
        return { tpl, score };
      })
      .filter((r: any) => r.score >= 0.5)
      .sort((a: any, b: any) => b.score - a.score)
      .map((r: any) => r.tpl.id);

    expect(recommendations).toContain('energy-management');
  });

  test('should search templates by query', async () => {
    const meta = loadTemplateMetadata();
    const search = (query: string) =>
      meta.templates
        .filter(
          (t: any) =>
            t.name.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query) ||
            t.tags.some((tag: string) => tag.toLowerCase().includes(query))
        )
        .map((t: any) => t.id);

    const energyMatches = search('energy');
    expect(energyMatches).toContain('energy-management');

    const securityMatches = search('security');
    expect(securityMatches).toContain('security-surveillance');
  });
});

test.describe('Credentials Service Integration', () => {
  const electronModulePath = require.resolve('electron');
  const credentialsModulePath = require.resolve('../../src/services/credentialsService');
  let originalElectronCache: any;

  const installSafeStorageMock = () => {
    originalElectronCache = require.cache[electronModulePath];
    const mockElectron = {
      safeStorage: {
        isEncryptionAvailable: () => true,
        encryptString: (text: string) => Buffer.from(`enc:${text}`),
        decryptString: (buf: Buffer) => buf.toString().replace(/^enc:/, ''),
      },
    };
    require.cache[electronModulePath] = {
      id: electronModulePath,
      filename: electronModulePath,
      loaded: true,
      exports: mockElectron,
    };
    delete require.cache[credentialsModulePath];
    credentialsService = require('../../src/services/credentialsService').credentialsService;
  };

  const resetCredentials = () => {
    credentialsService?.clearAllCredentials?.();
    delete require.cache[credentialsModulePath];
    if (originalElectronCache) {
      require.cache[electronModulePath] = originalElectronCache;
    } else {
      delete require.cache[electronModulePath];
    }
  };

  test.beforeEach(() => {
    installSafeStorageMock();
  });

  test.afterEach(() => {
    resetCredentials();
  });

  test('should check encryption availability', async () => {
    expect(credentialsService.isEncryptionAvailable()).toBe(true);
  });

  test('should save and retrieve credentials', async () => {
    const saved = credentialsService.saveCredential('Test', 'http://ha.local/', 'token123');
    const stored = credentialsService.getCredential(saved.id);

    expect(saved.url).toBe('http://ha.local');
    expect(saved.encryptedToken).not.toBe('token123');
    expect(stored?.token).toBe('token123');
    expect(stored?.url).toBe('http://ha.local');
  });

  test('should list credentials without tokens', async () => {
    credentialsService.saveCredential('One', 'http://ha.one', 'token1');
    credentialsService.saveCredential('Two', 'http://ha.two', 'token2');

    const all = credentialsService.getAllCredentials();
    expect(all.length).toBe(2);
    expect(all.every(c => !(c as any).encryptedToken)).toBe(true);
  });

  test('should track last used credential', async () => {
    credentialsService.saveCredential('One', 'http://ha.one', 'token1');
    const second = credentialsService.saveCredential('Two', 'http://ha.two', 'token2');

    credentialsService.markAsUsed(second.id);

    const last = credentialsService.getLastUsedCredential();
    expect(last?.url).toBe('http://ha.two');
    expect(last?.id).toBe(second.id);
    expect(last?.token).toBe('token2');
  });

  test('should delete credentials securely', async () => {
    const saved = credentialsService.saveCredential('DeleteMe', 'http://ha.delete', 'token-delete');

    const removed = credentialsService.deleteCredential(saved.id);
    expect(removed).toBe(true);
    expect(credentialsService.getCredential(saved.id)).toBeNull();

    const all = credentialsService.getAllCredentials();
    expect(all.find(c => c.id === saved.id)).toBeUndefined();
  });
});

test.describe('Card Sizing Contract Integration', () => {
  test('should calculate correct sizes for standard cards', async () => {
    const button = getCardSizeConstraints({ type: 'button' } as any);
    expect(button.minW).toBeGreaterThanOrEqual(2);
    expect(button.minH).toBeGreaterThanOrEqual(2);

    const entities = getCardSizeConstraints({
      type: 'entities',
      title: 'List',
      entities: ['light.one', 'switch.two', 'sensor.three', 'sensor.four'],
    } as any);
    expect(entities.minW).toBeGreaterThanOrEqual(4);
    expect(entities.minH).toBeGreaterThanOrEqual(2);

    const glance = getCardSizeConstraints({
      type: 'glance',
      entities: ['light.one', 'switch.two', 'sensor.three', 'sensor.four', 'sensor.five', 'sensor.six'],
    } as any);
    expect(glance.minW).toBeGreaterThanOrEqual(3);
    expect(glance.minH).toBeGreaterThanOrEqual(2);

    const markdown = getCardSizeConstraints({
      type: 'markdown',
      content: 'Line 1\nLine 2\nLine 3',
    } as any);
    expect(markdown.minH).toBeGreaterThanOrEqual(2);
  });

  test('should generate masonry layout correctly', async () => {
    const cards = [
      { type: 'button', view_layout: {} },
      { type: 'entities', entities: ['light.one', 'switch.two'], view_layout: {} },
      { type: 'markdown', content: 'Hello', view_layout: {} },
    ] as any[];

    const layout = generateMasonryLayout(cards, 12, 2);
    expect(layout.length).toBe(3);
    expect(layout.every(item => item.w > 0 && item.h > 0)).toBe(true);

    const xs = layout.map(l => l.x);
    expect(xs).toEqual(expect.arrayContaining([0, 6]));
  });
});

test.describe('Layout Card Parser Integration', () => {
  test('should detect layout-card format', async () => {
    const viewWithLayout = {
      type: 'custom:layout-card',
      layout: { grid_template_columns: 'repeat(12, 1fr)' },
      cards: [],
    } as any;
    const viewWithoutLayout = { type: 'panel', cards: [] } as any;

    expect(isLayoutCardGrid(viewWithLayout)).toBe(true);
    expect(isLayoutCardGrid(viewWithoutLayout)).toBe(false);
  });

  test('should parse CSS grid coordinates', async () => {
    const gridConfig = { columns: 12, rows: '30px' } as any;
    const card = {
      type: 'button',
      view_layout: {
        grid_column: '1 / 7',
        grid_row: '1 / span 2',
      },
    } as any;

    const pos = parseViewLayout(card, 0, gridConfig);
    expect(pos).toEqual({ x: 0, y: 0, w: 6, h: 2 });
  });

  test('should convert layout-card to RGL format', async () => {
    const view = {
      type: 'custom:layout-card',
      layout: { grid_template_columns: 'repeat(12, 1fr)', grid_template_rows: 'repeat(auto-fill, 56px)' },
      cards: [
        { type: 'button', view_layout: { grid_column: '1 / 5', grid_row: '1 / 3' } },
        { type: 'entities', view_layout: { grid_column: '5 / 9', grid_row: '1 / 2' } },
      ],
    } as any;

    const layout = convertLayoutCardToGridLayout(view);
    expect(layout.length).toBe(2);
    expect(layout[0].x).toBe(0);
    expect(layout[0].w).toBe(4);
    expect(layout[0].h).toBe(2);

    const backToViewLayout = convertGridLayoutToViewLayout(layout);
    expect(backToViewLayout[0].grid_column).toBe('1 / 5');
    expect(backToViewLayout[0].grid_row).toBe('1 / 3');
  });
});
