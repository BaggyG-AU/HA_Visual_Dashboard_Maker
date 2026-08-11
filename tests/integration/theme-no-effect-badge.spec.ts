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
      // this selector — and `theme-restore.spec.ts`'s `pickTheme` — working.
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
   *
   * ⚠⚠ "FOUR" IS THE POPULATION OF THEME OPTION **SELECTS**, NOT OF ACTIONS THAT
   * APPLY A THEME — corrected after Codex's round-2 review (finding R2-N2).
   * `setSyncWithHA(true)`, `importThemeManager`, clearing an override and
   * changing the active view all re-derive the effective theme too, and none of
   * them has an option list; the theme each leaves in effect is shown by a
   * Select that does badge.
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
  /** A theme-manager export payload carrying the named saved themes verbatim. */
  const savedPayloadOf = (entries: Array<{ name: string; theme: unknown }>) =>
    JSON.stringify(
      {
        version: 1,
        exportedAt: '2026-02-16T00:00:00.000Z',
        savedThemes: entries.map(({ name, theme }) => ({
          name,
          createdAt: '2026-02-16T00:00:00.000Z',
          updatedAt: '2026-02-16T00:00:00.000Z',
          theme,
        })),
        viewOverrides: {},
      },
      null,
      2,
    );

  const savedThemePayload = savedPayloadOf([
    { name: 'saved-inert', theme: REAL_HA_THEMES['Mushroom Square'] },
    { name: 'saved-rich', theme: REAL_HA_THEMES['Material You'] },
  ]);

  async function openThemeManagerWith(
    ctx: Awaited<ReturnType<typeof launchWithDSL>>,
    payload: string,
  ): Promise<ThemeManagerDSL> {
    const themeManager = new ThemeManagerDSL(ctx.window);

    await ctx.appDSL.waitUntilReady();
    // A dashboard with a view, so the per-view override Select is enabled.
    await ctx.dashboard.createNew();

    await ctx.settings.open();
    await ctx.settings.selectTab('Appearance');
    await themeManager.openThemeManagerTab();
    await themeManager.importJson(payload);

    return themeManager;
  }

  const openThemeManagerWithSavedThemes = (ctx: Awaited<ReturnType<typeof launchWithDSL>>) =>
    openThemeManagerWith(ctx, savedThemePayload);

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

  /**
   * ⚠⚠⚠ RED LEG for Codex round-2 finding R2-M1 — the TOOLTIP, which round 1's
   * fix left carrying the very claim round 1 disproved.
   *
   * The round-1 fix narrowed the LABEL to "no preview colours" and moved the
   * canvas-wide claim into the tooltip, where it read: *"…so the canvas and the
   * Theme Preview panel will not change. Other styling may still differ."* The
   * first sentence is the claim `tests/unit/themeBadge.spec.ts` ("still marks a
   * theme whose only key is consumed by bundled canvas CSS") falsifies: a theme
   * defining only `swiper-theme-color` is badged while the real carousel arrow
   * recolours, because the canvas SUBTREE renders Swiper, Allotment and Monaco.
   * A user reads "the canvas" as everything they can see on it.
   *
   * ⚠ This asserts the RENDERED tooltip, not the exported constant. The
   * constant being right while the string never reaches the user is exactly the
   * failure mode this whole spec exists to catch.
   */
  test('the tooltip names only the surfaces the predicate can establish', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await connectWithRealThemes(ctx);

      await ctx.window.getByTestId('theme-select').click();
      const options = ctx.window.locator('.ant-select-item-option');
      await expect(options.first()).toBeVisible({ timeout: 5000 });
      await ctx.window.locator('.ant-select-item-option[title="Mushroom Square"]').click();

      const badge = ctx.window.getByTestId('theme-selector').getByTestId('theme-no-effect-badge');
      await expect(badge).toBeVisible({ timeout: 5000 });
      await badge.hover();

      // ⚠ antd 6.1.4 renders tooltip text into `.ant-tooltip-container`, NOT
      // `.ant-tooltip-inner` — measured, because the first version of this leg
      // used the older class and failed for the WRONG reason (element not
      // found), which would have read as a passing red leg. The header Select
      // carries its own "Select theme for preview" tooltip, so two are open at
      // once; each assertion below therefore identifies its container by the
      // text it is asserting about rather than by position.
      const tooltipSaying = (text: string) =>
        ctx.window.locator('.ant-tooltip-container', { hasText: text });

      await expect(
        tooltipSaying('canvas background and text'),
        'the tooltip must name the two surfaces the predicate measures, not "the canvas"',
      ).toBeVisible({ timeout: 5000 });
      await expect(
        tooltipSaying('Cards, editors and other styling on the canvas may still change'),
        'it must concede the subtree it cannot speak for — cards and editors',
      ).toBeVisible({ timeout: 5000 });
      await expect(
        tooltipSaying('the canvas and the Theme Preview panel will not change'),
        'the disproved canvas-wide claim must be RETRACTED, not merely followed by a concession',
      ).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });

  /**
   * ⚠⚠⚠ THE THREE SELECTED-VALUE LEGS — Codex round-2 finding R2-M3.
   *
   * The class is a BEHAVIOUR, not a widget list: **every collapsed-Select
   * renderer that decides whether the badge is shown** — i.e. every
   * `labelRender` in `src/` that can render `ThemeNoEffectBadge`. Enumerated by
   * grepping `labelRender` across `src/` and reading each hit, there are FOUR —
   * named by test-id rather than line, because every one of these lines moved
   * when this round edited the file above them: `theme-select` in
   * `ThemeSelector.tsx`, and `theme-settings-select`,
   * `theme-manager-saved-select` and `theme-manager-view-override` in
   * `ThemeSettingsDialog.tsx`.
   *
   * ⚠ Codex named TWO of them. The sweep found a THIRD uncovered member,
   * `theme-settings-select`, which is not new in
   * the fix round at all — it shipped in the slice `c1acb52` and round 1 missed
   * it too, despite round 1 requiring "selected/collapsed state where
   * applicable". The fourth, `ThemeSelector`'s, is already covered by "carries
   * the badge onto the selected value once a badged theme is chosen" above.
   *
   * ⚠⚠ EACH LEG IS INDEPENDENT OF THE DROPDOWN BADGE ASSERTION. It selects its
   * option by the antd-derived `title`, which does not depend on the badge at
   * all, and asserts only on the collapsed Select. A leg that first asserted on
   * an option row would fail there if `optionRender` broke, and would therefore
   * never prove that `labelRender` can detect its own deletion — the precise
   * defect R2-M3 named. Fail-against-old for each is demonstrated by deleting
   * that renderer's badge guard, not by re-running the dropdown guard.
   */
  test('carries the badge onto the selected value in the Theme Settings picker', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await connectWithRealThemes(ctx);

      await ctx.settings.open();
      await ctx.settings.selectTab('Appearance');

      const select = ctx.window.getByTestId('theme-settings-select');
      await expect(select).toBeVisible({ timeout: 5000 });
      await select.click();
      await ctx.window.locator('.ant-select-item-option[title="Mushroom Square"]').click();

      await expect(
        select.getByTestId('theme-no-effect-badge'),
        'the dialog picker must keep the warning on the SELECTED value, not only in the open list',
      ).toBeVisible({ timeout: 5000 });

      await select.click();
      await ctx.window.locator('.ant-select-item-option[title="Material You"]').click();
      await expect(
        select.getByTestId('theme-no-effect-badge'),
        'and must drop it again when a theme that defines all six is selected',
      ).toHaveCount(0);

      await ctx.settings.close();
    } finally {
      await close(ctx);
    }
  });

  test('carries the badge onto the selected value in the saved-theme picker', async () => {
    const ctx = await launchWithDSL();
    try {
      const themeManager = await openThemeManagerWithSavedThemes(ctx);

      await themeManager.selectSavedTheme('saved-inert');

      const select = ctx.window.getByTestId('theme-manager-saved-select');
      await expect(
        select.getByTestId('theme-no-effect-badge'),
        'Load applies this theme — the warning must survive selection, not vanish with the dropdown',
      ).toBeVisible({ timeout: 5000 });

      await themeManager.selectSavedTheme('saved-rich');
      await expect(
        select.getByTestId('theme-no-effect-badge'),
        'and must not persist onto a theme that defines all six',
      ).toHaveCount(0);

      await ctx.settings.close();
    } finally {
      await close(ctx);
    }
  });

  test('carries the badge onto the selected value in the per-view override picker', async () => {
    const ctx = await launchWithDSL();
    try {
      const themeManager = await openThemeManagerWithSavedThemes(ctx);
      await themeManager.expectActiveViewDetected();

      await themeManager.setViewOverride('saved-inert');

      const select = ctx.window.getByTestId('theme-manager-view-override');
      await expect(
        select.getByTestId('theme-no-effect-badge'),
        'setViewOverride re-derives the effective theme — the selected override must stay marked',
      ).toBeVisible({ timeout: 5000 });

      await themeManager.setViewOverride('saved-rich');
      await expect(
        select.getByTestId('theme-no-effect-badge'),
        'and must clear when the override is changed to a theme that defines all six',
      ).toHaveCount(0);

      await ctx.settings.close();
    } finally {
      await close(ctx);
    }
  });

  /**
   * ⚠⚠⚠ RED LEG for Codex round-2 finding R2-M2 — the `__none__` collision, the
   * defect the round-1 FIX created.
   *
   * `src/features/theme-manager/storage.ts:22,28` accepts any non-empty trimmed
   * saved-theme name, so `__none__` — the per-view override Select's no-override
   * sentinel — is supported input. The round-1 fix gave that sentinel an
   * explicit `definesNoCanvasColors: false` and then resolved the collapsed
   * badge with `options.some(option.value === value && flag)`, which walks PAST
   * the false sentinel to a later option sharing the value. An imported inert
   * theme named `__none__` therefore made a **no-override state** render the
   * warning. Round 1 had left the collision out of scope because the branch had
   * not touched that path; the fix is what made it live.
   *
   * ⚠ The remedy is structural, and this leg pins it: the override Select
   * namespaces every REAL theme's option value as `theme:<name>`, so no theme
   * name can collide with the sentinel whatever the user imports, and the option
   * list becomes value-unique — which is what makes the `.some` lookup exact
   * rather than merely lucky.
   *
   * ⓘ `theme-manager-view-clear` is the independent witness that the STORE holds
   * no override. Without it this leg could not tell a false badge from a real
   * one.
   */
  const collidingPayload = savedPayloadOf([
    { name: '__none__', theme: REAL_HA_THEMES['Mushroom Square'] },
  ]);

  test('a saved theme named __none__ does not badge the no-override state', async () => {
    const ctx = await launchWithDSL();
    try {
      const themeManager = await openThemeManagerWith(ctx, collidingPayload);
      await themeManager.expectActiveViewDetected();

      const select = ctx.window.getByTestId('theme-manager-view-override');

      await expect(
        ctx.window.getByTestId('theme-manager-view-clear'),
        'no override has been set, so Clear must be disabled — this is what makes the badge false',
      ).toBeDisabled();
      // ⚠ The BADGE assertion comes before the identity one on purpose: the
      // false warning is the finding, so that is the assertion the red leg must
      // land on. Playwright stops at the first failure, and ordering identity
      // first would have left R2-M2's actual claim unexercised in the red run.
      await expect(
        select.getByTestId('theme-no-effect-badge'),
        'a no-override state is not a theme and has no predicate — it must never carry the warning',
      ).toHaveCount(0);
      await expect(
        select,
        'the collapsed control must show the sentinel it is actually holding, not the colliding theme',
      ).toContainText('No override (use global theme)');

      // ⚠ THE OTHER HALF the namespacing closes, pinned so the remedy cannot be
      // quietly reverted to a lookup-only fix: a real theme named `__none__` is
      // now selectable as an override, which it never was before.
      await themeManager.setViewOverride('__none__');
      await expect(
        ctx.window.getByTestId('theme-manager-view-clear'),
        'selecting the real __none__ theme must actually set an override',
      ).toBeEnabled({ timeout: 5000 });
      await expect(
        select.getByTestId('theme-no-effect-badge'),
        'and NOW the warning is true — that theme really does define none of the six',
      ).toBeVisible({ timeout: 5000 });

      await ctx.settings.close();
    } finally {
      await close(ctx);
    }
  });

  /**
   * ⚠⚠ RED LEG for Codex round-2 finding R2-N1 — the DSL's string contract.
   *
   * The round-1 fix retargeted three Theme Manager matchers to
   * `.ant-select-item-option[title="${name}"]`, building a CSS selector out of
   * domain data. Save and import both accept a name containing `"`
   * (`src/features/theme-manager/storage.ts:22,28` only trims and rejects
   * empty), and such a name TERMINATES the attribute selector — the DSL throws
   * rather than failing an assertion.
   *
   * ⚠ Non-blocking for the product: nothing in `src/` is wrong, and every
   * fixture name in the suite is safe. It is a regression in the helper's
   * contract that the fix round introduced, and this leg is what stops the next
   * author reintroducing it.
   */
  const quotedPayload = savedPayloadOf([
    { name: 'saved-"quote', theme: REAL_HA_THEMES['Mushroom Square'] },
  ]);

  test('the Theme Manager DSL selects a saved theme whose name contains a quote', async () => {
    const ctx = await launchWithDSL();
    try {
      const themeManager = await openThemeManagerWith(ctx, quotedPayload);

      await themeManager.expectSavedThemeVisible('saved-"quote');
      await themeManager.selectSavedTheme('saved-"quote');

      await expect(
        ctx.window.getByTestId('theme-manager-saved-select'),
        'a name the product accepts must be a name the DSL can select',
      ).toContainText('saved-"quote');

      await ctx.settings.close();
    } finally {
      await close(ctx);
    }
  });
});
