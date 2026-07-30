/**
 * Real `config/entity_registry/list` rows, captured READ-ONLY from the reference
 * instance `ha.home.local` (Home Assistant 2026.7.4) on 2026-07-30.
 *
 * ⚠ These are VERBATIM rows, extra keys and all. The point of testing against
 * real payloads rather than hand-written ones is that a hand-written fixture
 * encodes what we BELIEVE Home Assistant sends; this encodes what it ACTUALLY
 * sends. The projection under test must ignore `categories`, `options`,
 * `translation_key`, `unique_id` and friends without being told about them.
 *
 * Instance shape at capture time, for context:
 *   1397 registry rows vs 725 live states (679 rows are `disabled_by` and have
 *   no state at all, so joining FROM `get_states` never sees them);
 *   `entity_category` split 674 diagnostic / 70 config / 653 null;
 *   `hidden_by` null on every one of the 1397 rows.
 */

/** One raw row exactly as Home Assistant sends it. */
export interface RawEntityRegistryRow {
  entity_id: string;
  platform: string;
  entity_category?: string | null;
  hidden_by?: string | null;
  area_id?: string | null;
  device_id?: string | null;
  disabled_by?: string | null;
  [key: string]: unknown;
}

export const realEntityRegistryRows: RawEntityRegistryRow[] = [
  {
    area_id: null,
    categories: {},
    config_entry_id: '01K9S464XJZWPSN9953Q55RVXQ',
    config_subentry_id: null,
    created_at: 1762853589.941237,
    device_id: '9f2396a92ba4a655f20b9024ffc6b52c',
    disabled_by: null,
    entity_category: 'diagnostic',
    entity_id: 'sensor.sun_next_dawn',
    has_entity_name: true,
    hidden_by: null,
    icon: null,
    id: '80d0d4c4f5891f1a2c25089b29e885f2',
    labels: [],
    modified_at: 1771067237.494987,
    name: null,
    options: { conversation: { should_expose: false } },
    original_name: 'Next dawn',
    platform: 'sun',
    translation_key: 'next_dawn',
    unique_id: '01K9S464XJZWPSN9953Q55RVXQ-next_dawn',
  },
  {
    area_id: null,
    categories: {},
    config_entry_id: '01K9S465EDZH8Y89SQ1J0QH76G',
    config_subentry_id: null,
    created_at: 1762853590.523968,
    device_id: '8364b19417d62b423735553958c505a1',
    disabled_by: null,
    entity_category: 'config',
    entity_id: 'update.home_assistant_supervisor_update',
    has_entity_name: true,
    hidden_by: null,
    icon: null,
    id: '7d0a4740062e4682d0ab79f26d1a965e',
    labels: [],
    modified_at: 1784457152.736729,
    name: null,
    options: { conversation: { should_expose: false } },
    original_name: 'Update',
    platform: 'hassio',
    translation_key: 'update',
    unique_id: 'home_assistant_supervisor_version_latest',
  },
  {
    area_id: null,
    categories: {},
    config_entry_id: '01KA06788GJZ5CQK94VJH30GA7',
    config_subentry_id: null,
    created_at: 1763090604.803263,
    device_id: '9843cdfd00436c058052a64fb8b0b945',
    // ⚠ 626 of the instance's rows look like this: disabled by the integration,
    // so they never appear in `get_states` and the join never reaches them.
    disabled_by: 'integration',
    entity_category: 'diagnostic',
    entity_id: 'binary_sensor.garage_360_ssh_enabled',
    has_entity_name: true,
    hidden_by: null,
    icon: null,
    id: 'ed7ecb4eb9633f6d77607f5162db062a',
    labels: [],
    modified_at: 1767814979.100333,
    name: null,
    options: { 'cloud.alexa': { should_expose: false } },
    original_name: 'SSH enabled',
    platform: 'unifiprotect',
    translation_key: 'ssh_enabled',
    unique_id: 'F4E2C671752B_ssh',
  },
  {
    area_id: null,
    categories: {},
    config_entry_id: '01K9ZZHPHWAQ0XF4PVJWC6AGRE',
    config_subentry_id: null,
    created_at: 1763083616.124833,
    device_id: '5239932c8ab3cab372be9641acd704f5',
    disabled_by: null,
    entity_category: null,
    entity_id: 'sensor.sigen_plant_grid_active_power',
    has_entity_name: true,
    hidden_by: null,
    icon: null,
    id: '08f93770c8b1bde2253074b73527c8c4',
    labels: [],
    modified_at: 1764991750.466421,
    name: null,
    options: { sensor: { suggested_display_precision: 3 } },
    original_name: 'Grid Active Power',
    platform: 'sigen',
    translation_key: null,
    unique_id: '01K9ZZHPHWAQ0XF4PVJWC6AGRE_sigen_plant_plant_grid_sensor_active_power',
  },
  {
    // A YAML-declared template sensor: no config entry, no device.
    area_id: null,
    categories: {},
    config_entry_id: null,
    config_subentry_id: null,
    created_at: 1763115484.217455,
    device_id: null,
    disabled_by: null,
    entity_category: null,
    entity_id: 'sensor.ev_charging_status',
    has_entity_name: false,
    hidden_by: null,
    icon: 'mdi:car-electric',
    id: '372b761525763157ea33c9ba744aba8e',
    labels: [],
    modified_at: 1766375602.79574,
    name: null,
    options: {},
    original_name: null,
    platform: 'template',
    translation_key: null,
    unique_id: 'ev_charging_status',
  },
];

/**
 * The seven live entities on the reference instance that have **no registry row
 * at all** — measured 2026-07-30 by diffing `get_states` against
 * `config/entity_registry/list`.
 *
 * ⭐⭐⭐ These are the reason the registry filter must be permissive rather than
 * an inner join. Every one of them is a real, selectable, perfectly usable
 * entity, and a join that dropped unmatched rows would silently delete all seven
 * from every picker — the exact over-broad-filter failure `entityCriteria.ts`
 * was written to avoid.
 */
export const liveEntityIdsWithNoRegistryRow: string[] = [
  'conversation.home_assistant',
  'zone.home',
  'sun.sun',
  'sensor.amber_import_price_c_kwh',
  'sensor.amber_export_price_c_kwh',
  'sensor.next_cheap_import_forecast_c_kwh',
  'sensor.next_high_feed_in_forecast_c_kwh',
];
