/**
 * Bubble Card pop-up `hash` normalization (Phase 4 PR-5).
 *
 * A `custom:bubble-card` with `card_type: 'pop-up'` is opened by Home Assistant
 * matching the card's `hash` against `window.location.hash`. Verified read-only
 * against the installed bubble-card v3.2.5 on the reference instance
 * (`/config/www/community/Bubble-Card/bubble-card.js`): the standalone-popup
 * open/close path compares `config.hash === location.hash` RAW, and
 * `location.hash` always carries a leading '#'. A stored hash of `kitchen`
 * therefore never equals `#kitchen`, so the pop-up never opens. Upstream README
 * documents the option as required and formatted `'#kitchen'`.
 *
 * `normalizeBubbleHash` guarantees the canonical form: trimmed, with exactly one
 * leading '#'. A blank / whitespace-only / bare-'#' input returns '' — the
 * required-field validation (PropertiesPanel bubble-card form) and the export
 * warning (`bubblePopupMissingHashWarning` in yamlConversionService.ts) handle
 * the missing case, so we never emit a meaningless bare '#'.
 *
 * Extracted as a pure function because PropertiesPanel.tsx has no unit harness
 * (MemPalace drawer_havdm_state_a15b0af78e0814cfd19cf627): the normalization
 * rules are covered directly by tests/unit/bubbleCardHash.spec.ts, and the form
 * wiring by tests/e2e/bubble-card.spec.ts.
 */
export const normalizeBubbleHash = (raw: string): string => {
  const withoutLeadingHashes = raw.trim().replace(/^#+/, '');
  if (withoutLeadingHashes === '') return '';
  return `#${withoutLeadingHashes}`;
};
