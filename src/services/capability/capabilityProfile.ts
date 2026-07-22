/**
 * CapabilityProfile — the persisted, offline-editable capability record.
 *
 * Slice **I3** of the Phase 3 capability inventory (design:
 * `docs/refresh/HA_CAPABILITY_INVENTORY_DESIGN_2026-07.md` §4). The hard
 * constraint from the standalone principle
 * (MemPalace `drawer_havdm_decisions_0a5220b0b581800521a959f6`): capability must
 * come from a PERSISTED profile, never a live query at palette-render time. This
 * module is the pure shape + transforms; the electron-store wrapper lives in
 * `capabilityProfileService.ts` (main process).
 *
 * `haVersion === null` is the "never connected" signal — slice I4's three-state
 * resolver reads it to stay PERMISSIVE (show every real card as Available) until
 * the instance has actually been inventoried (vision default, VISION answer 5).
 *
 * Sets are not JSON-serialisable, so the resolved element/folder sets are stored
 * as sorted string arrays.
 */
import type { ResolvedCapability } from './capabilityResolver';

/** A user's manual override for a single card type. */
export type CardOverride = 'force-available' | 'force-unavailable';

export interface CapabilityProfile {
  /** HA version from the last capture; `null` = never connected (permissive signal). */
  haVersion: string | null;
  /** ISO timestamp of the last capture; `null` = never captured. */
  capturedAt: string | null;
  /** Resolved `custom:*` element types available on the instance (sorted). */
  installedElements: string[];
  /** Lower-cased `/hacsfiles/<folder>/` segments present (sorted). */
  installedFolders: string[];
  /** Folder → installed version. */
  versions: Record<string, string>;
  /** Whether card-mod is installed (load-bearing for the export TRANSLATE path). */
  cardModPresent: boolean;
  /** Manual per-card overrides, keyed by card type (e.g. `custom:foo-card`). */
  userOverrides: Record<string, CardOverride>;
}

/**
 * The permissive never-connected default: nothing inventoried yet, so I4 shows
 * every real card as Available and only forces the known-nonexistent types to
 * HAVDM-only. Blocking a fresh/offline user would violate standalone-first.
 */
export function defaultCapabilityProfile(): CapabilityProfile {
  return {
    haVersion: null,
    capturedAt: null,
    installedElements: [],
    installedFolders: [],
    versions: {},
    cardModPresent: false,
    userOverrides: {},
  };
}

/**
 * Build a persistable profile from a resolved capability snapshot. User overrides
 * are carried across re-captures (they are a user decision, not instance state),
 * so pass the existing profile's overrides in.
 */
export function buildCapabilityProfile(
  resolved: ResolvedCapability,
  meta: { haVersion: string | null; capturedAt: string },
  existingOverrides: Record<string, CardOverride> = {},
): CapabilityProfile {
  return {
    haVersion: meta.haVersion,
    capturedAt: meta.capturedAt,
    installedElements: [...resolved.installedElements].sort(),
    installedFolders: [...resolved.installedFolders].sort(),
    versions: { ...resolved.versions },
    cardModPresent: resolved.cardModPresent,
    userOverrides: { ...existingOverrides },
  };
}

/**
 * Return a copy of the profile with one card's override set, or removed when
 * `override` is `null`. Pure — never mutates the input.
 */
export function withOverride(
  profile: CapabilityProfile,
  cardType: string,
  override: CardOverride | null,
): CapabilityProfile {
  const userOverrides = { ...profile.userOverrides };
  if (override === null) {
    delete userOverrides[cardType];
  } else {
    userOverrides[cardType] = override;
  }
  return { ...profile, userOverrides };
}
