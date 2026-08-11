/**
 * F3 / HA-06 — the interim "no preview colours" badge, RENDERED.
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
import { ThemeManagerDSL } from '../support/dsl/themeManager';

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

test.describe('F3 — the "no preview colours" badge renders', () => {
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
      // ⚠⚠ RED LEG for Codex round-1 finding M1. On `c1acb52` the badge read
      // "no preview effect" — a claim the predicate cannot establish, because a
      // theme defining only `swiper-theme-color` was badged while visibly
      // recolouring the real carousel arrow. The wording now states only what
      // is measured: none of the colours HAVDM previews.
      await expect(mushroom).toContainText('no preview colours');
      await expect(
        mushroom,
        'the badge must not claim an absence of EFFECT — only of mapped preview colours',
      ).not.toContainText('no preview effect');

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
   * ⚠⚠ THE SECOND PICKER. `buildThemeOptions` feeds `theme-select` in
   * `ThemeSelector` and `theme-settings-select` in `ThemeSettingsDialog`, and
   * the legs above drive only the first. An author reading pass caught the
   * asymmetry: the code looks symmetric, but "looks symmetric" is not evidence,
   * and the dialog computes its badge from `localDarkMode` rather than the
   * store's `darkMode`, so it is not even the same expression. This leg exists
   * so both rendering surfaces are measured.
   *
   * ⚠⚠⚠ THE NOTE THAT USED TO SIT HERE WAS THE DEFECT, NOT THE DOCUMENTATION.
   * It read: the dialog's other two Selects "deliberately do NOT render the
   * badge, which is why the anchored `^name$` matchers in
   * `tests/support/dsl/themeManager.ts` keep working." Codex's round-1 review
   * (finding M2) named that for what it was — **the product's warning
   * population derived from what the existing tests could match.** Four
   * controls apply a theme, not two: `theme-select` and `theme-settings-select`
   * call `setTheme`, `theme-manager-saved-select` + Load calls `loadSavedTheme`
   * (`src/store/themeStore.ts`, which sets `baseTheme` and re-derives the
   * effective state), and `theme-manager-view-override` calls `setViewOverride`
   * (which re-derives it too). All four now badge, the matchers were retargeted
   * to the antd-derived `title`, and the two legs at the end of this file drive
   * the surfaces that had none.
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

  /**
   * ⚠⚠ RED LEGS for Codex round-1 finding M2 — the two theme-application
   * controls that applied a theme without ever showing the warning.
   *
   * The class is stated as a ROLE, not a widget list: **every UI control whose
   * completed action changes which theme is in effect for the preview.** There
   * are four, enumerated two ways — by reading `ThemeSelector` and
   * `ThemeSettingsDialog` end to end, and by grepping every `setTheme` /
   * `loadSavedTheme` / `setViewOverride` call site in `src/`. The first two are
   * covered by the legs above; these are the other two.
   *
   * ⚠ Both use SAVED themes, which is the one population member no capture can
   * enumerate — they live on the user's disk, outside this repository. The
   * theme bodies are still the real captured definitions rather than synthetic
   * ones, per the owner's 2026-08-10 fixture ruling.
   */
  const savedThemePayload = JSON.stringify(
    {
      version: 1,
      exportedAt: '2026-02-16T00:00:00.000Z',
      savedThemes: [
        {
          name: 'saved-inert',
          createdAt: '2026-02-16T00:00:00.000Z',
          updatedAt: '2026-02-16T00:00:00.000Z',
          theme: REAL_HA_THEMES['Mushroom Square'],
        },
        {
          name: 'saved-rich',
          createdAt: '2026-02-16T00:00:00.000Z',
          updatedAt: '2026-02-16T00:00:00.000Z',
          theme: REAL_HA_THEMES['Material You'],
        },
      ],
      viewOverrides: {},
    },
    null,
    2,
  );

  async function openThemeManagerWithSavedThemes(
    ctx: Awaited<ReturnType<typeof launchWithDSL>>,
  ): Promise<ThemeManagerDSL> {
    const themeManager = new ThemeManagerDSL(ctx.window);

    await ctx.appDSL.waitUntilReady();
    // A dashboard with a view, so the per-view override Select is enabled.
    await ctx.dashboard.createNew();

    await ctx.settings.open();
    await ctx.settings.selectTab('Appearance');
    await themeManager.openThemeManagerTab();
    await themeManager.importJson(savedThemePayload);

    return themeManager;
  }

  test('badges an inert saved theme in the Theme Manager saved-theme picker', async () => {
    const ctx = await launchWithDSL();
    try {
      await openThemeManagerWithSavedThemes(ctx);

      await ctx.window.getByTestId('theme-manager-saved-select').click();

      const inert = ctx.window.locator('.ant-select-item-option[title="saved-inert"]');
      await expect(inert).toBeVisible({ timeout: 5000 });
      await expect(
        inert.getByTestId('theme-no-effect-badge'),
        'loading this saved theme applies it — the user must get the same warning here as in the header picker',
      ).toBeVisible();

      const rich = ctx.window.locator('.ant-select-item-option[title="saved-rich"]');
      await expect(rich).toBeVisible();
      await expect(
        rich.getByTestId('theme-no-effect-badge'),
        'Material You defines all six and must NOT be badged on this surface either',
      ).toHaveCount(0);

      await ctx.window.keyboard.press('Escape');
      await ctx.settings.close();
    } finally {
      await close(ctx);
    }
  });

  test('badges an inert theme in the Theme Manager per-view override picker', async () => {
    const ctx = await launchWithDSL();
    try {
      const themeManager = await openThemeManagerWithSavedThemes(ctx);
      await themeManager.expectActiveViewDetected();

      await ctx.window.getByTestId('theme-manager-view-override').click();
      const dropdown = ctx.window
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .last();
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      const inert = dropdown.locator('.ant-select-item-option[title="saved-inert"]');
      await expect(inert).toBeVisible({ timeout: 5000 });
      await expect(
        inert.getByTestId('theme-no-effect-badge'),
        'setViewOverride re-derives the effective theme immediately — this control applies a theme and must warn',
      ).toBeVisible();

      const rich = dropdown.locator('.ant-select-item-option[title="saved-rich"]');
      await expect(rich).toBeVisible();
      await expect(
        rich.getByTestId('theme-no-effect-badge'),
        'the negative control must stay unbadged on the override picker too',
      ).toHaveCount(0);

      // The "No override (use global theme)" sentinel is not a theme and has no
      // predicate to evaluate; it must never carry the badge.
      const sentinel = dropdown.locator(
        '.ant-select-item-option[title="No override (use global theme)"]',
      );
      await expect(sentinel).toBeVisible();
      await expect(sentinel.getByTestId('theme-no-effect-badge')).toHaveCount(0);

      await ctx.window.keyboard.press('Escape');
      await ctx.settings.close();
    } finally {
      await close(ctx);
    }
  });
});
