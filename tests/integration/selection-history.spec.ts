import { test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

/**
 * Regression cover for: selecting a card pushed a spurious undo-history entry
 * and cleared the redo stack.
 *
 * Root cause was react-grid-layout, not the properties form. DRAG_THRESHOLD is 0
 * in GridCanvas so that a click still selects a card, which means every click
 * also completes a zero-distance drag and fires onDragStop. That was forwarded
 * to App.handleLayoutChange, which called updateConfig — pushing a `past` entry
 * and clearing `future`. Compounding it, palette-added cards were all stored at
 * (0, 0) while the vertical compactor rendered them stacked, so there was always
 * a pending layout "delta" for that first click to commit.
 *
 * Nothing else in the suite asserts history DEPTH or exercises redo at all.
 */
test.describe('Selection and undo history', () => {
  test('selecting cards does not push undo-history entries', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(2);

      const before = await ctx.appDSL.getHistoryDepth();

      // Bare selections — no edits of any kind.
      await ctx.canvas.selectCard(0);
      await ctx.canvas.toggleCardSelection(1);
      await ctx.canvas.expectSelectedCards([0, 1]);
      await ctx.canvas.selectCard(0);

      await ctx.appDSL.expectHistoryDepth(before);
    } finally {
      await close(ctx);
    }
  });

  test('selecting a card after an undo preserves the redo stack', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      // Three cards, so undoing back to two still leaves a multi-card layout —
      // that is where a stale stored position could be committed by a click.
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.palette.addCard('button');
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(3);

      await ctx.appDSL.undo();
      await ctx.canvas.expectCardCount(2);
      await ctx.appDSL.expectCanRedo(true);

      const afterUndo = await ctx.appDSL.getHistoryDepth();

      // Clicking cards must not discard the pending redo. Note this needs more
      // than one click: App sets ignoreNextLayoutChangeRef during undo, so the
      // first layout event after an undo is swallowed regardless.
      await ctx.canvas.selectCard(0);
      await ctx.canvas.selectCard(1);

      await ctx.appDSL.expectHistoryDepth(afterUndo);
      await ctx.appDSL.expectCanRedo(true);

      await ctx.appDSL.redo();
      await ctx.canvas.expectCardCount(3);
    } finally {
      await close(ctx);
    }
  });
});
