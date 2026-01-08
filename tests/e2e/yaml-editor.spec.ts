/**
 * E2E Test: YAML Editor (DSL-Based)
 *
 * YAML modal behavior is validated more thoroughly in integration tests.
 * These e2e checks are limited smoke tests; deeper coverage lives in integration specs.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';

test.describe('YAML Editor', () => {
  test('should expose Edit YAML entry point after creating dashboard', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      const editButton = ctx.window.getByRole('button', { name: /Edit YAML/i });
      await expect(editButton).toBeVisible({ timeout: 5000 });
    } finally {
      await close(ctx);
    }
  });

  test('should open YAML editor dialog and render editor', async ({}, testInfo) => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();
      await ctx.yamlEditor.expectMonacoVisible('modal', testInfo);
    } finally {
      await close(ctx);
    }
  });
});
