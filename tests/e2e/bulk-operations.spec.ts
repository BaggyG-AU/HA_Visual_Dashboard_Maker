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

  /**
   * ⚠ The test above reaches three cards with `rangeSelectCard` (SHIFT+click).
   * CLIP-04's step 1 says "Click the first card, then Ctrl+Click the second and
   * third" — a DIFFERENT input path at the same N, and it had no e2e coverage.
   * That gap is half of why CLIP-04's `auto_covered: Y` citation looked complete
   * while missing the defect: the integration spec had the right input path at
   * the wrong N, this one the right N by the wrong input path.
   */
  test('supports multi-select bulk property edit via Ctrl+Click (CLIP-04)', async () => {
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
      await ctx.canvas.toggleCardSelection(2);
      await ctx.canvas.expectSelectedCards([0, 1, 2]);

      await ctx.properties.expectMultiSelectNotice(3);
      await ctx.properties.setCardName('Ctrl Bulk Name');

      await ctx.canvas.selectCard(0);
      await ctx.properties.expectCardName('Ctrl Bulk Name');
      await ctx.canvas.selectCard(1);
      await ctx.properties.expectCardName('Ctrl Bulk Name');
      await ctx.canvas.selectCard(2);
      await ctx.properties.expectCardName('Ctrl Bulk Name');
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
