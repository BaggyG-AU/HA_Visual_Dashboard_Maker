/**
 * Canvas-only placeholder — slice **B7** of the export boundary.
 *
 * Phantom card **types** (`CANVAS_ONLY_CARD_TYPES` in `haExportContract.ts`)
 * render on the HAVDM canvas but do not exist as deployable Home Assistant
 * cards. On export each is substituted with a native `markdown` **"Card Not
 * Available"** placeholder that holds its slot, so WYSIWYG geometry is preserved
 * and HA never sees an unknown card type (which it renders as an error tile).
 *
 * Design: `docs/refresh/HA_EXPORT_BOUNDARY_DESIGN_2026-07.md` §6a. Vision:
 * `drawer_havdm_decisions_d4f0886c7035390d30c1d1a7` answers 3 + 9 — the
 * placeholder MUST be an HA-native, renderable card (`markdown`), NOT
 * `type: spacer` (spacer is itself a phantom type HA renders as "Unknown type
 * encountered: spacer").
 *
 * The substitution copies the original card's slot-holding keys
 * (`view_layout` / `grid_options` / `layout_options`) onto the placeholder so it
 * occupies the same space. A container phantom (e.g. `custom:popup-card` with
 * nested cards) collapses to the placeholder — its design-time children are
 * intentionally dropped.
 */
import { CANVAS_ONLY_CARD_TYPES } from './haExportContract';
import type { ExportWarning } from './exportWarnings';

export interface SubstituteCanvasOnlyResult {
  card: Record<string, unknown>;
  warnings: ExportWarning[];
}

const CANVAS_ONLY_TYPE_SET = new Set<string>(CANVAS_ONLY_CARD_TYPES);

/** Keys copied onto the placeholder so it holds the original card's slot. */
const SLOT_KEYS = ['view_layout', 'grid_options', 'layout_options'] as const;

/** `custom:popup-card` → `popup`; `custom:multiple-entity-row` → `multiple-entity-row`. */
const friendlyTypeName = (type: string): string =>
  type.replace(/^custom:/, '').replace(/-card$/, '');

const buildPlaceholderContent = (type: string): string => {
  const friendly = friendlyTypeName(type);
  return [
    '## ⚠️ Card Not Available',
    '',
    `The **${friendly}** card is a HAVDM design-only card with no Home Assistant ` +
      `equivalent, so it can't be deployed. This placeholder holds its place.`,
  ].join('\n');
};

/**
 * If `card` is a canvas-only phantom type, return a native `markdown` "Card Not
 * Available" placeholder (carrying the original slot-holding keys) plus a
 * warning. Otherwise return the card unchanged. Returns a NEW object; the input
 * is not mutated.
 */
export const substituteCanvasOnlyCard = (
  card: Record<string, unknown>,
): SubstituteCanvasOnlyResult => {
  const type = card.type;
  if (typeof type !== 'string' || !CANVAS_ONLY_TYPE_SET.has(type)) {
    return { card, warnings: [] };
  }

  const placeholder: Record<string, unknown> = {
    type: 'markdown',
    content: buildPlaceholderContent(type),
  };
  SLOT_KEYS.forEach((key) => {
    if (card[key] !== undefined) {
      placeholder[key] = card[key];
    }
  });

  return {
    card: placeholder,
    warnings: [
      {
        category: 'placeholder',
        cardType: type,
        keys: ['type'],
        reason: 'canvas-only-type',
        message:
          `The "${type}" card is a HAVDM design-only card with no Home Assistant ` +
          `equivalent, so it was replaced with a "Card Not Available" placeholder that ` +
          `holds its place on the dashboard.`,
      },
    ],
  };
};
