import { test, expect } from '@playwright/test';
import { close, launchWithDSL } from '../support';

test.describe('Bulk Operations Integration', () => {
  test('applies bulk delete and single-step undo history', async () => {
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.palette.addCard('button');
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(3);

      await ctx.canvas.selectCard(0);
      await ctx.canvas.toggleCardSelection(2);
      await ctx.canvas.expectSelectedCards([0, 2]);

      await ctx.appDSL.deleteSelection();
      await ctx.canvas.expectCardCount(1);
      await ctx.appDSL.expectCanUndo(true);

      await ctx.appDSL.undo();
      await ctx.canvas.expectCardCount(3);
    } finally {
      await close(ctx);
    }
  });

  // NOTE: undo granularity is NOT the problem — that part of this test's name is a
  // leftover from a misdiagnosis. Measured on 2026-07-20: a bulk multi-select edit
  // records exactly ONE history entry and ONE undo restores BOTH cards on the
  // canvas. What still fails is the assertion path: expectCardName() reads the
  // properties form, and the form keeps showing the edited value after undo.
  // See docs/testing/SKIPPED_TESTS_REGISTER.md for the full reason.
  test.fixme('applies bulk property edit to selected cards and preserves undo granularity', async () => {
    test.fixme(
      true,
      'Known issue: after undo the properties form still shows the edited value. antd setFieldsValue merges, so a key the reverted card no longer has is never cleared. The canvas and the undo history are both correct.',
    );
    const ctx = await launchWithDSL();

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();

      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(2);

      await ctx.canvas.selectCard(0);
      const firstOriginal = await ctx.properties.getCardName();

      await ctx.canvas.selectCard(1);
      const secondOriginal = await ctx.properties.getCardName();

      await ctx.canvas.selectCard(0);
      await ctx.canvas.toggleCardSelection(1);
      await ctx.canvas.expectSelectedCards([0, 1]);

      await ctx.properties.setCardName('Bulk Edited');

      await ctx.canvas.selectCard(0);
      await ctx.properties.expectCardName('Bulk Edited');
      await ctx.canvas.selectCard(1);
      await ctx.properties.expectCardName('Bulk Edited');

      await ctx.appDSL.expectCanUndo(true);
      await ctx.appDSL.undo();

      await ctx.canvas.selectCard(0);
      await ctx.properties.expectCardName(firstOriginal);
      await ctx.canvas.selectCard(1);
      await ctx.properties.expectCardName(secondOriginal);

      expect(firstOriginal).not.toBe('Bulk Edited');
      expect(secondOriginal).not.toBe('Bulk Edited');
    } finally {
      await close(ctx);
    }
  });
});
