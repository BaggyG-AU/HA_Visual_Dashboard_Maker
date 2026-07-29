import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

/**
 * Regression cover for two v1.0.0 UAT round-1 High defects on the flat canvas.
 *
 * CANVAS-04 — "Cannot grab resize handle." react-grid-layout DOES render a
 * resize handle and `GridCanvas.css` DOES reveal it on hover, so the tester
 * could see it. But the inner `canvas-card` div fills the grid item exactly
 * (measured: grid item and inner card both 585x310 at the same origin), so the
 * antd Card painted over the handle's 20x20 corner and swallowed every click.
 * `document.elementFromPoint` at the handle's own centre returned the card, and
 * a real drag changed the card's size by 0px.
 *
 * PROPS-06 — "Tried to drag Button card in but card inserted onto the canvas."
 * `GridCanvas.handleDrop` had no container awareness at all: every palette drop
 * appended to the view's flat `cards`, so a card dropped onto a Vertical Stack
 * landed BESIDE it. Measured: canvas-card count went 1 -> 2 with the stack's own
 * child count unchanged.
 *
 * ⚠ WHY THE CITED COVERAGE COULD NOT SEE EITHER. CANVAS-04 was honestly marked
 * `auto_covered: N` and no spec in the repo touches `.react-resizable-handle`.
 * PROPS-06 was marked `auto_covered: Y` on `tests/e2e/spacing.spec.ts`, which is
 * a real, assertive spec (6 tests, 8 expects) that performs ZERO drags — it
 * proves gap VALUES reach the config and cannot reach step 1 at all.
 */
const TWO_CARDS = `title: Resize
views:
  - title: Home
    path: home
    cards:
      - type: markdown
        content: CARD-ONE
      - type: markdown
        content: CARD-TWO
`;

const STACK = `title: Nest
views:
  - title: Home
    path: home
    cards:
      - type: vertical-stack
        cards:
          - type: markdown
            content: INSIDE-ONE
`;

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;
const load = async (ctx: Ctx, yaml: string): Promise<void> => {
  await ctx.window.evaluate((s) => {
    (
      window as unknown as { __dashboardTestApi?: { loadYaml: (v: string) => void } }
    ).__dashboardTestApi?.loadYaml(s);
  }, yaml);
  await ctx.window.waitForTimeout(600);
};

test.describe('Flat canvas resize and nesting', () => {
  test('CANVAS-04: the resize handle is reachable and actually resizes', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    try {
      const { window: w } = ctx;
      await ctx.appDSL.waitUntilReady();
      await load(ctx, TWO_CARDS);

      const item = w.locator('.react-grid-item').first();
      await expect(item).toBeVisible();
      await item.hover();

      // ⭐ The defect was hit-testing, not visibility: assert the handle is the
      // topmost element at its OWN centre. Asserting only that it exists, or
      // only that it is visible, passed the whole time this was broken.
      const hittable = await w.evaluate(() => {
        const h = document.querySelector('.react-resizable-handle') as HTMLElement | null;
        if (!h) return { found: false, hittable: false, topAtCentre: null as string | null };
        const r = h.getBoundingClientRect();
        const top = document.elementFromPoint(
          r.left + r.width / 2,
          r.top + r.height / 2,
        ) as HTMLElement | null;
        return {
          found: true,
          hittable: top === h || h.contains(top),
          topAtCentre: top ? `${top.tagName}.${String(top.className).split(' ')[0]}` : null,
        };
      });
      expect(hittable.found).toBe(true);
      expect(hittable.hittable).toBe(true);

      // ⭐ CONTROL LEG: hit-testing is necessary but not sufficient — the drag
      // must actually change the card's geometry.
      const size = () =>
        w.evaluate(() => {
          const el = document.querySelector('.react-grid-item') as HTMLElement;
          const r = el.getBoundingClientRect();
          return { w: Math.round(r.width), h: Math.round(r.height) };
        });
      const before = await size();

      const hb = await w.locator('.react-resizable-handle').first().boundingBox();
      expect(hb).not.toBeNull();
      await w.mouse.move(hb!.x + hb!.width / 2, hb!.y + hb!.height / 2);
      await w.mouse.down();
      await w.mouse.move(hb!.x + hb!.width / 2 + 260, hb!.y + hb!.height / 2 + 80, { steps: 15 });
      await w.mouse.up();
      await w.waitForTimeout(700);

      const after = await size();
      expect(after.w).toBeGreaterThan(before.w);
    } finally {
      await close(ctx);
    }
  });

  test('PROPS-06: a card dropped on a stack nests instead of landing beside it', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    try {
      const { window: w } = ctx;
      await ctx.appDSL.waitUntilReady();
      await load(ctx, STACK);

      const topLevel = () => w.evaluate(() => document.querySelectorAll('.react-grid-item').length);
      expect(await topLevel()).toBe(1);

      await ctx.palette.expandCategory('Controls');
      await w.getByTestId('palette-card-button').dragTo(w.getByTestId('canvas-card').first());
      await w.waitForTimeout(900);

      // ⭐ The defect: the card became a SIBLING. One top-level grid item must
      // remain — the stack — and the new card must be inside it.
      expect(await topLevel()).toBe(1);

      // ⭐ CONTROL LEG: asserting only "still one grid item" would also pass if
      // the drop were silently dropped on the floor. Prove the card arrived.
      const nested = await w.evaluate(
        () =>
          document.querySelector('[data-testid="canvas-card"]')?.querySelectorAll('.ant-card')
            .length ?? -1,
      );
      expect(nested).toBeGreaterThan(2);
    } finally {
      await close(ctx);
    }
  });
});
