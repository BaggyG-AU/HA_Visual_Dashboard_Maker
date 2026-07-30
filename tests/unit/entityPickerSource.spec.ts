import { afterEach, describe, expect, it, vi } from 'vitest';
import type { HAEntity } from '../../src/types/homeassistant';
import { realEntityRegistryRows } from '../fixtures/haEntityRegistry';

// Mock the singleton connection service so we can drive connected/disconnected.
vi.mock('../../src/services/haConnectionService', () => ({
  haConnectionService: {
    isConnected: vi.fn(),
    fetchEntities: vi.fn(),
  },
}));

import { haConnectionService } from '../../src/services/haConnectionService';
import { loadPickerEntities } from '../../src/services/entityPickerSource';

const mockConn = haConnectionService as unknown as {
  isConnected: ReturnType<typeof vi.fn>;
  fetchEntities: ReturnType<typeof vi.fn>;
};

const ent = (id: string): HAEntity => ({
  entity_id: id,
  state: 'on',
  attributes: { friendly_name: id },
  last_changed: '',
  last_updated: '',
  context: { id: 'c', parent_id: null, user_id: null },
});

function stubCachedEntities(result: unknown) {
  (
    window as unknown as { electronAPI: { getCachedEntities: () => Promise<unknown> } }
  ).electronAPI = {
    getCachedEntities: vi.fn().mockResolvedValue(result),
  };
}

/**
 * Stub the whole electronAPI surface the picker touches, so registry behaviour
 * can be driven independently of the entity list.
 *
 * ⚠ Note the tests above deliberately stub ONLY `getCachedEntities`. That is a
 * control in itself: the registry read must tolerate an electronAPI that does
 * not implement it at all, which is exactly what an older cache or a partially
 * mocked test surface looks like.
 */
function stubApi(parts: Record<string, unknown>) {
  (window as unknown as { electronAPI: Record<string, unknown> }).electronAPI = parts;
}

const registryOk = (rows: unknown = realEntityRegistryRows) => ({ success: true, entries: rows });

afterEach(() => {
  vi.clearAllMocks();
  delete (window as unknown as { electronAPI?: unknown }).electronAPI;
});

describe('loadPickerEntities', () => {
  it('connected → fetches live and reports source "live"', async () => {
    mockConn.isConnected.mockReturnValue(true);
    mockConn.fetchEntities.mockResolvedValue([ent('light.a'), ent('light.b')]);
    stubCachedEntities({ success: true, entities: [ent('sensor.stale')] });

    const result = await loadPickerEntities();

    expect(result.source).toBe('live');
    expect(result.entities.map((e) => e.entity_id)).toEqual(['light.a', 'light.b']);
    expect(mockConn.fetchEntities).toHaveBeenCalledOnce();
  });

  it('disconnected with a populated cache → reports source "cached" and returns the cache', async () => {
    mockConn.isConnected.mockReturnValue(false);
    stubCachedEntities({ success: true, entities: [ent('climate.ac'), ent('sensor.temp')] });

    const result = await loadPickerEntities();

    expect(result.source).toBe('cached');
    expect(result.entities.map((e) => e.entity_id)).toEqual(['climate.ac', 'sensor.temp']);
    expect(mockConn.fetchEntities).not.toHaveBeenCalled();
  });

  it('disconnected with an empty cache → reports source "none"', async () => {
    mockConn.isConnected.mockReturnValue(false);
    stubCachedEntities({ success: true, entities: [] });

    const result = await loadPickerEntities();

    expect(result).toEqual({ entities: [], source: 'none', registry: null });
  });

  it('disconnected and the cache read fails → reports source "none" (no throw)', async () => {
    mockConn.isConnected.mockReturnValue(false);
    (
      window as unknown as { electronAPI: { getCachedEntities: () => Promise<unknown> } }
    ).electronAPI = { getCachedEntities: vi.fn().mockRejectedValue(new Error('ipc down')) };

    await expect(loadPickerEntities()).resolves.toEqual({
      entities: [],
      source: 'none',
      registry: null,
    });
  });
});

describe('loadPickerEntities — the entity registry (slice 2)', () => {
  it('connected → fetches the registry live and indexes it', async () => {
    mockConn.isConnected.mockReturnValue(true);
    mockConn.fetchEntities.mockResolvedValue([ent('sensor.sigen_plant_grid_active_power')]);
    stubApi({
      haWsFetchEntityRegistry: vi.fn().mockResolvedValue(registryOk()),
      getCachedEntityRegistry: vi.fn().mockResolvedValue({ success: true, entries: [] }),
    });

    const result = await loadPickerEntities();

    expect(result.source).toBe('live');
    expect(result.registry?.get('sensor.sigen_plant_grid_active_power')?.platform).toBe('sigen');
  });

  it('disconnected → reads the persisted registry so the cut survives a restart', async () => {
    mockConn.isConnected.mockReturnValue(false);
    stubApi({
      getCachedEntities: vi.fn().mockResolvedValue({ success: true, entities: [ent('sun.sun')] }),
      getCachedEntityRegistry: vi.fn().mockResolvedValue(registryOk()),
    });

    const result = await loadPickerEntities();

    expect(result.source).toBe('cached');
    expect(result.registry?.size).toBe(realEntityRegistryRows.length);
  });

  it('⭐ connected but the registry call FAILS → falls back to the persisted registry', async () => {
    // The two connection objects can disagree: App.tsx sets the REST config
    // before haWsConnect(), so the picker can be "connected" while the
    // WebSocket leg is down. The cached registry is still better than none.
    mockConn.isConnected.mockReturnValue(true);
    mockConn.fetchEntities.mockResolvedValue([ent('light.a')]);
    stubApi({
      haWsFetchEntityRegistry: vi.fn().mockRejectedValue(new Error('WebSocket is not connected')),
      getCachedEntityRegistry: vi.fn().mockResolvedValue(registryOk()),
    });

    const result = await loadPickerEntities();

    expect(result.source).toBe('live');
    expect(result.registry?.size).toBe(realEntityRegistryRows.length);
  });

  it('⭐⭐⭐ CONTROL: a registry failure NEVER fails the entity load', async () => {
    // The registry is additive metadata. If it cannot be had, the picker must
    // behave exactly as it did before slice 2 — never throw, never empty.
    mockConn.isConnected.mockReturnValue(true);
    mockConn.fetchEntities.mockResolvedValue([ent('light.a'), ent('light.b')]);
    stubApi({
      haWsFetchEntityRegistry: vi.fn().mockRejectedValue(new Error('unauthorized')),
      getCachedEntityRegistry: vi.fn().mockRejectedValue(new Error('store unreadable')),
    });

    const result = await loadPickerEntities();

    expect(result.entities.map((e) => e.entity_id)).toEqual(['light.a', 'light.b']);
    expect(result.source).toBe('live');
    expect(result.registry).toBeNull();
  });

  it('⭐ CONTROL: never-connected and never-cached → registry is null, so nothing is hidden', async () => {
    mockConn.isConnected.mockReturnValue(false);
    stubApi({
      getCachedEntities: vi.fn().mockResolvedValue({ success: true, entities: [] }),
      getCachedEntityRegistry: vi.fn().mockResolvedValue({ success: true, entries: [] }),
    });

    const result = await loadPickerEntities();

    expect(result).toEqual({ entities: [], source: 'none', registry: null });
  });

  it('CONTROL: an electronAPI with no registry members at all degrades to null', async () => {
    mockConn.isConnected.mockReturnValue(false);
    stubCachedEntities({ success: true, entities: [ent('light.a')] });

    const result = await loadPickerEntities();

    expect(result.source).toBe('cached');
    expect(result.registry).toBeNull();
  });

  it('⭐⭐ reads entities and registry CONCURRENTLY, not one after the other', async () => {
    // `tests/integration/entity-caching.spec.ts:387` is a watched wall-clock
    // threshold on this exact path. Serialising two IPC round-trips would
    // double the latency of the cached read for no reason.
    mockConn.isConnected.mockReturnValue(false);
    const order: string[] = [];
    stubApi({
      getCachedEntities: vi.fn().mockImplementation(async () => {
        order.push('entities:start');
        await Promise.resolve();
        order.push('entities:end');
        return { success: true, entities: [ent('light.a')] };
      }),
      getCachedEntityRegistry: vi.fn().mockImplementation(async () => {
        order.push('registry:start');
        await Promise.resolve();
        order.push('registry:end');
        return registryOk();
      }),
    });

    await loadPickerEntities();

    // Both start before either finishes — that is what concurrent means.
    expect(order.indexOf('registry:start')).toBeLessThan(order.indexOf('entities:end'));
  });
});
