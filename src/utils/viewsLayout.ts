import type { DashboardConfig, View } from '../types/dashboard';

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

/** HAVDM's flat-canvas grid scaffold, mirrored by every view HAVDM creates. */
const BLANK_VIEW_LAYOUT = {
  grid_template_columns: 'repeat(12, 1fr)',
  grid_template_rows: 'repeat(auto-fill, 56px)',
  grid_gap: '8px',
} as const;

/**
 * Build a blank HAVDM view — the flat 12-column / 56px-row canvas scaffold
 * (`type: 'custom:grid-layout'` + the matching `layout`) that every HAVDM
 * creation flow stamps, so a view added on-canvas renders identically to a
 * brand-new dashboard's view. The scaffold is HAVDM-internal and is stripped on
 * export (Tier 3, `HAVDM_INTERNAL_VIEW_TYPES`), deploying as a real HA masonry
 * view. Defaults to Home/home.
 */
export const buildBlankView = (opts: { title?: string; path?: string } = {}): View => ({
  title: opts.title ?? 'Home',
  path: opts.path ?? 'home',
  type: 'custom:grid-layout',
  layout: { ...BLANK_VIEW_LAYOUT },
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
 * The internal `custom:grid-layout` scaffold and an absent type both read as
 * `masonry` (which is what they deploy as). Real HA types pass through. A real
 * layout-card `custom:*-layout` is returned as-is so it stays a current-value
 * option and is never silently converted (first-class layout-card views are 4.7).
 */
export const normalizeViewType = (view: View): string => {
  const t = view.type;
  if (t === 'sections' || t === 'panel' || t === 'sidebar' || t === 'masonry') return t;
  if (t === undefined || t === 'custom:grid-layout') return 'masonry';
  return t;
};

/**
 * Set a flat view's `type` (a non-lossy metadata change among masonry/panel/
 * sidebar). Because a plain HA view type does not use `view.layout`, the internal
 * grid scaffold (`layout` / `layout_type`) is dropped so it cannot leak to Home
 * Assistant once the view carries a real, preserved type. Returns the input view
 * unchanged (reference-equal) when the type is already `type` and there is no
 * scaffold to drop. Content (`cards`) is carried through by reference.
 * Structural conversions to/from `sections` are NOT done here — use
 * `convertViewToSections` / `flattenSectionsView`.
 */
export const setViewType = (view: View, type: string): View => {
  const hasScaffold = view.layout !== undefined || view.layout_type !== undefined;
  if (view.type === type && !hasScaffold) return view;
  const next: View = { ...view, type };
  delete next.layout;
  delete next.layout_type;
  return next;
};
