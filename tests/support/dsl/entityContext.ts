import { Page, expect, type TestInfo } from '@playwright/test';
import { attachDebugJson } from '../helpers/debug';

export class EntityContextDSL {
  constructor(private window: Page) {}

  private async ensureTestApi(): Promise<void> {
    await expect
      .poll(async () => {
        return await this.window.evaluate(() => {
          const testWindow = window as Window & {
            __testEntityApi?: { setEntities?: unknown; patchEntities?: unknown };
          };
          return Boolean(
            testWindow.__testEntityApi
            && typeof testWindow.__testEntityApi.setEntities === 'function'
            && typeof testWindow.__testEntityApi.patchEntities === 'function'
          );
        });
      }, { timeout: 8000 })
      .toBe(true);
  }

  async setEntities(entities: Array<Record<string, unknown>>, testInfo?: TestInfo): Promise<void> {
    try {
      await this.ensureTestApi();
      await this.window.evaluate((payload) => {
        const testWindow = window as Window & { __testEntityApi?: { setEntities: (entities: Array<Record<string, unknown>>) => void } };
        testWindow.__testEntityApi?.setEntities(payload);
      }, entities);
    } catch (error) {
      if (testInfo) {
        await attachDebugJson(testInfo, 'entity-context-set-entities.json', { error: String(error) });
      }
      throw error;
    }
  }

  async patchEntity(entityId: string, patch: Record<string, unknown>, testInfo?: TestInfo): Promise<void> {
    try {
      await this.ensureTestApi();
      await this.window.evaluate(({ id, patchData }) => {
        const testWindow = window as Window & { __testEntityApi?: { patchEntities: (changes: Record<string, unknown>) => void } };
        testWindow.__testEntityApi?.patchEntities({ [id]: { entity_id: id, ...patchData } });
      }, { id: entityId, patchData: patch });
    } catch (error) {
      if (testInfo) {
        await attachDebugJson(testInfo, 'entity-context-patch-entity.json', { error: String(error), entityId, patch });
      }
      throw error;
    }
  }

  async expectPreviewValue(field: 'name' | 'title' | 'content', value: string | RegExp, testInfo?: TestInfo): Promise<void> {
    const container = this.window.getByTestId(`entity-context-preview-${field}`);
    try {
      await expect(container).toBeVisible();
      await expect(container).toContainText(value);
    } catch (error) {
      if (testInfo) {
        await attachDebugJson(testInfo, 'entity-context-preview-diagnostics.json', {
          field,
          expected: value.toString(),
          actual: await container.textContent(),
        });
      }
      throw error;
    }
  }

  async expectButtonCardName(value: string | RegExp): Promise<void> {
    const name = this.window.getByTestId('button-card-display-name');
    await expect(name).toBeVisible();
    await expect(name).toContainText(value);
  }

  async expectCustomButtonCardName(value: string | RegExp): Promise<void> {
    const name = this.window.getByTestId('custom-button-card-name');
    await expect(name).toBeVisible();
    await expect(name).toContainText(value);
  }

  async expectEntitiesCardTitle(value: string | RegExp): Promise<void> {
    const title = this.window.getByTestId('entities-card-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText(value);
  }

  async expectMarkdownPreview(value: string | RegExp): Promise<void> {
    const base = this.window.getByTestId('markdown-card-content');
    const content = base.filter({ hasText: value }).first();
    await expect(content).toBeVisible();
    await expect(content).toContainText(value);
  }
}

export default EntityContextDSL;
