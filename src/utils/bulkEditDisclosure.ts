/**
 * Wording for what the Properties panel is about to edit when more than one
 * card is selected.
 *
 * ⚠⚠ WHY THIS EXISTS — the v1.0.0 UAT round-2 defect CLIP-04 (High).
 *
 * `docs/testing/uat/plans/uat_plan_v1.0.0-r2_2026-07-31.md` CLIP-04 expects
 * "The Properties panel indicates it is editing multiple cards". It never did:
 * `App.tsx` handed `PropertiesPanel` exactly ONE card, so the heading was the
 * bare string "Properties" at every selection size. Measured on `37e9dc8`: the
 * write path fans out to all three cards correctly, and the panel says nothing
 * about it — so the user is one keystroke away from changing three cards while
 * looking at a form that claims to describe one.
 *
 * ⭐ Kept as a PURE module for the same reason `entityDisclosure.ts` is (PR
 * #112): the wording is the product decision, and a string that lives inside a
 * 7,000-line component cannot be unit-tested, reviewed, or reused without being
 * copied — and a copied string is a string that diverges.
 *
 * ⭐ THE RULE THESE ALL SERVE: say what will change BEFORE it changes. HAVDM's
 * vision commits to honestly marking what it cannot do; a bulk edit that
 * silently skips some of your selection is exactly such a case.
 */

/** Sentence 1: how many cards this edit will land on. */
export const describeBulkSelection = (selectedCount: number): string =>
  `Editing ${selectedCount} selected cards`;

/**
 * Sentence 2, shown only when the selection spans MORE THAN ONE CARD TYPE.
 *
 * ⚠ `applyBulkCardUpdate` deliberately skips cards whose `type` differs from the
 * card being edited. That is the agreed behaviour (owner decision, 2026-08-02:
 * keep the guard, disclose it) — but until now it happened in silence, so a
 * user editing three cards saw "Updated 1 card" with no explanation of which
 * two were left alone or why.
 */
export const describeBulkTypeSkip = (
  matchingCount: number,
  selectedCount: number,
  typeLabel: string,
): string | null => {
  const skipped = selectedCount - matchingCount;
  if (skipped <= 0) return null;

  const willChange =
    matchingCount === 1
      ? `1 of ${selectedCount} is a ${typeLabel} card and will change.`
      : `${matchingCount} of ${selectedCount} are ${typeLabel} cards and will change.`;

  const willNot =
    skipped === 1
      ? 'The other card is a different type and will not.'
      : `The other ${skipped} cards are a different type and will not.`;

  return `${willChange} ${willNot}`;
};

/**
 * Sentence 3 — the honesty note about fields the user does NOT touch.
 *
 * ⚠⚠⚠ This is the disclosure for the OTHER half of CLIP-04, and it is the half
 * no expectation on the card even asked about. Before this change
 * `applyBulkCardUpdate` returned `{...updatedCard}` for every target — it did
 * not apply the edited PROPERTY, it replaced each selected card with a
 * wholesale CLONE of the edited one. Measured: three buttons with distinct
 * entities and icons, edit the name only, and all three ended up on the
 * last-clicked card's entity AND icon. One field changed, four values
 * destroyed — while the app reported "Updated 3 cards".
 *
 * The write is now a delta (see `applyBulkCardUpdate`), so this sentence
 * describes what actually happens rather than apologising for what did.
 */
export const BULK_UNTOUCHED_NOTE =
  'Only the fields you change are applied. Fields you leave alone keep each card’s own value.';

/**
 * The form shows ONE card's values — the last-clicked one. Say so, rather than
 * letting the user read a field as if it described the whole selection.
 */
export const BULK_SHOWN_FROM_NOTE =
  'Values shown are from the last-clicked card; other selected cards may differ.';
