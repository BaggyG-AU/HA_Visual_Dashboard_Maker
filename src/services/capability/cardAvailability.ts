/**
 * cardAvailability — the three-state resolver that drives the palette.
 *
 * Slice **I4** of the Phase 3 capability inventory (design:
 * `docs/refresh/HA_CAPABILITY_INVENTORY_DESIGN_2026-07.md` §5). Given a card type
 * and the persisted {@link CapabilityProfile}, decide whether the palette offers
 * it as Available, Not Available, or HAVDM-only. Pure — no IPC, no live query
 * (the profile IS the offline source of truth; standalone principle).
 *
 * Replaces the Phase-0.3 single-string check
 * (`CANVAS_ONLY_CARD_TYPES.includes(card.type)`) at `CardPalette.tsx`.
 */
import { CANVAS_ONLY_CARD_TYPES } from '../haExportContract';
import type { CapabilityProfile } from './capabilityProfile';

export type CardAvailability = 'available' | 'not-available' | 'havdm-only';

/**
 * Resolve a card type's availability against the profile, in priority order:
 *  1. HAVDM-only — the profile-INDEPENDENT known-nonexistent set
 *     (`CANVAS_ONLY_CARD_TYPES`). Never deployable, so a user override can't
 *     rescue it; this wins first.
 *  2. User override — a manual `force-available` / `force-unavailable`.
 *  3. Never connected (`profile.haVersion === null`) — PERMISSIVE: show every
 *     real card as Available (vision default; a fresh/offline user is not blocked).
 *  4. Built-in card — Available (HA-version quirks are slice I5, not presence).
 *  5. Custom card — Available iff its element is in the installed set.
 */
export function resolveCardState(
  cardType: string,
  meta: { isCustom: boolean },
  profile: CapabilityProfile,
): CardAvailability {
  if (CANVAS_ONLY_CARD_TYPES.includes(cardType)) return 'havdm-only';

  const override = profile.userOverrides[cardType];
  if (override === 'force-available') return 'available';
  if (override === 'force-unavailable') return 'not-available';

  if (profile.haVersion === null) return 'available'; // never connected → permissive

  if (!meta.isCustom) return 'available'; // built-in

  return profile.installedElements.includes(cardType) ? 'available' : 'not-available';
}
