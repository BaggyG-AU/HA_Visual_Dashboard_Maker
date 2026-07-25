import { describe, it, expect } from 'vitest';
import {
  KEY_ACTION,
  STRIP_KEYS,
  CARD_MOD_KEYS,
  HA_VISIBILITY_KEYS,
  CANVAS_KEYS,
  HAVDM_SCAFFOLD_LAYOUT,
  isHavdmScaffoldView,
  isLayoutCardViewType,
  type KeyAction,
} from '../../src/services/haExportContract';
import type { View } from '../../src/types/dashboard';

// Slice B1 of the export-boundary work. This locks the classification registry
// (design: docs/refresh/HA_EXPORT_BOUNDARY_DESIGN_2026-07.md §3.1). The
// "complete by construction" guard is a COMPILE-TIME assertion (typecheck fails
// if a BaseCard/Phase6CardContracts field is unclassified); these runtime tests
// pin the map's contents and the derived key sets that slices B2/B6/B6b/B7 read.

describe('haExportContract — KEY_ACTION classification registry', () => {
  const VALID_ACTIONS: readonly KeyAction[] = ['card-mod', 'ha-visibility', 'strip', 'canvas'];

  it('classifies every key as exactly one of the four valid actions', () => {
    for (const [key, action] of Object.entries(KEY_ACTION)) {
      expect(VALID_ACTIONS, `key "${key}" has an unexpected action`).toContain(action);
    }
  });

  it('classifies the TRANSLATE → card-mod layout/style keys', () => {
    // Layout-enhancement keys (from the stack/grid subtypes) + BaseCard style keys.
    for (const key of [
      'gap',
      'align_items',
      'justify_content',
      'justify_items',
      'wrap',
      'row_gap',
      'column_gap',
      'card_margin',
      'card_padding',
      'style',
    ]) {
      expect(KEY_ACTION[key as keyof typeof KEY_ACTION]).toBe('card-mod');
    }
  });

  it('classifies the TRANSLATE → HA-visibility condition keys', () => {
    expect(KEY_ACTION.visibility_conditions).toBe('ha-visibility');
    expect(KEY_ACTION.visibility_operator).toBe('ha-visibility');
  });

  it('classifies the STRIP (internal/derived-bookkeeping) keys', () => {
    expect(KEY_ACTION._havdm_layout).toBe('strip');
    expect(KEY_ACTION._isSpacer).toBe('strip');
    expect(KEY_ACTION._expanderDepth).toBe('strip');
    expect(KEY_ACTION.icon_color_mode).toBe('strip');
    // Phase 4 PR-1: the derived/internal styling keys, silently stripped.
    expect(KEY_ACTION.icon_color_states).toBe('strip');
    expect(KEY_ACTION.icon_color_attribute).toBe('strip');
    expect(KEY_ACTION.smart_defaults).toBe('strip');
  });

  it('classifies the CANVAS-only behavioural keys (strip + warn)', () => {
    for (const key of [
      'attribute_display',
      'attribute_display_layout',
      'multi_entity_mode',
      'aggregate_function',
      'batch_actions',
      'trigger_animations',
      'state_styles',
      'state_icons',
      'sound',
      // Phase 4 PR-1: haptic joined the canvas class (behavioural, no HA target).
      'haptic',
    ]) {
      expect(KEY_ACTION[key as keyof typeof KEY_ACTION]).toBe('canvas');
    }
  });

  it('does NOT classify HA-real keys (they pass through untouched)', () => {
    // The HA-real extras stay untouched. If any of these ever appears in the map
    // it would silently change deploy output, so guard against it explicitly.
    // (`bare` layout is disambiguated by value-shape on import — B5.)
    for (const key of [
      'layout',
      'view_layout',
      'visibility',
      'grid_options',
      'layout_options',
      'icon_color',
      'tap_action',
    ]) {
      expect(KEY_ACTION).not.toHaveProperty(key);
    }
  });
});

describe('haExportContract — derived key sets', () => {
  it('STRIP_KEYS is exactly the seven internal/derived-bookkeeping keys', () => {
    expect([...STRIP_KEYS].sort()).toEqual(
      [
        '_expanderDepth',
        '_havdm_layout',
        '_isSpacer',
        'icon_color_mode',
        'icon_color_states',
        'icon_color_attribute',
        'smart_defaults',
      ].sort(),
    );
  });

  it('CARD_MOD_KEYS covers the layout/style translation set', () => {
    expect([...CARD_MOD_KEYS].sort()).toEqual(
      [
        'align_items',
        'card_margin',
        'card_padding',
        'column_gap',
        'gap',
        'justify_content',
        'justify_items',
        'row_gap',
        'style',
        'wrap',
      ].sort(),
    );
  });

  it('HA_VISIBILITY_KEYS is exactly the two condition keys', () => {
    expect([...HA_VISIBILITY_KEYS].sort()).toEqual(
      ['visibility_conditions', 'visibility_operator'].sort(),
    );
  });

  it('CANVAS_KEYS covers the behavioural set', () => {
    expect([...CANVAS_KEYS].sort()).toEqual(
      [
        'aggregate_function',
        'attribute_display',
        'attribute_display_layout',
        'batch_actions',
        'haptic',
        'multi_entity_mode',
        'sound',
        'state_icons',
        'state_styles',
        'trigger_animations',
      ].sort(),
    );
  });

  it('the four derived sets partition KEY_ACTION with no overlap or omission', () => {
    const derived = [...STRIP_KEYS, ...CARD_MOD_KEYS, ...HA_VISIBILITY_KEYS, ...CANVAS_KEYS];
    // No key falls into two classes.
    expect(new Set(derived).size).toBe(derived.length);
    // Every classified key is covered by exactly one derived set.
    expect(derived.sort()).toEqual(Object.keys(KEY_ACTION).sort());
  });
});

// ---------------------------------------------------------------------------
// Tier 4 slice 4.7a — HAVDM scaffold vs. a REAL layout-card view
// ---------------------------------------------------------------------------
//
// HAVDM stamps `type: 'custom:grid-layout'` + a 12-col/56px `layout` on every
// view it creates, as its internal flat-canvas scaffold. Before this slice the
// export boundary keyed off that TYPE STRING alone, so a user's own
// layout-card `custom:grid-layout` view was indistinguishable from the scaffold
// and had its `type` + `layout` silently destroyed on export. The predicate
// below is the disambiguator: an explicit `_havdm_scaffold` marker (stamped by
// every HAVDM creation site from this slice on), plus an exact-signature
// fallback so dashboards saved BEFORE the marker existed still read as scaffold.

describe('haExportContract — isHavdmScaffoldView (Tier 4, slice 4.7a)', () => {
  const scaffoldView = (over: Record<string, unknown> = {}): View =>
    ({
      title: 'V',
      path: 'v',
      cards: [],
      type: 'custom:grid-layout',
      layout: { ...HAVDM_SCAFFOLD_LAYOUT },
      _havdm_scaffold: true,
      ...over,
    }) as unknown as View;

  it('recognises a marked HAVDM scaffold view', () => {
    expect(isHavdmScaffoldView(scaffoldView())).toBe(true);
  });

  it('recognises a LEGACY (unmarked) scaffold by its exact layout signature', () => {
    // Dashboards saved before the marker existed. Every HAVDM creation site has
    // always emitted this byte-identical signature.
    expect(isHavdmScaffoldView(scaffoldView({ _havdm_scaffold: undefined }))).toBe(true);
  });

  it("does NOT claim a user's real layout-card grid view (different row height)", () => {
    const real = scaffoldView({
      _havdm_scaffold: undefined,
      layout: {
        grid_template_columns: 'repeat(12, 1fr)',
        grid_template_rows: 'repeat(auto-fill, 30px)',
        grid_gap: '8px',
      },
    });
    expect(isHavdmScaffoldView(real)).toBe(false);
  });

  it("does NOT claim a user's real grid view that carries EXTRA layout keys", () => {
    const real = scaffoldView({
      _havdm_scaffold: undefined,
      layout: { ...HAVDM_SCAFFOLD_LAYOUT, grid_template_areas: '"a b"' },
    });
    expect(isHavdmScaffoldView(real)).toBe(false);
  });

  it("does NOT claim a user's real grid view that has NO layout block", () => {
    const real = scaffoldView({ _havdm_scaffold: undefined, layout: undefined });
    expect(isHavdmScaffoldView(real)).toBe(false);
  });

  it('does NOT claim a view carrying a real layout_type alongside the signature', () => {
    const real = scaffoldView({ _havdm_scaffold: undefined, layout_type: 'grid' });
    expect(isHavdmScaffoldView(real)).toBe(false);
  });

  it('does NOT claim any other view type, even with the scaffold layout', () => {
    for (const type of ['masonry', 'panel', 'sidebar', 'sections', 'custom:vertical-layout']) {
      expect(isHavdmScaffoldView(scaffoldView({ type, _havdm_scaffold: undefined }))).toBe(false);
    }
    expect(isHavdmScaffoldView(scaffoldView({ type: undefined, _havdm_scaffold: undefined }))).toBe(
      false,
    );
  });

  it('honours the marker even if a later slice edits the scaffold grid', () => {
    // The marker is authoritative — this is why signature-matching alone is not
    // enough: a view-level grid editor (4.7b) would break the signature.
    const edited = scaffoldView({ layout: { grid_template_columns: 'repeat(6, 1fr)' } });
    expect(isHavdmScaffoldView(edited)).toBe(true);
  });
});

describe('haExportContract — isLayoutCardViewType (Tier 4, slice 4.7a)', () => {
  it('recognises the layout-card view types whose `layout` must survive export', () => {
    for (const type of [
      'custom:grid-layout',
      'custom:vertical-layout',
      'custom:horizontal-layout',
      'custom:masonry-layout',
    ]) {
      expect(isLayoutCardViewType(type)).toBe(true);
    }
  });

  it('rejects the standard HA view types and a missing type', () => {
    for (const type of ['masonry', 'panel', 'sidebar', 'sections']) {
      expect(isLayoutCardViewType(type)).toBe(false);
    }
    expect(isLayoutCardViewType(undefined)).toBe(false);
    expect(isLayoutCardViewType('custom:popup-card')).toBe(false);
  });
});
