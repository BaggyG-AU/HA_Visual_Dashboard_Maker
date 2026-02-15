import { expect, Page } from '@playwright/test';
import { CardPaletteDSL } from './cardPalette';

export interface AdvancedSliderFormConfig {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  orientation?: 'horizontal' | 'vertical';
  showMarkers?: boolean;
  showValue?: boolean;
  commitOnRelease?: boolean;
  hapticEnabled?: boolean;
}

export class AdvancedSliderDSL {
  private palette: CardPaletteDSL;

  constructor(private window: Page) {
    this.palette = new CardPaletteDSL(window);
  }

  async addAdvancedSliderCard(): Promise<void> {
    await this.palette.addCard('custom:slider-button-card');
  }

  async verifySliderRendered(): Promise<void> {
    await expect(this.window.getByTestId('advanced-slider-card')).toBeVisible();
    await expect(this.window.getByTestId('advanced-slider-control')).toBeVisible();
  }

  async configure(config: AdvancedSliderFormConfig): Promise<void> {
    if (typeof config.min === 'number') {
      await this.fillInputNumber('advanced-slider-min', config.min);
    }
    if (typeof config.max === 'number') {
      await this.fillInputNumber('advanced-slider-max', config.max);
    }
    if (typeof config.step === 'number') {
      await this.fillInputNumber('advanced-slider-step', config.step);
    }
    if (typeof config.precision === 'number') {
      await this.fillInputNumber('advanced-slider-precision', config.precision);
    }
    if (config.orientation) {
      await this.selectByTestId('advanced-slider-orientation', config.orientation);
    }
    if (typeof config.showMarkers === 'boolean') {
      await this.setSwitch('advanced-slider-show-markers', config.showMarkers);
    }
    if (typeof config.showValue === 'boolean') {
      await this.setSwitch('advanced-slider-show-value', config.showValue);
    }
    if (typeof config.commitOnRelease === 'boolean') {
      await this.setSwitch('advanced-slider-commit-on-release', config.commitOnRelease);
    }
    if (typeof config.hapticEnabled === 'boolean') {
      await this.setSwitch('advanced-slider-haptic-toggle', config.hapticEnabled);
    }
  }

  async pressArrowRight(times = 1): Promise<void> {
    const slider = this.window.getByTestId('advanced-slider-control').locator('[role="slider"]').first();
    await expect(slider).toBeVisible();
    await slider.focus();
    for (let index = 0; index < times; index += 1) {
      await this.window.keyboard.press('ArrowRight');
    }
  }

  async expectAriaValueNow(expected: string): Promise<void> {
    const slider = this.window.getByTestId('advanced-slider-control').locator('[role="slider"]').first();
    await expect(slider).toHaveAttribute('aria-valuenow', expected);
  }

  private async fillInputNumber(testId: string, value: number): Promise<void> {
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
