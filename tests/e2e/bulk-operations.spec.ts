import { test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

test.describe('Bulk Operations', () => {
  test('supports multi-select bulk property edit flow', async () => {
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
      await ctx.canvas.rangeSelectCard(2);
      await ctx.canvas.expectSelectedCards([0, 1, 2]);

      await ctx.properties.setCardName('Bulk Name');

      await ctx.canvas.selectCard(0);
      await ctx.properties.expectCardName('Bulk Name');
      await ctx.canvas.selectCard(1);
      await ctx.properties.expectCardName('Bulk Name');
      await ctx.canvas.selectCard(2);
      await ctx.properties.expectCardName('Bulk Name');
    } finally {
      await close(ctx);
    }
  });

  test('supports bulk copy, cut-move, and delete flow', async () => {
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
      await ctx.canvas.toggleCardSelection(1);
      await ctx.canvas.expectSelectedCards([0, 1]);

      await ctx.appDSL.copy();
      await ctx.appDSL.paste();
      await ctx.canvas.expectCardCount(5);

      await ctx.canvas.selectCard(3);
      await ctx.canvas.toggleCardSelection(4);
      await ctx.canvas.expectSelectedCards([3, 4]);

      await ctx.appDSL.cut();
      await ctx.appDSL.paste();
      await ctx.canvas.expectCardCount(5);

      await ctx.appDSL.deleteSelection();
      await ctx.canvas.expectCardCount(3);
    } finally {
      await close(ctx);
    }
  });
});
