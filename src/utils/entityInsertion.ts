/**
 * Where should an entity id from the entity browser be inserted?
 *
 * Pure decision logic, shared by every surface that offers "Insert Entity":
 * the Edit YAML dialog, the Properties panel's YAML tab, and the Split view
 * YAML pane. Kept in `utils/` (no service imports) alongside `entityCriteria`,
 * `yamlCardLocator`, `containerCards` and `keyboardShortcuts`.
 *
 * WHY THIS EXISTS (UAT card YAML-05)
 * ----------------------------------
 * Each surface used to do:
 *
 *     const selection = editor.getSelection() ?? editor.getModel()?.getFullModelRange();
 *     editor.executeEdits('insert-entity', [{ range: selection, text: entityId }]);
 *
 * Two things are wrong with that.
 *
 * 1. `getSelection()` on an editor the user has NEVER focused does not return
 *    `null` — Monaco reports a caret at (1,1). So the `??` fallback is dead code
 *    and the id is inserted at the very top of the document. Measured: a
 *    dashboard opening `title: My Dashboard` became
 *    `light.living_roomtitle: My Dashboard`, destroying the title key. The
 *    result is still *syntactically valid* YAML — a mapping key that happens to
 *    be nonsense — so validation reported no error and Apply Changes stayed
 *    enabled. Silent corruption presented as valid.
 *
 * 2. Had `getSelection()` ever returned `null`, the fallback would have handed
 *    `executeEdits` the FULL MODEL RANGE, replacing the user's entire document
 *    with a single entity id.
 *
 * The product rule (THE VISION: never silently destroy user data) says HAVDM
 * must not guess where the user meant. When it has not been told, it refuses and
 * says why, leaving the document untouched — the same fail mode HA-03 and
 * YAML-04 already follow.
 *
 * Note the decision keys off whether the user has ESTABLISHED a cursor, not off
 * where that cursor is. A user who deliberately clicks at line 1 column 1 must
 * still be able to insert there; only "we were never told" is refused.
 */

/** The subset of Monaco's `IRange` this decision needs. */
export interface EditorRange {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface EntityInsertionDecision {
  allowed: boolean;
  /** Present only when `allowed` — the range to hand `executeEdits`. */
  range?: EditorRange;
  /** Present only when refused — shown to the user verbatim. */
  refusalReason?: string;
}

export const NO_CURSOR_REFUSAL =
  'Click in the YAML editor to place the cursor where the entity id should go, then try again.';

/**
 * Decide whether an entity id may be inserted, and into which range.
 *
 * @param hasUserPlacedCursor whether the user has focused the editor text at
 *   least once since it was opened. A never-focused editor still reports a
 *   caret at (1,1), so the selection alone cannot answer this.
 * @param selection the editor's current selection, if any.
 */
export function decideEntityInsertion(
  hasUserPlacedCursor: boolean,
  selection: EditorRange | null | undefined,
): EntityInsertionDecision {
  if (!hasUserPlacedCursor || !selection) {
    return { allowed: false, refusalReason: NO_CURSOR_REFUSAL };
  }

  return { allowed: true, range: selection };
}
