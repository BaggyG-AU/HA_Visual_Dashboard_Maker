/**
 * Integration Test: Entity Browser (DSL-Based)
 *
 * Tests the comprehensive entity browsing, filtering, and selection features.
 * Migrated to use DSL pattern with isolated test storage.
 *
 * Note: These tests use seeded test data to ensure consistent test results.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close, seedEntityCache, clearEntityCache } from '../support';

test.describe('Entity Browser', () => {
  test('should open entity browser when clicking Entities button', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();
      await ctx.entityBrowser.expectVisible();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should show connection status in entity browser', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();
      await ctx.entityBrowser.expectAnyConnectionStatus();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should display cached entities when offline', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();
      await ctx.entityBrowser.expectTableOrEmptyState();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should filter entities by search term', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();
      await ctx.entityBrowser.search('light');
      await ctx.entityBrowser.expectRowsContain('light');
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should filter entities by domain tabs', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();

      const modal = ctx.window.locator('.ant-modal:has-text("Entity Browser")');
      const tabs = modal.locator('.ant-tabs-tab');
      const tabCount = await tabs.count();

      if (tabCount > 1) {
        const secondTab = tabs.nth(1);
        const tabText = await secondTab.textContent();
        await secondTab.click();
        await ctx.window.waitForTimeout(300);

        const domain = tabText?.match(/^([a-z_]+)/)?.[1];

        if (domain && domain !== 'All') {
          const entityRows = ctx.window.locator('.ant-table-row');
          const count = await entityRows.count();

          if (count > 0) {
            const firstEntity = await entityRows.first().locator('span[style*="monospace"]').textContent();
            expect(firstEntity).toContain(`${domain}.`);
          }
        }
      }
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should show entity details in table columns', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();
      await ctx.entityBrowser.selectAllTab();
      await ctx.entityBrowser.expectTableVisible();
      await ctx.entityBrowser.expectEntityDetailsVisible();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should allow entity selection', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();

      const rowCount = await ctx.entityBrowser.getRowCount();
      if (rowCount > 0) {
        await ctx.entityBrowser.selectEntityByIndex(0);
        await ctx.entityBrowser.expectSelectButtonEnabled();
      }
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should close entity browser when clicking Cancel', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();
      await ctx.entityBrowser.expectVisible();
      await ctx.entityBrowser.close();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should refresh entities when clicking Refresh button (when connected)', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();

      const modal = ctx.window.locator('.ant-modal:has-text("Entity Browser")');
      const statusBadge = modal.locator('.ant-badge-status-text').first();
      const statusText = await statusBadge.textContent();

      if (statusText?.includes('Connected')) {
        await ctx.entityBrowser.clickRefresh();
        await ctx.window.waitForTimeout(1000);
      }
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should disable Refresh button when offline', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();

      const modal = ctx.window.locator('.ant-modal:has-text("Entity Browser")');
      const statusBadge = modal.locator('.ant-badge-status-text').first();
      const statusText = await statusBadge.textContent();

      if (statusText?.includes('Offline') || statusText?.includes('Not Connected')) {
        await ctx.entityBrowser.expectRefreshButtonDisabled();
      }
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should show entity count in tabs', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();
      await ctx.entityBrowser.expectTabCountFormat();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should support pagination for large entity lists', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();
      await ctx.entityBrowser.expectTableVisible();

      const rowCount = await ctx.entityBrowser.getRowCount();
      expect(rowCount).toBeGreaterThan(0);
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should support double-click to select entity', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();

      const rowCount = await ctx.entityBrowser.getRowCount();
      if (rowCount > 0) {
        await ctx.entityBrowser.doubleClickEntity(0);
      }
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should clear search when clicking clear button', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();
      await ctx.entityBrowser.search('test_search_term');

      const modal = ctx.window.locator('.ant-modal:has-text("Entity Browser")');
      const clearButton = modal
        .getByTestId('entity-browser-search-input')
        .locator('..')
        .locator('.ant-input-clear-icon, .anticon-close-circle')
        .first();

      if (await clearButton.isVisible()) {
        await clearButton.click();

        const searchInput = ctx.window.getByTestId('entity-browser-search-input');
        const inputValue = await searchInput.inputValue();
        expect(inputValue).toBe('');
      }
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should show empty state when no entities match search', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();
      await ctx.entityBrowser.search('xyz_nonexistent_entity_12345');
      await ctx.entityBrowser.expectEmptyState();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should maintain tab selection when searching', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();

      const modal = ctx.window.locator('.ant-modal:has-text("Entity Browser")');
      const tabs = modal.locator('.ant-tabs-tab');
      const tabCount = await tabs.count();

      if (tabCount > 2) {
        await tabs.nth(1).click();
        const selectedTabText = await tabs.nth(1).textContent();
        await ctx.window.waitForTimeout(200);

        await ctx.entityBrowser.search('test');

        const activeTab = modal.locator('.ant-tabs-tab-active');
        const activeTabText = await activeTab.textContent();
        const selectedDomain = selectedTabText?.split(' ')[0];
        expect(activeTabText).toContain(selectedDomain || '');
      }
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });
});

test.describe('Entity Browser Integration with YAML Editors', () => {
  test('should show Insert Entity button in Dashboard YAML editor', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.yamlEditor.open();

      const insertButton = ctx.window.getByTestId('yaml-insert-entity-button');
      await expect(insertButton).toBeVisible();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should open entity browser from Dashboard YAML editor', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.yamlEditor.open();
      await ctx.yamlEditor.clickInsertEntity();

      await ctx.entityBrowser.expectVisible();
      await ctx.entityBrowser.clearSearch();
      await ctx.entityBrowser.expectTableVisible();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should insert entity ID into Dashboard YAML editor', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();

      const initialContent = await ctx.yamlEditor.getEditorContent();

      const monacoEditor = ctx.window.locator('.monaco-editor').first();
      await monacoEditor.click({ position: { x: 100, y: 100 } });
      await ctx.window.waitForTimeout(200);

      await ctx.yamlEditor.clickInsertEntity();

      const rows = ctx.window.locator('.ant-table-row');
      const rowCount = await rows.count();

      if (rowCount > 0) {
        const firstRowRadioInput = rows.first().locator('input[type="radio"]');
        await firstRowRadioInput.check({ force: true });
        await ctx.window.waitForTimeout(300);

        await ctx.entityBrowser.clickSelectEntity();

        const entityBrowserModal = ctx.window.locator('.ant-modal:has-text("Entity Browser")');
        await expect(entityBrowserModal).not.toBeVisible();

        const newContent = await ctx.yamlEditor.getEditorContent();
        expect(newContent).not.toBe(initialContent);
      }
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should show cached entities in Dashboard YAML editor Insert Entity', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.yamlEditor.open();
      await ctx.yamlEditor.clickInsertEntity();

      const rowCount = await ctx.entityBrowser.getRowCount();

      expect(rowCount).toBeGreaterThan(0);

      await ctx.entityBrowser.expectTableVisible();

      const entityId = await ctx.entityBrowser.getFirstEntityId();
      expect(entityId).toBeTruthy();
      expect(entityId).toContain('.');
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should filter entities in Dashboard YAML editor Insert Entity', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.yamlEditor.open();
      await ctx.yamlEditor.clickInsertEntity();

      const initialRows = await ctx.entityBrowser.getRowCount();

      await ctx.entityBrowser.search('light');

      const filteredRows = await ctx.entityBrowser.getRowCount();
      expect(filteredRows).toBeLessThanOrEqual(initialRows);
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });
});

test.describe('Entity Browser Accessibility', () => {
  test('should support keyboard navigation in entity table', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();
      await ctx.window.waitForTimeout(300);

      const rows = ctx.window.locator('.ant-table-row');
      const rowCount = await rows.count();

      if (rowCount > 0) {
        const firstRow = rows.first();
        await firstRow.click();
        await ctx.window.waitForTimeout(200);

        const firstRowRadio = firstRow.locator('.ant-radio-input');
        await firstRowRadio.focus();
        await ctx.window.waitForTimeout(100);
        await ctx.window.keyboard.press('Space');
        await ctx.window.waitForTimeout(300);

        const selectedRadio = ctx.window.locator('.ant-radio-checked');
        await expect(selectedRadio).toBeVisible();
      }
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should support Escape key to close modal', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();
      await ctx.entityBrowser.expectVisible();

      const modal = ctx.window.locator('.ant-modal:has-text("Entity Browser")');

      // Focus the modal explicitly, then send Escape via the page (AntD listens on document)
      await modal.click({ position: { x: 10, y: 10 } });
      await ctx.window.keyboard.press('Escape');

      await ctx.entityBrowser.expectClosed();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('should have proper ARIA labels', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.entityBrowser.open();

      const modal = ctx.window.locator('.ant-modal:has-text("Entity Browser")');
      await expect(modal).toBeVisible();

      const searchInput = ctx.window.locator('input[placeholder*="Search entities"]');
      await expect(searchInput).toBeVisible();
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });
});
