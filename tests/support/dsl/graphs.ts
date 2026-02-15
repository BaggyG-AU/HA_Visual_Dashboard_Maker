import { expect, Page } from '@playwright/test';
import { CardPaletteDSL } from './cardPalette';

export interface GraphConfig {
  chartType?: 'line' | 'bar' | 'area' | 'pie';
  timeRange?: '1h' | '6h' | '12h' | '24h' | '7d' | '30d';
  refreshInterval?: '10s' | '30s' | '1m' | '5m';
  zoomPan?: boolean;
}

export class GraphsDSL {
  private palette: CardPaletteDSL;

  constructor(private window: Page) {
    this.palette = new CardPaletteDSL(window);
  }

  async addGraphCard(type: string): Promise<void> {
    await this.palette.addCard(type);
  }

  async configureGraph(config: GraphConfig): Promise<void> {
    if (config.chartType) {
      await this.selectByTestId('native-graph-chart-type', config.chartType);
    }
    if (config.timeRange) {
      await this.selectByTestId('native-graph-time-range', config.timeRange);
    }
    if (config.refreshInterval) {
      await this.selectByTestId('native-graph-refresh-interval', config.refreshInterval);
    }
    if (typeof config.zoomPan === 'boolean') {
      const toggle = this.window.getByTestId('native-graph-zoom-pan');
      await expect(toggle).toBeVisible();
      const checked = (await toggle.getAttribute('aria-checked')) === 'true';
      if (checked !== config.zoomPan) {
        await toggle.click();
      }
    }
  }

  async verifyGraphRendered(): Promise<void> {
    await expect(this.window.getByTestId('native-graph-card')).toBeVisible();
    await expect(this.window.getByTestId('native-graph-chart')).toBeVisible();
    await this.expectNoRendererFallback();
  }

  async verifyGraphData(expectedSeriesCount: number): Promise<void> {
    const chart = this.window.getByTestId('native-graph-chart');
    await expect(chart).toBeVisible();
    await this.expectNoRendererFallback();
    await expect
      .poll(
        async () => await this.window.getByTestId('native-graph-legend-item').count(),
        { timeout: 5000 },
      )
      .toBe(expectedSeriesCount);
  }

  async expectGraphScreenshot(name: string, cardIndex = 0): Promise<void> {
    const cards = this.window.getByTestId('canvas-card');
    const cardCount = await cards.count();
    if (cardCount === 0) {
      const diagnostics = await this.window.evaluate(() => {
        const root = document.querySelector('#root');
        const appShell = document.querySelector('[data-testid="app-shell"]');
        const fallback = document.body.textContent?.includes('Graph preview unavailable') ?? false;
        const snippet = (document.body.textContent ?? '').replace(/\s+/g, ' ').slice(0, 240);
        return {
          hasRoot: Boolean(root),
          hasAppShell: Boolean(appShell),
          hasGraphFallbackText: fallback,
          bodySnippet: snippet,
        };
      });
      throw new Error(`canvas-card not found before screenshot ${name}: ${JSON.stringify(diagnostics)}`);
    }
    const card = cardIndex === 0 ? cards.first() : cards.nth(cardIndex);
    await expect(card).toBeVisible();
    await this.expectNoRendererFallback();
    await expect(card).toHaveScreenshot(name, {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixels: 2500,
    });
  }

  async expectNoRendererFallback(): Promise<void> {
    await expect(this.window.getByText('Graph preview unavailable')).toHaveCount(0);
  }

  private async selectByTestId(testId: string, label: string): Promise<void> {
    const select = this.window.getByTestId(testId);
    await expect(select).toBeVisible();
    await select.click();

    const dropdown = this.window.locator('.ant-select-dropdown:visible').last();
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    const option = dropdown.locator('.ant-select-item-option', {
      hasText: new RegExp(`^${label}$`, 'i'),
    }).first();
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();

    await expect(this.window.locator('.ant-select-dropdown:visible')).toHaveCount(0, { timeout: 5000 });
  }
}
