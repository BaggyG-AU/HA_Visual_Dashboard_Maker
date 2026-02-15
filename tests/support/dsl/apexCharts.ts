import { expect, Page } from '@playwright/test';
import { CardPaletteDSL } from './cardPalette';

export interface ApexChartsFormConfig {
  graphSpan?: '1h' | '6h' | '12h' | '24h' | '7d';
  updateInterval?: '10s' | '30s' | '1m' | '5m';
  chartType?: 'line' | 'area' | 'bar';
  headerTitle?: string;
  strokeCurve?: 'smooth' | 'straight' | 'stepline';
  chartHeight?: number;
  strokeWidth?: number;
}

export class ApexChartsDSL {
  private palette: CardPaletteDSL;

  constructor(private window: Page) {
    this.palette = new CardPaletteDSL(window);
  }

  async addApexChartsCard(): Promise<void> {
    await this.palette.addCard('custom:apexcharts-card');
  }

  async configureApexChart(config: ApexChartsFormConfig): Promise<void> {
    if (config.graphSpan) {
      await this.selectByTestId('apexcharts-graph-span', config.graphSpan);
    }
    if (config.updateInterval) {
      await this.selectByTestId('apexcharts-update-interval', config.updateInterval);
    }
    if (config.chartType) {
      await this.selectByTestId('apexcharts-chart-type', config.chartType);
    }
    if (config.strokeCurve) {
      await this.selectByTestId('apexcharts-stroke-curve', config.strokeCurve);
    }
    if (typeof config.headerTitle === 'string') {
      const titleInput = this.window.getByTestId('apexcharts-header-title');
      await expect(titleInput).toBeVisible();
      await titleInput.fill(config.headerTitle);
    }
    if (typeof config.chartHeight === 'number') {
      await this.fillNumericInput('apexcharts-chart-height', config.chartHeight);
    }
    if (typeof config.strokeWidth === 'number') {
      await this.fillNumericInput('apexcharts-stroke-width', config.strokeWidth);
    }
  }

  async configureFirstSeries(partial: {
    entity?: string;
    name?: string;
    type?: 'line' | 'area' | 'column' | 'bar';
    color?: string;
  }): Promise<void> {
    if (partial.entity) {
      await this.pickEntity('apexcharts-series-0-entity', partial.entity);
    }
    if (partial.name) {
      const input = this.window.getByTestId('apexcharts-series-0-name');
      await expect(input).toBeVisible();
      await input.fill(partial.name);
    }
    if (partial.type) {
      await this.selectByTestId('apexcharts-series-0-type', partial.type);
    }
    if (partial.color) {
      const input = this.window.getByTestId('apexcharts-series-0-color');
      await expect(input).toBeVisible();
      await input.fill(partial.color);
    }
  }

  async verifyApexRendered(): Promise<void> {
    await expect(this.window.getByTestId('apexcharts-card')).toBeVisible();
    await expect(this.window.getByTestId('apexcharts-chart')).toBeVisible();
    await this.expectNoFallback();
  }

  async expectNoFallback(): Promise<void> {
    await expect(this.window.getByTestId('apexcharts-fallback')).toHaveCount(0);
  }

  async expectWarningVisible(): Promise<void> {
    await expect(this.window.getByTestId('apexcharts-warning')).toBeVisible();
  }

  async expectApexScreenshot(name: string, cardIndex = 0): Promise<void> {
    const cards = this.window.getByTestId('canvas-card');
    const card = cardIndex === 0 ? cards.first() : cards.nth(cardIndex);
    await expect(card).toBeVisible();
    await this.expectNoFallback();
    await expect(card).toHaveScreenshot(name, {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixels: 3000,
    });
  }

  private async pickEntity(testId: string, entityId: string): Promise<void> {
    const field = this.window.getByTestId(testId);
    await expect(field).toBeVisible();
    await field.click();

    const option = this.window.locator('.ant-select-item-option-content', { hasText: entityId }).first();
    const visible = await option
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);

    if (visible) {
      await option.click();
      return;
    }

    const combobox = field.locator('input[role="combobox"]');
    await expect(combobox).toBeVisible();
    await combobox.fill('');
    await combobox.pressSequentially(entityId, { delay: 0 });
    await this.window.keyboard.press('Enter');
  }

  private async fillNumericInput(testId: string, value: number): Promise<void> {
    const field = this.window.getByTestId(testId);
    await expect(field).toBeVisible();
    const nestedInput = field.locator('input').first();
    const input = (await nestedInput.count()) > 0 ? nestedInput : field;
    await expect(input).toBeVisible();
    await input.fill(String(value));
    await input.press('Enter');
  }

  private async selectByTestId(testId: string, label: string): Promise<void> {
    const select = this.window.getByTestId(testId);
    await expect(select).toBeVisible();
    await select.scrollIntoViewIfNeeded();
    await select.click();

    const dropdown = this.window.locator('.ant-select-dropdown:visible').last();
    const opened = await dropdown
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);

    if (!opened) {
      // force: Ant Design Select can be partially occluded by panel scroll regions in Electron tests.
      await select.click({ force: true });
    }

    const option = this.window
      .locator('.ant-select-item-option')
      .filter({ hasText: new RegExp(`^${label}$`, 'i') })
      .first();
    const found = await option
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);

    if (found) {
      await option.click();
    } else {
      // Retry opening and click an option from the visible portal on transient render races.
      await select.click({ force: true });
      await expect(option).toBeVisible({ timeout: 5000 });
      await option.click();
    }

    await expect(this.window.locator('.ant-select-dropdown:visible')).toHaveCount(0, { timeout: 5000 });
  }
}
