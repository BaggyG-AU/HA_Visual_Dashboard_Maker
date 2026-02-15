import { expect, Page } from '@playwright/test';
import { CardPaletteDSL } from './cardPalette';

export interface CalendarFormConfig {
  view?: 'month' | 'week' | 'day';
  showWeekNumbers?: boolean;
  showAgenda?: boolean;
  onDateSelectAction?: 'none' | 'more-info' | 'toggle' | 'call-service' | 'navigate' | 'url' | 'popup';
}

export class CalendarDSL {
  private palette: CardPaletteDSL;

  constructor(private window: Page) {
    this.palette = new CardPaletteDSL(window);
  }

  async addCalendarCard(): Promise<void> {
    await this.palette.addCard('calendar');
  }

  async verifyRendered(): Promise<void> {
    await expect(this.window.getByTestId('calendar-view-card')).toBeVisible();
    await expect(this.window.getByTestId('calendar-grid')).toBeVisible();
  }

  async configure(config: CalendarFormConfig): Promise<void> {
    if (config.view) {
      await this.selectByTestId('calendar-view', config.view.charAt(0).toUpperCase() + config.view.slice(1));
    }

    if (typeof config.showWeekNumbers === 'boolean') {
      await this.setSwitch('calendar-show-week-numbers', config.showWeekNumbers);
    }

    if (typeof config.showAgenda === 'boolean') {
      await this.setSwitch('calendar-show-agenda', config.showAgenda);
    }

    if (config.onDateSelectAction) {
      const labelByAction: Record<string, string> = {
        none: 'None',
        'more-info': 'More Info',
        toggle: 'Toggle',
        'call-service': 'Call Service',
        navigate: 'Navigate',
        url: 'URL',
        popup: 'Popup',
      };
      await this.selectByTestId('calendar-on-date-select-action', labelByAction[config.onDateSelectAction]);
    }
  }

  async selectDateCell(index: number): Promise<void> {
    const cell = this.window.getByTestId('calendar-date-cell').nth(index);
    await expect(cell).toBeVisible();
    await cell.click();
  }

  async arrowNavigateDates(steps: number): Promise<void> {
    const cell = this.window.getByTestId('calendar-date-cell').first();
    await expect(cell).toBeVisible();
    await cell.focus();
    for (let step = 0; step < steps; step += 1) {
      await this.window.keyboard.press('ArrowRight');
    }
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
    const option = dropdown.getByRole('option', { name: new RegExp(`^${label}$`, 'i') }).first();
    const found = await option
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);

    if (found) {
      await option.click();
      await expect(this.window.locator('.ant-select-dropdown:visible')).toHaveCount(0, { timeout: 5000 });
      return;
    }

    const combobox = select.locator('input[role="combobox"]');
    if (await combobox.isVisible().catch(() => false)) {
      await combobox.pressSequentially(label, { delay: 0 });
      await this.window.keyboard.press('Enter');
      return;
    }

    await this.window.keyboard.type(label);
    await this.window.keyboard.press('Enter');
  }
}
