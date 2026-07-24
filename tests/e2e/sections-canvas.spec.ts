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
      await expect(ctx.window.getByTestId('section-heading-0')).toContainText('Lights');
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
});
