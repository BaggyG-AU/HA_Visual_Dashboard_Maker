import { expect, Page } from '@playwright/test';
import { CardPaletteDSL } from './cardPalette';

export interface TimelineFormConfig {
  orientation?: 'vertical' | 'horizontal';
  groupBy?: 'none' | 'day' | 'hour';
  showNowMarker?: boolean;
  enableScrubber?: boolean;
  maxItems?: number;
  itemDensity?: 'comfortable' | 'compact';
  truncateLength?: number;
}

export class TimelineDSL {
  private palette: CardPaletteDSL;

  constructor(private window: Page) {
    this.palette = new CardPaletteDSL(window);
  }

  async addTimelineCard(): Promise<void> {
    await this.palette.addCard('logbook');
  }

  async verifyRendered(): Promise<void> {
    await expect(this.window.getByTestId('timeline-card')).toBeVisible();
    await expect(this.window.getByTestId('timeline-events')).toBeVisible();
  }

  async expectEventCountAtLeast(min: number): Promise<void> {
    await expect
      .poll(async () => this.window.getByTestId('timeline-event').count())
      .toBeGreaterThanOrEqual(min);
  }

  async configure(config: TimelineFormConfig): Promise<void> {
    if (config.orientation) {
      await this.selectByTestId('timeline-orientation', config.orientation === 'horizontal' ? 'Horizontal' : 'Vertical');
    }
    if (config.groupBy) {
      const label = config.groupBy === 'none' ? 'None' : config.groupBy === 'hour' ? 'Hour' : 'Day';
      await this.selectByTestId('timeline-group-by', label);
    }
    if (typeof config.showNowMarker === 'boolean') {
      await this.setSwitch('timeline-show-now-marker', config.showNowMarker);
    }
    if (typeof config.enableScrubber === 'boolean') {
      await this.setSwitch('timeline-enable-scrubber', config.enableScrubber);
    }
    if (typeof config.maxItems === 'number') {
      await this.fillInputNumber('timeline-max-items', config.maxItems);
    }
    if (config.itemDensity) {
      await this.selectByTestId('timeline-item-density', config.itemDensity === 'compact' ? 'Compact' : 'Comfortable');
    }
    if (typeof config.truncateLength === 'number') {
      await this.fillInputNumber('timeline-truncate-length', config.truncateLength);
    }
  }

  async moveScrubberTo(index: number): Promise<void> {
    const scrubber = this.window.getByTestId('timeline-scrubber').locator('[role="slider"]').first();
    await expect(scrubber).toBeVisible();
    await scrubber.focus();

    const maxRaw = await scrubber.getAttribute('max');
    const max = maxRaw ? Number(maxRaw) : index;
    const target = Math.max(0, Math.min(max, index));

    await scrubber.evaluate((node, value) => {
      node.setAttribute('aria-valuenow', String(value));
    }, target);
    await this.window.keyboard.press('Home');
    for (let step = 0; step < target; step += 1) {
      await this.window.keyboard.press('ArrowRight');
    }
  }

  async expectTimelineScreenshot(name: string, cardIndex = 0): Promise<void> {
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
