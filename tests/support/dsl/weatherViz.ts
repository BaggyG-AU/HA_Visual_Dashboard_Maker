import { expect, Page } from '@playwright/test';
import { CardPaletteDSL } from './cardPalette';
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export interface WeatherVizFormConfig {
  forecastType?: 'daily' | 'hourly';
  iconAnimation?: 'off' | 'subtle' | 'pulse';
  days?: number;
  unitSystem?: 'auto' | 'metric' | 'imperial';
  locale?: string;
  metrics?: Array<'temperature' | 'precipitation' | 'wind_speed'>;
}

export class WeatherVizDSL {
  private palette: CardPaletteDSL;

  constructor(private window: Page) {
    this.palette = new CardPaletteDSL(window);
  }

  async addWeatherForecastCard(): Promise<void> {
    await this.palette.addCard('weather-forecast');
  }

  async verifyRendered(): Promise<void> {
    const card = this.window.getByTestId('weather-viz-card');
    await expect(card).toBeVisible();
    await expect(card.getByTestId('weather-viz-chart')).toBeVisible();
  }

  async expectForecastPointCountAtLeast(minCount: number): Promise<void> {
    const count = await this.window.getByTestId('weather-viz-card').getByTestId('weather-viz-forecast-point').count();
    expect(count).toBeGreaterThanOrEqual(minCount);
  }

  async configure(config: WeatherVizFormConfig): Promise<void> {
    await this.propertiesPanel().evaluate((el) => {
      el.scrollTop = 0;
    });

    if (config.forecastType) {
      await this.selectByTestId('weather-viz-mode', config.forecastType);
    }

    if (config.iconAnimation) {
      await this.selectByTestId('weather-viz-icon-animation', config.iconAnimation);
    }

    if (typeof config.days === 'number') {
      await this.fillInputNumber('weather-viz-days', config.days);
    }

    if (config.unitSystem) {
      await this.selectByTestId('weather-viz-unit-system', config.unitSystem);
    }

    if (typeof config.locale === 'string') {
      const localeInput = this.propertiesPanel().getByTestId('weather-viz-locale');
      await expect(localeInput).toBeVisible();
      await localeInput.fill(config.locale);
    }

    if (config.metrics) {
      await this.setMetrics(config.metrics);
    }
  }

  private async setMetrics(metrics: Array<'temperature' | 'precipitation' | 'wind_speed'>): Promise<void> {
    const select = this.propertiesPanel().getByTestId('weather-viz-metrics');
    await expect(select).toBeVisible();
    const clear = select.locator('.ant-select-clear').first();
    if (await clear.isVisible().catch(() => false)) {
      await clear.click();
    } else {
      // Fallback if clear icon is not visible: remove existing tags with backspace.
      const input = select.locator('input[role="combobox"]').first();
      if (await input.isVisible().catch(() => false)) {
        await input.click();
        for (let i = 0; i < 5; i += 1) {
          await input.press('Backspace');
        }
      }
    }

    for (const metric of metrics) {
      await this.selectAntOption('weather-viz-metrics', metric);
    }
  }

  private async fillInputNumber(testId: string, value: number): Promise<void> {
    const control = this.propertiesPanel().getByTestId(testId);
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

  private async selectByTestId(testId: string, label: string): Promise<void> {
    const select = this.propertiesPanel().getByTestId(testId);
    await expect(select).toBeVisible();
    await this.selectAntOption(testId, label);
  }

  private async selectAntOption(testId: string, value: string): Promise<void> {
    const selectField = this.propertiesPanel().getByTestId(testId);
    await this.propertiesPanel().evaluate((el) => {
      el.scrollTop = 0;
    });

    await selectField.click().catch(async () => {
      await this.propertiesPanel().evaluate((el) => {
        el.scrollTop = 0;
      });
      await selectField.click();
    });
    const dropdown = this.window.locator('.ant-select-dropdown:visible').last();
    const option = dropdown.getByRole('option', { name: new RegExp(`^${escapeRegex(value)}$`, 'i') });
    const found = await option
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);

    if (found) {
      await option.click();
      await expect(this.window.locator('.ant-select-dropdown:visible')).toHaveCount(0, { timeout: 5000 });
      return;
    }

    const combobox = selectField.locator('input[role="combobox"]');
    if (await combobox.isVisible().catch(() => false)) {
      await combobox.pressSequentially(value, { delay: 0 });
      await this.window.keyboard.press('Enter');
    } else {
      await this.window.keyboard.type(value);
      await this.window.keyboard.press('Enter');
    }

    await expect(this.window.locator('.ant-select-dropdown:visible')).toHaveCount(0, { timeout: 5000 });
  }

  private propertiesPanel() {
    return this.window.getByTestId('properties-panel');
  }
}
