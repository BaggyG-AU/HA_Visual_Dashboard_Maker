/**
 * Card-mod translator — slice **B6** of the export boundary.
 *
 * The TRANSLATE→card-mod class of the export contract
 * (`haExportContract.ts`, `CARD_MOD_KEYS`): the layout-enhancement keys and the
 * raw-CSS `style` key HAVDM invented all have a real Home Assistant target —
 * card-mod CSS. When card-mod is available on the target instance, these keys
 * are compiled into a `card_mod: { style: <css> }` block that MIRRORS what the
 * HAVDM canvas renders; when card-mod is absent they are stripped and a
 * plain-language warning is recorded (surfaced by slice B8).
 *
 * Design: `docs/refresh/HA_EXPORT_BOUNDARY_DESIGN_2026-07.md` §6. Vision:
 * MemPalace `drawer_havdm_decisions_d4f0886c7035390d30c1d1a7` (superset design
 * tool — translate what has an HA target, honestly mark what does not).
 *
 * Per-key mapping (ratified 2026-07-21 — the "split ha-card + #root" strategy):
 *
 *   BOX-level keys → `ha-card { … }`  (the card's own box)
 *     style        → the raw CSS declarations, verbatim
 *     card_margin  → `margin:  <4-value px shorthand>`  (via toSpacingCssShorthand)
 *     card_padding → `padding: <4-value px shorthand>`
 *
 *   LAYOUT keys → `#root { … }`  (HA's stack/grid internal flex/grid container)
 *     gap          → `gap:            <clampLayoutGap>px`
 *     row_gap      → `row-gap:        <clampLayoutGap>px`
 *     column_gap   → `column-gap:     <clampLayoutGap>px`
 *     align_items    → `align-items:    …`  (ALIGN_ITEMS_TO_CSS   via layoutConfig)
 *     justify_content→ `justify-content:…`  (JUSTIFY_CONTENT_TO_CSS)
 *     justify_items  → `justify-items:  …`  (JUSTIFY_ITEMS_TO_CSS)
 *     wrap           → `flex-wrap:      …`  (verbatim: nowrap | wrap | wrap-reverse)
 *
 * The CSS is produced with the SAME normalizers the canvas renderers use
 * (`layoutConfig.ts`, `cardSpacing.ts`) so the exported CSS matches what the
 * user sees on the HAVDM canvas.
 *
 * ⚠ COLLISION GUARD (mirrors the B5 `layout` disambiguation): `custom:expander-
 * card` carries its OWN real `gap` option, and it is a STRING (e.g. `'0.5em'`).
 * HAVDM's stack layout `gap` is a NUMBER. So `gap` / `row_gap` / `column_gap`
 * are only claimed for translation when the value is a finite NUMBER; a string
 * gap is left untouched as a real HA option.
 */
import {
  clampLayoutGap,
  normalizeAlignItems,
  normalizeJustifyContent,
  normalizeJustifyItems,
  normalizeWrapMode,
  toAlignItemsCss,
  toJustifyContentCss,
  toJustifyItemsCss,
} from './layoutConfig';
import { toSpacingCssShorthand } from './cardSpacing';
import type { ExportWarning } from './exportWarnings';

export interface TranslateCardModOptions {
  /**
   * Whether card-mod is installed on the target Home Assistant instance. When
   * `false`, the TRANSLATE keys are stripped and a warning is recorded instead
   * of emitting a `card_mod` block. Defaults to `true` (assume present — it is,
   * on the reference instance; the full capability-inventory gate is Phase 3).
   */
  cardModAvailable?: boolean;
}

export interface TranslateCardModResult {
  card: Record<string, unknown>;
  warnings: ExportWarning[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const ensureTrailingSemicolon = (decls: string): string => {
  const trimmed = decls.trim();
  if (!trimmed) return '';
  return trimmed.endsWith(';') ? trimmed : `${trimmed};`;
};

/** Build a single CSS rule, or `null` when it would be empty. */
const buildRule = (selector: string, declarations: string[]): string | null => {
  const body = declarations.filter((decl) => decl.trim().length > 0);
  if (body.length === 0) return null;
  return `${selector} {\n  ${body.join('\n  ')}\n}`;
};

/**
 * Compile the `style` declaration string into individual declaration lines so
 * they sit uniformly alongside the generated `margin`/`padding` lines.
 */
const styleDeclarations = (style: string): string[] => {
  const normalized = ensureTrailingSemicolon(style);
  return normalized ? [normalized] : [];
};

/**
 * Translate the TRANSLATE→card-mod keys on a single card into a `card_mod`
 * block (or strip them + warn when card-mod is unavailable). Returns a NEW card
 * object; the input is not mutated. Cards with no TRANSLATE keys are returned
 * unchanged (and never gain an empty `card_mod`).
 */
export const translateToCardMod = (
  card: Record<string, unknown>,
  options: TranslateCardModOptions = {},
): TranslateCardModResult => {
  const cardModAvailable = options.cardModAvailable ?? true;

  // --- 1. Determine which TRANSLATE keys this card actually claims ----------
  const claimedKeys: string[] = [];

  const boxDeclarations: string[] = [];
  if (typeof card.style === 'string') {
    claimedKeys.push('style');
    boxDeclarations.push(...styleDeclarations(card.style));
  }
  if (card.card_margin !== undefined && card.card_margin !== null) {
    claimedKeys.push('card_margin');
    boxDeclarations.push(`margin: ${toSpacingCssShorthand(card.card_margin)};`);
  }
  if (card.card_padding !== undefined && card.card_padding !== null) {
    claimedKeys.push('card_padding');
    boxDeclarations.push(`padding: ${toSpacingCssShorthand(card.card_padding)};`);
  }

  const rootDeclarations: string[] = [];
  // Numeric-only gap claim (collision guard vs expander's string `gap`).
  if (isFiniteNumber(card.gap)) {
    claimedKeys.push('gap');
    rootDeclarations.push(`gap: ${clampLayoutGap(card.gap)}px;`);
  }
  if (isFiniteNumber(card.row_gap)) {
    claimedKeys.push('row_gap');
    rootDeclarations.push(`row-gap: ${clampLayoutGap(card.row_gap)}px;`);
  }
  if (isFiniteNumber(card.column_gap)) {
    claimedKeys.push('column_gap');
    rootDeclarations.push(`column-gap: ${clampLayoutGap(card.column_gap)}px;`);
  }
  if (typeof card.align_items === 'string') {
    claimedKeys.push('align_items');
    rootDeclarations.push(
      `align-items: ${toAlignItemsCss(normalizeAlignItems(card.align_items))};`,
    );
  }
  if (typeof card.justify_content === 'string') {
    claimedKeys.push('justify_content');
    rootDeclarations.push(
      `justify-content: ${toJustifyContentCss(normalizeJustifyContent(card.justify_content))};`,
    );
  }
  if (typeof card.justify_items === 'string') {
    claimedKeys.push('justify_items');
    rootDeclarations.push(
      `justify-items: ${toJustifyItemsCss(normalizeJustifyItems(card.justify_items))};`,
    );
  }
  if (typeof card.wrap === 'string') {
    claimedKeys.push('wrap');
    rootDeclarations.push(`flex-wrap: ${normalizeWrapMode(card.wrap)};`);
  }

  // Nothing to translate — leave the card exactly as-is (no empty card_mod).
  if (claimedKeys.length === 0) {
    return { card, warnings: [] };
  }

  const cardType = typeof card.type === 'string' ? card.type : 'card';

  // --- 2. Remove the claimed raw keys (both branches drop them) -------------
  const output: Record<string, unknown> = {};
  const claimed = new Set(claimedKeys);
  Object.entries(card).forEach(([key, value]) => {
    if (!claimed.has(key)) {
      output[key] = value;
    }
  });

  // --- 3a. card-mod absent → strip + warn -----------------------------------
  if (!cardModAvailable) {
    return {
      card: output,
      warnings: [
        {
          category: 'card-mod',
          cardType,
          keys: claimedKeys,
          reason: 'card-mod-unavailable',
          message:
            `Custom styling on this "${cardType}" card ` +
            `(${claimedKeys.join(', ')}) needs the card-mod add-on, which is not ` +
            `installed on your Home Assistant. The styling was removed so the ` +
            `card still loads.`,
        },
      ],
    };
  }

  // --- 3b. card-mod present → emit / merge the card_mod block ----------------
  const css = [buildRule('ha-card', boxDeclarations), buildRule('#root', rootDeclarations)]
    .filter((rule): rule is string => rule !== null)
    .join('\n');

  const existing = card.card_mod;

  // No existing card_mod, or a plain object with a string/absent `style`: merge.
  if (!isRecord(existing)) {
    output.card_mod = { style: css };
    return { card: output, warnings: [] };
  }

  if (typeof existing.style === 'string') {
    const merged = existing.style.trim() ? `${existing.style.trim()}\n${css}` : css;
    output.card_mod = { ...existing, style: merged };
    return { card: output, warnings: [] };
  }

  if (existing.style === undefined) {
    output.card_mod = { ...existing, style: css };
    return { card: output, warnings: [] };
  }

  // Existing card_mod with an object-form `style` (advanced per-element card-mod
  // the user hand-authored). Merging our string into it is ambiguous, so leave
  // the existing block untouched and record that our translation was skipped.
  output.card_mod = existing;
  return {
    card: output,
    warnings: [
      {
        category: 'card-mod',
        cardType,
        keys: claimedKeys,
        reason: 'existing-object-style',
        message:
          `This "${cardType}" card already has advanced card-mod styling, so the ` +
          `layout/style settings (${claimedKeys.join(', ')}) were not merged in ` +
          `automatically. Add them to your card-mod block by hand if you need them.`,
      },
    ],
  };
};
