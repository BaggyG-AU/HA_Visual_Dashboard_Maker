/**
 * Unit Test: `tile` card feature resolution.
 *
 * The tile card's `features[]` row is the part of HA-03 that carries real
 * behaviour, so it lives in a pure module and is tested here rather than only
 * through the canvas.
 *
 * ⚠ The fixtures below are built from the CARD'S DOCUMENTED SCHEMA, not from
 * the reference instance — which uses exactly ONE feature type (`numeric-input`)
 * and would therefore have left 29 of the 30 untested. The one shape the
 * instance does contain is asserted verbatim, as a cross-check that the schema
 * assumption matches reality where reality is available.
 */
import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_TILE_FEATURES,
  resolveTileFeature,
  resolveTileFeatures,
  tileSliderLabel,
  tileSliderPercent,
} from '../../src/utils/tileFeatures';

describe('tile feature coverage', () => {
  it('models every tile feature Home Assistant ships', () => {
    // Pinning the count is what makes a silently-dropped row visible.
    expect(SUPPORTED_TILE_FEATURES.length).toBe(30);
  });

  it('assigns every supported feature one of the four control archetypes', () => {
    const archetypes = new Set(['toggle', 'slider', 'options', 'commands']);
    for (const type of SUPPORTED_TILE_FEATURES) {
      const resolved = resolveTileFeature({ type });
      expect(resolved.supported, `${type} resolved as unsupported`).toBe(true);
      expect(archetypes.has(resolved.control), `${type} has no archetype`).toBe(true);
      expect(resolved.label.length, `${type} has no label`).toBeGreaterThan(0);
    }
  });
});

describe('the reference instance cross-check', () => {
  it('resolves the exact numeric-input feature found on the real dashboard', () => {
    // Verbatim from ha.home.local's `tile` on sensor.sigen_plant_battery_state_of_charge.
    const resolved = resolveTileFeature(
      { type: 'numeric-input', style: 'slider' },
      { state: '67', attributes: { min: 0, max: 100, step: 1, unit_of_measurement: '%' } },
    );

    expect(resolved.control).toBe('slider');
    expect(resolved.value).toBe(67);
    expect(resolved.min).toBe(0);
    expect(resolved.max).toBe(100);
    expect(resolved.unit).toBe('%');
    expect(tileSliderLabel(resolved)).toBe('67%');
  });
});

describe('slider features', () => {
  it('reads bounds from the entity rather than assuming them', () => {
    const resolved = resolveTileFeature(
      { type: 'target-temperature' },
      {
        state: 'heat',
        attributes: { temperature: 21.5, min_temp: 16, max_temp: 30, target_temp_step: 0.5 },
      },
    );

    expect(resolved.value).toBe(21.5);
    expect(resolved.min).toBe(16);
    expect(resolved.max).toBe(30);
    expect(resolved.step).toBe(0.5);
    // Precision follows the step, so half-degree targets are not rounded away.
    expect(tileSliderLabel(resolved)).toBe('21.5°');
  });

  it('clamps an out-of-range reading instead of overflowing the track', () => {
    const resolved = resolveTileFeature(
      { type: 'cover-position' },
      { state: 'open', attributes: { current_position: 140 } },
    );

    expect(resolved.value).toBe(100);
    expect(tileSliderPercent(resolved)).toBe(100);
  });

  it('reports an absent value as unknown rather than as zero', () => {
    // ⭐ A missing reading drawn as 0 % is a lie about the entity — it would
    // show a closed cover for one whose position simply is not known.
    const resolved = resolveTileFeature({ type: 'light-brightness' }, { state: 'on' });

    expect(resolved.value).toBeUndefined();
    expect(tileSliderLabel(resolved)).toBe('—');
    expect(tileSliderPercent(resolved)).toBe(0);
  });

  it('falls back to documented defaults when the entity is absent entirely', () => {
    const resolved = resolveTileFeature({ type: 'light-color-temp' }, null);

    expect(resolved.min).toBe(2000);
    expect(resolved.max).toBe(6500);
  });
});

describe('options features', () => {
  it('prefers the card config over the entity attributes, as HA does', () => {
    const resolved = resolveTileFeature(
      { type: 'climate-hvac-modes', hvac_modes: ['heat', 'off'] },
      { state: 'heat', attributes: { hvac_modes: ['heat', 'cool', 'auto', 'off'] } },
    );

    expect(resolved.options?.map((o) => o.value)).toEqual(['heat', 'off']);
    expect(resolved.active).toBe('heat');
  });

  it('falls back to the entity attributes when the card lists none', () => {
    const resolved = resolveTileFeature(
      { type: 'select-options' },
      { state: 'Eco', attributes: { options: ['Eco', 'Boost'] } },
    );

    expect(resolved.options?.map((o) => o.value)).toEqual(['Eco', 'Boost']);
    expect(resolved.active).toBe('Eco');
  });

  it('reads the active option from its own attribute, not the state', () => {
    // A climate entity's STATE is its hvac mode; its preset lives elsewhere.
    const resolved = resolveTileFeature(
      { type: 'climate-preset-modes' },
      { state: 'heat', attributes: { preset_modes: ['home', 'away'], preset_mode: 'away' } },
    );

    expect(resolved.active).toBe('away');
  });

  it('returns an EMPTY list rather than inventing modes the entity lacks', () => {
    // ⭐⭐ The load-bearing assertion of this file. Hard-coding a default mode
    // list would make HAVDM claim capabilities the user's hardware does not
    // have — a lie about their house, not merely a rendering inaccuracy.
    const resolved = resolveTileFeature(
      { type: 'climate-hvac-modes' },
      { state: 'heat', attributes: {} },
    );

    expect(resolved.supported).toBe(true);
    expect(resolved.options).toEqual([]);
  });
});

describe('command features', () => {
  it('supplies HA’s fixed commands for a cover', () => {
    const resolved = resolveTileFeature({ type: 'cover-open-close' }, { state: 'open' });

    expect(resolved.control).toBe('commands');
    expect(resolved.options?.map((o) => o.value)).toEqual(['open', 'stop', 'close']);
  });

  it('honours a card-supplied command subset, keeping its order and icons', () => {
    const resolved = resolveTileFeature(
      { type: 'vacuum-commands', commands: ['return_home', 'start_pause'] },
      { state: 'cleaning' },
    );

    expect(resolved.options?.map((o) => o.value)).toEqual(['return_home', 'start_pause']);
    expect(resolved.options?.[0]?.icon).toBe('mdi:home-map-marker');
  });

  it('surfaces an unrecognised command rather than dropping it', () => {
    const resolved = resolveTileFeature(
      { type: 'vacuum-commands', commands: ['start_pause', 'fetch_slippers'] },
      { state: 'cleaning' },
    );

    expect(resolved.options?.map((o) => o.value)).toEqual(['start_pause', 'fetch_slippers']);
    expect(resolved.options?.[1]?.label).toBe('Fetch slippers');
  });
});

describe('toggle features', () => {
  it.each([
    ['on', true],
    ['open', true],
    ['unlocked', true],
    ['off', false],
    ['unavailable', false],
  ])('reads %s as on=%s', (state, expected) => {
    expect(resolveTileFeature({ type: 'toggle' }, { state }).on).toBe(expected);
  });
});

describe('unknown and malformed features', () => {
  it('marks an unmodelled feature type instead of dropping it silently', () => {
    // ⭐ "Honestly mark what you cannot render", applied one level down: a
    // feature HAVDM does not know still appears, named, so the user can see
    // that their tile has one.
    const resolved = resolveTileFeature({ type: 'flux-capacitor-control' });

    expect(resolved.supported).toBe(false);
    expect(resolved.label).toBe('Flux capacitor control');
  });

  it('drops entries that cannot name a control at all', () => {
    const resolved = resolveTileFeatures(
      [
        { type: 'toggle' },
        null as never,
        {} as never,
        { type: 42 } as never,
        { type: 'cover-position' },
      ],
      { state: 'on', attributes: { current_position: 50 } },
    );

    expect(resolved.map((f) => f.type)).toEqual(['toggle', 'cover-position']);
  });

  it('returns an empty array for a card with no features', () => {
    expect(resolveTileFeatures(undefined, null)).toEqual([]);
    expect(resolveTileFeatures([], null)).toEqual([]);
  });
});
