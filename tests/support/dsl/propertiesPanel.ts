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
   * Switch to Form or YAML tab
   */
  async switchTab(tab: 'Form' | 'YAML' | 'Advanced Styling'): Promise<void> {
    await this.expectVisible();

    // Ensure tab strip is in view (panel can be scrolled far down)
    await this.panel.evaluate((el) => {
      el.scrollTop = 0;
    });

    const tabElement = this.panel.getByRole('tab', { name: new RegExp(`^${tab}$`, 'i') });
    await expect(tabElement).toBeVisible({ timeout: 10000 });
    await tabElement.click();
    // Wait until tab reports selected to avoid hidden content reads
    await expect(tabElement).toHaveAttribute('aria-selected', 'true', { timeout: 3000 });
    await this.window.waitForTimeout(150); // allow small animation settle
  }

  /**
   * Verify current tab is active
   */
  async expectActiveTab(tab: 'Form' | 'YAML' | 'Advanced Styling'): Promise<void> {
    await this.expectVisible();

    const tabElement = this.panel.getByRole('tab', { name: new RegExp(tab, 'i') });
    const ariaSelected = await tabElement.getAttribute('aria-selected');
    expect(ariaSelected).toBe('true');
  }

  /**
   * Wait for Monaco editor to be ready in YAML tab
   * Detects BOTH .monaco-editor and textarea fallback
   */
  async expectYamlEditor(timeout = 3000): Promise<void> {
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
    await this.window.waitForTimeout(300); // Debounce
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
}
