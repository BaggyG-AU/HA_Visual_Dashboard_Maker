/**
 * YAML Assertion Helpers
 *
 * Assertions for YAML editor functionality.
 * Supports both Dashboard YAML Editor modal and Properties Panel YAML tab.
 */

import { Page, expect } from '@playwright/test';

/**
 * Verify Dashboard YAML Editor modal is visible
 */
export async function expectYamlEditorModalVisible(window: Page, timeout = 3000): Promise<void> {
  const modal = window.getByTestId('yaml-editor-modal');
  await expect(modal).toBeVisible({ timeout });
}

/**
 * Verify Dashboard YAML Editor modal is NOT visible
 */
export async function expectYamlEditorModalHidden(window: Page): Promise<void> {
  const modal = window.getByTestId('yaml-editor-modal');
  await expect(modal).toHaveCount(0);
}

/**
 * Verify YAML editor container is visible
 * Works for both modal and properties panel
 */
export async function expectYamlEditorContainer(window: Page, timeout = 3000): Promise<void> {
  const container = window.getByTestId('yaml-editor-container');
  await expect(container).toBeVisible({ timeout });
}

/**
 * Verify Monaco editor is initialized
 * Detects BOTH .monaco-editor and textarea fallback
 */
export async function expectMonacoEditor(window: Page, timeout = 3000): Promise<void> {
  const editorContainer = window.getByTestId('yaml-editor-container');
  await expect(editorContainer).toBeVisible({ timeout });

  // Monaco can render as .monaco-editor or fall back to textarea
  await expect(
    editorContainer.locator('.monaco-editor')
      .or(editorContainer.locator('textarea'))
      .first()
  ).toBeVisible({ timeout });
}

/**
 * Verify YAML validation success alert is visible
 */
export async function expectYamlValidationSuccess(window: Page): Promise<void> {
  const alert = window.getByTestId('yaml-validation-success');
  await expect(alert).toBeVisible();
}

/**
 * Verify YAML validation error alert is visible
 */
export async function expectYamlValidationError(window: Page): Promise<void> {
  const alert = window.getByTestId('yaml-validation-error');
  await expect(alert).toBeVisible();
}

/**
 * Verify no validation error is shown
 */
export async function expectNoYamlValidationError(window: Page): Promise<void> {
  const alert = window.getByTestId('yaml-validation-error');
  await expect(alert).toHaveCount(0);
}

/**
 * Click Apply button in YAML editor modal
 */
export async function clickYamlApplyButton(window: Page): Promise<void> {
  const applyBtn = window.getByTestId('yaml-apply-button');
  await expect(applyBtn).toBeVisible();
  await expect(applyBtn).toBeEnabled();
  await applyBtn.click();
}

/**
 * Click Cancel button in YAML editor modal
 */
export async function clickYamlCancelButton(window: Page): Promise<void> {
  const cancelBtn = window.getByTestId('yaml-cancel-button');
  await expect(cancelBtn).toBeVisible();
  await cancelBtn.click();
}

/**
 * Verify Apply button is disabled (no changes or validation error)
 */
export async function expectYamlApplyDisabled(window: Page): Promise<void> {
  const applyBtn = window.getByTestId('yaml-apply-button');
  await expect(applyBtn).toBeVisible();
  await expect(applyBtn).toBeDisabled();
}

/**
 * Verify Apply button is enabled (has valid changes)
 */
export async function expectYamlApplyEnabled(window: Page): Promise<void> {
  const applyBtn = window.getByTestId('yaml-apply-button');
  await expect(applyBtn).toBeVisible();
  await expect(applyBtn).toBeEnabled();
}
