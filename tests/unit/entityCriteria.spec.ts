import { describe, expect, it } from 'vitest';
import {
  getCardEntityCriteria,
  entityMatchesCriteria,
  filterEntitiesForCard,
  matchesEntityQuery,
  isNumericEntity,
} from '../../src/utils/entityCriteria';
import type { HAEntity } from '../../src/types/homeassistant';

/**
 * Card-aware entity filtering, the primary axis of the entity-picker
 * re-engineering (owner ruling 2).
 *
 * ⚠ MOST OF THIS IS CONTROL LEGS. The dangerous failure here is an OVER-broad
 * criteria table that hides entities a card can legitimately use — a picker that
 * silently omits the entity you want is worse than one that shows too many,
 * because the user has no way to tell the difference from "it isn't there".
 * THE VISION's never-connected-is-PERMISSIVE principle applies to filtering too:
 * when we do not know, show everything.
 */

const entity = (entity_id: string, state: string, attributes: Record<string, unknown> = {}) =>
  ({ entity_id, state, attributes }) as unknown as HAEntity;

const TEMP = entity('sensor.living_room_temperature', '21.5', {
  friendly_name: 'Living Room Temperature',
  unit_of_measurement: '°C',
  device_class: 'temperature',
  state_class: 'measurement',
});
const EV_BATTERY = entity('sensor.kia_ev6_battery_level', '58', {
  friendly_name: 'Kia EV6 Battery Level',
  unit_of_measurement: '%',
  device_class: 'battery',
});
const LIGHT = entity('light.living_room', 'on', { friendly_name: 'Living Room Light' });
const CLIMATE = entity('climate.lounge', 'heat', { friendly_name: 'Lounge HVAC' });
const ALL = [TEMP, EV_BATTERY, LIGHT, CLIMATE];

describe('isNumericEntity', () => {
  it('accepts a numeric state', () => {
    expect(isNumericEntity(TEMP)).toBe(true);
  });

  it('rejects a non-numeric state', () => {
    expect(isNumericEntity(LIGHT)).toBe(false);
    expect(isNumericEntity(CLIMATE)).toBe(false);
  });

  // CONTROL LEG: an entity that is momentarily unavailable is still a valid
  // gauge target. Filtering it out would make the picker's contents depend on
  // whether a device happened to be awake.
  it('accepts an unavailable entity that carries a unit', () => {
    expect(
      isNumericEntity(entity('sensor.flaky_power', 'unavailable', { unit_of_measurement: 'W' })),
    ).toBe(true);
    expect(
      isNumericEntity(entity('sensor.flaky_power', 'unknown', { state_class: 'measurement' })),
    ).toBe(true);
  });

  it('rejects an unavailable entity with nothing to suggest it is numeric', () => {
    expect(isNumericEntity(entity('binary_sensor.door', 'unavailable'))).toBe(false);
  });

  it('rejects an empty state', () => {
    expect(isNumericEntity(entity('sensor.blank', ''))).toBe(false);
  });
});

describe('getCardEntityCriteria', () => {
  it('requires a numeric entity for a gauge', () => {
    expect(getCardEntityCriteria('gauge')?.requireNumeric).toBe(true);
  });

  it('constrains a light card to the light domain', () => {
    expect(getCardEntityCriteria('light')?.domains).toEqual(['light']);
  });

  it('constrains a thermostat to the climate domain', () => {
    expect(getCardEntityCriteria('thermostat')?.domains).toEqual(['climate']);
  });

  // ⭐ CONTROL LEG: these cards genuinely work with any entity. Constraining
  // them would be the over-broad failure this spec exists to prevent.
  it.each(['button', 'entities', 'glance', 'markdown', 'picture-entity'])(
    'leaves %s unconstrained',
    (type) => {
      expect(getCardEntityCriteria(type)).toBeNull();
    },
  );

  // ⭐ CONTROL LEG: THE VISION — when we do not know, be permissive.
  it('returns null for an unknown or custom card type', () => {
    expect(getCardEntityCriteria('custom:something-nobody-has-heard-of')).toBeNull();
    expect(getCardEntityCriteria('')).toBeNull();
  });
});

describe('entityMatchesCriteria', () => {
  it('matches everything when criteria are null', () => {
    expect(ALL.every((e) => entityMatchesCriteria(e, null))).toBe(true);
  });

  it('applies a domain constraint', () => {
    const c = { domains: ['light'] };
    expect(entityMatchesCriteria(LIGHT, c)).toBe(true);
    expect(entityMatchesCriteria(TEMP, c)).toBe(false);
  });

  it('applies a numeric constraint', () => {
    const c = { requireNumeric: true };
    expect(entityMatchesCriteria(TEMP, c)).toBe(true);
    expect(entityMatchesCriteria(LIGHT, c)).toBe(false);
  });
});

describe('filterEntitiesForCard', () => {
  it('narrows a gauge to numeric entities only', () => {
    const out = filterEntitiesForCard(ALL, 'gauge').map((e) => e.entity_id);
    expect(out).toEqual(['sensor.living_room_temperature', 'sensor.kia_ev6_battery_level']);
  });

  it('narrows a light card to lights only', () => {
    expect(filterEntitiesForCard(ALL, 'light').map((e) => e.entity_id)).toEqual([
      'light.living_room',
    ]);
  });

  // ⭐ CONTROL LEG, and the same reference-equality contract the sections and
  // container helpers use: an unconstrained card must hand back the SAME array
  // so callers can skip downstream work entirely.
  it('returns the identical array reference when the card is unconstrained', () => {
    expect(filterEntitiesForCard(ALL, 'button')).toBe(ALL);
  });

  it('does not mutate the input', () => {
    const copy = [...ALL];
    filterEntitiesForCard(ALL, 'gauge');
    expect(ALL).toEqual(copy);
  });

  it('survives a malformed entity list', () => {
    expect(filterEntitiesForCard([], 'gauge')).toEqual([]);
    expect(filterEntitiesForCard(undefined as unknown as HAEntity[], 'gauge')).toEqual([]);
  });
});

describe('matchesEntityQuery — multi-token, order-independent', () => {
  // ⭐ THE DEFECT THIS REPLACES: a single `includes()` over the concatenated
  // string, so a user typing the words they remember in the wrong order got
  // nothing back.
  it('matches tokens in any order', () => {
    expect(matchesEntityQuery(EV_BATTERY, 'battery kia')).toBe(true);
    expect(matchesEntityQuery(EV_BATTERY, 'kia battery')).toBe(true);
  });

  it('requires ALL tokens to match', () => {
    expect(matchesEntityQuery(EV_BATTERY, 'kia temperature')).toBe(false);
  });

  it('searches the entity id as well as the friendly name', () => {
    expect(matchesEntityQuery(EV_BATTERY, 'ev6')).toBe(true);
    expect(matchesEntityQuery(TEMP, 'living_room')).toBe(true);
  });

  it('searches device_class', () => {
    expect(matchesEntityQuery(TEMP, 'temperature')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(matchesEntityQuery(EV_BATTERY, 'KIA BaTTery')).toBe(true);
  });

  // CONTROL LEG: an empty query must not filter anything out.
  it('matches everything for an empty or whitespace query', () => {
    expect(ALL.every((e) => matchesEntityQuery(e, ''))).toBe(true);
    expect(ALL.every((e) => matchesEntityQuery(e, '   '))).toBe(true);
  });
});

/**
 * UAT HA-02 (High, regression) — "when selecting 'Integration' and searching for
 * kia only one entity is listed but there are 41 Kia Uvo integration entities".
 *
 * ⭐⭐⭐ THE ENTITY BELOW IS THE WHOLE DEFECT IN ONE FIXTURE. Home Assistant names
 * `kia_uvo` entities after the CAR, not the brand — "EV6 Odometer" — so the
 * string "kia" appears NOWHERE in its entity_id, its friendly name, its device
 * class or its unit. Only the owning integration knows it is a Kia. The browser
 * offered "Group by: Integration" while the search box beside it was blind to
 * that exact axis.
 *
 * ⚠ The pre-existing `EV_BATTERY` fixture above CANNOT prove this: it is called
 * `sensor.kia_ev6_battery_level` / "Kia EV6 Battery Level", so it matches "kia"
 * through the old haystack and would pass either way. It is the ONE entity in
 * forty-one that the tester did see.
 */
const EV_ODOMETER = entity('sensor.ev6_odometer', '12043', {
  friendly_name: 'EV6 Odometer',
  unit_of_measurement: 'km',
});

describe('matchesEntityQuery — integration search (UAT HA-02)', () => {
  it('does NOT match the integration when no platform is supplied — the defect', () => {
    // RED BEFORE THE FIX, and still the honest behaviour of a 2-arg call.
    expect(matchesEntityQuery(EV_ODOMETER, 'kia')).toBe(false);
  });

  it('matches the raw integration slug', () => {
    expect(matchesEntityQuery(EV_ODOMETER, 'kia_uvo', 'kia_uvo')).toBe(true);
  });

  it('matches the brand alone, which is what a user actually types', () => {
    expect(matchesEntityQuery(EV_ODOMETER, 'kia', 'kia_uvo')).toBe(true);
  });

  it('matches the humanised label shown in the group header', () => {
    // The tab reads "Kia Uvo", so typing what you read has to work.
    expect(matchesEntityQuery(EV_ODOMETER, 'kia uvo', 'kia_uvo')).toBe(true);
  });

  it('combines integration and entity tokens in any order', () => {
    expect(matchesEntityQuery(EV_ODOMETER, 'kia odometer', 'kia_uvo')).toBe(true);
    expect(matchesEntityQuery(EV_ODOMETER, 'odometer kia', 'kia_uvo')).toBe(true);
  });

  it('still requires ALL tokens — the integration does not become a wildcard', () => {
    expect(matchesEntityQuery(EV_ODOMETER, 'kia temperature', 'kia_uvo')).toBe(false);
  });

  it('does not match an integration the entity does not belong to', () => {
    expect(matchesEntityQuery(EV_ODOMETER, 'kia', 'sigen')).toBe(false);
  });

  // CONTROL LEG: the new parameter is optional, and null/undefined must behave
  // exactly as the two-argument call did. Every assertion in the block above
  // this one is a 2-arg call and must stay green untouched.
  it('behaves identically when platform is null or undefined', () => {
    expect(matchesEntityQuery(EV_BATTERY, 'kia battery', null)).toBe(true);
    expect(matchesEntityQuery(EV_BATTERY, 'kia battery', undefined)).toBe(true);
    expect(matchesEntityQuery(EV_ODOMETER, 'kia', null)).toBe(false);
  });

  // ⚠ `state` is deliberately NOT searchable — the browser's placeholder used to
  // claim it was. This pins the decision so a future edit is a choice, not a drift.
  it('does not search the entity state', () => {
    expect(matchesEntityQuery(EV_ODOMETER, '12043', 'kia_uvo')).toBe(false);
  });
});
