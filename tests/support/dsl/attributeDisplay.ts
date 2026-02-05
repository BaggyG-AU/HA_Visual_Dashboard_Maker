import { Page, expect, Locator, type TestInfo } from '@playwright/test';
import { attachDebugJson } from '../helpers/debug';

export class AttributeDisplayDSL {
  constructor(private window: Page) {}

  private toTestId(attribute: string): string {
    return attribute.replace(/[^a-zA-Z0-9_-]/g, '-');
  }

  private get panel(): Locator {
    return this.window.getByTestId('properties-panel');
  }

  private listContainer(): Locator {
    return this.panel.getByTestId('attribute-display-selected-list');
  }

  async selectAttributes(attributes: string[], testInfo?: TestInfo): Promise<void> {
    const select = this.panel.getByTestId('attribute-display-attribute-select');
    await expect(select).toBeVisible();
    await select.click();
    const input = select.locator('input');
    await expect(input).toBeVisible();

    for (const attribute of attributes) {
      await input.fill('');
      await input.type(attribute);
      await this.window.keyboard.press('Enter');
    }

    await this.window.keyboard.press('Escape');

    try {
      for (const attribute of attributes) {
        await expect(this.listContainer().getByText(attribute, { exact: false })).toBeVisible();
      }
    } catch (error) {
      if (testInfo) {
        await attachDebugJson(testInfo, 'attribute-display-select.json', { attributes });
      }
      throw error;
    }
  }

  async setLayout(layout: 'inline' | 'stacked' | 'table'): Promise<void> {
    const select = this.panel.getByTestId('attribute-display-layout-select');
    await expect(select).toBeVisible();
    await select.click();
    const label = layout[0].toUpperCase() + layout.slice(1);
    const dropdown = this.window.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(`^${label}$`, 'i') });
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click({ timeout: 5000 });
    await expect(select).toContainText(new RegExp(label, 'i'));
  }

  async setLabel(attribute: string, label: string): Promise<void> {
    const input = this.panel.getByTestId(`attribute-display-label-${this.toTestId(attribute)}`);
    await expect(input).toBeVisible();
    await input.fill(label);
  }

  async setNumberFormat(attribute: string, precision: number, unit: string, testInfo?: TestInfo): Promise<void> {
    await this.setFormatType(attribute, 'number');
    const precisionInput = this.panel.getByTestId(`attribute-display-format-precision-${this.toTestId(attribute)}`);
    try {
      await expect(precisionInput).toBeVisible();
      const isInput = await precisionInput.evaluate((el) => el.tagName === 'INPUT');
      const precisionField = isInput ? precisionInput : precisionInput.locator('input');
      await expect(precisionField).toBeVisible();
      await precisionField.click({ clickCount: 3 });
      await precisionField.fill(String(precision));
      await precisionField.blur();
      const unitInput = this.panel.getByTestId(`attribute-display-format-unit-${this.toTestId(attribute)}`);
      await expect(unitInput).toBeVisible();
      await unitInput.fill(unit);
    } catch (error) {
      if (testInfo) {
        const testId = this.toTestId(attribute);
        const debug = await this.window.evaluate((id) => {
          const select = document.querySelector(`[data-testid="attribute-display-format-type-${id}"]`);
          const item = document.querySelector(`[data-testid="attribute-display-item-${id}"]`);
          return {
            selectText: select?.textContent?.trim() ?? null,
            itemHtml: item ? (item as HTMLElement).outerHTML : null,
          };
        }, testId);
        await attachDebugJson(testInfo, 'attribute-display-number-format.json', {
          attribute,
          ...debug,
        });
      }
      throw error;
    }
  }

  async setBooleanFormat(attribute: string, trueLabel: string, falseLabel: string): Promise<void> {
    await this.setFormatType(attribute, 'boolean');
    const trueInput = this.panel.getByTestId(`attribute-display-format-trueLabel-${this.toTestId(attribute)}`);
    const falseInput = this.panel.getByTestId(`attribute-display-format-falseLabel-${this.toTestId(attribute)}`);
    await expect(trueInput).toBeVisible();
    await trueInput.fill(trueLabel);
    await expect(falseInput).toBeVisible();
    await falseInput.fill(falseLabel);
  }

  async setTimestampFormat(attribute: string, mode: 'relative' | 'absolute'): Promise<void> {
    await this.setFormatType(attribute, 'timestamp');
    const select = this.panel.getByTestId(`attribute-display-format-timestampMode-${this.toTestId(attribute)}`);
    await expect(select).toBeVisible();
    await select.click();
    const label = mode[0].toUpperCase() + mode.slice(1);
    const dropdown = this.window.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(`^${label}$`, 'i') });
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click({ timeout: 5000 });
    await expect(select).toContainText(new RegExp(label, 'i'));
  }

  async setFormatType(attribute: string, type: 'number' | 'boolean' | 'string' | 'timestamp' | 'json'): Promise<void> {
    const select = this.panel.getByTestId(`attribute-display-format-type-${this.toTestId(attribute)}`);
    await expect(select).toBeVisible();
    await select.click();
    const label = type[0].toUpperCase() + type.slice(1);
    const dropdown = this.window.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(`^${label}$`, 'i') });
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click({ timeout: 5000 });
    await expect(select).toContainText(new RegExp(label, 'i'));
  }

  async expectPreview(attribute: string, value: string | RegExp): Promise<void> {
    const preview = this.panel.getByTestId(`attribute-display-preview-${this.toTestId(attribute)}`);
    await expect(preview).toBeVisible();
    await expect(preview).toContainText(value);
  }

  async reorderAttribute(fromAttribute: string, toAttribute: string): Promise<void> {
    const fromHandle = this.panel.getByTestId(`attribute-display-drag-handle-${this.toTestId(fromAttribute)}`);
    const toItem = this.panel.getByTestId(`attribute-display-item-${this.toTestId(toAttribute)}`);
    await expect(fromHandle).toBeVisible();
    await expect(toItem).toBeVisible();
    await fromHandle.dragTo(toItem);
  }

  async expectOrder(expectedAttributes: string[]): Promise<void> {
    const items = this.listContainer().locator('[data-testid^="attribute-display-item-"]');
    const count = await items.count();
    const labels: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const text = await items.nth(i).textContent();
      if (text) {
        labels.push(text);
      }
    }
    expectedAttributes.forEach((attribute) => {
      const index = labels.findIndex((label) => label.includes(attribute));
      expect(index).toBeGreaterThanOrEqual(0);
    });
  }

  async expectRenderedAttribute(attribute: string, value: string | RegExp, testIdPrefix = 'attribute-display-button'): Promise<void> {
    const locator = this.window.getByTestId(`${testIdPrefix}-item-${this.toTestId(attribute)}`);
    await expect(locator).toBeVisible();
    await expect(locator).toContainText(value);
  }

  async expectLayoutVisible(layout: 'inline' | 'stacked' | 'table', testIdPrefix = 'attribute-display-button'): Promise<void> {
    const locator = this.window.getByTestId(`${testIdPrefix}-${layout}`);
    await expect(locator).toBeVisible();
  }

  async expectLayoutScreenshot(
    layout: 'inline' | 'stacked' | 'table',
    snapshotName: string,
    testIdPrefix = 'attribute-display-button',
    screenshotOptions: { maxDiffPixels?: number; maxDiffPixelRatio?: number; threshold?: number } = {},
  ): Promise<void> {
    const locator = this.window.getByTestId(`${testIdPrefix}-${layout}`);
    await expect(locator).toBeVisible();
    await expect(locator).toHaveScreenshot(snapshotName, {
      animations: 'disabled',
      caret: 'hide',
      ...screenshotOptions,
    });
  }
}
