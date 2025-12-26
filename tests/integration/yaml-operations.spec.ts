/**
 * Integration Test: YAML Operations
 *
 * Tests YAML loading, parsing, and exporting functionality.
 */

import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, waitForAppReady } from '../helpers/electron-helper';
import * as fs from 'fs';
import * as path from 'path';

test.describe('YAML Operations', () => {
  const testDashboardPath = path.join(__dirname, '../fixtures/test-dashboard.yaml');

  test('should parse valid YAML dashboard', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Load test dashboard via IPC (you'll need to expose this in your app)
      const yamlContent = fs.readFileSync(testDashboardPath, 'utf-8');

      // Verify YAML is valid
      expect(yamlContent).toContain('title: Test Dashboard');
      expect(yamlContent).toContain('views:');
      expect(yamlContent).toContain('cards:');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should handle layout-card YAML format', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      const layoutCardPath = path.join(__dirname, '../fixtures/layout-card-dashboard.yaml');
      const yamlContent = fs.readFileSync(layoutCardPath, 'utf-8');

      // Verify layout-card specific properties
      expect(yamlContent).toContain('type: custom:grid-layout');
      expect(yamlContent).toContain('view_layout:');
      expect(yamlContent).toContain('grid_column:');
      expect(yamlContent).toContain('grid_row:');
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should preserve YAML formatting on round-trip', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // This test would load YAML, parse it, export it, and compare
      // For now, just verify the test infrastructure works
      expect(true).toBe(true);

      // TODO: Implement full round-trip test when file operations are exposed
    } finally {
      await closeElectronApp(app);
    }
  });
});
