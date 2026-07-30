import type { HAEntity } from '../types/homeassistant';

/**
 * Home Assistant's entity registry, reduced to what the pickers need.
 *
 * `get_states` tells you what an entity IS doing; the entity registry tells you
 * what it IS — which integration owns it, whether Home Assistant considers it
 * diagnostic plumbing rather than something a person would put on a dashboard,
 * and where it lives. That second question is the one the pickers could not
 * answer at all before this module: HAVDM made no registry call anywhere.
 *
 * ⚠⚠ THE DANGEROUS FAILURE HERE IS THE SAME ONE `entityCriteria.ts` WARNS ABOUT,
 * AND THE REFERENCE INSTANCE PROVES IT IS NOT HYPOTHETICAL. Measured 2026-07-30
 * against `ha.home.local` (Home Assistant 2026.7.4): the registry has 1397 rows
 * while `get_states` has 725 entities, and **seven live entities have no
 * registry row at all** — `sun.sun`, `zone.home`, `conversation.home_assistant`
 * and four template/Amber sensors. A join that dropped unmatched rows would
 * silently delete all seven from every picker, and a user cannot tell the
 * difference between "HAVDM hid it" and "it does not exist".
 *
 * So every function here fails OPEN. No registry row means "we do not know",
 * and we never hide on the strength of not knowing. That is THE VISION's
 * "never-connected default is PERMISSIVE" applied to metadata we may simply not
 * have — because the registry genuinely may not be available: the command is
 * WebSocket-only and admin-only, while the pickers' "live" path is REST.
 *
 * Kept in `src/utils/` with no service imports, following `containerCards.ts`,
 * `keyboardShortcuts.ts`, `yamlCardLocator.ts`, `entityCriteria.ts` and
 * `entityInsertion.ts`.
 */

/** Home Assistant's own categories for "this is plumbing, not a dashboard entity". */
const KNOWN_CATEGORIES = new Set(['diagnostic', 'config']);

/** One registry row, narrowed to the fields HAVDM persists and reads. */
export interface EntityRegistryEntry {
  entity_id: string;
  /** The integration that owns the entity — `sigen`, `unifiprotect`, `kia_uvo`. */
  platform: string;
  entity_category: 'diagnostic' | 'config' | null;
  /** Non-null when the user or an integration hid the entity in Home Assistant. */
  hidden_by: string | null;
  /**
   * ⓘ `area_id` and `device_id` are persisted but NOT read by anything yet.
   * They are the inputs to the Area -> Device -> Entity picker (slice 3), which
   * is deliberately NOT authorised; carrying them now means slice 3 needs no
   * cache migration. Storing them is not implementing them.
   */
  area_id: string | null;
  device_id: string | null;
}

export type EntityRegistryIndex = ReadonlyMap<string, EntityRegistryEntry>;

/** Group key for entities Home Assistant's registry has never heard of. */
export const UNREGISTERED_PLATFORM = '__unregistered__';

const asStringOrNull = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

/**
 * Narrow raw `config/entity_registry/list` rows to {@link EntityRegistryEntry}.
 *
 * The live payload carries ~22 keys per row (`options`, `unique_id`, `labels`,
 * `translation_key`, timestamps…) and weighs 982 KB on the reference instance.
 * The projection is 110 KB, which is what makes persisting it alongside the
 * 399 KB entity cache reasonable.
 */
export const projectRegistryEntries = (rows: unknown): EntityRegistryEntry[] => {
  if (!Array.isArray(rows)) return [];

  const projected: EntityRegistryEntry[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;

    const raw = row as Record<string, unknown>;
    const entityId = asStringOrNull(raw.entity_id);
    const platform = asStringOrNull(raw.platform);
    if (!entityId || !platform) continue;

    const category = asStringOrNull(raw.entity_category);
    projected.push({
      entity_id: entityId,
      platform,
      // ⚠ An unrecognised category is coerced to null, not passed through. A
      // future Home Assistant category we have never seen must not silently
      // start hiding entities.
      entity_category:
        category && KNOWN_CATEGORIES.has(category) ? (category as 'diagnostic' | 'config') : null,
      hidden_by: asStringOrNull(raw.hidden_by),
      area_id: asStringOrNull(raw.area_id),
      device_id: asStringOrNull(raw.device_id),
    });
  }
  return projected;
};

/** Index rows by `entity_id`. Junk in gives an empty index, never a throw. */
export const buildRegistryIndex = (rows: unknown): EntityRegistryIndex => {
  const index = new Map<string, EntityRegistryEntry>();
  for (const entry of projectRegistryEntries(rows)) {
    index.set(entry.entity_id, entry);
  }
  return index;
};

/**
 * Whether Home Assistant considers this entity plumbing rather than content.
 *
 * ⭐ A MISSING ENTRY IS NEVER NOISE. That single line is what keeps the seven
 * unregistered live entities in the picker.
 */
export const isNoiseEntity = (entry: EntityRegistryEntry | null | undefined): boolean => {
  if (!entry) return false;
  return entry.entity_category !== null || entry.hidden_by !== null;
};

export interface RegistryFilterOptions {
  /** Show diagnostic/config entities too. The user-facing toggle. */
  showDiagnostic?: boolean;
  /**
   * Entity ids that must survive the cut whatever the registry says.
   *
   * ⭐⭐⭐ This is for the value a card is ALREADY configured with. Hiding it
   * would leave the picker unable to display its own current selection — the
   * PROPS-03 read-only dead end in a new costume.
   */
  keepEntityIds?: Iterable<string> | undefined;
}

/**
 * Drop diagnostic/config/hidden entities.
 *
 * ⚠ Returns the SAME array reference when nothing can be cut — the contract
 * `filterEntitiesForCard` and the sections/container helpers already use, so
 * callers can skip downstream work. "Nothing can be cut" includes the case that
 * matters most: **no registry at all**, i.e. the never-connected user.
 */
export const filterEntitiesByRegistry = (
  entities: HAEntity[],
  index: EntityRegistryIndex | null | undefined,
  options: RegistryFilterOptions = {},
): HAEntity[] => {
  if (!Array.isArray(entities)) return [];
  if (options.showDiagnostic) return entities;
  if (!index || index.size === 0) return entities;

  const keep = new Set(options.keepEntityIds ?? []);
  return entities.filter(
    (entity) => keep.has(entity?.entity_id) || !isNoiseEntity(index.get(entity?.entity_id)),
  );
};

/**
 * Turn an integration slug into something a person would recognise.
 *
 * ⚠ The owner's objection to the original `<integration>: <entity>` row-prefix
 * proposal was partly that it "surfaces technical slugs like `kia_uvo`". As a
 * group header there is room to humanise: `kia_uvo` -> "Kia Uvo". The raw slug
 * stays available for the tooltip, because the slug is the honest identifier
 * and the humanised form is a convenience over it.
 */
export const platformLabel = (platform: string): string => {
  if (platform === UNREGISTERED_PLATFORM) return 'Not in the entity registry';
  if (typeof platform !== 'string' || platform.length === 0) return 'Unknown';

  return platform
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export interface PlatformGroup {
  /** The raw slug, or {@link UNREGISTERED_PLATFORM}. */
  platform: string;
  label: string;
  entities: HAEntity[];
}

/**
 * Group entities by owning integration, biggest group first.
 *
 * On the reference instance this turns one 311-row `sensor` tab into 24 groups
 * whose largest is 101 — which is the whole point, and the measured answer to
 * "there could be hundreds and finding what you want is hard".
 *
 * ⭐ Entities with no registry row go in their own clearly-named bucket, ALWAYS
 * LAST, so they are visibly present rather than quietly absent.
 */
export const groupEntitiesByPlatform = (
  entities: HAEntity[],
  index: EntityRegistryIndex | null | undefined,
): PlatformGroup[] => {
  if (!Array.isArray(entities) || entities.length === 0) return [];

  const buckets = new Map<string, HAEntity[]>();
  for (const entity of entities) {
    const platform = index?.get(entity?.entity_id)?.platform ?? UNREGISTERED_PLATFORM;
    const bucket = buckets.get(platform);
    if (bucket) bucket.push(entity);
    else buckets.set(platform, [entity]);
  }

  const unregistered = buckets.get(UNREGISTERED_PLATFORM);
  buckets.delete(UNREGISTERED_PLATFORM);

  const groups: PlatformGroup[] = [...buckets.entries()]
    .map(([platform, group]) => ({ platform, label: platformLabel(platform), entities: group }))
    .sort((a, b) => b.entities.length - a.entities.length || a.label.localeCompare(b.label));

  if (unregistered) {
    groups.push({
      platform: UNREGISTERED_PLATFORM,
      label: platformLabel(UNREGISTERED_PLATFORM),
      entities: unregistered,
    });
  }

  return groups;
};
