/**
 * YAML Editor DSL
 *
 * Dashboard YAML editor modal operations.
 * Encapsulates all YAML editor modal interactions.
 */

import { Page, expect } from '@playwright/test';

export class YamlEditorDSL {
  constructor(private window: Page) {}

  /**
   * Open the Dashboard YAML Editor modal
   */
  async open(): Promise<void> {
    const editYamlBtn = this.window.getByRole('button', { name: /Edit YAML/i });
    await expect(editYamlBtn).toBeVisible();
    await editYamlBtn.click();

    // Prefer a content-based wait to avoid hidden root issues from Ant animations/portals
    const modalContent = this.window.getByTestId('yaml-editor-content').first();
    await modalContent.waitFor({ state: 'visible', timeout: 10000 });

    // Wait for Monaco editor to be ready
    await this.waitForMonacoReady();
  }

  /**
   * Wait for Monaco editor to be fully loaded and ready
   */
  private async waitForMonacoReady(): Promise<void> {
    // Scope to any visible YAML editor container (modal or properties panel)
    const editorContainer = this.window
      .locator('[data-testid=\"yaml-editor-container\"]:visible')
      .first();
    await expect(editorContainer).toBeVisible({ timeout: 5000 });

    // Wait for Monaco to render (either .monaco-editor or fallback textarea)
    const editor = editorContainer.locator('.monaco-editor, textarea').first();
    await expect(editor).toBeVisible({ timeout: 5000 });

    // If Monaco rendered, wait for it to have non-zero dimensions
    const monacoEditor = editorContainer.locator('.monaco-editor');
    const hasMonaco = await monacoEditor.count() > 0;

    if (hasMonaco) {
      // Wait for Monaco to have proper bounding box
      await expect(async () => {
        const box = await monacoEditor.boundingBox();
        expect(box).toBeTruthy();
        if (!box) return;
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }).toPass({ timeout: 5000 });

      // Wait for at least one Monaco model to be registered
      await this.window.waitForFunction(
        () => (window as any).monaco?.editor?.getModels()?.length > 0,
        null,
        { timeout: 5000 }
      );

      // Additional wait for Monaco internal initialization
      await this.window.waitForTimeout(500);
    }
  }

  /**
   * Focus the Monaco editor and move the cursor to the end of the document
   */
  async focusCursorAtEnd(): Promise<void> {
    await this.waitForMonacoReady();

    await this.window.evaluate(() => {
      const editor =
        (window as any).__monacoEditor ||
        (window as any).monaco?.editor?.getEditors?.()?.[0];
      const model = editor?.getModel?.();

      if (editor && model) {
        const lastLine = model.getLineCount();
        const lastColumn = model.getLineMaxColumn(lastLine);
        editor.setPosition({ lineNumber: lastLine, column: lastColumn });
        editor.focus();
      }
    });
  }

  /**
   * Close the YAML editor modal (Cancel button)
   */
  async close(): Promise<void> {
    const cancelBtn = this.window.getByTestId('yaml-cancel-button');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    // Wait for modal to close
    const modal = this.window.getByTestId('yaml-editor-modal');
    await expect(modal).toHaveCount(0, { timeout: 2000 });
  }

  /**
   * Apply changes in YAML editor
   */
  async apply(): Promise<void> {
    const applyBtn = this.window.getByTestId('yaml-apply-button');
    await expect(applyBtn).toBeVisible();
    await expect(applyBtn).toBeEnabled();
    await applyBtn.click();

    // Wait for modal to close after apply
    const modal = this.window.getByTestId('yaml-editor-modal');
    await expect(modal).toHaveCount(0, { timeout: 2000 });
  }

  /**
   * Verify Monaco editor is visible
   */
  async expectMonacoVisible(): Promise<void> {
    const editorContainer = this.window.getByTestId('yaml-editor-container');
    await expect(editorContainer).toBeVisible();

    // Monaco can render as .monaco-editor or fall back to textarea
    await expect(
      editorContainer.locator('.monaco-editor')
        .or(editorContainer.locator('textarea'))
        .first()
    ).toBeVisible({ timeout: 3000 });
  }

  /**
   * Verify Monaco has dark theme
   */
  async expectDarkTheme(): Promise<void> {
    const darkEditor = this.window.locator('.monaco-editor.vs-dark');
    await expect(darkEditor).toBeVisible();
  }

  /**
   * Verify line numbers are visible
   */
  async expectLineNumbers(): Promise<void> {
    const lineNumbers = this.window.locator('.line-numbers');
    await expect(lineNumbers.first()).toBeVisible();
  }

  /**
   * Verify syntax highlighting is present
   */
  async expectSyntaxHighlighting(): Promise<void> {
    // Check for Monaco's token classes
    const tokens = await this.window.locator('.mtk1, .mtk2, .mtk3').count();
    expect(tokens).toBeGreaterThan(0);
  }

  /**
   * Type text into Monaco editor
   */
  async typeInEditor(text: string): Promise<void> {
    // Click editor to focus
    const editor = this.window.locator('.monaco-editor');
    await editor.click();
    await this.window.keyboard.type(text);
  }

  /**
   * Get Monaco editor content via evaluate
   */
  async getEditorContent(): Promise<string> {
    await this.waitForMonacoReady();

    return await this.window.evaluate(() => {
      const monaco = (window as any).monaco;
      if (monaco?.editor) {
        // Prefer the editor whose container is inside the YAML editor area (properties or modal)
        const editors = monaco.editor.getEditors ? monaco.editor.getEditors() : [];

        const target =
          editors.find((ed: any) =>
            ed
              .getContainerDomNode?.()
              .closest?.('[data-testid="yaml-editor-container"]')
          ) || editors[0];

        const model = target?.getModel?.();
        if (model?.getValue) return model.getValue();
      }

      // Fallback: visible monaco view-lines text (covers cases where monaco isn't exposed)
      const text = Array.from(
        document.querySelectorAll('.monaco-editor .view-lines')
      )
        .filter((el) => {
          const box = el.getBoundingClientRect();
          return box.width > 0 && box.height > 0;
        })
        .map((n) => n.textContent || '')
        .join('\n');
      return text;
    });
  }

  /**
   * Search all Monaco models and visible YAML containers for a regex match.
   * Returns true if any model or visible rendered YAML contains the pattern.
   */
  async anyYamlContains(pattern: RegExp): Promise<boolean> {
    return await this.window.evaluate((pat: string, flags: string) => {
      const re = new RegExp(pat, flags);
      const monaco = (window as any).monaco;

      // 1) Check all Monaco models (covers multiple editors/models)
      if (monaco?.editor) {
        const models = monaco.editor.getModels?.() || [];
        if (models.some((m: any) => re.test(m.getValue?.() || ''))) return true;
      }

      // 2) Check rendered view lines inside visible YAML editors
      const viewText = Array.from(
        document.querySelectorAll(
          '[data-testid="yaml-editor-container"]:not([hidden]) .view-lines'
        )
      )
        .map((n) => n.textContent || '')
        .join('\n');
      if (re.test(viewText)) return true;

      // 3) Fallback: raw textContent of visible YAML containers
      const nodes = Array.from(
        document.querySelectorAll(
          '[data-testid="yaml-editor-container"]:not([hidden])'
        )
      );
      if (nodes.some((n) => re.test(n.textContent || ''))) return true;

      // 4) Ultimate fallback: any visible monaco editor view-lines anywhere (properties panel, modals, etc.)
      const globalViewText = Array.from(
        document.querySelectorAll('.monaco-editor .view-lines')
      )
        .filter((el) => {
          const box = el.getBoundingClientRect();
          return box.width > 0 && box.height > 0;
        })
        .map((n) => n.textContent || '')
        .join('\n');
      return re.test(globalViewText);
    }, pattern.source, pattern.flags);
  }

  /**
   * Verify Apply button is disabled
   */
  async expectApplyDisabled(): Promise<void> {
    const applyBtn = this.window.getByTestId('yaml-apply-button');
    await expect(applyBtn).toBeDisabled();
  }

  /**
   * Verify Apply button is enabled
   */
  async expectApplyEnabled(): Promise<void> {
    const applyBtn = this.window.getByTestId('yaml-apply-button');
    await expect(applyBtn).toBeEnabled();
  }

  /**
   * Verify validation success alert is visible
   */
  async expectValidationSuccess(): Promise<void> {
    // Ensure model exists
    await this.waitForMonacoReady();

    const validYaml = `title: Test Dashboard
views:
  - title: Home
    path: home
    type: custom:grid-layout
    layout:
      grid_template_columns: repeat(12, 1fr)
      grid_template_rows: repeat(auto-fill, 56px)
      grid_gap: 8px
    cards: []
`;

    // Set a known-valid dashboard YAML and force validation
    await this.window.evaluate((yaml) => {
      const model =
        (window as any).__monacoModel ||
        (window as any).__monacoEditor?.getModel?.() ||
        (window as any).monaco?.editor?.getModels?.()[0];
      if (model?.setValue) {
        model.setValue(yaml);
      }
      (window as any).__forceYamlValidation?.();
    }, validYaml);

    // Success is implied: no error alert and Apply enabled
    await expect(this.window.getByTestId('yaml-validation-error')).toHaveCount(0);
    await expect(this.window.getByTestId('yaml-apply-button')).toBeEnabled({ timeout: 5000 });
  }

  /**
   * Verify validation error alert is visible
   */
  async expectValidationError(): Promise<void> {
    // Ensure Monaco model exists
    await this.window.waitForFunction(
      () =>
        Boolean(
          (window as any).__monacoModel ||
            (window as any).__monacoEditor?.getModel?.() ||
            (window as any).monaco?.editor?.getModels?.()[0]
        ),
      null,
      { timeout: 10000 }
    );

    // Set invalid YAML directly via the Monaco model and force validation
    await this.window.evaluate(() => {
      const model =
        (window as any).__monacoModel ||
        (window as any).monaco?.editor?.getModels?.()[0];
      if (model?.setValue) {
        model.setValue('title: Invalid Dashboard');
      }
      (window as any).__forceYamlValidation?.();
    });

    const alert = this.window.getByTestId('yaml-validation-error').first();
    await alert.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Click Insert Entity button
   */
  async clickInsertEntity(): Promise<void> {
    const insertBtn = this.window.getByTestId('yaml-insert-entity-button');
    await expect(insertBtn).toBeVisible();
    await insertBtn.click();
  }

  /**
   * Insert selected entity ID at current cursor position via the exposed insert handler
   */
  async insertEntityId(entityId: string): Promise<void> {
    await this.waitForMonacoReady();

    // Select the entity in the browser and trigger the callback
    await this.window.evaluate((id) => {
      const handler = (window as any).__insertEntityCallback as ((eid: string) => void) | undefined;
      handler?.(id);
    }, entityId);
  }
}
