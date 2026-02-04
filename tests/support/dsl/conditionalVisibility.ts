import { expect, Page, type TestInfo } from '@playwright/test';
import { attachDebugJson } from '../helpers/debug';

const sanitizeEntityId = (entityId: string): string => entityId.replace(/[^a-zA-Z0-9_-]/g, '-');

export class ConditionalVisibilityDSL {
  constructor(private window: Page) {}

  private get controls() {
    return this.window.getByTestId('conditional-visibility-controls');
  }

  async expectControlsVisible(): Promise<void> {
    await expect(this.controls).toBeVisible();
  }

  async addRootCondition(): Promise<void> {
    await this.expectControlsVisible();
    await this.window.getByTestId('visibility-add-root-condition').click();
    await expect(this.window.getByTestId('visibility-condition-0')).toBeVisible();
  }

  async setRule(
    path: string,
    config: {
      type: string;
      entity: string;
      value?: string;
      attribute?: string;
    },
    testInfo?: TestInfo,
  ): Promise<void> {
    const typeField = this.window.getByTestId(`visibility-condition-type-${path}`);
    const entityField = this.window.getByTestId(`visibility-condition-entity-${path}`);

    try {
      await expect(typeField).toBeVisible();
      const normalizedType = config.type.trim().toLowerCase().replace(/\s+/g, '_');
      const currentTypeText = ((await typeField.textContent()) ?? '').trim().toLowerCase();
      const typeAlreadySelected = currentTypeText.includes(normalizedType);

      if (!typeAlreadySelected) {
        await typeField.click();
        const typeOptionPattern = new RegExp(`^${normalizedType}$`, 'i');
        const visibleDropdown = this.window.locator('.ant-select-dropdown:visible').last();
        const typeOption = visibleDropdown.getByRole('option', { name: typeOptionPattern });

        if (await typeOption.isVisible({ timeout: 1000 }).catch(() => false)) {
          await typeOption.click();
        } else {
          // Fallback for flaky portal rendering: use keyboard selection in active combobox
          const activeInput = this.window.locator('.ant-select-dropdown:visible input[role="combobox"]').last();
          if (await activeInput.isVisible({ timeout: 1000 }).catch(() => false)) {
            await activeInput.fill(normalizedType);
            await this.window.keyboard.press('Enter');
          } else {
            await this.window.keyboard.press('Escape');
          }
        }
      }

      await entityField.click();
      const entityDropdown = this.window.locator('.ant-select-dropdown:visible').last();
      const entityOption = entityDropdown.getByRole('option', { name: config.entity, exact: true });
      if (await entityOption.isVisible({ timeout: 1000 }).catch(() => false)) {
        await entityOption.click();
      } else {
        const activeInput = this.window.locator('.ant-select-dropdown:visible input[role="combobox"]').last();
        if (await activeInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await activeInput.fill(config.entity);
          await this.window.keyboard.press('Enter');
        } else {
          await this.window.keyboard.type(config.entity);
          await this.window.keyboard.press('Enter');
        }
      }

      if (config.attribute !== undefined) {
        await this.window.getByTestId(`visibility-condition-attribute-${path}`).fill(config.attribute);
      }

      if (config.value !== undefined) {
        await this.window.getByTestId(`visibility-condition-value-${path}`).fill(config.value);
      }
    } catch (error) {
      if (testInfo) {
        await this.attachDiagnostics(testInfo, path);
      }
      throw error;
    }
  }

  async addGroup(path = '0'): Promise<void> {
    await this.window.getByTestId(`visibility-add-group-${path}`).click();
  }

  async addConditionToGroup(path = '0'): Promise<void> {
    await this.window.getByTestId(`visibility-add-condition-${path}`).click();
  }

  async setGroupOperator(path: string, operator: 'AND' | 'OR'): Promise<void> {
    const groupOperator = this.window.getByTestId(`visibility-group-operator-${path}`);
    await groupOperator.click();
    await this.window.getByRole('option', { name: operator, exact: true }).click();
  }

  async expectPreviewState(state: 'Visible' | 'Hidden'): Promise<void> {
    await expect(this.window.getByTestId('conditional-visibility-preview')).toContainText(`Current state: ${state}`);
  }

  async expectCardVisible(index = 0): Promise<void> {
    const wrapper = this.window.getByTestId('conditional-visibility-wrapper').nth(index);
    await expect(wrapper).toHaveAttribute('data-visible', 'true');
    await expect(wrapper).toBeVisible();
  }

  async expectCardHidden(index = 0): Promise<void> {
    const wrappers = this.window.getByTestId('conditional-visibility-wrapper');
    const count = await wrappers.count();
    if (count === 0) {
      await expect(wrappers).toHaveCount(0);
      return;
    }
    const wrapper = wrappers.nth(Math.min(index, count - 1));
    await expect(wrapper).toHaveAttribute('data-visible', 'false');
  }

  async expectEntitiesRowVisible(entityId: string): Promise<void> {
    const row = this.window.getByTestId(`entities-card-row-${sanitizeEntityId(entityId)}`);
    await expect(row).toBeVisible();
  }

  async expectEntitiesRowHidden(entityId: string): Promise<void> {
    const row = this.window.getByTestId(`entities-card-row-${sanitizeEntityId(entityId)}`);
    await expect(row).toHaveCount(0);
  }

  async attachDiagnostics(testInfo: TestInfo, path = '0'): Promise<void> {
    const data = await this.window.evaluate((suffix) => {
      const controls = document.querySelector('[data-testid="conditional-visibility-controls"]');
      const preview = document.querySelector('[data-testid="conditional-visibility-preview"]');
      const conditionType = document.querySelector(`[data-testid="visibility-condition-type-${suffix}"]`);
      const conditionEntity = document.querySelector(`[data-testid="visibility-condition-entity-${suffix}"]`);
      return {
        controlsVisible: Boolean(controls),
        previewText: preview?.textContent ?? null,
        conditionTypeVisible: Boolean(conditionType),
        conditionEntityVisible: Boolean(conditionEntity),
      };
    }, path);

    await attachDebugJson(testInfo, 'conditional-visibility-diagnostics.json', data);
  }
}

export default ConditionalVisibilityDSL;
