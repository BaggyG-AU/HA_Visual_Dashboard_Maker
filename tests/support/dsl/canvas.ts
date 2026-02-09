/**
 * Canvas DSL
 *
 * Canvas operations: selecting cards, deselecting, positioning.
 * CRITICAL: react-grid-layout intercepts pointer events - must use mouse coordinates.
 */

import { Page, expect, type LocatorScreenshotOptions } from '@playwright/test';

type ScreenshotOptions = LocatorScreenshotOptions & { animations?: 'disabled' | 'allow'; caret?: 'hide' | 'initial' };

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
      const hidden = await this.window.getByTestId('properties-panel').count().then((c) => c === 0).catch(() => false);
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

  async expectBackgroundLayerCss(index: number, property: string, value: string | RegExp): Promise<void> {
    const layer = this.getBackgroundLayerVisual(index);
    await expect(layer).toHaveCSS(property, value);
  }

  async expectBackgroundLayerScreenshot(
    index: number,
    name: string,
    options: ScreenshotOptions = { animations: 'disabled', caret: 'hide' },
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
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
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
        height: Math.max(1, Math.floor(box.height)),
      },
      timeout: 15000,
    });

    expect(screenshot).toMatchSnapshot(name, {
      maxDiffPixels: options.maxDiffPixels,
      maxDiffPixelRatio: options.maxDiffPixelRatio,
      threshold: options.threshold,
    });
  }

  async measureBackgroundLayerFps(index = 0, frameCount = 60): Promise<{ fps: number; avgFrameTime: number; samples: number; minFps: number }> {
    const card = this.getCard(index);
    await expect(card).toBeVisible();
    await this.window.bringToFront();
    await this.window.waitForFunction(() => document.hasFocus(), null, { timeout: 3000 }).catch(() => false);

    return await this.window.evaluate(({ frames, targetIndex }) => {
      const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-testid="card-background-layer"]'));
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
    }, { frames: frameCount, targetIndex: index });
  }
}
