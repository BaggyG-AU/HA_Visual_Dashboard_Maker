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

/**
 * The CREEP distance for control 5 — small on purpose.
 *
 * ⭐ Ten pixels over a four-second transition is 0.08 px per 32 ms sample. That
 * is the shape that defeats a rounded stability check, and it is deliberately
 * NOT the shape of the other controls: a big fast move proves nothing about
 * rounding. It is still five times the ±2 px the guarded comparison allows, so
 * a slipped settle fails loudly rather than marginally.
 */
const CREEP_PX = 10;

/**
 * Controls 6 and 7 — which card each mutates, and how much growth proves the
 * scale mutation was live.
 *
 * ⭐ A `scale` of 1.1 on a card roughly 288 px wide adds ~28 px, an order of
 * magnitude above the ±2 px the guarded comparison allows, so neither leg can
 * pass or fail on rounding. The floor below is deliberately far under that: it
 * exists to catch a DEAD mutation, not to re-assert the exact scale factor.
 */
const SCALED_CARD = 1;
const DECORATED_CARD = 1;
const SCALE_MIN_GROWTH_PX = 5;

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

/**
 * Add one palette card, exactly as the Save fixture's `makeDirty` does — and
 * then WAIT FOR THE GRID TO STOP MOVING.
 *
 * ⚠⚠⚠ THE SETTLE IS NOT OPTIONAL AND ITS ABSENCE WAS MEASURED, NOT IMAGINED.
 * `expectCardCount` returns when the nth card EXISTS; react-grid-layout then
 * reflows the others around it over `transition: transform 0.2s`. The first
 * version of this file omitted the settle, so controls 1 and 2 took their
 * baselines mid-flight. They passed on the maintainer's machine and in GitHub
 * Actions runs 31878624582 and 31880748615, then failed ALL THREE ATTEMPTS in
 * run 31881906972: control 1 saw `card[1] relative x` move by -21.20 px between
 * two samples that should have been identical, and control 2's liveness check
 * read -60.41 px against an expected +57 px, because the card's own unfinished
 * travel outran the mutation.
 *
 * ⭐⭐⭐ THE LESSON IS THE FILE'S OWN SUBJECT, TURNED ON ITSELF: these controls
 * exist to defend a settle guard, and they were written sampling the way the
 * defect does. A control that does not use the medicine it is prescribing is
 * not a control. It is another instance of the bug.
 *
 * ⓘ Control 4 deliberately does NOT come through here — it needs the race in
 * order to observe it, so it inlines the palette add.
 */
const makeDirty = async (ctx: Ctx, expectedCount: number) => {
  await ctx.palette.expandCategory('Controls');
  await ctx.palette.addCard('button');
  await ctx.canvas.expectCardCount(expectedCount);
  await ctx.canvas.getCardRectsRelativeToGridSettled();
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

      // ⚠⚠ ALL FOUR AXES, BECAUSE ALL FOUR ANIMATE. react-grid-layout's own
      // stylesheet declares `transition-property: transform, width, height`
      // (`node_modules/react-grid-layout/css/styles.css:14`), so a reflow moves
      // a card AND resizes it. An earlier draft of this control compared only x
      // and y — narrower than the guard it defends, which asserts all four at
      // `save-and-backup.spec.ts:266-271`, and blind in a dimension that really
      // does move. Count the axes the guard NAMES against the axes the control
      // MEASURES.
      const worst = (a: typeof truth, b: typeof truth) =>
        Math.max(
          ...a.map((r, i) =>
            Math.max(
              Math.abs(r.x - b[i].x),
              Math.abs(r.y - b[i].y),
              Math.abs(r.w - b[i].w),
              Math.abs(r.h - b[i].h),
            ),
          ),
        );

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

  test('CONTROL: a SMALL travel over a LONG transition cannot slip through the settle', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-geom-creep-'));
    const target = path.join(tmpDir, 'dash.yaml');
    const MOVED = 1;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadFileBacked(ctx, DASHBOARD_YAML, target);
      await ctx.canvas.expectCardCount(2);
      await makeDirty(ctx, 3);

      const before = await ctx.canvas.getCardRectsRelativeToGridSettled();

      // ⭐⭐⭐ THE CONSTRUCTION THAT BROKE THE FIRST VERSION OF THE GUARD, KEPT SO
      // IT CANNOT COME BACK. Control 4 above moves a card far and fast, which no
      // rounding hole can survive. This one is the opposite and is the case that
      // actually bites: CREEP. Ten pixels over four seconds is 0.08 px per 32 ms
      // sample, so an integer-rounded stability check sees three identical
      // readings while the card is still travelling. Measured against the
      // pre-repair helper, it returned after 75 ms with 9.87 px still to go —
      // five times the ±2 px the guarded comparison allows.
      await ctx.window.evaluate(
        ([i, dx]) => {
          const item = document.querySelectorAll<HTMLElement>(
            '.react-grid-layout > .react-grid-item',
          )[i];
          if (!item) throw new Error(`no .react-grid-item at index ${i}`);
          item.style.transition = 'transform 4s linear';
          void item.offsetWidth;
          item.style.transform = `${item.style.transform} translate(${dx}px, 0px)`;
        },
        [MOVED, CREEP_PX] as const,
      );

      const settled = await ctx.canvas.getCardRectsRelativeToGridSettled({ timeoutMs: 20000 });

      // ⭐ LIVENESS: the creep must really be in flight, or this control is a
      // dead instrument dressed as a guard.
      const unsettled = settled; // captured after the guard, compared to truth below
      await ctx.window.waitForTimeout(5000);
      const truth = await ctx.canvas.getCardRectsRelativeToGrid();

      expect(
        truth[MOVED].x - before[MOVED].x,
        'the creep mutation did not move the card — the instrument is dead',
      ).toBeCloseTo(CREEP_PX, 1);

      // ⭐⭐ THE GUARD. The settled read must already be at the destination, not
      // somewhere along the way. Against the pre-repair helper this is 9.87 px.
      expect(
        Math.abs(unsettled[MOVED].x - truth[MOVED].x),
        'the settle returned while the card was still creeping',
      ).toBeLessThanOrEqual(2);
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  /**
   * ⭐⭐⭐ CONTROLS 6 AND 7 DEFEND THE SAME REPAIR FROM OPPOSITE SIDES, AND
   * NEITHER CAN DETECT THE OTHER'S DEFECT.
   *
   * Codex round 3 finding M1 (`docs/reviews/ci-unstable-tests-codex-round3-review.md`)
   * measured that the settle helper's animation gate was keyed to the WRONG
   * POPULATION: it filtered a five-name property allowlist over
   * `getAnimations({subtree: true})`, while the helper only ever returns
   * rectangles for DIRECT `.react-grid-item` children. A gate whose animation
   * population differs from its geometry population fails BOTH ways:
   *
   *   - it IGNORES real motion of a measured box whose property is not on the
   *     list (control 6 — standalone `scale`);
   *   - it BLOCKS on motion that cannot change any measured box, because the
   *     property IS on the list (control 7 — a decorative descendant).
   *
   * ⚠⚠ An assertion of early return cannot detect a false timeout and a timeout
   * assertion cannot detect a false settle, so these are two tests and not one.
   * Both were red against the pre-repair helper in this checkout.
   */

  test('CONTROL: a standalone SCALE on a measured card cannot slip through the settle', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-geom-scale-'));
    const target = path.join(tmpDir, 'dash.yaml');
    try {
      await ctx.appDSL.waitUntilReady();
      await loadFileBacked(ctx, DASHBOARD_YAML, target);
      await ctx.canvas.expectCardCount(2);
      await makeDirty(ctx, 3);

      const before = await ctx.canvas.getCardRectsRelativeToGridSettled();

      // ⭐ `scale` IS A STANDALONE ANIMATABLE PROPERTY, DISTINCT FROM `transform`,
      // and it changes the rendered WIDTH and HEIGHT of the box — which is
      // exactly what `Expected 3` compares.
      //
      // ⚠⚠⚠ THE DURATION IS THE WHOLE CONTROL, AND TWO DRAFTS GOT IT WRONG IN
      // THE SAME WAY — THE MAGNITUDE, NOT THE MECHANISM.
      //   `scale 3s`    ~0.3 px per 32 ms sample, THIRTY times the hundredth-
      //                 pixel bucket. The OLD gate's geometry check caught it
      //                 unaided, so the control passed against the broken helper.
      //   `scale 200s`  ~0.0046 px per sample = 0.46 hundredths. Still crosses
      //                 buckets often enough that three consecutive equal reads
      //                 are rare, so the old helper threw and the control passed
      //                 against the broken helper AGAIN. ⚠ The reviewer's own
      //                 harness DID break at 200 s because its synthetic item was
      //                 100 px wide; this card is ~288 px, so the same scale
      //                 factor drifts three times faster. A construction is not
      //                 portable between fixtures just because the mechanism is.
      //   `scale 2000s` ~0.00046 px per sample = 0.046 hundredths. Three
      //                 consecutive reads share a bucket, the old gate sees
      //                 stillness, and `scale` was never on its property
      //                 allowlist — so it returns mid-flight. THIS is the red leg.
      //
      // A transition that slow can never legitimately settle, so **the property
      // asserted here is that the helper THROWS rather than returning a best
      // effort**, which is its stated contract. Returning any rectangle is the
      // defect.
      const live = await ctx.window.evaluate((i) => {
        const item = document.querySelectorAll<HTMLElement>(
          '.react-grid-layout > .react-grid-item',
        )[i];
        if (!item) throw new Error(`no .react-grid-item at index ${i}`);
        item.style.scale = '1';
        void item.offsetWidth;
        item.style.transition = 'scale 2000s linear';
        item.style.scale = '1.1';
        const running = item
          .getAnimations()
          .some((a) => (a as Animation & { transitionProperty?: string }).transitionProperty);
        return { running, transition: getComputedStyle(item).transitionDuration };
      }, SCALED_CARD);
      expect(live.running, 'the scale transition never started — the instrument is dead').toBe(
        true,
      );
      expect(live.transition, 'the scale amplifier did not take effect').toBe('2000s');

      // ⭐⭐ THE GUARD. Against the pre-repair helper this RETURNED after ~165 ms
      // with ~10 px of width still to travel, because `scale` was not one of the
      // five names on the old property allowlist. The repaired gate asks whether
      // any animation TARGETS a measured card instead, so it correctly refuses.
      let returned: Array<{ x: number; y: number; w: number; h: number }> | null = null;
      let threw: string | null = null;
      try {
        returned = await ctx.canvas.getCardRectsRelativeToGridSettled({ timeoutMs: 3000 });
      } catch (e) {
        threw = e instanceof Error ? e.message : String(e);
      }
      expect(
        threw ?? `RETURNED ${JSON.stringify(returned?.[SCALED_CARD])}`,
        'the settle returned a rectangle while the card was still scaling',
      ).toMatch(/never held still/);

      // ⭐ LIVENESS, AFTER THE FACT: force the scale to its endpoint and confirm
      // the mutation really was geometric. A dead mutation would make the throw
      // above happen for some other reason, or not at all.
      const truth = await ctx.window.evaluate((i) => {
        const item = document.querySelectorAll<HTMLElement>(
          '.react-grid-layout > .react-grid-item',
        )[i];
        item.style.transition = 'none';
        item.style.scale = '1.1';
        void item.offsetWidth;
        const grid = document.querySelector('.react-grid-layout')!;
        const g = grid.getBoundingClientRect();
        const r = item.getBoundingClientRect();
        return { x: r.left - g.left, y: r.top - g.top, w: r.width, h: r.height };
      }, SCALED_CARD);
      expect(
        truth.w - before[SCALED_CARD].w,
        'the scale mutation did not widen the card — the instrument is dead',
      ).toBeGreaterThan(SCALE_MIN_GROWTH_PX);
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('CONTROL: a decorative DESCENDANT animation must not block a settled card', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-geom-descendant-'));
    const target = path.join(tmpDir, 'dash.yaml');
    try {
      await ctx.appDSL.waitUntilReady();
      await loadFileBacked(ctx, DASHBOARD_YAML, target);
      await ctx.canvas.expectCardCount(2);
      await makeDirty(ctx, 3);

      const before = await ctx.canvas.getCardRectsRelativeToGridSettled();

      // A long transition on a child that CANNOT change its parent's box: the
      // grid item is absolutely positioned and sized by react-grid-layout, so a
      // translated descendant moves nothing this helper measures.
      const live = await ctx.window.evaluate((i) => {
        const item = document.querySelectorAll<HTMLElement>(
          '.react-grid-layout > .react-grid-item',
        )[i];
        if (!item) throw new Error(`no .react-grid-item at index ${i}`);
        const dot = document.createElement('div');
        dot.setAttribute('data-testid', 'havdm-decorative-probe');
        dot.style.cssText =
          'position:absolute;left:2px;top:2px;width:6px;height:6px;background:#900;pointer-events:none;';
        item.appendChild(dot);
        void dot.offsetWidth;
        dot.style.transition = 'transform 200s linear';
        dot.style.transform = 'translate(500px, 0px)';
        return dot
          .getAnimations()
          .map((a) => (a as Animation & { transitionProperty?: string }).transitionProperty);
      }, DECORATED_CARD);

      // ⭐ LIVENESS, AND IT IS THE WHOLE CONTROL. If the descendant transition
      // never started, the settle would return quickly for the ordinary reason
      // and this test would pass while proving nothing at all.
      expect(live, 'the descendant transition never started — the instrument is dead').toContain(
        'transform',
      );

      // ⭐⭐ THE GUARD. Against the pre-repair helper this THREW after the full
      // 5 s budget, because `transform` was on the property allowlist and the
      // descendant was inside the swept subtree — while every measured axis was
      // bit-identical throughout.
      const settled = await ctx.canvas.getCardRectsRelativeToGridSettled();

      expect(settled).toHaveLength(before.length);
      settled.forEach((rect, i) => {
        expect(
          Math.abs(rect.x - before[i].x),
          'a decorative descendant must not change a measured rectangle',
        ).toBeLessThanOrEqual(EPSILON);
        expect(Math.abs(rect.y - before[i].y)).toBeLessThanOrEqual(EPSILON);
        expect(Math.abs(rect.w - before[i].w)).toBeLessThanOrEqual(EPSILON);
        expect(Math.abs(rect.h - before[i].h)).toBeLessThanOrEqual(EPSILON);
      });

      // The descendant must STILL be animating at this point, or the settle
      // could have simply outlasted it.
      const stillRunning = await ctx.window.evaluate(() =>
        document
          .querySelectorAll('[data-testid="havdm-decorative-probe"]')[0]
          .getAnimations()
          .some((a) => a.playState === 'running'),
      );
      expect(
        stillRunning,
        'the descendant animation finished before the settle returned — the control proved nothing',
      ).toBe(true);
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('CONTROL: a decorative ::before animation on a card must not block the settle', async () => {
    const ctx = await launchWithDSL();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-geom-pseudo-'));
    const target = path.join(tmpDir, 'dash.yaml');
    try {
      await ctx.appDSL.waitUntilReady();
      await loadFileBacked(ctx, DASHBOARD_YAML, target);
      await ctx.canvas.expectCardCount(2);
      await makeDirty(ctx, 3);

      const before = await ctx.canvas.getCardRectsRelativeToGridSettled();

      // ⚠⚠⚠ THIS CONTROL DEFENDS A DEFECT THE ROUND-3 REPAIR ITSELF INTRODUCED,
      // found by the author's own round-4 self-check before the commission was
      // sent. Aligning the gate to "animations TARGETING a measured card" was
      // right, but `KeyframeEffect.target` reports the ORIGINATING ELEMENT for a
      // pseudo-element — so `.react-grid-item::before` presents as the grid item
      // and was admitted. A pseudo-element renders INSIDE the box, exactly like
      // the descendants the same repair excludes, and react-grid-layout sets each
      // item's width/height/transform inline, so it cannot move the measured
      // rectangle. Measured against the pre-fix gate: a decorative `::before`
      // opacity keyframe held the helper open for its entire budget while the
      // card's box never moved — the round-3 false-timeout class, one layer down.
      const live = await ctx.window.evaluate(() => {
        const style = document.createElement('style');
        style.textContent =
          '@keyframes havdm-probe-pulse { from { opacity: 1; } to { opacity: 0.2; } }\n' +
          '.react-grid-layout > .react-grid-item::before { content: ""; position: absolute; ' +
          'left: 1px; top: 1px; width: 4px; height: 4px; background: #00f; ' +
          'animation: havdm-probe-pulse 200s linear; }';
        document.head.appendChild(style);
        const grid = document.querySelector('.react-grid-layout')!;
        void (grid as HTMLElement).offsetWidth;
        return grid.getAnimations({ subtree: true }).map((a) => {
          const e = a.effect as KeyframeEffect | null;
          return { pseudo: (e && e.pseudoElement) || null, state: a.playState };
        });
      });

      // ⭐ LIVENESS, AND IT IS THE WHOLE CONTROL. If the ::before animation never
      // started, the settle would return promptly for the ordinary reason and
      // this test would pass while proving nothing.
      expect(
        live.some((a) => a.pseudo === '::before' && a.state === 'running'),
        'the ::before animation never started — the instrument is dead',
      ).toBe(true);

      // ⭐⭐ THE GUARD. Against the pre-fix gate this THREW after the full budget
      // with every measured axis bit-identical.
      const settled = await ctx.canvas.getCardRectsRelativeToGridSettled();
      expect(settled).toHaveLength(before.length);
      settled.forEach((rect, i) => {
        expect(
          Math.abs(rect.x - before[i].x),
          'a decorative ::before must not change a measured rectangle',
        ).toBeLessThanOrEqual(EPSILON);
        expect(Math.abs(rect.y - before[i].y)).toBeLessThanOrEqual(EPSILON);
        expect(Math.abs(rect.w - before[i].w)).toBeLessThanOrEqual(EPSILON);
        expect(Math.abs(rect.h - before[i].h)).toBeLessThanOrEqual(EPSILON);
      });

      const stillRunning = await ctx.window.evaluate(() =>
        document
          .querySelector('.react-grid-layout')!
          .getAnimations({ subtree: true })
          .some((a) => {
            const e = a.effect as KeyframeEffect | null;
            return !!(e && e.pseudoElement) && a.playState === 'running';
          }),
      );
      expect(
        stillRunning,
        'the ::before animation finished before the settle returned — the control proved nothing',
      ).toBe(true);
    } finally {
      await close(ctx);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
