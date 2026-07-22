import { afterEach, describe, expect, it, vi } from 'vitest';
import type { HAEntity } from '../../src/types/homeassistant';

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

    expect(result).toEqual({ entities: [], source: 'none' });
  });

  it('disconnected and the cache read fails → reports source "none" (no throw)', async () => {
    mockConn.isConnected.mockReturnValue(false);
    (
      window as unknown as { electronAPI: { getCachedEntities: () => Promise<unknown> } }
    ).electronAPI = { getCachedEntities: vi.fn().mockRejectedValue(new Error('ipc down')) };

    await expect(loadPickerEntities()).resolves.toEqual({ entities: [], source: 'none' });
  });
});
