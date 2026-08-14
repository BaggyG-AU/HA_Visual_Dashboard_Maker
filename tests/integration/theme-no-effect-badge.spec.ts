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

/**
 * ⚠⚠⚠ EVERY RENDERED-STATE CLAIM THIS ONE TOOLTIP HAS ALREADY BEEN WRONG ABOUT,
 * in the order the review rounds killed them. Both wording legs below assert
 * that none of these is on screen; the second asserts it from the very context
 * that disproved the last one.
 *
 * ⚠ ADD TO THIS LIST, NEVER REPLACE IT. A retraction that is only checked in the
 * round that made it is a retraction nobody is holding to.
 */
const RETRACTED_CLAIMS = [
  'the canvas and the Theme Preview panel will not change', // round 1's, retracted in round 2
  'stay as they are', // round 2's transition claim, disproved in round 3
  'stays empty', // round 2's preview-panel claim, disproved in round 3
  "uses HAVDM's own default colours", // round 3's, disproved in round 4 (R4-M1)
  'shows no colour swatches', // round 3's, disproved in round 4 (R4-M1)
  "HAVDM's canvas and Theme Preview panel read", // round 4's, disproved in round 5 (R5-M1)
];

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
   * ⚠⚠⚠ RED LEG for Codex round-5 finding R5-M2 — THE QUALIFICATION MUST BE
   * REACHABLE WITHOUT A MOUSE.
   *
   * The tooltip is not decoration: it carries the limitation that stops "no
   * preview colours" being read as the wider "no effect" claim four rounds
   * disproved. Until round 5 it was HOVER-ONLY. Both arms rendered at
   * `tabIndex=-1`, focus would not land on either, and a keyboard user got the
   * three-word label and none of the qualification.
   *
   * ⚠ TWO CONTEXTS, TWO MECHANISMS, and this leg checks both:
   *   - the four `labelRender` (collapsed) badges take `focusable`, so they are
   *     a real tab stop and the tooltip opens on FOCUS;
   *   - the four `optionRender` badges must NOT be tab stops — they live in an
   *     open `listbox` where arrow keys are the model — so they carry the whole
   *     explanation as their accessible name instead.
   */
  test('the badge explanation is reachable without a mouse', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await connectWithRealThemes(ctx);

      // ⚠⚠ ASSERTION ORDER IS DELIBERATE AND MUST NOT BE "TIDIED". The
      // WORDING-INDEPENDENT keyboard assertions come first, so a run against old
      // source fails on the R5-M2 defect itself — `tabIndex=-1` — and not on the
      // R5-M1 wording being absent. Measured: the first draft of this leg led
      // with the accessible name and duly failed against `6eb47d8`, but on a
      // null `aria-label`, which conflates two separate findings.
      await pickTheme(ctx, 'Mushroom Square');

      const badge = ctx.window.getByTestId('theme-selector').getByTestId('theme-no-effect-badge');
      await expect(badge).toBeVisible({ timeout: 5000 });

      expect(
        await badge.getAttribute('tabIndex'),
        'the collapsed badge must be a real tab stop — `tabIndex=-1` is what R5-M2 measured',
      ).toBe('0');

      // ⚠ FOCUS, not hover — the whole point. `.focus()` drives the DOM the way
      // a Tab key would land, and R5-M2 measured that this did not move
      // `document.activeElement` at all before the fix.
      await badge.focus();
      expect(
        await ctx.window.evaluate(() => document.activeElement?.getAttribute('data-testid')),
        'focus must actually land on the badge',
      ).toBe('theme-no-effect-badge');

      await expect(
        ctx.window.locator('.ant-tooltip-container').locator('visible=true'),
        'and focusing it must open the explanation, with no pointer involved',
      ).toHaveCount(1);

      // Only now the wording-dependent half: what that accessible name says.
      expect(
        await badge.getAttribute('aria-label'),
        'the collapsed badge name must be the sentence, not the three-word label',
      ).toContain('six colour values HAVDM maps');

      // An OPTION-ROW badge: deliberately NOT a tab stop, so its accessible name
      // has to carry the whole qualification instead.
      await ctx.window.getByTestId('theme-select').click();
      const option = ctx.window.locator('.ant-select-item-option[title="Mushroom Square"]');
      await expect(option).toBeVisible({ timeout: 5000 });
      const optionBadge = option.getByTestId('theme-no-effect-badge');
      await expect(optionBadge).toBeVisible({ timeout: 5000 });
      expect(
        await optionBadge.getAttribute('tabIndex'),
        'an option row must NOT add a tab stop inside the listbox',
      ).not.toBe('0');
      expect(
        await optionBadge.getAttribute('aria-label'),
        'an option-row badge must expose the full qualification as its accessible name',
      ).toContain('six colour values HAVDM maps');
    } finally {
      await close(ctx);
    }
  });

  /**
   * ⚠⚠⚠ RED LEG for Codex round-5 finding R5-N1 — ONE HOVER, ONE TOOLTIP.
   *
   * `ThemeSelector` used to wrap the whole Select in a Tooltip reading "Select
   * theme for preview", while `labelRender` rendered the badge and ITS tooltip
   * inside that same Select. Hovering the badge opened both, as two fully
   * opaque overlapping overlays (measured ~170×34 and ~250×122).
   *
   * ⚠ This leg counts CONTAINERS, not text. Asserting "the badge tooltip is
   * visible" passed throughout the defect — it was visible, with another
   * tooltip on top of it. The count is the only assertion that discriminates.
   */
  test('hovering the collapsed badge opens exactly one tooltip', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await connectWithRealThemes(ctx);

      await pickTheme(ctx, 'Mushroom Square');

      const badge = ctx.window.getByTestId('theme-selector').getByTestId('theme-no-effect-badge');
      await expect(badge).toBeVisible({ timeout: 5000 });
      await badge.hover();

      // ⚠ `.ant-tooltip-container` is the class antd 6.1.4 actually renders text
      // into (measured, see the wording leg), and `visible=true` filters out any
      // container left mounted-but-hidden from an earlier open/close.
      // ⚠⚠⚠ THE DISCRIMINATING ASSERTION IS THE PARENT-TEXT ONE, AND THAT IS A
      // MEASUREMENT, NOT AN ASSUMPTION. The first draft of this leg led with the
      // visible-container COUNT and asserted in its own comment that the count
      // was the defect assertion. Run against `6eb47d8` the count assertion
      // PASSED — exactly one container was visible — and only the parent-text
      // assertion failed, `Expected: 0  Received: 1`. So the count is a CONTROL
      // here, not a red, and it is labelled as one. Codex measured two
      // simultaneously visible overlays; at this leg's timing only one container
      // was visible and it was the parent's. Both are R5-N1: the parent tooltip
      // fires on a badge hover and obscures or replaces the explanation.
      await expect(
        ctx.window.locator('.ant-tooltip-container', { hasText: 'Select theme for preview' }),
        "THE FALSIFIER: hovering the badge must not summon the Select's own tooltip",
      ).toHaveCount(0);

      const visibleTooltips = ctx.window.locator('.ant-tooltip-container').locator('visible=true');
      await expect(visibleTooltips.first(), "the badge's own tooltip must open").toBeVisible({
        timeout: 5000,
      });
      await expect(
        visibleTooltips,
        "CONTROL (passes on old source too): exactly one overlay, and it is the badge's",
      ).toHaveCount(1);
      await expect(
        visibleTooltips,
        'and the one overlay must be the explanation, not the Select hint',
      ).toContainText('six colour values HAVDM maps');
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

  /** The canvas `<Content>`'s computed background — the surface the badge speaks for. */
  const canvasBackground = (ctx: Awaited<ReturnType<typeof launchWithDSL>>) =>
    ctx.window
      .getByTestId('canvas-surface')
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);

  /**
   * The canvas `<Content>`'s computed TEXT colour — the other half of the pair
   * `App.tsx` resolves.
   *
   * ⚠ Added after Codex round 4. `App.tsx` resolves TWO values,
   * `canvasThemeBackground ?? token.colorBgContainer` AND
   * `canvasThemeText ?? token.colorText`, and the control leg below measured
   * only the first while the wording of the day said "colours", plural. Codex
   * measured the text transition as `rgb(26, 27, 33)` →
   * `rgba(255, 255, 255, 0.85)` — the same shape as the background's, and
   * equally unmeasured.
   */
  const canvasText = (ctx: Awaited<ReturnType<typeof launchWithDSL>>) =>
    ctx.window.getByTestId('canvas-surface').evaluate((el) => window.getComputedStyle(el).color);

  /** The Theme Preview card, located by its own title rather than by position. */
  const previewCardOf = (ctx: Awaited<ReturnType<typeof launchWithDSL>>) =>
    ctx.window
      .locator('.ant-card')
      .filter({ has: ctx.window.getByText('Theme Preview', { exact: true }) });

  /** Pick a theme through the real header control. */
  const pickTheme = async (ctx: Awaited<ReturnType<typeof launchWithDSL>>, name: string) => {
    await ctx.window.getByTestId('theme-select').click();
    const option = ctx.window.locator(`.ant-select-item-option[title="${name}"]`);
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
  };

  /**
   * ⚠⚠⚠ CONTROL LEG — Codex round-3 finding R3-M1, and the MEASUREMENT the two
   * previous tooltip wordings were written without.
   *
   * State it plainly: **this leg passes on `508e33d` too.** The behaviour did not
   * change; the CLAIM did, for the third time. It is a control, not a red leg —
   * exactly like the Swiper counterexample in `tests/unit/themeBadge.spec.ts`.
   *
   * ⚠⚠ WHY IT EXISTS. Round 2's tooltip said a badged theme leaves the canvas
   * background/text "as they are" and the Theme Preview panel "empty". **Both
   * were false, and the checked-in wording leg could not tell** — it asserted
   * only that the phrases RENDER, so it passed while they lied. Codex measured
   * the transition and found:
   *   - `App.tsx` maps every absent colour to `undefined`
   *     (`colors.primaryBackground || undefined`) and then resolves
   *     `canvasThemeBackground ?? token.colorBgContainer`. Switching from a rich
   *     theme does NOT retain its colours — it REPLACES them with HAVDM's own
   *     antd tokens.
   *   - `ThemePreviewPanel` always renders the Card, the theme name, the mode
   *     Tag, a Divider and a "Colors" heading. Only each missing SWATCH returns
   *     `null`. The panel is not empty; it has no colour swatches.
   *
   * ⚠ Three canvas readings, not two, for EACH of background and text: "falls
   * back to HAVDM's own default" is a claim about WHICH value it lands on, and
   * only a no-theme baseline can establish that. Two readings could show the
   * colour changed without showing what it changed TO.
   *
   * ⚠⚠ SINCE ROUND 4 THIS LEG NO LONGER BACKS A PRODUCT CLAIM. The tooltip is
   * now a pure absence claim about the theme object and says nothing about
   * rendered state (finding R4-M1), so what this leg pins is the BEHAVIOUR
   * itself — the thing the canvas fidelity contract will one day have to
   * describe. Keep it: it is the only place the rich→badged transition is
   * measured at all, and it is what makes any future richer claim checkable.
   *
   * ⚠ The swatches are counted by their `<Text code>` colour literal — one per
   * rendered swatch — rather than by a class substring. Codex's first probe here
   * matched `ant-card-head-title` because that string CONTAINS `ant-card`; a
   * failure of the locator, not of the product.
   */
  test('a badged theme replaces the canvas colours with HAVDM own and empties the swatches', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await connectWithRealThemes(ctx);

      const noThemeBackground = await canvasBackground(ctx);
      const noThemeText = await canvasText(ctx);
      expect(
        noThemeBackground,
        'the canvas must report a computed background to compare',
      ).toBeTruthy();
      expect(noThemeText, 'the canvas must report a computed text colour to compare').toBeTruthy();

      // A rich theme: all six mapped fields defined.
      await pickTheme(ctx, 'Material You');
      await expect.poll(() => canvasBackground(ctx), { timeout: 5000 }).not.toBe(noThemeBackground);
      const richBackground = await canvasBackground(ctx);
      const richText = await canvasText(ctx);

      // ⚠ `.ant-card` matches a class TOKEN, so it cannot match
      // `ant-card-head-title`; the filter then pins it to the Theme Preview card.
      const previewCard = previewCardOf(ctx);
      await expect(previewCard, 'the Theme Preview card must be locatable').toHaveCount(1);
      await expect(
        previewCard.locator('code'),
        'a theme defining all six must render all six colour swatches',
      ).toHaveCount(6);

      // The badged theme: none of the six.
      await pickTheme(ctx, 'Mushroom Square');
      await expect.poll(() => canvasBackground(ctx), { timeout: 5000 }).not.toBe(richBackground);
      const badgedBackground = await canvasBackground(ctx);
      const badgedText = await canvasText(ctx);

      expect(
        badgedBackground,
        'THE FALSIFIER for "stay as they are": the rich theme\'s canvas colour is REPLACED, not retained',
      ).not.toBe(richBackground);
      expect(
        badgedBackground,
        'and it falls back to exactly what HAVDM shows with no theme at all — its OWN default',
      ).toBe(noThemeBackground);

      // ⚠ THE SAME PAIR OF READINGS FOR TEXT — Codex round 4, H2. `App.tsx`
      // resolves `canvasThemeText ?? token.colorText` beside the background, and
      // measuring only one of the two left half of "colours" unevidenced.
      expect(
        badgedText,
        'the text colour is REPLACED on the transition too, not retained',
      ).not.toBe(richText);
      expect(badgedText, 'and it falls back to the same no-theme value the background does').toBe(
        noThemeText,
      );

      await expect(
        previewCard.locator('code'),
        'THE FALSIFIER for "stays empty": no colour swatches…',
      ).toHaveCount(0);
      await expect(
        previewCard,
        '…but the card, the theme name, the mode tag and the "Colors" heading all still render',
      ).toContainText('Mushroom Square');
      await expect(previewCard).toContainText('Colors');
    } finally {
      await close(ctx);
    }
  });

  /**
   * ⚠⚠⚠ RED LEG for Codex round-4 finding R4-M1 — the TOOLTIP, on its FIFTH
   * wording and the owner's FOURTH sign-off of this one string.
   *
   * Four wordings died here, each fixing the clause the reviewer named and
   * leaving an adjacent one wrong: "no preview EFFECT" (round 1, M1), "will not
   * change" (round 2, R2-M1), "stay as they are" / "stays empty" (round 3,
   * R3-M1), and "uses HAVDM's own default colours" / "shows no colour swatches"
   * (round 4, R4-M1). ⭐⭐⭐ **THE FIFTH IS A DIFFERENT KIND OF CLAIM, NOT A
   * FIFTH PHRASING.** It states a property of the THEME OBJECT and says nothing
   * about rendered state, because the predicate is a pure function of a theme
   * while the component renders in eight contexts, six of which can display it
   * over a canvas painted by some other theme entirely.
   *
   * ⚠ This leg still selects the theme first, and that is FINE now — an absence
   * claim is true in the applied context too. The leg that proves it is true in
   * the contexts that killed wording four is the INACTIVE-OPTION leg below, and
   * this one cannot substitute for it. The two are deliberately separate, as is
   * the behavioural control above: a failure in one must not stop the run before
   * the others are checked.
   *
   * ⚠ This asserts the RENDERED tooltip, not the exported constant. The
   * constant being right while the string never reaches the user is exactly the
   * failure mode this whole spec exists to catch.
   */
  test('the tooltip states only what is true of the theme itself', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await connectWithRealThemes(ctx);

      await pickTheme(ctx, 'Mushroom Square');

      const badge = ctx.window.getByTestId('theme-selector').getByTestId('theme-no-effect-badge');
      await expect(badge).toBeVisible({ timeout: 5000 });
      await badge.hover();

      // ⚠ antd 6.1.4 renders tooltip text into `.ant-tooltip-container`, NOT
      // `.ant-tooltip-inner` — measured, because the first version of this leg
      // used the older class and failed for the WRONG reason (element not
      // found), which would have read as a passing red leg.
      // ⚠⚠ THE HEADER SELECT USED TO CARRY ITS OWN "Select theme for preview"
      // TOOLTIP, so TWO opened at once and every assertion had to identify its
      // container by text rather than by position. Codex round-5 finding R5-N1
      // established that the overlap was a PRODUCT defect, not merely a locator
      // fact — this docblock recording it as the latter is what the finding
      // called out. The outer Tooltip is gone; the text-scoped locator is kept
      // because it is the more honest form, and the leg below now asserts that
      // exactly ONE tooltip opens.
      const tooltipSaying = (text: string) =>
        ctx.window.locator('.ant-tooltip-container', { hasText: text });

      await expect(
        tooltipSaying('This theme sets none of the six colour values HAVDM maps'),
        'the tooltip must state a property of the THEME, not of the screen',
      ).toBeVisible({ timeout: 5000 });
      await expect(
        tooltipSaying('including colours used by cards and editors on the canvas'),
        'R5-M1: the concession must name COLOURS explicitly, not just "other styling"',
      ).toBeVisible({ timeout: 5000 });
      await expect(
        tooltipSaying('Your Home Assistant dashboard is unaffected'),
        'the HA reassurance must survive this rewording',
      ).toBeVisible({ timeout: 5000 });

      for (const disproved of RETRACTED_CLAIMS) {
        await expect(
          tooltipSaying(disproved),
          `a disproved claim must be RETRACTED, not reworded around: "${disproved}"`,
        ).toHaveCount(0);
      }
    } finally {
      await close(ctx);
    }
  });

  /**
   * ⚠⚠⚠ RED LEG for Codex round-4 finding R4-M1 — and the ONE that recreates the
   * semantic defect rather than merely discriminating old text from new.
   *
   * ⭐⭐⭐ WHY THE LEG ABOVE IS NOT ENOUGH, WHICH IS ROUND 4'S SHARPEST LESSON.
   * `fail-against-old` proves a wording test can tell the old string from the
   * new one. It does NOT prove the new string is TRUE. Every previous round's
   * wording leg passed on the day it was written and was false within a week,
   * because each one selected the badged theme FIRST and then read the tooltip —
   * measuring the single context in which the claim happened to hold.
   *
   * ⚠⚠ THE DEFECT IS TEMPORAL AND CONTEXTUAL. `ThemeNoEffectBadge` renders in
   * eight places; six of them — four `optionRender` rows and the two collapsed
   * values that stay PENDING until Apply or Load — can display the badge while
   * the canvas is painted by a completely different theme. This leg holds a rich
   * theme ACTIVE, hovers a badged theme's INACTIVE option row, and asserts both
   * halves at once: that the rich theme is still on screen, and that the tooltip
   * claims nothing that contradicts it.
   *
   * ⚠ It is a RED leg, not a control: on `8aa8c1a` `src/` the tooltip said the
   * canvas "uses HAVDM's own default colours" and the panel "shows no colour
   * swatches" while this leg measures Material You's colours and six swatches
   * still on screen, so the absence assertions fail against that source.
   */
  test('the tooltip claims nothing about the screen, so it holds beside an INACTIVE option', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await connectWithRealThemes(ctx);

      // Apply a RICH theme, and pin what it actually put on screen.
      await pickTheme(ctx, 'Material You');
      const previewCard = previewCardOf(ctx);
      await expect(previewCard, 'the Theme Preview card must be locatable').toHaveCount(1);
      await expect(
        previewCard.locator('code'),
        'the rich theme must render all six swatches before we open the picker',
      ).toHaveCount(6);
      const richBackground = await canvasBackground(ctx);
      const richText = await canvasText(ctx);
      expect(richBackground, 'the rich theme must paint a canvas background').toBeTruthy();

      // Open the picker and hover a BADGED theme's option row WITHOUT selecting it.
      await ctx.window.getByTestId('theme-select').click();
      const badgedOption = ctx.window.locator('.ant-select-item-option[title="Mushroom Square"]');
      await expect(badgedOption).toBeVisible({ timeout: 5000 });
      const optionBadge = badgedOption.getByTestId('theme-no-effect-badge');
      await expect(optionBadge, 'the inactive option row must carry the badge').toBeVisible({
        timeout: 5000,
      });
      await optionBadge.hover();

      const tooltipSaying = (text: string) =>
        ctx.window.locator('.ant-tooltip-container', { hasText: text });

      // ⚠⚠⚠ THE ASSERTION ORDER IN THIS LEG IS DELIBERATE AND MUST NOT BE
      // "TIDIED" — round 4's own lesson, learned by measurement while writing it.
      // The first draft asserted the NEW wording first. Run against `8aa8c1a`
      // `src/` it duly failed — but it failed because the new phrase was absent,
      // which proves only that the leg tells old text from new. That is exactly
      // the substitution R4-M1 warns about. The defect assertions therefore come
      // FIRST, so a run against the old source fails on the thing that is
      // actually WRONG with it.

      // ⚠ Wording-NEUTRAL precondition (rule 9): prove the badge's tooltip
      // actually opened before reading anything out of it. Every wording of this
      // string has begun "This theme…", so this anchor holds on old and new
      // source alike — and without it, "the phrase is absent" is
      // indistinguishable from "the tooltip never opened".
      await expect(
        tooltipSaying('This theme'),
        "the badge's tooltip must be open before its contents are judged",
      ).toBeVisible({ timeout: 5000 });

      // ⭐ THE CONTEXT THAT MAKES A RENDERED-STATE CLAIM FALSE, measured while
      // that tooltip is on screen: Material You is still applied, still painting.
      expect(
        await canvasBackground(ctx),
        'hovering an option must not apply it — the rich background must still be painted',
      ).toBe(richBackground);
      expect(
        await canvasText(ctx),
        'hovering an option must not apply it — the rich text colour must still be painted',
      ).toBe(richText);
      await expect(
        previewCard.locator('code'),
        'and the Preview panel must still show the RICH theme\'s six swatches, not "no colour swatches"',
      ).toHaveCount(6);

      // ⭐⭐⭐ THE FAIL-AGAINST-DEFECT ASSERTION. Given the three readings above,
      // every one of these is measurably FALSE of what the user can see right
      // now. On `8aa8c1a` `src/` the tooltip carried two of them.
      for (const disproved of RETRACTED_CLAIMS) {
        await expect(
          tooltipSaying(disproved),
          `beside an inactive option this is measurably FALSE, so it must be absent: "${disproved}"`,
        ).toHaveCount(0);
      }

      // Only now the positive: what the string may say instead.
      await expect(
        tooltipSaying('This theme sets none of the six colour values HAVDM maps'),
        'the absence claim must be the thing the user reads on an inactive option too',
      ).toBeVisible({ timeout: 5000 });
    } finally {
      await close(ctx);
    }
  });

  /**
   * ⚠⚠⚠ THE SECOND TEMPORAL REGIME — the PENDING collapsed value, and the
   * context R4-M1 named that the leg above does NOT reach.
   *
   * ⭐ WHY THIS LEG EXISTS, AND IT IS A SELF-CAUGHT GAP. The round-4 fix claimed
   * the new wording is true in all EIGHT render contexts. Running the round-5
   * commission against that claim before sending it showed the tooltip TEXT was
   * asserted in only TWO — both of them `theme-select`, one applied and one an
   * option row. **Neither is a PENDING context, and the two pending ones are
   * precisely what R4-M1 called out**: `theme-settings-select` does not apply
   * until `handleApply`, and `theme-manager-saved-select` does not until
   * `handleLoadSavedTheme`. A claim measured in the two easiest contexts is not
   * a claim measured across its population.
   *
   * ⚠⚠ THE DISTINCTION FROM AN OPTION ROW IS REAL, NOT COSMETIC. Here the
   * dropdown is CLOSED and the theme is the Select's committed value — it looks
   * exactly like the applied case in `ThemeSelector`, and a user has no way to
   * tell them apart. That is what makes a present-tense rendered-state claim
   * indefensible here: the same pixels mean "applied" in one Select and
   * "staged, pending Apply" in another.
   *
   * ⚠ Assertion order is defect-first for the same reason as the leg above.
   */
  test('the tooltip holds on a PENDING collapsed value, before Apply', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await connectWithRealThemes(ctx);

      // Apply a RICH theme through the header picker, and pin what it painted.
      await pickTheme(ctx, 'Material You');
      const richBackground = await canvasBackground(ctx);
      const richText = await canvasText(ctx);
      expect(richBackground, 'the rich theme must paint a canvas background').toBeTruthy();

      // Stage a BADGED theme in the dialog picker — and do NOT press Apply.
      await ctx.settings.open();
      await ctx.settings.selectTab('Appearance');
      const select = ctx.window.getByTestId('theme-settings-select');
      await expect(select).toBeVisible({ timeout: 5000 });
      await select.click();
      // ⚠ SCOPE THE OPTION TO THE *OPEN* DROPDOWN. The header picker's popup
      // stays MOUNTED after `pickTheme`, so an unscoped
      // `.ant-select-item-option[title="Mushroom Square"]` resolves to TWO
      // elements and Playwright's strict mode throws. Measured: this leg's first
      // run failed on exactly that — a locator error, not a product defect, and
      // rule 9 says a red that fails for the wrong reason has proved nothing.
      const dropdown = ctx.window
        .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        .last();
      await expect(dropdown).toBeVisible({ timeout: 5000 });
      await dropdown.locator('.ant-select-item-option[title="Mushroom Square"]').click();

      const badge = select.getByTestId('theme-no-effect-badge');
      await expect(
        badge,
        'the staged-but-unapplied value must carry the badge — that is the whole hazard',
      ).toBeVisible({ timeout: 5000 });
      await badge.hover();

      const tooltipSaying = (text: string) =>
        ctx.window.locator('.ant-tooltip-container', { hasText: text });

      // Wording-neutral precondition (rule 9), as above.
      await expect(
        tooltipSaying('This theme'),
        "the badge's tooltip must be open before its contents are judged",
      ).toBeVisible({ timeout: 5000 });

      // ⭐ THE CONTEXT: nothing has been applied, so Material You is still painting.
      expect(
        await canvasBackground(ctx),
        'staging a theme must not apply it — the rich background must still be painted',
      ).toBe(richBackground);
      expect(
        await canvasText(ctx),
        'staging a theme must not apply it — the rich text colour must still be painted',
      ).toBe(richText);

      // Therefore no rendered-state claim may be on screen here either.
      for (const disproved of RETRACTED_CLAIMS) {
        await expect(
          tooltipSaying(disproved),
          `beside a PENDING collapsed value this is measurably FALSE, so it must be absent: "${disproved}"`,
        ).toHaveCount(0);
      }

      await expect(
        tooltipSaying('This theme sets none of the six colour values HAVDM maps'),
        'the absence claim must hold in the pending regime too',
      ).toBeVisible({ timeout: 5000 });

      await ctx.settings.close();
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
