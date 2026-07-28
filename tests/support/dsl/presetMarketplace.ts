import { Page, expect } from '@playwright/test';

export class PresetMarketplaceDSL {
  constructor(private window: Page) {}

  async open(): Promise<void> {
    const button = this.window
      .getByRole('button', { name: /Browse HA Dashboards|Download/i })
      .first();
    await expect(button).toBeVisible();
    await button.click();

    // ⚠ No longer filtered on the modal TITLE. RC5 retitled it
    // "Browse Dashboards & Presets" (the dialog is no longer HA-only), and a DSL
    // that matches on prose breaks every time the prose is improved.
    // ⚠ Do NOT assert on getByTestId('dashboard-browser-modal') either — antd
    // puts that attribute on the `.ant-modal-root` wrapper, which is always
    // reported hidden. The visible node is `.ant-modal-wrap`.
    const modalWrap = this.window.locator('.ant-modal-wrap:visible').first();
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
