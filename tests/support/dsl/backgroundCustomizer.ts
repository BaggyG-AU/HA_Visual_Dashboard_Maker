import { Page, expect, type TestInfo } from '@playwright/test';
import { attachDebugJson } from '../helpers/debug';

export type BackgroundTypeLabel = 'None (transparent)' | 'Solid color' | 'Gradient' | 'Image' | 'Frosted glass';

export class BackgroundCustomizerDSL {
  constructor(private window: Page) {}

  private getTypeSelect() {
    return this.window.getByTestId('advanced-style-background-type');
  }

  private async resolveVisibleDropdown() {
    const dropdown = this.window.locator('.ant-select-dropdown');
    await expect
      .poll(async () => {
        const count = await dropdown.count();
        for (let i = count - 1; i >= 0; i -= 1) {
          const visible = await dropdown.nth(i).isVisible().catch(() => false);
          if (visible) return i;
        }
        return -1;
      }, { timeout: 3000 })
      .toBeGreaterThanOrEqual(0)
      .catch(() => undefined);

    const count = await dropdown.count();
    for (let i = count - 1; i >= 0; i -= 1) {
      const candidate = dropdown.nth(i);
      const visible = await candidate.isVisible().catch(() => false);
      if (visible) return candidate;
    }

    return null;
  }

  private popupClassForTestId(testId: string): string | null {
    const map: Record<string, string> = {
      'advanced-style-background-type': 'bg-type-dropdown',
      'background-image-position-select': 'bg-image-position-dropdown',
      'background-image-size-select': 'bg-image-size-dropdown',
      'background-image-repeat-select': 'bg-image-repeat-dropdown',
      'background-blend-mode-select': 'bg-blend-dropdown',
    };
    return map[testId] ?? null;
  }

  private async resolveScopedDropdown(testId: string) {
    const popupClass = this.popupClassForTestId(testId);
    if (!popupClass) return null;

    const dropdown = this.window.locator(`.ant-select-dropdown.${popupClass}`);
    await expect
      .poll(async () => {
        const count = await dropdown.count();
        for (let i = 0; i < count; i += 1) {
          const visible = await dropdown.nth(i).isVisible().catch(() => false);
          if (visible) return i;
        }
        return -1;
      }, { timeout: 3000 })
      .toBeGreaterThanOrEqual(0)
      .catch(() => undefined);

    const count = await dropdown.count();
    for (let i = 0; i < count; i += 1) {
      const candidate = dropdown.nth(i);
      const visible = await candidate.isVisible().catch(() => false);
      if (visible) return candidate;
    }

    return null;
  }

  private async dismissBlockingPopovers(): Promise<void> {
    const popover = this.window.locator('.ant-popover:not(.ant-popover-hidden)');
    if (await popover.count()) {
      await this.window.keyboard.press('Escape');
      await this.window.mouse.click(5, 5);
    }
  }

  private async selectByKeyboard(select: ReturnType<BackgroundCustomizerDSL['getTypeSelect']>, value: string): Promise<void> {
    await select.click({ force: true });

    const input = select.locator('input[role="combobox"]').first();
    const maxSteps = 24;
    for (let i = 0; i < maxSteps; i += 1) {
      const activeText = await input.evaluate((el) => {
        const inputEl = el as HTMLInputElement;
        const activeId = inputEl.getAttribute('aria-activedescendant');
        if (!activeId) return '';
        const active = document.getElementById(activeId) as HTMLElement | null;
        return active?.innerText?.trim() || '';
      }).catch(() => '');
      if (new RegExp(`^${value}$`, 'i').test(activeText)) {
        await this.window.keyboard.press('Enter');
        return;
      }
      await this.window.keyboard.press('ArrowDown');
    }

    await this.window.keyboard.press('Enter');
  }

  private async selectFromOwnedList(select: ReturnType<BackgroundCustomizerDSL['getTypeSelect']>, value: string): Promise<boolean> {
    return await select.evaluate((node, label) => {
      const root = node as HTMLElement;
      const input = root.querySelector('input[role="combobox"]') as HTMLInputElement | null;
      const listId = input?.getAttribute('aria-controls');
      if (!listId) return false;
      const list = document.getElementById(listId);
      if (!list) return false;
      const options = Array.from(list.querySelectorAll<HTMLElement>('[role="option"]'));
      const target = options.find((opt) => (opt.textContent || '').trim().toLowerCase() === label.toLowerCase());
      if (!target) return false;
      target.click();
      return true;
    }, value).catch(() => false);
  }

  private async collectSelectDiagnostics(testId: string): Promise<Record<string, unknown>> {
    return await this.window.evaluate((tid) => {
      const select = document.querySelector(`[data-testid="${tid}"]`) as HTMLElement | null;
      const options = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).map((el) => ({
        text: (el.textContent || '').trim(),
        visible: (() => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        })(),
        selected: el.getAttribute('aria-selected'),
      }));
      const dropdowns = Array.from(document.querySelectorAll<HTMLElement>('.ant-select-dropdown')).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          className: el.className,
          visible: r.width > 0 && r.height > 0,
        };
      });
      const active = document.activeElement as HTMLElement | null;
      return {
        selectText: select?.innerText || '',
        options,
        dropdowns,
        activeElement: active ? {
          tag: active.tagName,
          className: active.className,
          role: active.getAttribute('role'),
          testId: active.getAttribute('data-testid'),
        } : null,
      };
    }, testId);
  }

  private async selectDropdownValue(
    testId: string,
    label: string,
    testInfo?: TestInfo,
    diagnosticsLabel = 'background-select-diagnostics.json'
  ): Promise<void> {
    const select = this.window.getByTestId(testId);
    await expect(select).toBeVisible();
    const selectOnce = async () => {
      await select.click({ force: true });

      const dropdown = await this.resolveScopedDropdown(testId) ?? await this.resolveVisibleDropdown();
      if (dropdown) {
        await expect(dropdown).toBeVisible({ timeout: 5000 });
        const option = dropdown.getByRole('option', { name: new RegExp(`^${label}$`, 'i') }).first();
        const found = await option
          .waitFor({ state: 'visible', timeout: 2000 })
          .then(() => true)
          .catch(() => false);
        if (found) {
          await option.click();
          return;
        }
      }

      const combobox = select.locator('input[role="combobox"]').first();
      if (await combobox.isVisible().catch(() => false)) {
        await combobox.pressSequentially(label, { delay: 0 });
        await this.window.keyboard.press('Enter');
        return;
      }

      const selectedFromOwnedList = await this.selectFromOwnedList(select, label);
      if (selectedFromOwnedList) {
        return;
      }

      throw new Error(`No dropdown option available for ${testId} while selecting ${label}`);
    };

    try {
      await selectOnce();
      await expect(select).toContainText(new RegExp(label, 'i'));
    } catch (error) {
      // One retry after collecting diagnostics to reduce transient portal focus races.
      const diagnostics = await this.collectSelectDiagnostics(testId);
      if (testInfo) {
        await attachDebugJson(testInfo, diagnosticsLabel, diagnostics);
      }
      try {
        const retrySelect = this.window.getByTestId(testId);
        await expect(retrySelect).toBeVisible();
        await retrySelect.click({ force: true });
        await selectOnce();
        await expect(retrySelect).toContainText(new RegExp(label, 'i'));
        return;
      } catch {
        throw error;
      }
    }
  }

  async selectType(type: BackgroundTypeLabel, testInfo?: TestInfo): Promise<void> {
    const select = this.getTypeSelect();
    await expect(select).toBeVisible();
    await this.dismissBlockingPopovers();
    try {
      await select.click();
    } catch {
      await this.dismissBlockingPopovers();
      await select.click({ force: true });
    }

    try {
      const dropdown = await this.resolveScopedDropdown('advanced-style-background-type') ?? await this.resolveVisibleDropdown();
      if (dropdown) {
        await expect(dropdown).toBeVisible({ timeout: 5000 });
        const option = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(`^${type}$`, 'i') });
        await expect(option).toBeVisible({ timeout: 5000 });
        await option.click();
        await expect(dropdown).not.toBeVisible({ timeout: 5000 });
        return;
      }

      await this.selectByKeyboard(select, type);
      const fallbackOption = this.window.getByRole('option', { name: new RegExp(`^${type}$`, 'i') }).first();
      if (await fallbackOption.isVisible().catch(() => false)) {
        await fallbackOption.click();
      }
      const selected = await select.textContent().catch(() => '');
      expect(selected ?? '').toMatch(new RegExp(type, 'i'));
    } catch (error) {
      if (testInfo) {
        const diagnostics = await this.window.evaluate(() => {
          const options = Array.from(document.querySelectorAll<HTMLElement>('.ant-select-item-option'))
            .map((el) => ({
              text: (el.textContent || '').trim(),
              visible: (() => {
                const r = el.getBoundingClientRect();
                return r.width > 0 && r.height > 0;
              })(),
              selected: el.getAttribute('aria-selected'),
            }))
            .filter(Boolean);
          const active = document.activeElement as HTMLElement | null;
          const select = document.querySelector('[data-testid="advanced-style-background-type"]') as HTMLElement | null;
          const dropdowns = Array.from(document.querySelectorAll<HTMLElement>('.ant-select-dropdown')).map((el) => {
            const r = el.getBoundingClientRect();
            return {
              classes: el.className,
              visible: r.width > 0 && r.height > 0,
              ariaHidden: el.getAttribute('aria-hidden'),
            };
          });
          return {
            options,
            activeElement: active ? {
              tag: active.tagName,
              className: active.className,
              role: active.getAttribute('role'),
              testId: active.getAttribute('data-testid'),
            } : null,
            selectText: select?.innerText || '',
            dropdowns,
          };
        });
        await attachDebugJson(testInfo, 'background-type-select-diagnostics.json', diagnostics);
      }
      throw error;
    }
  }

  async setImageUrl(url: string): Promise<void> {
    const input = this.window.getByTestId('background-image-url-input');
    await expect(input).toBeVisible();
    await input.fill(url);
  }

  async setImagePosition(label: string, testInfo?: TestInfo): Promise<void> {
    await this.selectDropdownValue('background-image-position-select', label, testInfo, 'background-image-position-select-diagnostics.json');
  }

  async setImageSize(label: string, testInfo?: TestInfo): Promise<void> {
    await this.selectDropdownValue('background-image-size-select', label, testInfo, 'background-image-size-select-diagnostics.json');
  }

  async setImageRepeat(label: string, testInfo?: TestInfo): Promise<void> {
    await this.selectDropdownValue('background-image-repeat-select', label, testInfo, 'background-image-repeat-select-diagnostics.json');
  }

  async setNumericInput(testId: string, value: number): Promise<void> {
    const input = this.window.getByTestId(testId);
    await expect(input).toBeVisible();
    await input.fill(String(value));
    await input.blur();
  }

}

export default BackgroundCustomizerDSL;
