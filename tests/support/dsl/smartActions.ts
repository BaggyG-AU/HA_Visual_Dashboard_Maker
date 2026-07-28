import { Page, Locator, expect, type TestInfo } from '@playwright/test';
import { attachDebugJson } from '../helpers/debug';

/** The three manual pickers added by the PROPS-04 fix. */
export type ActionTriggerName = 'tap' | 'hold' | 'double-tap';

/** The one sub-field each action type reveals. */
export type ActionSubField = 'service' | 'navigation-path' | 'url-path' | 'popup-title';

export class SmartActionsDSL {
  constructor(private window: Page) {}

  private getToggle(testIdPrefix: string) {
    return this.window.getByTestId(`${testIdPrefix}-smart-defaults-toggle`);
  }

  private getPreview(testIdPrefix: string) {
    return this.window.getByTestId(`${testIdPrefix}-smart-defaults-preview`);
  }

  private actionBase(testIdPrefix: string, trigger: ActionTriggerName) {
    return `${testIdPrefix}-${trigger}-action`;
  }

  getManualActions(testIdPrefix: string): Locator {
    return this.window.getByTestId(`${testIdPrefix}-manual-actions`);
  }

  getActionSelect(testIdPrefix: string, trigger: ActionTriggerName): Locator {
    return this.window.getByTestId(`${this.actionBase(testIdPrefix, trigger)}-select`);
  }

  getActionSubField(
    testIdPrefix: string,
    trigger: ActionTriggerName,
    field: ActionSubField,
  ): Locator {
    return this.window.getByTestId(`${this.actionBase(testIdPrefix, trigger)}-${field}`);
  }

  getOverrideNotice(testIdPrefix: string): Locator {
    return this.window.getByTestId(`${testIdPrefix}-smart-defaults-override-notice`);
  }

  /**
   * ⚠⚠ antd v6 SELECT INTERNALS, VERIFIED BY DUMPING THE RENDERED MARKUP —
   * NOT BY READING v5 DOCS OR COPYING AN OLDER DSL.
   *
   *   field to click   `.ant-select-content`        (v5 called it `.ant-select-selector`)
   *   chosen label     `.ant-select-content-value`  (v5 called it `.ant-select-selection-item`)
   *   visible option   `.ant-select-item-option[title="<label>"]`
   *
   * ⭐⭐⭐ AND THE TRAP THAT COST TWO e2e ROUNDS: `getByRole('option', { name })`
   * DOES MATCH — but it matches the **hidden accessibility listbox** antd
   * renders at `height: 0; width: 0; overflow: hidden`, whose text content is
   * the option VALUE (`__unset__`, `none`) with the label only in `aria-label`.
   * Clicking that node is a click on a 0×0 element: no error, no selection, and
   * every downstream assertion then measures the wrong thing. **Match the
   * VISIBLE option by `title`.**
   */
  private async selectAntOption(selectField: Locator, label: string): Promise<void> {
    await selectField.locator('.ant-select-content').click();

    const dropdown = this.window.locator('.ant-select-dropdown:visible').last();
    const option = dropdown.locator(`.ant-select-item-option[title="${label}"]`);

    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
  }

  /**
   * ⚠ Waits for the picker to be VISIBLE before touching it. `isVisible()`
   * returns false immediately for an element that has not mounted, so an
   * un-awaited check here would silently pass through a missing control — the
   * exact shape PROPS-04 was.
   */
  async setAction(
    testIdPrefix: string,
    trigger: ActionTriggerName,
    label: string,
    testInfo?: TestInfo,
  ): Promise<void> {
    const select = this.getActionSelect(testIdPrefix, trigger);
    try {
      await select.waitFor({ state: 'visible', timeout: 5000 });
      await this.selectAntOption(select, label);
      // ⭐⭐ PROVE THE SELECTION LANDED. Without this the caller cannot tell
      // "the picker refused the choice" from "the choice never reached the
      // card" — and a `setAction` that silently no-ops turns every downstream
      // assertion into a test of the wrong thing. This assertion is exactly
      // what caught the hidden-a11y-listbox trap described above.
      await expect(select.locator('.ant-select-content-value')).toHaveText(label, {
        timeout: 5000,
      });
    } catch (error) {
      if (testInfo) await this.attachDiagnostics(testInfo, testIdPrefix);
      throw error;
    }
  }

  async fillActionSubField(
    testIdPrefix: string,
    trigger: ActionTriggerName,
    field: ActionSubField,
    text: string,
    testInfo?: TestInfo,
  ): Promise<void> {
    const input = this.getActionSubField(testIdPrefix, trigger, field);
    try {
      await input.waitFor({ state: 'visible', timeout: 5000 });
      await input.fill(text);
      // Commit the value the way an author would — blur, so antd's onChange has
      // landed before the caller reads the YAML.
      await input.blur();
    } catch (error) {
      if (testInfo) await this.attachDiagnostics(testInfo, testIdPrefix);
      throw error;
    }
  }

  async expectManualActionsVisible(testIdPrefix: string, testInfo?: TestInfo): Promise<void> {
    try {
      await this.getManualActions(testIdPrefix).waitFor({ state: 'visible', timeout: 5000 });
    } catch (error) {
      if (testInfo) await this.attachDiagnostics(testInfo, testIdPrefix);
      throw error;
    }
  }

  /**
   * ⚠⚠ An absence assertion. Callers MUST have proved the block is observable
   * first (see `expectManualActionsVisible`) — `toHaveCount(0)` passes instantly
   * against an element that never mounted.
   */
  async expectManualActionsHidden(testIdPrefix: string, testInfo?: TestInfo): Promise<void> {
    try {
      await expect(this.getManualActions(testIdPrefix)).toHaveCount(0, { timeout: 5000 });
    } catch (error) {
      if (testInfo) await this.attachDiagnostics(testInfo, testIdPrefix);
      throw error;
    }
  }

  async expectSubFieldVisible(
    testIdPrefix: string,
    trigger: ActionTriggerName,
    field: ActionSubField,
    testInfo?: TestInfo,
  ): Promise<void> {
    try {
      await this.getActionSubField(testIdPrefix, trigger, field).waitFor({
        state: 'visible',
        timeout: 5000,
      });
    } catch (error) {
      if (testInfo) await this.attachDiagnostics(testInfo, testIdPrefix);
      throw error;
    }
  }

  async expectSubFieldAbsent(
    testIdPrefix: string,
    trigger: ActionTriggerName,
    field: ActionSubField,
    testInfo?: TestInfo,
  ): Promise<void> {
    try {
      await expect(this.getActionSubField(testIdPrefix, trigger, field)).toHaveCount(0, {
        timeout: 5000,
      });
    } catch (error) {
      if (testInfo) await this.attachDiagnostics(testInfo, testIdPrefix);
      throw error;
    }
  }

  async setEnabled(testIdPrefix: string, enabled: boolean, testInfo?: TestInfo): Promise<void> {
    const toggle = this.getToggle(testIdPrefix);
    await expect(toggle).toBeVisible();

    try {
      const checked = await toggle.getAttribute('aria-checked');
      const isChecked = checked === 'true';
      if (isChecked !== enabled) {
        await toggle.click();
      }
    } catch (error) {
      if (testInfo) {
        await this.attachDiagnostics(testInfo, testIdPrefix);
      }
      throw error;
    }
  }

  async expectPreviewContains(
    testIdPrefix: string,
    text: string | RegExp,
    testInfo?: TestInfo,
  ): Promise<void> {
    const preview = this.getPreview(testIdPrefix);
    try {
      await expect(preview).toBeVisible({ timeout: 5000 });
      await expect(preview).toContainText(text);
    } catch (error) {
      if (testInfo) {
        await this.attachDiagnostics(testInfo, testIdPrefix);
      }
      throw error;
    }
  }

  async attachDiagnostics(testInfo: TestInfo, testIdPrefix: string): Promise<void> {
    const diagnostics = await this.window.evaluate((prefix) => {
      const toggle = document.querySelector(
        `[data-testid="${prefix}-smart-defaults-toggle"]`,
      ) as HTMLElement | null;
      const preview = document.querySelector(
        `[data-testid="${prefix}-smart-defaults-preview"]`,
      ) as HTMLElement | null;
      const manual = document.querySelector(
        `[data-testid="${prefix}-manual-actions"]`,
      ) as HTMLElement | null;
      const actionSelectTestIds = Array.from(
        document.querySelectorAll('[data-testid$="-action-select"]'),
      ).map((node) => node.getAttribute('data-testid'));

      return {
        toggleExists: Boolean(toggle),
        toggleAriaChecked: toggle?.getAttribute('aria-checked') ?? null,
        previewExists: Boolean(preview),
        previewText: preview?.textContent ?? null,
        // PROPS-04: distinguishes "the pickers are not rendered" from "my
        // locator is wrong" without needing a screenshot.
        manualActionsExists: Boolean(manual),
        manualActionsText: manual?.textContent ?? null,
        actionSelectTestIds,
      };
    }, testIdPrefix);

    await attachDebugJson(testInfo, 'smart-actions-diagnostics.json', diagnostics);
  }
}

export default SmartActionsDSL;
