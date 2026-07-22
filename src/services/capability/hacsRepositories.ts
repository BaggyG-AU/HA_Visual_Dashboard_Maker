/**
 * HACS repository selection — pure helpers for the Phase 3 capability inventory.
 *
 * Slice **I1** of the capability-inventory work (design:
 * `docs/refresh/HA_CAPABILITY_INVENTORY_DESIGN_2026-07.md` §3.2). The HACS
 * integration answers the WebSocket command `hacs/repositories/list` with the
 * ENTIRE HACS store (~3300 items on the reference instance). These pure
 * functions reduce that firehose to the handful of *installed* repositories the
 * capability profile actually needs, and normalise the two fields the profile
 * joins on: the `/hacsfiles/<folder>/` path segment and the installed version.
 *
 * Verified live 2026-07-22 (READ-ONLY probe, ha.home.local, HA 2026.7.2): the
 * command returns 18 installed repositories (11 `category: "plugin"` frontend
 * cards), each carrying `full_name`, `installed_version`, `available_version`,
 * `local_path` (`/config/www/community/<folder>`) and `category`. Version strings
 * are inconsistent — some `v5.1.1`, some bare `1.0.5` — so callers that compare
 * versions must normalise (see {@link normalizeHacsVersion}).
 *
 * These helpers are deliberately IPC-free and side-effect-free so they can be
 * unit-tested directly (`tests/unit/hacsRepositories.spec.ts`). The WebSocket
 * round-trip lives in `haWebSocketService.getHacsRepositories()`, which calls
 * {@link selectInstalledHacsRepositories} on the raw result.
 */

/**
 * The loose shape of one entry from `hacs/repositories/list`. HACS returns ~30
 * fields per repository; only the ones the inventory reads are typed, and all
 * are optional because a defensive reducer must tolerate a shifting upstream
 * schema.
 */
export interface HacsRepositoryRaw {
  full_name?: string;
  category?: string;
  installed?: boolean;
  installed_version?: string;
  available_version?: string;
  local_path?: string;
  [key: string]: unknown;
}

/**
 * A normalised, *installed* HACS repository — the subset the capability profile
 * persists. `folder` is the case-normalised join key to the `/hacsfiles/<folder>/`
 * segment returned by `lovelace/resources` (slice I2 resolves it to element
 * types); `version` is the installed version with any leading `v` stripped.
 */
export interface InstalledHacsRepository {
  /** e.g. `"piitaya/lovelace-mushroom"`. */
  fullName: string;
  /** Lower-cased basename of `local_path`, the join key to `/hacsfiles/<folder>/`. */
  folder: string;
  /** Installed version (falls back to available version), leading `v` stripped. */
  version: string;
  /** `"plugin"` | `"integration"` | `"theme"` | … */
  category: string;
}

/**
 * Extract the `/hacsfiles/<folder>/` join key from a HACS `local_path`.
 *
 * HACS installs a plugin under `/config/www/community/<folder>`, and Home
 * Assistant then serves it at `/hacsfiles/<folder>/…`. The folder segment is the
 * stable identity that both `lovelace/resources` and `hacs/repositories/list`
 * agree on — but its casing varies (`Bubble-Card`), so this normalises to
 * lower-case for case-insensitive matching.
 */
export function hacsFolderFromLocalPath(localPath: string | undefined): string {
  if (!localPath) return '';
  const segments = localPath.split('/').filter(Boolean);
  const last = segments[segments.length - 1] ?? '';
  return last.toLowerCase();
}

/**
 * Strip a single leading `v`/`V` from a HACS version string (`"v5.1.1"` →
 * `"5.1.1"`, `"1.0.5"` → `"1.0.5"`). Trims surrounding whitespace; returns `''`
 * for a missing version.
 */
export function normalizeHacsVersion(version: string | undefined): string {
  if (!version) return '';
  return version.trim().replace(/^v/i, '');
}

/**
 * Reduce the full `hacs/repositories/list` payload to the installed repositories
 * the capability profile needs.
 *
 * Keeps only entries with `installed === true` and a non-empty `full_name`
 * (a repository with no name cannot be joined to anything). Every kept entry is
 * normalised to {@link InstalledHacsRepository}. Category is preserved verbatim
 * so callers can filter to `"plugin"` (frontend cards) themselves — the profile
 * may want integrations/themes too.
 */
export function selectInstalledHacsRepositories(
  raw: readonly HacsRepositoryRaw[] | null | undefined,
): InstalledHacsRepository[] {
  if (!Array.isArray(raw)) return [];
  const installed: InstalledHacsRepository[] = [];
  for (const repo of raw) {
    if (!repo || repo.installed !== true) continue;
    const fullName = typeof repo.full_name === 'string' ? repo.full_name.trim() : '';
    if (!fullName) continue;
    installed.push({
      fullName,
      folder: hacsFolderFromLocalPath(repo.local_path),
      version: normalizeHacsVersion(repo.installed_version || repo.available_version),
      category: typeof repo.category === 'string' ? repo.category : '',
    });
  }
  return installed;
}
