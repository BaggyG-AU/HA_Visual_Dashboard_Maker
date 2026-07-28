import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

/**
 * Regression cover for CANVAS-07 (v1.0.0 UAT round 1, High).
 *
 * The tester deleted a card, pressed Ctrl+Z, and got their Card Palette search
 * text undone instead of the card restored. Root cause: App's keydown effect
 * blanket-returned for ANY INPUT/TEXTAREA/contentEditable target before
 * dispatching any shortcut, so with focus in the palette search box the app's
 * undo never ran and Chromium's native input undo took the keystroke.
 *
 * ⚠ WHY THE EXISTING COVERAGE COULD NOT SEE THIS. CANVAS-07 was marked
 * `auto_covered: Y` on `tests/integration/selection-history.spec.ts`, which is a
 * real, assertive spec — but `AppDSL.undo()` calls `__dashboardTestApi.undo()`
 * directly and never presses a key, so it exercises the undo STORE and not the
 * undo KEYBOARD PATH. Suite-wide the only `Control+z` was an unreachable,
 * error-swallowing fallback inside that same DSL method. This spec therefore
 * drives the REAL keystroke, which is the only thing that reproduces the defect.
 */
const TWO_CARD_YAML = `title: Undo Focus
views:
  - title: Home
    path: home
    cards:
      - type: markdown
        content: CARD-ONE
      - type: markdown
        content: CARD-TWO
`;

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

const load = async (ctx: Ctx): Promise<void> => {
  await ctx.window.evaluate((y) => {
    (
      window as unknown as { __dashboardTestApi?: { loadYaml: (s: string) => void } }
    ).__dashboardTestApi?.loadYaml(y);
  }, TWO_CARD_YAML);
};

test.describe('Keyboard undo and focus (CANVAS-07)', () => {
  test('Ctrl+Z restores a deleted card even with focus in the palette search', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    try {
      const { window: w } = ctx;
      await ctx.appDSL.waitUntilReady();
      await load(ctx);

      const cards = w.getByTestId('canvas-card');
      await expect(cards).toHaveCount(2);

      // Delete a card from the canvas (focus is NOT in an input here).
      await cards.first().click();
      await w.keyboard.press('Delete');
      await expect(cards).toHaveCount(1);

      // Now put focus where the tester had it: the Card Palette search box.
      const search = w.getByTestId('card-search');
      await search.click();
      await search.fill('button');
      await expect(search).toHaveValue('button');
      await expect(w.locator(':focus')).toHaveAttribute('data-testid', 'card-search');

      // THE DEFECT: this used to undo a character of "button" and leave the
      // canvas alone. It must undo the card deletion instead.
      await w.keyboard.press('Control+z');

      await expect(cards).toHaveCount(2);
      // ⭐ CONTROL LEG: the search text must survive untouched. Asserting only
      // the card count would pass just as well if Ctrl+Z had fired BOTH the
      // app undo and the native text undo.
      await expect(search).toHaveValue('button');
    } finally {
      await close(ctx);
    }
  });

  test('Delete still edits text and does not delete a card while typing', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    try {
      const { window: w } = ctx;
      await ctx.appDSL.waitUntilReady();
      await load(ctx);

      const cards = w.getByTestId('canvas-card');
      await expect(cards).toHaveCount(2);

      // Select a card so a stray Delete would have something to destroy.
      await cards.first().click();

      const search = w.getByTestId('card-search');
      await search.click();
      await search.fill('button');
      // Put the caret between "butt" and "on" so Delete has a character to eat.
      await w.keyboard.press('ArrowLeft');
      await w.keyboard.press('ArrowLeft');
      await w.keyboard.press('Delete');

      // ⭐ The pass-through is scoped to undo/redo ONLY. Delete must remain a
      // text edit inside an input — never a card deletion. The caret sits
      // between "butt" and "on", so Delete eats the "o" and the CARD SURVIVES.
      await expect(search).toHaveValue('buttn');
      await expect(cards).toHaveCount(2);
    } finally {
      await close(ctx);
    }
  });
});
