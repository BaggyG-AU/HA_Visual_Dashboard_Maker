/**
 * Canvas-only behavioural-key stripper — Phase 4 **PR-1** of the render-fidelity
 * remediation (roadmap `docs/refresh/HA_RENDER_FIDELITY_REMEDIATION_PLAN_2026-07.md`
 * §3; plan sign-off MemPalace `drawer_havdm_decisions_f16bbd74d5c870fb482ee8b1`).
 *
 * The `'canvas'` class of the export contract (`haExportContract.ts`,
 * `CANVAS_KEYS`) is a set of design-time behavioural features HAVDM offers on the
 * canvas — attribute displays, multi-entity aggregation, batch actions, trigger
 * animations, per-state styles/icons, sound and haptic feedback — that Home
 * Assistant has **no mechanism** for. Left on a deployed card they do not break
 * rendering, but they fail HA's strict `baseLovelaceCardConfig` superstruct and
 * kick the card out of Home Assistant's visual editor (audit part 4,
 * `drawer_havdm_investigations_509529d1116c60549d1f424e`).
 *
 * The ratified treatment (user, 2026-07-23) is **strip + warn**: remove every
 * canvas key on export, and raise ONE plain-language warning per card listing
 * what was dropped, so the user knows those design-time features will not survive
 * deploy. (The silent internal/derived `'strip'` keys are handled separately by
 * `stripInternalKeys` in `yamlConversionService.ts`.)
 *
 * This mirrors the B6/B6b/B7 translator shape: pure, returns a NEW object, never
 * mutates its input, and pushes into the shared `ExportWarning` accumulator.
 */
import { CANVAS_KEYS } from './haExportContract';
import type { ExportWarning } from './exportWarnings';

const CANVAS_KEY_SET = new Set<string>(CANVAS_KEYS);

/** Plain-language labels so the warning reads for a non-expert. */
const FRIENDLY_LABELS: Record<string, string> = {
  attribute_display: 'attribute display',
  attribute_display_layout: 'attribute display layout',
  multi_entity_mode: 'multi-entity mode',
  aggregate_function: 'aggregate function',
  batch_actions: 'batch actions',
  trigger_animations: 'trigger animations',
  state_styles: 'per-state styles',
  state_icons: 'per-state icons',
  sound: 'sound feedback',
  haptic: 'haptic feedback',
};

const friendlyLabel = (key: string): string => FRIENDLY_LABELS[key] ?? key;

export interface StripCanvasKeysResult {
  card: Record<string, unknown>;
  warnings: ExportWarning[];
}

/**
 * Remove every `CANVAS_KEYS` behavioural key present on `card`. When at least one
 * was present, also return a single plain-language warning naming them. A card
 * with no canvas keys is returned unchanged with no warnings. Returns a NEW
 * object; the input is not mutated.
 */
export const stripCanvasKeys = (card: Record<string, unknown>): StripCanvasKeysResult => {
  const dropped: string[] = [];
  const output: Record<string, unknown> = {};

  Object.entries(card).forEach(([key, value]) => {
    if (CANVAS_KEY_SET.has(key)) {
      dropped.push(key);
    } else {
      output[key] = value;
    }
  });

  if (dropped.length === 0) {
    return { card, warnings: [] };
  }

  const cardType = typeof card.type === 'string' ? card.type : 'card';
  const labels = dropped.map(friendlyLabel).join(', ');

  return {
    card: output,
    warnings: [
      {
        category: 'canvas-key',
        cardType,
        keys: dropped,
        reason: 'canvas-behavioural',
        message:
          `The ${labels} setting${dropped.length > 1 ? 's are' : ' is'} a HAVDM ` +
          `design-time feature with no Home Assistant equivalent, so ` +
          `${dropped.length > 1 ? 'they were' : 'it was'} removed from this ` +
          `"${cardType}" card on export. The card deploys without ` +
          `${dropped.length > 1 ? 'them' : 'it'}.`,
      },
    ],
  };
};
