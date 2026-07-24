import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

// An EMPTY flat (non-sections) dashboard. Its view renders on the flat GridCanvas
// empty-state, which offers the "Convert to Sections view" banner (slice 4.5).
// The banner is empty-view-only by design (a persistent banner on a populated
// flat canvas would shift card geometry and break layout.visual snapshots);
// card-preserving conversion of a POPULATED view is covered by the unit tests for
// convertViewToSections and belongs to the slice-4.6 view-type editor.
const EMPTY_FLAT_YAML = `title: Flat Dashboard
views:
  - title: Home
    path: home
    type: masonry
    cards: []
`;

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

const loadYaml = async (ctx: Ctx, yaml: string): Promise<void> => {
  await ctx.window.evaluate((y) => {
    const api = (window as unknown as { __dashboardTestApi?: { loadYaml: (y: string) => void } })
      .__dashboardTestApi;
    api?.loadYaml(y);
  }, yaml);
};

test.describe('View-type authoring (Tier 4, slice 4.5)', () => {
  test('converts an empty flat view into a Sections view from the canvas banner', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();
      await loadYaml(ctx, EMPTY_FLAT_YAML);

      // An empty non-sections view offers the convert banner; no sections canvas yet.
      await expect(window.getByTestId('convert-to-sections-button')).toBeVisible();
      await expect(window.getByTestId('sections-canvas')).toHaveCount(0);

      await window.getByTestId('convert-to-sections-button').click();

      // The view is now a sections view: SectionsCanvas renders with one empty
      // starter section. (Card-preserving migration is covered directly by the
      // convertViewToSections unit tests.)
      await expect(window.getByTestId('sections-canvas')).toBeVisible();
      await expect(window.getByTestId('sections-canvas-section-0')).toBeVisible();
      await expect(window.getByTestId('section-empty-0')).toBeVisible();

      // Already a sections view -> the convert banner is gone.
      await expect(window.getByTestId('convert-to-sections-button')).toHaveCount(0);
    } finally {
      await close(ctx);
    }
  });

  test('creates a new dashboard as a Sections view from the New Dashboard dialog', async ({
    page,
  }) => {
    void page;
    const ctx = await launchWithDSL();
    const { window } = ctx;
    try {
      await ctx.appDSL.waitUntilReady();

      await window
        .getByRole('button', { name: /New Dashboard/i })
        .first()
        .click();
      await expect(window.getByTestId('new-dashboard-sections-option')).toBeVisible({
        timeout: 10000,
      });
      await window.getByTestId('new-dashboard-sections-option').click();

      // A blank sections view renders: the sections canvas with one empty section.
      await expect(window.getByTestId('sections-canvas')).toBeVisible();
      await expect(window.getByTestId('sections-canvas-section-0')).toBeVisible();
      await expect(window.getByTestId('section-empty-0')).toBeVisible();
    } finally {
      await close(ctx);
    }
  });
});
