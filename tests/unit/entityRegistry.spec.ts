import { describe, expect, it } from 'vitest';
import type { HAEntity } from '../../src/types/homeassistant';
import {
  UNREGISTERED_PLATFORM,
  buildRegistryIndex,
  filterEntitiesByRegistry,
  groupEntitiesByPlatform,
  isNoiseEntity,
  platformLabel,
  projectRegistryEntries,
} from '../../src/utils/entityRegistry';
import {
  liveEntityIdsWithNoRegistryRow,
  realEntityRegistryRows,
} from '../fixtures/haEntityRegistry';

const ent = (id: string): HAEntity => ({
  entity_id: id,
  state: 'on',
  attributes: { friendly_name: id },
  last_changed: '',
  last_updated: '',
  context: { id: 'c', parent_id: null, user_id: null },
});

/** The instance's own shape: a few plain entities, a diagnostic, a config. */
const REGISTRY = buildRegistryIndex(realEntityRegistryRows);

describe('projectRegistryEntries', () => {
  it('keeps only the six fields we persist, discarding the rest of the real payload', () => {
    const [first] = projectRegistryEntries([realEntityRegistryRows[0]]);

    expect(first).toEqual({
      entity_id: 'sensor.sun_next_dawn',
      platform: 'sun',
      entity_category: 'diagnostic',
      hidden_by: null,
      area_id: null,
      device_id: '9f2396a92ba4a655f20b9024ffc6b52c',
    });
    // The real row carries these; the projection must not.
    expect(first).not.toHaveProperty('options');
    expect(first).not.toHaveProperty('unique_id');
    expect(first).not.toHaveProperty('translation_key');
  });

  it('normalises absent optional fields to null rather than undefined', () => {
    const [entry] = projectRegistryEntries([{ entity_id: 'light.a', platform: 'demo' }]);

    expect(entry).toEqual({
      entity_id: 'light.a',
      platform: 'demo',
      entity_category: null,
      hidden_by: null,
      area_id: null,
      device_id: null,
    });
  });

  it('drops rows with no usable entity_id or platform instead of throwing', () => {
    const rows = [
      { entity_id: 'light.good', platform: 'demo' },
      { entity_id: '', platform: 'demo' },
      { platform: 'demo' },
      { entity_id: 'light.nop' },
      null,
      'not an object',
      42,
    ];

    expect(projectRegistryEntries(rows).map((e) => e.entity_id)).toEqual(['light.good']);
  });

  it('returns an empty array for every non-array input (never throws)', () => {
    expect(projectRegistryEntries(null)).toEqual([]);
    expect(projectRegistryEntries(undefined)).toEqual([]);
    expect(projectRegistryEntries({} as unknown)).toEqual([]);
    expect(projectRegistryEntries('nope' as unknown)).toEqual([]);
  });

  it('coerces an unrecognised entity_category to null rather than trusting it', () => {
    const [entry] = projectRegistryEntries([
      { entity_id: 'light.a', platform: 'demo', entity_category: 'something_new' },
    ]);

    expect(entry.entity_category).toBeNull();
  });
});

describe('buildRegistryIndex', () => {
  it('indexes the real payload by entity_id', () => {
    expect(REGISTRY.size).toBe(realEntityRegistryRows.length);
    expect(REGISTRY.get('sensor.sigen_plant_grid_active_power')?.platform).toBe('sigen');
  });

  it('returns an empty index for junk input', () => {
    expect(buildRegistryIndex(null).size).toBe(0);
    expect(buildRegistryIndex(undefined).size).toBe(0);
  });
});

describe('isNoiseEntity', () => {
  it('treats diagnostic and config as noise', () => {
    expect(isNoiseEntity(REGISTRY.get('sensor.sun_next_dawn'))).toBe(true);
    expect(isNoiseEntity(REGISTRY.get('update.home_assistant_supervisor_update'))).toBe(true);
  });

  it('treats a plain entity as signal', () => {
    expect(isNoiseEntity(REGISTRY.get('sensor.sigen_plant_grid_active_power'))).toBe(false);
    expect(isNoiseEntity(REGISTRY.get('sensor.ev_charging_status'))).toBe(false);
  });

  it('treats a user-hidden entity as noise even when it has no category', () => {
    const [entry] = projectRegistryEntries([
      { entity_id: 'sensor.a', platform: 'demo', hidden_by: 'user' },
    ]);
    expect(isNoiseEntity(entry)).toBe(true);
  });

  it('⭐ treats an entity WITHOUT a registry row as signal — never as noise', () => {
    // The permissive rule. "We have no row for this" means "we do not know",
    // and we never hide on the strength of not knowing.
    expect(isNoiseEntity(undefined)).toBe(false);
    expect(isNoiseEntity(null)).toBe(false);
  });
});

describe('filterEntitiesByRegistry', () => {
  const entities = [
    ent('sensor.sigen_plant_grid_active_power'), // plain
    ent('sensor.sun_next_dawn'), // diagnostic
    ent('update.home_assistant_supervisor_update'), // config
    ent('sensor.ev_charging_status'), // plain
    ent('sun.sun'), // ⭐ no registry row at all
  ];

  it('hides diagnostic and config by default', () => {
    const result = filterEntitiesByRegistry(entities, REGISTRY);

    expect(result.map((e) => e.entity_id)).toEqual([
      'sensor.sigen_plant_grid_active_power',
      'sensor.ev_charging_status',
      'sun.sun',
    ]);
  });

  it('⭐⭐⭐ keeps every live entity that has NO registry row', () => {
    // Measured on the reference instance: seven of 725 live entities have no
    // registry row. An inner join would delete all seven.
    const unregistered = liveEntityIdsWithNoRegistryRow.map(ent);
    const result = filterEntitiesByRegistry(unregistered, REGISTRY);

    expect(result.map((e) => e.entity_id)).toEqual(liveEntityIdsWithNoRegistryRow);
  });

  it('⭐⭐⭐ keeps an already-selected entity even when it IS diagnostic', () => {
    // Otherwise opening a card that legitimately uses a diagnostic entity shows
    // a picker that cannot display its own current value — PROPS-03's dead end
    // in a new costume.
    const result = filterEntitiesByRegistry(entities, REGISTRY, {
      keepEntityIds: ['sensor.sun_next_dawn'],
    });

    expect(result.map((e) => e.entity_id)).toContain('sensor.sun_next_dawn');
    // ...and the rest of the cut still applies.
    expect(result.map((e) => e.entity_id)).not.toContain('update.home_assistant_supervisor_update');
  });

  it('tolerates an empty / undefined keepEntityIds', () => {
    expect(filterEntitiesByRegistry(entities, REGISTRY, { keepEntityIds: [] })).toHaveLength(3);
    expect(filterEntitiesByRegistry(entities, REGISTRY, { keepEntityIds: undefined })).toHaveLength(
      3,
    );
  });

  it('CONTROL: showDiagnostic returns the identical array reference', () => {
    const result = filterEntitiesByRegistry(entities, REGISTRY, { showDiagnostic: true });
    expect(result).toBe(entities);
  });

  it('⭐ CONTROL: no registry at all returns the identical array reference — nothing hidden', () => {
    // The never-connected case. "We do not know" is not "it is diagnostic".
    expect(filterEntitiesByRegistry(entities, null)).toBe(entities);
    expect(filterEntitiesByRegistry(entities, undefined)).toBe(entities);
    expect(filterEntitiesByRegistry(entities, buildRegistryIndex([]))).toBe(entities);
  });

  it('CONTROL: does not mutate its input', () => {
    const input = [...entities];
    filterEntitiesByRegistry(input, REGISTRY);
    expect(input).toEqual(entities);
    expect(input).toHaveLength(5);
  });

  it('CONTROL: a non-array entity list returns an empty array rather than throwing', () => {
    expect(filterEntitiesByRegistry(null as unknown as HAEntity[], REGISTRY)).toEqual([]);
  });
});

describe('platformLabel', () => {
  it('humanises the technical slug the owner objected to seeing raw', () => {
    expect(platformLabel('kia_uvo')).toBe('Kia Uvo');
    expect(platformLabel('bureau_of_meteorology')).toBe('Bureau Of Meteorology');
    expect(platformLabel('sigen')).toBe('Sigen');
  });

  it('names the unregistered bucket in words rather than leaking its sentinel', () => {
    expect(platformLabel(UNREGISTERED_PLATFORM)).toBe('Not in the entity registry');
  });

  it('falls back safely on junk', () => {
    expect(platformLabel('')).toBe('Unknown');
    expect(platformLabel(undefined as unknown as string)).toBe('Unknown');
  });
});

describe('groupEntitiesByPlatform', () => {
  it('groups by integration, largest group first', () => {
    const entities = [
      ent('sensor.sigen_plant_grid_active_power'),
      ent('sensor.sun_next_dawn'),
      ent('sensor.ev_charging_status'),
    ];
    // Two sigen-ish rows: reuse the real sigen row for both by id.
    const groups = groupEntitiesByPlatform(entities, REGISTRY);

    expect(groups.map((g) => g.platform)).toEqual(['sigen', 'sun', 'template']);
    expect(groups.every((g) => g.entities.length === 1)).toBe(true);
    expect(groups[0].label).toBe('Sigen');
  });

  it('orders by count descending, then by label ascending for ties', () => {
    const rows = [
      { entity_id: 'a.1', platform: 'zeta' },
      { entity_id: 'a.2', platform: 'zeta' },
      { entity_id: 'b.1', platform: 'beta' },
      { entity_id: 'c.1', platform: 'alpha' },
    ];
    const index = buildRegistryIndex(rows);
    const groups = groupEntitiesByPlatform([ent('a.1'), ent('a.2'), ent('b.1'), ent('c.1')], index);

    expect(groups.map((g) => `${g.platform}:${g.entities.length}`)).toEqual([
      'zeta:2',
      'alpha:1',
      'beta:1',
    ]);
  });

  it('⭐ puts entities with no registry row in their own bucket, always LAST', () => {
    const groups = groupEntitiesByPlatform(
      [ent('sun.sun'), ent('zone.home'), ent('sensor.sigen_plant_grid_active_power')],
      REGISTRY,
    );

    expect(groups.at(-1)?.platform).toBe(UNREGISTERED_PLATFORM);
    expect(groups.at(-1)?.entities.map((e) => e.entity_id)).toEqual(['sun.sun', 'zone.home']);
  });

  it('CONTROL: preserves the incoming order within a group', () => {
    const rows = [
      { entity_id: 'a.z', platform: 'demo' },
      { entity_id: 'a.a', platform: 'demo' },
    ];
    const groups = groupEntitiesByPlatform([ent('a.z'), ent('a.a')], buildRegistryIndex(rows));

    expect(groups[0].entities.map((e) => e.entity_id)).toEqual(['a.z', 'a.a']);
  });

  it('CONTROL: returns an empty array for an empty entity list', () => {
    expect(groupEntitiesByPlatform([], REGISTRY)).toEqual([]);
    expect(groupEntitiesByPlatform(null as unknown as HAEntity[], REGISTRY)).toEqual([]);
  });
});
