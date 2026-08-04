/**
 * E2E (Tier 1 — persisted state across a restart): the theme you picked is the
 * theme you get back.
 *
 * Automated coverage for UAT defect THEME-01 (F2). The card's step 5 is "close
 * and re-open the dialog" and its Expected 4 is "Re-opening the dialog shows the
 * theme and mode you selected" — but the defect underneath is wider than the
 * dialog, and this spec measures the wider thing: a full application restart.
 *
 * ⭐⭐⭐ THE DEFECT, MEASURED BEFORE ANY CODE WAS WRITTEN by bundling the real
 * `themeStore` with esbuild and driving it: every pick was WRITTEN to disk via
 * `setSelectedTheme` and NEVER READ BACK. `getSelectedTheme` existed in
 * `settingsService`, `main.ts` and `preload.ts` with ZERO renderer callers, and
 * the boot effect restored only `darkMode` and `syncWithHA`. Two of three theme
 * preferences survived a restart and the third silently did not — while sitting
 * on disk the whole time.
 *
 * ⭐⭐ THIS IS THE LEG THAT ACTUALLY MEASURES THE BUG. The store-level tests in
 * `tests/unit/themeStore.offline.spec.ts` cover the outcome rules but cannot be
 * red-legged (their action is new, so a reverted `src/` fails them with a
 * TypeError rather than on an assertion). Here every control driven and every
 * value asserted EXISTS ON BASE, and on base the relaunched app comes up with an
 * empty theme picker — which is exactly what the assertion reports.
 *
 * ⚠⚠ EVERYTHING IS ASSERTED THROUGH THE VISIBLE CONTROLS, NOT A TEST HOOK, AND
 * THAT IS DELIBERATE. Reverting `src/` in the same checkout removes any hook
 * this branch added, so a red leg built on one would fail by not finding its
 * hook rather than by finding the wrong theme. The `theme-select` field and the
 * `theme-dark-toggle` switch both exist on base — which is what makes their
 * CONTENTS the measurement. It also means this spec asserts what the user
 * actually sees.
 *
 * ⚠ WHY A RESTART AND NOT JUST RE-OPENING THE DIALOG. Re-opening reads the live
 * store, which was never the broken part — `setTheme` works correctly in-session
 * (measured). Only crossing a process boundary exercises the read-back that was
 * missing. A dialog-only test would have passed on the broken build.
 *
 * ⚠ The relaunch pattern (`close(ctx, { keepProfile: true })` then
 * `launchWithDSL({ reuseUserDataDir })`) follows the one existing precedent,
 * `tests/integration/entity-registry-picker.spec.ts`. The SECOND leg owns the
 * cleanup — closing it without `keepProfile` removes the directory.
 */
import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

/**
 * The text the main-screen theme picker is showing the user.
 *
 * ⚠ Measured, not assumed: antd v6 renders BOTH the selected label and the
 * placeholder inside `.ant-select-content`, so with nothing chosen this returns
 * the placeholder {@link NO_THEME_SHOWN} rather than an empty string. A first
 * draft asserted `''` and failed on a correct app — the instrument was wrong,
 * not the product. Asserting the placeholder is also closer to the card, which
 * is about what the user sees in the control.
 */
const NO_THEME_SHOWN = 'Select theme';

const shownTheme = async (ctx: Ctx): Promise<string> => {
  const field = ctx.window.getByTestId('theme-select');
  await field.waitFor({ state: 'visible', timeout: 15000 });
  const content = field.locator('.ant-select-content');
  return ((await content.count()) > 0 ? ((await content.first().textContent()) ?? '') : '').trim();
};

/** Open the picker and take the option titles — the user's own list. */
const offeredThemes = async (ctx: Ctx): Promise<string[]> => {
  await ctx.window.getByTestId('theme-select').click();
  const options = ctx.window.locator('.ant-select-item-option');
  await options.first().waitFor({ state: 'visible', timeout: 10000 });
  return await options.evaluateAll((nodes) =>
    nodes.map((n) => n.getAttribute('title') ?? '').filter(Boolean),
  );
};

/** Pick a theme through the real main-screen control. */
const pickTheme = async (ctx: Ctx, themeName: string) => {
  await ctx.window.locator(`.ant-select-item-option[title="${themeName}"]`).click();
};

test.describe('THEME-01: a chosen theme survives a restart', () => {
  test('THE DEFECT: the theme picked before quitting is active again after relaunch', async () => {
    let storagePath = '';
    let chosen = '';

    const first = await launchWithDSL();
    try {
      await first.appDSL.waitUntilReady();
      await first.dashboard.createNew();

      // ⭐ CONTROL. A fresh profile has NO theme selected. Proving that is what
      // makes the assertion after the relaunch mean "it was restored" rather
      // than "something happened to be set already".
      expect(await shownTheme(first), 'a fresh profile starts with no theme').toBe(NO_THEME_SHOWN);

      const names = await offeredThemes(first);
      expect(
        names.length,
        'the built-in themes must be selectable with no HA connection',
      ).toBeGreaterThan(0);

      // Not names[0]: picking the first option can coincide with a default and
      // would weaken the assertion. Take a later one where there is a choice.
      chosen = names[1] ?? names[0];
      await pickTheme(first, chosen);

      await expect.poll(() => shownTheme(first), { timeout: 10000 }).toBe(chosen);

      storagePath = first.userDataDir;
    } finally {
      // Keep the profile so the relaunch reads the selection back FROM DISK.
      await close(first, { keepProfile: true });
    }

    const restarted = await launchWithDSL({ reuseUserDataDir: storagePath });
    try {
      await restarted.appDSL.waitUntilReady();
      await restarted.dashboard.createNew();

      // ⭐⭐ THE MEASUREMENT. On base the picker comes up showing "Select theme":
      // the name was on disk and nothing ever read it back.
      await expect.poll(() => shownTheme(restarted), { timeout: 15000 }).toBe(chosen);
    } finally {
      await close(restarted);
    }
  });

  test('CONTROL: dark mode already survived a restart, and still does', async () => {
    // ⭐⭐ GREEN ON BASE AND ON THIS BRANCH, deliberately. Dark mode was ALWAYS
    // restored — that asymmetry is what made the missing theme feel arbitrary in
    // use. A leg green on both sides shows F2 added the third read without
    // disturbing the two that already worked.
    let storagePath = '';
    let expectedChecked = false;

    const first = await launchWithDSL();
    try {
      await first.appDSL.waitUntilReady();
      await first.dashboard.createNew();

      const toggle = first.window.getByTestId('theme-dark-toggle');
      await toggle.waitFor({ state: 'visible', timeout: 15000 });
      const wasChecked = await toggle.isChecked();

      await toggle.click();
      expectedChecked = !wasChecked;
      await expect(toggle).toBeChecked({ checked: expectedChecked, timeout: 10000 });

      storagePath = first.userDataDir;
    } finally {
      await close(first, { keepProfile: true });
    }

    const restarted = await launchWithDSL({ reuseUserDataDir: storagePath });
    try {
      await restarted.appDSL.waitUntilReady();
      await restarted.dashboard.createNew();

      const toggle = restarted.window.getByTestId('theme-dark-toggle');
      await toggle.waitFor({ state: 'visible', timeout: 15000 });
      await expect(toggle).toBeChecked({ checked: expectedChecked, timeout: 15000 });
    } finally {
      await close(restarted);
    }
  });
});
