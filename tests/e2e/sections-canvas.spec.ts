import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// A dashboard whose single view is an HA "sections" view. Its cards live under
// sections[].cards, NOT the view's top-level `cards` (which is empty), so before
// Tier 4 the canvas rendered it blank.
const SECTIONS_YAML = `title: Sections Dashboard
views:
  - title: Home
    path: home
    type: sections
    max_columns: 3
    sections:
      - type: grid
        title: Lights
        cards:
          - type: markdown
            content: SEC-ORIGINAL
          - type: button
            entity: light.living_room
      - type: grid
        cards:
          - type: markdown
            content: Second section card
`;

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

const loadSections = async (ctx: Ctx): Promise<void> => {
  await ctx.window.evaluate((yaml) => {
    const api = (window as unknown as { __dashboardTestApi?: { loadYaml: (y: string) => void } })
      .__dashboardTestApi;
    api?.loadYaml(yaml);
  }, SECTIONS_YAML);
};

test.describe('Sections view canvas (Tier 4)', () => {
  test('renders an imported sections view with headings and cards', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    try {
      await ctx.appDSL.waitUntilReady();
      await loadSections(ctx);

      await expect(ctx.window.getByTestId('sections-canvas')).toBeVisible();
      // Slice 4.4: the section heading is now an editable field (its value is the
      // section title), not a static text div.
      await expect(ctx.window.getByTestId('section-title-input-0')).toHaveValue('Lights');
      // section 0 has 2 cards + section 1 has 1 => 3 canvas cards render
      await expect(ctx.window.getByTestId('canvas-card')).toHaveCount(3);
    } finally {
      await close(ctx);
    }
  });

  test('selecting a section card is (section, card)-addressed and edits write into the section', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { canvas, properties, yamlEditor, window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadSections(ctx);
      await expect(window.getByTestId('sections-canvas')).toBeVisible();

      // Click the first section card (section 0, card 0 = the SEC-ORIGINAL markdown).
      await canvas.selectCard(0);

      // The selection is addressed to the section, not the (empty) flat cards array.
      const debug = window.getByTestId('selection-debug-state');
      await expect(debug).toHaveAttribute('data-selected-section', '0');
      await expect(debug).toHaveAttribute('data-selected-card', '0');
      await properties.expectVisible();

      // Properties resolved the SECTION card: a flat `view.cards[0]` lookup would
      // be undefined (empty), so the panel's YAML showing the markdown proves the
      // (sectionIndex, cardIndex) resolution.
      await properties.switchTab('YAML');
      const before = await yamlEditor.getEditorContent('properties');
      expect(before).toContain('SEC-ORIGINAL');

      // Edit the card; the write must land back in the section, re-rendering the
      // canvas markdown. (If the write went to the empty flat array, the canvas
      // card would stay SEC-ORIGINAL.)
      await yamlEditor.setEditorContent('type: markdown\ncontent: SEC-EDITED\n', 'properties');
      await expect(window.getByTestId('sections-canvas')).toContainText('SEC-EDITED');
      await expect(window.getByTestId('sections-canvas')).not.toContainText('SEC-ORIGINAL');
    } finally {
      await close(ctx);
    }
  });

  // --- Tier 4 slice 4.3a: authoring cards inside sections ---------------------

  test('adds a palette card into the selected section', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { canvas, palette, window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadSections(ctx);
      await expect(window.getByTestId('sections-canvas')).toBeVisible();
      await expect(window.getByTestId('canvas-card')).toHaveCount(3);

      // Select a card in section 1 so that section — not the default first one —
      // is the add target.
      await canvas.selectCard(2);
      await expect(window.getByTestId('selection-debug-state')).toHaveAttribute(
        'data-selected-section',
        '1',
      );

      await palette.addCard('markdown');

      // The new card landed in section 1, not the flat (empty) view.cards.
      await expect(window.getByTestId('canvas-card')).toHaveCount(4);
      await expect(
        window.getByTestId('sections-canvas-section-1').getByTestId('canvas-card'),
      ).toHaveCount(2);
      await expect(
        window.getByTestId('sections-canvas-section-0').getByTestId('canvas-card'),
      ).toHaveCount(2);
    } finally {
      await close(ctx);
    }
  });

  test('deletes multi-selected cards from a section', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { canvas, window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadSections(ctx);
      await expect(window.getByTestId('canvas-card')).toHaveCount(3);

      // Ctrl-click both cards of section 0 — multi-select is allowed WITHIN a
      // single section.
      await canvas.selectCard(0);
      await canvas.toggleCardSelection(1);

      await ctx.appDSL.deleteSelection();

      // Both section-0 cards are gone; section 1 is untouched.
      await expect(window.getByTestId('canvas-card')).toHaveCount(1);
      await expect(window.getByTestId('sections-canvas')).not.toContainText('SEC-ORIGINAL');
      await expect(window.getByTestId('sections-canvas')).toContainText('Second section card');
      await expect(window.getByTestId('section-empty-0')).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  test('cut and paste moves a card between sections', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { canvas, window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadSections(ctx);
      await expect(window.getByTestId('canvas-card')).toHaveCount(3);

      // Cut SEC-ORIGINAL out of section 0...
      await canvas.selectCard(0);
      await ctx.appDSL.cut();

      // ...select into section 1 and paste: the card moves there.
      await canvas.selectCard(2);
      await expect(window.getByTestId('selection-debug-state')).toHaveAttribute(
        'data-selected-section',
        '1',
      );
      await ctx.appDSL.paste();

      // Card count is unchanged (a move, not a copy) and SEC-ORIGINAL now lives
      // in section 1.
      await expect(window.getByTestId('canvas-card')).toHaveCount(3);
      await expect(window.getByTestId('sections-canvas-section-1')).toContainText('SEC-ORIGINAL');
      await expect(window.getByTestId('sections-canvas-section-0')).not.toContainText(
        'SEC-ORIGINAL',
      );
      await expect(
        window.getByTestId('sections-canvas-section-0').getByTestId('canvas-card'),
      ).toHaveCount(1);
    } finally {
      await close(ctx);
    }
  });

  // --- Tier 4 slice 4.3b: drag-to-move + drag-to-resize -----------------------

  // Drive HTML5 drag-and-drop by dispatching the real event sequence. The move
  // source is tracked in a component ref (set synchronously in onDragStart), so
  // a dispatched dragstart -> drop is deterministic — no flaky mouse-based drag.
  const dispatchCardDrag = (ctx: Ctx, sourceSelector: string, targetSelector: string) =>
    ctx.window.evaluate(
      ({ sourceSelector: src, targetSelector: dst }) => {
        const source = document.querySelector(src);
        const target = document.querySelector(dst);
        if (!source || !target) throw new Error(`drag selectors not found: ${src} -> ${dst}`);
        const dataTransfer = new DataTransfer();
        const fire = (el: Element, type: string) =>
          el.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }));
        fire(source, 'dragstart');
        fire(target, 'dragover');
        fire(target, 'drop');
        fire(source, 'dragend');
      },
      { sourceSelector, targetSelector },
    );

  test('drag-reorders cards within a section', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadSections(ctx);
      const section0 = window.getByTestId('sections-canvas-section-0');
      await expect(section0.getByTestId('canvas-card')).toHaveCount(2);
      // Section 0 starts [SEC-ORIGINAL, button]; the first card holds SEC-ORIGINAL.
      await expect(section0.getByTestId('canvas-card').nth(0)).toContainText('SEC-ORIGINAL');

      // Drag card (0,0) onto card (0,1): it moves to the end of the section.
      await dispatchCardDrag(
        ctx,
        '[data-testid="section-card-body-0-0"]',
        '[data-testid="canvas-card"][data-section-index="0"][data-card-index="1"]',
      );

      await expect(section0.getByTestId('canvas-card').nth(0)).not.toContainText('SEC-ORIGINAL');
      await expect(section0.getByTestId('canvas-card').nth(1)).toContainText('SEC-ORIGINAL');
    } finally {
      await close(ctx);
    }
  });

  test('drag-moves a card between sections', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadSections(ctx);
      await expect(window.getByTestId('canvas-card')).toHaveCount(3);

      // Drag card (0,0)=SEC-ORIGINAL and drop on the section-1 container (append).
      await dispatchCardDrag(
        ctx,
        '[data-testid="section-card-body-0-0"]',
        '[data-testid="sections-canvas-section-1"]',
      );

      await expect(
        window.getByTestId('sections-canvas-section-0').getByTestId('canvas-card'),
      ).toHaveCount(1);
      await expect(
        window.getByTestId('sections-canvas-section-1').getByTestId('canvas-card'),
      ).toHaveCount(2);
      await expect(window.getByTestId('sections-canvas-section-1')).toContainText('SEC-ORIGINAL');
      await expect(window.getByTestId('sections-canvas-section-0')).not.toContainText(
        'SEC-ORIGINAL',
      );
    } finally {
      await close(ctx);
    }
  });

  test('drag-resizes a card, writing grid_options.columns', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { canvas, window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadSections(ctx);

      // A card with no grid_options spans the full 12 columns.
      const targetCard = window
        .getByTestId('sections-canvas-section-0')
        .getByTestId('canvas-card')
        .nth(0);
      await expect(targetCard).toHaveAttribute('data-grid-columns', '12');

      // Select it so the resize handles render.
      await canvas.selectCard(0);
      const handle = window.getByTestId('section-resize-columns-0-0');
      await expect(handle).toBeVisible();

      // Drag the right-edge handle left by ~40% of the section width -> narrower span.
      const section = await window.getByTestId('sections-canvas-section-0').boundingBox();
      const box = await handle.boundingBox();
      if (!section || !box) throw new Error('missing bounding boxes');
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;
      await window.mouse.move(startX, startY);
      await window.mouse.down();
      await window.mouse.move(startX - section.width * 0.4, startY, { steps: 8 });
      await window.mouse.up();

      // Span shrank below full width, and the change persisted to grid_options.
      await expect
        .poll(async () => Number(await targetCard.getAttribute('data-grid-columns')))
        .toBeLessThan(12);
      await expect
        .poll(async () => Number(await targetCard.getAttribute('data-grid-columns')))
        .toBeGreaterThanOrEqual(1);
    } finally {
      await close(ctx);
    }
  });

  /**
   * VIEWS-05 (UAT round 2, Medium, regression, `auto_covered: N`).
   * Owner: "Could not resize with handle. Dialogue with sliders appears when
   * clicking on a card."
   *
   * ⚠⚠⚠ WHY THE TEST ABOVE COULD NOT SEE THIS. "drag-resizes a card, writing
   * grid_options.columns" calls `canvas.selectCard(0)` and then addresses the
   * handle by testid — it PERFORMS THE USER'S MISSING STEP FOR THEM. The handles
   * were rendered only when the card was already selected, so a test that
   * selects first can never discover that a human cannot find them. VIEWS-05
   * step 1 is "HOVER the right edge of a card until a width handle appears", and
   * nothing in the suite hovered anything.
   *
   * This test never selects the card. That is the whole point.
   */
  test('a card that was never selected reveals a grabbable resize handle on hover', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadSections(ctx);

      const targetCard = window
        .getByTestId('sections-canvas-section-0')
        .getByTestId('canvas-card')
        .nth(0);

      // ⭐ CONTROL LEG — pre-existing locators and attributes only, so it passes
      // on base too. It proves the sections view rendered and we are looking at
      // the right card; without it, a red discriminator below could just mean
      // the fixture never loaded.
      await expect(window.getByTestId('canvas-card')).toHaveCount(3);
      await expect(targetCard).toHaveAttribute('data-grid-columns', '12');

      // ⭐ DISCRIMINATOR 1 — the handle EXISTS without any selection. On base it
      // was inside `{selected ? … : null}`, so this count is 0.
      const handle = window.getByTestId('section-resize-columns-0-0');
      await expect(handle).toHaveCount(1);

      // ⭐ DISCRIMINATOR 2 — hovering the CARD reveals it. On base there was no
      // stylesheet and an inline `background: 'transparent'`: nothing to reveal.
      // ⚠ Asserted on computed opacity, NOT `toBeVisible()` — Playwright counts
      // an `opacity: 0` element as visible, so `toBeVisible` cannot tell a
      // revealed handle from a hidden one and would pass either way.
      await targetCard.hover();
      // ⚠ Bare `getComputedStyle`, not `window.getComputedStyle`: in this file
      // `window` is the Playwright Page destructured from the context, and it
      // shadows the DOM global inside the evaluate callback.
      await expect
        .poll(async () => handle.evaluate((el) => getComputedStyle(el as Element).opacity))
        .toBe('1');

      // ⭐⭐ DISCRIMINATOR 3 — it is GRABBABLE, measured the way round-1 High
      // CANVAS-04 measured the masonry handle: topmost element at its own
      // centre. CANVAS-04 is the proof that existence and visibility both pass
      // while a handle is unreachable, so only hit-testing settles it.
      const topmost = await handle.evaluate((el) => {
        const r = (el as Element).getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return el === hit ? 'HANDLE' : `${hit?.tagName}.${(hit as Element)?.className}`;
      });
      expect(topmost).toBe('HANDLE');

      // ⭐⭐⭐ AND THE OUTCOME THE CARD ACTUALLY ASKS FOR: a real drag resizes the
      // card, from a card the user never clicked.
      const section = await window.getByTestId('sections-canvas-section-0').boundingBox();
      const box = await handle.boundingBox();
      if (!section || !box) throw new Error('missing bounding boxes');
      await window.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await window.mouse.down();
      await window.mouse.move(box.x + box.width / 2 - section.width * 0.4, box.y + box.height / 2, {
        steps: 8,
      });
      await window.mouse.up();

      await expect
        .poll(async () => Number(await targetCard.getAttribute('data-grid-columns')))
        .toBeLessThan(12);
    } finally {
      await close(ctx);
    }
  });

  // --- Tier 4 slice 4.3c: 56px row parity + precise-mode sliders --------------

  test('renders cards on the 56px row grid with an estimated row span', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadSections(ctx);

      // Every card now carries a concrete row span (explicit grid_options.rows,
      // else the content-height estimate) — a positive integer, not blank.
      const cards = window.getByTestId('sections-canvas-section-0').getByTestId('canvas-card');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const rows = Number(await cards.nth(i).getAttribute('data-grid-rows'));
        expect(rows).toBeGreaterThanOrEqual(1);
      }
    } finally {
      await close(ctx);
    }
  });

  test('precise-mode sliders set exact grid_options columns and rows', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { canvas, window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadSections(ctx);

      const targetCard = window
        .getByTestId('sections-canvas-section-0')
        .getByTestId('canvas-card')
        .nth(0);
      await expect(targetCard).toHaveAttribute('data-grid-columns', '12');

      await canvas.selectCard(0);
      await expect(window.getByTestId('section-precise-panel-0-0')).toBeVisible();

      // Columns slider: nudge down from full width -> persisted columns < 12.
      const colSlider = window
        .getByTestId('section-precise-columns-0-0')
        .locator('[role="slider"]');
      await colSlider.focus();
      await window.keyboard.press('ArrowLeft');
      await window.keyboard.press('ArrowLeft');
      await expect
        .poll(async () => Number(await targetCard.getAttribute('data-grid-columns')))
        .toBeLessThan(12);

      // Rows slider: nudge up -> persisted rows increases by 1.
      const rowsBefore = Number(await targetCard.getAttribute('data-grid-rows'));
      const rowSlider = window.getByTestId('section-precise-rows-0-0').locator('[role="slider"]');
      await rowSlider.focus();
      await window.keyboard.press('ArrowRight');
      await expect
        .poll(async () => Number(await targetCard.getAttribute('data-grid-rows')))
        .toBe(rowsBefore + 1);
    } finally {
      await close(ctx);
    }
  });

  // --- Tier 4 slice 4.4: section authoring ------------------------------------

  test('adds a new empty section via the toolbar', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadSections(ctx);
      await expect(window.getByTestId('sections-canvas-section-0')).toBeVisible();
      await expect(window.getByTestId('sections-canvas-section-1')).toBeVisible();
      await expect(window.getByTestId('sections-canvas-section-2')).toHaveCount(0);

      await window.getByTestId('section-add-button').click();

      // A new empty section is appended.
      await expect(window.getByTestId('sections-canvas-section-2')).toBeVisible();
      await expect(window.getByTestId('section-empty-2')).toBeVisible();
      // Existing sections are untouched.
      await expect(window.getByTestId('section-title-input-0')).toHaveValue('Lights');
    } finally {
      await close(ctx);
    }
  });

  test('deletes a section via the toolbar', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadSections(ctx);
      await expect(window.getByTestId('sections-canvas-section-1')).toBeVisible();
      await expect(window.getByTestId('sections-canvas')).toContainText('Second section card');

      await window.getByTestId('section-delete-1').click();

      // Section 1 and its card are gone; section 0 (Lights) survives.
      await expect(window.getByTestId('sections-canvas-section-1')).toHaveCount(0);
      await expect(window.getByTestId('sections-canvas')).not.toContainText('Second section card');
      await expect(window.getByTestId('section-title-input-0')).toHaveValue('Lights');
    } finally {
      await close(ctx);
    }
  });

  test('renames a section heading, persisting section.title', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadSections(ctx);
      // Section 1 starts untitled.
      const input = window.getByTestId('section-title-input-1');
      await expect(input).toHaveValue('');

      await input.fill('Climate');
      await input.press('Enter');

      // The committed title survives (falls back to the model after the draft
      // clears, so seeing 'Climate' proves the write landed on section.title).
      await expect(window.getByTestId('section-title-input-1')).toHaveValue('Climate');
    } finally {
      await close(ctx);
    }
  });

  test('drag-reorders whole sections', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadSections(ctx);
      // Order starts [Lights, <untitled>]; the untitled section holds the
      // "Second section card" markdown.
      await expect(window.getByTestId('section-title-input-0')).toHaveValue('Lights');

      // Drag section 0's handle onto the section-1 container -> [<untitled>, Lights].
      await dispatchCardDrag(
        ctx,
        '[data-testid="section-drag-handle-0"]',
        '[data-testid="sections-canvas-section-1"]',
      );

      await expect(window.getByTestId('section-title-input-0')).toHaveValue('');
      await expect(window.getByTestId('section-title-input-1')).toHaveValue('Lights');
      await expect(window.getByTestId('sections-canvas-section-1')).toContainText('SEC-ORIGINAL');
    } finally {
      await close(ctx);
    }
  });

  test('changes the view max_columns from the toolbar', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadSections(ctx);
      const grid = window.getByTestId('sections-canvas-grid');
      await expect(grid).toHaveAttribute('data-max-columns', '3'); // fixture max_columns: 3

      const maxInput = window.getByTestId('section-max-columns').locator('input');
      await maxInput.fill('5');
      await maxInput.press('Enter');

      await expect(grid).toHaveAttribute('data-max-columns', '5');
    } finally {
      await close(ctx);
    }
  });

  // ==========================================================================
  // F5 — the sections-canvas palette-drop insertion contract (VIEWS-04)
  // ==========================================================================
  //
  // ⚠⚠ GESTURE POLICY, AND THE MEASUREMENT BEHIND IT (spec §9.6 item 2).
  //
  // Playwright's `locator.dragTo()` does NOT start a native HTML5 drag from a
  // palette tile under Electron. Measured, not assumed: an instrumented probe
  // recording every drag event at document capture saw, for a palette `dragTo`,
  // only ["mousedown@DIV","mouseup@DIV"] — no `dragstart` at all — while the
  // SAME probe on an internal card `dragTo` in the same run saw the full
  // sequence, and `dataTransfer.types` at dragover read
  // ["application/x-havdm-section-card"]. So `dragTo` works for some elements
  // and not the palette tile.
  //
  // A manual mouse sequence WITH A SHORT INTERMEDIATE MOVE NEAR THE SOURCE does
  // start it, and that same probe then read
  // ["text/plain","application/x-havdm-palette-card"] at dragover.
  //
  // ⭐⭐ THAT IS THE ANSWER TO §9.6 ITEM 2, AND IT IS POSITIVE: THE REAL
  // APPLICATION EXPOSES THE MARKER MIME IN `dataTransfer.types` AT `dragover`
  // UNDER ELECTRON. The product contract in §7.1 needed no weakening — only the
  // harness recipe changed, which is exactly the direction §9.6 permits.
  //
  // ⚠ TARGETING PRECISION. That same probe landed a centre-aimed drop on
  // `section-title-input-0` — the toolbar, a DIFFERENT row of §7.3's table and
  // therefore a silently different assertion. Legs that mean "the section's own
  // body" therefore compute an explicit bare point and ASSERT via
  // `elementFromPoint` that it belongs to neither a card nor the toolbar.

  // Section 0 populated (its second card spans 6 of 12 columns, so the right
  // half of that row is bare section body — a reliable drop point that is
  // neither a card nor the toolbar); section 1 EMPTY, the tester's exact case.
  const EMPTY_SECTION_YAML = `title: Sections Dashboard
views:
  - title: Home
    path: home
    type: sections
    max_columns: 2
    sections:
      - type: grid
        title: Lights
        cards:
          - type: markdown
            content: SEC-ORIGINAL
          - type: markdown
            content: SEC-SECOND
            grid_options:
              columns: 6
      - type: grid
        title: Empty One
        cards: []
`;

  const NO_SECTIONS_YAML = `title: Sections Dashboard
views:
  - title: Home
    path: home
    type: sections
    sections: []
`;

  // A section holding a CONTAINER card — the pin for the deferred-nesting ruling.
  const STACK_SECTION_YAML = `title: Sections Dashboard
views:
  - title: Home
    path: home
    type: sections
    sections:
      - type: grid
        title: Stacks
        cards:
          - type: vertical-stack
            cards:
              - type: markdown
                content: STACK-CHILD-A
              - type: markdown
                content: STACK-CHILD-B
`;

  // Dashboard A for leg L14: >= 2 sections, so a card in SECTION 1 can be
  // selected. The section counts in both A and B are load-bearing — see L14.
  const DOC_A_YAML = `title: Doc A
views:
  - title: A
    path: a
    type: sections
    sections:
      - type: grid
        title: A-Zero
        cards:
          - type: markdown
            content: A-CARD-0
      - type: grid
        title: A-One
        cards:
          - type: markdown
            content: A-CARD-1
`;

  const DOC_B_YAML = `title: Doc B
views:
  - title: B
    path: b
    type: sections
    sections:
      - type: grid
        title: B-Zero
        cards:
          - type: markdown
            content: B-CARD-0
      - type: grid
        title: B-One
        cards:
          - type: markdown
            content: B-CARD-1
`;

  const loadYaml = async (ctx: Ctx, yaml: string): Promise<void> => {
    await ctx.window.evaluate((y) => {
      const api = (window as unknown as { __dashboardTestApi?: { loadYaml: (y: string) => void } })
        .__dashboardTestApi;
      api?.loadYaml(y);
    }, yaml);
  };

  /** Surface a palette tile the way the DSL does — categories start collapsed. */
  const revealPaletteTile = async (ctx: Ctx, cardType: string) => {
    const search = ctx.window.getByTestId('card-search');
    await expect(search).toBeVisible();
    await search.fill(cardType);
    const tile = ctx.window.getByTestId(`palette-card-${cardType}`);
    await expect(tile).toBeVisible({ timeout: 10000 });
    return tile;
  };

  /**
   * One sample of "is a pointer at this element's centre actually on it, and has
   * it stopped moving?" — measured in ONE round trip so the box and the hit-test
   * cannot disagree about a layout that shifted between two of them.
   */
  type SettleSample = { ok: false; why: string } | { ok: true; x: number; y: number; key: string };

  /** How many consecutive identical samples make a layout "settled". */
  const SETTLE_SAMPLES = 3;

  /**
   * The centre of the single element matching `selector`, re-measured until it
   * is genuinely under its own centre AND has held the same box for
   * `SETTLE_SAMPLES` consecutive polls.
   *
   * ⚠⚠⚠ ONE PASSING HIT-TEST IS NOT ENOUGH, AND THAT IS MEASURED, NOT ARGUED.
   * The previous revision of this helper returned as soon as a single poll saw
   * the centre belong to the requested element. The independent review of
   * PR #137 ran `--grep 'F5 L11' --repeat-each=5` against it and got 3 passed /
   * 2 failed, both failures dragging `custom:fold-entity-row` when the leg had
   * asked for `entities`. A single hit-test is a MOMENTARY GEOMETRIC
   * OBSERVATION; the element can still be mid-flight.
   *
   * ⭐ THE MECHANISM, MEASURED FROM `CardPalette.tsx`: the palette filters on
   * name, type OR DESCRIPTION, so the search term `entities` matches NINE tiles
   * across FOUR categories (entities, glance, thermostat, statistics-graph,
   * media-control, custom:auto-entities, custom:multiple-entity-row,
   * custom:fold-entity-row, custom:slider-entity-row) while `markdown` matches
   * exactly ONE tile in ONE category. A `useEffect` then expands every matching
   * category in a SECOND render pass, so the tiles move across React commits
   * after the first hit-test has already succeeded. That asymmetry is exactly
   * why every markdown leg was stable and only L11 failed.
   *
   * ⚠ POLL FOR STABILITY, NOT FOR THE ANSWER YOU WANT. The settle criterion is
   * the gesture's own precondition — a pointer at this coordinate hits this
   * element, and keeps hitting it.
   */
  const settledPointOnSelector = async (ctx: Ctx, selector: string) => {
    let point = { x: 0, y: 0 };
    let lastKey: string | null = null;
    let streak = 0;

    await expect
      .poll(
        async () => {
          const sample: SettleSample = await ctx.window.evaluate((sel): SettleSample => {
            const nodes = document.querySelectorAll(sel);
            if (nodes.length !== 1) {
              return { ok: false, why: `${nodes.length} elements match ${sel}` };
            }
            const el = nodes[0] as HTMLElement;
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
              return { ok: false, why: `${sel} has a zero-size box` };
            }
            const x = rect.x + rect.width / 2;
            const y = rect.y + rect.height / 2;
            const hit = document.elementFromPoint(x, y) as HTMLElement | null;
            if (!hit || hit.closest(sel) !== el) {
              return { ok: false, why: `the centre of ${sel} belongs to another element` };
            }
            return {
              ok: true,
              x,
              y,
              key: [rect.x, rect.y, rect.width, rect.height].map((n) => Math.round(n)).join(','),
            };
          }, selector);

          if (!sample.ok) {
            streak = 0;
            lastKey = null;
            return false;
          }
          streak = sample.key === lastKey ? streak + 1 : 1;
          lastKey = sample.key;
          point = { x: sample.x, y: sample.y };
          return streak >= SETTLE_SAMPLES;
        },
        {
          intervals: [100, 100, 100, 100, 200, 300, 500, 1000],
          timeout: 15000,
          message: `the point must hold still over ${selector} for ${SETTLE_SAMPLES} consecutive samples`,
        },
      )
      .toBe(true);
    return point;
  };

  /** The settled centre of a testid'd element. */
  const settledPointOn = (ctx: Ctx, testId: string) =>
    settledPointOnSelector(ctx, `[data-testid="${testId}"]`);

  /**
   * ⚠⚠⚠ WHAT THE GESTURE ACTUALLY INITIATED, RECORDED AT `dragstart`.
   *
   * A settle-poll on the source tile proves a geometric precondition. It does
   * NOT prove which tile supplied the payload the browser then dragged, and the
   * review of PR #137 showed the difference is not theoretical (see
   * `settledPointOnSelector` above). So the source discriminator has to cover
   * DRAG INITIATION: a document-level listener records the element the drag
   * started on and the `text/plain` body it carried, and every gesture asserts
   * that body names the card the leg asked for.
   *
   * ⭐ `dragstart` is the one moment the payload is readable: its drag data
   * store is in READ/WRITE mode, unlike `dragover`'s protected mode where only
   * `dataTransfer.types` can be seen. Reading it here therefore needs NO change
   * to the product's §7.1 MIME contract — the harness observes what the app
   * already writes.
   *
   * ⚠ BUBBLE PHASE, DELIBERATELY. React 19 delegates its listeners at the
   * `#root` container, so a document-level CAPTURE listener would run BEFORE
   * `CardPalette.handleDragStart` has called `setData` and would read nothing.
   */
  const armDragStartProbe = (ctx: Ctx) =>
    ctx.window.evaluate(() => {
      const w = window as unknown as {
        __f5DragStarts?: { sourceTestId: string | null; raw: string | null }[];
        __f5DragProbeArmed?: boolean;
      };
      w.__f5DragStarts = [];
      if (w.__f5DragProbeArmed) return;
      w.__f5DragProbeArmed = true;
      document.addEventListener('dragstart', (event) => {
        const tile = (event.target as HTMLElement | null)?.closest?.(
          '[data-testid^="palette-card-"]',
        ) as HTMLElement | null;
        let raw: string | null = null;
        try {
          raw = event.dataTransfer?.getData('text/plain') ?? null;
        } catch {
          raw = null;
        }
        w.__f5DragStarts?.push({
          sourceTestId: tile?.getAttribute('data-testid') ?? null,
          raw,
        });
      });
    });

  /**
   * The M1 assertion. It runs on EVERY leg that uses `palettePointerDrag`,
   * because the wrong-card defect's root cause is shared by all of them — fixing
   * L11 alone would have patched the instance and left the class.
   */
  const expectDragStartedFromTile = async (ctx: Ctx, cardType: string) => {
    const records = await ctx.window.evaluate(
      () =>
        (
          window as unknown as {
            __f5DragStarts?: { sourceTestId: string | null; raw: string | null }[];
          }
        ).__f5DragStarts ?? [],
    );

    expect(records, 'the gesture must initiate exactly one dragstart').toHaveLength(1);
    expect(
      records[0].sourceTestId,
      `the drag must start on palette-card-${cardType}, not another tile`,
    ).toBe(`palette-card-${cardType}`);
    expect(records[0].raw, 'dragstart must carry a text/plain payload').toBeTruthy();

    let carried: unknown;
    try {
      carried = (JSON.parse(records[0].raw as string) as { cardType?: unknown }).cardType;
    } catch {
      throw new Error(`the dragstart payload was not JSON: ${String(records[0].raw)}`);
    }
    expect(carried, 'the INITIATED payload must name the requested card').toBe(cardType);
  };

  /**
   * The REAL palette gesture: press on the tile, make a short move near the
   * source (this is what makes Chromium begin the native drag — see the gesture
   * policy note above), then travel to the target point and release.
   *
   * ⚠⚠ THE TARGET POINT IS RESOLVED **AFTER** THE TILE IS REVEALED, AND THAT
   * ORDER IS LOAD-BEARING. Revealing a tile filters the palette, which reflows
   * the layout; a point measured before that is stale, and the drop then lands
   * somewhere else — a DIFFERENT row of §7.3's contract table, i.e. a silently
   * different assertion. Measured the hard way: an earlier revision of this
   * helper measured first and every section-body leg failed while the
   * card-wrapper legs passed, and an instrumented diagnostic showed the product
   * path itself working perfectly for the very gesture the leg reported as
   * broken. The instrument was wrong, not the product.
   *
   * ⚠⚠ AND THE SOURCE IS SETTLED TWICE, WHICH IS THE OTHER HALF OF THE M1
   * REPAIR. Settling it first absorbs the filter reflow so the TARGET below is
   * measured against a layout that has stopped moving; settling it again
   * immediately before the press closes the window the review named — the old
   * helper measured the source, then resolved the target, then pressed, and the
   * palette could reflow in between.
   */
  const palettePointerDrag = async (
    ctx: Ctx,
    cardType: string,
    resolvePoint: () => Promise<{ x: number; y: number }>,
  ) => {
    await revealPaletteTile(ctx, cardType);
    const sourceSelector = `[data-testid="palette-card-${cardType}"]`;

    await settledPointOnSelector(ctx, sourceSelector);
    const point = await resolvePoint();
    const { x: sx, y: sy } = await settledPointOnSelector(ctx, sourceSelector);

    await armDragStartProbe(ctx);

    await ctx.window.mouse.move(sx, sy);
    await ctx.window.mouse.down();
    // The short move near the SOURCE is what starts the native drag; without it
    // Chromium emits only mousedown/mouseup and no dragstart at all.
    await ctx.window.mouse.move(sx + 12, sy + 12);
    await ctx.window.mouse.move(point.x, point.y);
    await ctx.window.mouse.move(point.x, point.y + 1);
    await ctx.window.mouse.up();

    // A wrong-card gesture now fails on the SOURCE, loudly, instead of quietly
    // exercising a different row of §7.3's contract table behind assertions that
    // only count cards.
    await expectDragStartedFromTile(ctx, cardType);

    await ctx.window.getByTestId('card-search').fill('');
  };

  /** Drag a palette card onto the settled centre of a testid'd element. */
  const palettePointerDragToTestId = (ctx: Ctx, cardType: string, testId: string) =>
    palettePointerDrag(ctx, cardType, () => settledPointOn(ctx, testId));

  /** Drag a palette card onto the settled centre of a CSS-selected element. */
  const palettePointerDragToSelector = (ctx: Ctx, cardType: string, selector: string) =>
    palettePointerDrag(ctx, cardType, () => settledPointOnSelector(ctx, selector));

  /**
   * A point inside section `si` that belongs to the section's OWN body — neither
   * a card nor the toolbar — verified with `elementFromPoint` rather than
   * assumed. Without this check a "section body" leg can silently become a
   * toolbar or card leg, which is a different row of the contract table.
   */
  const bareSectionBodyPoint = async (ctx: Ctx, si: number) => {
    const section = ctx.window.getByTestId(`sections-canvas-section-${si}`);
    const sbox = await section.boundingBox();
    const cards = section.getByTestId('canvas-card');
    const last = await cards.nth((await cards.count()) - 1).boundingBox();
    if (!sbox || !last) throw new Error(`no boxes for section ${si}`);

    const point = { x: last.x + last.width + 24, y: last.y + last.height / 2 };
    expect(point.x).toBeLessThan(sbox.x + sbox.width);

    const hit = await ctx.window.evaluate(({ x, y }) => {
      const el = document.elementFromPoint(x, y) as HTMLElement | null;
      return {
        inCard: !!el?.closest('[data-testid="canvas-card"]'),
        inToolbar: !!el?.closest('[data-testid^="section-toolbar-"]'),
        inSection: !!el?.closest('[data-testid^="sections-canvas-section-"]'),
      };
    }, point);
    expect(hit.inCard, 'the bare point must not be on a card').toBe(false);
    expect(hit.inToolbar, 'the bare point must not be on the toolbar').toBe(false);
    expect(hit.inSection, 'the bare point must be inside the section').toBe(true);

    return point;
  };

  /**
   * A DISPATCHED palette drop with an EXPLICITLY POPULATED DataTransfer. Used
   * where a leg needs a fully-controlled payload (L12 above all) — by design,
   * not as a fallback for the real gesture.
   *
   * ⚠ The existing `dispatchCardDrag` helper builds a bare `new DataTransfer()`
   * and sets NO data, so it would exercise nothing in the type-discriminated
   * palette path. Both MIMEs must be set or the leg measures nothing.
   */
  const dispatchPaletteDrop = (ctx: Ctx, targetSelector: string, payload: string) =>
    ctx.window.evaluate(
      ({ targetSelector: dst, payload: body }) => {
        const target = document.querySelector(dst);
        if (!target) throw new Error(`palette drop target not found: ${dst}`);
        const dataTransfer = new DataTransfer();
        dataTransfer.setData('text/plain', body);
        dataTransfer.setData('application/x-havdm-palette-card', body);
        // ⚠ THE INSTRUMENT CHECKS ITSELF. `acceptsPaletteDrag` discriminates on
        // the marker's MEMBERSHIP IN `types`, so a payload the browser declined
        // to register — an EMPTY body is the case that makes this a real risk —
        // would be refused for the wrong reason and the leg would silently
        // measure nothing at all.
        if (!Array.from(dataTransfer.types).includes('application/x-havdm-palette-card')) {
          throw new Error(
            `the dispatched DataTransfer did not carry the palette marker for payload ${JSON.stringify(body)}`,
          );
        }
        const fire = (type: string) =>
          target.dispatchEvent(
            new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }),
          );
        fire('dragover');
        fire('drop');
      },
      { targetSelector, payload },
    );

  const sectionCards = (ctx: Ctx, si: number) =>
    ctx.window.getByTestId(`sections-canvas-section-${si}`).getByTestId('canvas-card');

  /**
   * Every `data-*` attribute of a debug-state element, as one comparable object.
   *
   * ⭐ These are EXISTING test surfaces (`selection-debug-state` and
   * `history-debug-state` are both rendered under `isTestEnv()` in `App.tsx`),
   * so proving "changes no config" needed no new product code — which matters,
   * because the review cleared the product and the repair is a proof repair.
   */
  const debugSnapshot = (ctx: Ctx, testId: string) =>
    ctx.window.evaluate((id) => {
      const el = document.querySelector(`[data-testid="${id}"]`);
      if (!el) throw new Error(`missing debug-state element: ${id}`);
      return Object.fromEntries(
        Array.from(el.attributes)
          .filter((attr) => attr.name.startsWith('data-') && attr.name !== 'data-testid')
          .map((attr) => [attr.name, attr.value]),
      ) as Record<string, string>;
    }, testId);

  /**
   * Resize the real BrowserWindow AND the renderer viewport — the same two calls
   * the shared launcher makes at `tests/support/electron.ts:226-237`, which pins
   * every other test to 1920x1080.
   */
  const setWindowSize = async (ctx: Ctx, size: { width: number; height: number }) => {
    await ctx.app.evaluate(({ BrowserWindow }, bounds) => {
      const win = BrowserWindow.getAllWindows()[0];
      if (win) win.setBounds({ x: 0, y: 0, width: bounds.width, height: bounds.height });
    }, size);
    await ctx.window.setViewportSize(size);
  };

  // --- L1 -------------------------------------------------------------------
  test('F5 L1: palette drop on a populated section body appends as the last card', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, EMPTY_SECTION_YAML);
      await expect(window.getByTestId('sections-canvas')).toBeVisible();
      await expect(sectionCards(ctx, 0)).toHaveCount(2);

      await palettePointerDrag(ctx, 'markdown', () => bareSectionBodyPoint(ctx, 0));

      // RED on base: the drop is refused, so nothing lands and nothing is last.
      await expect(sectionCards(ctx, 0)).toHaveCount(3);
      // The new card is LAST — asserted as an INDEX, not merely a count: the two
      // fixture cards keep slots 0 and 1, and the markdown default body occupies
      // slot 2. (A markdown card renders its default content, not the word
      // "Markdown" — the palette label never reaches the canvas.)
      await expect(sectionCards(ctx, 0).nth(0)).toContainText('SEC-ORIGINAL');
      await expect(sectionCards(ctx, 0).nth(1)).toContainText('SEC-SECOND');
      await expect(sectionCards(ctx, 0).nth(2)).toContainText('Your content here');
      // GREEN on base (nothing changes anywhere) — and REQUIRED: this is the
      // assertion that catches an implementation writing into the wrong section.
      await expect(sectionCards(ctx, 1)).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });

  // --- L2 -------------------------------------------------------------------
  test('F5 L2: palette drop on an EMPTY section places a card in it', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, EMPTY_SECTION_YAML);
      await expect(window.getByTestId('section-empty-1')).toBeVisible();

      await palettePointerDragToTestId(ctx, 'markdown', 'section-empty-1');

      // The tester's exact complaint: "Cannot drag cards into any section if the
      // section is empty."
      await expect(sectionCards(ctx, 1)).toHaveCount(1);
      await expect(window.getByTestId('section-empty-1')).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });

  // --- L3 + L15 -------------------------------------------------------------
  test('F5 L3: palette drop on an existing card inserts at that card index', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, EMPTY_SECTION_YAML);
      await expect(sectionCards(ctx, 0)).toHaveCount(2);
      await expect(sectionCards(ctx, 0).nth(0)).toContainText('SEC-ORIGINAL');

      // The target is addressed by its own (si, ci) and settle-verified, like
      // every other gesture target in this block: an unpolled box measurement is
      // the same momentary observation the source used to make, and this leg
      // would otherwise be the one place it survived.
      await palettePointerDragToSelector(
        ctx,
        'markdown',
        '[data-testid="canvas-card"][data-section-index="0"][data-card-index="0"]',
      );

      // Inserted AT index 0 — the previously-there card shifts down.
      await expect(sectionCards(ctx, 0)).toHaveCount(3);
      await expect(sectionCards(ctx, 0).nth(1)).toContainText('SEC-ORIGINAL');
      // Exactly one card per drop: without stopPropagation the event would
      // bubble to the section body and BOTH handlers would insert.
      await expect(window.getByTestId('canvas-card')).toHaveCount(3);
    } finally {
      await close(ctx);
    }
  });

  test('F5 L15: palette drop on a CONTAINER card makes a sibling, not a child', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, STACK_SECTION_YAML);
      await expect(window.getByTestId('sections-canvas')).toBeVisible();
      await expect(sectionCards(ctx, 0)).toHaveCount(1);

      // The container's OWN children, addressed separately from the section's
      // top-level cards. A nested child is not a `canvas-card`, so these two
      // locators can never be confused with one another.
      const stackChildren = window.getByTestId('vertical-stack-container').locator('> div');
      await expect(stackChildren).toHaveCount(2);

      // ⚠⚠ THE GESTURE MUST LAND ON THE CONTAINER'S OWN CARD WRAPPER, NOT ON THE
      // SECTION THAT HOLDS IT. This leg used to aim at the centre of
      // `sections-canvas-section-0` — the whole section — and the settle-poll
      // accepted any descendant whose `closest()` was that section, so it never
      // established that the pointer was on the vertical stack at all. An
      // implementation that appended from the SECTION-BODY branch satisfied
      // every assertion this leg then made, while violating AC 21's "sibling AT
      // THAT CARD'S INDEX". Selecting the wrapper by its own (si, ci) attributes
      // makes the settle-poll prove the pointer is on the container itself.
      await palettePointerDragToSelector(
        ctx,
        'markdown',
        '[data-testid="canvas-card"][data-section-index="0"][data-card-index="0"]',
      );

      // RED on base (nothing lands): the section now holds TWO top-level cards.
      await expect(sectionCards(ctx, 0)).toHaveCount(2);

      // ⭐⭐⭐ RED on base, and THE AC 21 DISCRIMINATOR: the new card takes the
      // container's former index 0. An append-from-the-section-body
      // implementation puts it at index 1 and passes the count above — which is
      // exactly the hole this leg had. This is the owner's DEFERRED-NESTING
      // ruling made executable: a drop on a container inside a section is a
      // SIBLING at that index, unlike the flat canvas's PROPS-06 nesting.
      await expect(sectionCards(ctx, 0).nth(0)).toContainText('Your content here');
      await expect(sectionCards(ctx, 0).nth(0)).not.toContainText('STACK-CHILD-A');

      // RED on base: the container SHIFTED DOWN to index 1, carrying both
      // children with it.
      await expect(sectionCards(ctx, 0).nth(1)).toContainText('STACK-CHILD-A');
      await expect(sectionCards(ctx, 0).nth(1)).toContainText('STACK-CHILD-B');

      // GREEN on base (nothing lands, so the stack is trivially unchanged) — and
      // this is the half that pins the ruling on the branch: the container's
      // child list is EXACTLY unchanged, in count and in order, so nothing
      // nested. Adding nesting later must break this leg rather than change
      // behaviour silently.
      await expect(stackChildren).toHaveCount(2);
      await expect(stackChildren.nth(0)).toContainText('STACK-CHILD-A');
      await expect(stackChildren.nth(1)).toContainText('STACK-CHILD-B');
    } finally {
      await close(ctx);
    }
  });

  // --- L4 -------------------------------------------------------------------
  test('F5 L4: palette drop on a section TOOLBAR appends into that section', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, EMPTY_SECTION_YAML);
      await expect(sectionCards(ctx, 1)).toHaveCount(0);

      await palettePointerDragToTestId(ctx, 'markdown', 'section-toolbar-1');

      // The toolbar carries no drop handler of its own — this proves the event
      // bubbles to the section body, the same mechanism the empty-section
      // placeholder relies on.
      await expect(sectionCards(ctx, 1)).toHaveCount(1);
      await expect(sectionCards(ctx, 0)).toHaveCount(2);
      void window;
    } finally {
      await close(ctx);
    }
  });

  // --- L5 -------------------------------------------------------------------
  test('F5 L5: palette drop on the canvas BACKGROUND adds nothing', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, EMPTY_SECTION_YAML);
      await expect(window.getByTestId('canvas-card')).toHaveCount(2);

      // ⭐ AC 5 has TWO clauses — "changes no config" AND "adds no card" — and
      // counting cards proves only the second. A background handler could write
      // an equivalent config, push an undo entry or move the selection while the
      // count stayed at two. These snapshots are the first clause's observables:
      // `isDirty` (every config write path sets it, so the absent dirty asterisk
      // means no write of any kind landed), the undo/redo stacks, and the whole
      // selection tuple. A replace load starts clean, so the pre-drop state is
      // itself asserted rather than assumed.
      const dirtyIndicator = window.getByTestId('dashboard-dirty-indicator');
      await expect(dirtyIndicator).toHaveCount(0);
      const historyBefore = await debugSnapshot(ctx, 'history-debug-state');
      const selectionBefore = await debugSnapshot(ctx, 'selection-debug-state');
      expect(historyBefore['data-past-length']).toBe('0');
      expect(historyBefore['data-future-length']).toBe('0');

      // Below the sections grid: canvas root, deliberately NOT a drop target, so
      // the browser shows a "no drop" cursor — a visible refusal rather than a
      // card teleporting into a section the user did not aim at.
      await palettePointerDrag(ctx, 'markdown', async () => {
        const canvas = await window.getByTestId('sections-canvas').boundingBox();
        const grid = await window.getByTestId('sections-canvas-grid').boundingBox();
        if (!canvas || !grid) throw new Error('no canvas/grid box');
        const belowGrid = grid.y + grid.height + 30;
        expect(belowGrid).toBeLessThan(canvas.y + canvas.height);
        const point = { x: canvas.x + canvas.width / 2, y: belowGrid };

        // The point must be the BACKGROUND, verified rather than assumed — a
        // point that had drifted into a section would make this leg silently
        // assert the opposite of what it is named for.
        const hit = await ctx.window.evaluate(
          ({ x, y }) => {
            const el = document.elementFromPoint(x, y) as HTMLElement | null;
            return {
              inSection: !!el?.closest('[data-testid^="sections-canvas-section-"]'),
              inCanvas: !!el?.closest('[data-testid="sections-canvas"]'),
            };
          },
          { ...point },
        );
        expect(hit.inSection, 'the background point must not be inside a section').toBe(false);
        expect(hit.inCanvas, 'the background point must still be on the canvas').toBe(true);
        return point;
      });

      // ⚠ NOT a control leg: on base every palette drop is refused, so this
      // passes for the wrong reason there. It discriminates only on the branch,
      // where it pins that the fix did not over-broaden.
      await expect(window.getByTestId('canvas-card')).toHaveCount(2);
      // AC 5's "changes no config" clause, directly observed.
      await expect(dirtyIndicator).toHaveCount(0);
      expect(await debugSnapshot(ctx, 'history-debug-state')).toEqual(historyBefore);
      expect(await debugSnapshot(ctx, 'selection-debug-state')).toEqual(selectionBefore);
    } finally {
      await close(ctx);
    }
  });

  // --- L6 -------------------------------------------------------------------
  test('F5 L6: the dropped card becomes the selection', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { canvas, window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, EMPTY_SECTION_YAML);
      await expect(window.getByTestId('canvas-card')).toHaveCount(2);

      // ⚠ FIXTURE-CRITICAL: the pre-drop selection must DIFFER from the expected
      // post-drop address, or both assertions below could pass on base for the
      // wrong reason. Select card 0 of SECTION 0; the drop lands in SECTION 1.
      await canvas.selectCard(0);
      const debug = window.getByTestId('selection-debug-state');
      await expect(debug).toHaveAttribute('data-selected-section', '0');

      await palettePointerDragToTestId(ctx, 'markdown', 'section-empty-1');

      await expect(debug).toHaveAttribute('data-selected-section', '1');
      await expect(debug).toHaveAttribute('data-selected-card', '0');
    } finally {
      await close(ctx);
    }
  });

  // --- L7 -------------------------------------------------------------------
  test('F5 L7: one drop is one Ctrl+Z, and Ctrl+Y re-applies it', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { appDSL, window } = ctx;
    try {
      await appDSL.waitUntilReady();
      await loadYaml(ctx, EMPTY_SECTION_YAML);
      await expect(sectionCards(ctx, 1)).toHaveCount(0);

      await palettePointerDragToTestId(ctx, 'markdown', 'section-empty-1');
      // RED half on base: no drop happens, so there is nothing to undo or redo.
      await expect(sectionCards(ctx, 1)).toHaveCount(1);

      await appDSL.undo();
      // GREEN half on base: a replace load starts with EMPTY history and the
      // refused drop pushes none, so Ctrl+Z is a no-op over an already-pre-drop
      // list. On the branch it proves the drop pushed exactly ONE entry.
      await expect(sectionCards(ctx, 1)).toHaveCount(0);
      await expect(window.getByTestId('section-empty-1')).toBeVisible();

      await appDSL.redo();
      await expect(sectionCards(ctx, 1)).toHaveCount(1);
    } finally {
      await close(ctx);
    }
  });

  // --- L8 -------------------------------------------------------------------
  test('F5 L8: with no section selected, the marked section receives a double-click add', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { palette, window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      // A FRESH process with no prior document: selectedSectionIndex is the
      // store's initial null, so this is the genuine no-selection case.
      await loadYaml(ctx, EMPTY_SECTION_YAML);
      await expect(window.getByTestId('selection-debug-state')).toHaveAttribute(
        'data-selected-section',
        'null',
      );

      // RED half on base: no marker exists at all.
      await expect(window.getByTestId('section-add-target-0')).toBeVisible();
      await expect(window.getByTestId('sections-canvas-section-0')).toHaveAttribute(
        'data-target-section',
        'true',
      );

      await palette.addCard('markdown');

      // GREEN half on base — and REQUIRED: without it L8 proves only half of
      // AC 9. With initial state null the add already fell back to section 0, so
      // this pins that the marker points where the card actually goes.
      await expect(sectionCards(ctx, 0)).toHaveCount(3);
      await expect(sectionCards(ctx, 1)).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });

  // --- L9 -------------------------------------------------------------------
  test('F5 L9: Add section marks the new last section and a double-click add lands there', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { palette, window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, EMPTY_SECTION_YAML);
      await expect(window.getByTestId('sections-canvas')).toBeVisible();

      await window.getByTestId('section-add-button').click();
      await expect(window.getByTestId('sections-canvas-section-2')).toBeVisible();

      // GREEN on base: this pins §7.4's MEASURED claim about what "Add section"
      // stores — the loose end Fable review §3.7 asked to close. `handleSectionAdd`
      // takes its atIndex === undefined branch and selects sections.length - 1.
      await expect(window.getByTestId('selection-debug-state')).toHaveAttribute(
        'data-selected-section',
        '2',
      );

      // RED on base: no marker.
      await expect(window.getByTestId('section-add-target-2')).toBeVisible();

      await palette.addCard('markdown');

      // GREEN on base: the tester's VIEWS-04 sequence already landed here.
      await expect(sectionCards(ctx, 2)).toHaveCount(1);
    } finally {
      await close(ctx);
    }
  });

  // --- L10 ------------------------------------------------------------------
  test('F5 L10: palette drop into a view with ZERO sections warns and adds nothing', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, NO_SECTIONS_YAML);
      await expect(window.getByTestId('sections-canvas-empty')).toBeVisible();

      await palettePointerDragToTestId(ctx, 'markdown', 'sections-canvas-empty');

      // RED half on base: base refuses the gesture silently and emits no warning.
      await expect(
        window
          .locator('.ant-message')
          .getByText('This sections view has no sections to add a card to'),
      ).toBeVisible();
      // GREEN half on base (nothing is added because the gesture is refused).
      await expect(window.getByTestId('canvas-card')).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });

  // --- L11 ------------------------------------------------------------------
  test('F5 L11: a dropped entities card gets its default title and no layout keys', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window, yamlEditor } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, EMPTY_SECTION_YAML);

      await palettePointerDragToTestId(ctx, 'entities', 'section-empty-1');
      await expect(sectionCards(ctx, 1)).toHaveCount(1);

      // The dropped card is selected (§7.6 step 5), so the Properties YAML tab
      // shows exactly it.
      await ctx.properties.switchTab('YAML');
      const yaml = await yamlEditor.getEditorContent('properties');
      expect(yaml).toContain('New Entities');
      // A sections card is a POSITIONLESS list entry.
      expect(yaml).not.toContain('_havdm_layout');
      expect(yaml).not.toContain('view_layout');
      void window;
    } finally {
      await close(ctx);
    }
  });

  // --- L12 ------------------------------------------------------------------
  test('F5 L12: a malformed palette payload writes nothing (control, green on base)', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { canvas, window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, EMPTY_SECTION_YAML);
      await canvas.selectCard(0);
      const debug = window.getByTestId('selection-debug-state');
      await expect(debug).toHaveAttribute('data-selected-card', '0');

      const dirtyIndicator = window.getByTestId('dashboard-dirty-indicator');
      await expect(dirtyIndicator).toHaveCount(0);
      const historyBefore = await debugSnapshot(ctx, 'history-debug-state');
      const selectionBefore = await debugSnapshot(ctx, 'selection-debug-state');

      // AC 17 names THREE payload shapes — malformed, EMPTY, and unknown card
      // type — and the empty one has its own production branch (`if (!raw)` in
      // `SectionsCanvas.paletteCardTypeFrom`) that nothing here reached. A
      // payload that parses to `{}` is not an empty payload; it is a well-formed
      // object with no `cardType`, and it exits two branches later.
      const target = '[data-testid="sections-canvas-section-0"]';
      await dispatchPaletteDrop(ctx, target, 'this is not json');
      await dispatchPaletteDrop(ctx, target, '');
      await dispatchPaletteDrop(ctx, target, JSON.stringify({}));
      await dispatchPaletteDrop(ctx, target, JSON.stringify({ cardType: 'no-such-card-type' }));

      // ⚠ GREEN ON BASE IN EVERY ASSERTION — a branch-side over-broadening
      // CONTROL, not a red leg. On base a dispatched drop reaches `dropOn`,
      // which returns at `if (!from || !onCardMove)` and writes nothing either.
      // Its value is entirely on the branch: it discriminates a correct
      // implementation from one that writes, warns, or pushes undo on garbage.
      await expect(window.getByTestId('canvas-card')).toHaveCount(2);
      await expect(debug).toHaveAttribute('data-selected-section', '0');
      await expect(debug).toHaveAttribute('data-selected-card', '0');
      await expect(window.locator('.ant-message')).toHaveCount(0);

      // "Writes no config" observed directly rather than inferred from a card
      // count: no dirty flag, no history push, no selection movement.
      await expect(dirtyIndicator).toHaveCount(0);
      expect(await debugSnapshot(ctx, 'history-debug-state')).toEqual(historyBefore);
      expect(await debugSnapshot(ctx, 'selection-debug-state')).toEqual(selectionBefore);

      // No undo entry was pushed: Ctrl+Z must not walk back past the load.
      await ctx.appDSL.undo();
      await expect(window.getByTestId('canvas-card')).toHaveCount(2);
    } finally {
      await close(ctx);
    }
  });

  // --- L13 ------------------------------------------------------------------
  test('F5 L13: the target marker does not displace the section toolbar controls', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      // max_columns 1 => a ONE-COLUMN section.
      await loadYaml(ctx, EMPTY_SECTION_YAML.replace('max_columns: 2', 'max_columns: 1'));
      await expect(window.getByTestId('sections-canvas')).toBeVisible();

      // ⚠⚠ `max_columns: 1` ALONE DOES NOT MAKE A NARROW SECTION, and this leg
      // used to claim it did. The shared launcher pins every test to 1920x1080
      // (`tests/support/electron.ts:226-237`), where one column makes the
      // section WIDER, not narrower — so AC 18's "at the suite's narrowest
      // window" clause was never exercised. The window itself has to shrink.
      const section = window.getByTestId('sections-canvas-section-0');
      const wideBox = await section.boundingBox();
      if (!wideBox) throw new Error('no section box at the launcher width');

      const NARROW = { width: 900, height: 800 };
      await setWindowSize(ctx, NARROW);
      expect(window.viewportSize()).toEqual(NARROW);

      // The narrowness is MEASURED against the launcher's own default, not
      // asserted — a bounded viewport is only evidence if the layout it produces
      // is demonstrably narrower than the one every other test runs at.
      await expect
        .poll(async () => (await section.boundingBox())?.width ?? Number.POSITIVE_INFINITY, {
          message: 'the section must reflow narrower than the launcher default',
        })
        .toBeLessThan(wideBox.width);
      const narrowBox = await section.boundingBox();
      if (!narrowBox) throw new Error('no section box at the narrow width');
      expect(narrowBox.width).toBeLessThan(NARROW.width);

      // RED half on base: no marker exists.
      await expect(window.getByTestId('section-add-target-0')).toBeVisible();

      // The marker occupies no part of the toolbar's flex row — asserted at the
      // NARROW width, where a flex row is most likely to wrap or overlap.
      const markerBox = await window.getByTestId('section-add-target-0').boundingBox();
      const toolbarBox = await window.getByTestId('section-toolbar-0').boundingBox();
      if (!markerBox || !toolbarBox) throw new Error('no marker/toolbar box');
      expect(markerBox.y).toBeGreaterThanOrEqual(toolbarBox.y + toolbarBox.height - 1);

      // GREEN half on base — and the POINT of the leg: it proves the marker did
      // not displace the controls it sits next to.
      const handle = window.getByTestId('section-drag-handle-0');
      const heading = window.getByTestId('section-title-input-0');
      await expect(handle).toBeVisible();
      await expect(heading).toBeVisible();
      await expect(window.getByTestId('section-delete-0')).toBeVisible();

      // ⚠⚠ VISIBLE IS NOT OPERABLE, and asserting visibility on all three while
      // operating only the heading is what let a marker overlay that DISABLES
      // reorder or Delete without hiding them pass this leg. All three are now
      // operated, each with its own outcome assertion, with the marker rendered.
      // Delete goes LAST because it destroys the section the others act on.

      // 1. HEADING — the rename commits.
      await heading.fill('Renamed Section');
      await heading.press('Enter');
      await expect(heading).toHaveValue('Renamed Section');

      // 2. REORDER HANDLE — hit-tested first (Playwright's hover actionability
      //    fails if anything covers the handle, which is precisely the overlay
      //    failure MUST NOT 8 guards against), then actually reordered.
      await handle.hover();
      await dispatchCardDrag(
        ctx,
        '[data-testid="section-drag-handle-0"]',
        '[data-testid="sections-canvas-section-1"]',
      );
      // Order was [Renamed Section, Empty One]; after the reorder it is
      // [Empty One, Renamed Section].
      await expect(window.getByTestId('section-title-input-0')).toHaveValue('Empty One');
      await expect(window.getByTestId('section-title-input-1')).toHaveValue('Renamed Section');

      // 3. DELETE — last, because it removes a section the assertions above
      //    depend on. The renamed section survives, which is what proves the
      //    click landed on the button it was aimed at.
      await window.getByTestId('section-delete-0').click();
      await expect(window.getByTestId('sections-canvas-section-1')).toHaveCount(0);
      await expect(window.getByTestId('section-title-input-0')).toHaveValue('Renamed Section');
    } finally {
      await close(ctx);
    }
  });

  // --- L14 ------------------------------------------------------------------
  test('F5 L14: loading a second dashboard clears the section selection', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { canvas, palette, window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();

      // ⚠ THE FIXTURE SECTION COUNTS ARE LOAD-BEARING. A must have >= 2 sections
      // so a card in SECTION 1 can be selected (with no selection, phase 1 would
      // pass on base). B must have >= 2 sections, or phase 2's "lands in section
      // 0" assertion would be vacuous.
      await loadYaml(ctx, DOC_A_YAML);
      await canvas.selectCard(1);
      const debug = window.getByTestId('selection-debug-state');
      await expect(debug).toHaveAttribute('data-selected-section', '1');

      await loadYaml(ctx, DOC_B_YAML);
      await expect(window.getByTestId('sections-canvas')).toContainText('B-CARD-0');

      // PHASE 1 — RED on base: zustand's `set` merges partially and
      // `loadDashboard` never wrote this field, so the index selected in
      // document A survived into document B.
      await expect(debug).toHaveAttribute('data-selected-section', 'null');

      // PHASE 2 — RED on base: the add followed the retained index into
      // section 1, and no marker existed to show it.
      await expect(window.getByTestId('section-add-target-0')).toBeVisible();
      await palette.addCard('markdown');
      await expect(sectionCards(ctx, 0)).toHaveCount(2);
      await expect(sectionCards(ctx, 1)).toHaveCount(1);
    } finally {
      await close(ctx);
    }
  });

  // --- L16 ------------------------------------------------------------------
  test("F5 L16: applying dashboard YAML clears the section selection (mode: 'edit')", async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { canvas, window, yamlEditor } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();

      // ⚠⚠ WHY THIS LEG EXISTS. §9.7 warns that the one-line `loadDashboard`
      // reset touches EVERY load path, and `mode: 'edit'` is the one branch
      // where that `set` is partly conditional — `past`/`future`/`isDirty` are
      // spread per-mode while the five selection fields sit in the
      // unconditional part (`src/store/dashboardStore.ts:160,183-194`). It was
      // also the only production load call site with NO end-to-end consumer:
      // `grep -rn "Apply & Reload" tests/` returned nothing across the whole
      // suite, so every existing Apply test stops at the confirmation dialog
      // (`tests/integration/monaco-editor.spec.ts:182-200`) and the callback
      // that reaches `loadDashboard` was never invoked by any test.
      await loadYaml(ctx, DOC_A_YAML);
      await canvas.selectCard(1);
      const debug = window.getByTestId('selection-debug-state');
      await expect(debug).toHaveAttribute('data-selected-section', '1');

      await yamlEditor.open();
      await yamlEditor.setEditorContent(DOC_B_YAML, 'modal');

      // Apply raises a confirmation; only its OK handler calls `onApply`, which
      // is what reaches `handleApplyYamlChanges` -> `loadDashboard(..., { mode:
      // 'edit' })` (`src/App.tsx:2445`). Crossing it is the whole point.
      await window.getByTestId('yaml-apply-button').click();
      await window.getByRole('button', { name: /Apply & Reload Canvas/i }).click();
      // ⚠ HIDDEN, NOT ABSENT. `<Modal data-testid="yaml-editor-modal" forceRender>`
      // renders eagerly and a closed antd Modal KEEPS its DOM, so `toHaveCount(0)`
      // is not satisfiable — which is why the assertion is made against the inner
      // content div. The repository already had this written down
      // (`tests/integration/bulk-operations.spec.ts:76-78`), and the first draft
      // of this leg copied `yamlEditor.close()`'s `toHaveCount(0)` anyway and
      // failed on it.
      //
      // ⓘ THE FULL SIBLING INVENTORY, swept rather than re-read:
      //     grep -rn "yaml-editor-modal" tests/support
      //   1. `tests/support/dsl/yamlEditor.ts:92`   — `close()`
      //   2. `tests/support/dsl/yamlEditor.ts:106`  — `apply()`
      //   3. `tests/support/assertions/yaml.ts:23`  — `expectYamlEditorModalHidden()`
      // All three assert `toHaveCount(0)` on the same force-rendered Modal.
      // ⚠ And the sweep found one more thing than a sibling count would: the
      // SAME testid is asserted `toBeVisible()` at `tests/support/assertions/yaml.ts:14`,
      // which is broken in the OPPOSITE direction — antd puts the attribute on
      // `.ant-modal-root`, which is always reported hidden (the reason
      // `tests/support/dsl/presetMarketplace.ts:16-19` tells callers to use
      // `.ant-modal-wrap` instead). So the defect is not "two or three bad
      // assertions" but "this testid is the wrong node to assert on at all".
      // ⓘ None of it has ever run — but state that precisely, because a looser
      // version of this sentence was itself a finding. The module IS reachable:
      // `tests/support/index.ts:66` re-exports it as `yamlAssertions` and 103
      // specs import that barrel. What is true is narrower and is what matters:
      // NO SPEC CALLS any of those helpers —
      //     grep -rnE 'yamlAssertions\.|expectYamlEditorModal[A-Za-z]*\(' \
      //       tests/e2e tests/integration --include=*.spec.ts \
      //       | grep -vE ':[0-9]+: *(//|\*)'
      // returns nothing — the comment filter matters, or this very block is a
      // hit. So the broken assertions ran in no published result.
      // ⚠ "No spec imports it" was an unverified universal reached by grepping
      // the file path instead of the barrel that re-exports it — the same
      // proxy-for-the-real-question error this PR keeps paying for.
      // Reported, NOT fixed here — repairing shared DSL is outside this finding,
      // and over-reach is the other half of the fix-round failure mode.
      await expect(window.getByTestId('yaml-editor-content').first()).toBeHidden({
        timeout: 10000,
      });
      await expect(window.getByTestId('sections-canvas')).toContainText('B-CARD-0');

      // RED on base: `loadDashboard` never wrote `selectedSectionIndex`, and
      // zustand's `set` merges partially, so section 1 of document A survived
      // into document B — through the edit path exactly as through the replace
      // path L14 covers.
      await expect(debug).toHaveAttribute('data-selected-section', 'null');
      // RED on base: no marker existed to show where an add would land.
      await expect(window.getByTestId('section-add-target-0')).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  // --- L17 ------------------------------------------------------------------
  test('F5 L17: File > Open Recent clears the section selection', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { canvas, window } = ctx;
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'havdm-f5-recent-'));
    const docBPath = path.join(dir, 'doc-b.yaml');
    try {
      // ⚠⚠ WHY THIS LEG EXISTS, AND IT IS A ROUND-2 FINDING AGAINST MY OWN
      // ROUND-1 REPAIR. The corrected sweep named `tests/e2e/recent-files.spec.ts`
      // as the consumer of `App.handleOpenRecentFile` (`src/App.tsx:648-665`).
      // It is not: that file tests Save As registration, retargeting,
      // cancellation and export exclusion, and never opens a recent file.
      // Measured — `grep -rln "open-recent\|openRecentFile" tests/e2e tests/integration`
      // returned NOTHING, so this production load call site had no consumer at
      // all. Naming a spec that merely MENTIONS a feature is the same error, one
      // level up, as the token-grep the round-1 finding was about.
      fs.writeFileSync(docBPath, DOC_B_YAML, 'utf8');

      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, DOC_A_YAML);
      await canvas.selectCard(1);
      const debug = window.getByTestId('selection-debug-state');
      await expect(debug).toHaveAttribute('data-selected-section', '1');

      // Drive the REAL renderer subscription. `src/menu.ts:31` sends exactly
      // this channel with exactly this payload when a Recent Files item is
      // clicked, and `src/App.tsx:2838-2847` is what receives it — so
      // everything after the OS menu itself is production code.
      // ⓘ No unsaved-changes prompt intervenes: a replace load leaves
      // `isDirty` false and selection alone does not set it, so
      // `confirmReplacingCurrentDashboard` returns immediately.
      await ctx.app.evaluate(({ BrowserWindow }, p) => {
        BrowserWindow.getAllWindows()[0]?.webContents.send('menu:open-recent-file', p);
      }, docBPath);

      await expect(window.getByTestId('sections-canvas')).toContainText('B-CARD-0');

      // RED on base: `loadDashboard` never wrote `selectedSectionIndex`, so
      // document A's section 1 survived into document B through Open Recent
      // exactly as through the other load paths.
      await expect(debug).toHaveAttribute('data-selected-section', 'null');
      // RED on base: no marker existed to show where an add would land.
      await expect(window.getByTestId('section-add-target-0')).toBeVisible();
    } finally {
      await close(ctx);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  // --- C5 (control leg) -----------------------------------------------------
  test('F5 C5 (control): an INTERNAL card drag into an EMPTY section still works', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, EMPTY_SECTION_YAML);
      await expect(window.getByTestId('section-empty-1')).toBeVisible();

      // ⭐ MEASURED ON BASE BEFORE ANY FIX CODE (spec §9.6 item 1), by BOTH the
      // dispatch route and a real `dragTo`: both PASSED. §7.3's bubbling
      // assumption holds and there is no third VIEWS-04 defect. This leg is
      // therefore a genuine control — green on base AND on the branch — and its
      // job now is to prove the palette branch did not break the internal one.
      await window
        .getByTestId('section-card-body-0-0')
        .dragTo(window.getByTestId('section-empty-1'));

      await expect(sectionCards(ctx, 1)).toHaveCount(1);
      await expect(window.getByTestId('sections-canvas-section-1')).toContainText('SEC-ORIGINAL');
      await expect(sectionCards(ctx, 0)).toHaveCount(1);
    } finally {
      await close(ctx);
    }
  });
});
