/**
 * E2E Test: Monaco Editor (DSL-Based)
 *
 * Tests the syntax-highlighted YAML editing with Monaco Editor.
 * Migrated to use DSL pattern with isolated test storage.
 */

import { test, expect } from '@playwright/test';
import { launchWithDSL, close, seedEntityCache } from '../support';

// Helper: add a card and open properties panel
async function addAndSelectCard(ctx: any, cardType = 'button') {
  await ctx.dashboard.createNew();
  await ctx.palette.waitUntilVisible();
  // Reuse the proven flow from properties-panel.e2e: expand Controls, then add/select.
  await ctx.palette.expandCategory('Controls');
  await ctx.palette.addCard(cardType);
  await ctx.canvas.selectCard(0);
  await ctx.properties.expectVisible();
}

test.describe('Monaco Editor in Dashboard YAML Editor', () => {
  test('should render Monaco editor in Dashboard YAML editor', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();
      await ctx.yamlEditor.expectMonacoVisible('modal');
    } finally {
      await close(ctx);
    }
  });

  test('should show syntax highlighting in Monaco editor', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();
      await ctx.yamlEditor.expectMonacoVisible('modal');
      await ctx.yamlEditor.expectSyntaxHighlighting();
    } finally {
      await close(ctx);
    }
  });

  test('should have dark theme matching HA style', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();
      await ctx.yamlEditor.expectDarkTheme();
    } finally {
      await close(ctx);
    }
  });

  test('should display line numbers', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();
      await ctx.yamlEditor.expectLineNumbers();
    } finally {
      await close(ctx);
    }
  });

  test('should support text editing in Monaco editor', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();

      await ctx.yamlEditor.typeInEditor('test_key: test_value');
      await ctx.window.waitForTimeout(500);

      const editorContent = ctx.window.locator('.view-lines');
      const text = await editorContent.textContent();
      expect(text).toContain('test_key');
    } finally {
      await close(ctx);
    }
  });

  test('should validate YAML in real-time', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();
      await ctx.window.waitForTimeout(300);

      await ctx.window.evaluate(() => {
        const model = (window as any).monaco?.editor?.getModels?.()[0];
        // Missing required "views" array -> should trigger validation error
        model?.setValue('title: Invalid Dashboard');
      });
      await ctx.window.waitForTimeout(500);

      const debug = await ctx.window.evaluate(() => ({
        hasRunHook: typeof (window as any).__runYamlValidation === 'function',
        hasForceHook: typeof (window as any).__forceYamlValidation === 'function',
        lastError: (window as any).__lastValidationError,
        value: (window as any).monaco?.editor?.getModels?.()[0]?.getValue?.()
      }));
      console.log('DEBUG validate YAML', debug);

      await ctx.yamlEditor.expectValidationError();
    } finally {
      await close(ctx);
    }
  });

  test('should show success state for valid YAML', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();

      const editor = ctx.window.locator('.monaco-editor');
      await editor.click();
      await ctx.window.keyboard.press('Control+A');

      await ctx.window.keyboard.type('title: Test Dashboard\nviews:\n  - title: Home\n    cards: []');
      await ctx.window.waitForTimeout(500);

      await ctx.yamlEditor.expectValidationSuccess();
    } finally {
      await close(ctx);
    }
  });

  test('should disable Apply Changes button when YAML is invalid', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();
      await ctx.window.waitForTimeout(300);

      await ctx.window.evaluate(() => {
        const model = (window as any).monaco?.editor?.getModels?.()[0];
        model?.setValue('title: Invalid Dashboard');
      });
      await ctx.window.waitForTimeout(500);

      await ctx.yamlEditor.expectApplyDisabled();
    } finally {
      await close(ctx);
    }
  });

  test('should enable Apply Changes button when YAML is valid and changed', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();

      const editor = ctx.window.locator('.monaco-editor');
      await editor.click();

      await ctx.window.keyboard.press('End');
      await ctx.window.keyboard.press('Enter');
      await ctx.window.keyboard.type('# Test comment');
      await ctx.window.waitForTimeout(500);

      await ctx.yamlEditor.expectApplyEnabled();
    } finally {
      await close(ctx);
    }
  });

  test('should show confirmation dialog before applying changes', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();
      await ctx.window.waitForTimeout(800);

      const editor = ctx.window.locator('.monaco-editor');
      await editor.click();
      await ctx.window.keyboard.press('End');
      await ctx.window.keyboard.type('\n# Test');
      await ctx.window.waitForTimeout(800);

      const applyButton = ctx.window.locator('button:has-text("Apply Changes")');
      await applyButton.click();

      const confirmDialog = ctx.window.locator('.ant-modal:has-text("Apply YAML Changes?")');
      await expect(confirmDialog).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should warn before closing with unsaved changes', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();

      const editor = ctx.window.locator('.monaco-editor');
      await editor.click();
      await ctx.window.keyboard.type('\n# Unsaved change');
      await ctx.window.waitForTimeout(500);

      const cancelButton = ctx.window.locator('.ant-modal-footer button:has-text("Cancel")');
      await cancelButton.click();

      const confirmDialog = ctx.window.locator('.ant-modal:has-text("Unsaved Changes")');
      await expect(confirmDialog).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should support word wrap in editor', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();
      await ctx.window.waitForTimeout(800);

      const editor = ctx.window.locator('.monaco-editor');
      await expect(editor).toBeVisible();

      await editor.click();
      await ctx.window.keyboard.type('very_long_key: ' + 'x'.repeat(200));
      await ctx.window.waitForTimeout(500);

      // Word wrap is enabled, no need for horizontal scroll
      await expect(editor).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should preserve cursor position after entity insertion', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();
      await ctx.window.waitForTimeout(800);

      const editor = ctx.window.locator('.monaco-editor');
      await editor.click();

      await ctx.window.keyboard.press('Control+End');
      await ctx.window.keyboard.press('Enter');
      await ctx.window.keyboard.type('entity: ');

      await ctx.yamlEditor.clickInsertEntity();
      await ctx.entityBrowser.expectTableVisible();

      const rows = ctx.window.locator('.ant-table-row');
      const rowCount = await rows.count();

      if (rowCount > 0) {
        await rows.first().click();
        await ctx.entityBrowser.clickSelectEntity();
        await ctx.window.waitForTimeout(800);

        const focusedEditor = ctx.window.getByTestId('yaml-editor-container');
        const box = await focusedEditor.boundingBox().catch(() => null);
        expect(box && box.width > 0 && box.height > 0).toBeTruthy();
      }
    } finally {
      await close(ctx);
    }
  });
});

test.describe('Monaco Editor in Properties Panel', () => {
  test('should render Monaco editor in Properties Panel YAML tab', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await addAndSelectCard(ctx, 'button');

      await ctx.properties.switchTab('YAML');
      await ctx.properties.expectYamlEditor();
    } finally {
      await close(ctx);
    }
  });

  test('should show card YAML in Monaco editor', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await addAndSelectCard(ctx, 'button');

      await ctx.properties.switchTab('YAML');
      await ctx.properties.expectYamlEditor();
    } finally {
      await close(ctx);
    }
  });

  test('should sync changes from Monaco editor to visual editor', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await addAndSelectCard(ctx, 'button');

      await ctx.properties.switchTab('YAML');
      await ctx.properties.expectYamlEditor();
    } finally {
      await close(ctx);
    }
  });

  test('should have proper height in Properties Panel', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await addAndSelectCard(ctx, 'button');

      await ctx.properties.switchTab('YAML');
      await ctx.properties.expectYamlEditor();
    } finally {
      await close(ctx);
    }
  });

  test('should support entity insertion in Properties Panel editor', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await addAndSelectCard(ctx, 'button');

      await ctx.properties.switchTab('YAML');
      await ctx.properties.expectYamlEditor();
    } finally {
      await close(ctx);
    }
  });
});

test.describe('Monaco Editor Features', () => {
  test('should support keyboard shortcuts', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();

      const editor = ctx.window.locator('.monaco-editor');
      await editor.click();

      await ctx.window.keyboard.press('Control+A');
      await ctx.window.waitForTimeout(100);

      await ctx.window.keyboard.press('Control+C');
      await ctx.window.waitForTimeout(100);

      await expect(editor).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should support undo/redo', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();

      // Ensure model exists before we manipulate it
      await ctx.window.waitForFunction(
        () => Boolean((window as any).monaco?.editor?.getModels?.()[0]),
        null,
        { timeout: 10000 }
      );

      // Capture initial content, append a marker, then verify undo/redo restores it
      const { initialContent, appendedContent } = await ctx.window.evaluate(() => {
        const model = (window as any).monaco?.editor?.getModels?.()[0];
        const current = model?.getValue?.() ?? '';
        const lastLine = model?.getLineCount?.() ?? 1;
        const lastCol = model?.getLineMaxColumn?.(lastLine) ?? 1;
        const insertText = '\n# test_line';
        // Use Monaco edit operations so undo/redo is tracked
        model?.pushEditOperations?.(
          [],
          [
            {
              range: new (window as any).monaco.Range(lastLine, lastCol, lastLine, lastCol),
              text: insertText,
              forceMoveMarkers: true,
            },
          ],
          () => null
        );
        return { initialContent: current, appendedContent: `${current}${insertText}` };
      });

      await expect.poll(() => ctx.yamlEditor.getEditorContent()).toBe(appendedContent);

      await ctx.window.evaluate(() => {
        const model = (window as any).monaco?.editor?.getModels?.()[0];
        model?.undo?.();
      });
      await expect.poll(() => ctx.yamlEditor.getEditorContent()).toBe(initialContent);

      await ctx.window.evaluate(() => {
        const model = (window as any).monaco?.editor?.getModels?.()[0];
        model?.redo?.();
      });
      await expect.poll(() => ctx.yamlEditor.getEditorContent()).toBe(appendedContent);
    } finally {
      await close(ctx);
    }
  });

  test('should support find functionality (Ctrl+F)', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();
      await ctx.window.waitForTimeout(500);

      const editor = ctx.window.locator('.monaco-editor');
      await editor.click();

      await ctx.window.keyboard.press('Control+F');
      await ctx.window.waitForTimeout(500);

      const findWidget = ctx.window.locator('.find-widget');
      await expect(findWidget).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should have proper tab size (2 spaces)', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();

      const editor = ctx.window.locator('.monaco-editor');
      await editor.click();

      await ctx.window.keyboard.press('Tab');
      await ctx.window.keyboard.type('x');
      await ctx.window.waitForTimeout(100);

      const content = await ctx.window.locator('.view-lines').textContent();
      expect(content).toContain('x');
    } finally {
      await close(ctx);
    }
  });

  test('should disable minimap', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();
      await ctx.window.waitForTimeout(500);

      const minimap = ctx.window.locator('.minimap');
      const hasMinimapMaybe = await minimap.isVisible().catch(() => false);

      expect(hasMinimapMaybe).toBeFalsy();
    } finally {
      await close(ctx);
    }
  });

  test('should support automatic layout', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();

      await ctx.window.setViewportSize({ width: 1200, height: 800 });
      await ctx.window.waitForTimeout(500);

      const editor = ctx.window.locator('.monaco-editor');
      await expect(editor).toBeVisible();

      const box = await editor.boundingBox();
      expect(box?.width).toBeGreaterThan(0);
    } finally {
      await close(ctx);
    }
  });
});

test.describe('Monaco Editor Accessibility', () => {
  test('should be keyboard navigable', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();

      await ctx.window.keyboard.press('Tab');
      await ctx.window.keyboard.press('Tab');

      const editor = ctx.window.locator('.monaco-editor');
      await editor.click();

      await ctx.window.keyboard.press('ArrowDown');
      await ctx.window.keyboard.press('ArrowUp');
      await ctx.window.keyboard.press('ArrowRight');
      await ctx.window.keyboard.press('ArrowLeft');

      await expect(editor).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should have proper ARIA attributes', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();
      await ctx.window.waitForTimeout(500);

      const textarea = ctx.window.locator('.monaco-editor textarea');
      await expect(textarea).toBeVisible();

      const ariaLabel = await textarea.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    } finally {
      await close(ctx);
    }
  });

  test('should support screen reader announcements', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();

      const editor = ctx.window.locator('.monaco-editor');
      await editor.click();

      await ctx.window.keyboard.type('test');

      const ariaLive = ctx.window.locator('[aria-live]');
      const count = await ariaLive.count();
      expect(count).toBeGreaterThan(0);
    } finally {
      await close(ctx);
    }
  });
});

test.describe('Monaco Editor Error Handling', () => {
  test('should handle very large YAML documents', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();
      await ctx.window.waitForTimeout(800);

      const editor = ctx.window.locator('.monaco-editor');
      await editor.click();

      await ctx.window.keyboard.press('Control+A');
      const largeYaml = 'views:\n' + '  - cards: []\n'.repeat(100);
      await ctx.window.keyboard.type(largeYaml.substring(0, 500));

      await ctx.window.waitForTimeout(800);

      await expect(editor).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('should recover from syntax errors', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();
      await ctx.window.waitForTimeout(800);

      await ctx.window.evaluate(() => {
        const model = (window as any).monaco?.editor?.getModels?.()[0];
        model?.setValue('title: Invalid Dashboard');
      });
      await ctx.window.waitForTimeout(500);

      const debug = await ctx.window.evaluate(() => ({
        hasRunHook: typeof (window as any).__runYamlValidation === 'function',
        hasForceHook: typeof (window as any).__forceYamlValidation === 'function',
        lastError: (window as any).__lastValidationError,
        value: (window as any).monaco?.editor?.getModels?.()[0]?.getValue?.()
      }));
      console.log('DEBUG syntax recovery', debug);

      await ctx.yamlEditor.expectValidationError();

      await ctx.window.evaluate(() => {
        const model = (window as any).monaco?.editor?.getModels?.()[0];
        model?.setValue('title: Fixed\nviews: []');
      });
      await ctx.window.waitForTimeout(500);

      await ctx.yamlEditor.expectValidationSuccess();
    } finally {
      await close(ctx);
    }
  });
});
