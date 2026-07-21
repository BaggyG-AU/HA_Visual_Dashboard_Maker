/**
 * Export self-check — slice **B8** of the export boundary (design §8, stage 1).
 *
 * A warn-only structural gate: after `serializeForHA` has run the full boundary
 * (STRIP / TRANSLATE→card-mod / TRANSLATE→visibility / CANVAS-ONLY placeholder),
 * scan the HA-bound output for any HAVDM-only artefact that should NOT have
 * survived. On a correct boundary this returns `[]`; anything it finds is an
 * export-boundary **bug** — it does not block deploy, it surfaces a warning so
 * the leak is visible instead of silently reaching Home Assistant.
 *
 * Flags, per card at every depth:
 *  - `_havdm_*` keys and the STRIP-class internals (`_isSpacer`,
 *    `_expanderDepth`, `icon_color_mode`) — should have been removed (B2).
 *  - a bare `layout` that is a geometry object (`{x|y|w|h}`) — should have been
 *    renamed to `_havdm_layout` on import then stripped (B5); a STRING `layout`
 *    (Mushroom's real option) is fine and NOT flagged.
 *  - `visibility_conditions` / `visibility_operator` — should have been
 *    translated to native `visibility` (B6b).
 *  - a `CANVAS_ONLY_CARD_TYPES` type — should have been substituted with a
 *    placeholder (B7).
 *
 * The card-mod TRANSLATE keys (`gap`/`style`/…) are deliberately NOT flagged:
 * a string `gap` is `custom:expander-card`'s real option and legitimately
 * survives (B6 collision guard), so flagging the key name would false-positive.
 */
import type { DashboardConfig } from '../types/dashboard';
import type { ExportWarning } from './exportWarnings';
import { CANVAS_ONLY_CARD_TYPES } from './haExportContract';

const CANVAS_ONLY_TYPE_SET = new Set<string>(CANVAS_ONLY_CARD_TYPES);

/** STRIP-class internals that must never survive the boundary. */
const LEAKED_INTERNAL_KEYS = new Set<string>([
  '_isSpacer',
  '_expanderDepth',
  'icon_color_mode',
  'visibility_conditions',
  'visibility_operator',
]);

const GEOMETRY_KEYS = ['x', 'y', 'w', 'h'] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isGeometryLayout = (value: unknown): boolean =>
  isRecord(value) && GEOMETRY_KEYS.some((key) => key in value);

const scanCard = (card: Record<string, unknown>, out: ExportWarning[]): void => {
  const leaked: string[] = [];
  Object.keys(card).forEach((key) => {
    if (key.startsWith('_havdm') || LEAKED_INTERNAL_KEYS.has(key)) {
      leaked.push(key);
    }
  });
  if (isGeometryLayout(card.layout)) {
    leaked.push('layout');
  }

  const type = card.type;
  const cardType = typeof type === 'string' ? type : 'card';
  const isPhantom = typeof type === 'string' && CANVAS_ONLY_TYPE_SET.has(type);

  if (isPhantom) {
    out.push({
      category: 'self-check',
      cardType,
      keys: ['type'],
      reason: 'leaked-internal',
      message:
        `A non-deployable "${cardType}" card reached the Home Assistant export ` +
        `unchanged — this is an export-boundary bug. Home Assistant may show it as ` +
        `an error tile.`,
    });
  }

  if (leaked.length > 0) {
    out.push({
      category: 'self-check',
      cardType,
      keys: leaked,
      reason: 'leaked-internal',
      message:
        `HAVDM-internal fields (${leaked.join(', ')}) reached the Home Assistant ` +
        `export on a "${cardType}" card — this is an export-boundary bug; Home ` +
        `Assistant does not understand them.`,
    });
  }
};

/** Walk a card and every nested card (mirrors the export recursion containers). */
const walkCard = (card: unknown, out: ExportWarning[]): void => {
  if (!isRecord(card)) return;
  scanCard(card, out);

  if (Array.isArray(card.cards)) {
    card.cards.forEach((child) => walkCard(child, out));
  }
  if (isRecord(card.card)) {
    walkCard(card.card, out);
  }
  if (isRecord(card.popup) && Array.isArray(card.popup.cards)) {
    card.popup.cards.forEach((child) => walkCard(child, out));
  }
  if (Array.isArray(card.tabs)) {
    card.tabs.forEach((tab) => {
      if (!isRecord(tab)) return;
      if (isRecord(tab.card)) walkCard(tab.card, out);
      if (Array.isArray(tab.cards)) tab.cards.forEach((child) => walkCard(child, out));
    });
  }
};

/**
 * Scan an HA-bound dashboard config for surviving HAVDM-only artefacts. Returns
 * a (usually empty) list of `self-check` warnings. Never throws; never blocks.
 */
export const selfCheckHaConfig = (config: DashboardConfig): ExportWarning[] => {
  const out: ExportWarning[] = [];
  const views = (config as unknown as { views?: unknown }).views;
  if (!Array.isArray(views)) return out;

  views.forEach((view) => {
    if (!isRecord(view) || !Array.isArray(view.cards)) return;
    view.cards.forEach((card) => walkCard(card, out));
  });

  return out;
};
