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

/** Where the picker's entity list came from. */
export type EntitySourceKind = 'live' | 'cached' | 'none';

export interface EntityPickerData {
  entities: HAEntity[];
  /** `'live'` = fresh from HA; `'cached'` = persisted offline cache; `'none'` = nothing available. */
  source: EntitySourceKind;
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
  if (haConnectionService.isConnected()) {
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
