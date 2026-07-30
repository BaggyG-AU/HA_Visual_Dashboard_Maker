/**
 * Integration Test: inserting an entity id at the cursor (UAT card YAML-05)
 *
 * Round-1 YAML-05 failed with "the entity browser did not appear". The screenshot
 * showed the tester was in SPLIT VIEW, which had no entity-insert route at all —
 * `<SplitViewEditor>` was never passed `onOpenEntityBrowser`. Driving all four of
 * the card's Expected from the Edit YAML dialog then exposed a second, unreported
 * defect: Monaco reports a caret at (1,1) when the editor has NEVER been focused
 * (it does NOT return null), so `getSelection() ?? getFullModelRange()` inserted
 * the id at the very top of the document, turning `title: My Dashboard` into
 * `light.living_roomtitle: My Dashboard` — and the validator reported that as
 * VALID, so Apply Changes stayed enabled.
 *
 * The cited coverage could not see either: its one insert test places the cursor
 * at the END of the document, where "inserted at the cursor" and "appended at the
 * end" produce identical text, and it asserts only `toContain(id)`.
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { launchWithDSL, close, seedEntityCache, clearEntityCache } from '../support';

const YAML_FIXTURE = `title: Probe Dashboard
views:
  - title: Home
    cards:
      - type: button
        entity: light.MARKER_ONE
      - type: markdown
        content: hello
`;

/**
 * Seed the SPLIT VIEW pane's editor and put a real cursor on the marker line.
 *
 * Split mode has two Monaco instances live at once: the pane's, and the Edit
 * YAML dialog's — which is mounted but hidden, because that Modal uses
 * `forceRender`. The `yamlEditor` DSL cannot help here (its container testid,
 * `yaml-editor-container`, belongs to the dialog's wrapper only), so address the
 * pane's editor directly by picking the one whose DOM node is visible and not
 * inside an antd modal root.
 */
async function seedSplitPaneAndPlaceCursor(
  window: Page,
  yamlText: string,
  marker: string,
): Promise<number> {
  const result = await window.evaluate(
    ({ text, m }) => {
      const w = window as unknown as {
        __monacoEditor?: {
          getModel?: () => {
            setValue: (v: string) => void;
            getLineCount: () => number;
            getLineContent: (n: number) => string;
          } | null;
          getDomNode?: () => HTMLElement | null;
          focus?: () => void;
          setPosition?: (p: { lineNumber: number; column: number }) => void;
        };
      };
      // Entering Split mode mounts the pane's YamlEditor after the dialog's, and
      // YamlEditor claims this global on mount — so it is the pane's editor.
      const pane = w.__monacoEditor;
      if (!pane) return { line: -1, reason: 'no __monacoEditor' };

      const node = pane.getDomNode?.();
      if (node && node.closest('.ant-modal-root')) {
        // Guard rather than silently seeding the hidden dialog's editor and
        // asserting against the wrong document.
        return { line: -1, reason: 'global points at the modal editor' };
      }

      const model = pane.getModel?.();
      if (!model) return { line: -1, reason: 'no model' };

      model.setValue(text);
      for (let i = 1; i <= model.getLineCount(); i++) {
        const line = model.getLineContent(i);
        if (line.includes(m)) {
          pane.focus?.();
          pane.setPosition?.({ lineNumber: i, column: line.length + 1 });
          return { line: i, reason: 'ok' };
        }
      }
      return { line: -1, reason: 'marker not found after setValue' };
    },
    { text: yamlText, m: marker },
  );

  if (result.line < 0) {
    throw new Error(`seedSplitPaneAndPlaceCursor failed for "${marker}": ${result.reason}`);
  }
  return result.line;
}

/** Read the Split view pane's editor content, ignoring the hidden dialog's. */
async function readSplitPaneContent(window: Page): Promise<string> {
  return window.evaluate(() => {
    const w = window as unknown as {
      __monacoEditor?: { getModel?: () => { getValue: () => string } | null };
    };
    return w.__monacoEditor?.getModel?.()?.getValue() ?? '';
  });
}

/**
 * Put a real cursor on the line holding `marker`, the way a user clicking into
 * the editor would. Returns the 1-based line so the assertion can name it.
 * Throws rather than returning a sentinel: a setter that can silently no-op
 * turns every downstream assertion into a test of the wrong thing.
 */
async function placeCursorOnLine(window: Page, marker: string): Promise<number> {
  const result = await window.evaluate((m) => {
    const w = window as unknown as {
      monaco?: {
        editor?: {
          getEditors?: () => Array<{
            getModel?: () => {
              getLineCount: () => number;
              getLineContent: (n: number) => string;
            } | null;
            focus?: () => void;
            setPosition?: (p: { lineNumber: number; column: number }) => void;
          }>;
        };
      };
    };
    const editors = w.monaco?.editor?.getEditors?.() ?? [];
    for (const editor of editors) {
      const model = editor.getModel?.();
      if (!model) continue;
      for (let i = 1; i <= model.getLineCount(); i++) {
        const line = model.getLineContent(i);
        if (line.includes(m)) {
          editor.focus?.();
          editor.setPosition?.({ lineNumber: i, column: line.length + 1 });
          return { line: i };
        }
      }
    }
    return { line: -1 };
  }, marker);

  if (result.line < 0) {
    throw new Error(`placeCursorOnLine: no Monaco model contains "${marker}"`);
  }
  return result.line;
}

test.describe('YAML-05 — Edit YAML dialog', () => {
  test('refuses to insert when the cursor was never placed, and leaves the document untouched', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();
      await ctx.yamlEditor.setEditorContent(YAML_FIXTURE, 'modal');

      const before = await ctx.yamlEditor.getEditorContent('modal');

      // Deliberately do NOT focus or click into the editor.
      await ctx.yamlEditor.clickInsertEntity();
      await ctx.entityBrowser.expectVisible();
      await ctx.entityBrowser.selectFirstRow();
      await ctx.entityBrowser.clickSelectEntity();
      await ctx.entityBrowser.expectClosed();

      // It must say WHY rather than silently doing the wrong thing.
      // waitFor POLLS; a bare toBeVisible() would race the antd message.
      await ctx.window
        .getByText(/place the cursor/i)
        .first()
        .waitFor({ state: 'visible', timeout: 10000 });

      const after = await ctx.yamlEditor.getEditorContent('modal');
      expect(after).toBe(before);
      expect(after.split('\n')[0]).toBe('title: Probe Dashboard');
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('CONTROL: inserts at the cursor when the user has placed one', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();
      await ctx.yamlEditor.setEditorContent(YAML_FIXTURE, 'modal');

      const cursorLine = await placeCursorOnLine(ctx.window, 'MARKER_ONE');

      await ctx.yamlEditor.clickInsertEntity();
      await ctx.entityBrowser.expectVisible();
      const entityId = await ctx.entityBrowser.selectFirstRow();
      await ctx.entityBrowser.clickSelectEntity();
      await ctx.entityBrowser.expectClosed();

      expect(entityId).toBeTruthy();
      const after = await ctx.yamlEditor.getEditorContent('modal');
      const lines = after.split('\n');

      // The id must be ON THE CURSOR'S LINE — not merely present somewhere.
      // `toContain` over the whole document passes for an append at the end and
      // for a prepend at the top, which is exactly what the card forbids.
      expect(lines[cursorLine - 1]).toContain(entityId as string);
      expect(lines[0]).toBe('title: Probe Dashboard');
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('CONTROL: keeps other edits when the entity browser opens and closes', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();
      await ctx.yamlEditor.open();

      const edited = YAML_FIXTURE.replace('Probe Dashboard', 'EDITED_BEFORE_BROWSER');
      await ctx.yamlEditor.setEditorContent(edited, 'modal');
      const before = await ctx.yamlEditor.getEditorContent('modal');

      await ctx.yamlEditor.clickInsertEntity();
      await ctx.entityBrowser.expectVisible();
      await ctx.entityBrowser.close();
      await ctx.entityBrowser.expectClosed();

      const after = await ctx.yamlEditor.getEditorContent('modal');
      expect(after).toBe(before);
      expect(after).toContain('EDITED_BEFORE_BROWSER');
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });
});

test.describe('YAML-05 — Split view', () => {
  test('offers an entity-insert control that is actually reachable', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.window.getByText('Split', { exact: true }).click();

      const insertBtn = ctx.window.getByTestId('split-view-insert-entity-button');
      await insertBtn.waitFor({ state: 'visible', timeout: 15000 });

      // CANVAS-04's lesson: a VISIBLE control is not a USABLE one. toBeVisible()
      // passes on an element nothing can click, so ask the document what is
      // actually on top at the button's own centre.
      const hittable = await ctx.window.evaluate(() => {
        const btn = document.querySelector(
          '[data-testid="split-view-insert-entity-button"]',
        ) as HTMLElement | null;
        if (!btn) return false;
        const r = btn.getBoundingClientRect();
        const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return !!top && btn.contains(top);
      });
      expect(hittable).toBe(true);
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });

  test('inserts the selected id at the cursor in the Split view YAML pane', async () => {
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await seedEntityCache(ctx.window);
      await ctx.dashboard.createNew();

      await ctx.window.getByText('Split', { exact: true }).click();
      const insertBtn = ctx.window.getByTestId('split-view-insert-entity-button');
      await insertBtn.waitFor({ state: 'visible', timeout: 15000 });

      // Give the pane a known document, then put a real cursor in it.
      const cursorLine = await seedSplitPaneAndPlaceCursor(ctx.window, YAML_FIXTURE, 'MARKER_ONE');

      await insertBtn.click();
      await ctx.entityBrowser.expectVisible();
      const entityId = await ctx.entityBrowser.selectFirstRow();
      await ctx.entityBrowser.clickSelectEntity();
      await ctx.entityBrowser.expectClosed();

      expect(entityId).toBeTruthy();
      const after = await readSplitPaneContent(ctx.window);
      const lines = after.split('\n');
      expect(lines[cursorLine - 1]).toContain(entityId as string);
    } finally {
      await clearEntityCache(ctx.window);
      await close(ctx);
    }
  });
});
