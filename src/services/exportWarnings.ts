/**
 * Export warnings — the shared, plain-language notices raised while translating a
 * config across the HA export boundary.
 *
 * Introduced in slice B6 (card-mod translation) as `CardModWarning`; generalised
 * in slice B6b (visibility translation) so every TRANSLATE step pushes into one
 * accumulator. Slice B8 surfaces the collected list to the user in the pre-deploy
 * summary. Messages must be understandable to non-experts (vision answer 2 —
 * visual-first; MemPalace `drawer_havdm_decisions_d4f0886c7035390d30c1d1a7`).
 */

/** Which TRANSLATE / substitution / validation step raised the warning. */
export type ExportWarningCategory =
  'card-mod' | 'visibility' | 'placeholder' | 'canvas-key' | 'card-schema' | 'self-check';

/** Why the translation was imperfect. */
export type ExportWarningReason =
  // card-mod (B6)
  | 'card-mod-unavailable'
  | 'existing-object-style'
  // visibility (B6b)
  | 'visibility-approximated'
  // canvas-only placeholder (B7)
  | 'canvas-only-type'
  // canvas-only behavioural key strip (Phase 4 PR-1)
  | 'canvas-behavioural'
  // per-card schema approximation — a lossy translation to a real card's schema
  // (Phase 4 PR-4: slider-button-card advanced-slider keys with no HA equivalent)
  | 'schema-approximated'
  // validation self-check (B8)
  | 'leaked-internal';

export interface ExportWarning {
  /** Which TRANSLATE step raised this. */
  category: ExportWarningCategory;
  /** The `type` of the card the warning is about. */
  cardType: string;
  /** The HAVDM-only keys that were affected. */
  keys: string[];
  /** Machine-readable reason. */
  reason: ExportWarningReason;
  /** Plain-language, non-expert-friendly explanation. */
  message: string;
}
