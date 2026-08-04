import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { close, launchWithDSL } from '../support';

/**
 * FR-04 — the known-good dashboard, AUTHORED IN HAVDM.
 *
 * ⭐ WHY THIS IS A SPEC AND NOT A HAND-WRITTEN YAML FILE.
 *
 * Round 3 measured that FOUR of its eleven High defects — HA-03, HA-04, HA-07
 * and HA-09 — all ran against the tester's OWN dashboard files, which reference
 * things the reference instance does not have. FR-04
 * (`docs/testing/uat/FEATURE_REQUESTS.md`) is the tester's request for a
 * controlled fixture that unconfounds them.
 *
 * The owner's ruling then went further than the register: a HAND-authored
 * known-good file would deploy cleanly and leave HAVDM's own export path
 * broken, so FR-04 must exercise the round trip — author it IN HAVDM, and
 * produce the deployable artifact through HAVDM's own Export for Home
 * Assistant. That is what this spec is for. It drives the real application
 * through real authoring controls: the card palette, the view-settings dialog,
 * the sections canvas, and the properties panel's YAML tab.
 *
 * ⚠ WHY THE PROPERTIES **YAML TAB** AND NOT THE FORM. Measured on this branch:
 * the Form tab renders an `entity-select` for only four card types (`button`,
 * `sensor`/`gauge`, `picture-entity`, `light` — `PropertiesPanel.tsx:1765`,
 * `:1832`, `:2148`, `:2319`). A `tile` card's Form tab opens straight onto
 * "Conditional Visibility" with no entity field at all, which is the standing
 * "no type-specific property forms for the eleven new cards" gap. The YAML tab
 * is a first-class authoring surface that every card type has, so it is the one
 * path that works uniformly. Using it is a deliberate choice, not a shortcut
 * around a broken control.
 *
 * ⚠ WHAT THIS SPEC DELIBERATELY DOES NOT DO. It does not click File → Export
 * for Home Assistant. That menu item opens a NATIVE save dialog this harness
 * cannot drive (`tests/e2e/file-operations.spec.ts` documents the same limit),
 * and the dialog is an OS file picker, not product logic. The export itself —
 * `yamlService.serializeForHA`, the exact call `App.handleExportForHA` makes at
 * `src/App.tsx:695` — is asserted in `tests/unit/uat-known-good-dashboard.spec.ts`,
 * which starts from the fixture THIS spec produces. Between the two, every step
 * of the round trip is covered except the file picker.
 *
 * ⭐ THE POINT OF THE EQUALITY ASSERTION. By default this spec re-authors the
 * dashboard and asserts the result is byte-identical to the committed fixture.
 * That is what keeps the claim "this file was authored in HAVDM" TRUE over
 * time: if HAVDM's authoring output drifts, this fails rather than the fixture
 * quietly becoming a hand-maintained file that only looks like an export.
 * Regenerate deliberately with `HAVDM_WRITE_FIXTURES=1`.
 *
 * ⚠ TWO ROUND-3 CONSTRAINTS THIS SPEC WORKS WITHIN, RECORDING THEM RATHER THAN
 * FIXING THEM (one defect, one PR):
 *
 *  1. VIEWS-04 — cards reach the sections view by DOUBLE-CLICKING the palette,
 *     never by dragging. A palette drag into a sections view is refused today:
 *     `SectionsCanvas` has no palette-drop handler and its drop targets gate
 *     `preventDefault()` on internal-drag flags, so HTML5 DnD rejects the drop.
 *     Nothing here should be read as evidence that palette drag works there.
 *  2. An EMPTY section cannot be selected by clicking it — `section-empty-${si}`
 *     (`SectionsCanvas.tsx:677`) is a static div with no handler, and
 *     `selectedSectionIndex` only moves when a CARD inside a section is
 *     selected (`:542`). The one thing that targets an empty section is
 *     `handleSectionAdd`, which calls `setSelectedSectionCard(view, newIndex,
 *     null)` (`App.tsx:1697`) — so a section is addressable in the moment it is
 *     created and not afterwards. This spec therefore fills section 0, then
 *     adds section 1 and fills it immediately. ⭐ That also reconciles the loose
 *     end the review chain left open: the tester's "it lands in the LAST
 *     section" and the code's `selectedSectionIndex ?? 0` default
 *     (`App.tsx:1078-1079`) are BOTH right — they describe different moments.
 */

const FIXTURE_PATH = resolve(__dirname, '../fixtures/uat/known-good-dashboard.havdm.yaml');
const WRITE_FIXTURES = process.env.HAVDM_WRITE_FIXTURES === '1';

type Ctx = Awaited<ReturnType<typeof launchWithDSL>>;

/**
 * A card to author: the palette type to add, and the YAML that replaces its
 * defaults.
 *
 * ⚠ REPLACING THE DEFAULTS IS PART OF THE POINT. Three HAVDM palette cards ship
 * `sensor.example_temperature` as a default entity (`cardRegistry.ts:535`,
 * `:561`, `:581` — apexcharts, native-graph, gauge-card-pro), and that entity
 * does not exist on the reference instance. It is one of the two confounds the
 * round-3 triage attributed to the tester's own file; it is in fact HAVDM's
 * own. A fixture that must render in Home Assistant cannot carry defaults like
 * that, so every card here is given an explicit, verified configuration.
 */
interface AuthoredCard {
  paletteType: string;
  yaml: string | null;
}

/**
 * Every entity below was enumerated READ-ONLY from `ha.home.local` on
 * 2026-08-04 and carried a real state at capture time. Provenance and the
 * captured values live in `tests/fixtures/uat/instance-manifest.json`.
 *
 * ⚠ The instance has NO `light`, `fan` or `vacuum` domain. Three entities MATCH
 * the string "light" — `binary_sensor.{garage_360,front_yard,front_door}_status_light`
 * — but all three are `entity_category: diagnostic` UniFi Protect diagnostics,
 * not lights. That distinction is the whole of PROPS-03, and nothing here
 * relies on it.
 */
const HOME_CARDS: AuthoredCard[] = [
  {
    paletteType: 'tile',
    yaml: ['type: tile', 'entity: cover.garage_door', 'name: Garage Door'].join('\n'),
  },
  {
    paletteType: 'button',
    yaml: [
      'type: button',
      'entity: switch.garage_lamp',
      'name: Garage Lamp',
      'show_state: true',
    ].join('\n'),
  },
  {
    paletteType: 'weather-forecast',
    yaml: [
      'type: weather-forecast',
      'entity: weather.mckenzie_hill',
      'forecast_type: daily',
      'show_current: true',
      'show_forecast: true',
    ].join('\n'),
  },
  {
    paletteType: 'custom:mushroom-person-card',
    yaml: ['type: custom:mushroom-person-card', 'entity: person.micah'].join('\n'),
  },
  // ⭐ ONE DELIBERATE CANVAS-ONLY CARD (FR-04's own content rule), left on its
  // defaults. A phantom type with no Home Assistant equivalent, so the export's
  // honest-marking path (vision answer 9 / export slice B7) is exercised ON
  // PURPOSE rather than by accident: it must come out as a native `markdown`
  // "Card Not Available" placeholder Home Assistant can actually render, never
  // as `type: popup`.
  { paletteType: 'custom:popup-card', yaml: null },
];

const SOLAR_SECTION_CARDS: AuthoredCard[] = [
  {
    paletteType: 'heading',
    yaml: ['type: heading', 'heading: Solar & Battery', 'heading_style: title'].join('\n'),
  },
  {
    paletteType: 'gauge',
    yaml: [
      'type: gauge',
      'entity: sensor.sigen_plant_battery_state_of_charge',
      'name: Battery',
      'min: 0',
      'max: 100',
      'needle: true',
    ].join('\n'),
  },
  {
    paletteType: 'tile',
    yaml: ['type: tile', 'entity: sensor.sigen_plant_pv_power', 'name: Solar Power'].join('\n'),
  },
];

const VEHICLE_SECTION_CARDS: AuthoredCard[] = [
  {
    paletteType: 'heading',
    yaml: ['type: heading', 'heading: Vehicle & Grid', 'heading_style: title'].join('\n'),
  },
  {
    paletteType: 'tile',
    yaml: ['type: tile', 'entity: sensor.ev5_ev_battery_level', 'name: EV Battery'].join('\n'),
  },
  {
    paletteType: 'gauge',
    yaml: [
      'type: gauge',
      'entity: sensor.home_renewables',
      'name: Renewables',
      'min: 0',
      'max: 100',
    ].join('\n'),
  },
];

/**
 * Every `canvas-card` query here is scoped to the ACTIVE tab pane, and that is
 * not defensive styling — it is required for correctness.
 *
 * ⚠⚠ MEASURED TRAP: the view switcher is an antd `<Tabs items={...}>`
 * (`src/App.tsx:3219-3254`) with the default `destroyInactiveTabPane={false}`,
 * so EVERY view's `GridCanvas` stays mounted once visited. After switching to
 * view 2, `getByTestId('canvas-card').first()` resolves to a HIDDEN card
 * belonging to view 1. That is why `palette.addCard` and `canvas.selectCard`
 * are not used past the first view: both address `canvas-card` page-wide,
 * `addCard` waits on `.first()` being visible (it never becomes visible again),
 * and `selectCard(n)` counts hidden cards from earlier views into its `.nth(n)`.
 * Any multi-view spec has to scope, or it addresses the wrong card.
 */
const activePane = (ctx: Ctx) => ctx.window.locator('.ant-tabs-tabpane-active');
const activeCards = (ctx: Ctx) => activePane(ctx).getByTestId('canvas-card');

/** Open the View Settings dialog, apply a patch, and save. */
const editViewSettings = async (
  ctx: Ctx,
  patch: { title?: string; path?: string; type?: string },
): Promise<void> => {
  const { window } = ctx;
  await window.getByTestId('view-settings-button').click();
  await expect(window.getByTestId('view-settings-save')).toBeVisible();

  if (patch.title !== undefined) {
    await window.getByTestId('view-settings-title').fill(patch.title);
  }
  if (patch.path !== undefined) {
    await window.getByTestId('view-settings-path').fill(patch.path);
  }
  if (patch.type !== undefined) {
    await window.getByTestId('view-settings-type').click();
    await window
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option', {
        hasText: new RegExp(`^${patch.type}$`),
      })
      .click();
  }

  await window.getByTestId('view-settings-save').click();
  await expect(window.getByTestId('view-settings-save')).toHaveCount(0);
};

/**
 * Add a card from the palette and give it its configuration.
 *
 * ⚠ Double-click is the add path that works on BOTH canvases — a palette DRAG
 * into a sections view is refused today (VIEWS-04, see the file header). The
 * new card lands last, so it is addressed by the count taken BEFORE the add —
 * an index, not "whatever is selected", because selection state after an add is
 * not something this spec should assume.
 */
const authorCard = async (ctx: Ctx, card: AuthoredCard): Promise<void> => {
  const { window } = ctx;
  const before = await activeCards(ctx).count();

  const search = window.getByTestId('card-search');
  await expect(search).toBeVisible();
  await search.fill(card.paletteType);
  await expect(search).toHaveValue(card.paletteType);

  const paletteCard = window.getByTestId(`palette-card-${card.paletteType}`);
  await expect(paletteCard).toBeVisible({ timeout: 10000 });
  await paletteCard.scrollIntoViewIfNeeded();
  await paletteCard.dblclick();

  await expect(activeCards(ctx)).toHaveCount(before + 1, { timeout: 10000 });
  await search.fill('');
  await expect(search).toHaveValue('');

  if (card.yaml === null) return;

  const added = activeCards(ctx).nth(before);
  await expect(added).toBeVisible();
  await added.click();

  await ctx.properties.expectVisible();
  await ctx.properties.switchTab('YAML');
  await ctx.properties.expectYamlEditor();
  await ctx.yamlEditor.setEditorContent(card.yaml, 'properties');
  await ctx.properties.switchTab('Form');
};

/**
 * Read the dashboard YAML the app itself is holding, from the Dashboard YAML
 * Editor — the app's own document-level surface, fed by
 * `yamlService.serializeDashboard(config)`, which is byte-for-byte what
 * `App.handleSaveFile` writes to disk (`src/App.tsx:671`).
 *
 * ⚠ The Split pane was tried first and is the wrong instrument: with scope
 * `auto` the DSL resolves the properties panel's container ahead of the split
 * one, and every read came back empty. The modal takes an explicit scope, so
 * there is nothing to resolve.
 */
const readAuthoredYaml = async (ctx: Ctx): Promise<string> => {
  await ctx.yamlEditor.open();
  // Poll for a marker from the LAST authored card rather than sampling once —
  // the document is serialised when the modal opens and an early read can
  // return a stale model.
  return ctx.yamlEditor.waitForEditorContent('sensor.home_renewables', {
    timeout: 30000,
    scopeHint: 'modal',
  });
};

test.describe('FR-04 — the known-good dashboard, authored in HAVDM', () => {
  test('authors the known-good dashboard and matches the committed fixture', async ({
    page,
  }, testInfo) => {
    void page;
    test.setTimeout(300_000);
    const ctx = await launchWithDSL();
    const { window } = ctx;

    try {
      await ctx.appDSL.waitUntilReady();
      await ctx.dashboard.createNew({ kind: 'blank' });

      // ---------------------------------------------------------------------
      // View 1 — "Home", a real Home Assistant masonry view.
      // ---------------------------------------------------------------------
      // ⚠⚠ SELECTING "Masonry" HERE IS A NO-OP, AND THAT IS ITSELF A MEASURED
      // DEFECT — F9's missing half. A fresh HAVDM view is the internal
      // `custom:grid-layout` SCAFFOLD, but the type editor DISPLAYS it as
      // "Masonry" because `normalizeViewType` maps the scaffold to `masonry`.
      // `handleViewSettingsSubmit` then compares the chosen type against that
      // same normalised value (`App.tsx:1840-1844`), finds them equal, and never
      // calls `setViewType` — so the scaffold keys survive and there is NO
      // in-app way to turn a HAVDM view into a real masonry view.
      //
      // The consequence is the one measured in the tester's own
      // `dashboard-ha_exported.yaml` (round-3 HA-09): `isLayoutCardGrid` is true
      // for a scaffold, so every card added gets a `view_layout:
      // {grid_column, grid_row}` written at `App.tsx:1116`; the export strips
      // the scaffold TYPE but leaves those card keys behind; and `view_layout`
      // is a layout-card-only concept that HA's masonry ignores, so the designed
      // geometry silently dies.
      //
      // ⭐ THIS FIXTURE DELIBERATELY DOES NOT ROUTE AROUND IT. FR-04's own rule
      // is that a fixture built to make tests pass is worthless — it must render
      // correctly in Home Assistant and then be allowed to fail HAVDM where
      // HAVDM is wrong. Dead `view_layout` keys are ignored by HA, so the
      // dashboard still renders; carrying them makes this file honest evidence
      // of what HAVDM produces today, which is exactly what the export-round-trip
      // leg exists to expose. The unit spec asserts their presence as recorded
      // current behaviour, to be flipped by F9.
      await editViewSettings(ctx, { title: 'Home', path: 'home', type: 'Masonry' });

      for (const card of HOME_CARDS) {
        await authorCard(ctx, card);
      }

      // ---------------------------------------------------------------------
      // View 2 — "Energy", a real Home Assistant sections view.
      // ---------------------------------------------------------------------
      // ⚠ THIS IS THE VIEW HAVDM CANNOT DEPLOY TODAY. A sections view has no
      // top-level `cards` (its cards live under `sections[].cards`), and
      // `DeployDialog.tsx:118-120` demands a `cards` array on EVERY view. That
      // is round-3 HA-07, and `tests/unit/uat-known-good-dashboard.spec.ts`
      // records the exact rejection as F1's red leg. It is NOT fixed here.
      await window.getByTestId('view-add-button').click();
      await expect(window.getByRole('tab')).toHaveCount(2);
      await window.getByRole('tab').nth(1).click();

      await editViewSettings(ctx, { title: 'Energy', path: 'energy', type: 'Sections' });
      await expect(window.getByTestId('sections-canvas')).toBeVisible();

      // A converted view starts with exactly one section. Nothing has been
      // selected inside it yet, so adds land in it via the `?? 0` default.
      for (const card of SOLAR_SECTION_CARDS) {
        await authorCard(ctx, card);
      }

      // Adding a section SELECTS it (`App.tsx:1697`), which is the only moment
      // an empty section is addressable — so fill it now.
      await window.getByTestId('section-add-button').click();
      await expect(window.getByTestId('section-empty-1')).toBeVisible();
      for (const card of VEHICLE_SECTION_CARDS) {
        await authorCard(ctx, card);
      }

      // ---------------------------------------------------------------------
      // Capture / verify.
      // ---------------------------------------------------------------------
      const authored = await readAuthoredYaml(ctx);

      // Sanity: this is the whole dashboard, not one card's YAML.
      expect(authored).toContain('views:');
      expect(authored).toContain('type: sections');

      if (WRITE_FIXTURES) {
        mkdirSync(dirname(FIXTURE_PATH), { recursive: true });
        writeFileSync(FIXTURE_PATH, authored, 'utf8');
        await testInfo.attach('authored-dashboard.yaml', {
          body: authored,
          contentType: 'text/yaml',
        });
        return;
      }

      const committed = readFileSync(FIXTURE_PATH, 'utf8');
      expect(authored).toBe(committed);
    } finally {
      await close(ctx);
    }
  });
});
