import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

/**
 * Regression cover for the v1.0.0 UAT round-1 High defect YAML-04,
 * "Split view keeps canvas and YAML in step".
 *
 * The tester reported only the highlight: "Selecting a card does not seem to
 * highlight the correct section in the yaml editor. Editing yaml is reflected
 * in on the canvas." Reproducing all four Expected found a SECOND defect the
 * report could not reach, because a card fails at its FIRST broken step and
 * step 3 (select) precedes step 4 (move).
 *
 * DEFECT A — Expected 2. `YamlEditor`'s jump effect searched the YAML text for
 * `type: <the selected card's type>` and counted occurrences of THAT ONE type
 * string, then compared the counter against `cardIndex`, which is the index
 * among ALL cards of any type. Measured on `59feb95`, for
 * [markdown, button, markdown]: selecting index 1 or 2 found no match at all,
 * `targetLine` stayed -1, and the PREVIOUS card's highlight was left in place —
 * which is what "highlights the wrong section" looks like from the outside.
 * For an all-same-type view every jump was correct, because there the two
 * indices coincide; that contrast is the diagnostic. And because the match was
 * a SUBSTRING match over every line, a top-level card could resolve to a card
 * nested inside a vertical-stack — a confidently wrong highlight, not a missing
 * one. PR #100 made nesting easy to create from the canvas, so that path is now
 * more reachable, not less.
 *
 * DEFECT B — Expected 3, "Moving a card updates the YAML pane without a manual
 * refresh". Measured: it never updated. A card moved on the canvas (positions
 * changed) and a card ADDED from the palette (canvas went 3 -> 4) both left the
 * YAML pane byte-identical. Clicking the manual "Sync from Visual" button — the
 * same `serializeDashboard(config)`, triggered by hand — produced the correct
 * YAML, which is what proves `config` was current and the AUTOMATIC path was
 * the broken one.
 *
 * The mechanism, pinned by instrumenting the effect and reading the log rather
 * than by reading the code: entering Split mode ran the visual -> YAML sync,
 * which wrote the YAML into Monaco; Monaco echoed that write back through
 * `onDidChangeModelContent`; `SplitViewEditor.handleYamlChange` could not tell
 * the echo from a user edit and latched `syncStatus` to 'pending-code'; and
 * every later sync then hit `if (syncStatus === 'pending-code') return`. The
 * guard itself is right — unapplied user YAML must not be clobbered by the
 * visual state — so the fix suppresses the ECHO at source in `YamlEditor`
 * rather than removing the guard.
 *
 * WHY THE EXISTING SUITE COULD NOT SEE EITHER. YAML-04 is honestly marked
 * `auto_covered: N`. `tests/unit/advanced-yaml-editor.spec.ts` touches
 * `setSelectedCardForYamlJump` only to assert the store round-trip and never
 * exercises the line-finding logic. Suite-wide, NO spec entered Split mode at
 * all before this one.
 */

const MIXED = `title: Mixed
views:
  - title: Home
    path: home
    cards:
      - type: markdown
        content: CARD-ZERO
      - type: button
        name: CARD-ONE
      - type: markdown
        content: CARD-TWO
`;

const NESTED = `title: Nested
views:
  - title: Home
    path: home
    cards:
      - type: vertical-stack
        cards:
          - type: markdown
            content: NESTED-A
          - type: markdown
            content: NESTED-B
      - type: markdown
        content: TOP-LEVEL-ONE
`;

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

const load = async (ctx: Ctx, yamlText: string): Promise<void> => {
  await ctx.window.evaluate((s) => {
    (
      window as unknown as { __dashboardTestApi?: { loadYaml: (v: string) => void } }
    ).__dashboardTestApi?.loadYaml(s);
  }, yamlText);
  await ctx.window.waitForTimeout(700);
};

const enterSplit = async (ctx: Ctx): Promise<void> => {
  await ctx.window.getByText('Split', { exact: true }).first().click();
  await ctx.window.waitForTimeout(1500);
};

/**
 * The selected block, as line NUMBERS and the TEXT on those lines.
 *
 * ⚠ Asserting only that a selection exists passed for the entire life of this
 * defect — the stale highlight from the previously-selected card is a perfectly
 * valid selection. Only the line number and its content distinguish the right
 * block from a confidently wrong one.
 */
const selectedBlock = (ctx: Ctx) =>
  ctx.window.evaluate(() => {
    const w = window as unknown as {
      __monacoEditor?: {
        getSelection?: () => {
          startLineNumber: number;
          endLineNumber: number;
          startColumn: number;
          endColumn: number;
        } | null;
        getModel?: () => { getLineContent?: (n: number) => string } | null;
      };
    };
    const ed = w.__monacoEditor;
    const sel = ed?.getSelection?.() ?? null;
    const model = ed?.getModel?.() ?? null;
    if (!sel || !model) return { empty: true as const, lines: [] as string[], start: -1, end: -1 };
    const lines: string[] = [];
    for (let n = sel.startLineNumber; n <= sel.endLineNumber; n++) {
      lines.push(model.getLineContent?.(n) ?? '');
    }
    return {
      empty: sel.startLineNumber === sel.endLineNumber && sel.startColumn === sel.endColumn,
      start: sel.startLineNumber,
      end: sel.endLineNumber,
      lines,
    };
  });

const yamlPaneText = (ctx: Ctx): Promise<string> =>
  ctx.window.evaluate(() => {
    const w = window as unknown as {
      __monacoEditor?: { getModel?: () => { getValue?: () => string } | null };
    };
    return w.__monacoEditor?.getModel?.()?.getValue?.() ?? '';
  });

const selectCard = async (ctx: Ctx, index: number): Promise<void> => {
  await ctx.window
    .getByTestId('canvas-card')
    .nth(index)
    .click({ position: { x: 12, y: 12 } });
  await ctx.window.waitForTimeout(700);
};

test.describe('Split view keeps canvas and YAML in step (YAML-04)', () => {
  test('DEFECT A: selecting a card highlights THAT card, across mixed card types', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await load(ctx, MIXED);
      await enterSplit(ctx);

      // Card 0 is the one selection the broken code got right — it is the
      // control leg for "the jump mechanism runs at all".
      await selectCard(ctx, 0);
      const first = await selectedBlock(ctx);
      expect(first.lines.join('\n')).toContain('type: markdown');
      expect(first.lines.join('\n')).toContain('CARD-ZERO');

      // ⭐ THE DEFECT. Selecting card 1 used to leave card 0's highlight in
      // place. Assert the block MOVED and that it is card 1's block.
      await selectCard(ctx, 1);
      const second = await selectedBlock(ctx);
      expect(second.start).not.toBe(first.start);
      expect(second.lines.join('\n')).toContain('type: button');
      expect(second.lines.join('\n')).toContain('CARD-ONE');

      // Card 2 shares a type with card 0, which is exactly the case the
      // occurrence counter could never reach.
      await selectCard(ctx, 2);
      const third = await selectedBlock(ctx);
      expect(third.start).not.toBe(first.start);
      expect(third.start).not.toBe(second.start);
      expect(third.lines.join('\n')).toContain('CARD-TWO');
    } finally {
      await close(ctx);
    }
  });

  test('DEFECT A: a top-level card never resolves to one nested in a stack', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await load(ctx, NESTED);
      await enterSplit(ctx);

      // The top-level markdown. The substring match used to count the two
      // markdown cards INSIDE the vertical-stack and land on NESTED-B.
      await selectCard(ctx, 1);
      const block = await selectedBlock(ctx);
      const text = block.lines.join('\n');
      expect(text).toContain('TOP-LEVEL-ONE');
      expect(text).not.toContain('NESTED-A');
      expect(text).not.toContain('NESTED-B');
    } finally {
      await close(ctx);
    }
  });

  test('DEFECT A: selecting a card does not steal keyboard focus into the YAML pane', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await load(ctx, MIXED);
      await enterSplit(ctx);
      await selectCard(ctx, 1);

      // Selecting a card is a CANVAS gesture. Pulling focus into Monaco means
      // Delete and Ctrl+Z are then swallowed by the editor's text-entry guard
      // (see CANVAS-07), which is the opposite of what the user asked for.
      const focus = await ctx.window.evaluate(() => {
        const a = document.activeElement as HTMLElement | null;
        return { insideMonaco: Boolean(a?.closest('.monaco-editor')) };
      });
      expect(focus.insideMonaco).toBe(false);

      // CONTROL LEG: focus staying out of Monaco is only meaningful if the jump
      // actually happened — otherwise this passes for the wrong reason.
      const block = await selectedBlock(ctx);
      expect(block.lines.join('\n')).toContain('CARD-ONE');
    } finally {
      await close(ctx);
    }
  });

  test('DEFECT B: a canvas change reaches the YAML pane with no manual refresh', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    try {
      const { window: w } = ctx;
      await ctx.appDSL.waitUntilReady();
      await load(ctx, MIXED);
      await enterSplit(ctx);

      const before = await yamlPaneText(ctx);
      expect(before).toContain('CARD-ZERO');

      await ctx.palette.expandCategory('Controls');
      await w
        .getByTestId('palette-card-button')
        .dragTo(w.locator('.react-grid-layout').first(), { targetPosition: { x: 40, y: 480 } });
      await w.waitForTimeout(2000);

      // ⭐ CONTROL LEG FIRST. "The YAML did not change" would also pass if the
      // drop had been silently discarded, so prove the card arrived.
      await expect(w.getByTestId('canvas-card')).toHaveCount(4);

      // ⭐ THE DEFECT. No "Sync from Visual" click — the card's Expected says
      // "without a manual refresh", and the manual button was the ONLY thing
      // that worked.
      const after = await yamlPaneText(ctx);
      expect(after).not.toBe(before);
      expect(after.split('type:').length).toBeGreaterThan(before.split('type:').length);
    } finally {
      await close(ctx);
    }
  });
});
