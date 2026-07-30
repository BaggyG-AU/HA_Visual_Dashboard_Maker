/**
 * Entity source for the inline card-config pickers.
 *
 * The inline pickers (`EntitySelect`, `EntityMultiSelect`) historically fetched
 * entities LIVE (`haConnectionService.fetchEntities()` → REST `/api/states`) and
 * gated on `isConnected()`, so when disconnected they showed a "Not Connected"
 * wall with an empty dropdown — even though HAVDM persists the full entity list
 * to disk on connect (`ha:ws:fetchEntities` → `settingsService.setCachedEntities`,
 * "for offline use").
 *
 * This bridges the two: prefer the live connection, fall back to the persisted
 * offline cache when disconnected — so cards can be configured without a live HA
 * connection, honouring the standalone principle
 * (MemPalace `drawer_havdm_decisions_0a5220b0b581800521a959f6`).
 *
 * Kept as a tiny standalone module so it is unit-testable directly, and so both
 * pickers resolve their source identically.
 */
import { haConnectionService } from './haConnectionService';
import { logger } from './logger';
import type { HAEntity } from '../types/homeassistant';
import { buildRegistryIndex, type EntityRegistryIndex } from '../utils/entityRegistry';

/** Where the picker's entity list came from. */
export type EntitySourceKind = 'live' | 'cached' | 'none';

export interface EntityPickerData {
  entities: HAEntity[];
  /** `'live'` = fresh from HA; `'cached'` = persisted offline cache; `'none'` = nothing available. */
  source: EntitySourceKind;
  /**
   * Home Assistant's entity registry, indexed by entity id — the source of
   * `platform` (integration grouping) and `entity_category` (the
   * diagnostic/config cut). **`null` when unavailable, which is a fully
   * supported state in which nothing is hidden and nothing is grouped.**
   *
   * ⚠ It rides on THIS function precisely so all four pickers get it at once.
   * Slice 1's finding was four pickers reading one dataset through three
   * sources, and that a fix applied to only some consumers is not a fix but a
   * new inconsistency. Adding registry data anywhere else would recreate it.
   */
  registry: EntityRegistryIndex | null;
}

/**
 * Load entities for an inline picker.
 *
 * - Connected → fresh from HA. A live-fetch failure is re-thrown so the caller
 *   can surface its existing error state (behaviour preserved).
 * - Disconnected → the entities cached on the last connect (persisted via
 *   electron-store). Returns `source: 'none'` when the cache is empty/unavailable
 *   so the caller can still show a "connect to populate" hint.
 */
export async function loadPickerEntities(): Promise<EntityPickerData> {
  const connected = haConnectionService.isConnected();

  // ⭐ CONCURRENTLY, not in sequence. `tests/integration/entity-caching.spec.ts`
  // asserts a wall-clock budget on the cached read, and serialising a second
  // IPC round-trip behind the first would double its latency for no reason.
  // `loadRegistry` never rejects, so this rejects only if the live entity fetch
  // does — preserving the caller's existing error state exactly.
  const [entityData, registry] = await Promise.all([
    loadEntityList(connected),
    loadRegistry(connected),
  ]);

  return { ...entityData, registry };
}

async function loadEntityList(connected: boolean): Promise<Omit<EntityPickerData, 'registry'>> {
  if (connected) {
    const entities = await haConnectionService.fetchEntities();
    return { entities, source: 'live' };
  }

  // Offline: read the entities cached on the last successful connect.
  try {
    const result = await window.electronAPI.getCachedEntities();
    if (result.success && Array.isArray(result.entities) && result.entities.length > 0) {
      return { entities: result.entities as HAEntity[], source: 'cached' };
    }
  } catch (err) {
    logger.error('Failed to load cached entities', err);
  }

  return { entities: [], source: 'none' };
}

/**
 * Resolve the entity registry: live first, then the persisted copy, then null.
 *
 * ⚠⚠ THIS FUNCTION MUST NEVER THROW AND MUST NEVER MAKE THE PICKER WORSE THAN
 * IT WAS BEFORE THE REGISTRY EXISTED. Three real ways it can come back empty,
 * all of which are ordinary rather than exceptional:
 *
 *  1. **Never connected.** No live call, no cache — the permissive default.
 *  2. **A non-admin token.** `config/entity_registry/list` is admin-only.
 *  3. ⭐ **A live REST connection with a dead WebSocket.** HAVDM has two
 *     connection objects, and `src/App.tsx` sets `haConnectionService`'s config
 *     BEFORE calling `haWsConnect`, so `isConnected()` can be true while the
 *     WebSocket leg — the only transport for this command — is down.
 *
 * In every one of them the answer is `null`, meaning "we do not know", and the
 * pickers hide nothing on the strength of not knowing.
 */
async function loadRegistry(connected: boolean): Promise<EntityRegistryIndex | null> {
  if (connected) {
    try {
      const live = await window.electronAPI.haWsFetchEntityRegistry();
      if (live?.success && Array.isArray(live.entries) && live.entries.length > 0) {
        return buildRegistryIndex(live.entries);
      }
    } catch (err) {
      logger.warn('Live entity registry unavailable; falling back to the cached copy', err);
    }
  }

  try {
    const cached = await window.electronAPI.getCachedEntityRegistry();
    if (cached?.success && Array.isArray(cached.entries) && cached.entries.length > 0) {
      return buildRegistryIndex(cached.entries);
    }
  } catch (err) {
    logger.warn('Cached entity registry unavailable; pickers will show every entity', err);
  }

  return null;
}
