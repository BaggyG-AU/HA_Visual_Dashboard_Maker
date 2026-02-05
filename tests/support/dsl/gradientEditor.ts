import { ElectronApplication, Locator, Page, TestInfo, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'node:path';
import { ColorPickerDSL } from './colorPicker';

/**
 * Gradient Editor DSL
 *
 * Minimal helpers for interacting with the GradientEditor popover inside the PropertiesPanel.
 * Uses data-testid hooks added to the Advanced Styling tab.
 */
export class GradientEditorDSL {
  private baseTestId: string;
  private colorPicker: ColorPickerDSL;
  constructor(private window: Page, private app?: ElectronApplication, baseTestId = 'advanced-style-gradient-input') {
    this.baseTestId = baseTestId;
    this.colorPicker = new ColorPickerDSL(window);
  }

  getGradientInput(): Locator {
    return this.window.getByTestId(this.baseTestId);
  }

  async openGradientPopover(): Promise<void> {
    const editor = this.window.getByTestId(`${this.baseTestId}-editor`);
    const alreadyOpen = await editor.isVisible().catch(() => false);
    if (alreadyOpen) return;

    const swatch = this.window.getByTestId(`${this.baseTestId}-swatch`);
    await expect(swatch).toBeVisible();
    await swatch.click();
    // Wait for editor container rendered in body
    await expect(editor).toBeVisible({ timeout: 5000 });
  }

  async openGradientPopoverWithKeyboard(): Promise<void> {
    const editor = this.window.getByTestId(`${this.baseTestId}-editor`);
    const alreadyOpen = await editor.isVisible().catch(() => false);
    if (alreadyOpen) return;
    const swatch = this.window.getByTestId(`${this.baseTestId}-swatch`);
    await expect(swatch).toBeVisible();
    await swatch.focus();
    await expect(swatch).toBeFocused();
    await this.window.keyboard.press('Enter');
    await expect(editor).toBeVisible({ timeout: 5000 });
  }

  private get editorTestId(): string {
    return `${this.baseTestId}-editor`;
  }

  private getAngleInput(): Locator {
    return this.window.getByTestId(`${this.editorTestId}-angle-input`).locator('input');
  }

  private async getVisibleStopColorPickers(): Promise<string[]> {
    return await this.window.evaluate((editorTestId) => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>(`[data-testid^="${editorTestId}-stop-color-"][data-testid$="-picker"]`));
      const isVisible = (el: HTMLElement) => {
        const box = el.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && getComputedStyle(el).visibility !== 'hidden';
      };
      return nodes.filter(isVisible).map((node) => node.getAttribute('data-testid') || '').filter(Boolean);
    }, this.editorTestId);
  }

  private async attachPresetDiagnostics(
    testInfo: TestInfo | undefined,
    diagnostics: Record<string, unknown>,
    label = 'gradient-preset-diagnostics.json'
  ): Promise<void> {
    const body = JSON.stringify(diagnostics, null, 2);
    if (testInfo?.attach) {
      await testInfo.attach(label, { body: Buffer.from(body), contentType: 'application/json' });
    }
    try {
      const outDir = path.join(process.cwd(), 'test-results', 'diagnostics');
      await mkdir(outDir, { recursive: true });
      await writeFile(path.join(outDir, label), body, 'utf-8');
      await writeFile(path.join(outDir, label.replace(/\\.json$/i, `-${Date.now()}.json`)), body, 'utf-8');
    } catch {
      // best-effort only
    }
    // eslint-disable-next-line no-console
    console.log('[gradient preset diagnostics]', body);
  }

  private async closeStopColorPopovers(testInfo?: TestInfo): Promise<void> {
    const visiblePickers = await this.getVisibleStopColorPickers();
    if (visiblePickers.length === 0) return;

    await this.window.keyboard.press('Escape').catch(() => undefined);
    await this.window.click('body', { position: { x: 10, y: 10 } });

    try {
      await this.window.waitForFunction(
        (editorTestId) => {
          const nodes = Array.from(document.querySelectorAll<HTMLElement>(`[data-testid^="${editorTestId}-stop-color-"][data-testid$="-picker"]`));
          const isVisible = (el: HTMLElement) => {
            const box = el.getBoundingClientRect();
            return box.width > 0 && box.height > 0 && getComputedStyle(el).visibility !== 'hidden';
          };
          return nodes.filter(isVisible).length === 0;
        },
        this.editorTestId,
        { timeout: 2000 }
      );
    } catch (error) {
      const diagnostics = await this.collectFocusDiagnostics();
      await this.attachPresetDiagnostics(testInfo, {
        reason: 'closeStopColorPopoversFailed',
        visiblePickerCount: visiblePickers.length,
        visiblePickers,
        ...diagnostics,
      });
      throw error;
    }
  }

  private getStopRows(): Locator {
    return this.window.getByTestId(`${this.editorTestId}-stops`).getByRole('option');
  }

  private async getStopIdByIndex(index: number): Promise<string> {
    const stopRow = this.getStopRows().nth(index);
    await expect(stopRow).toBeVisible();
    const testId = await stopRow.getAttribute('data-testid');
    if (!testId) {
      throw new Error(`Unable to resolve stop id for index ${index}`);
    }
    return testId.replace(`${this.editorTestId}-stop-`, '');
  }

  async toggleType(type: 'linear' | 'radial'): Promise<void> {
    await this.openGradientPopover();
    const clicked = await this.window.evaluate(({ editorTestId, nextType }) => {
      const inputs = Array.from(document.querySelectorAll<HTMLInputElement>(`[data-testid="${editorTestId}-type-${nextType}"]`));
      const isVisible = (el: HTMLElement | null) => {
        if (!el) return false;
        const box = el.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && getComputedStyle(el).visibility !== 'hidden';
      };
      for (const input of inputs) {
        const wrapper = input.closest('label') as HTMLElement | null;
        if (!wrapper || !isVisible(wrapper)) continue;
        wrapper.click();
        return true;
      }
      return false;
    }, { editorTestId: this.editorTestId, nextType: type });

    if (!clicked) {
      throw new Error(`Unable to click visible gradient type option: ${type}`);
    }
  }

  async expectType(type: 'linear' | 'radial'): Promise<void> {
    await this.openGradientPopover();
    await expect.poll(async () => {
      return await this.window.evaluate(({ editorTestId, expectedType }) => {
        const inputs = Array.from(document.querySelectorAll<HTMLInputElement>(`[data-testid="${editorTestId}-type-${expectedType}"]`));
        const isVisible = (el: HTMLElement | null) => {
          if (!el) return false;
          const box = el.getBoundingClientRect();
          return box.width > 0 && box.height > 0 && getComputedStyle(el).visibility !== 'hidden';
        };
        for (const input of inputs) {
          const wrapper = input.closest('label') as HTMLElement | null;
          if (!wrapper || !isVisible(wrapper)) continue;
          return wrapper.classList.contains('ant-radio-button-wrapper-checked');
        }
        return false;
      }, { editorTestId: this.editorTestId, expectedType: type });
    }, { timeout: 5000 }).toBe(true);
  }

  async focusAngleInput(): Promise<void> {
    await this.openGradientPopover();
    const input = this.getAngleInput();
    await expect(input).toBeVisible();
    await input.focus();
    await expect(input).toBeFocused();
  }

  async pressArrowOnAngle(key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown', shift = false): Promise<void> {
    await this.focusAngleInput();
    if (shift) {
      await this.window.keyboard.down('Shift');
    }
    await this.window.keyboard.press(key);
    if (shift) {
      await this.window.keyboard.up('Shift');
    }
  }

  async pressTab(times = 1): Promise<void> {
    for (let i = 0; i < times; i += 1) {
      await this.window.keyboard.press('Tab');
    }
  }

  async pressEnter(): Promise<void> {
    await this.window.keyboard.press('Enter');
  }

  async pressDelete(): Promise<void> {
    await this.window.keyboard.press('Delete');
  }

  async pressArrowKey(key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown'): Promise<void> {
    await this.window.keyboard.press(key);
  }

  async addStop(): Promise<void> {
    await this.openGradientPopover();
    const button = this.window.getByTestId(`${this.editorTestId}-add-stop`);
    await expect(button).toBeVisible();
    await button.click();
  }

  async removeStopByIndex(index: number): Promise<void> {
    await this.openGradientPopover();
    const stopId = await this.getStopIdByIndex(index);
    const button = this.window.getByTestId(`${this.editorTestId}-remove-stop-${stopId}`);
    await expect(button).toBeVisible();
    await button.click();
  }

  async focusStopByIndex(index: number): Promise<void> {
    await this.openGradientPopover();
    const stopId = await this.getStopIdByIndex(index);
    const row = this.window.getByTestId(`${this.editorTestId}-stop-${stopId}`);
    await row.focus();
    await expect(row).toBeFocused();
  }

  async adjustStopPositionByIndex(index: number, position: number): Promise<void> {
    await this.openGradientPopover();
    const stopId = await this.getStopIdByIndex(index);
    const input = this.window.getByTestId(`${this.editorTestId}-stop-input-${stopId}`).locator('input');
    await expect(input).toBeVisible();
    await input.fill(String(position));
    await input.press('Enter');
  }

  async adjustStopPositionWithArrow(index: number, key: 'ArrowLeft' | 'ArrowRight', shift = false): Promise<void> {
    await this.focusStopByIndex(index);
    if (shift) {
      await this.window.keyboard.down('Shift');
    }
    await this.window.keyboard.press(key);
    if (shift) {
      await this.window.keyboard.up('Shift');
    }
  }

  async changeStopColorByIndex(index: number, color: string): Promise<void> {
    await this.openGradientPopover();
    const stopId = await this.getStopIdByIndex(index);
    const testId = `${this.editorTestId}-stop-color-${stopId}`;
    await this.colorPicker.openPopover(testId);
    await this.colorPicker.setColorInput(color, testId);
    await this.colorPicker.closePopover(testId);
  }

  async setRadialPosition(position: 'center' | 'top' | 'bottom' | 'left' | 'right'): Promise<void> {
    await this.openGradientPopover();
    const toggle = this.window.getByTestId(`${this.editorTestId}-position-toggle`);
    await expect(toggle).toBeVisible();
    await toggle.getByRole('radio', { name: new RegExp(position, 'i') }).click();
  }

  async setAngle(angle: number): Promise<void> {
    await this.openGradientPopover();
    const input = this.getAngleInput();
    await expect(input).toBeVisible();
    await input.fill(String(angle));
    await input.press('Enter');
  }

  async savePreset(name: string, testInfo?: TestInfo): Promise<void> {
    await this.openGradientPopover();
    await this.attachPresetDiagnostics(testInfo, {
      action: 'savePreset',
      editorVisible: await this.window.getByTestId(this.editorTestId).isVisible().catch(() => false),
      visiblePickers: await this.getVisibleStopColorPickers().catch(() => []),
      activeElement: await this.window.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        return el ? { tag: el.tagName, testId: el.getAttribute('data-testid'), role: el.getAttribute('role') } : null;
      }).catch(() => null),
    }, 'gradient-save-preset-diagnostics.json');
    await this.closeStopColorPopovers(testInfo);
    const input = this.window.getByTestId(`${this.editorTestId}-preset-name`);
    await expect(input).toBeVisible();
    await input.fill(name);
    const button = this.window.getByTestId(`${this.editorTestId}-preset-save`);
    await expect(button).toBeEnabled();
    await button.click();

    // Wait for preset list + export button to reflect the new preset.
    const userPresetCards = this.window.locator(`[data-testid^="${this.editorTestId}-user-preset-"]`);
    await expect(userPresetCards.first()).toBeVisible({ timeout: 5000 });
    await expect(this.window.locator(`[data-testid^="${this.editorTestId}-user-preset-"]`, { hasText: name }).first()).toBeVisible({ timeout: 5000 });
    await expect(this.window.getByTestId(`${this.editorTestId}-preset-export`)).toBeEnabled({ timeout: 5000 });
  }

  async deleteUserPresetByIndex(index: number, testInfo?: TestInfo): Promise<void> {
    await this.openGradientPopover();
    await this.attachPresetDiagnostics(testInfo, {
      action: 'deleteUserPresetByIndex',
      index,
      editorVisible: await this.window.getByTestId(this.editorTestId).isVisible().catch(() => false),
      visiblePickers: await this.getVisibleStopColorPickers().catch(() => []),
    }, 'gradient-delete-preset-diagnostics.json');
    await this.closeStopColorPopovers(testInfo);
    const preset = this.getUserPresetCards().nth(index);
    await expect(preset).toBeVisible();
    const testId = await preset.getAttribute('data-testid');
    if (!testId) throw new Error('Unable to resolve preset id.');
    const presetId = testId.replace(`${this.editorTestId}-user-preset-`, '');
    const deleteButton = this.window.getByTestId(`${this.editorTestId}-user-preset-delete-${presetId}`);
    await deleteButton.click();
  }

  async applyUserPresetByIndex(index: number, testInfo?: TestInfo): Promise<void> {
    await this.openGradientPopover();
    await this.closeStopColorPopovers(testInfo);
    const preset = this.getUserPresetCards().nth(index);
    await expect(preset).toBeVisible();
    await preset.click();
  }

  private getUserPresetCards(): Locator {
    return this.window.locator(
      `[data-testid^="${this.editorTestId}-user-preset-"]:not([data-testid^="${this.editorTestId}-user-preset-delete-"])`
    );
  }

  async expectUserPresetCount(count: number): Promise<void> {
    await this.openGradientPopover();
    const presets = this.getUserPresetCards();
    await expect(presets).toHaveCount(count);
  }

  async importPresets(filePath: string, testInfo?: TestInfo): Promise<void> {
    await this.openGradientPopover();
    const beforeImportCount = await this.getUserPresetCards().count().catch(() => 0);
    await this.attachPresetDiagnostics(testInfo, {
      action: 'importPresets',
      filePath,
      editorVisible: await this.window.getByTestId(this.editorTestId).isVisible().catch(() => false),
      visiblePickers: await this.getVisibleStopColorPickers().catch(() => []),
    }, 'gradient-import-presets-diagnostics.json');
    await this.closeStopColorPopovers(testInfo);
    try {
      if (this.app) {
        await this.app.evaluate(({ ipcMain }, data) => {
          ipcMain.removeHandler('dialog:openFile');
          ipcMain.handle('dialog:openFile', () => ({
            canceled: false,
            filePath: data.filePath,
          }));
        }, { filePath });

        await this.window.getByTestId(`${this.editorTestId}-preset-import`).click();
        return;
      }

      const fileInput = this.window.getByTestId(`${this.editorTestId}-preset-file-input`);
      const inputExists = (await fileInput.count()) > 0;
      if (inputExists) {
        await fileInput.setInputFiles(filePath);
        await expect
          .poll(async () => await this.getUserPresetCards().count(), { timeout: 5000 })
          .toBeGreaterThanOrEqual(beforeImportCount);
        return;
      }
      const [chooser] = await Promise.all([
        this.window.waitForEvent('filechooser'),
        this.window.getByTestId(`${this.editorTestId}-preset-import`).click(),
      ]);
      await chooser.setFiles(filePath);
      await expect
        .poll(async () => await this.getUserPresetCards().count(), { timeout: 5000 })
        .toBeGreaterThanOrEqual(beforeImportCount);
    } catch (error) {
      const fileInput = this.window.getByTestId(`${this.editorTestId}-preset-file-input`);
      const inputExists = this.app ? null : (await fileInput.count()) > 0;
      await this.attachPresetDiagnostics(testInfo, {
        method: this.app ? 'ipc-dialog' : (inputExists ? 'dom-input' : 'filechooser'),
        inputTestId: this.app ? null : `${this.editorTestId}-preset-file-input`,
        inputExists,
        editorVisible: await this.window.getByTestId(this.editorTestId).isVisible().catch(() => false),
        visiblePickers: await this.getVisibleStopColorPickers(),
      }, 'gradient-preset-import-error.json');
      throw error;
    }
  }

  async exportPresets(testInfo?: TestInfo): Promise<string> {
    await this.openGradientPopover();
    await this.attachPresetDiagnostics(testInfo, {
      action: 'exportPresets',
      editorVisible: await this.window.getByTestId(this.editorTestId).isVisible().catch(() => false),
      visiblePickers: await this.getVisibleStopColorPickers().catch(() => []),
      electronApi: await this.window.evaluate(() => {
        const api = (window as Partial<Window>).electronAPI as unknown as {
          saveFileDialog?: unknown;
          writeFile?: unknown;
        } | undefined;
        return {
          exists: Boolean(api),
          hasSaveFileDialog: typeof api?.saveFileDialog === 'function',
          hasWriteFile: typeof api?.writeFile === 'function',
        };
      }).catch(() => ({ exists: false, hasSaveFileDialog: false, hasWriteFile: false })),
      note: 'If a native save dialog appears (Electron), download events may not fire.',
    }, 'gradient-export-presets-diagnostics.json');
    await this.closeStopColorPopovers(testInfo);
    try {
      if (this.app && testInfo) {
        const exportPath = testInfo.outputPath('gradient-presets.json');

        await this.app.evaluate(({ ipcMain }, data) => {
          ipcMain.removeHandler('dialog:saveFile');
          ipcMain.handle('dialog:saveFile', () => ({
            canceled: false,
            filePath: data.exportPath,
          }));
        }, { exportPath });

        const ipcSanity = await this.window.evaluate(async () => {
          const api = (window as Window).electronAPI;
          if (!api?.saveFileDialog) {
            return { ok: false, reason: 'electronAPI missing methods' };
          }
          try {
            const dialogResult = await api.saveFileDialog('gradient-presets.json');
            return { ok: true, dialogResult };
          } catch (error) {
            return { ok: false, reason: (error as Error).message || String(error) };
          }
        });
        await this.attachPresetDiagnostics(testInfo, { ipcSanity }, 'gradient-export-presets-sanity.json');

        await this.window.getByTestId(`${this.editorTestId}-preset-export`).click();

        await expect.poll(async () => {
          try {
            await readFile(exportPath, 'utf-8');
            return true;
          } catch {
            return false;
          }
        }, { timeout: 5000 }).toBe(true);

        return await readFile(exportPath, 'utf-8');
      }

      const [download] = await Promise.all([
        this.window.waitForEvent('download', { timeout: 5000 }),
        this.window.getByTestId(`${this.editorTestId}-preset-export`).click(),
      ]);
      const path = await download.path();
      if (!path) throw new Error('Preset export download path unavailable.');
      return await readFile(path, 'utf-8');
    } catch (error) {
      await this.attachPresetDiagnostics(testInfo, {
        method: this.app && testInfo ? 'ipc-dialog' : 'download',
        error: (error as Error).message || String(error),
        editorVisible: await this.window.getByTestId(this.editorTestId).isVisible().catch(() => false),
        visiblePickers: await this.getVisibleStopColorPickers(),
      }, 'gradient-preset-export-error.json');
      throw error;
    }
  }

  async applyPreset(presetId: string, testInfo?: TestInfo): Promise<void> {
    await this.openGradientPopover();
    await this.closeStopColorPopovers(testInfo);
    const presetButton = this.window.getByTestId(`${this.editorTestId}-preset-${presetId}`);
    await presetButton.scrollIntoViewIfNeeded();
    await expect(presetButton).toBeVisible({ timeout: 5000 });
    await presetButton.click();
  }

  async expectPreview(): Promise<void> {
    await expect(this.window.getByTestId(`${this.baseTestId}-preview`)).toBeVisible();
  }

  async getCssOutput(): Promise<string> {
    await this.openGradientPopover();
    const output = this.window.getByTestId(`${this.editorTestId}-css-output`);
    await expect(output).toBeVisible();
    return (await output.textContent()) || '';
  }

  async expectCssContains(value: string): Promise<void> {
    const css = await this.getCssOutput();
    expect(css).toContain(value);
  }

  private async collectFocusDiagnostics(): Promise<Record<string, unknown>> {
    return await this.window.evaluate((editorTestId) => {
      const active = document.activeElement as HTMLElement | null;
      const stopRows = Array.from(document.querySelectorAll('[role="option"][data-testid]'));
      const editor = document.querySelector(`[data-testid="${editorTestId}"]`) as HTMLElement | null;
      const angleWrapper = document.querySelector(`[data-testid="${editorTestId}-angle-input"]`) as HTMLElement | null;
      const angleInput = angleWrapper?.querySelector('input') as HTMLInputElement | null;
      const pickerNodes = Array.from(document.querySelectorAll<HTMLElement>(`[data-testid^="${editorTestId}-stop-color-"][data-testid$="-picker"]`));
      const isVisible = (el?: HTMLElement | null) => {
        if (!el) return false;
        const box = el.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      };
      const tabbables = editor
        ? Array.from(
            editor.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          ).slice(0, 20)
        : [];
      return {
        activeElement: active ? {
          tag: active.tagName,
          testId: active.getAttribute('data-testid'),
          role: active.getAttribute('role'),
          tabIndex: active.getAttribute('tabindex'),
        } : null,
        stopRows: stopRows.map((node) => ({
          testId: node.getAttribute('data-testid'),
          ariaSelected: node.getAttribute('aria-selected'),
        })),
        editorVisible: isVisible(editor),
        angleInput: {
          exists: Boolean(angleInput),
          visible: isVisible(angleInput || null),
        },
        visiblePickers: pickerNodes.filter((node) => isVisible(node)).map((node) => node.getAttribute('data-testid')),
        tabbables: tabbables.map((el) => ({
          tag: el.tagName,
          testId: el.getAttribute('data-testid'),
          role: el.getAttribute('role'),
          tabIndex: el.getAttribute('tabindex'),
        })),
      };
    }, this.editorTestId);
  }

  private async getEditorTabbableCount(): Promise<number> {
    return await this.window.evaluate((editorTestId) => {
      const editor = document.querySelector(`[data-testid="${editorTestId}"]`) as HTMLElement | null;
      if (!editor) return 0;
      return editor.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ).length;
    }, this.editorTestId).catch(() => 0);
  }

  private async attachFocusDiagnostics(testInfo: TestInfo | undefined, diagnostics: Record<string, unknown>, label = 'gradient-focus-diagnostics.json'): Promise<void> {
    const body = JSON.stringify(diagnostics, null, 2);
    if (testInfo?.attach) {
      await testInfo.attach(label, { body: Buffer.from(body), contentType: 'application/json' });
    }
    try {
      const outDir = path.join(process.cwd(), 'test-results', 'diagnostics');
      await mkdir(outDir, { recursive: true });
      await writeFile(path.join(outDir, label), body, 'utf-8');
      await writeFile(path.join(outDir, label.replace(/\\.json$/i, `-${Date.now()}.json`)), body, 'utf-8');
    } catch {
      // best-effort only
    }
    // eslint-disable-next-line no-console
    console.log('[gradient focus diagnostics]', body);
  }

  async expectStopFocused(index: number, testInfo?: TestInfo): Promise<void> {
    const stopId = await this.getStopIdByIndex(index);
    const row = this.window.getByTestId(`${this.editorTestId}-stop-${stopId}`);
    try {
      await expect(row).toBeFocused();
    } catch (error) {
      const diagnostics = await this.collectFocusDiagnostics();
      await this.attachFocusDiagnostics(testInfo, diagnostics);
      throw error;
    }
  }

  async tabToStop(index: number, maxTabs = 25, testInfo?: TestInfo): Promise<void> {
    const stopId = await this.getStopIdByIndex(index);
    const row = this.window.getByTestId(`${this.editorTestId}-stop-${stopId}`);
    for (let i = 0; i < maxTabs; i += 1) {
      const isFocused = await row.evaluate((el) => document.activeElement === el);
      if (isFocused) return;
      await this.window.keyboard.press('Tab');
    }
    const diagnostics = await this.collectFocusDiagnostics();
    await this.attachFocusDiagnostics(testInfo, diagnostics, 'gradient-tab-diagnostics.json');
    throw new Error(`Unable to focus stop ${index} within ${maxTabs} Tab presses.`);
  }

  async tabToAngleInput(maxTabs = 20, testInfo?: TestInfo): Promise<void> {
    await this.openGradientPopoverWithKeyboard();
    await this.closeStopColorPopovers(testInfo);
    const input = this.getAngleInput();
    try {
      await expect(input).toBeVisible({ timeout: 5000 });
    } catch (error) {
      const diagnostics = await this.collectFocusDiagnostics();
      await this.attachFocusDiagnostics(testInfo, diagnostics, 'gradient-angle-input-visible-diagnostics.json');
      throw error;
    }

    const isFocused = async () => input.evaluate((el) => document.activeElement === el);

    const tabbableCount = await this.getEditorTabbableCount();
    const budget = Math.max(maxTabs, tabbableCount + 5);

    // Angle is usually earlier in the tab order than stops; try reverse traversal first to avoid tabbing out of the editor.
    for (let i = 0; i < budget; i += 1) {
      try {
        if (await isFocused()) return;
      } catch {
        break;
      }
      await this.window.keyboard.down('Shift');
      await this.window.keyboard.press('Tab');
      await this.window.keyboard.up('Shift');
      await this.closeStopColorPopovers(testInfo);
    }

    for (let i = 0; i < budget; i += 1) {
      try {
        if (await isFocused()) return;
      } catch {
        break;
      }
      await this.window.keyboard.press('Tab');
      await this.closeStopColorPopovers(testInfo);
    }

    await this.window.keyboard.press('Escape').catch(() => undefined);

    const diagnostics = await this.collectFocusDiagnostics();
    await this.attachFocusDiagnostics(testInfo, diagnostics, 'gradient-angle-focus-diagnostics.json');
    throw new Error(`Unable to focus angle input within ${budget} Tab presses.`);
  }
}

export default GradientEditorDSL;
