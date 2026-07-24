import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

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
});
