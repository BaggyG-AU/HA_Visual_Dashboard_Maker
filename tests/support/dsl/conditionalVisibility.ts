import { expect, Page, Locator, type TestInfo } from '@playwright/test';

const sanitizeEntityId = (entityId: string): string => entityId.replace(/[^a-zA-Z0-9_-]/g, '-');

export class ConditionalVisibilityDSL {
  constructor(private window: Page) {}

  /**
   * Select an option from an Ant Design Select dropdown.
   *
   * 1. Click the select to open the dropdown.
   * 2. Wait briefly for the dropdown option to render — use waitFor which
   *    properly waits for DOM insertion (unlike isVisible which returns false
   *    immediately when the element doesn't exist yet).
   * 3. If the option appears, click it directly (fast path).
   * 4. Otherwise type into the combobox input which lives inside the Select
   *    field (NOT in the dropdown portal) and press Enter.
   *    Uses pressSequentially instead of keyboard.type to avoid the ~10s
   *    penalty of character-by-character typing triggering Ant Design search
   *    re-renders with IPC latency between each keystroke.
   */
  private async selectAntOption(selectField: Locator, value: string): Promise<void> {
    await selectField.click();
    const dropdown = this.window.locator('.ant-select-dropdown:visible').last();
    const option = dropdown.getByRole('option', { name: value, exact: true });

    const found = await option
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false);

    if (found) {
      await option.click();
      return;
    }

    // The combobox input lives inside the Select field, not the dropdown portal.
    const combobox = selectField.locator('input[role="combobox"]');
    if (await combobox.isVisible().catch(() => false)) {
      await combobox.pressSequentially(value, { delay: 0 });
    } else {
      // Last resort: type into whatever is focused
      await this.window.keyboard.type(value);
    }
    await this.window.keyboard.press('Enter');
  }

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
    _testInfo?: TestInfo,
  ): Promise<void> {
    const typeField = this.window.getByTestId(`visibility-condition-type-${path}`);
    const entityField = this.window.getByTestId(`visibility-condition-entity-${path}`);
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

    await this.selectAntOption(entityField, config.entity);

    if (config.attribute !== undefined) {
      await this.window.getByTestId(`visibility-condition-attribute-${path}`).fill(config.attribute);
    }

    if (config.value !== undefined) {
      await this.window.getByTestId(`visibility-condition-value-${path}`).fill(config.value);
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

  async attachDiagnostics(_testInfo: TestInfo, _path = '0'): Promise<void> {
    void _testInfo;
    void _path;
  }
}

export default ConditionalVisibilityDSL;
