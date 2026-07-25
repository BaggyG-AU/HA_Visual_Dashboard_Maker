import { describe, it, expect } from 'vitest';
import {
  buildBlankView,
  addView,
  removeView,
  moveView,
  setViewProps,
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
