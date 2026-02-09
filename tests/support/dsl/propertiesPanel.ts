/**
 * Properties Panel DSL
 *
 * Properties panel interactions: switching tabs, editing fields, YAML editor.
 * Panel is CONDITIONALLY RENDERED (not hidden) - only exists when card is selected.
 */

import { Page, expect, Locator } from '@playwright/test';

export class PropertiesPanelDSL {
  constructor(private window: Page) {}

  private get panel(): Locator {
    return this.window.getByTestId('properties-panel');
  }

  /**
   * Expose panel locator for advanced assertions
   */
  getPanel(): Locator {
    return this.panel;
  }

  /**
   * Verify panel is visible
   */
  async expectVisible(timeout = 2000): Promise<void> {
    await expect(this.panel).toBeVisible({ timeout });
  }

  /**
   * Verify panel is NOT rendered (no card selected)
   */
  async expectHidden(): Promise<void> {
    await expect(this.panel).toHaveCount(0);
  }

  /**
   * Check if panel is visible
   */
  async isVisible(): Promise<boolean> {
    const count = await this.panel.count();
    return count > 0;
  }

  /**
   * Switch to Form, Advanced Options, or YAML tab
   */
  async switchTab(tab: 'Form' | 'Advanced Options' | 'YAML'): Promise<void> {
    await this.expectVisible();

    // Ensure tab strip is in view (panel can be scrolled far down)
    await this.panel.evaluate((el) => {
      el.scrollTop = 0;
    });

    const tabElement = this.panel.getByRole('tab', { name: new RegExp(`^${tab}$`, 'i') });
    await expect(tabElement).toBeVisible({ timeout: 10000 });
    await this.dismissTransientOverlays();
    try {
      await tabElement.click();
    } catch {
      await this.dismissTransientOverlays();
      await tabElement.click();
    }
    const isTabActive = async () => {
      const ariaSelected = await tabElement.getAttribute('aria-selected');
      if (ariaSelected === 'true') return true;
      const className = (await tabElement.getAttribute('class')) ?? '';
      return className.includes('ant-tabs-tab-active');
    };

    const active = await isTabActive();
    if (!active) {
      await tabElement.click();
    }

    await expect
      .poll(isTabActive, { timeout: 3000 })
      .toBe(true);

    // Prefer any visible tabpane instead of relying on a single active class.
    const visibleTabPane = this.panel.locator('.ant-tabs-tabpane:visible').first();
    await expect(visibleTabPane).toBeVisible({ timeout: 5000 });

    if (tab === 'YAML') {
      await this.expectYamlEditor();
    }
  }

  /**
   * Get current active tab
   */
  async getActiveTab(): Promise<'Form' | 'Advanced Options' | 'YAML' | null> {
    await this.expectVisible();

    const tabs = ['Form', 'Advanced Options', 'YAML'] as const;
    for (const tab of tabs) {
      const tabElement = this.panel.getByRole('tab', { name: new RegExp(`^${tab}$`, 'i') });
      const count = await tabElement.count();
      if (count > 0) {
        const ariaSelected = await tabElement.getAttribute('aria-selected');
        if (ariaSelected === 'true') {
          return tab;
        }
      }
    }
    return null;
  }

  /**
   * Verify current tab is active
   */
  async expectActiveTab(tab: 'Form' | 'Advanced Options' | 'YAML'): Promise<void> {
    await this.expectVisible();

    const tabElement = this.panel.getByRole('tab', { name: new RegExp(tab, 'i') });
    const ariaSelected = await tabElement.getAttribute('aria-selected');
    expect(ariaSelected).toBe('true');
  }

  /**
   * Wait for Monaco editor to be ready in YAML tab
   * Detects BOTH .monaco-editor and textarea fallback
   */
  async expectYamlEditor(timeout = 8000): Promise<void> {
    await this.expectVisible();
    await this.expectActiveTab('YAML');

    // Wait for editor container scoped to properties panel
    const editorContainer = this.panel.locator('[data-testid="yaml-editor-container"]:visible').first();
    await expect(editorContainer).toBeVisible({ timeout });

    // Wait for Monaco to initialize (either .monaco-editor or textarea)
    await expect(
      editorContainer.locator('.monaco-editor')
        .or(editorContainer.locator('textarea'))
        .first()
    ).toBeVisible({ timeout });
  }

  /**
   * Get value from card name input
   */
  async getCardName(): Promise<string> {
    await this.expectVisible();
    const nameInput = this.window.getByTestId('card-name-input');
    await expect(nameInput).toBeVisible();
    return await nameInput.inputValue();
  }

  /**
   * Set card name
   */
  async setCardName(name: string): Promise<void> {
    await this.expectVisible();
    const nameInput = this.window.getByTestId('card-name-input');
    await expect(nameInput).toBeVisible();
    await nameInput.clear();
    await nameInput.fill(name);
    await expect(nameInput).toHaveValue(name);
  }

  /**
   * Set the primary entity for the current card (AntD Select)
   */
  async setEntity(entityId: string): Promise<void> {
    await this.expectVisible();
    // Ensure field is in view (panel can be scrolled)
    await this.panel.evaluate((el) => {
      el.scrollTop = 0;
    });
    const select = this.window.getByTestId('entity-select');
    await expect(select).toBeVisible({ timeout: 10000 });

    // Open dropdown to enable input
    await select.click();

    const input = select.locator('input[role="combobox"]:not([readonly])').first();
    const editableCount = await input.count();
    if (editableCount > 0) {
      await expect(input).toBeVisible({ timeout: 5000 });
      await expect(input).toBeEnabled({ timeout: 5000 });
      await input.fill(entityId);
    } else {
      await this.window.keyboard.type(entityId);
    }

    // Confirm selection
    await this.window.keyboard.press('Enter');

    // Verify value applied
    await expect(select).toContainText(entityId, { timeout: 3000 });
  }

  /**
   * Verify panel shows specific card type
   */
  async expectCardType(cardType: string | RegExp): Promise<void> {
    await this.expectVisible();
    const panelText = await this.panel.textContent();
    if (typeof cardType === 'string') {
      expect(panelText).toMatch(new RegExp(cardType, 'i'));
    } else {
      expect(panelText).toMatch(cardType);
    }
  }

  /**
   * Verify form has fields
   */
  async expectFormFields(): Promise<void> {
    await this.expectVisible();
    const formItems = this.panel.locator('.ant-form-item');
    await expect(formItems.first()).toBeVisible();
    const count = await formItems.count();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Get count of form items
   */
  async getFormFieldCount(): Promise<number> {
    await this.expectVisible();
    return await this.panel.locator('.ant-form-item').count();
  }

  /**
   * Scroll panel content vertically
   */
  async scrollTo(y: number): Promise<void> {
    await this.expectVisible();
    await this.panel.evaluate((el, targetY) => {
      el.scrollTop = targetY;
    }, y);
  }

  /**
   * Dismiss transient Ant Design overlays/popovers that may intercept clicks.
   */
  async dismissTransientOverlays(): Promise<void> {
    await this.window.keyboard.press('Escape').catch(() => undefined);
    await this.window
      .waitForFunction(() => {
        const isVisible = (el: Element) => {
          const node = el as HTMLElement;
          const rect = node.getBoundingClientRect();
          const style = window.getComputedStyle(node);
          return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
        };

        const blockingPopovers = Array.from(document.querySelectorAll('.ant-popover'))
          .filter((el) => !el.classList.contains('ant-popover-hidden'))
          .filter(isVisible);
        const blockingDropdowns = Array.from(document.querySelectorAll('.ant-select-dropdown'))
          .filter(isVisible);
        return blockingPopovers.length === 0 && blockingDropdowns.length === 0;
      }, null, { timeout: 2000 })
      .catch(() => undefined);
  }
}
