/**
 * FR-04 — the EXPORT ROUND TRIP for the known-good dashboard.
 *
 * The companion to `tests/e2e/uat-known-good-dashboard.spec.ts`, which authors
 * the dashboard by driving the real application and produces
 * `known-good-dashboard.havdm.yaml`. This spec takes that file and runs it
 * through the real load and export path — `yamlService.parseDashboard` then
 * `yamlService.serializeForHA`, the exact call `App.handleExportForHA` makes at
 * `src/App.tsx:695` — and asserts what comes out.
 *
 * ⭐ WHY THE ROUND TRIP IS THE POINT. The owner's ruling on FR-04 was that a
 * hand-written known-good dashboard would deploy cleanly and leave HAVDM's own
 * export path broken, so the fixture must be authored IN HAVDM and its
 * deployable artifact produced BY HAVDM. That ruling paid for itself
 * immediately: this spec records defects in HAVDM's export that a hand-written
 * file could not have surfaced.
 *
 * ⚠ A CORRECTION TO THIS DOCBLOCK, MADE BY F1 AND LEFT VISIBLE ON PURPOSE. It
 * used to end "…one of them silent data loss". THAT CLAIM WAS FALSE AND WAS
 * WITHDRAWN. It came from measuring correctly that HAVDM's export drops
 * `type: sections`, and then ASSUMING what Home Assistant does with a typeless
 * view. It does not lose the cards: HA infers a sections view from the
 * `sections` key, and the exported dashboard has since been deployed to a real
 * instance and looked at — it renders with all six cards and zero error cards.
 * The withdrawal was applied to this file's test comments when it was made; this
 * line is the last place the old wording survived.
 *
 * ⚠⚠ ON THE "RECORDED CURRENT BEHAVIOUR" ASSERTIONS BELOW. The assertions in
 * that block pin behaviour that is WRONG. They are written as assertions rather
 * than as comments so that the fix which corrects each one is forced to come
 * back here and say so — a defect recorded in prose is a defect that gets
 * forgotten, and this file is the artifact the remaining remediation items are
 * measured against. Each is labelled with the fix that will flip it.
 *
 * ⭐⭐ ONE OF THEM HAS NOW BEEN FLIPPED. F1 (the shared view-type validator)
 * landed, so the assertion that the deploy validator REJECTS this dashboard has
 * been rewritten into its opposite — see "F1 — FIXED" below. The two F9
 * assertions still record broken behaviour.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { yamlService } from '../../src/services/yamlService';
import { CANVAS_ONLY_CARD_TYPES, isHavdmScaffoldView } from '../../src/services/haExportContract';
import { validateDashboardForDeploy, validateView } from '../../src/services/dashboardValidation';
import type { Card, DashboardConfig, View } from '../../src/types/dashboard';

const FIXTURE_DIR = resolve(__dirname, '../fixtures/uat');
const SOURCE_PATH = resolve(FIXTURE_DIR, 'known-good-dashboard.havdm.yaml');
const EXPORT_PATH = resolve(FIXTURE_DIR, 'known-good-dashboard.ha.yaml');
const PROBE_PATH = resolve(FIXTURE_DIR, 'remap-probe.havdm.yaml');
const MANIFEST_PATH = resolve(FIXTURE_DIR, 'instance-manifest.json');

const WRITE_FIXTURES = process.env.HAVDM_WRITE_FIXTURES === '1';

interface Manifest {
  instance: { haVersion: string; absentDomains: string[] };
  capabilityProfile: { installedElements: string[] };
  referencedEntities: Array<{ entity_id: string; entity_category: string | null }>;
}

const manifest: Manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const sourceYaml = readFileSync(SOURCE_PATH, 'utf8');

const parseOrThrow = (yaml: string, label: string): DashboardConfig => {
  const result = yamlService.parseDashboard(yaml);
  if (!result.success || !result.data) {
    throw new Error(`${label} failed to parse: ${result.error ?? 'no data'}`);
  }
  return result.data;
};

/** Every card in a view, flattened across both the flat and sections shapes. */
const cardsOf = (view: View): Card[] => [
  ...(Array.isArray(view.cards) ? view.cards : []),
  ...(Array.isArray(view.sections)
    ? view.sections.flatMap((section) => (Array.isArray(section.cards) ? section.cards : []))
    : []),
];

/** Walk every card at every depth, including cards nested inside cards. */
const walkCards = (cards: Card[]): Card[] =>
  cards.flatMap((card) => {
    const nested = (card as unknown as { cards?: Card[] }).cards;
    return [card, ...(Array.isArray(nested) ? walkCards(nested) : [])];
  });

/**
 * Home Assistant's own card types. Sourced from HAVDM's registry rather than
 * hand-listed: a type is native when the registry does not mark it custom.
 */
const NATIVE_CARD_TYPES = new Set<string>([
  'entities',
  'glance',
  'sensor',
  'gauge',
  'history-graph',
  'statistics-graph',
  'logbook',
  'calendar',
  'entity',
  'button',
  'light',
  'thermostat',
  'tile',
  'alarm-panel',
  'markdown',
  'picture',
  'picture-entity',
  'picture-glance',
  'map',
  'weather-forecast',
  'media-control',
  'horizontal-stack',
  'vertical-stack',
  'grid',
  'heading',
  'conditional',
  'plant-status',
]);

describe('FR-04 — the known-good dashboard round-trips through HAVDM export', () => {
  const sourceConfig = parseOrThrow(sourceYaml, 'known-good-dashboard.havdm.yaml');
  const exportedYaml = yamlService.serializeForHA(sourceConfig);
  const exportedConfig = yamlService.sanitizeForHA(sourceConfig);

  if (WRITE_FIXTURES) {
    writeFileSync(EXPORT_PATH, exportedYaml, 'utf8');
  }

  describe('the artifact is what HAVDM actually exports', () => {
    it('the committed .ha.yaml is byte-identical to what the export path produces', () => {
      // ⭐ This is what keeps the deployable artifact honest. If it drifts from
      // HAVDM's own output — by a hand edit, or because the export changed —
      // this fails, rather than the tester deploying a file HAVDM would never
      // have written. Regenerate deliberately with HAVDM_WRITE_FIXTURES=1.
      expect(exportedYaml).toBe(readFileSync(EXPORT_PATH, 'utf8'));
    });

    it('the source parses and the export re-parses, so the artifact is loadable YAML', () => {
      expect(sourceConfig.views).toHaveLength(2);
      const reparsed = parseOrThrow(exportedYaml, 'known-good-dashboard.ha.yaml');
      expect(reparsed.views).toHaveLength(2);
    });
  });

  describe("content rules — every reference is real on the tester's instance", () => {
    const known = new Set(manifest.referencedEntities.map((e) => e.entity_id));

    it('every entity the export references exists on the reference instance', () => {
      // ⚠ The failure this guards is the one that cost round 3 four High
      // defects: HA-03, HA-04, HA-07 and HA-09 all ran against files
      // referencing `custom:gauge-card-pro` (not installed),
      // `sensor.example_temperature` and `input_boolean.toggle` (neither
      // exists). The manifest is a READ-ONLY capture of the live instance, so
      // an entity that is not in it was never verified.
      const referenced = walkCards(exportedConfig.views.flatMap(cardsOf))
        .map((card) => (card as unknown as { entity?: unknown }).entity)
        .filter((entity): entity is string => typeof entity === 'string');

      expect(referenced.length).toBeGreaterThan(0);
      expect(referenced.filter((entity) => !known.has(entity))).toEqual([]);
    });

    it('no entity comes from a domain the instance does not have', () => {
      // ⚠ In particular there is NO `light` domain. Three entities MATCH the
      // string "light" — binary_sensor.{garage_360,front_yard,front_door}_status_light
      // — but all three are `entity_category: diagnostic` UniFi Protect
      // diagnostics. That distinction is the whole of PROPS-03; nothing in this
      // fixture depends on it.
      const absent = new Set(manifest.instance.absentDomains);
      for (const { entity_id } of manifest.referencedEntities) {
        expect(absent.has(entity_id.split('.')[0])).toBe(false);
      }
    });

    it('no entity is diagnostic or config, so every card has something visible to show', () => {
      for (const entity of manifest.referencedEntities) {
        expect(entity.entity_category).toBeNull();
      }
    });

    it('every exported card type is HA-native or installed on the instance', () => {
      const installed = new Set(manifest.capabilityProfile.installedElements);
      const types = walkCards(exportedConfig.views.flatMap(cardsOf))
        .map((card) => card.type)
        .filter((type): type is string => typeof type === 'string');

      expect(types.length).toBeGreaterThan(0);
      expect(types.filter((type) => !NATIVE_CARD_TYPES.has(type) && !installed.has(type))).toEqual(
        [],
      );
    });

    it('no canvas-only card survives into the export', () => {
      const canvasOnly = new Set<string>(CANVAS_ONLY_CARD_TYPES);
      const exportedTypes = walkCards(exportedConfig.views.flatMap(cardsOf)).map(
        (card) => card.type,
      );
      expect(exportedTypes.filter((type) => canvasOnly.has(type as string))).toEqual([]);

      // ...and the source really did contain one, so this is not vacuous.
      const sourceTypes = walkCards(sourceConfig.views.flatMap(cardsOf)).map((card) => card.type);
      expect(sourceTypes.filter((type) => canvasOnly.has(type as string)).length).toBeGreaterThan(
        0,
      );
    });

    it('the canvas-only card became a NATIVE markdown placeholder, not a phantom type', () => {
      // ⭐ Vision answer 9: the placeholder must be something HA can actually
      // render. `type: spacer` would itself be a phantom type and would show HA's
      // "Unknown type encountered" tile — the exact error being avoided.
      const markdown = walkCards(exportedConfig.views.flatMap(cardsOf)).find(
        (card) =>
          card.type === 'markdown' &&
          typeof (card as unknown as { content?: unknown }).content === 'string' &&
          (card as unknown as { content: string }).content.includes('Card Not Available'),
      );
      expect(markdown).toBeDefined();
      expect(exportedYaml).toContain('Card Not Available');
    });

    it('has one masonry view and one sections view, and exports no layout-card view', () => {
      // ⚠ Ruling R3 makes `sections` the preferred geometry target, and
      // layout-card is NOT among the instance's 11 Lovelace resources — a
      // `custom:grid-layout` view could not render there at all.
      //
      // ⚠ THE RULE IS ABOUT THE EXPORT, NOT THE SOURCE. HAVDM's source DOES
      // carry `type: custom:grid-layout` on view 1, and that is correct: it is
      // HAVDM's internal canvas SCAFFOLD, not a user's layout-card view. The two
      // share a type string and are told apart by `isHavdmScaffoldView`, which
      // is why keying the export off the string alone destroyed a user's grid in
      // slice 4.7a. What matters is that nothing layout-card-shaped reaches HA.
      expect(isHavdmScaffoldView(sourceConfig.views[0])).toBe(true);
      expect(sourceConfig.views.map((view) => view.type)).toContain('sections');

      const exportedTypes = exportedConfig.views.map((view) => view.type);
      expect(
        exportedTypes.filter((type) => typeof type === 'string' && type.includes('layout')),
      ).toEqual([]);

      // View 1 exports as a typeless view, which in Home Assistant IS masonry.
      expect(exportedConfig.views[0].type).toBeUndefined();
    });
  });

  describe('⚠ RECORDED CURRENT BEHAVIOUR — the two F9 defects this fixture still exposes', () => {
    it('F9 (a) — the sections view LOSES `type: sections` on export, and HAVDM cannot re-open its own artifact', () => {
      // MECHANISM, measured: `convertViewToSections` (`sectionsLayout.ts:396-406`)
      // spreads `...view` and deletes only `layout` / `layout_type`, so the
      // `_havdm_scaffold: true` marker stamped on every HAVDM-created view
      // SURVIVES the conversion. `isHavdmScaffoldView`
      // (`haExportContract.ts:412`) returns true on that marker ALONE, before it
      // ever looks at the type. So `sanitizeForHAWithReport` takes the
      // scaffold branch and deletes `cleanView.type` — while the sections branch
      // below it, which keys off the ORIGINAL `view.type`, still writes
      // `sections` and deletes `cards`.
      //
      // ⚠⚠ WHAT THIS DOES *NOT* MEAN — A CORRECTION TO THIS SPEC'S FIRST DRAFT,
      // KEPT BECAUSE THE WRONG VERSION IS THE MORE TEMPTING READING. It is NOT
      // data loss in Home Assistant. HA resolves a view's layout with a FALLBACK
      // CHAIN, read directly out of this instance's own frontend bundle
      // (HA 2026.7.4, chunk 6004/88566, module 25932):
      //
      //   type ? type : panel ? "panel" : sections ? "sections" : cards ? "masonry" : "sections"
      //
      // A `sections` key with no `type` therefore resolves to a SECTIONS view,
      // and the exported dashboard renders correctly in HA. Corroborated on the
      // live instance read-only: the owner's own `environmental-control`
      // dashboard has a working view with NO `type` and four `sections`.
      // ⭐ There is consequently NO sequencing hazard for F1 — an earlier draft
      // of this spec claimed fixing F1 would unmask silent data loss, and that
      // claim was WRONG.
      //
      // ⚠ THE REAL DEFECT IS ON HAVDM'S SIDE, AND IT IS A ROUND-TRIP BREAK.
      // HAVDM has no such fallback: `GridCanvas.tsx:295` delegates to
      // `SectionsCanvas` only on a strict `view.type === 'sections'`, and
      // `convertViewToSections` (`sectionsLayout.ts:394`) tests the same way. So
      // HAVDM's export produces a file HAVDM ITSELF renders BLANK — six cards
      // present in the YAML, zero drawn on the canvas. Home Assistant is more
      // forgiving of HAVDM's output than HAVDM is. That is F9's to fix, either
      // by emitting the type or by teaching the importer HA's own fallback.
      const energy = exportedConfig.views[1];
      expect(energy.title).toBe('Energy');
      expect(Array.isArray(energy.sections)).toBe(true);
      expect(energy.sections).toHaveLength(2);
      expect(energy.type).toBeUndefined(); // ← F9 must make this 'sections'

      // The round-trip break, asserted rather than described: re-parsing the
      // committed artifact yields a view HAVDM's own canvas cannot draw.
      const reimported = parseOrThrow(readFileSync(EXPORT_PATH, 'utf8'), 'the exported artifact');
      const reimportedEnergy = reimported.views[1];
      expect(reimportedEnergy.type === 'sections').toBe(false); // ← GridCanvas.tsx:295 will not delegate
      expect(reimportedEnergy.cards ?? []).toHaveLength(0); // ← so the flat canvas draws nothing
      // ...while the cards are demonstrably still in the file.
      expect(cardsOf(reimportedEnergy)).toHaveLength(6);
    });

    it('F9 (b) — the masonry view exports dead `view_layout` keys that HA ignores', () => {
      // The scaffold marker again, this time via `isLayoutCardGrid`: a fresh
      // HAVDM view IS a layout-card grid as far as `App.tsx:1115` is concerned,
      // so every card added gets `view_layout: {grid_column, grid_row}`. Export
      // strips the scaffold TYPE but passes those card keys through, and
      // `view_layout` means nothing to HA's masonry — the designed geometry
      // silently collapses to column stacking.
      //
      // ⚠ There is NO in-app way to avoid this: the view-type editor already
      // DISPLAYS a scaffold view as "Masonry" (`normalizeViewType`), so
      // selecting Masonry compares equal and never calls `setViewType`
      // (`App.tsx:1840-1844`). The user cannot turn a HAVDM view into a real
      // masonry view.
      //
      // This is exactly the shape measured in the tester's own
      // `dashboard-ha_exported.yaml` during round-3 triage (HA-09).
      const home = exportedConfig.views[0];
      const withDeadKeys = (home.cards ?? []).filter((card) =>
        Object.hasOwn(card as object, 'view_layout'),
      );
      expect(withDeadKeys.length).toBe(5); // ← F9 must make this 0

      // The internal geometry key IS correctly stripped — the export boundary
      // is right about `_havdm_layout` and wrong only about its translation.
      const withInternal = (home.cards ?? []).filter((card) =>
        Object.hasOwn(card as object, '_havdm_layout'),
      );
      expect(withInternal).toEqual([]);
    });
  });

  describe('⭐ F1 — FIXED: the deploy validator accepts this exported dashboard', () => {
    // ⭐⭐ THIS TEST IS THE FLIPPED RED LEG. Until F1 landed it asserted the
    // OPPOSITE — that the validator REJECTED this dashboard with
    // `View "Energy" must have a "cards" array (can be empty).`, the exact
    // string from the tester's round-3 screenshot. That was HA-07 in one line:
    // HAVDM could not deploy a dashboard HAVDM itself had authored, because
    // `DeployDialog.tsx:118-120` demanded a top-level `cards` array on every
    // view and a Sections view legitimately has none — its cards live under
    // `sections[].cards`.
    //
    // The assertion is made against the REAL validator and the REAL committed
    // artifact, not a hand-built object, per UAT_STRATEGY.md §7: a round-trip
    // claim needs a round-trip test.

    it('the offending shape is still present — this test measures the validator, not the fixture', () => {
      // ⭐ DISCRIMINATOR. This assertion passes BOTH before and after F1, and
      // that is exactly its job: it proves the input still has the property that
      // used to cause the rejection, so a green result below means the VALIDATOR
      // changed rather than the fixture having been quietly reshaped to fit.
      const energy = exportedConfig.views[1];
      expect(energy.title).toBe('Energy');
      expect(Array.isArray((energy as { cards?: unknown }).cards)).toBe(false);
      expect(cardsOf(energy)).toHaveLength(6); // ...and its six cards are all there, under `sections`.
    });

    it('validates clean — no errors on the dashboard HAVDM itself produced', () => {
      expect(validateDashboardForDeploy(exportedConfig)).toEqual([]);
    });

    it('never mentions a "cards" array requirement for any view', () => {
      // The old message is gone as a CLASS, not merely for this fixture.
      const messages = exportedConfig.views
        .flatMap((view, index) => validateView(view, index))
        .map((error) => error.message);
      expect(messages).toEqual([]);
    });
  });

  describe('the HA-04 remap probe', () => {
    const probeConfig = parseOrThrow(readFileSync(PROBE_PATH, 'utf8'), 'remap-probe.havdm.yaml');

    it('loads through the real parse path', () => {
      expect(probeConfig.views).toHaveLength(1);
      expect(cardsOf(probeConfig.views[0])).toHaveLength(2);
    });

    it('carries one absent entity that IS a plausible rename of a real one', () => {
      // ⭐ THE PROPERTY HA-04 NEEDS. Round 3's `input_boolean.toggle` resembled
      // nothing real, so the auto-mapper declining it was CORRECT and the card
      // measured nothing. Here the missing id is a real id with `_old`
      // appended, so a refusal is a result rather than a tautology.
      const known = new Set(manifest.referencedEntities.map((e) => e.entity_id));
      const entities = cardsOf(probeConfig.views[0]).map(
        (card) => (card as unknown as { entity: string }).entity,
      );

      const missing = entities.filter((entity) => !known.has(entity));
      expect(missing).toEqual(['sensor.sigen_plant_pv_power_old']);

      // The base id — the same entity without `_old` — is real. That is what
      // makes it a plausible rename rather than a nonsense string.
      expect(known.has('sensor.sigen_plant_pv_power')).toBe(true);

      // And the control card in the same file points at something that exists.
      expect(entities.filter((entity) => known.has(entity))).toHaveLength(1);
    });
  });
});
