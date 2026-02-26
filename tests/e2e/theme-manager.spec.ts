import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';
import { ThemeManagerDSL } from '../support/dsl/themeManager';

const importedThemePayload = JSON.stringify(
  {
    version: 1,
    exportedAt: '2026-02-16T00:00:00.000Z',
    savedThemes: [
      {
        name: 'snapshot-e2e',
        createdAt: '2026-02-16T00:00:00.000Z',
        updatedAt: '2026-02-16T00:00:00.000Z',
        theme: {
          'primary-color': '#4fc3f7',
          'accent-color': '#00acc1',
          'primary-text-color': '#ffffff',
          'text-primary-color': '#ffffff',
          'secondary-text-color': '#d9f6ff',
          'primary-background-color': '#0f1a25',
          'card-background-color': '#142231',
        },
      },
    ],
    viewOverrides: {},
  },
  null,
  2
);

test.describe('Theme Manager', () => {
  test('supports import export load and per-view override workflows', async () => {
    const ctx = await launchWithDSL();
    const themeManager = new ThemeManagerDSL(ctx.window);

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await ctx.settings.open();
      await ctx.settings.selectTab('Appearance');

      await themeManager.openThemeManagerTab();
      await themeManager.expectActiveViewDetected();

      await themeManager.importJson(importedThemePayload);
      await themeManager.expectSavedThemeVisible('snapshot-e2e');

      await themeManager.selectSavedTheme('snapshot-e2e');
      await themeManager.loadSelectedTheme();
      await themeManager.expectSyncUnchecked();

      await themeManager.setViewOverride('snapshot-e2e');
      const exportJson = await themeManager.exportJson();

      expect(exportJson).toContain('snapshot-e2e');
      expect(exportJson).toContain('viewOverrides');

      await ctx.settings.close();
    } finally {
      await close(ctx);
    }
  });
});
