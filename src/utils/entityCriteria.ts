import type { HAEntity } from '../types/homeassistant';

/**
 * Card-aware entity filtering.
 *
 * The entity pickers used to offer every entity on the instance to every card,
 * so choosing a gauge's source meant scanning ~725 candidates of which only a
 * few dozen were numeric. "Which entities can this card actually use?" is the
 * cheapest and most discriminating cut available, and — unlike grouping by
 * integration or area — it needs no new Home Assistant data: `device_class`,
 * `unit_of_measurement` and `state_class` already arrive with `get_states`.
 *
 * ⚠ THE DANGEROUS FAILURE MODE HERE IS AN OVER-BROAD TABLE, NOT AN UNDER-BROAD
 * ONE. A picker that silently omits the entity you wanted is indistinguishable,
 * from the user's chair, from that entity not existing. So the table below is
 * deliberately CURATED AND SMALL: it covers only card types whose constraint is
 * unambiguous, and every other card type — including every unrecognised or
 * custom one — is left completely unconstrained. That is THE VISION's
 * "never-connected default is PERMISSIVE" applied to filtering: when we do not
 * know, show everything.
 */

export interface EntityCriteria {
  /** Acceptable entity domains. Absent = any domain. */
  domains?: string[];
  /** The card can only render a numeric measurement. */
  requireNumeric?: boolean;
}

/** States that carry no value, so the state string alone cannot prove numeric-ness. */
const VALUELESS_STATES = new Set(['', 'unknown', 'unavailable', 'none']);

/**
 * Whether a card that plots or gauges a number can use this entity.
 *
 * ⚠ An entity whose device is momentarily asleep reports `unavailable` while
 * still being a perfectly good gauge target, so we fall back to the attributes
 * that mark a measurement. Filtering those out would make the picker's contents
 * depend on whether a device happened to be awake when it was opened.
 */
export const isNumericEntity = (entity: HAEntity | null | undefined): boolean => {
  const state = String(entity?.state ?? '').trim();

  if (!VALUELESS_STATES.has(state.toLowerCase())) {
    // ⚠ Number('') is 0, which is finite — hence the valueless-state guard above.
    return Number.isFinite(Number(state));
  }

  if (state === '') return false;

  const attributes = entity?.attributes ?? {};
  return Boolean(attributes.unit_of_measurement) || typeof attributes.state_class === 'string';
};

const domainOf = (entityId: string): string => String(entityId ?? '').split('.')[0] ?? '';

/**
 * Card type -> the entities it can render.
 *
 * Only unambiguous constraints belong here. Cards that legitimately accept any
 * entity — `button`, `entities`, `glance`, `markdown`, `picture-entity`, every
 * mushroom template/entity card — are deliberately ABSENT rather than listed
 * with an empty constraint, so `getCardEntityCriteria` returns null for them and
 * callers can skip filtering entirely.
 */
const CARD_ENTITY_CRITERIA: Readonly<Record<string, EntityCriteria>> = {
  // Numeric measurements
  gauge: { requireNumeric: true },
  sensor: { requireNumeric: true },
  'history-graph': { requireNumeric: true },
  'custom:apexcharts-card': { requireNumeric: true },
  'custom:mini-graph-card': { requireNumeric: true },
  'custom:havdm-progress-ring': { requireNumeric: true },
  'custom:gauge-card-pro': { requireNumeric: true },
  'custom:battery-state-card': { requireNumeric: true },
  'custom:mushroom-number-card': { requireNumeric: true },

  // Single-domain cards
  light: { domains: ['light'] },
  'custom:mushroom-light-card': { domains: ['light'] },
  thermostat: { domains: ['climate'] },
  'custom:mushroom-climate-card': { domains: ['climate'] },
  'custom:better-thermostat-ui-card': { domains: ['climate'] },
  'alarm-panel': { domains: ['alarm_control_panel'] },
  'custom:mushroom-alarm-control-panel-card': { domains: ['alarm_control_panel'] },
  'media-control': { domains: ['media_player'] },
  'custom:mini-media-player': { domains: ['media_player'] },
  'custom:mushroom-media-player-card': { domains: ['media_player'] },
  'custom:mushroom-fan-card': { domains: ['fan'] },
  'custom:mushroom-lock-card': { domains: ['lock'] },
  'custom:mushroom-cover-card': { domains: ['cover'] },
  'custom:mushroom-vacuum-card': { domains: ['vacuum'] },
  'custom:mushroom-switch-card': { domains: ['switch', 'input_boolean'] },
  'custom:mushroom-person-card': { domains: ['person', 'device_tracker'] },
  'weather-forecast': { domains: ['weather'] },
  calendar: { domains: ['calendar'] },
  'plant-status': { domains: ['plant'] },
  map: { domains: ['person', 'device_tracker', 'zone'] },
  'custom:webrtc-camera': { domains: ['camera'] },
  'custom:camera-card': { domains: ['camera'] },
  'custom:frigate-card': { domains: ['camera'] },
  'custom:surveillance-card': { domains: ['camera'] },
};

/** The constraint for a card type, or `null` when it accepts anything. */
export const getCardEntityCriteria = (cardType: string): EntityCriteria | null =>
  CARD_ENTITY_CRITERIA[cardType] ?? null;

export const entityMatchesCriteria = (
  entity: HAEntity,
  criteria: EntityCriteria | null | undefined,
): boolean => {
  if (!criteria) return true;
  if (criteria.domains && !criteria.domains.includes(domainOf(entity?.entity_id))) return false;
  if (criteria.requireNumeric && !isNumericEntity(entity)) return false;
  return true;
};

/**
 * Narrow an entity list to what `cardType` can render.
 *
 * ⚠ Returns the SAME array reference when the card is unconstrained, so callers
 * can skip downstream work — the same contract the sections and container
 * helpers use.
 */
export const filterEntitiesForCard = (entities: HAEntity[], cardType: string): HAEntity[] => {
  if (!Array.isArray(entities)) return [];
  const criteria = getCardEntityCriteria(cardType);
  if (!criteria) return entities;
  return entities.filter((entity) => entityMatchesCriteria(entity, criteria));
};

/**
 * Whether an entity matches a user's search text.
 *
 * ⚠ Replaces a single `includes()` over one concatenated string, which required
 * the user to type their remembered words in the stored order — "battery kia"
 * found nothing for "Kia EV6 Battery Level". Every whitespace-separated token
 * must match somewhere, in any order.
 *
 * ⭐⭐⭐ UAT HA-02: `platform` is the OWNING INTEGRATION and it is in the haystack
 * because leaving it out was the whole defect. Measured on a reproduction of the
 * reference instance's `kia_uvo` integration: 41 entities, and searching "kia"
 * returned ONE — because Home Assistant names those entities after the CAR
 * ("EV6 Battery Level"), so the string "kia" is absent from the entity_id and
 * the friendly_name of the other forty. Ticking "Show diagnostic & config" did
 * not change the count, which is what ruled out the obvious suspect.
 *
 * ⚠⚠ THE DEFECT WAS AN ASYMMETRY, NOT A MISSING FEATURE: the Entity Browser
 * offers "Group by: Integration" as a first-class axis, and the search box
 * beside it was blind to that exact axis. A control that groups by something it
 * cannot search by teaches the user the search is broken.
 *
 * Both forms are matched — the raw slug (`kia_uvo`) and the humanised label
 * (`Kia Uvo`) — so "kia", "kia uvo" and "kia_uvo" all find the same 41 rows.
 *
 * ⚠ `platform` is OPTIONAL and defaults to undefined, so every existing 2-argument
 * call behaves exactly as before. That is deliberate: it keeps the pre-existing
 * assertions in `tests/unit/entityCriteria.spec.ts` as an untouched control leg.
 *
 * ⚠ NOTE FOR THE NEXT READER: `state` is deliberately NOT in the haystack. The
 * search placeholder used to claim it was, which was simply untrue (measured:
 * entities with `state: '42'` were not found by "42"). Availability is filtered
 * on the State COLUMN instead — a curated Available/Unavailable/Unknown facet —
 * because raw states are hundreds of distinct sensor readings and short ones
 * like "on" appear inside `motion`, `front`, `contact` and `button`.
 */
export const matchesEntityQuery = (
  entity: HAEntity,
  query: string,
  platform?: string | null,
): boolean => {
  const tokens = String(query ?? '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return true;

  const attributes = entity?.attributes ?? {};
  const haystack = [
    entity?.entity_id,
    attributes.friendly_name,
    attributes.device_class,
    attributes.unit_of_measurement,
    platform,
    // `kia_uvo` -> `Kia Uvo`, so a user who reads the group header can type what
    // they read. Inlined rather than imported from `entityRegistry.ts` to keep
    // this module dependency-free, matching the other helpers in `src/utils/`.
    typeof platform === 'string' ? platform.replace(/_/g, ' ') : null,
  ]
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
    .join(' ')
    .toLowerCase();

  return tokens.every((token) => haystack.includes(token));
};
