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

  // NOTE: undo granularity was never the problem — that part of this test's name
  // is a leftover from a misdiagnosis. A bulk multi-select edit records exactly
  // ONE history entry and ONE undo restores BOTH cards. What kept this skipped
  // was the assertion path: expectCardName() reads the properties form, and the
  // form kept showing the edited value after undo because antd's setFieldsValue
  // merges. Unskipped once PropertiesPanel began clearing fields the reloaded
  // card no longer has.
  test('applies bulk property edit to selected cards and preserves undo granularity', async () => {
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
