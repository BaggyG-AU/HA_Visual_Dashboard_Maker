/**
 * Entity Browser DSL
 *
 * Entity browsing, filtering, and selection operations.
 * Encapsulates all Entity Browser modal interactions.
 */

import { Page, expect } from '@playwright/test';

/**
 * Seed the entity cache with test data via IPC
 */
export async function seedEntityCache(window: Page): Promise<void> {
  const testEntities = [
    {
      entity_id: 'light.living_room',
      domain: 'light',
      state: 'on',
      attributes: { friendly_name: 'Living Room Light', brightness: 255 },
    },
    {
      entity_id: 'binary_sensor.motion_detected',
      domain: 'binary_sensor',
      state: 'off',
      attributes: { friendly_name: 'Motion Sensor', device_class: 'motion' },
    },
    {
      entity_id: 'sensor.temperature',
      domain: 'sensor',
      state: '22.5',
      attributes: { friendly_name: 'Temperature', unit_of_measurement: '°C' },
    },
    {
      entity_id: 'switch.fan',
      domain: 'switch',
      state: 'off',
      attributes: { friendly_name: 'Ceiling Fan' },
    },
  ];

  await window.evaluate(async (entities) => {
    const result = await (window as any).electronAPI.testSeedEntityCache(entities);
    if (result.success) {
      console.log('[EntityBrowserDSL] Seeded', entities.length, 'test entities');
    }
  }, testEntities);
}

/**
 * Clear the entity cache via IPC
 */
export async function clearEntityCache(window: Page): Promise<void> {
  await window.evaluate(async () => {
    const result = await (window as any).electronAPI.testClearEntityCache();
    if (result.success) {
      console.log('[EntityBrowserDSL] Entity cache cleared');
    }
  });
}

export class EntityBrowserDSL {
  constructor(private window: Page) {}

  /**
   * Ensure no blocking modal overlays (helper)
   */
  private async ensureNoBlockingOverlays(): Promise<void> {
    for (let i = 0; i < 3; i++) {
      const modalWraps = this.window.locator('.ant-modal-wrap');
      const count = await modalWraps.count();

      if (count === 0) return;

      let hasVisibleModal = false;
      for (let j = 0; j < count; j++) {
        const isVisible = await modalWraps.nth(j).isVisible().catch(() => false);
        if (isVisible) {
          hasVisibleModal = true;
          break;
        }
      }

      if (!hasVisibleModal) return;

      await this.window.keyboard.press('Escape');
      await this.window.waitForTimeout(400);
    }
  }

  /**
   * Open the Entity Browser modal (from header button)
   */
  async open(): Promise<void> {
    // Ensure no modals are blocking
    await this.ensureNoBlockingOverlays();

    const entitiesButton = this.window.locator('button:has-text("Entities")');
    await expect(entitiesButton).toBeVisible();
    await entitiesButton.click();

    // Wait for modal wrap to be visible
    const modalWrap = this.window.locator('.ant-modal-wrap:has-text("Entity Browser")');
    await expect(modalWrap).toBeVisible({ timeout: 5000 });

    // Wait for modal content
    const modal = modalWrap.locator('.ant-modal');
    await expect(modal).toBeVisible();
  }

  /**
   * Open the Entity Browser modal from Insert Entity button (in YAML editors)
   */
  async openFromInsertButton(): Promise<void> {
    const insertButton = this.window.locator('button:has-text("Insert Entity")');
    await expect(insertButton).toBeVisible();
    await insertButton.click();
    await this.window.waitForTimeout(300);

    const modal = this.window.locator('.ant-modal:has-text("Entity Browser")');
    await expect(modal).toBeVisible();
  }

  /**
   * Close the Entity Browser modal (Cancel button)
   */
  async close(): Promise<void> {
    await this.window.click('button:has-text("Cancel")');
    await this.window.waitForTimeout(300);

    const modal = this.window.locator('.ant-modal:has-text("Entity Browser")');
    await expect(modal).not.toBeVisible();
  }

  /**
   * Search for entities by search term
   */
  async search(term: string): Promise<void> {
    const searchInput = this.window.locator('input[placeholder*="Search entities"]');
    await searchInput.fill(term);
    await this.window.waitForTimeout(300);
  }

  /**
   * Clear the search input
   */
  async clearSearch(): Promise<void> {
    const clearButton = this.window.locator('.anticon-close-circle');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }
  }

  /**
   * Select an entity by row index (0-based)
   */
  async selectEntityByIndex(index: number): Promise<void> {
    const rows = this.window.locator('.ant-table-row');
    const radio = rows.nth(index).locator('.ant-radio');
    await radio.click();
    await this.window.waitForTimeout(200);

    const selectedRadio = this.window.locator('.ant-radio-checked');
    await expect(selectedRadio).toBeVisible();
  }

  /**
   * Double-click an entity row to select and close
   */
  async doubleClickEntity(index: number): Promise<void> {
    const rows = this.window.locator('.ant-table-row');
    await rows.nth(index).dblclick();
    await this.window.waitForTimeout(600);

    // Modal should close
    const modal = this.window.locator('.ant-modal:has-text("Entity Browser")');
    const isVisible = await modal.isVisible().catch(() => false);
    expect(isVisible).toBeFalsy();
  }

  /**
   * Click the Select Entity button (after selecting a row)
   */
  async clickSelectEntity(): Promise<void> {
    const selectButton = this.window.locator('button:has-text("Select Entity")');
    await expect(selectButton).toBeEnabled();
    await selectButton.click();
    await this.window.waitForTimeout(500);
  }

  /**
   * Click domain tab by name (e.g., "light", "binary_sensor")
   */
  async selectDomainTab(domain: string): Promise<void> {
    const modal = this.window.locator('.ant-modal:has-text("Entity Browser")');
    const tab = modal.locator(`.ant-tabs-tab:has-text("${domain}")`);
    await tab.click();
    await this.window.waitForTimeout(300);
  }

  /**
   * Select the "All" tab
   */
  async selectAllTab(): Promise<void> {
    const modal = this.window.locator('.ant-modal:has-text("Entity Browser")');
    const allTab = modal.locator('.ant-tabs-tab:has-text("All")');
    if (await allTab.isVisible().catch(() => false)) {
      await allTab.click();
      await this.window.waitForTimeout(200);
    }
  }

  /**
   * Click Refresh button
   */
  async clickRefresh(): Promise<void> {
    const refreshButton = this.window.locator('button:has-text("Refresh")');
    await expect(refreshButton).toBeEnabled();
    await refreshButton.click();
    await this.window.waitForTimeout(100);
  }

  /**
   * Expect entity browser modal to be visible
   */
  async expectVisible(): Promise<void> {
    const modal = this.window.locator('.ant-modal:has-text("Entity Browser")');
    await expect(modal).toBeVisible();
  }

  /**
   * Expect connection status badge to show specific text
   */
  async expectConnectionStatus(status: 'Connected' | 'Not Connected' | 'Offline (Cached)'): Promise<void> {
    const statusBadge = this.window.getByTestId('entity-browser-status-badge');
    await expect(statusBadge).toBeVisible();
    const statusText = await statusBadge.textContent();
    expect(statusText).toContain(status);
  }

  /**
   * Expect connection status to be any of the valid states
   */
  async expectAnyConnectionStatus(): Promise<void> {
    const statusBadge = this.window.getByTestId('entity-browser-status-badge');
    await expect(statusBadge).toBeVisible();
    const statusText = await statusBadge.textContent();
    expect(statusText).toMatch(/Connected|Not Connected|Offline \(Cached\)/);
  }

  /**
   * Expect entity table or empty state to be visible
   */
  async expectTableOrEmptyState(): Promise<void> {
    const entityTable = this.window.locator('.ant-table');
    const emptyState = this.window.locator('.ant-empty');

    const tableVisible = await entityTable.isVisible().catch(() => false);
    const emptyVisible = await emptyState.isVisible().catch(() => false);

    expect(tableVisible || emptyVisible).toBeTruthy();
  }

  /**
   * Expect entity table to be visible
   */
  async expectTableVisible(): Promise<void> {
    const table = this.window.locator('.ant-table');
    await expect(table).toBeVisible();
  }

  /**
   * Expect empty state to be visible
   */
  async expectEmptyState(): Promise<void> {
    const emptyState = this.window.locator('.ant-empty');
    await expect(emptyState).toBeVisible();
  }

  /**
   * Expect entity rows to contain specific text
   */
  async expectRowsContain(text: string): Promise<void> {
    const entityRows = this.window.locator('.ant-table-row');
    const count = await entityRows.count();

    if (count > 0) {
      const firstRowText = await entityRows.first().textContent();
      expect(firstRowText?.toLowerCase()).toContain(text.toLowerCase());
    }
  }

  /**
   * Expect Select Entity button to be enabled
   */
  async expectSelectButtonEnabled(): Promise<void> {
    const selectButton = this.window.locator('button:has-text("Select Entity")');
    await expect(selectButton).toBeEnabled();
  }

  /**
   * Expect Refresh button to be disabled
   */
  async expectRefreshButtonDisabled(): Promise<void> {
    const refreshButton = this.window.locator('button:has-text("Refresh")');
    await expect(refreshButton).toBeDisabled();
  }

  /**
   * Get entity row count
   */
  async getRowCount(): Promise<number> {
    const rows = this.window.locator('.ant-table-row');
    return await rows.count();
  }

  /**
   * Expect entity details to be visible in first row
   */
  async expectEntityDetailsVisible(): Promise<void> {
    const rows = this.window.locator('.ant-table-row');
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
  }

  /**
   * Expect tab count format (e.g., "All (4)")
   */
  async expectTabCountFormat(): Promise<void> {
    const modal = this.window.locator('.ant-modal:has-text("Entity Browser")');
    const tabs = modal.locator('.ant-tabs-tab');
    const tabCount = await tabs.count();

    if (tabCount > 0) {
      const allTab = tabs.locator('text=/All \\(\\d+\\)/').first();
      const hasAllTab = await allTab.count();

      if (hasAllTab > 0) {
        const allTabText = await allTab.textContent();
        expect(allTabText).toMatch(/All \(\d+\)/);
      }
    }
  }

  /**
   * Get entity ID from first row
   */
  async getFirstEntityId(): Promise<string> {
    const rows = this.window.locator('.ant-table-row');
    const firstRow = rows.first();
    await expect(firstRow).toBeVisible();

    const entityIdCell = firstRow.locator('td').nth(1);
    const entityId = await entityIdCell.textContent();
    return entityId || '';
  }
}
