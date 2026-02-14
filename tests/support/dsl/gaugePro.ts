import { expect, Page } from '@playwright/test';
import { CardPaletteDSL } from './cardPalette';

export interface GaugeProConfig {
  min?: number;
  max?: number;
  unit?: string;
  needle?: boolean;
  gradient?: boolean;
}

export class GaugeProDSL {
  private palette: CardPaletteDSL;

  constructor(private window: Page) {
    this.palette = new CardPaletteDSL(window);
  }

  async addGaugeCardProCard(): Promise<void> {
    await this.palette.addCard('custom:gauge-card-pro');
  }

  async addBuiltInGaugeCard(): Promise<void> {
    await this.palette.addCard('gauge');
  }

  async configureGaugePro(config: GaugeProConfig): Promise<void> {
    if (typeof config.min === 'number') {
      await this.fillNumber('gauge-pro-min', config.min);
    }
    if (typeof config.max === 'number') {
      await this.fillNumber('gauge-pro-max', config.max);
    }
    if (typeof config.unit === 'string') {
      const input = this.window.getByTestId('gauge-pro-primary-unit');
      await expect(input).toBeVisible();
      await input.fill(config.unit);
      await expect(input).toHaveValue(config.unit);
    }
    if (typeof config.needle === 'boolean') {
      await this.setSwitch('gauge-pro-needle', config.needle);
    }
    if (typeof config.gradient === 'boolean') {
      await this.setSwitch('gauge-pro-gradient', config.gradient);
    }
  }

  async configureBuiltInGauge(config: { min?: number; max?: number; unit?: string; needle?: boolean }): Promise<void> {
    if (typeof config.min === 'number') {
      await this.fillInputByTestId('ha-gauge-min', config.min);
    }
    if (typeof config.max === 'number') {
      await this.fillInputByTestId('ha-gauge-max', config.max);
    }
    if (typeof config.unit === 'string') {
      const unitInput = this.window.getByTestId('ha-gauge-unit');
      await expect(unitInput).toBeVisible();
      await unitInput.fill(config.unit);
    }
    if (typeof config.needle === 'boolean') {
      await this.setSwitch('ha-gauge-needle', config.needle);
    }
  }

  async verifyGaugeCardProRendered(): Promise<void> {
    await expect(this.window.getByTestId('gauge-card-pro-card')).toBeVisible();
    await expect(this.window.getByTestId('gauge-card-pro-value')).toBeVisible();
    const progress = this.window.getByTestId('gauge-card-pro-progress');
    const unavailable = this.window.getByText('Unavailable');
    const hasProgress = await progress.count();
    const hasUnavailable = await unavailable.count();
    expect(hasProgress > 0 || hasUnavailable > 0).toBeTruthy();
  }

  async verifyBuiltInGaugeRendered(): Promise<void> {
    await expect(this.window.getByTestId('ha-gauge-card')).toBeVisible();
  }

  async setSegment(index: number, segment: { from?: number; label?: string }): Promise<void> {
    if (typeof segment.from === 'number') {
      await this.fillNumber(`gauge-pro-segment-${index}-from`, segment.from);
    }
    if (typeof segment.label === 'string') {
      const input = this.window.getByTestId(`gauge-pro-segment-${index}-label`);
      await expect(input).toBeVisible();
      await input.fill(segment.label);
    }
  }

  private async fillNumber(testId: string, value: number): Promise<void> {
    const control = this.window.getByTestId(testId);
    await expect(control).toBeVisible();
    const nestedInput = control.locator('input').first();
    if (await nestedInput.count()) {
      await expect(nestedInput).toBeVisible();
      await nestedInput.fill(String(value));
      await nestedInput.blur();
      return;
    }
    await control.fill(String(value));
    await control.blur();
  }

  private async fillInputByTestId(testId: string, value: number): Promise<void> {
    const input = this.window.getByTestId(testId);
    await expect(input).toBeVisible();
    await input.fill(String(value));
    await input.blur();
  }

  private async setSwitch(testId: string, enabled: boolean): Promise<void> {
    const toggle = this.window.getByTestId(testId);
    await expect(toggle).toBeVisible();
    const checked = (await toggle.getAttribute('aria-checked')) === 'true';
    if (checked !== enabled) {
      await toggle.click();
    }
  }
}
