/**
 * RESOURCE_ELEMENT_MAP — curated HACS folder → custom-element map.
 *
 * Slice **I2** of the Phase 3 capability inventory (design:
 * `docs/refresh/HA_CAPABILITY_INVENTORY_DESIGN_2026-07.md` §3.1). `lovelace/resources`
 * reports FILES, not custom-element tag names, and one file can define many
 * elements (`mushroom.js` → ~15). This map keys on the stable `/hacsfiles/<folder>/`
 * segment of the resource URL and yields the `custom:*` card element types that
 * folder provides — so the resolver (`capabilityResolver.ts`) can turn the
 * installed resource list into a set of installed elements.
 *
 * KEYS ARE LOWER-CASE. The folder segment's casing varies on real instances
 * (`Bubble-Card`), so both this map's keys and the resolver's lookups are
 * lower-cased.
 *
 * PROVENANCE of the folder names:
 *  - `[verified]` — observed on the reference instance by the READ-ONLY probe
 *    2026-07-22 (ha.home.local): the folder segment is exactly as HA serves it.
 *  - `[conventional]` — the card is in HAVDM's registry but not installed on the
 *    reference instance; the folder is the card's usual HACS repo folder and is
 *    UNVERIFIED. Correct it if a user's instance reports a different segment.
 *
 * ⚠ VERSION-DEPENDENT ELEMENT RENAMES: some folders expose a DIFFERENT element
 * name across versions (e.g. better-thermostat-ui-card @3.2.2 renders as
 * `better-thermostat-normal-climate-card`, not `better-thermostat-ui-card`). We
 * list BOTH names so folder-presence resolves the card Available (permissive, per
 * the vision default); precise version-gating is deferred to the built-in/version
 * matrix work (slice I5 / Phase 4).
 *
 * NOT in this map by design: the profile-INDEPENDENT HAVDM-only types
 * (`CANVAS_ONLY_CARD_TYPES` in `haExportContract.ts` — popup-card, native-graph-card,
 * card-mod-as-a-card, the entity-rows-offered-as-cards). Those are never
 * "Available" regardless of the instance and are resolved separately in slice I4.
 */

/** The HACS folder that provides card-mod (a STYLING key, not a card element). */
export const CARD_MOD_FOLDER = 'lovelace-card-mod';

export const RESOURCE_ELEMENT_MAP: Record<string, string[]> = {
  // --- Mushroom: one file, many card elements ------------------------- [verified]
  'lovelace-mushroom': [
    'custom:mushroom-entity-card',
    'custom:mushroom-light-card',
    'custom:mushroom-climate-card',
    'custom:mushroom-cover-card',
    'custom:mushroom-fan-card',
    'custom:mushroom-switch-card',
    'custom:mushroom-chips-card',
    'custom:mushroom-title-card',
    'custom:mushroom-template-card',
    'custom:mushroom-select-card',
    'custom:mushroom-number-card',
    'custom:mushroom-person-card',
    'custom:mushroom-media-player-card',
    'custom:mushroom-lock-card',
    'custom:mushroom-alarm-control-panel-card',
    'custom:mushroom-vacuum-card',
    // Mushroom also ships humidifier/update/etc.; the above is the set HAVDM offers.
  ],

  // --- Verified on the reference instance ----------------------------- [verified]
  'button-card': ['custom:button-card'],
  'apexcharts-card': ['custom:apexcharts-card'],
  'mini-graph-card': ['custom:mini-graph-card'],
  'modern-circular-gauge': ['custom:modern-circular-gauge'],
  'power-flow-card-plus': ['custom:power-flow-card-plus'],
  'bubble-card': ['custom:bubble-card'], // folder served as `Bubble-Card`; keyed lower-case
  'better-thermostat-ui-card': [
    'custom:better-thermostat-ui-card',
    'custom:better-thermostat-normal-climate-card', // @3.2.2 element rename (see header)
  ],
  [CARD_MOD_FOLDER]: [], // styling key, provides no card element (presence still matters — I4)

  // --- In HAVDM's registry, not installed on the reference instance --- [conventional]
  'swipe-card': ['custom:swipe-card'],
  'expander-card': ['custom:expander-card'],
  'tabbed-card': ['custom:tabbed-card'],
  'gauge-card-pro': ['custom:gauge-card-pro'],
  'slider-button-card': ['custom:slider-button-card'],
  'lovelace-auto-entities': ['custom:auto-entities'],
  'vertical-stack-in-card': ['custom:vertical-stack-in-card'],
  'mini-media-player': ['custom:mini-media-player'],
  'battery-state-card': ['custom:battery-state-card', 'custom:battery-state-entity'],
  'simple-swipe-card': ['custom:simple-swipe-card'],
  'decluttering-card': ['custom:decluttering-card'],
  'surveillance-card': ['custom:surveillance-card'],
  webrtc: ['custom:webrtc-camera'], // AlexxIT/WebRTC → /hacsfiles/webrtc/
  'frigate-hass-card': ['custom:frigate-card', 'custom:advanced-camera-card'], // renamed advanced-camera-card
  'power-flow-card': ['custom:power-flow-card'],
  'camera-card': ['custom:camera-card'],
};
