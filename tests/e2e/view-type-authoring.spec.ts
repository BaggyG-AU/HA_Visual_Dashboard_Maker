import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

// View-TYPE authoring (Tier 4, slice 4.6b): change a view's type from the
// ViewSettingsDialog, including the two structural conversions —
// convert-to-Sections and convert-away-from-Sections — which PRESERVE cards.

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

const loadYaml = async (ctx: Ctx, yaml: string): Promise<void> => {
  await ctx.window.evaluate((y) => {
    const api = (window as unknown as { __dashboardTestApi?: { loadYaml: (y: string) => void } })
      .__dashboardTestApi;
    api?.loadYaml(y);
  }, yaml);
};

// Pick an option in the ViewSettings "View type" antd Select.
const chooseType = async (ctx: Ctx, label: string): Promise<void> => {
  await ctx.window.getByTestId('view-settings-type').click();
  await ctx.window
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option', {
      hasText: new RegExp(`^${label}$`),
    })
    .click();
};

const FLAT_POPULATED_YAML = `title: Flat
views:
  - title: Home
    path: home
    type: masonry
    cards:
      - type: button
        entity: light.a
      - type: button
        entity: light.b
`;

const SECTIONS_YAML = `title: Sections
views:
  - title: Home
    path: home
    type: sections
    max_columns: 4
    sections:
      - type: grid
        title: Lights
        cards:
          - type: button
            entity: light.a
      - type: grid
        cards:
          - type: button
            entity: light.b
`;

test.describe('View-type authoring (Tier 4, slice 4.6b)', () => {
  test('converts a POPULATED flat view to Sections, preserving the cards', async ({ page }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, FLAT_POPULATED_YAML);

      // Flat canvas, two cards, no sections canvas.
      await expect(window.getByTestId('canvas-card')).toHaveCount(2);
      await expect(window.getByTestId('sections-canvas')).toHaveCount(0);

      await window.getByTestId('view-settings-button').click();
      await expect(window.getByTestId('view-settings-save')).toBeVisible();
      await chooseType(ctx, 'Sections');
      // The lossy-conversion warning appears before Save (FR-026 confirmation).
      await expect(window.getByText(/Converting to Sections moves all cards/)).toBeVisible();
      await window.getByTestId('view-settings-save').click();

      // Now a Sections view: SectionsCanvas renders and BOTH cards survived.
      await expect(window.getByTestId('sections-canvas')).toBeVisible();
      await expect(window.getByTestId('canvas-card')).toHaveCount(2);
    } finally {
      await close(ctx);
    }
  });

  test('converts a Sections view away to Masonry, preserving cards + headings as markdown', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, SECTIONS_YAML);

      await expect(window.getByTestId('sections-canvas')).toBeVisible();
      await expect(window.getByTestId('canvas-card')).toHaveCount(2);

      await window.getByTestId('view-settings-button').click();
      await chooseType(ctx, 'Masonry');
      await expect(window.getByText(/Converting away from Sections/)).toBeVisible();
      await window.getByTestId('view-settings-save').click();

      // Flat masonry canvas now; the section heading became a markdown card, so
      // the two original cards + one "## Lights" heading card = 3, and the
      // heading text is visible.
      await expect(window.getByTestId('sections-canvas')).toHaveCount(0);
      await expect(window.getByTestId('canvas-card')).toHaveCount(3);
      await expect(window.getByText('Lights')).toBeVisible();
    } finally {
      await close(ctx);
    }
  });

  // ⚠ SEMANTIC FLIP (Tier 4, slice 4.7b) — this test previously asserted the
  // type control NEVER offers custom:grid-layout, which was the correct 4.6b
  // rule: back then the only meaning of that string was HAVDM's internal canvas
  // scaffold, and offering it would have let a user "choose" a type that the
  // export boundary immediately stripped.
  //
  // 4.7a made a real layout-card view first-class, and 4.7b adds the conversion
  // action that turns an ordinary view INTO one — so custom:grid-layout is now a
  // legitimate, explicitly-labelled choice. What must STILL hold is that the
  // scaffold itself reads as "Masonry" and is never silently presented as a
  // layout-card view. That is asserted below, alongside the new option.
  test('the type control offers the real HA types plus an explicit layout-card conversion', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      // createNew() stamps a custom:grid-layout scaffold view.
      await ctx.dashboard.createNew();

      await window.getByTestId('view-settings-button').click();
      await expect(window.getByTestId('view-settings-save')).toBeVisible();
      // The scaffold reads as "Masonry", never as custom:grid-layout.
      await expect(window.getByTestId('view-settings-type')).toContainText('Masonry');

      await window.getByTestId('view-settings-type').click();
      const options = window.locator(
        '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option',
      );
      await expect(options).toHaveCount(5);
      const texts = (await options.allInnerTexts()).map((t) => t.trim());
      expect(texts.slice(0, 4)).toEqual(['Masonry', 'Sections', 'Panel', 'Sidebar']);
      // NEW in 4.7b: the layout-card grid is offered as an explicit conversion
      // target, labelled with the raw type so the user can see what deploys.
      expect(texts[4]).toBe('Layout card grid (custom:grid-layout)');
    } finally {
      await close(ctx);
    }
  });
});
