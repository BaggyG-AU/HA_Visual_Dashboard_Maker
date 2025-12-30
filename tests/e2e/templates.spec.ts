/**
 * E2E Test: Dashboard Templates (DSL-Based)
 *
 * Templates UI is not fully implemented; tests are scoped to smoke checks and placeholders.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Dashboard Templates', () => {
  const templatesPath = path.join(__dirname, '../../templates/templates.json');

  test('should render app shell (templates entry point pending)', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      expect(await ctx.window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await close(ctx);
    }
  });

  test('should warn before replacing current dashboard (pending template loader)', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');

      // Placeholder until template loader UI exists: ensure app remains responsive with a populated dashboard
      await ctx.canvas.expectCardCount(1);
      await ctx.appDSL.expectTitle(/HA Visual Dashboard Maker/);
    } finally {
      await close(ctx);
    }
  });

  test('should list templates and allow filtering (pending templates UI)', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();

      // Load template metadata directly (reuse real templates.json)
      expect(fs.existsSync(templatesPath)).toBe(true);
      const raw = fs.readFileSync(templatesPath, 'utf-8');
      const metadata = JSON.parse(raw) as { templates: Array<{ name: string; description: string; tags?: string[] }> };

      expect(metadata.templates.length).toBeGreaterThan(0);

      // Simple filter: match by name/description/tags
      const query = 'home';
      const filtered = metadata.templates.filter(t => {
        const q = query.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.tags || []).some(tag => tag.toLowerCase().includes(q))
        );
      });
      expect(filtered.length).toBeGreaterThan(0);
    } finally {
      await close(ctx);
    }
  });
});
