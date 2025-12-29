/**
 * E2E Test: Dashboard Templates (DSL-Based)
 *
 * Templates UI is not fully implemented; tests are scoped to smoke checks and placeholders.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

test.describe('Dashboard Templates', () => {
  test('should render app shell (templates entry point pending)', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      expect(await ctx.window.title()).toContain('HA Visual Dashboard Maker');
    } finally {
      await close(ctx);
    }
  });

  test.skip('should warn before replacing current dashboard (pending template loader)', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      expect(true).toBe(true);
    } finally {
      await close(ctx);
    }
  });

  test.skip('should list templates and allow filtering (pending templates UI)', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      expect(true).toBe(true);
    } finally {
      await close(ctx);
    }
  });
});
