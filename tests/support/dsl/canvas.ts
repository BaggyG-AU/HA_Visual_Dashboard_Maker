/**
 * Canvas DSL
 *
 * Canvas operations: selecting cards, deselecting, positioning.
 * CRITICAL: react-grid-layout intercepts pointer events - must use mouse coordinates.
 */

import { Page, expect, type LocatorScreenshotOptions } from '@playwright/test';

type ScreenshotOptions = LocatorScreenshotOptions & {
  animations?: 'disabled' | 'allow';
  caret?: 'hide' | 'initial';
};

export class CanvasDSL {
  constructor(private window: Page) {}

  /**
   * Select a card on the canvas by index
   * CRITICAL: Clicks the actual card content (data-testid="canvas-card")
   * NOT the .react-grid-item layout wrapper
   */
  async selectCard(index = 0): Promise<void> {
    const cards = this.window.getByTestId('canvas-card');
    const card = index === 0 ? cards.first() : cards.nth(index);
    await expect(card).toBeVisible();
    await card.click();

    // Wait for properties panel to appear (confirms selection)
    await expect(this.window.getByTestId('properties-panel')).toBeVisible({ timeout: 2000 });
  }

  /**
   * Toggle card selection using Ctrl/Meta + click.
   */
  async toggleCardSelection(index: number): Promise<void> {
    const cards = this.window.getByTestId('canvas-card');
    const card = cards.nth(index);
    await expect(card).toBeVisible();
    await card.click({ modifiers: ['Control'] });
  }

  /**
   * Extend selection from anchor using Shift + click.
   */
  async rangeSelectCard(index: number): Promise<void> {
    const cards = this.window.getByTestId('canvas-card');
    const card = cards.nth(index);
    await expect(card).toBeVisible();
    await card.click({ modifiers: ['Shift'] });
  }

  /**
   * Deselect current card by clicking empty canvas area
   */
  async deselectCard(): Promise<void> {
    const canvas = this.window.locator('.react-grid-layout');
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    if (!box) {
      throw new Error('Canvas bounding box unavailable');
    }

    // Avoid clicking the top-left area where the first card is typically placed.
    const positions = [
      { x: Math.max(5, Math.floor(box.width - 5)), y: 5 },
      { x: Math.max(5, Math.floor(box.width - 5)), y: Math.max(5, Math.floor(box.height - 5)) },
      { x: 5, y: Math.max(5, Math.floor(box.height - 5)) },
    ];

    for (const pos of positions) {
      await canvas.click({ position: pos });
      const hidden = await this.window
        .getByTestId('properties-panel')
        .count()
        .then((c) => c === 0)
        .catch(() => false);
      if (hidden) return;
    }

    // Wait for properties panel to disappear (final attempt)
    await expect(this.window.getByTestId('properties-panel')).toHaveCount(0, { timeout: 3000 });
  }

  /**
   * Get count of cards on canvas
   */
  async getCardCount(): Promise<number> {
    return await this.window.getByTestId('canvas-card').count();
  }

  /**
   * Verify card is selected (properties panel is visible)
   */
  async expectCardSelected(): Promise<void> {
    await expect(this.window.getByTestId('properties-panel')).toBeVisible();
  }

  /**
   * Verify no card is selected (properties panel not rendered)
   */
  async expectNoSelection(): Promise<void> {
    await expect(this.window.getByTestId('properties-panel')).toHaveCount(0);
  }

  /**
   * Assert WHICH card the app believes is selected, and its type.
   *
   * Reads `selection-debug-state`, whose `data-selected-card-type` is resolved
   * from `config.views[selectedViewIndex].cards[selectedCardIndex].type` — so this
   * proves the selection points at the intended card, not merely that a
   * Properties panel is open somewhere. ("A visible control is not a usable one";
   * an open panel is not a panel targeting the right thing.)
   */
  async expectSelectedCardOfType(index: number, cardType: string): Promise<void> {
    const debugState = this.window.getByTestId('selection-debug-state');
    await expect(debugState).toHaveAttribute('data-selected-card', String(index));
    await expect(debugState).toHaveAttribute('data-selected-card-type', cardType);
  }

  async expectSelectedCards(indices: number[]): Promise<void> {
    const sorted = [...indices].sort((a, b) => a - b).join(',');
    const debugState = this.window.getByTestId('selection-debug-state');
    await expect(debugState).toHaveAttribute('data-selected-cards', sorted);
    await expect(debugState).toHaveAttribute('data-selected-cards-count', String(indices.length));
  }

  /**
   * Verify canvas has specific number of cards
   */
  async expectCardCount(count: number, timeout = 8000): Promise<void> {
    await expect(this.window.getByTestId('canvas-card')).toHaveCount(count, { timeout });
  }

  /**
   * Verify canvas is empty
   */
  async expectEmpty(): Promise<void> {
    await this.expectCardCount(0);
  }

  /**
   * Check if canvas is empty
   */
  async isEmpty(): Promise<boolean> {
    const count = await this.getCardCount();
    return count === 0;
  }

  /**
   * Get the Nth card element (0-indexed)
   */
  getCard(index = 0) {
    const cards = this.window.getByTestId('canvas-card');
    return index === 0 ? cards.first() : cards.nth(index);
  }

  /**
   * The on-screen rectangle of every card, in document order.
   *
   * Read from the `.react-grid-item` WRAPPER rather than the inner
   * `canvas-card`: the wrapper is what react-grid-layout positions, so it is
   * the geometry the layout actually produced. (`canvas-card` sits inside it
   * and is inset by the card's own padding, which would make neighbouring
   * cards look further apart than they are.)
   */
  async getCardRects(): Promise<Array<{ x: number; y: number; w: number; h: number }>> {
    return await this.window.locator('.react-grid-layout > .react-grid-item').evaluateAll((nodes) =>
      nodes.map((n) => {
        const r = n.getBoundingClientRect();
        return { x: r.left, y: r.top, w: r.width, h: r.height };
      }),
    );
  }

  /**
   * The same rectangles, but measured from the GRID CONTAINER'S OWN ORIGIN
   * rather than the viewport's.
   *
   * ⚠⚠⚠ USE THIS WHENEVER YOU COMPARE CARD GEOMETRY ACROSS TWO MOMENTS IN TIME.
   * `getCardRects()` above returns viewport-relative boxes, so ANY movement of
   * the chrome around the canvas — the palette, the properties panel, a
   * scrollbar appearing, a toolbar row changing height — shifts every card
   * equally and reads as a layout change when the layout did not change at all.
   *
   * ⭐ MEASURED, NOT ARGUED. `save-and-backup.spec.ts`'s FILE-05 Expected 3 was
   * unstable on CI for exactly this reason: GitHub Actions run 31871488924 failed
   * all three attempts with x-deltas of 75.24, 44.74 and 44.66 px — half to a
   * full grid column — while the same test measures a delta of EXACTLY ZERO on
   * all four axes locally, across nine runs. The cards had not moved within the
   * grid; the grid had moved within the window. Subtracting the container origin
   * removes that entire class of difference, and it does so without weakening
   * anything: a card that genuinely moves WITHIN the grid still moves here.
   *
   * ⓘ The absolute form is still right for questions that are genuinely about
   * screen position — `expectNoOverlappingCards` compares cards to each other in
   * one instant, so a common origin cancels out anyway.
   */
  async getCardRectsRelativeToGrid(): Promise<
    Array<{ x: number; y: number; w: number; h: number }>
  > {
    return await this.window.evaluate(() => {
      const grid = document.querySelector('.react-grid-layout');
      if (!grid) throw new Error('no .react-grid-layout container found on the page');
      const g = grid.getBoundingClientRect();
      return Array.from(grid.querySelectorAll(':scope > .react-grid-item')).map((n) => {
        const r = n.getBoundingClientRect();
        return { x: r.left - g.left, y: r.top - g.top, w: r.width, h: r.height };
      });
    });
  }

  /**
   * The same relative rectangles, but only once the grid has STOPPED MOVING.
   *
   * ⚠⚠⚠ USE THIS, NOT THE BARE READ ABOVE, WHENEVER THE SAMPLE IS ONE HALF OF A
   * COMPARISON ACROSS TWO MOMENTS. A card count is not a settled layout:
   * `expectCardCount(n)` resolves the instant the nth card EXISTS, and
   * react-grid-layout then reflows the cards around it over
   * `transition: transform 0.2s` (its own stylesheet). A sample taken in that
   * window records a card in FLIGHT.
   *
   * ⭐⭐⭐ MEASURED, NOT ARGUED, AND IT CORRECTS AN EARLIER REFUTATION. The Class D
   * investigation recorded "a settling race" as REFUTED, because sampling twice
   * in a row locally gave a delta of zero. That experiment could not fail: on a
   * fast machine the 0.2 s animation is already over before the first sample
   * arrives. Amplifying the transition to 3 s and sampling exactly where
   * `save-and-backup.spec.ts` samples shows the race outright — the second card's
   * inline transform already reads its FINAL `translate(10px, 650px)` while its
   * measured box is still at `x = 426.49, y = 202.01`, settling to `x = 10,
   * y = 650`. That is a delta of 416 px in x and 448 px in y: a window that
   * comfortably contains every CI failure this leg has produced. The reload half
   * does NOT animate — amplified to 3 s it still gives an exact zero — so the
   * race is entirely on the first sample.
   *
   * ⚠ WHAT THIS DOES AND DOES NOT ATTRIBUTE. Run 31876211967's 2.317108154296875
   * px failure is at head `f52ccf13`, where the comparison was ALREADY relative,
   * so an origin shift cannot explain it and this race is the only mechanism
   * measured that can. The three earlier failures (75.24 / 44.74 / 44.66 px, run
   * 31871488924) were taken with the ABSOLUTE comparison, where an origin shift
   * and this race are indistinguishable in the surviving artifacts; they are not
   * claimed for either.
   *
   * ⓘ It settles on WHATEVER the geometry turns out to be, over three
   * consecutive equal readings; it never polls for a value the caller wants, and
   * it THROWS rather than returning a best effort if the layout never stops
   * moving, so a permanently animating canvas cannot read as a clean pass.
   *
   * ⓘ THE 5 s BUDGET IS SIZED, NOT GUESSED. react-grid-layout's transition is
   * 200 ms (`node_modules/react-grid-layout/css/styles.css:6`), and three
   * samples 32 ms apart add ~96 ms, so a normal settle completes inside ~300 ms
   * and the default leaves roughly a 16x margin. The budget is deliberately a
   * THROW rather than a longer wait: a canvas that cannot hold still for 96 ms
   * within 5 s is a defect worth surfacing, not one worth waiting out.
   *
   * ⚠⚠ ONE ATTACK ON THIS HELPER WAS BUILT AND FAILED TO BREAK IT, WHICH IS
   * WORTH RECORDING BECAUSE THE HYPOTHESIS WAS PLAUSIBLE. A stability-only
   * settle should, in principle, return early if it starts BEFORE the movement
   * does — three equal readings of a box that has not yet begun to travel. The
   * deterministic form of that is a transition DELAY, so the helper was run
   * against `transition: transform 2s linear 1s`: a full second stationary at
   * the stale position, then two seconds of travel. That attack FAILED to break
   * it, and on that basis no animation-state guard was added.
   *
   * ⚠⚠⚠ THE ATTACK WAS BADLY DESIGNED, AND THE INDEPENDENT REVIEWER'S SECOND
   * CONSTRUCTION BROKE IT ON THE FIRST TRY (Codex round 2, finding M1,
   * `docs/reviews/ci-unstable-tests-codex-round2-review.md`). The author's
   * version moved a card 640 px, which is ~10 px per 32 ms sample — far too fast
   * for a rounding hole to show. **The defeating construction is the opposite: a
   * SMALL travel over a LONG transition.** Ten pixels under
   * `transition: transform 4s linear` is 0.08 px per sample, so three
   * consecutive readings shared one integer bucket while the box was genuinely
   * moving. Reproduced on this checkout: the helper returned after **75 ms with
   * 9.87 px still to travel**, and `getAnimations({subtree: true})` reported
   * `{playState: 'running', transitionProperty: 'transform'}` at that exact
   * moment. 9.87 px is five times the ±2 px the comparison allows.
   *
   * ⭐ SO THE GUARD IS NOW BOTH HALVES, AND THEY CLOSE DIFFERENT ROUTES.
   * Comparing to a HUNDREDTH of a pixel rather than a whole one removes the
   * rounding bucket; asking the browser for running layout transitions removes
   * the inference altogether, because stability sampling can only ever guess at
   * motion while the compositor knows. Either alone would have missed something.
   *
   * ⓘ RESIDUAL, STATED RATHER THAN HIDDEN: the animation check covers CSS
   * TRANSITIONS on transform/width/height/left/top. A keyframe animation or a
   * requestAnimationFrame loop that moved a card in sub-hundredth-pixel steps
   * would still be invisible to it. react-grid-layout uses transitions, so that
   * is not reachable here today.
   */
  async getCardRectsRelativeToGridSettled(
    options: { samples?: number; timeoutMs?: number; intervalMs?: number } = {},
  ): Promise<Array<{ x: number; y: number; w: number; h: number }>> {
    const { samples = 3, timeoutMs = 5000, intervalMs = 32 } = options;
    return await this.window.evaluate(
      async ({ samples: need, timeoutMs: budget, intervalMs: gap }) => {
        const read = () => {
          const grid = document.querySelector('.react-grid-layout');
          if (!grid) throw new Error('no .react-grid-layout container found on the page');
          const g = grid.getBoundingClientRect();
          return Array.from(grid.querySelectorAll(':scope > .react-grid-item')).map((n) => {
            const r = n.getBoundingClientRect();
            return { x: r.left - g.left, y: r.top - g.top, w: r.width, h: r.height };
          });
        };
        // ⚠⚠⚠ TWO HUNDREDTHS OF A PIXEL, NOT A WHOLE ONE. Rounding to integers
        // is what made this helper returnable mid-flight: a small travel over a
        // long transition moves less than half a pixel per sample, so three
        // consecutive readings share an integer bucket while the box is still
        // going. The RAW reading is still what gets returned.
        const key = (rects: ReturnType<typeof read>) =>
          JSON.stringify(
            rects.map((r) => [
              Math.round(r.x * 100),
              Math.round(r.y * 100),
              Math.round(r.w * 100),
              Math.round(r.h * 100),
            ]),
          );

        // ⚠⚠⚠ AND ASK THE BROWSER DIRECTLY, BECAUSE SAMPLING ALONE CANNOT KNOW.
        // Stability is an inference about motion; a running transition is a FACT
        // the compositor will state if asked. Restricted to transitions on
        // LAYOUT properties on purpose: a decorative animation elsewhere in the
        // canvas (a pulse, a spinner) must not hold this open forever.
        const LAYOUT_PROPS = new Set(['transform', 'width', 'height', 'left', 'top']);
        const stillMoving = () => {
          const grid = document.querySelector('.react-grid-layout');
          if (!grid) return false;
          return grid.getAnimations({ subtree: true }).some((a) => {
            // ⚠ `pending` is a SEPARATE BOOLEAN on Animation, not a playState
            // value — a transition that has been created but has not started
            // ticking reports `playState: 'idle'` with `pending: true`, so
            // testing playState alone would miss the moment just before travel
            // begins. (The typechecker caught this: AnimationPlayState has no
            // 'pending' member.)
            const anim = a as Animation & { pending?: boolean; transitionProperty?: string };
            if (anim.playState !== 'running' && anim.pending !== true) return false;
            const prop = anim.transitionProperty;
            return typeof prop === 'string' && LAYOUT_PROPS.has(prop);
          });
        };

        const started = performance.now();
        let last = read();
        let lastKey = key(last);
        let streak = 1;

        while (performance.now() - started < budget) {
          await new Promise((resolve) => setTimeout(resolve, gap));
          const next = read();
          const nextKey = key(next);
          if (nextKey === lastKey && !stillMoving()) {
            streak += 1;
            if (streak >= need) return next;
          } else {
            streak = 1;
          }
          last = next;
          lastKey = nextKey;
        }
        throw new Error(
          `card geometry never held still for ${need} consecutive samples within ` +
            `${budget}ms — last reading ${lastKey}`,
        );
      },
      { samples, timeoutMs, intervalMs },
    );
  }

  /**
   * Assert no two cards overlap — UAT card FILE-03's Expected 3.
   *
   * GRID_CONFIG.margin is [10, 10], so adjacent cards are always separated by a
   * real gutter and a genuine intersection cannot be a rounding artefact. A
   * 1px tolerance is still allowed so sub-pixel layout rounding on a fractional
   * device pixel ratio cannot produce a false positive.
   *
   * ⚠ This asserts an ABSENCE, so it is only meaningful once the card count has
   * been asserted too — zero cards trivially never overlap. Callers must pair it
   * with expectCardCount().
   */
  async expectNoOverlappingCards(tolerance = 1): Promise<void> {
    const rects = await this.getCardRects();
    expect(rects.length, 'no grid items found — assert the card count first').toBeGreaterThan(0);

    const overlaps: string[] = [];
    for (let a = 0; a < rects.length; a++) {
      for (let b = a + 1; b < rects.length; b++) {
        const A = rects[a];
        const B = rects[b];
        const dx = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x);
        const dy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y);
        if (dx > tolerance && dy > tolerance) {
          overlaps.push(
            `card[${a}] (${A.x},${A.y} ${A.w}x${A.h}) overlaps card[${b}] ` +
              `(${B.x},${B.y} ${B.w}x${B.h}) by ${dx.toFixed(1)}x${dy.toFixed(1)}px`,
          );
        }
      }
    }

    expect(overlaps, `overlapping cards:\n${overlaps.join('\n')}`).toEqual([]);
  }

  getBackgroundLayer(index = 0) {
    return this.getCard(index).getByTestId('card-background-layer');
  }

  getBackgroundLayerVisual(index = 0) {
    return this.getCard(index).getByTestId('card-background-layer-visual');
  }

  async expectBackgroundLayerVisible(index = 0): Promise<void> {
    const layer = this.getBackgroundLayer(index);
    await expect(layer).toBeVisible();
  }

  async expectBackgroundLayerCss(
    index: number,
    property: string,
    value: string | RegExp,
  ): Promise<void> {
    const layer = this.getBackgroundLayerVisual(index);
    await expect(layer).toHaveCSS(property, value);
  }

  async expectBackgroundLayerScreenshot(
    index: number,
    name: string,
    options: ScreenshotOptions & {
      maxDiffPixels?: number;
      maxDiffPixelRatio?: number;
      threshold?: number;
    } = { animations: 'disabled', caret: 'hide' },
  ): Promise<void> {
    const layer = this.getBackgroundLayerVisual(index);
    await expect(layer).toBeVisible();
    await this.window.evaluate(() => {
      document.body.classList.add('e2e-disable-animations');
      if (!document.getElementById('e2e-disable-animations-style')) {
        const style = document.createElement('style');
        style.id = 'e2e-disable-animations-style';
        style.textContent = `
          .e2e-disable-animations *,
          .e2e-disable-animations *::before,
          .e2e-disable-animations *::after {
            animation: none !important;
            transition: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    });
    await this.window.evaluate(async () => {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    });

    const box = await layer.boundingBox();
    if (!box) {
      throw new Error('Background layer bounding box unavailable');
    }

    const screenshot = await this.window.screenshot({
      animations: options.animations ?? 'disabled',
      caret: options.caret ?? 'hide',
      clip: {
        x: Math.max(0, Math.floor(box.x)),
        y: Math.max(0, Math.floor(box.y)),
        width: Math.max(1, Math.floor(box.width)),
        // Linux/Electron in CI can intermittently render lower-frame compositor
        // regions as white. Capture the upper region where card background state
        // is validated to keep snapshots deterministic.
        height: Math.max(1, Math.floor(Math.min(Math.max(320, box.height), 420))),
      },
      timeout: 15000,
    });

    expect(screenshot).toMatchSnapshot(name, {
      maxDiffPixels: options.maxDiffPixels,
      maxDiffPixelRatio: options.maxDiffPixelRatio,
      threshold: options.threshold,
    });
  }

  async measureBackgroundLayerFps(
    index = 0,
    frameCount = 60,
  ): Promise<{ fps: number; avgFrameTime: number; samples: number; minFps: number }> {
    const card = this.getCard(index);
    await expect(card).toBeVisible();
    await this.window.bringToFront();
    await this.window
      .waitForFunction(() => document.hasFocus(), null, { timeout: 3000 })
      .catch(() => false);

    return await this.window.evaluate(
      ({ frames, targetIndex }) => {
        const layers = Array.from(
          document.querySelectorAll<HTMLElement>('[data-testid="card-background-layer"]'),
        );
        const layer = layers[targetIndex] || layers[0];
        if (!layer) {
          return { fps: 0, avgFrameTime: Infinity, samples: 0, minFps: 0 };
        }

        const samples: number[] = [];
        let last = performance.now();
        let count = 0;
        const warmupFrames = Math.min(5, Math.max(0, frames - 1));
        let toggle = false;

        return new Promise((resolve) => {
          const step = () => {
            const now = performance.now();
            if (count >= warmupFrames) {
              samples.push(now - last);
            }
            last = now;

            toggle = !toggle;
            layer.style.opacity = toggle ? '0.98' : '1';

            count += 1;
            if (count < frames) {
              requestAnimationFrame(step);
            } else {
              const avg = samples.reduce((a, b) => a + b, 0) / Math.max(samples.length, 1);
              const maxFrameTime = samples.length ? Math.max(...samples) : Infinity;
              resolve({
                fps: 1000 / avg,
                avgFrameTime: avg,
                samples: samples.length,
                minFps: Number.isFinite(maxFrameTime) ? 1000 / maxFrameTime : 0,
              });
            }
          };

          requestAnimationFrame(step);
        });
      },
      { frames: frameCount, targetIndex: index },
    );
  }
}
