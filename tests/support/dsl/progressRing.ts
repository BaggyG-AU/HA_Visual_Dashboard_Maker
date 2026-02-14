import { expect, Page } from '@playwright/test';
import { CardPaletteDSL } from './cardPalette';

export interface ProgressRingFormConfig {
  startAngle?: number;
  direction?: 'clockwise' | 'counter-clockwise';
  thickness?: number;
  animate?: boolean;
  labelPrecision?: number;
}

export class ProgressRingDSL {
  private palette: CardPaletteDSL;

  constructor(private window: Page) {
    this.palette = new CardPaletteDSL(window);
  }

  async addProgressRingCard(): Promise<void> {
    await this.palette.addCard('custom:modern-circular-gauge');
  }

  async verifyRendered(): Promise<void> {
    await expect(this.window.getByTestId('progress-ring-card')).toBeVisible();
    await expect(this.window.getByTestId('progress-ring-visual')).toBeVisible();
  }

  async expectRingSummaryCount(count: number): Promise<void> {
    await expect(this.window.getByTestId('progress-ring-ring-summary')).toHaveCount(count);
  }

  async configure(config: ProgressRingFormConfig): Promise<void> {
    if (typeof config.startAngle === 'number') {
      await this.fillInputNumber('progress-ring-start-angle', config.startAngle);
    }

    if (config.direction) {
      await this.selectByTestId('progress-ring-direction', config.direction);
    }

    if (typeof config.thickness === 'number') {
      await this.fillInputNumber('progress-ring-thickness', config.thickness);
    }

    if (typeof config.animate === 'boolean') {
      await this.setSwitch('progress-ring-animate', config.animate);
    }

    if (typeof config.labelPrecision === 'number') {
      await this.fillInputNumber('progress-ring-label-precision', config.labelPrecision);
    }
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
