/**
 * E2E: the discriminating controls for FILE-05 Expected 3's four guards.
 *
 * ⚠⚠⚠ WHY THIS FILE EXISTS. `tests/e2e/save-and-backup.spec.ts` ›
 * `Expected 3: re-reading the file shows the card in its NEW position` carries
 * FOUR separate guards, and until this file existed none of them had a durable
 * proof that it can fail:
 *
 *   1. the rendered comparison is measured RELATIVE TO THE GRID, so a movement
 *      of the grid within the window cannot read as a layout change;
 *   2. it is nevertheless still SENSITIVE to a card that really moves WITHIN the
 *      grid;
 *   3. the placed card's grid geometry is written to disk as exact integers;
 *   4. each rectangle is sampled only once the grid has STOPPED MOVING.
 *
 * The mutations that proved (1) and (2) when the repair was written — `shift`,
 * `striplayout` and `movecard` — were SCRATCH edits, so they survive only in the
 * commit message of `f52ccf13`. Independent review of PR #144 (finding N1,
 * `docs/reviews/ci-unstable-tests-codex-round1-review.md`) named the consequence
 * that matters: BOTH the old absolute form AND the new relative form pass
 * normally in this environment, so a future reversion of relative coordinates to
 * viewport coordinates would stay locally GREEN and would be caught only by CI
 * chance.
 *
 * ⭐⭐⭐ THAT PREDICTION CAME TRUE WITHIN THE HOUR, AND GUARD 4 IS WHAT IT BOUGHT.
 * GitHub Actions run 31876211967, at head `f52ccf13` — the relative-coordinate
 * repair itself — failed Expected 3 on its first attempt by 2.317108154296875 px.
 * The mechanism, measured by control 4 below, is that the FIRST sample was taken
 * while react-grid-layout was still animating the other cards around the newly
 * inserted one. Relative coordinates were a real repair to a real second defect;
 * they were never the whole of this one.
 *
 * ⭐ EACH GUARD GETS ITS OWN MUTATION. A fixture that names two guards must fail
 * against the wrong implementation for EACH of them — an assertion of sameness
 * is satisfied by every reason for sameness — so these are four separate tests
 * with four separate mutations, not one test with four assertions.
 *
 * ⓘ WHAT THESE CONTROLS ARE, AND WHAT THEY ARE NOT. Controls 1-3 exercise the
 * DSL's COORDINATE ARITHMETIC — what `getCardRectsRelativeToGrid` subtracts — so
 * their mutations are deterministic geometric ones (a CSS transform), not pointer
 * drags. A drag is timing-sensitive and would make the control measure the drag
 * instead of the arithmetic; `save-and-backup.spec.ts:88-96` declines a drag for
 * the same reason. Control 4 is the exception and must be a TIMING mutation,
 * because timing is the property it defends.
 *
 * ⚠ THE THIRD CONTROL RESTATES THE SAVED-DATA ASSERTION AT
 * `tests/e2e/save-and-backup.spec.ts` RATHER THAN SHARING IT. Extracting a common
 * predicate is worth doing and is listed as a follow-up; until then this is a
 * consistency surface and the two copies must be changed together.
 */
import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as yaml from 'js-yaml';

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

/** The same two-card seed the Save fixture uses, so the population matches. */
const DASHBOARD_YAML = `title: Save Regression
views:
  - title: Home
    path: home
    cards:
      - type: button
        name: First Card
      - type: button
        name: Second Card
`;

/**
 * How far the mutations move things, in CSS pixels.
 *
 * ⭐ CHOSEN, NOT ARBITRARY. The comparison being defended allows ±2 px, and the
 * real CI failures moved x by 75.24, 44.74 and 44.66 px (run `31871488924`).
 * These offsets sit inside that observed band and an order of magnitude above
 * the tolerance, so neither control can pass or fail on rounding.
 */
const GRID_SHIFT_X = 64;
const GRID_SHIFT_Y = 48;
const CARD_MOVE_X = 57;
const CARD_MOVE_Y = 31;

/** Sub-pixel slack for a comparison of two `getBoundingClientRect()` readings. */
const EPSILON = 0.5;

const loadFileBacked = async (ctx: Ctx, contents: string, filePath: string) => {
  await ctx.window.evaluate(
    ([y, p]) => {
      (
        window as unknown as {
          __dashboardTestApi: { loadYaml: (yaml: string, filePath?: string | null) => void };
        }
      ).__dashboardTestApi.loadYaml(y, p);
    },
    [contents, filePath] as const,
  );
};

/** Add one palette card, exactly as the Save fixture's `makeDirty` does. */
const makeDirty = async (ctx: Ctx, expectedCount: number) => {
  await ctx.palette.expandCategory('Controls');
  await ctx.palette.addCard('button');
  await ctx.canvas.expectCardCount(expectedCount);
};

/** The grid container's own viewport rectangle — the origin the helper subtracts. */
const gridOrigin = async (ctx: Ctx): Promise<{ x: number; y: number }> =>
  await ctx.window.evaluate(() => {
    const grid = document.querySelector('.react-grid-layout');
    if (!grid) throw new Error('no .react-grid-layout container found on the page');
    const r = grid.getBoundingClientRect();
    return { x: r.left, y: r.top };
  });

/**
 * Translate the WHOLE grid, container and cards together.
 *
 * A CSS transform is used rather than a margin or a padding on purpose: it moves
 * the painted box without changing the container's WIDTH, and react-grid-layout
 * derives its column geometry from the available width. A mutation that resized
 * the container would move the cards within the grid as well, which is the very
 * thing this control has to hold still.
 */
const translateGrid = async (ctx: Ctx, dx: number, dy: number) => {
  await ctx.window.evaluate(
    ([x, y]) => {
      const grid = document.querySelector('.react-grid-layout') as HTMLElement | null;
      if (!grid) throw new Error('no .react-grid-layout container found on the page');
      grid.style.transform = `translate(${x}px, ${y}px)`;
    },
    [dx, dy] as const,
  );
};

/**
 * Move ONE card and nothing else.
 *
 * react-grid-layout positions each item with an inline `transform: translate(…)`,
 * so the offset is APPENDED to whatever is already there rather than replacing
 * it — replacing would move the card to the grid's origin instead of displacing
 * it, which is a different mutation and would not test what this control names.
 *
 * ⚠⚠⚠ THE TRANSITION MUST BE KILLED FIRST, AND THIS IS NOT A PRECAUTION — IT IS
 * A MEASURED DEFECT IN THE FIRST DRAFT OF THIS CONTROL. Every `.react-grid-item`
 * carries `transition: transform 0.2s` (react-grid-layout's own stylesheet), so
 * a transform applied and then measured in the next round trip reads as a
 * displacement of ZERO while the card is still at the start of its animation.
 * The first run of this file failed with `Expected: 57 / Received: 0` for
 * exactly that reason: a fourth dead instrument, reading as a clean result while
 * measuring nothing. The grid CONTAINER carries no such transition, which is why
 * the sibling control above needs no equivalent.
 *
 * ⓘ `transition: none` is preferred over polling for the card to arrive: polling
 * for the answer you want cannot distinguish "it got there" from "it was never
 * going to move", whereas removing the animation makes the mutation instant and
 * the reading unconditional.
 */
const translateCard = async (ctx: Ctx, index: number, dx: number, dy: number) => {
  await ctx.window.evaluate(
    ([i, x, y]) => {
      const items = document.querySelectorAll<HTMLElement>('.react-grid-layout > .react-grid-item');
      const item = items[i];
      if (!item) throw new Error(`no .react-grid-item at index ${i} (found ${items.length})`);
      item.style.transition = 'none';
      // Force the style recalculation so the transform below cannot be batched
      // into the same frame as the transition change and animate anyway.
      void item.offsetWidth;
      item.style.transform = `${item.style.transform} translate(${x}px, ${y}px)`;
    },
    [index, dx, dy] as const,
  );
};

test.describe('Class D controls: what the grid-relative card comparison can and cannot see', () => {
  test('CONTROL: translating the whole grid moves the ABSOLUTE rectangles and leaves the relative ones untouched', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-geom-shift-'));
    const target = path.join(tmpDir, 'dash.yaml');
    try {
      await ctx.appDSL.waitUntilReady();
      await loadFileBacked(ctx, DASHBOARD_YAML, target);
      await ctx.canvas.expectCardCount(2);
      await makeDirty(ctx, 3);

      const absBefore = await ctx.canvas.getCardRects();
      const relBefore = await ctx.canvas.getCardRectsRelativeToGrid();
      expect(absBefore, 'the fixture must render three grid items').toHaveLength(3);

      await translateGrid(ctx, GRID_SHIFT_X, GRID_SHIFT_Y);

      const absAfter = await ctx.canvas.getCardRects();
      const relAfter = await ctx.canvas.getCardRectsRelativeToGrid();

      // ⭐⭐ THE RED HALF, AND THE LIVENESS CHECK IN ONE. This is the assertion the
      // OLD absolute comparison made, and it now fails by 64 px and 48 px against
      // a ±2 px tolerance. It is also the proof that the mutation MOVED
      // SOMETHING — a transform that silently did nothing would fail here rather
      // than let the relative assertion below pass for free.
      absAfter.forEach((rect, i) => {
        expect(
          rect.x - absBefore[i].x,
          `card[${i}] absolute x must shift with the grid`,
        ).toBeCloseTo(GRID_SHIFT_X, 1);
        expect(
          rect.y - absBefore[i].y,
          `card[${i}] absolute y must shift with the grid`,
        ).toBeCloseTo(GRID_SHIFT_Y, 1);
        expect(Math.abs(rect.x - absBefore[i].x)).toBeGreaterThan(2);
        expect(Math.abs(rect.y - absBefore[i].y)).toBeGreaterThan(2);
      });

      // ⭐⭐ THE GREEN HALF. The same movement is invisible to the relative form,
      // because the cards did not move WITHIN the grid. If this helper is ever
      // reverted to viewport coordinates, this is the assertion that goes red.
      expect(relAfter).toHaveLength(relBefore.length);
      relAfter.forEach((rect, i) => {
        expect(rect.x - relBefore[i].x, `card[${i}] relative x must not move`).toBeCloseTo(0, 1);
        expect(rect.y - relBefore[i].y, `card[${i}] relative y must not move`).toBeCloseTo(0, 1);
        expect(rect.w - relBefore[i].w, `card[${i}] width must not change`).toBeCloseTo(0, 1);
        expect(rect.h - relBefore[i].h, `card[${i}] height must not change`).toBeCloseTo(0, 1);
      });
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('CONTROL: a card that really moves WITHIN the grid is still visible to the relative comparison', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-geom-move-'));
    const target = path.join(tmpDir, 'dash.yaml');
    const MOVED = 1;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadFileBacked(ctx, DASHBOARD_YAML, target);
      await ctx.canvas.expectCardCount(2);
      await makeDirty(ctx, 3);

      const originBefore = await gridOrigin(ctx);
      const absBefore = await ctx.canvas.getCardRects();
      const relBefore = await ctx.canvas.getCardRectsRelativeToGrid();
      expect(relBefore, 'the fixture must render three grid items').toHaveLength(3);

      await translateCard(ctx, MOVED, CARD_MOVE_X, CARD_MOVE_Y);

      const originAfter = await gridOrigin(ctx);
      const absAfter = await ctx.canvas.getCardRects();
      const relAfter = await ctx.canvas.getCardRectsRelativeToGrid();

      // ⭐⭐⭐ LIVENESS FIRST, AND IT IS NAMED SO A DEAD INSTRUMENT CANNOT MASQUERADE
      // AS A HELPER DEFECT. Read in ABSOLUTE coordinates, which no part of the
      // subject under test touches: if the mutation did not move the card on
      // screen at all — the `transition: transform 0.2s` trap this file's first
      // run walked into — the failure says so here, instead of accusing
      // `getCardRectsRelativeToGrid` of cancelling a movement that never happened.
      expect(
        absAfter[MOVED].x - absBefore[MOVED].x,
        'the mutation did not move the card on screen — the instrument is dead',
      ).toBeCloseTo(CARD_MOVE_X, 1);
      expect(
        absAfter[MOVED].y - absBefore[MOVED].y,
        'the mutation did not move the card on screen — the instrument is dead',
      ).toBeCloseTo(CARD_MOVE_Y, 1);

      // ⭐ The mutation must be CARD-ONLY, or this test would be the previous one
      // wearing a different name. The grid's own origin is unmoved.
      expect(originAfter.x, 'the grid origin must not move in this control').toBeCloseTo(
        originBefore.x,
        1,
      );
      expect(originAfter.y, 'the grid origin must not move in this control').toBeCloseTo(
        originBefore.y,
        1,
      );

      // ⭐⭐ THE GUARD. Subtracting the grid origin must NOT cancel a real
      // within-grid move. An implementation that subtracted a PER-CARD origin —
      // the plausible way to get this wrong — would report zero here.
      expect(
        relAfter[MOVED].x - relBefore[MOVED].x,
        'the moved card must show its displacement in relative coordinates',
      ).toBeCloseTo(CARD_MOVE_X, 1);
      expect(
        relAfter[MOVED].y - relBefore[MOVED].y,
        'the moved card must show its displacement in relative coordinates',
      ).toBeCloseTo(CARD_MOVE_Y, 1);
      expect(Math.abs(relAfter[MOVED].x - relBefore[MOVED].x)).toBeGreaterThan(2);
      expect(Math.abs(relAfter[MOVED].y - relBefore[MOVED].y)).toBeGreaterThan(2);

      // ⭐ CONTROL WITHIN THE CONTROL. Only the mutated card moved, so a helper
      // that shifted every card equally would fail here rather than pass above.
      relAfter.forEach((rect, i) => {
        if (i === MOVED) return;
        expect(Math.abs(rect.x - relBefore[i].x), `card[${i}] must not move`).toBeLessThanOrEqual(
          EPSILON,
        );
        expect(Math.abs(rect.y - relBefore[i].y), `card[${i}] must not move`).toBeLessThanOrEqual(
          EPSILON,
        );
      });
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('CONTROL: the persisted-layout assertion fails when the placed card loses its grid geometry', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-geom-layout-'));
    const target = path.join(tmpDir, 'dash.yaml');
    try {
      await ctx.appDSL.waitUntilReady();
      await loadFileBacked(ctx, DASHBOARD_YAML, target);
      await ctx.canvas.expectCardCount(2);
      await makeDirty(ctx, 3);

      await ctx.dashboard.toolbarSave.click();
      await expect(ctx.dashboard.dirtyIndicator).toBeHidden();

      const written = fs.readFileSync(target, 'utf8');
      const parsed = yaml.load(written) as {
        views?: Array<{ cards?: Array<Record<string, unknown>> }>;
      };
      const savedCards = parsed.views?.[0]?.cards ?? [];

      // The predicate restated from `save-and-backup.spec.ts:217-233`. See the
      // docblock: it is duplicated rather than shared on purpose, and the two
      // copies must move together until the predicate is extracted after merge.
      const assertPlacedCardLayout = (cards: Array<Record<string, unknown>>) => {
        expect(cards, 'the save must write all three cards').toHaveLength(3);
        expect(
          cards[cards.length - 1]._havdm_layout,
          'the placed card lost its grid geometry in the save',
        ).toEqual({
          x: expect.any(Number),
          y: expect.any(Number),
          w: expect.any(Number),
          h: expect.any(Number),
        });
      };

      // ⭐ THE POSITIVE LEG — the real save satisfies the guard.
      assertPlacedCardLayout(savedCards);

      // ⭐⭐ THE MUTATION THIS CONTROL EXISTS FOR. Delete the persisted geometry
      // from the placed card and nothing else, and require the SAME predicate to
      // reject it. Without this the assertion could be satisfied by a document
      // that never carried geometry at all, and nobody would know.
      const stripped = (yaml.load(written) as typeof parsed).views?.[0]?.cards ?? [];
      delete stripped[stripped.length - 1]._havdm_layout;

      expect(stripped, 'the mutation must remove the key and nothing else').toHaveLength(3);
      expect(
        stripped[stripped.length - 1],
        'the mutated card must still be the same card',
      ).toMatchObject({ type: savedCards[savedCards.length - 1].type });
      expect(() => assertPlacedCardLayout(stripped)).toThrow();
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('CONTROL: sampling before the grid stops moving records a card in flight, and settling does not', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-geom-settle-'));
    const target = path.join(tmpDir, 'dash.yaml');
    try {
      await ctx.appDSL.waitUntilReady();
      await loadFileBacked(ctx, DASHBOARD_YAML, target);
      await ctx.canvas.expectCardCount(2);

      // ⭐⭐⭐ THE AMPLIFIER, AND THE PROOF THAT IT IS LIVE. react-grid-layout ships
      // `transition: transform 0.2s`, which on this machine is over before a
      // Playwright round trip completes — which is precisely why nine local
      // measurements of the real test read exactly zero while GitHub Actions run
      // 31876211967 failed by 2.317108154296875 px. Stretching it to three
      // seconds makes the same race observable here. The computed duration is
      // read back and asserted: an amplifier that silently did nothing would
      // otherwise let the rest of this test pass for the wrong reason, which this
      // branch has already produced three times.
      const duration = await ctx.window.evaluate(() => {
        const style = document.createElement('style');
        style.textContent = '.react-grid-item { transition: transform 3s linear !important; }';
        document.head.appendChild(style);
        const item = document.querySelector('.react-grid-item');
        return item ? getComputedStyle(item).transitionDuration : 'no-grid-item';
      });
      expect(duration, 'the transition amplifier did not take effect').toBe('3s');

      // The real fixture's dirtying step, verbatim — including the fact that
      // `expectCardCount` waits for EXISTENCE, not for the reflow it triggers.
      await ctx.palette.expandCategory('Controls');
      await ctx.palette.addCard('button');
      await ctx.canvas.expectCardCount(3);

      // The OLD sample: a single unguarded read, taken exactly where the test
      // used to take it.
      const unsettled = await ctx.canvas.getCardRectsRelativeToGrid();
      // The NEW sample: the same read, but only once the geometry holds still.
      const settled = await ctx.canvas.getCardRectsRelativeToGridSettled({ timeoutMs: 15000 });
      // Ground truth, well past the amplified animation.
      await ctx.window.waitForTimeout(4000);
      const truth = await ctx.canvas.getCardRectsRelativeToGrid();

      const worst = (a: typeof truth, b: typeof truth) =>
        Math.max(...a.map((r, i) => Math.max(Math.abs(r.x - b[i].x), Math.abs(r.y - b[i].y))));

      // ⭐⭐ THE RED HALF. The unguarded read disagrees with the settled geometry
      // by far more than the ±2 px the comparison allows. This is the assertion
      // that goes red if anyone reverts the load-bearing test to an unsettled
      // sample.
      expect(
        worst(unsettled, truth),
        'the unsettled sample must catch a card in flight, or this control proves nothing',
      ).toBeGreaterThan(2);

      // ⭐⭐ THE GREEN HALF. The settled read agrees with ground truth, so the
      // guard removes the race rather than merely renaming it.
      expect(
        worst(settled, truth),
        'the settled sample must match the geometry the grid came to rest at',
      ).toBeLessThanOrEqual(2);
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
