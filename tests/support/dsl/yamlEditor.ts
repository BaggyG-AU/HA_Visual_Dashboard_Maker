/**
 * YAML Editor DSL
 *
 * Dashboard YAML editor modal operations.
 * Encapsulates all YAML editor modal interactions.
 */

import { Page, expect } from '@playwright/test';

export class YamlEditorDSL {
  constructor(private window: Page) {}

  /**
   * Open the Dashboard YAML Editor modal
   */
  async open(): Promise<void> {
    const editYamlBtn = this.window.getByRole('button', { name: /Edit YAML/i });
    await expect(editYamlBtn).toBeVisible();
    await editYamlBtn.click();

    // Wait for the modal wrap to become visible (Ant Design renders modals in portals)
    const modalWrap = this.window.locator('.ant-modal-wrap:has([data-testid="yaml-editor-modal"])');
    await expect(modalWrap).toBeVisible({ timeout: 10000 });

    // Wait for the modal content to be visible
    const modalContent = modalWrap.locator('.ant-modal-content');
    await expect(modalContent).toBeVisible({ timeout: 5000 });

    // Wait for Monaco editor to be ready
    await this.waitForMonacoReady();
  }

  /**
   * Wait for Monaco editor to be fully loaded and ready
   */
  private async waitForMonacoReady(): Promise<void> {
    // Wait for Monaco editor container
    const editorContainer = this.window.getByTestId('yaml-editor-container');
    await expect(editorContainer).toBeVisible({ timeout: 5000 });

    // Wait for Monaco to render (either .monaco-editor or fallback textarea)
    const editor = editorContainer.locator('.monaco-editor, textarea').first();
    await expect(editor).toBeVisible({ timeout: 5000 });

    // If Monaco rendered, wait for it to have non-zero dimensions
    const monacoEditor = editorContainer.locator('.monaco-editor');
    const hasMonaco = await monacoEditor.count() > 0;

    if (hasMonaco) {
      // Wait for Monaco to have proper bounding box
      await expect(async () => {
        const box = await monacoEditor.boundingBox();
        expect(box).toBeTruthy();
        expect(box!.width).toBeGreaterThan(0);
        expect(box!.height).toBeGreaterThan(0);
      }).toPass({ timeout: 5000 });

      // Additional wait for Monaco internal initialization
      await this.window.waitForTimeout(500);
    }
  }

  /**
   * Close the YAML editor modal (Cancel button)
   */
  async close(): Promise<void> {
    const cancelBtn = this.window.getByTestId('yaml-cancel-button');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    // Wait for modal to close
    const modal = this.window.getByTestId('yaml-editor-modal');
    await expect(modal).toHaveCount(0, { timeout: 2000 });
  }

  /**
   * Apply changes in YAML editor
   */
  async apply(): Promise<void> {
    const applyBtn = this.window.getByTestId('yaml-apply-button');
    await expect(applyBtn).toBeVisible();
    await expect(applyBtn).toBeEnabled();
    await applyBtn.click();

    // Wait for modal to close after apply
    const modal = this.window.getByTestId('yaml-editor-modal');
    await expect(modal).toHaveCount(0, { timeout: 2000 });
  }

  /**
   * Verify Monaco editor is visible
   */
  async expectMonacoVisible(): Promise<void> {
    const editorContainer = this.window.getByTestId('yaml-editor-container');
    await expect(editorContainer).toBeVisible();

    // Monaco can render as .monaco-editor or fall back to textarea
    await expect(
      editorContainer.locator('.monaco-editor')
        .or(editorContainer.locator('textarea'))
        .first()
    ).toBeVisible({ timeout: 3000 });
  }

  /**
   * Verify Monaco has dark theme
   */
  async expectDarkTheme(): Promise<void> {
    const darkEditor = this.window.locator('.monaco-editor.vs-dark');
    await expect(darkEditor).toBeVisible();
  }

  /**
   * Verify line numbers are visible
   */
  async expectLineNumbers(): Promise<void> {
    const lineNumbers = this.window.locator('.line-numbers');
    await expect(lineNumbers.first()).toBeVisible();
  }

  /**
   * Verify syntax highlighting is present
   */
  async expectSyntaxHighlighting(): Promise<void> {
    // Check for Monaco's token classes
    const tokens = await this.window.locator('.mtk1, .mtk2, .mtk3').count();
    expect(tokens).toBeGreaterThan(0);
  }

  /**
   * Type text into Monaco editor
   */
  async typeInEditor(text: string): Promise<void> {
    // Click editor to focus
    const editor = this.window.locator('.monaco-editor');
    await editor.click();
    await this.window.keyboard.type(text);
  }

  /**
   * Get Monaco editor content via evaluate
   */
  async getEditorContent(): Promise<string> {
    return await this.window.evaluate(() => {
      const model = (window as any).monaco?.editor?.getModels()[0];
      return model ? model.getValue() : '';
    });
  }

  /**
   * Verify Apply button is disabled
   */
  async expectApplyDisabled(): Promise<void> {
    const applyBtn = this.window.getByTestId('yaml-apply-button');
    await expect(applyBtn).toBeDisabled();
  }

  /**
   * Verify Apply button is enabled
   */
  async expectApplyEnabled(): Promise<void> {
    const applyBtn = this.window.getByTestId('yaml-apply-button');
    await expect(applyBtn).toBeEnabled();
  }

  /**
   * Verify validation success alert is visible
   */
  async expectValidationSuccess(): Promise<void> {
    const alert = this.window.getByTestId('yaml-validation-success');
    await expect(alert).toBeVisible();
  }

  /**
   * Verify validation error alert is visible
   */
  async expectValidationError(): Promise<void> {
    const alert = this.window.getByTestId('yaml-validation-error');
    await expect(alert).toBeVisible();
  }

  /**
   * Click Insert Entity button
   */
  async clickInsertEntity(): Promise<void> {
    const insertBtn = this.window.getByTestId('yaml-insert-entity-button');
    await expect(insertBtn).toBeVisible();
    await insertBtn.click();
  }
}
