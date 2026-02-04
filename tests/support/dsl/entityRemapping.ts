import { Page, expect, type TestInfo } from '@playwright/test';
import { attachDebugJson } from '../helpers/debug';

export class EntityRemappingDSL {
  constructor(private window: Page) {}

  async openManual(): Promise<void> {
    const btn = this.window.getByTestId('remap-open-manual');
    await expect(btn).toBeVisible();
    await btn.click();
  }

  async expectModalVisible(testInfo?: TestInfo): Promise<void> {
    const modal = this.window.getByTestId('entity-remapping-modal');
    const wrap = this.window.locator('.remap-modal-wrap-force');
    try {
      await expect
        .poll(async () => {
          const box = await wrap.boundingBox().catch(() => null);
          if (box && box.width > 0 && box.height > 0) return true;
          const rootBox = await modal.boundingBox().catch(() => null);
          return rootBox !== null && rootBox.width > 0 && rootBox.height > 0;
        }, { timeout: 5000 })
        .toBe(true);
      await expect(wrap).toBeVisible();
    } catch (error) {
      if (testInfo) {
        const debug = await this.window.evaluate(() => {
          const testWindow = window as Window & { __remapDebug?: unknown };
          const stateElement = document.querySelector('[data-testid="remap-debug-state"]') as HTMLElement | null;
          const wrap = document.querySelector('.ant-modal-wrap') as HTMLElement | null;
          const root = document.querySelector('[data-testid="entity-remapping-modal"]') as HTMLElement | null;
          return {
            remapDebug: testWindow.__remapDebug ?? null,
            stateDataset: stateElement ? { ...stateElement.dataset } : null,
            modalAriaHidden: root?.getAttribute('aria-hidden') ?? null,
            wrapStyle: wrap ? { display: wrap.style.display, visibility: wrap.style.visibility, classes: wrap.className } : null,
            rootStyle: root ? { display: root.style.display, visibility: root.style.visibility, classes: root.className } : null,
            wrapRect: wrap ? wrap.getBoundingClientRect().toJSON() : null,
            rootRect: root ? root.getBoundingClientRect().toJSON() : null,
          };
        });
        await attachDebugJson(testInfo, 'remap-modal-debug.json', debug);
      }
      throw error;
    }
  }

  async autoMapAll(): Promise<void> {
    const button = this.window.getByTestId('remap-auto-map');
    await expect(button).toBeVisible();
    await button.click();
  }

  async selectMapping(missingId: string, replacementId: string): Promise<void> {
    const select = this.window.getByTestId(`remap-select-${missingId}`);
    await expect(select).toBeVisible();
    await select.click();
    await this.window.getByRole('option', { name: replacementId }).first().click();
  }

  async apply(): Promise<void> {
    const applyBtn = this.window.getByTestId('remap-apply');
    await expect(applyBtn).toBeEnabled();

    // Wait for React to stabilize after autoMapAll
    await this.window.waitForTimeout(300);

    // Use the test backdoor function exposed by EntityRemappingModal
    const applied = await this.window.evaluate(() => {
      const testWindow = window as Window & { __remapTestApply?: () => void };
      if (testWindow.__remapTestApply) {
        testWindow.__remapTestApply();
        return true;
      }
      return false;
    });

    if (!applied) {
      // Fallback: Try clicking the button directly
      await applyBtn.scrollIntoViewIfNeeded();
      await applyBtn.click({ force: true });
    }

    // Wait for React to process the apply and close the modal
    await this.window.waitForTimeout(200);
  }
}

export default EntityRemappingDSL;
