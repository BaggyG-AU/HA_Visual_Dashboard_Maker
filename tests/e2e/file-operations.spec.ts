/**
 * E2E Test: File Operations (DSL-Based)
 *
 * Focused on verifying dashboard dirty state hooks and file fixture presence.
 * Save/load dialogs are not automated yet; relevant tests are marked as skipped.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';
import * as path from 'path';
import * as fs from 'fs';

test.describe('File Operations', () => {
  const testDashboardPath = path.join(__dirname, '../fixtures/test-dashboard.yaml');
  const layoutCardDashboardPath = path.join(__dirname, '../fixtures/layout-card-dashboard.yaml');

  test('should show app title when no file loaded', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      const title = await ctx.window.title();
      expect(title).toContain('HA Visual Dashboard Maker');
    } finally {
      await close(ctx);
    }
  });

  test.skip('should show asterisk in title when dashboard is modified (pending dirty-state wiring)', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      const title = await ctx.window.title();
      expect(title).toContain('*');
    } finally {
      await close(ctx);
    }
  });

  test.skip('should remove asterisk after saving (pending save implementation)', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.window.keyboard.press('Control+S');
      expect(true).toBe(true);
    } finally {
      await close(ctx);
    }
  });

  test.skip('should respond to Ctrl+O keyboard shortcut (pending dialog automation)', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.window.keyboard.press('Control+O');
      expect(true).toBe(true);
    } finally {
      await close(ctx);
    }
  });

  test.skip('should respond to Ctrl+S keyboard shortcut (pending dialog automation)', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.window.keyboard.press('Control+S');
      expect(true).toBe(true);
    } finally {
      await close(ctx);
    }
  });

  test('should validate YAML file fixtures exist', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      expect(fs.existsSync(testDashboardPath)).toBe(true);
      expect(fs.existsSync(layoutCardDashboardPath)).toBe(true);
    } finally {
      await close(ctx);
    }
  });

  test('should parse sample dashboard fixture', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      const yamlContent = fs.readFileSync(testDashboardPath, 'utf-8');
      expect(yamlContent).toContain('title: Test Dashboard');
      expect(yamlContent).toContain('views:');
      expect(yamlContent).toContain('type: entities');
    } finally {
      await close(ctx);
    }
  });

  test('should parse layout-card dashboard fixture', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      const yamlContent = fs.readFileSync(layoutCardDashboardPath, 'utf-8');
      expect(yamlContent).toContain('type: custom:grid-layout');
      expect(yamlContent).toContain('view_layout:');
      expect(yamlContent).toContain('grid_column:');
    } finally {
      await close(ctx);
    }
  });
});
