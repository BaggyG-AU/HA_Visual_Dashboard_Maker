import { expect, Page } from '@playwright/test';
import { CardPaletteDSL } from './cardPalette';

export interface SparklineFormConfig {
  rangeHours?: 1 | 6 | 24 | 168;
  style?: 'line' | 'area';
  density?: 'compact' | 'regular';
  lineWidth?: number;
  showMinMax?: boolean;
  showCurrent?: boolean;
}

const RANGE_LABELS: Record<NonNullable<SparklineFormConfig['rangeHours']>, string> = {
  1: '1h',
  6: '6h',
  24: '24h',
  168: '7d',
};

export class SparklineDSL {
  private palette: CardPaletteDSL;

  constructor(private window: Page) {
    this.palette = new CardPaletteDSL(window);
  }

  async addSparklineCard(): Promise<void> {
    await this.palette.addCard('custom:mini-graph-card');
  }

  async verifyRendered(): Promise<void> {
    await expect(this.window.getByTestId('sparkline-card')).toBeVisible();
    await expect(this.window.getByTestId('sparkline-graph')).toBeVisible();
    await expect(this.window.getByTestId('sparkline-fallback-labels')).toBeVisible();
  }

  async configure(config: SparklineFormConfig): Promise<void> {
    if (typeof config.rangeHours === 'number') {
      await this.selectByTestId('sparkline-range', RANGE_LABELS[config.rangeHours]);
    }
    if (config.style) {
      await this.selectByTestId('sparkline-style', config.style);
    }
    if (config.density) {
      await this.selectByTestId('sparkline-density', config.density === 'compact' ? 'Compact' : 'Regular');
    }
    if (typeof config.lineWidth === 'number') {
      await this.fillInputNumber('sparkline-line-width', config.lineWidth);
    }
    if (typeof config.showMinMax === 'boolean') {
      await this.setSwitch('sparkline-show-min-max', config.showMinMax);
    }
    if (typeof config.showCurrent === 'boolean') {
      await this.setSwitch('sparkline-show-current', config.showCurrent);
    }
  }

  async expectSparklineScreenshot(name: string, cardIndex = 0): Promise<void> {
    const cards = this.window.getByTestId('canvas-card');
    const card = cardIndex === 0 ? cards.first() : cards.nth(cardIndex);
    await expect(card).toBeVisible();
    await expect(card).toHaveScreenshot(name, {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixels: 2500,
    });
  }

  private async fillInputNumber(testId: string, value: number): Promise<void> {
    const control = this.window.getByTestId(testId);
    await expect(control).toBeVisible();
    const nestedInput = control.locator('input').first();
    if (await nestedInput.count()) {
      await nestedInput.fill(String(value));
      await nestedInput.blur();
      return;
    }
    await control.fill(String(value));
    await control.blur();
  }

  private async setSwitch(testId: string, enabled: boolean): Promise<void> {
    const toggle = this.window.getByTestId(testId);
    await expect(toggle).toBeVisible();
    const checked = (await toggle.getAttribute('aria-checked')) === 'true';
    if (checked !== enabled) {
      await toggle.click();
    }
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
