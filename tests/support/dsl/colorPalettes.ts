import { Page, expect, TestInfo } from '@playwright/test';

export class ColorPalettesDSL {
  constructor(private window: Page) {}

  async openFavoritesTab(testId: string, testInfo?: TestInfo): Promise<void> {
    // Ensure popover content is rendered
    const container = this.window.getByTestId(testId);
    await expect(container).toBeVisible();
    const tab = this.window.getByTestId(`${testId}-tab-favorites`).first();
    const paletteSelect = this.window.getByTestId(`${testId}-palette-select`).first();
    if (await paletteSelect.count()) {
      return;
    }
    const diagnostics = await this.window.evaluate((tid) => {
      const ids = Array.from(document.querySelectorAll<HTMLElement>('[data-testid]')).map((el) => el.getAttribute('data-testid'));
      const text = (document.querySelector(`[data-testid="${tid}"]`) as HTMLElement | null)?.innerText || '';
      // eslint-disable-next-line no-console
      console.log('[color-palettes diagnostics]', { ids, containerText: text.slice(0, 300) });
      return { ids, containerText: text.slice(0, 300) };
    }, testId);
    if (testInfo?.attach) {
      await testInfo.attach('color-palettes-dom.json', { body: Buffer.from(JSON.stringify(diagnostics, null, 2)), contentType: 'application/json' });
    }
    await expect(tab).toBeVisible();
    await tab.click();
  }

  async selectPalette(testId: string, name: string): Promise<void> {
    const select = this.window.getByTestId(`${testId}-palette-select`);
    await expect(select).toBeVisible();
    await select.click();
    await this.window.getByRole('option', { name }).click();
  }

  async createPalette(testId: string): Promise<void> {
    const btn = this.window.getByTestId(`${testId}-palette-new`);
    await expect(btn).toBeVisible();
    await btn.click();
  }

  async duplicatePalette(testId: string): Promise<void> {
    const btn = this.window.getByTestId(`${testId}-palette-duplicate`);
    await expect(btn).toBeVisible();
    await btn.click();
  }

  async deletePalette(testId: string): Promise<void> {
    const btn = this.window.getByTestId(`${testId}-palette-delete`);
    await expect(btn).toBeVisible();
    await btn.click();
  }

  async addCurrentColor(testId: string): Promise<void> {
    const btn = this.window.getByTestId(`${testId}-add-color`);
    await expect(btn).toBeVisible();
    try {
      await btn.click({ timeout: 2000 });
    } catch {
      await btn.evaluate((el) => (el as HTMLButtonElement).click());
    }
  }

  async applyFavorite(index: number, testId: string): Promise<void> {
    const swatch = this.window.getByTestId(`${testId}-favorite-${index}`);
    await expect(swatch).toBeVisible();
    try {
      await swatch.click({ timeout: 2000 });
    } catch {
      await swatch.evaluate((el) => (el as HTMLButtonElement).click());
    }
  }

  async removeFavorite(index: number, testId: string): Promise<void> {
    const swatch = this.window.getByTestId(`${testId}-favorite-${index}`);
    await expect(swatch).toBeVisible();
    try {
      await swatch.click({ button: 'right', timeout: 2000 });
    } catch {
      await swatch.evaluate((el) => {
        const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
        el.dispatchEvent(event);
      });
    }
  }

  async expectFavoriteCount(count: number, testId: string): Promise<void> {
    const swatches = this.window.getByTestId(new RegExp(`^${testId}-favorite-\\d+$`));
    await expect(swatches).toHaveCount(count);
  }

  async attachDiagnostics(testInfo: TestInfo | undefined, testId: string, label: string): Promise<void> {
    if (!testInfo?.attach) return;
    const payload = await this.window.evaluate((tid) => {
      const palettes = Array.from(document.querySelectorAll<HTMLElement>(`[data-testid^="${tid}-favorite-"]`)).map((el) => ({
        testId: el.dataset.testid,
        color: el.style.background,
      }));
      return { palettes };
    }, testId);
    await testInfo.attach(label, { body: Buffer.from(JSON.stringify(payload, null, 2)), contentType: 'application/json' });
  }
}

export default ColorPalettesDSL;
