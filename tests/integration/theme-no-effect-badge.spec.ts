/**
 * F3 / HA-06 — the interim "no preview effect" badge, RENDERED.
 *
 * ⚠⚠ WHY THIS EXISTS ALONGSIDE `tests/unit/themeBadge.spec.ts`.
 * The unit spec proves `buildThemeOptions` COMPUTES the flag. It does not prove
 * a single pixel reaches the user — confirming the wiring is not confirming
 * that a value flows through it. The badge is a UI affordance whose entire
 * purpose is to be seen, so the flag being correct while the tag never renders
 * would satisfy the unit spec completely and ship the defect intact. This spec
 * drives the real picker and asserts on the rendered element.
 *
 * ⚠ It feeds the REAL captured theme definitions through the app's own
 * `__testThemeApi.applyThemes` hook — the same route `App.tsx` uses for HA
 * payloads — rather than the synthetic `mockThemeData` fixture, whose
 * `mushroom` entry supplies all seven variables `getThemeColors` reads and
 * would therefore render NO badge and prove nothing.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close } from '../support';
import { mockHAWebSocket } from '../helpers/mockHelpers';
import { REAL_HA_THEMES } from '../fixtures/realHaThemes';

/** The shape `__testThemeApi.applyThemes` expects — HA's `frontend/get_themes`. */
const realThemePayload = {
  default_theme: 'default',
  default_dark_theme: null,
  theme: 'default',
  darkMode: false,
  themes: REAL_HA_THEMES,
};

async function connectWithRealThemes(ctx: Awaited<ReturnType<typeof launchWithDSL>>) {
  await mockHAWebSocket(ctx.window, ctx.app, {
    isConnected: true,
    themes: realThemePayload,
  });

  await ctx.window.waitForFunction(() => Boolean((window as any).__testThemeApi), null, {
    timeout: 5000,
  });

  await ctx.window.evaluate((themes) => {
    (window as any).__testThemeApi?.setConnected(true);
    (window as any).__testThemeApi?.applyThemes(themes);
  }, realThemePayload);
}

test.describe('F3 — the "no preview effect" badge renders', () => {
  test('badges the real Mushroom themes and leaves Material You unbadged', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await connectWithRealThemes(ctx);

      await ctx.window.getByTestId('theme-select').click();
      const options = ctx.window.locator('.ant-select-item-option');
      await expect(options.first()).toBeVisible({ timeout: 5000 });

      // ⚠ Selected by the antd-derived `title`, NOT by option text: the badge
      // adds text to the row, so an anchored `^name$` matcher would now miss a
      // badged option. That `label` stays a plain string is exactly what keeps
      // this selector — and theme-restore.spec.ts:79 — working.
      const mushroom = ctx.window.locator('.ant-select-item-option[title="Mushroom"]');
      await expect(mushroom).toBeVisible({ timeout: 5000 });
      await expect(
        mushroom.getByTestId('theme-no-effect-badge'),
        'the real Mushroom theme defines none of the six canvas fields and must be badged',
      ).toBeVisible();
      await expect(mushroom).toContainText('no preview effect');

      // The negative control, and the assertion that would catch a badge
      // rendered unconditionally — the failure mode a positive-only test misses.
      const materialYou = ctx.window.locator('.ant-select-item-option[title="Material You"]');
      await expect(materialYou).toBeVisible();
      await expect(
        materialYou.getByTestId('theme-no-effect-badge'),
        'Material You defines all six canvas fields and must NOT be badged',
      ).toHaveCount(0);

      await ctx.window.keyboard.press('Escape');
    } finally {
      await close(ctx);
    }
  });

  test('carries the badge onto the selected value once a badged theme is chosen', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await connectWithRealThemes(ctx);

      await ctx.window.getByTestId('theme-select').click();
      const options = ctx.window.locator('.ant-select-item-option');
      await expect(options.first()).toBeVisible({ timeout: 5000 });
      await ctx.window.locator('.ant-select-item-option[title="Mushroom Square"]').click();

      // The dropdown is closed now, so this can only be the collapsed selector.
      const selector = ctx.window.getByTestId('theme-selector');
      await expect(
        selector.getByTestId('theme-no-effect-badge'),
        'a badged theme must stay marked after selection, not only while the list is open',
      ).toBeVisible({ timeout: 5000 });
    } finally {
      await close(ctx);
    }
  });

  /**
   * ⚠⚠ THE SECOND PICKER. `buildThemeOptions` feeds TWO Selects that render the
   * badge — `theme-select` in `ThemeSelector` and `theme-settings-select` in
   * `ThemeSettingsDialog` — and the three legs above drive only the first. An
   * author reading pass caught the asymmetry: the code looks symmetric, but
   * "looks symmetric" is not evidence, and the dialog computes its badge from
   * `localDarkMode` rather than the store's `darkMode`, so it is not even the
   * same expression. This leg exists so both rendering surfaces are measured.
   *
   * ⓘ The dialog's other two Selects (`theme-manager-saved-select`,
   * `theme-manager-view-override`) deliberately do NOT render the badge, which
   * is why the anchored `^name$` matchers in `tests/support/dsl/themeManager.ts`
   * keep working.
   */
  test('badges the same themes in the Theme Settings dialog picker', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await connectWithRealThemes(ctx);

      await ctx.settings.open();
      await ctx.settings.selectTab('Appearance');

      const select = ctx.window.getByTestId('theme-settings-select');
      await expect(select).toBeVisible({ timeout: 5000 });
      await select.click();

      const mushroom = ctx.window.locator('.ant-select-item-option[title="Mushroom Square"]');
      await expect(mushroom).toBeVisible({ timeout: 5000 });
      await expect(
        mushroom.getByTestId('theme-no-effect-badge'),
        'the dialog picker must badge a theme with no canvas colours, exactly as the header picker does',
      ).toBeVisible();

      const materialYou = ctx.window.locator('.ant-select-item-option[title="Material You"]');
      await expect(materialYou).toBeVisible();
      await expect(
        materialYou.getByTestId('theme-no-effect-badge'),
        'Material You defines all six and must NOT be badged in the dialog either',
      ).toHaveCount(0);

      await ctx.window.keyboard.press('Escape');
      await ctx.settings.close();
    } finally {
      await close(ctx);
    }
  });

  test('leaves a built-in theme unbadged with no HA connection', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();

      // No connection: the built-ins are the whole population here, and all
      // four define every key `getThemeColors` reads.
      await ctx.window.getByTestId('theme-select').click();
      const options = ctx.window.locator('.ant-select-item-option');
      await expect(options.first()).toBeVisible({ timeout: 5000 });

      await expect(
        ctx.window.locator('.ant-select-dropdown').getByTestId('theme-no-effect-badge'),
        'no built-in theme may ever be badged',
      ).toHaveCount(0);

      await ctx.window.keyboard.press('Escape');
    } finally {
      await close(ctx);
    }
  });
});
