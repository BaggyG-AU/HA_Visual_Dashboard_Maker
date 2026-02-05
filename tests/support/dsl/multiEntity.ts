import { expect, type Page, type TestInfo } from '@playwright/test';
import { attachDebugJson } from '../helpers/debug';

export type MultiEntityMode = 'individual' | 'aggregate' | 'batch';

export class MultiEntityDSL {
  constructor(private window: Page) {}

  private controls() {
    return this.window.getByTestId('multi-entity-controls');
  }

  async expectVisible(): Promise<void> {
    await expect(this.controls()).toBeVisible();
  }

  async selectEntities(entityIds: string[]): Promise<void> {
    await this.expectVisible();
    const select = this.window.getByTestId('multi-entity-select');
    await expect(select).toBeVisible();
    await select.click();

    for (const entityId of entityIds) {
      const input = select.locator('input[role="combobox"]:not([disabled])').first();
      await expect(input).toBeVisible();
      await input.fill('');
      await input.type(entityId);

      const dropdown = this.window.locator('.ant-select-dropdown:visible').last();
      const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(entityId, 'i') }).first();
      if (await option.count()) {
        await expect(option).toBeVisible();
        await option.click();
      } else {
        await this.window.keyboard.press('Enter');
      }
    }

    await this.window.keyboard.press('Escape');

    for (const entityId of entityIds) {
      await this.expectEntityListed(entityId);
    }
  }

  async expectEntityListed(entityId: string): Promise<void> {
    const safeEntityId = entityId.replace(/[^a-zA-Z0-9_-]/g, '-');
    await expect(this.window.getByTestId(`multi-entity-item-${safeEntityId}`)).toBeVisible();
  }

  async removeEntity(entityId: string): Promise<void> {
    const safeEntityId = entityId.replace(/[^a-zA-Z0-9_-]/g, '-');
    await this.window.getByTestId(`multi-entity-remove-${safeEntityId}`).click();
    await expect(this.window.getByTestId(`multi-entity-item-${safeEntityId}`)).toHaveCount(0);
  }

  async reorderDown(entityId: string): Promise<void> {
    const safeEntityId = entityId.replace(/[^a-zA-Z0-9_-]/g, '-');
    await this.window.getByTestId(`multi-entity-move-down-${safeEntityId}`).click();
  }

  async expectOrder(expectedEntityIds: string[]): Promise<void> {
    const labels = this.window.locator('[data-testid^="multi-entity-label-"]');
    const count = await labels.count();
    const values: string[] = [];

    for (let index = 0; index < count; index += 1) {
      const text = (await labels.nth(index).textContent())?.trim();
      if (text) {
        values.push(text);
      }
    }

    expect(values).toEqual(expectedEntityIds);
  }

  async setMode(mode: MultiEntityMode): Promise<void> {
    const select = this.window.getByTestId('multi-entity-mode-select');
    await expect(select).toBeVisible();

    // Close any stale overlay/dropdown before interacting with the mode selector.
    await this.window.keyboard.press('Escape');
    await this.window.waitForTimeout(100);

    try {
      await select.click();
    } catch {
      await select.click({ force: true });
    }

    const dropdown = this.window.locator('.ant-select-dropdown:visible').last();
    const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(mode, 'i') }).first();
    await expect(option).toBeVisible();
    await option.click();
    await expect(select).toContainText(new RegExp(mode, 'i'));
  }

  async setAggregateFunction(value: string): Promise<void> {
    const select = this.window.getByTestId('multi-entity-aggregate-function-select');
    await expect(select).toBeVisible();
    await select.click();
    const dropdown = this.window.locator('.ant-select-dropdown:visible').last();
    const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(value.replace('_', ' '), 'i') }).first();
    await expect(option).toBeVisible();
    await option.click();
  }

  async expectAggregateIndicator(text: string | RegExp): Promise<void> {
    const aggregatePanelIndicator = this.window
      .getByTestId('multi-entity-aggregate-panel')
      .getByTestId('multi-entity-aggregate-indicator');
    if (await aggregatePanelIndicator.count()) {
      await expect(aggregatePanelIndicator).toContainText(text);
      return;
    }

    const controlsIndicator = this.window
      .getByTestId('multi-entity-controls')
      .getByTestId('multi-entity-aggregate-indicator')
      .first();
    if (await controlsIndicator.count()) {
      await expect(controlsIndicator).toContainText(text);
      return;
    }

    await expect(this.window.getByTestId('multi-entity-controls')).toContainText(text);
  }

  async expectIndividualItem(entityId: string): Promise<void> {
    const safeEntityId = entityId.replace(/[^a-zA-Z0-9_-]/g, '-');
    const rendererItem = this.window.getByTestId(`multi-entity-individual-item-${safeEntityId}`);
    const controlItem = this.window.getByTestId(`multi-entity-item-${safeEntityId}`);
    if (await rendererItem.count()) {
      await expect(rendererItem).toBeVisible();
      return;
    }
    await expect(controlItem).toBeVisible();
  }

  async runBatchAction(action: 'turn_on' | 'turn_off' | 'toggle', confirm = true): Promise<void> {
    const trigger = this.window.getByTestId(`multi-entity-batch-action-${action}`);
    await expect(trigger).toBeVisible();
    await trigger.click();

    if (action !== 'turn_off') {
      return;
    }

    const popup = this.window.locator('.ant-popconfirm').last();
    await expect(popup).toBeVisible();
    if (confirm) {
      await popup.getByRole('button', { name: /^Run$/ }).click();
    } else {
      await popup.getByRole('button', { name: /^Cancel$/ }).click();
    }
  }

  async attachDiagnostics(testInfo: TestInfo): Promise<void> {
    const diagnostics = await this.window.evaluate(() => {
      const ids = Array.from(document.querySelectorAll<HTMLElement>('[data-testid]'))
        .map((el) => el.getAttribute('data-testid'))
        .filter((value): value is string => Boolean(value))
        .filter((value) => value.startsWith('multi-entity'));

      return {
        testIds: ids,
      };
    });

    await attachDebugJson(testInfo, 'multi-entity-diagnostics.json', diagnostics);
  }
}

export default MultiEntityDSL;
