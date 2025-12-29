/**
 * Properties Panel Assertion Helpers
 *
 * Assertions for properties panel state and content.
 */

import { Page, expect } from '@playwright/test';

/**
 * Verify properties panel is visible
 */
export async function expectPropertiesPanelVisible(window: Page, timeout = 2000): Promise<void> {
  const panel = window.getByTestId('properties-panel');
  await expect(panel).toBeVisible({ timeout });
}

/**
 * Verify properties panel is NOT rendered (no card selected)
 */
export async function expectPropertiesPanelHidden(window: Page): Promise<void> {
  const panel = window.getByTestId('properties-panel');
  await expect(panel).toHaveCount(0);
}

/**
 * Verify properties panel shows specific card type
 */
export async function expectCardType(window: Page, cardType: string | RegExp): Promise<void> {
  const panel = window.getByTestId('properties-panel');
  await expect(panel).toBeVisible();

  const panelText = await panel.textContent();
  if (typeof cardType === 'string') {
    expect(panelText).toMatch(new RegExp(cardType, 'i'));
  } else {
    expect(panelText).toMatch(cardType);
  }
}

/**
 * Verify properties panel has form fields
 */
export async function expectFormFields(window: Page): Promise<void> {
  const panel = window.getByTestId('properties-panel');
  await expect(panel).toBeVisible();

  const formItems = panel.locator('.ant-form-item');
  await expect(formItems.first()).toBeVisible();
  const count = await formItems.count();
  expect(count).toBeGreaterThan(0);
}

/**
 * Verify specific tab is active
 */
export async function expectActiveTab(window: Page, tab: 'Form' | 'YAML'): Promise<void> {
  const panel = window.getByTestId('properties-panel');
  await expect(panel).toBeVisible();

  const tabElement = panel.getByRole('tab', { name: new RegExp(tab, 'i') });
  const ariaSelected = await tabElement.getAttribute('aria-selected');
  expect(ariaSelected).toBe('true');
}

/**
 * Verify card name input has specific value
 */
export async function expectCardName(window: Page, expectedName: string): Promise<void> {
  const nameInput = window.getByTestId('card-name-input');
  await expect(nameInput).toBeVisible();
  const value = await nameInput.inputValue();
  expect(value).toBe(expectedName);
}
