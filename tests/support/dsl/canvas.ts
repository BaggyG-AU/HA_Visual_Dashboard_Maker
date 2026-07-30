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
