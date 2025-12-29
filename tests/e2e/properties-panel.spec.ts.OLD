/**
 * E2E Test: Properties Panel
 *
 * Tests card property editing for all supported card types.
 */

import { test, expect } from '@playwright/test';
import { launchElectronApp, closeElectronApp, waitForAppReady, expandCardCategory, createNewDashboard } from '../helpers/electron-helper';

test.describe('Properties Panel', () => {
  test('should be hidden when no card is selected', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Properties panel should exist but may show "no selection" message
      const propertiesPanel = window.locator('[class*="PropertiesPanel"]');
      await propertiesPanel.waitFor({ state: 'visible' });

      // Should show empty state or "Select a card" message
      const noSelectionText = await propertiesPanel.textContent();
      expect(noSelectionText).toMatch(/select.*card|no.*card.*selected/i);
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should show properties when card is selected', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Create a new dashboard first
      await createNewDashboard(window);

      // Expand Controls category to make Button card visible
      await expandCardCategory(window, 'Controls');

      // Add a card
      await window.locator('text=Button Card').first().dblclick();
      await window.waitForTimeout(500);

      // Click the card on canvas to select it
      const cardOnCanvas = window.locator('.react-grid-item').first();
      await cardOnCanvas.click();
      await window.waitForTimeout(300);

      // Verify properties panel shows form fields
      const formItems = await window.locator('.ant-form-item').count();
      expect(formItems).toBeGreaterThan(0);
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should show card type in properties panel', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Create a new dashboard first
      await createNewDashboard(window);

      // Expand Controls category to make Button card visible
      await expandCardCategory(window, 'Controls');

      // Add button card
      await window.locator('text=Button Card').first().dblclick();
      await window.waitForTimeout(500);

      // Select the card
      await window.locator('.react-grid-item').first().click();
      await window.waitForTimeout(300);

      // Verify card type shown
      const panelText = await window.locator('[class*="PropertiesPanel"]').textContent();
      expect(panelText).toMatch(/button/i);
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should edit button card properties', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Create a new dashboard first
      await createNewDashboard(window);

      // Expand Controls category to make Button card visible
      await expandCardCategory(window, 'Controls');

      // Add and select button card
      await window.locator('text=Button Card').first().dblclick();
      await window.waitForTimeout(500);
      await window.locator('.react-grid-item').first().click();
      await window.waitForTimeout(300);

      // Find name input field
      const nameInput = window.locator('input[id*="name"], input[placeholder*="name"]').first();
      const nameExists = await nameInput.count();

      if (nameExists > 0) {
        await nameInput.fill('Test Button');
        await window.waitForTimeout(300);

        // Verify value was entered
        const value = await nameInput.inputValue();
        expect(value).toBe('Test Button');
      }
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should show entity selector for entity-based cards', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Create a new dashboard first
      await createNewDashboard(window);

      // Expand Information category to make Entities card visible
      await expandCardCategory(window, 'Information');

      // Add entities card
      await window.locator('text=Entities Card').first().dblclick();
      await window.waitForTimeout(500);
      await window.locator('.react-grid-item').first().click();
      await window.waitForTimeout(300);

      // Look for entity selector
      const entitySelector = await window.locator('.ant-select, select').count();
      expect(entitySelector).toBeGreaterThan(0);
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should show title field for supported cards', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Create a new dashboard first
      await createNewDashboard(window);

      // Expand Information category to make Entities card visible
      await expandCardCategory(window, 'Information');

      // Add entities card (supports title)
      await window.locator('text=Entities Card').first().dblclick();
      await window.waitForTimeout(500);
      await window.locator('.react-grid-item').first().click();
      await window.waitForTimeout(300);

      // Find title input
      const titleInput = window.locator('input[id*="title"]').first();
      const exists = await titleInput.count();

      if (exists > 0) {
        await titleInput.fill('My Entities');
        const value = await titleInput.inputValue();
        expect(value).toBe('My Entities');
      }
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should show textarea for markdown card', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Create a new dashboard first
      await createNewDashboard(window);

      // Expand Information category to make Markdown card visible
      await expandCardCategory(window, 'Information');

      // Add markdown card
      await window.locator('text=Markdown Card').first().dblclick();
      await window.waitForTimeout(500);
      await window.locator('.react-grid-item').first().click();
      await window.waitForTimeout(300);

      // Find content textarea
      const textarea = window.locator('textarea').first();
      const exists = await textarea.count();

      expect(exists).toBeGreaterThan(0);

      if (exists > 0) {
        await textarea.fill('# Test Markdown\n\nThis is a test.');
        const value = await textarea.inputValue();
        expect(value).toContain('# Test Markdown');
      }
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should show camera fields for picture-entity card', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Create a new dashboard first
      await createNewDashboard(window);

      // Expand Media category to make Picture Entity card visible
      await expandCardCategory(window, 'Media');

      // Add picture-entity card
      await window.locator('text=Picture Entity').first().click();
      await window.waitForTimeout(500);
      await window.locator('.react-grid-item').first().click();
      await window.waitForTimeout(300);

      // Look for camera_image and camera_view fields
      const panelText = await window.locator('[class*="PropertiesPanel"]').textContent();

      // Should have camera-related fields or labels
      expect(panelText).toMatch(/camera|image/i);
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should show stream component warning for camera cards', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Create a new dashboard first
      await createNewDashboard(window);

      // Expand Media category to make Picture Entity card visible
      await expandCardCategory(window, 'Media');

      // Add picture-entity card
      await window.locator('text=Picture Entity').first().click();
      await window.waitForTimeout(500);
      await window.locator('.react-grid-item').first().click();
      await window.waitForTimeout(1000); // Wait for component check

      // Look for stream component status (warning or success alert)
      const alerts = await window.locator('.ant-alert').count();

      // Should show some alert about stream component
      // (either enabled or not enabled)
      expect(alerts).toBeGreaterThan(0);
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should show Apply and Cancel buttons', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Create a new dashboard first
      await createNewDashboard(window);

      // Expand Controls category to make Button card visible
      await expandCardCategory(window, 'Controls');

      // Add and select card
      await window.locator('text=Button Card').first().dblclick();
      await window.waitForTimeout(500);
      await window.locator('.react-grid-item').first().click();
      await window.waitForTimeout(300);

      // Find Apply and Cancel buttons
      const applyButton = window.locator('button').filter({ hasText: /apply/i });
      const cancelButton = window.locator('button').filter({ hasText: /cancel/i });

      expect(await applyButton.count()).toBeGreaterThan(0);
      expect(await cancelButton.count()).toBeGreaterThan(0);
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should disable Apply button when no changes made', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Create a new dashboard first
      await createNewDashboard(window);

      // Expand Controls category to make Button card visible
      await expandCardCategory(window, 'Controls');

      // Add and select card
      await window.locator('text=Button Card').first().dblclick();
      await window.waitForTimeout(500);
      await window.locator('.react-grid-item').first().click();
      await window.waitForTimeout(300);

      // Find Apply button
      const applyButton = window.locator('button').filter({ hasText: /apply/i }).first();

      // Should be disabled initially (no changes)
      const isDisabled = await applyButton.isDisabled();
      expect(isDisabled).toBe(true);
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should enable Apply button when changes are made', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Create a new dashboard first
      await createNewDashboard(window);

      // Expand Controls category to make Button card visible
      await expandCardCategory(window, 'Controls');

      // Add and select card
      await window.locator('text=Button Card').first().dblclick();
      await window.waitForTimeout(500);
      await window.locator('.react-grid-item').first().click();
      await window.waitForTimeout(300);

      // Make a change
      const nameInput = window.locator('input[id*="name"], input[placeholder*="name"]').first();
      const exists = await nameInput.count();

      if (exists > 0) {
        await nameInput.fill('Modified Name');
        await window.waitForTimeout(300);

        // Find Apply button
        const applyButton = window.locator('button').filter({ hasText: /apply/i }).first();

        // Should be enabled now
        const isDisabled = await applyButton.isDisabled();
        expect(isDisabled).toBe(false);
      }
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should apply changes to card when Apply clicked', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Create a new dashboard first
      await createNewDashboard(window);

      // Expand Controls category to make Button card visible
      await expandCardCategory(window, 'Controls');

      // Add and select button card
      await window.locator('text=Button Card').first().dblclick();
      await window.waitForTimeout(500);
      await window.locator('.react-grid-item').first().click();
      await window.waitForTimeout(300);

      // Change name
      const nameInput = window.locator('input[id*="name"]').first();
      const exists = await nameInput.count();

      if (exists > 0) {
        await nameInput.fill('Applied Change');
        await window.waitForTimeout(300);

        // Click Apply
        const applyButton = window.locator('button').filter({ hasText: /apply/i }).first();
        await applyButton.click();
        await window.waitForTimeout(300);

        // Verify Apply button is disabled again (changes saved)
        const isDisabled = await applyButton.isDisabled();
        expect(isDisabled).toBe(true);
      }
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should discard changes when Cancel clicked', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Create a new dashboard first
      await createNewDashboard(window);

      // Expand Controls category to make Button card visible
      await expandCardCategory(window, 'Controls');

      // Add and select card
      await window.locator('text=Button Card').first().dblclick();
      await window.waitForTimeout(500);
      await window.locator('.react-grid-item').first().click();
      await window.waitForTimeout(300);

      // Make a change
      const nameInput = window.locator('input[id*="name"]').first();
      const exists = await nameInput.count();

      if (exists > 0) {
        const originalValue = await nameInput.inputValue();
        await nameInput.fill('Temporary Change');
        await window.waitForTimeout(300);

        // Click Cancel
        const cancelButton = window.locator('button').filter({ hasText: /cancel/i }).first();
        await cancelButton.click();
        await window.waitForTimeout(300);

        // Verify value reverted
        const currentValue = await nameInput.inputValue();
        expect(currentValue).toBe(originalValue);
      }
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should update properties panel when different card selected', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Create a new dashboard first
      await createNewDashboard(window);

      // Expand Controls category to make Button card visible
      await expandCardCategory(window, 'Controls');

      // Add two different cards
      await window.locator('text=Button Card').first().dblclick();
      await window.waitForTimeout(500);

      // Expand Information category to make Markdown card visible
      await expandCardCategory(window, 'Information');

      await window.locator('text=Markdown Card').first().dblclick();
      await window.waitForTimeout(500);

      // Select first card (button)
      await window.locator('.react-grid-item').first().click();
      await window.waitForTimeout(300);

      // Verify button card fields shown
      let hasNameField = await window.locator('input[id*="name"]').count();
      expect(hasNameField).toBeGreaterThan(0);

      // Select second card (markdown)
      await window.locator('.react-grid-item').nth(1).click();
      await window.waitForTimeout(300);

      // Verify markdown fields shown (textarea)
      const hasTextarea = await window.locator('textarea').count();
      expect(hasTextarea).toBeGreaterThan(0);
    } finally {
      await closeElectronApp(app);
    }
  });

  test('should show warning for cards with complex configuration', async () => {
    const { app, window } = await launchElectronApp();

    try {
      await waitForAppReady(window);

      // Add a stack card (complex configuration)
      const searchInput = window.locator('input[placeholder*="Search"]');
      await searchInput.fill('horizontal');
      await window.waitForTimeout(500);

      const stackCard = window.locator('text=Horizontal Stack').or(window.locator('text=/horizontal.*stack/i')).first();
      const exists = await stackCard.count();

      if (exists > 0) {
        await stackCard.dblclick();
        await window.waitForTimeout(500);
        await window.locator('.react-grid-item').first().click();
        await window.waitForTimeout(300);

        // Should show warning about YAML editing
        const panelText = await window.locator('[class*="PropertiesPanel"]').textContent();
        expect(panelText).toMatch(/yaml|complex|advanced/i);
      }
    } finally {
      await closeElectronApp(app);
    }
  });
});
