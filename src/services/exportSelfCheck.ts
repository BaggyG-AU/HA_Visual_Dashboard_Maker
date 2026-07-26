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
 *    `_expanderDepth`, `icon_color_mode`, `icon_color_states`,
 *    `icon_color_attribute`, `smart_defaults`) — should have been removed
 *    silently (B2 + Phase 4 PR-1).
 *  - the CANVAS-class behavioural keys (`attribute_display`, `multi_entity_mode`,
 *    `sound`, `haptic`, …) — should have been stripped + warned (Phase 4 PR-1).
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
import {
  CANVAS_ONLY_CARD_TYPES,
  STRIP_KEYS,
  CANVAS_KEYS,
  HA_VISIBILITY_KEYS,
  VIEW_STRIP_KEYS,
} from './haExportContract';

const CANVAS_ONLY_TYPE_SET = new Set<string>(CANVAS_ONLY_CARD_TYPES);

/** VIEW/DASHBOARD-level HAVDM internals that must never survive (slice F). */
const VIEW_STRIP_KEY_SET = new Set<string>(VIEW_STRIP_KEYS);

/**
 * HAVDM-only keys that must never survive the boundary — derived from the export
 * contract so this stays in sync automatically:
 *  - STRIP keys (silent internal/derived bookkeeping — B2 + Phase 4 PR-1),
 *  - CANVAS keys (design-time behavioural features — Phase 4 PR-1),
 *  - the ha-visibility condition keys (should have been translated to native
 *    `visibility` — B6b).
 * The card-mod TRANSLATE keys (`gap`/`style`/…) are deliberately NOT included:
 * a string `gap` is `custom:expander-card`'s real option and legitimately
 * survives. `_havdm_*` keys are caught by the prefix check in `scanCard`.
 */
const LEAKED_INTERNAL_KEYS = new Set<string>([
  ...STRIP_KEYS,
  ...CANVAS_KEYS,
  ...HA_VISIBILITY_KEYS,
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
 * Flag HAVDM-internal keys surviving at the VIEW or DASHBOARD level (slice F).
 *
 * `scanCard` covers cards; this covers their containers, which used to be
 * rebuilt from an allowlist and are now pass-through. Only the `_havdm_` prefix
 * and the classified view-strip keys are flagged — a view key this function does
 * not recognise is assumed to be real Home Assistant config, which is exactly
 * the posture that stops the boundary destroying it.
 */
const scanViewLevelKeys = (
  container: Record<string, unknown>,
  level: 'view' | 'dashboard',
  out: ExportWarning[],
): void => {
  const leaked = Object.keys(container).filter(
    (key) => key.startsWith('_havdm') || VIEW_STRIP_KEY_SET.has(key),
  );
  if (leaked.length === 0) return;

  out.push({
    category: 'self-check',
    cardType: level,
    keys: leaked,
    reason: 'leaked-internal',
    message:
      `HAVDM-internal ${level} ${leaked.length === 1 ? 'key' : 'keys'} ` +
      `${leaked.map((k) => `"${k}"`).join(', ')} reached the Home Assistant ` +
      `export — this is an export-boundary bug. Home Assistant will ignore ` +
      `${leaked.length === 1 ? 'it' : 'them'}, but ${leaked.length === 1 ? 'it does' : 'they do'} ` +
      `not belong in your dashboard.`,
  });
};

/**
 * Scan an HA-bound dashboard config for surviving HAVDM-only artefacts. Returns
 * a (usually empty) list of `self-check` warnings. Never throws; never blocks.
 */
export const selfCheckHaConfig = (config: DashboardConfig): ExportWarning[] => {
  const out: ExportWarning[] = [];

  // ⭐ WS3 slice F: scan the DASHBOARD level too. It became pass-through in this
  // slice, so an unclassified internal key here would now reach Home Assistant
  // rather than being dropped by an allowlist.
  scanViewLevelKeys(config as unknown as Record<string, unknown>, 'dashboard', out);

  const views = (config as unknown as { views?: unknown }).views;
  if (!Array.isArray(views)) return out;

  views.forEach((view) => {
    if (!isRecord(view)) return;
    // ⭐ WS3 slice F: the VIEW's own keys, not just its cards. Before this slice
    // the view path was an allowlist, so a leaked internal view key was
    // impossible by construction and there was nothing to check. Views now pass
    // unknown keys THROUGH — which is what stops HA keys being destroyed — so
    // this is the runtime backstop for an internal key nobody classified.
    scanViewLevelKeys(view, 'view', out);
    if (Array.isArray(view.cards)) {
      view.cards.forEach((card) => walkCard(card, out));
    }
    // Sections view: its cards live under sections[].cards (not the top-level
    // `cards`). Descend into them so a leaked HAVDM artefact inside a section
    // is flagged, not silently shipped to Home Assistant.
    if (Array.isArray(view.sections)) {
      view.sections.forEach((section) => {
        if (isRecord(section) && Array.isArray(section.cards)) {
          section.cards.forEach((card) => walkCard(card, out));
        }
      });
    }
  });

  return out;
};
