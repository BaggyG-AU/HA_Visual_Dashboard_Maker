import type { DashboardConfig, View } from '../types/dashboard';
import { HAVDM_SCAFFOLD_LAYOUT, isHavdmScaffoldView } from '../services/haExportContract';

/**
 * Pure helpers for view-level authoring (Tier 4, slice 4.6a): add / remove /
 * reorder VIEWS and edit a view's identity properties. Views are a
 * dashboard-config-level concern (they live on `config.views`), so — unlike the
 * section helpers in `sectionsLayout.ts`, which operate WITHIN one view — the
 * add/remove/move helpers here take and return a whole `DashboardConfig`.
 *
 * All helpers are immutable and reference-equal-on-no-op (they return the SAME
 * input when the operation changes nothing), so App handlers can skip a no-op
 * `updateConfig` and every real edit is exactly one undoable step. The UI wiring
 * is covered by e2e; the logic here is directly unit-testable.
 */

/**
 * The view fields that make a view HAVDM's flat-canvas scaffold. EVERY HAVDM
 * view-creation site spreads this (`buildBlankView` here,
 * `App.createNewDashboard`, every `dashboardGeneratorService` template) so the
 * scaffold has exactly one definition — and, from slice 4.7a, exactly one
 * marker. Without the marker HAVDM cannot tell its own scaffold from a
 * layout-card view the user authored, and strips both on export.
 */
export const HAVDM_SCAFFOLD_VIEW_FIELDS = {
  type: 'custom:grid-layout',
  layout: HAVDM_SCAFFOLD_LAYOUT,
  _havdm_scaffold: true,
} as const;

/**
 * Build a blank HAVDM view — the flat 12-column / 56px-row canvas scaffold
 * (`type: 'custom:grid-layout'` + the matching `layout` + the internal marker)
 * that every HAVDM creation flow stamps, so a view added on-canvas renders
 * identically to a brand-new dashboard's view. The scaffold is HAVDM-internal
 * and is stripped on export (`isHavdmScaffoldView`), deploying as a real HA
 * masonry view. Defaults to Home/home.
 */
export const buildBlankView = (opts: { title?: string; path?: string } = {}): View => ({
  title: opts.title ?? 'Home',
  path: opts.path ?? 'home',
  ...HAVDM_SCAFFOLD_VIEW_FIELDS,
  layout: { ...HAVDM_SCAFFOLD_LAYOUT },
  cards: [],
});

/** A path not already used by any existing view (HA requires unique view paths). */
const uniqueViewPath = (config: DashboardConfig, base: number): { title: string; path: string } => {
  const taken = new Set(config.views.map((v) => v.path).filter(Boolean));
  let n = base;
  while (taken.has(`view-${n}`)) n += 1;
  return { title: `View ${n}`, path: `view-${n}` };
};

/**
 * Append (default) or insert a new blank view. `atIndex` is clamped to
 * [0, length]; omitted appends. The new view gets a non-colliding title/path
 * (`View N` / `view-N`). Existing views are carried through reference-equal;
 * always returns a NEW config.
 */
export const addView = (config: DashboardConfig, atIndex?: number): DashboardConfig => {
  const { title, path } = uniqueViewPath(config, config.views.length + 1);
  const newView = buildBlankView({ title, path });
  const insertAt =
    atIndex === undefined
      ? config.views.length
      : Math.min(Math.max(0, Math.floor(atIndex)), config.views.length);
  const nextViews = config.views.slice();
  nextViews.splice(insertAt, 0, newView);
  return { ...config, views: nextViews };
};

/**
 * Remove the view at `index`. A dashboard must keep at least one view, so
 * removing the LAST remaining view is refused (reference-equal no-op); an
 * out-of-range index is likewise a no-op. Survivors are carried reference-equal.
 */
export const removeView = (config: DashboardConfig, index: number): DashboardConfig => {
  if (index < 0 || index >= config.views.length) return config;
  if (config.views.length <= 1) return config;
  return { ...config, views: config.views.filter((_, i) => i !== index) };
};

/**
 * Move a view from one index to another (the view drag/reorder write path).
 * Splices the view out and reinserts it at the clamped target index. A no-op
 * (same index) or an out-of-range source returns the input config unchanged
 * (reference-equal).
 */
export const moveView = (
  config: DashboardConfig,
  fromIndex: number,
  toIndex: number,
): DashboardConfig => {
  if (fromIndex < 0 || fromIndex >= config.views.length) return config;
  if (fromIndex === toIndex) return config;
  const nextViews = config.views.slice();
  const [moved] = nextViews.splice(fromIndex, 1);
  const insertAt = Math.min(Math.max(0, Math.floor(toIndex)), nextViews.length);
  nextViews.splice(insertAt, 0, moved);
  return { ...config, views: nextViews };
};

/** The identity properties the view-settings editor can set. */
export type ViewPropsPatch = Partial<
  Pick<View, 'title' | 'path' | 'icon' | 'panel' | 'subview' | 'back_path' | 'visible'>
>;

/**
 * Apply an identity-property patch to a view. A patch value of `undefined` or an
 * empty string REMOVES that key (so an unset field round-trips clean — an
 * unchecked toggle or a cleared text box drops the key rather than deploying
 * `panel: false` / `title: ''`); any other value sets it. Content keys
 * (`cards` / `sections`) are carried through by reference. Returns the input
 * view unchanged (reference-equal) when the patch changes nothing.
 */
export const setViewProps = (view: View, patch: ViewPropsPatch): View => {
  let changed = false;
  const next: View = { ...view };
  (Object.keys(patch) as (keyof ViewPropsPatch)[]).forEach((key) => {
    const value = patch[key];
    const shouldClear = value === undefined || value === '';
    if (shouldClear) {
      if (key in next) {
        delete next[key];
        changed = true;
      }
    } else if (next[key] !== value) {
      (next as Record<string, unknown>)[key] = value;
      changed = true;
    }
  });
  return changed ? next : view;
};

// --- Tier 4 slice 4.6b: view-TYPE editing --------------------------------------

/**
 * The real Home Assistant view types HAVDM offers in the type editor. HAVDM's
 * internal `custom:grid-layout` canvas scaffold is deliberately EXCLUDED — it is
 * stripped to masonry on export (Tier 3, `HAVDM_INTERNAL_VIEW_TYPES`), so the
 * editor never lets a user pick it; a scaffold view reads as `masonry` here.
 */
export const STANDARD_VIEW_TYPES = ['masonry', 'sections', 'panel', 'sidebar'] as const;

/**
 * Normalise a view's raw `type` to the value the type editor should display.
 * HAVDM's internal canvas scaffold and an absent type both read as `masonry`
 * (which is what they deploy as). Real HA types pass through — including a real
 * layout-card `custom:*-layout`, which stays a current-value option in the type
 * editor and is never silently converted.
 *
 * ⚠ Slice 4.7a: "the scaffold" is `isHavdmScaffoldView`, NOT the bare
 * `custom:grid-layout` type string — a user's own layout-card grid view shares
 * that type and must read as itself.
 */
export const normalizeViewType = (view: View): string => {
  const t = view.type;
  if (t === 'sections' || t === 'panel' || t === 'sidebar' || t === 'masonry') return t;
  if (t === undefined || isHavdmScaffoldView(view)) return 'masonry';
  return t;
};

/**
 * Set a flat view's `type` (a metadata change among masonry/panel/sidebar and
 * the layout-card `custom:*-layout` types). Returns the input view unchanged
 * (reference-equal) when nothing would change. Content (`cards`) is carried
 * through by reference. Structural conversions to/from `sections` are NOT done
 * here — use `convertViewToSections` / `flattenSectionsView`.
 *
 * `layout` / `layout_type` handling (slice 4.7a):
 *  - HAVDM's own canvas scaffold is DROPPED along with its marker. It is
 *    internal bookkeeping with no meaning in Home Assistant, and leaving it
 *    behind would leak once the view carries a real, preserved type.
 *  - A USER's layout-card config is KEPT, even when switching to a standard HA
 *    type that ignores it, so switching back restores their grid — per FR-026 /
 *    the product vision, HAVDM never silently destroys user data. The export
 *    boundary is what declines to deploy it while the type is standard.
 */
// --- Tier 4 slice 4.7b: the layout-card EDITOR half ----------------------------

/** The layout-card grid keys the view-level grid editor can set. */
export type ViewGridPatch = Partial<{
  grid_template_columns: string;
  grid_template_rows: string;
  grid_gap: string;
}>;

/**
 * Edit a layout-card view's grid (slice 4.7b). Slice 4.7a made a user's grid
 * SURVIVE the export boundary; this is what lets them AUTHOR one.
 *
 * Values are carried as raw CSS strings rather than parsed into numbers. That is
 * deliberate: `repeat(6, 1fr)`, `1fr 2fr 1fr`, `minmax(100px, 1fr)` and
 * media-query-driven templates are all valid layout-card grids, and a numeric
 * column-count stepper would silently rewrite the ones it could not model. Per
 * the product vision HAVDM translates where it can and never destroys what it
 * cannot — so the editor round-trips the string and the CANVAS provides the
 * visual feedback by re-rendering at the declared column count and row height.
 *
 * Layout keys this editor does not manage (`grid_template_areas`, `mediaquery`,
 * layout-card's own `width`/`max_cols`, …) are carried through untouched. A
 * patch value of `undefined` or `''` REMOVES that key, so clearing a field
 * round-trips clean instead of deploying `grid_gap: ''`. Returns the input view
 * (reference-equal) when nothing changes; `cards` is carried by reference.
 */
export const setViewGrid = (view: View, patch: ViewGridPatch): View => {
  const currentLayout = view.layout ?? {};
  const nextLayout: Record<string, unknown> = { ...currentLayout };
  let changed = false;

  (Object.keys(patch) as (keyof ViewGridPatch)[]).forEach((key) => {
    const value = patch[key];
    if (value === undefined || value === '') {
      if (key in nextLayout) {
        delete nextLayout[key];
        changed = true;
      }
    } else if (nextLayout[key] !== value) {
      nextLayout[key] = value;
      changed = true;
    }
  });

  if (!changed) return view;
  return { ...view, layout: nextLayout as View['layout'] };
};

/**
 * The grid a view gets when the user converts it INTO a layout-card view
 * (slice 4.7b). Matches the canvas's own 12-column geometry so converting does
 * not make the canvas jump — but it is the USER's grid from that moment on, and
 * carries no scaffold marker.
 */
const DEFAULT_LAYOUT_CARD_GRID = {
  grid_template_columns: 'repeat(12, 1fr)',
  grid_template_rows: 'repeat(auto-fill, 56px)',
  grid_gap: '8px',
} as const;

/**
 * Convert an ordinary view into a REAL layout-card grid view (slice 4.7b) — the
 * inverse of the type change 4.7a warns about, and the action that makes the
 * grid editor reachable at all.
 *
 * ⚠ The critical step is clearing `_havdm_scaffold`. HAVDM's own views carry
 * that marker and `type: 'custom:grid-layout'` already; if the marker survived a
 * conversion, `isHavdmScaffoldView` would still claim the view and the export
 * boundary would destroy the very grid the user just asked for — reintroducing
 * the 4.7a bug through the front door.
 *
 * An existing `layout` is KEPT rather than overwritten (a user who already has a
 * grid config, e.g. after switching away and back, gets it honoured). A view
 * that is already a real layout-card grid is returned reference-equal.
 */
export const convertViewToLayoutCard = (view: View): View => {
  const alreadyLayoutCard =
    !isHavdmScaffoldView(view) &&
    view.type === 'custom:grid-layout' &&
    view.layout_type === 'grid' &&
    view.layout?.grid_template_columns !== undefined;
  if (alreadyLayoutCard) return view;

  const next: View = {
    ...view,
    type: 'custom:grid-layout',
    layout_type: 'grid',
    layout: { ...DEFAULT_LAYOUT_CARD_GRID, ...(view.layout ?? {}) },
  };
  // From here the grid is the user's, not HAVDM's bookkeeping.
  delete next._havdm_scaffold;
  return next;
};

export const setViewType = (view: View, type: string): View => {
  const isScaffold = isHavdmScaffoldView(view);
  const hasScaffoldKeys =
    isScaffold &&
    (view.layout !== undefined ||
      view.layout_type !== undefined ||
      view._havdm_scaffold !== undefined);
  if (view.type === type && !hasScaffoldKeys) return view;
  const next: View = { ...view, type };
  if (isScaffold) {
    delete next.layout;
    delete next.layout_type;
    delete next._havdm_scaffold;
  }
  return next;
};
