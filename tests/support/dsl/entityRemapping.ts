import { Page, expect, type TestInfo } from '@playwright/test';
import fs from 'fs';
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
          const stateElement = document.querySelector('[data-testid=\"remap-debug-state\"]') as HTMLElement | null;
          const wrap = document.querySelector('.ant-modal-wrap') as HTMLElement | null;
          const root = document.querySelector('[data-testid=\"entity-remapping-modal\"]') as HTMLElement | null;
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

  async apply(testInfo?: TestInfo): Promise<void> {
    const applyBtn = this.window.getByTestId('remap-apply');
    const wrap = this.window.locator('.remap-modal-wrap-force');
    await expect(applyBtn).toBeEnabled();
    if (testInfo) {
      const preDebug = await this.window.evaluate(() => {
        const testWindow = window as Window & { __remapDebug?: unknown };
        const stateElement = document.querySelector('[data-testid="remap-debug-state"]') as HTMLElement | null;
        const wrap = document.querySelector('.ant-modal-wrap') as HTMLElement | null;
        const root = document.querySelector('[data-testid="entity-remapping-modal"]') as HTMLElement | null;
        return {
          phase: 'before-apply-click',
          remapDebug: testWindow.__remapDebug ?? null,
          stateDataset: stateElement ? { ...stateElement.dataset } : null,
          modalAttrs: root
            ? {
                ariaHidden: root.getAttribute('aria-hidden'),
                dataHasConfig: root.getAttribute('data-has-config'),
                dataMappingCount: root.getAttribute('data-mapping-count'),
              }
            : null,
          wrapVisible: wrap ? wrap.offsetParent !== null : null,
        };
      });
      await attachDebugJson(testInfo, 'remap-apply-pre.json', preDebug);
      try {
        fs.writeFileSync(testInfo.outputPath('remap-apply-pre.json'), JSON.stringify(preDebug, null, 2));
      } catch {
        // Ignore filesystem errors; attachment is primary.
      }
    }
    await applyBtn.click();
    try {
      await expect(wrap).toBeHidden({ timeout: 5000 });
      if (testInfo) {
        const postDebug = await this.window.evaluate(() => {
          const testWindow = window as Window & { __remapDebug?: unknown };
          const stateElement = document.querySelector('[data-testid="remap-debug-state"]') as HTMLElement | null;
          const wrap = document.querySelector('.ant-modal-wrap') as HTMLElement | null;
          const root = document.querySelector('[data-testid="entity-remapping-modal"]') as HTMLElement | null;
          return {
            phase: 'after-apply-hidden',
            remapDebug: testWindow.__remapDebug ?? null,
            stateDataset: stateElement ? { ...stateElement.dataset } : null,
            modalAttrs: root
              ? {
                  ariaHidden: root.getAttribute('aria-hidden'),
                  dataHasConfig: root.getAttribute('data-has-config'),
                  dataMappingCount: root.getAttribute('data-mapping-count'),
                }
              : null,
            wrapVisible: wrap ? wrap.offsetParent !== null : null,
          };
        });
        await attachDebugJson(testInfo, 'remap-apply-post.json', postDebug);
        try {
          fs.writeFileSync(testInfo.outputPath('remap-apply-post.json'), JSON.stringify(postDebug, null, 2));
        } catch {
          // Ignore filesystem errors; attachment is primary.
        }
      }
    } catch (error) {
      const debug = await this.window.evaluate(() => {
        const testWindow = window as Window & { __remapDebug?: unknown };
        const stateElement = document.querySelector('[data-testid="remap-debug-state"]') as HTMLElement | null;
        const wrap = document.querySelector('.ant-modal-wrap') as HTMLElement | null;
        const root = document.querySelector('[data-testid="entity-remapping-modal"]') as HTMLElement | null;
        const computed = root ? window.getComputedStyle(root) : null;
        const wrapComputed = wrap ? window.getComputedStyle(wrap) : null;
        return {
          remapDebug: testWindow.__remapDebug ?? null,
          stateDataset: stateElement ? { ...stateElement.dataset } : null,
          modalAttrs: root
            ? {
                ariaHidden: root.getAttribute('aria-hidden'),
                dataHasConfig: root.getAttribute('data-has-config'),
                dataMappingCount: root.getAttribute('data-mapping-count'),
              }
            : null,
          rootStyle: root
            ? { display: root.style.display, visibility: root.style.visibility, classes: root.className }
            : null,
          wrapStyle: wrap
            ? { display: wrap.style.display, visibility: wrap.style.visibility, classes: wrap.className }
            : null,
          rootComputed: computed
            ? { display: computed.display, visibility: computed.visibility, opacity: computed.opacity }
            : null,
          wrapComputed: wrapComputed
            ? { display: wrapComputed.display, visibility: wrapComputed.visibility, opacity: wrapComputed.opacity }
            : null,
          wrapRect: wrap ? wrap.getBoundingClientRect().toJSON() : null,
          rootRect: root ? root.getBoundingClientRect().toJSON() : null,
        };
      });
      if (testInfo) {
        await attachDebugJson(testInfo, 'remap-apply-debug.json', debug);
        try {
          fs.writeFileSync(testInfo.outputPath('remap-apply-debug.json'), JSON.stringify(debug, null, 2));
        } catch {
          // Ignore filesystem errors; attachment is primary.
        }
      }
      throw Object.assign(error as Error, { remapDebug: debug });
    }
  }
}

export default EntityRemappingDSL;
