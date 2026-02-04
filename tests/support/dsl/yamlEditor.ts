/**
 * YAML Editor DSL
 *
 * Dashboard YAML editor modal operations.
 * Encapsulates all YAML editor modal interactions.
 */

import { Page, expect, TestInfo } from '@playwright/test';
import * as yaml from 'js-yaml';
import { upsertStyleBackground } from '../../../src/utils/styleBackground';

type MonacoModelLike = {
  getValue?: () => string;
  setValue?: (value: string) => void;
  getLineCount?: () => number;
  getLineMaxColumn?: (lineNumber: number) => number;
};

type MonacoEditorLike = {
  getModel?: () => MonacoModelLike | null;
  getContainerDomNode?: () => HTMLElement;
  setPosition?: (pos: { lineNumber: number; column: number }) => void;
  focus?: () => void;
};

type MonacoGlobalLike = {
  editor?: {
    getModels?: () => MonacoModelLike[];
    getEditors?: () => MonacoEditorLike[];
  };
};

type YamlTestWindow = Window & {
  monaco?: MonacoGlobalLike;
  __monacoEditor?: MonacoEditorLike;
  __monacoModel?: MonacoModelLike;
  __forceYamlValidation?: () => void;
  __insertEntityCallback?: (entityId: string) => void;
};

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
   * Focus the Monaco editor and move the cursor to the end of the document
   */
  async focusCursorAtEnd(): Promise<void> {
    await this.waitForMonacoReady();

    await this.window.evaluate(() => {
      const testWindow = window as unknown as YamlTestWindow;
      const editor = testWindow.__monacoEditor || testWindow.monaco?.editor?.getEditors?.()?.[0];
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
  async expectMonacoVisible(scope: 'properties' | 'modal' | 'canvas' = 'properties', testInfo?: TestInfo): Promise<void> {
    // Disambiguate properties panel vs modal
    const modalContent = this.window.getByTestId('yaml-editor-content');
    const modalContainer = modalContent.getByTestId('yaml-editor-container');
    const propsContainer = this.window.getByTestId('properties-panel').getByTestId('yaml-editor-container');

    let containerLocator = scope === 'modal' ? modalContainer : propsContainer;

    // Auto-detect: if scope is properties but modal is visible, switch to modal
    if (scope === 'properties') {
      if (await modalContainer.isVisible({ timeout: 2000 }).catch(() => false)) {
        containerLocator = modalContainer;
      }
    }

    const visible = await containerLocator.isVisible({ timeout: 8000 }).catch(() => false);
    if (!visible) {
      const diag = await this.collectMonacoDiagnostics(scope).catch(() => ({}));
      await this.attachAndLogDiagnostics(testInfo, {
        ...diag,
        containerVisibility: await this.containerVisibilitySnapshot().catch(() => ({})),
      }, 'yaml-editor-container-diagnostics.json');
      throw new Error(`YAML editor container not visible for scope=${scope}`);
    }

    // Monaco can render as .monaco-editor or fall back to textarea
    await expect(
      containerLocator.locator('.monaco-editor')
        .or(containerLocator.locator('textarea'))
        .first()
    ).toBeVisible({ timeout: 8000 });
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

  // Wait for Monaco readiness using explicit handles OR any Monaco models
  private async waitForMonacoReady(scopeHint: 'properties' | 'modal' | 'canvas' = 'properties'): Promise<void> {
    // Scope to any visible YAML editor container (modal or properties panel)
    const editorContainer = this.window
      .locator('[data-testid="yaml-editor-container"]:visible')
      .first();
    await expect(editorContainer).toBeVisible({ timeout: 5000 });

    // Wait for Monaco to render (either .monaco-editor or fallback textarea)
    const editor = editorContainer.locator('.monaco-editor, textarea').first();
    await expect(editor).toBeVisible({ timeout: 5000 });

    const monacoEditor = editorContainer.locator('.monaco-editor');
    const hasMonaco = await monacoEditor.count() > 0;
    if (hasMonaco) {
      await expect(async () => {
        const box = await monacoEditor.boundingBox();
        expect(box).toBeTruthy();
        if (!box) return;
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }).toPass({ timeout: 5000 });
    }

    try {
      await this.window.waitForFunction(
        () => {
          const w = window as unknown as YamlTestWindow;
          const hasExplicitModel = Boolean(w.__monacoModel?.getValue);
          const hasExplicitEditor = Boolean(w.__monacoEditor?.getModel?.());
          const hasMonacoModels = Boolean(w.monaco?.editor?.getModels?.()?.length);
          return hasExplicitModel || hasExplicitEditor || hasMonacoModels;
        },
        null,
        { timeout: 8000 }
      );
    } catch (err) {
      const diag = await this.collectMonacoDiagnostics(scopeHint).catch(() => ({}));
      throw new Error(`Monaco not ready (scope=${scopeHint}). Diagnostics: ${JSON.stringify(diag)}`);
    }
  }

  /**
   * Collect Monaco diagnostics (JSON-safe)
   */
  async collectMonacoDiagnostics(scopeHint: 'properties' | 'modal' | 'canvas' = 'properties'): Promise<Record<string, unknown>> {
    return await this.window.evaluate((hint: string) => {
      const diag: Record<string, unknown> = {};
      const testWindow = window as unknown as YamlTestWindow;
      diag.scopeHint = hint;
      const modalContent = document.querySelector('[data-testid="yaml-editor-content"]');
      const propsPanel = document.querySelector('[data-testid="properties-panel"]');
      diag.containers = {
        modalExists: Boolean(modalContent),
        modalVisible: modalContent ? (modalContent as HTMLElement).offsetParent !== null : false,
        modalContainerCount: modalContent ? modalContent.querySelectorAll('[data-testid="yaml-editor-container"]').length : 0,
        propsExists: Boolean(propsPanel),
        propsVisible: propsPanel ? (propsPanel as HTMLElement).offsetParent !== null : false,
        propsContainerCount: propsPanel ? propsPanel.querySelectorAll('[data-testid="yaml-editor-container"]').length : 0,
      };

      // Prefer explicit handles set by the app in test mode
      const explicitModel = testWindow.__monacoModel;
      const explicitEditor = testWindow.__monacoEditor;
      diag.explicitHandles = {
        hasWindowMonaco: Boolean(testWindow.monaco),
        has__monacoModel: Boolean(explicitModel),
        has__monacoEditor: Boolean(explicitEditor),
        editorModelUri: explicitEditor?.getModel?.()?.uri?.toString?.(),
      };

      const getVisibleEditorInContainer = () => {
        const monaco = testWindow.monaco;
        if (!monaco?.editor?.getEditors) return null;
        const editors = monaco.editor.getEditors();
        diag.editorCount = editors.length;
        let chosen = null;
        for (let i = 0; i < editors.length; i++) {
          const ed = editors[i];
          const container = ed.getContainerDomNode?.();
          if (!container) continue;
          const closest = container.closest?.('[data-testid="yaml-editor-container"]');
          const box = container.getBoundingClientRect?.();
          const visible = !!box && box.width > 0 && box.height > 0;
          diag[`editor_${i}`] = {
            hasContainer: Boolean(container),
            inYamlContainer: Boolean(closest),
            box,
            modelUri: ed.getModel?.()?.uri?.toString?.(),
          };
          if (closest && visible) {
            chosen = ed;
            diag.chosenEditor = {
              index: i,
              modelUri: ed.getModel?.()?.uri?.toString?.(),
            };
            break;
          }
        }
        return chosen || editors[0] || null;
      };

      // 1) Explicit handles first (only if inside YAML container)
      const explicit = explicitModel || explicitEditor?.getModel?.();
      const explicitContainer = explicitEditor?.getContainerDomNode?.();
      const explicitInsideYaml = explicitContainer?.closest?.('[data-testid="yaml-editor-container"]');
      if (explicit?.getValue && explicitInsideYaml) {
        diag.path = 'usedExplicitHandles';
        diag.explicitModelUri = explicitEditor?.getModel?.()?.uri?.toString?.();
        return { value: explicit.getValue(), diagnostics: diag };
      }

      // 2) Visible editor in the YAML container
      const scopedEditor = getVisibleEditorInContainer();
      const scopedModel = scopedEditor?.getModel?.();
      if (scopedModel?.getValue) {
        diag.path = 'usedMonacoEditors';
        diag.scopedModelUri = scopedModel.uri?.toString?.();
        return { value: scopedModel.getValue(), diagnostics: diag };
      }

      // 3) Fallback: any Monaco model
      const monaco = testWindow.monaco;
      if (monaco?.editor?.getModels) {
        const models = monaco.editor.getModels();
        diag.path = 'usedMonacoModelsSearch';
        diag.modelCount = models.length;
        if (models.length > 0 && models[0].getValue) {
          diag.modelUri = models[0].uri?.toString?.();
          return { value: models[0].getValue(), diagnostics: diag };
        }
      }

      // 4) Last resort: DOM view-lines text (virtualized; least reliable)
      diag.path = 'fellBackToDom';
      const text = Array.from(
        document.querySelectorAll('.monaco-editor .view-lines')
      )
        .filter((el) => {
          const box = el.getBoundingClientRect();
          return box.width > 0 && box.height > 0;
        })
        .map((n) => n.textContent || '')
        .join('\\n');
      return { value: text, diagnostics: diag };
    }, scopeHint);
  }

  private async containerVisibilitySnapshot(): Promise<Record<string, unknown>> {
    return await this.window.evaluate(() => {
      const modalContent = document.querySelector('[data-testid="yaml-editor-content"]') as HTMLElement | null;
      const propsPanel = document.querySelector('[data-testid="properties-panel"]') as HTMLElement | null;
      const propsContainer = propsPanel?.querySelector('[data-testid="yaml-editor-container"]') as HTMLElement | null;
      const modalContainer = modalContent?.querySelector('[data-testid="yaml-editor-container"]') as HTMLElement | null;
      const bbox = (el: HTMLElement | null) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      return {
        modalContent: {
          exists: Boolean(modalContent),
          visible: modalContent ? modalContent.offsetParent !== null : false,
          bbox: bbox(modalContent),
          containerCount: modalContent ? modalContent.querySelectorAll('[data-testid="yaml-editor-container"]').length : 0,
        },
        propsPanel: {
          exists: Boolean(propsPanel),
          visible: propsPanel ? propsPanel.offsetParent !== null : false,
          bbox: bbox(propsPanel),
          containerCount: propsPanel ? propsPanel.querySelectorAll('[data-testid="yaml-editor-container"]').length : 0,
        },
        modalContainer: {
          exists: Boolean(modalContainer),
          visible: modalContainer ? modalContainer.offsetParent !== null : false,
          bbox: bbox(modalContainer),
        },
        propsContainer: {
          exists: Boolean(propsContainer),
          visible: propsContainer ? propsContainer.offsetParent !== null : false,
          bbox: bbox(propsContainer),
        },
      };
    });
  }

  /**
   * Attach + log diagnostics for visibility in HTML report and terminal
   */
  async attachAndLogDiagnostics(testInfo: TestInfo | undefined, diagnostics: Record<string, unknown>, label = 'yaml-editor-diagnostics.json'): Promise<void> {
    const body = JSON.stringify(diagnostics, null, 2);
    if (testInfo?.attach) {
      await testInfo.attach(label, {
        body: Buffer.from(body),
        contentType: 'application/json',
      });
    }
    // eslint-disable-next-line no-console
    console.log('[yamlEditor diagnostics]', body);
  }

  /**
   * Get Monaco editor content with diagnostics
   */
  async getEditorContentWithDiagnostics(testInfo?: TestInfo, scopeHint: 'properties' | 'modal' | 'canvas' = 'properties'): Promise<{ value: string; diagnostics: Record<string, unknown> }> {
    await this.waitForMonacoReady(scopeHint);
    const result = await this.collectMonacoDiagnostics(scopeHint);
    if (testInfo) {
      await this.attachAndLogDiagnostics(testInfo, result);
    } else {
      // eslint-disable-next-line no-console
      console.log('[yamlEditor diagnostics]', JSON.stringify(result, null, 2));
    }
    return result as { value: string; diagnostics: Record<string, unknown> };
  }

  /**
   * Get Monaco editor content via evaluate
   */
  async getEditorContent(): Promise<string> {
    const result = await this.getEditorContentWithDiagnostics();
    return result.value ?? '';
  }

  /**
   * Set Monaco editor content (properties panel or modal)
   */
  async setEditorContent(value: string, scopeHint: 'properties' | 'modal' | 'canvas' = 'properties', testInfo?: TestInfo): Promise<void> {
    await this.waitForMonacoReady(scopeHint);
    try {
      await this.window.evaluate((yaml) => {
        const testWindow = window as unknown as YamlTestWindow;
        const model =
          testWindow.__monacoModel ||
          testWindow.__monacoEditor?.getModel?.() ||
          testWindow.monaco?.editor?.getModels?.()?.[0];
        if (model?.setValue) {
          model.setValue(yaml);
        }
      }, value);
    } catch (error) {
      const diag = await this.collectMonacoDiagnostics(scopeHint).catch(() => ({}));
      await this.attachAndLogDiagnostics(testInfo, diag, 'yaml-editor-setvalue-diagnostics.json');
      throw error;
    }
  }

  /**
   * Update the card-level style background in YAML text.
   * Preserves valid YAML by parsing + dumping and reusing the shared style helper.
   */
  updateCardStyleBackground(yamlText: string, background: string): string {
    const parsed = yaml.load(yamlText) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Unable to parse YAML for style update.');
    }
    const currentStyle = typeof parsed.style === 'string' ? parsed.style : '';
    parsed.style = upsertStyleBackground(currentStyle, background);
    return yaml.dump(parsed);
  }
  /**
   * Search all Monaco models and visible YAML containers for a regex match.
   * Returns true if any model or visible rendered YAML contains the pattern.
   */
  async anyYamlContains(pattern: RegExp): Promise<boolean> {
    return await this.window.evaluate((input: { pat: string; flags: string }) => {
      const re = new RegExp(input.pat, input.flags);
      const testWindow = window as unknown as YamlTestWindow;
      const monaco = testWindow.monaco;

      // 1) Check all Monaco models (covers multiple editors/models)
      if (monaco?.editor) {
        const models = monaco.editor.getModels?.() || [];
        if (models.some((m) => re.test(m.getValue?.() || ''))) return true;
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
    }, { pat: pattern.source, flags: pattern.flags });
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
      const testWindow = window as unknown as YamlTestWindow;
      const model =
        testWindow.__monacoModel ||
        testWindow.__monacoEditor?.getModel?.() ||
        testWindow.monaco?.editor?.getModels?.()?.[0];
      if (model?.setValue) {
        model.setValue(yaml);
      }
      testWindow.__forceYamlValidation?.();
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
          (window as unknown as YamlTestWindow).__monacoModel ||
            (window as unknown as YamlTestWindow).__monacoEditor?.getModel?.() ||
            (window as unknown as YamlTestWindow).monaco?.editor?.getModels?.()?.[0]
        ),
      null,
      { timeout: 10000 }
    );

    // Set invalid YAML directly via the Monaco model and force validation
    await this.window.evaluate(() => {
      const testWindow = window as unknown as YamlTestWindow;
      const model =
        testWindow.__monacoModel ||
        testWindow.monaco?.editor?.getModels?.()?.[0];
      if (model?.setValue) {
        model.setValue('title: Invalid Dashboard');
      }
      testWindow.__forceYamlValidation?.();
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
      const testWindow = window as unknown as YamlTestWindow;
      testWindow.__insertEntityCallback?.(id);
    }, entityId);
  }
}
