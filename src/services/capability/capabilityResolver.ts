/**
 * capabilityResolver — turn the raw WS reads (slices I0/I1) into a resolved
 * capability snapshot the profile and palette can use.
 *
 * Slice **I2** of the Phase 3 capability inventory (design:
 * `docs/refresh/HA_CAPABILITY_INVENTORY_DESIGN_2026-07.md` §3.1). Pure and
 * IPC-free so it can be unit-tested directly; the WS round-trips live in
 * `haWebSocketService` (I0/I1).
 *
 * Input:
 *  - `resources`  — `lovelace/resources` (I0): the frontend resource list.
 *  - `hacsRepos`  — installed HACS repositories (I1), optional: adds versions.
 * Output: {@link ResolvedCapability}.
 */
import { RESOURCE_ELEMENT_MAP, CARD_MOD_FOLDER } from './resourceElementMap';
import type { LovelaceResource } from '../haWebSocketService';
import type { InstalledHacsRepository } from './hacsRepositories';

export interface ResolvedCapability {
  /** The `custom:*` card element types available on the instance. */
  installedElements: Set<string>;
  /** Lower-cased `/hacsfiles/<folder>/` segments present in the resource list. */
  installedFolders: Set<string>;
  /** Folder → installed version, from HACS (empty when HACS data was not provided). */
  versions: Record<string, string>;
  /** Whether card-mod is installed (load-bearing for the export TRANSLATE path). */
  cardModPresent: boolean;
}

/**
 * Extract the `/hacsfiles/<folder>/` join key from a resource URL, lower-cased.
 * Returns `''` for a non-HACS resource (`/local/…`, absolute URLs) — those carry
 * no folder convention and contribute nothing.
 */
export function resourceFolderFromUrl(url: string | undefined): string {
  if (!url) return '';
  const marker = '/hacsfiles/';
  const idx = url.indexOf(marker);
  if (idx === -1) return '';
  const rest = url.slice(idx + marker.length);
  const segment = rest.split(/[/?#]/)[0] ?? '';
  return segment.toLowerCase();
}

/**
 * Resolve the installed resources (+ optional HACS versions) into the element
 * set, folder set, version map and card-mod flag.
 */
export function resolveCapability(
  resources: readonly LovelaceResource[] | null | undefined,
  hacsRepos?: readonly InstalledHacsRepository[] | null,
): ResolvedCapability {
  const installedElements = new Set<string>();
  const installedFolders = new Set<string>();

  if (Array.isArray(resources)) {
    for (const resource of resources) {
      const folder = resourceFolderFromUrl(resource?.url);
      if (!folder) continue;
      installedFolders.add(folder);
      const elements = RESOURCE_ELEMENT_MAP[folder];
      if (elements) {
        for (const element of elements) installedElements.add(element);
      }
    }
  }

  const versions: Record<string, string> = {};
  if (Array.isArray(hacsRepos)) {
    for (const repo of hacsRepos) {
      if (repo?.folder && repo.version) versions[repo.folder] = repo.version;
    }
  }

  return {
    installedElements,
    installedFolders,
    versions,
    cardModPresent: installedFolders.has(CARD_MOD_FOLDER),
  };
}
