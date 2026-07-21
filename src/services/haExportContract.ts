/**
 * HA Export Contract — the classification registry for HAVDM-only card keys.
 *
 * Slice **B1** of the export-boundary work (design:
 * `docs/refresh/HA_EXPORT_BOUNDARY_DESIGN_2026-07.md` §3). This file is a pure
 * addition: it declares HOW each HAVDM-only key is treated when a config crosses
 * the boundary into Home Assistant, but does not itself change any export
 * behaviour. Slice B2 folds the STRIP class into `exportCard`; later slices
 * (B6/B6b/B7) consume the TRANSLATE (`card-mod`/`ha-visibility`) and CANVAS
 * classes.
 *
 * This mirrors the ratified three-way classification from the product vision
 * (MemPalace `drawer_havdm_decisions_d4f0886c7035390d30c1d1a7`): TRANSLATE what
 * has a real HA target, STRIP internal bookkeeping, mark CANVAS-only design-time
 * concepts.
 *
 * The four actions:
 *  - `'card-mod'`      TRANSLATE → card-mod CSS (layout/style keys).
 *  - `'ha-visibility'` TRANSLATE → HA-native `visibility` (condition keys).
 *  - `'strip'`         internal bookkeeping with no HA meaning — remove silently.
 *  - `'canvas'`        design-time-only behavioural feature with no HA target.
 */
import type { BaseCard } from '../types/dashboard';
import type { Phase6CardContracts } from '../types/phase6';

export type KeyAction = 'card-mod' | 'ha-visibility' | 'strip' | 'canvas';

/**
 * Every HAVDM-only card key, mapped to its export action.
 *
 * The key set is enumerable from the type system — the fields `BaseCard`
 * (`src/types/dashboard.ts`) and `Phase6CardContracts` (`src/types/phase6.ts`)
 * add beyond HA's card config, plus the layout-enhancement keys carried by the
 * stack/grid subtypes (`HorizontalStackCard` / `VerticalStackCard` / `GridCard`).
 *
 * `satisfies Record<string, KeyAction>` pins every VALUE to a valid
 * {@link KeyAction}. The completeness guard below (`_AllCardKeysClassified`)
 * pins the KEY SET to the interfaces, so a new `BaseCard` / `Phase6CardContracts`
 * field fails the build until it is triaged here.
 */
export const KEY_ACTION = {
  // --- TRANSLATE → card-mod CSS ---------------------------------------------
  // Layout-enhancement keys live on the stack/grid subtypes; `style` /
  // `card_margin` / `card_padding` live on `BaseCard`.
  gap: 'card-mod',
  align_items: 'card-mod',
  justify_content: 'card-mod',
  justify_items: 'card-mod',
  wrap: 'card-mod',
  row_gap: 'card-mod',
  column_gap: 'card-mod',
  card_margin: 'card-mod',
  card_padding: 'card-mod',
  style: 'card-mod',

  // --- TRANSLATE → HA-native `visibility` -----------------------------------
  visibility_conditions: 'ha-visibility',
  visibility_operator: 'ha-visibility',

  // --- STRIP — internal bookkeeping, no HA meaning --------------------------
  _havdm_layout: 'strip',
  _isSpacer: 'strip',
  _expanderDepth: 'strip',
  icon_color_mode: 'strip',

  // --- CANVAS-ONLY — design-time behaviour with no HA mechanism -------------
  attribute_display: 'canvas',
  attribute_display_layout: 'canvas',
  multi_entity_mode: 'canvas',
  aggregate_function: 'canvas',
  batch_actions: 'canvas',
  trigger_animations: 'canvas',
  state_styles: 'canvas',
  state_icons: 'canvas',
  sound: 'canvas',
} as const satisfies Record<string, KeyAction>;

/** The literal union of every classified key. */
export type ClassifiedKey = keyof typeof KEY_ACTION;

// ---------------------------------------------------------------------------
// Completeness guard — "complete by construction"
// ---------------------------------------------------------------------------
//
// Every field of `BaseCard` / `Phase6CardContracts` must be accounted for as
// exactly one of: classified (in `KEY_ACTION`), HA-native (passes through), or
// explicitly deferred. Anything left over — e.g. a newly-added `BaseCard` field
// — makes `UnclassifiedCardKey` resolve to a non-`never` union and the
// `AssertNever` line below fails to compile until the field is triaged.

/**
 * Fields on `BaseCard` / `Phase6CardContracts` that Home Assistant itself
 * accepts (or that HAVDM passes through untouched). Deliberately NOT classified
 * — they cross the boundary unchanged. Also names the HA-real extras
 * `baseLovelaceCardConfig` accepts (`visibility` / `grid_options` /
 * `layout_options`) for the record; they are not fields of these interfaces, so
 * they are inert to the guard but document intent.
 */
type HaNativeKey =
  | 'type'
  | 'title'
  | 'entity'
  | 'entities'
  | 'name'
  | 'icon'
  | 'icon_color'
  | 'show_name'
  | 'show_icon'
  | 'show_state'
  | 'tap_action'
  | 'hold_action'
  | 'double_tap_action'
  | 'view_layout'
  | 'visibility'
  | 'grid_options'
  | 'layout_options';

/**
 * HAVDM-only fields whose export classification is intentionally deferred to a
 * later slice — parked here (rather than force-classified in `KEY_ACTION`) so
 * the guard stays green without pre-empting a decision the design defers:
 *  - `layout` — bare grid geometry `{x,y,w,h}`; renamed to `_havdm_layout`
 *    (already classified `'strip'`) by slice **B5** plus a value-shape import
 *    migration. Until then the bare key survives; do not add it to the B2 strip
 *    (it would clobber Mushroom's real `layout: 'horizontal'`).
 *  - `haptic` / `icon_color_states` / `icon_color_attribute` / `smart_defaults`
 *    — behavioural HAVDM inventions with no HA target; their per-key export
 *    handling is Phase 4 (design §3, CANVAS-ONLY "per-key confirm in Phase 4").
 */
type DeferredClassificationKey =
  'layout' | 'haptic' | 'icon_color_states' | 'icon_color_attribute' | 'smart_defaults';

/** Any card field that is neither classified, HA-native, nor deferred. */
type UnclassifiedCardKey = Exclude<
  keyof BaseCard | keyof Phase6CardContracts,
  ClassifiedKey | HaNativeKey | DeferredClassificationKey
>;

/** Compile-time assertion helper: errors unless `T` is exactly `never`. */
type AssertNever<T extends never> = T;

/**
 * COMPLETENESS GUARD. If this line errors, a `BaseCard` / `Phase6CardContracts`
 * field is unclassified. Fix it by adding the field to `KEY_ACTION` (with its
 * action) or to `HaNativeKey` / `DeferredClassificationKey` above.
 */
export type _AllCardKeysClassified = AssertNever<UnclassifiedCardKey>;

// ---------------------------------------------------------------------------
// Derived key sets — consumed by the boundary slices
// ---------------------------------------------------------------------------

const keysForAction = (action: KeyAction): string[] =>
  Object.entries(KEY_ACTION)
    .filter(([, value]) => value === action)
    .map(([key]) => key);

/** Keys removed silently on export. Slice **B2** folds these into `exportCard`. */
export const STRIP_KEYS: readonly string[] = keysForAction('strip');

/** Keys that translate to card-mod CSS. Slice **B6**. */
export const CARD_MOD_KEYS: readonly string[] = keysForAction('card-mod');

/** Keys that translate to HA-native `visibility`. Slice **B6b**. */
export const HA_VISIBILITY_KEYS: readonly string[] = keysForAction('ha-visibility');

/** Canvas-only behavioural keys with no HA target. Phase 4. */
export const CANVAS_KEYS: readonly string[] = keysForAction('canvas');
