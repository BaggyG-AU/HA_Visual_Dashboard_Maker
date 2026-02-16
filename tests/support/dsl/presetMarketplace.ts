import { Page, expect } from '@playwright/test';

export class PresetMarketplaceDSL {
  constructor(private window: Page) {}

  async open(): Promise<void> {
    const button = this.window.getByRole('button', { name: /Browse HA Dashboards|Download/i }).first();
    await expect(button).toBeVisible();
    await button.click();

    const modalWrap = this.window.locator('.ant-modal-wrap:visible').filter({
      hasText: 'Browse Home Assistant Dashboards',
    });
    await expect(modalWrap).toBeVisible();

    const presetTab = modalWrap.getByRole('tab', { name: /Preset Marketplace/i });
    await expect(presetTab).toBeVisible();
    await presetTab.click();
  }

  async expectVisible(): Promise<void> {
    await expect(this.window.getByTestId('preset-marketplace-panel')).toBeVisible();
  }

  async selectPresetById(presetId: string): Promise<void> {
    const item = this.window.getByTestId(`preset-marketplace-item-${presetId}`);
    await expect(item).toBeVisible();
    await item.click();
  }

  async expectPreviewTitle(title: string): Promise<void> {
    await expect(this.window.getByTestId('preset-marketplace-preview-title')).toHaveText(title);
  }

  async importSelected(): Promise<void> {
    const importButton = this.window.getByTestId('preset-marketplace-import');
    await expect(importButton).toBeEnabled();
    await importButton.click();
  }
}

export default PresetMarketplaceDSL;
