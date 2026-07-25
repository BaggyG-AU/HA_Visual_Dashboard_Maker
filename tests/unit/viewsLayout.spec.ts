import { describe, it, expect } from 'vitest';
import {
  buildBlankView,
  addView,
  removeView,
  moveView,
  setViewProps,
  normalizeViewType,
  setViewType,
  STANDARD_VIEW_TYPES,
} from '../../src/utils/viewsLayout';
import type { DashboardConfig, View } from '../../src/types/dashboard';

const view = (over: Partial<View> = {}): View => ({ title: 'V', path: 'v', cards: [], ...over });

const config = (views: View[]): DashboardConfig => ({ title: 'D', views });

describe('viewsLayout — buildBlankView', () => {
  it('produces the HAVDM flat canvas scaffold (custom:grid-layout + 12-col/56px layout, empty cards)', () => {
    const v = buildBlankView();
    expect(v.type).toBe('custom:grid-layout');
    expect(v.cards).toEqual([]);
    expect(v.layout).toEqual({
      grid_template_columns: 'repeat(12, 1fr)',
      grid_template_rows: 'repeat(auto-fill, 56px)',
      grid_gap: '8px',
    });
    expect(v.title).toBe('Home');
    expect(v.path).toBe('home');
  });

  it('honours a supplied title/path', () => {
    const v = buildBlankView({ title: 'Kitchen', path: 'kitchen' });
    expect(v.title).toBe('Kitchen');
    expect(v.path).toBe('kitchen');
  });
});

describe('viewsLayout — addView', () => {
  it('appends a blank view and returns a NEW config, existing views carried reference-equal', () => {
    const a = view({ title: 'A', path: 'a' });
    const cfg = config([a]);
    const next = addView(cfg);
    expect(next).not.toBe(cfg);
    expect(next.views).toHaveLength(2);
    expect(next.views[0]).toBe(a); // untouched sibling is reference-equal
    expect(next.views[1].type).toBe('custom:grid-layout');
    expect(next.views[1].cards).toEqual([]);
  });

  it('gives the new view a path that does not collide with existing views', () => {
    const cfg = config([
      view({ title: 'Home', path: 'home' }),
      view({ title: 'View 2', path: 'view-2' }),
    ]);
    const next = addView(cfg);
    const paths = next.views.map((v) => v.path);
    expect(new Set(paths).size).toBe(paths.length); // all unique
    expect(next.views[2].path).not.toBe('home');
    expect(next.views[2].path).not.toBe('view-2');
  });

  it('inserts at a clamped index when atIndex is given', () => {
    const cfg = config([view({ path: 'a' }), view({ path: 'b' })]);
    const next = addView(cfg, 1);
    expect(next.views).toHaveLength(3);
    expect(next.views[1].type).toBe('custom:grid-layout'); // inserted in the middle
    expect(next.views[0].path).toBe('a');
    expect(next.views[2].path).toBe('b');
  });
});

describe('viewsLayout — removeView', () => {
  it('removes the view at an index, keeping the rest in order', () => {
    const a = view({ path: 'a' });
    const b = view({ path: 'b' });
    const c = view({ path: 'c' });
    const next = removeView(config([a, b, c]), 1);
    expect(next.views.map((v) => v.path)).toEqual(['a', 'c']);
    expect(next.views[0]).toBe(a);
    expect(next.views[1]).toBe(c);
  });

  it('NEVER removes the last remaining view (reference-equal no-op)', () => {
    const cfg = config([view({ path: 'only' })]);
    expect(removeView(cfg, 0)).toBe(cfg);
  });

  it('is a reference-equal no-op for an out-of-range index', () => {
    const cfg = config([view({ path: 'a' }), view({ path: 'b' })]);
    expect(removeView(cfg, 5)).toBe(cfg);
    expect(removeView(cfg, -1)).toBe(cfg);
  });
});

describe('viewsLayout — moveView', () => {
  it('moves a view from one index to another', () => {
    const cfg = config([view({ path: 'a' }), view({ path: 'b' }), view({ path: 'c' })]);
    expect(moveView(cfg, 0, 2).views.map((v) => v.path)).toEqual(['b', 'c', 'a']);
    expect(moveView(cfg, 2, 0).views.map((v) => v.path)).toEqual(['c', 'a', 'b']);
  });

  it('is a reference-equal no-op for same index or out-of-range source', () => {
    const cfg = config([view({ path: 'a' }), view({ path: 'b' })]);
    expect(moveView(cfg, 1, 1)).toBe(cfg);
    expect(moveView(cfg, 9, 0)).toBe(cfg);
  });
});

describe('viewsLayout — setViewProps', () => {
  it('sets identity props, returning a NEW view and carrying cards by reference', () => {
    const cards = [{ type: 'button' }] as View['cards'];
    const v = view({ title: 'Old', cards });
    const next = setViewProps(v, { title: 'New', icon: 'mdi:home', panel: true });
    expect(next).not.toBe(v);
    expect(next.title).toBe('New');
    expect(next.icon).toBe('mdi:home');
    expect(next.panel).toBe(true);
    expect(next.cards).toBe(cards); // content untouched, reference-equal
  });

  it('supports subview + back_path', () => {
    const next = setViewProps(view(), { subview: true, back_path: '/lovelace/0' });
    expect(next.subview).toBe(true);
    expect(next.back_path).toBe('/lovelace/0');
  });

  it('clears a key when the patch value is an empty string or undefined', () => {
    const v = view({ title: 'Home', icon: 'mdi:home', panel: true });
    const next = setViewProps(v, { title: '', icon: undefined, panel: undefined });
    expect(next).not.toHaveProperty('title');
    expect(next).not.toHaveProperty('icon');
    expect(next).not.toHaveProperty('panel');
  });

  it('is a reference-equal no-op when nothing changes', () => {
    const v = view({ title: 'Home', panel: true });
    expect(setViewProps(v, { title: 'Home', panel: true })).toBe(v);
    // clearing an already-absent key is also a no-op
    expect(setViewProps(v, { icon: '' })).toBe(v);
  });
});

describe('viewsLayout — normalizeViewType (Tier 4, slice 4.6b)', () => {
  it('maps the internal custom:grid-layout scaffold and an absent type to masonry', () => {
    // Slice 4.7a: "the scaffold" is now the MARKED view buildBlankView emits —
    // a bare `type: custom:grid-layout` is a user's real layout-card view.
    expect(normalizeViewType(buildBlankView())).toBe('masonry');
    expect(normalizeViewType(view({ type: undefined }))).toBe('masonry');
  });

  it('passes real HA view types through unchanged', () => {
    expect(normalizeViewType(view({ type: 'masonry' }))).toBe('masonry');
    expect(normalizeViewType(view({ type: 'sections' }))).toBe('sections');
    expect(normalizeViewType(view({ type: 'panel' }))).toBe('panel');
    expect(normalizeViewType(view({ type: 'sidebar' }))).toBe('sidebar');
  });

  it('keeps a real layout-card custom:*-layout as-is (never silently normalised)', () => {
    expect(normalizeViewType(view({ type: 'custom:vertical-layout' }))).toBe(
      'custom:vertical-layout',
    );
  });

  it('never offers the internal scaffold type as a standard choice', () => {
    expect(STANDARD_VIEW_TYPES).toEqual(['masonry', 'sections', 'panel', 'sidebar']);
    expect(STANDARD_VIEW_TYPES).not.toContain('custom:grid-layout');
  });
});

describe('viewsLayout — setViewType (Tier 4, slice 4.6b)', () => {
  it('changes a flat view type and drops the internal grid scaffold so it cannot leak to HA', () => {
    // Slice 4.7a: only the MARKED HAVDM scaffold is discarded on a type change;
    // a user's real layout-card config is kept (see the 4.7a describe below).
    const v = { ...buildBlankView(), title: 'V', path: 'v' } as View;
    const next = setViewType(v, 'masonry');
    expect(next.type).toBe('masonry');
    expect(next).not.toHaveProperty('layout');
    expect(next).not.toHaveProperty('layout_type');
  });

  it('swaps between real flat types (masonry -> panel)', () => {
    expect(setViewType(view({ type: 'masonry' }), 'panel').type).toBe('panel');
  });

  it('carries cards through by reference', () => {
    const cards = [{ type: 'button' }] as View['cards'];
    const v = view({ type: 'masonry', cards });
    expect(setViewType(v, 'panel').cards).toBe(cards);
  });

  it('is a reference-equal no-op when the type is unchanged and there is no scaffold to drop', () => {
    const v = view({ type: 'panel' });
    expect(setViewType(v, 'panel')).toBe(v);
  });
});

// ---------------------------------------------------------------------------
// Tier 4 slice 4.7a — first-class layout-card views
// ---------------------------------------------------------------------------
//
// Before this slice the view-type model keyed off the string
// `custom:grid-layout`, which HAVDM stamps on its own flat-canvas scaffold. A
// user's REAL layout-card grid view therefore read as "masonry" in the type
// editor, and any type change threw away its `layout` / `layout_type`. The
// scaffold now carries an explicit marker, so the two are distinguishable.

describe('viewsLayout — scaffold marking (Tier 4, slice 4.7a)', () => {
  it('marks the view it builds as HAVDM-internal so export can tell it apart', () => {
    const v = buildBlankView();
    expect(v._havdm_scaffold).toBe(true);
  });
});

describe('viewsLayout — normalizeViewType with real layout-card views (slice 4.7a)', () => {
  it("reports a user's real custom:grid-layout view as itself, not as masonry", () => {
    const real = view({
      type: 'custom:grid-layout',
      layout: { grid_template_columns: 'repeat(6, 1fr)' },
    } as Partial<View>);
    expect(normalizeViewType(real)).toBe('custom:grid-layout');
  });

  it('still reports the marked HAVDM scaffold as masonry (what it deploys as)', () => {
    expect(normalizeViewType(buildBlankView())).toBe('masonry');
  });

  it('reports a LEGACY unmarked scaffold as masonry via its exact signature', () => {
    const { _havdm_scaffold: _marker, ...legacy } = buildBlankView() as View & {
      _havdm_scaffold?: boolean;
    };
    void _marker;
    expect(normalizeViewType(legacy as View)).toBe('masonry');
  });
});

describe('viewsLayout — setViewType with real layout-card views (slice 4.7a)', () => {
  const realGrid = (): View =>
    view({
      type: 'custom:grid-layout',
      layout_type: 'grid',
      layout: { grid_template_columns: 'repeat(6, 1fr)', grid_gap: '4px' },
    } as Partial<View>);

  it("KEEPS a real layout-card view's layout config when switching to a standard type", () => {
    // FR-026 / "never silently destroy user data": the config stays in HAVDM so
    // the user can switch back. The export boundary is what declines to deploy
    // it once the view carries a standard HA type.
    const next = setViewType(realGrid(), 'masonry');
    expect(next.type).toBe('masonry');
    expect(next.layout).toEqual({ grid_template_columns: 'repeat(6, 1fr)', grid_gap: '4px' });
    expect(next.layout_type).toBe('grid');
  });

  it('keeps the layout when switching between layout-card types', () => {
    const next = setViewType(realGrid(), 'custom:vertical-layout');
    expect(next.type).toBe('custom:vertical-layout');
    expect(next.layout).toEqual({ grid_template_columns: 'repeat(6, 1fr)', grid_gap: '4px' });
  });

  it('DROPS the internal scaffold (layout + marker) — it has no meaning in HA', () => {
    const next = setViewType(buildBlankView(), 'panel') as View & { _havdm_scaffold?: boolean };
    expect(next.type).toBe('panel');
    expect(next).not.toHaveProperty('layout');
    expect(next).not.toHaveProperty('layout_type');
    expect(next._havdm_scaffold).toBeUndefined();
  });

  it('is a reference-equal no-op for a real layout-card view whose type is unchanged', () => {
    const v = realGrid();
    expect(setViewType(v, 'custom:grid-layout')).toBe(v);
  });
});
