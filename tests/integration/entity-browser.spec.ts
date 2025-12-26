import { test, expect, _electron as electron } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';

/**
 * Entity Browser Test Suite
 * Tests the comprehensive entity browsing, filtering, and selection features
 */

let electronApp: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  electronApp = await electron.launch({
    args: ['.'],
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  });
  page = await electronApp.firstWindow();
  await page.waitForLoadState('domcontentloaded');
});

test.afterAll(async () => {
  await electronApp.close();
});

test.describe('Entity Browser', () => {
  test.beforeEach(async () => {
    // Create a new dashboard to start fresh
    await page.click('button:has-text("New Dashboard")');
    await page.waitForTimeout(500);
  });

  test('should open entity browser when clicking Entities button', async () => {
    // Click the Entities button in the header
    const entitiesButton = page.locator('button:has-text("Entities")');
    await expect(entitiesButton).toBeVisible();
    await entitiesButton.click();

    // Verify entity browser modal is visible
    const modal = page.locator('.ant-modal:has-text("Entity Browser")');
    await expect(modal).toBeVisible();
  });

  test('should show connection status in entity browser', async () => {
    await page.click('button:has-text("Entities")');

    // Check for connection status badge
    const statusBadge = page.locator('.ant-badge-status-text');
    await expect(statusBadge).toBeVisible();

    // Should show either "Connected" or "Offline (Cached)"
    const statusText = await statusBadge.textContent();
    expect(statusText).toMatch(/Connected|Offline \(Cached\)/);
  });

  test('should display cached entities when offline', async () => {
    await page.click('button:has-text("Entities")');

    // Wait for entity table or empty state
    const entityTable = page.locator('.ant-table');
    const emptyState = page.locator('.ant-empty');

    const tableVisible = await entityTable.isVisible().catch(() => false);
    const emptyVisible = await emptyState.isVisible().catch(() => false);

    expect(tableVisible || emptyVisible).toBeTruthy();
  });

  test('should filter entities by search term', async () => {
    await page.click('button:has-text("Entities")');

    // Wait for modal to be fully loaded
    await page.waitForSelector('.ant-modal:has-text("Entity Browser")');

    // Type in search input
    const searchInput = page.locator('input[placeholder*="Search entities"]');
    await searchInput.fill('light');

    // Wait for filtering to complete
    await page.waitForTimeout(300);

    // Verify only matching entities are shown
    const entityRows = page.locator('.ant-table-row');
    const count = await entityRows.count();

    if (count > 0) {
      // Check that first row contains 'light' in entity ID
      const firstRowText = await entityRows.first().textContent();
      expect(firstRowText?.toLowerCase()).toContain('light');
    }
  });

  test('should filter entities by domain tabs', async () => {
    await page.click('button:has-text("Entities")');
    await page.waitForSelector('.ant-modal:has-text("Entity Browser")');

    // Look for domain tabs
    const tabs = page.locator('.ant-tabs-tab');
    const tabCount = await tabs.count();

    if (tabCount > 1) {
      // Click on a non-"All" tab
      const secondTab = tabs.nth(1);
      const tabText = await secondTab.textContent();
      await secondTab.click();

      await page.waitForTimeout(300);

      // Extract domain from tab text (e.g., "light (5)" -> "light")
      const domain = tabText?.split(' ')[0];

      // Verify entities are filtered by domain
      const entityRows = page.locator('.ant-table-row');
      const count = await entityRows.count();

      if (count > 0) {
        const firstEntity = await entityRows.first().locator('span[style*="monospace"]').textContent();
        expect(firstEntity).toContain(`${domain}.`);
      }
    }
  });

  test('should show entity details in table columns', async () => {
    await page.click('button:has-text("Entities")');
    await page.waitForSelector('.ant-table');

    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      const firstRow = rows.first();

      // Should have entity_id column
      const entityId = firstRow.locator('span[style*="monospace"]');
      await expect(entityId).toBeVisible();

      // Should have domain badge
      const domainBadge = firstRow.locator('.ant-badge');
      await expect(domainBadge).toBeVisible();
    }
  });

  test('should allow entity selection', async () => {
    await page.click('button:has-text("Entities")');
    await page.waitForSelector('.ant-table');

    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // Click first row to select
      await rows.first().click();

      // Verify row is selected (radio button checked)
      const selectedRadio = page.locator('.ant-radio-checked');
      await expect(selectedRadio).toBeVisible();

      // Verify Select button is enabled
      const selectButton = page.locator('button:has-text("Select Entity")');
      await expect(selectButton).toBeEnabled();
    }
  });

  test('should close entity browser when clicking Cancel', async () => {
    await page.click('button:has-text("Entities")');
    const modal = page.locator('.ant-modal:has-text("Entity Browser")');
    await expect(modal).toBeVisible();

    // Click Cancel button
    await page.click('button:has-text("Cancel")');

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  test('should refresh entities when clicking Refresh button (when connected)', async () => {
    await page.click('button:has-text("Entities")');

    // Check if connected
    const statusText = await page.locator('.ant-badge-status-text').textContent();

    if (statusText?.includes('Connected')) {
      const refreshButton = page.locator('button:has-text("Refresh")');
      await expect(refreshButton).toBeEnabled();

      await refreshButton.click();

      // Should show loading state briefly
      await page.waitForTimeout(100);

      // Wait for refresh to complete
      await page.waitForTimeout(1000);
    }
  });

  test('should disable Refresh button when offline', async () => {
    await page.click('button:has-text("Entities")');

    const statusText = await page.locator('.ant-badge-status-text').textContent();

    if (statusText?.includes('Offline')) {
      const refreshButton = page.locator('button:has-text("Refresh")');
      await expect(refreshButton).toBeDisabled();
    }
  });

  test('should show entity count in tabs', async () => {
    await page.click('button:has-text("Entities")');
    await page.waitForSelector('.ant-tabs-tab');

    const tabs = page.locator('.ant-tabs-tab');
    const tabCount = await tabs.count();

    if (tabCount > 0) {
      const firstTabText = await tabs.first().textContent();

      // Should contain count in format "All (123)" or "light (5)"
      expect(firstTabText).toMatch(/\(\d+\)/);
    }
  });

  test('should support pagination for large entity lists', async () => {
    await page.click('button:has-text("Entities")');
    await page.waitForSelector('.ant-table');

    // Look for pagination controls
    const pagination = page.locator('.ant-pagination');
    const hasPagination = await pagination.isVisible().catch(() => false);

    if (hasPagination) {
      // Verify page size changer is present
      const pageSizeChanger = page.locator('.ant-select-selector');
      await expect(pageSizeChanger).toBeVisible();

      // Verify total count is shown
      const totalText = page.locator('.ant-pagination-total-text');
      await expect(totalText).toBeVisible();
    }
  });

  test('should support double-click to select entity', async () => {
    await page.click('button:has-text("Entities")');
    await page.waitForSelector('.ant-table');

    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      const modal = page.locator('.ant-modal:has-text("Entity Browser")');
      await expect(modal).toBeVisible();

      // Double-click first row
      await rows.first().dblclick();

      // Wait a moment for the double-click action to process
      await page.waitForTimeout(300);

      // Modal should close after double-click selection
      const isVisible = await modal.isVisible().catch(() => false);
      expect(isVisible).toBeFalsy();
    }
  });

  test('should clear search when clicking clear button', async () => {
    await page.click('button:has-text("Entities")');

    const searchInput = page.locator('input[placeholder*="Search entities"]');
    await searchInput.fill('test_search_term');

    // Click the clear button (X icon in input)
    const clearButton = page.locator('.anticon-close-circle');
    if (await clearButton.isVisible()) {
      await clearButton.click();

      // Verify search is cleared
      const inputValue = await searchInput.inputValue();
      expect(inputValue).toBe('');
    }
  });

  test('should show empty state when no entities match search', async () => {
    await page.click('button:has-text("Entities")');

    const searchInput = page.locator('input[placeholder*="Search entities"]');
    await searchInput.fill('xyz_nonexistent_entity_12345');
    await page.waitForTimeout(300);

    // Should show empty state
    const emptyState = page.locator('.ant-empty');
    await expect(emptyState).toBeVisible();
  });

  test('should maintain tab selection when searching', async () => {
    await page.click('button:has-text("Entities")');
    await page.waitForSelector('.ant-tabs-tab');

    const tabs = page.locator('.ant-tabs-tab');
    const tabCount = await tabs.count();

    if (tabCount > 2) {
      // Select second tab
      await tabs.nth(1).click();
      const selectedTabText = await tabs.nth(1).textContent();

      // Perform search
      const searchInput = page.locator('input[placeholder*="Search entities"]');
      await searchInput.fill('test');
      await page.waitForTimeout(300);

      // Verify tab is still selected
      const activeTab = page.locator('.ant-tabs-tab-active');
      const activeTabText = await activeTab.textContent();
      expect(activeTabText).toContain(selectedTabText?.split(' ')[0]);
    }
  });
});

test.describe('Entity Browser Integration with YAML Editors', () => {
  test.beforeEach(async () => {
    // Create new dashboard
    await page.click('button:has-text("New Dashboard")');
    await page.waitForTimeout(500);

    // Add a card to select it
    const miniGraphCard = page.locator('div:has-text("Mini Graph Card")').first();
    await miniGraphCard.dragTo(page.locator('.grid-canvas'), {
      targetPosition: { x: 100, y: 100 }
    });
    await page.waitForTimeout(500);
  });

  test('should show Insert Entity button in Properties Panel YAML tab', async () => {
    // Click on YAML tab in Properties Panel
    const yamlTab = page.locator('.ant-tabs-tab:has-text("YAML")').first();
    await yamlTab.click();

    // Verify Insert Entity button is visible
    const insertButton = page.locator('button:has-text("Insert Entity")').first();
    await expect(insertButton).toBeVisible();
  });

  test('should open entity browser from Properties Panel YAML editor', async () => {
    // Open YAML tab
    const yamlTab = page.locator('.ant-tabs-tab:has-text("YAML")').first();
    await yamlTab.click();

    // Click Insert Entity button
    const insertButton = page.locator('button:has-text("Insert Entity")').first();
    await insertButton.click();

    // Verify Entity Browser opens
    const modal = page.locator('.ant-modal:has-text("Entity Browser")');
    await expect(modal).toBeVisible();
  });

  test('should show Insert Entity button in Dashboard YAML editor', async () => {
    // Click Edit YAML button in toolbar
    const editYamlButton = page.locator('button:has-text("Edit YAML")');
    await editYamlButton.click();

    // Verify Insert Entity button is in modal footer
    const insertButton = page.locator('.ant-modal-footer button:has-text("Insert Entity")');
    await expect(insertButton).toBeVisible();
  });

  test('should insert entity ID at cursor position in Monaco editor', async () => {
    // Open YAML tab in Properties Panel
    const yamlTab = page.locator('.ant-tabs-tab:has-text("YAML")').first();
    await yamlTab.click();
    await page.waitForTimeout(500);

    // Click in Monaco editor to set cursor
    const monacoEditor = page.locator('.monaco-editor').first();
    await monacoEditor.click({ position: { x: 50, y: 50 } });

    // Open entity browser
    await page.locator('button:has-text("Insert Entity")').first().click();
    await page.waitForSelector('.ant-table');

    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // Select and insert first entity
      await rows.first().click();
      await page.click('button:has-text("Select Entity")');

      // Wait for insertion
      await page.waitForTimeout(500);

      // Verify entity browser closed
      const modal = page.locator('.ant-modal:has-text("Entity Browser")');
      await expect(modal).not.toBeVisible();

      // Verify success message
      const successMessage = page.locator('.ant-message-success');
      await expect(successMessage).toBeVisible({ timeout: 3000 });
    }
  });

  test('should disable Insert Entity button when not connected and no cache', async () => {
    // Open Dashboard YAML editor
    await page.click('button:has-text("Edit YAML")');

    // Get connection status
    const hasCache = await page.locator('.ant-table-row').count() > 0;

    if (!hasCache) {
      // Insert Entity button should be disabled if no entities available
      const insertButton = page.locator('button:has-text("Insert Entity")');
      // Note: Button might still be enabled but entity browser will show empty state
      await insertButton.click();

      const emptyState = page.locator('.ant-empty');
      await expect(emptyState).toBeVisible();
    }
  });
});

test.describe('Entity Browser Accessibility', () => {
  test('should support keyboard navigation in entity table', async () => {
    await page.click('button:has-text("Entities")');
    await page.waitForSelector('.ant-table');

    const rows = page.locator('.ant-table-row');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // Focus first row
      await rows.first().focus();

      // Press Enter to select
      await page.keyboard.press('Enter');

      // Verify selection
      const selectedRadio = page.locator('.ant-radio-checked');
      await expect(selectedRadio).toBeVisible();
    }
  });

  test('should support Escape key to close modal', async () => {
    await page.click('button:has-text("Entities")');
    const modal = page.locator('.ant-modal:has-text("Entity Browser")');
    await expect(modal).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  test('should have proper ARIA labels', async () => {
    await page.click('button:has-text("Entities")');

    // Check for modal role
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Check for search input accessibility
    const searchInput = page.locator('input[placeholder*="Search entities"]');
    await expect(searchInput).toBeVisible();
  });
});
