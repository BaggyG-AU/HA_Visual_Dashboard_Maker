import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

/**
 * RC5 — themes and the Preset Marketplace are LOCAL content and must be
 * reachable with no Home Assistant connection at all.
 *
 * ⚠ These specs deliberately NEVER call `appDSL.setConnected(true)`.
 * `tests/e2e/preset-marketplace.spec.ts` and `tests/e2e/theme-manager.spec.ts`
 * both force a connected/seeded state before they begin, so both stayed green
 * for the whole period the offline path was unreachable — the same seam-blind
 * shape as RC1/RC2/RC3. The whole point of this file is the unmocked side.
 *
 * Assertions here read OUTCOMES (is the control enabled, does the panel mount,
 * does the picker offer options), never announcements.
 */
test.describe('Offline local content (no HA connection)', () => {
  test('opens the Preset Marketplace with no HA connection', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();

      // Welcome screen: the marketplace entry point must be usable offline.
      const browseButton = ctx.window
        .getByRole('button', { name: /Browse HA Dashboards|Download/i })
        .first();
      await expect(browseButton).toBeVisible();
      await expect(browseButton).toBeEnabled();

      await browseButton.click();

      const modalWrap = ctx.window.locator('.ant-modal-wrap:visible').first();
      await expect(modalWrap).toBeVisible({ timeout: 10000 });

      const presetTab = modalWrap.getByRole('tab', { name: /Preset Marketplace/i });
      await expect(presetTab).toBeVisible({ timeout: 10000 });
      await presetTab.click();

      // The seeded catalog is entirely local — it must list without HA.
      await expect(ctx.window.getByTestId('preset-marketplace-panel')).toBeVisible({
        timeout: 10000,
      });
      await expect(
        ctx.window.getByTestId('preset-marketplace-item-starter-room-overview'),
      ).toBeVisible({ timeout: 10000 });
    } finally {
      await close(ctx);
    }
  });

  test('offers selectable themes with no HA connection', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await ctx.settings.open();
      await ctx.settings.selectTab('Appearance');

      const themeSelect = ctx.window.getByTestId('theme-settings-select');
      await expect(themeSelect).toBeVisible({ timeout: 10000 });

      // Outcome, not announcement: the control is actually operable.
      await expect(themeSelect).not.toHaveClass(/ant-select-disabled/);

      await themeSelect.click();
      const dropdown = ctx.window
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .last();
      await expect(dropdown).toBeVisible({ timeout: 10000 });

      const options = dropdown.locator('.ant-select-item-option');
      await options.first().waitFor({ state: 'visible', timeout: 10000 });
      expect(await options.count()).toBeGreaterThan(0);

      await ctx.window.keyboard.press('Escape');
      await ctx.settings.close();
    } finally {
      await close(ctx);
    }
  });

  test('applying a built-in theme visibly repaints the canvas surface', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      const canvas = ctx.window.getByTestId('canvas-surface');
      await expect(canvas).toBeVisible({ timeout: 10000 });

      const before = await canvas.evaluate((el) => getComputedStyle(el).backgroundColor);

      // Apply a built-in theme through the real UI, with no HA connection.
      await ctx.settings.open();
      await ctx.settings.selectTab('Appearance');

      const themeSelect = ctx.window.getByTestId('theme-settings-select');
      await themeSelect.click();
      const dropdown = ctx.window
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .last();
      await expect(dropdown).toBeVisible({ timeout: 10000 });

      const highContrast = dropdown
        .locator('.ant-select-item-option', { hasText: /^HAVDM High Contrast$/ })
        .first();
      await highContrast.waitFor({ state: 'visible', timeout: 10000 });
      await highContrast.click();

      await ctx.window.getByTestId('theme-settings-apply').click();
      await ctx.settings.close();

      // ⭐ OUTCOME, NOT ANNOUNCEMENT. Before RC5 the theme pipeline set ~30 CSS
      // custom properties that nothing in src/ read, so this value never moved.
      await expect
        .poll(async () => canvas.evaluate((el) => getComputedStyle(el).backgroundColor), {
          timeout: 10000,
        })
        .not.toBe(before);
    } finally {
      await close(ctx);
    }
  });

  test('keeps Deploy gated while the local marketplace is open to everyone', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      // CONTROL LEG — proves the toolbar rendered and that this run really is
      // offline-but-capable. Without it, the Deploy assertion below could pass
      // against a toolbar that never mounted.
      // ⚠ Located by testid, NOT by role-name: every antd icon renders
      // `role="img" aria-label="<icon>"`, so the Download button's accessible
      // name is "download Download" and an anchored /^Download$/ never matches.
      const downloadButton = ctx.window.getByTestId('toolbar-download');
      await expect(downloadButton).toBeVisible({ timeout: 10000 });
      await expect(downloadButton).toBeEnabled();

      // Deploy genuinely needs a connection and must NOT be un-gated by RC5.
      const deployButton = ctx.window.getByTestId('toolbar-deploy');
      await expect(deployButton).toBeVisible({ timeout: 10000 });
      await expect(deployButton).toBeDisabled();
    } finally {
      await close(ctx);
    }
  });
});
