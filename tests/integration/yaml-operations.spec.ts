/**
 * Integration Test: YAML Operations
 *
 * Tests YAML loading, parsing, and exporting functionality.
 *
 * NOTE: These tests are placeholder TODOs and are SKIPPED.
 * YAML functionality is tested through:
 * - Monaco editor integration tests
 * - E2E tests
 * - Manual testing
 */

import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, waitForAppReady } from '../helpers/electron-helper';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

test.describe('YAML Operations', () => {
  const testDashboardPath = path.join(__dirname, '../fixtures/test-dashboard.yaml');

  test('should parse valid YAML dashboard', async () => {
    const { app, window, userDataDir } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      const yamlContent = fs.readFileSync(testDashboardPath, 'utf-8');
      const parsed = yaml.load(yamlContent) as any;

      expect(parsed).toBeTruthy();
      expect(parsed.title).toBeDefined();
      expect(Array.isArray(parsed.views)).toBe(true);
    } finally {
      await closeElectronApp(app, userDataDir);
    }
  });

  test('should handle layout-card YAML format', async () => {
    const { app, window, userDataDir } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      const layoutCardPath = path.join(__dirname, '../fixtures/layout-card-dashboard.yaml');
      const yamlContent = fs.readFileSync(layoutCardPath, 'utf-8');
      const parsed = yaml.load(yamlContent) as any;

      expect(parsed).toBeTruthy();
      const firstView = parsed.views?.[0];
      expect(firstView?.type).toBe('custom:grid-layout');
      expect(firstView?.layout).toBeDefined();
      expect(firstView?.layout?.grid_template_columns).toBeTruthy();
    } finally {
      await closeElectronApp(app, userDataDir);
    }
  });

  test('should preserve YAML formatting on round-trip', async () => {
    const { app, window, userDataDir } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      const original = fs.readFileSync(testDashboardPath, 'utf-8');
      const parsedOriginal = yaml.load(original);

      const dumped = yaml.dump(parsedOriginal as any);
      const parsedDumped = yaml.load(dumped);

      expect(parsedDumped).toEqual(parsedOriginal);
      expect(dumped).toContain('title:');
      expect((parsedDumped as any).views?.length).toBe((parsedOriginal as any).views?.length);
    } finally {
      await closeElectronApp(app, userDataDir);
    }
  });
});
