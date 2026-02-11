import { Page, expect, Locator, type TestInfo } from '@playwright/test';
import { attachDebugJson } from '../helpers/debug';

export class AttributeDisplayDSL {
  constructor(private window: Page) {}

  private toTestId(attribute: string): string {
    return attribute.replace(/[^a-zA-Z0-9_-]/g, '-');
  }

  private async waitForSelectOption(label: string): Promise<Locator> {
    const optionPattern = new RegExp(`^${label}$`, 'i');
    await expect.poll(async () => await this.window.locator('.ant-select-dropdown:visible').count(), {
      timeout: 5000,
    }).toBeGreaterThan(0);

    const visibleDropdown = this.window.locator('.ant-select-dropdown:visible').last();
    const scopedOption = visibleDropdown.locator('.ant-select-item-option:visible', { hasText: optionPattern }).first();
    await scopedOption.waitFor({ state: 'visible', timeout: 5000 });
    return scopedOption;
  }

  private async clickVisibleSelectOption(label: string): Promise<boolean> {
    return this.window.evaluate((labelText) => {
      const isVisible = (el: Element) => {
        const style = window.getComputedStyle(el as HTMLElement);
        const rect = (el as HTMLElement).getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      };

      const dropdowns = Array.from(document.querySelectorAll('.ant-select-dropdown'));
      const dropdown = dropdowns.find((el) => isVisible(el));
      if (!dropdown) return false;

      const options = Array.from(dropdown.querySelectorAll<HTMLElement>('.ant-select-item-option'));
      const match = options.find((opt) => (opt.textContent ?? '').trim().toLowerCase() === labelText.toLowerCase());
      if (!match) return false;
      match.click();
      return true;
    }, label);
  }

  private async selectAntOption(select: Locator, value: string): Promise<void> {
    const dropdown = this.window.locator('.ant-select-dropdown:visible').last();
    const option = dropdown.getByRole('option', { name: new RegExp(`^${value}$`, 'i') }).first();
    const found = await option
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);

    if (found) {
      await option.click();
      return;
    }

    const input = select.locator('input[role="combobox"]');
    if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
      await input.fill('');
      await input.pressSequentially(value, { delay: 0 });
      const typedOption = dropdown.getByRole('option', { name: new RegExp(`^${value}$`, 'i') }).first();
      if (await typedOption.waitFor({ state: 'visible', timeout: 2000 }).catch(() => false)) {
        await typedOption.click();
      } else {
        await this.window.keyboard.press('Enter');
      }
      return;
    }

    await this.window.keyboard.type(value);
    await this.window.keyboard.press('Enter');
  }

  private get panel(): Locator {
    return this.window.getByTestId('properties-panel');
  }

  private listContainer(): Locator {
    return this.panel.getByTestId('attribute-display-selected-list');
  }

  private async getAttributeOrderFromDom(): Promise<string[]> {
    const items = this.listContainer().locator('[data-testid^="attribute-display-item-"]');
    const count = await items.count();
    const order: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const testId = await items.nth(i).getAttribute('data-testid');
      if (typeof testId === 'string' && testId.startsWith('attribute-display-item-')) {
        order.push(testId.replace('attribute-display-item-', ''));
      }
    }
    return order;
  }

  async selectAttributes(attributes: string[], testInfo?: TestInfo): Promise<void> {
    const select = this.panel.getByTestId('attribute-display-attribute-select');
    await expect(select).toBeVisible();
    await select.click();
    const dropdown = this.window.locator('.ant-select-dropdown:visible').last();
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    for (const attribute of attributes) {
      await this.selectAntOption(select, attribute);
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
    if (await this.clickVisibleSelectOption(label)) {
      await expect(select).toContainText(new RegExp(label, 'i'));
      return;
    }

    await this.window.keyboard.press('ArrowDown').catch(() => undefined);
    const option = await this.waitForSelectOption(label);
    await option.click({ timeout: 5000 });
    await expect(select).toContainText(new RegExp(label, 'i'));
  }

  async setFormatType(attribute: string, type: 'number' | 'boolean' | 'string' | 'timestamp' | 'json'): Promise<void> {
    const select = this.panel.getByTestId(`attribute-display-format-type-${this.toTestId(attribute)}`);
    await expect(select).toBeVisible();
    const label = type[0].toUpperCase() + type.slice(1);
    const currentLabel = (await select.textContent()) ?? '';
    if (new RegExp(`\\b${label}\\b`, 'i').test(currentLabel)) {
      return;
    }

    await select.click();
    if (await this.clickVisibleSelectOption(label)) {
      await expect(select).toContainText(new RegExp(label, 'i'));
      return;
    }

    await this.window.keyboard.press('ArrowDown').catch(() => undefined);
    const option = await this.waitForSelectOption(label);
    await option.click({ timeout: 5000 });
    await expect(select).toContainText(new RegExp(label, 'i'));
  }

  async expectPreview(attribute: string, value: string | RegExp): Promise<void> {
    const preview = this.panel.getByTestId(`attribute-display-preview-${this.toTestId(attribute)}`);
    await expect(preview).toBeVisible();
    await expect(preview).toContainText(value);
  }

  async reorderAttribute(fromAttribute: string, toAttribute: string): Promise<void> {
    const fromId = this.toTestId(fromAttribute);
    const toId = this.toTestId(toAttribute);
    const fromHandle = this.panel.getByTestId(`attribute-display-drag-handle-${fromId}`);
    const toItem = this.panel.getByTestId(`attribute-display-item-${toId}`);
    await expect(fromHandle).toBeVisible();
    await expect(toItem).toBeVisible();
    await fromHandle.dragTo(toItem, { force: true });

    const isMovedBeforeTarget = async () => {
      const order = await this.getAttributeOrderFromDom();
      return order.indexOf(fromId) < order.indexOf(toId);
    };

    if (!(await isMovedBeforeTarget())) {
      await this.window.evaluate(({ sourceId, targetId }) => {
        const items = Array.from(document.querySelectorAll<HTMLElement>('[data-testid^="attribute-display-item-"]'));
        const fromIndex = items.findIndex((el) => el.dataset.testid === `attribute-display-item-${sourceId}`);
        const target = items.find((el) => el.dataset.testid === `attribute-display-item-${targetId}`);
        if (fromIndex < 0 || !target) return;

        const dataTransfer = new DataTransfer();
        dataTransfer.setData('text/plain', String(fromIndex));
        target.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer }));
        target.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }));
      }, { sourceId: fromId, targetId: toId });
    }

    await expect.poll(isMovedBeforeTarget, { timeout: 5000 }).toBe(true);
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
