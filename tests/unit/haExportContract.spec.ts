import { describe, it, expect } from 'vitest';
import {
  KEY_ACTION,
  STRIP_KEYS,
  CARD_MOD_KEYS,
  HA_VISIBILITY_KEYS,
  CANVAS_KEYS,
  type KeyAction,
} from '../../src/services/haExportContract';

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
