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

  test.fixme('applies bulk property edit to selected cards and preserves undo granularity', async () => {
    test.fixme(true, 'Known issue: multi-select property edits currently create multiple history entries instead of one atomic undo step.');
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
