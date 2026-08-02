/**
 * The words HAVDM uses when it has hidden entities from the user.
 *
 * ⭐⭐⭐ PROPS-03. `src/utils/entityRegistry.ts` states the doctrine these strings
 * exist to enforce: **a user cannot tell the difference between "HAVDM hid it"
 * and "it does not exist"**. The Entity Browser honoured it — `Showing 6 of 44
 * (38 hidden)` plus a "Show diagnostic & config" tick-box. The Properties-panel
 * picker applied the SAME cut and said NOTHING, which is how "'light' not found
 * in entity list" happened.
 *
 * ⚠⚠ THE POINT OF THIS MODULE IS THAT THE TWO SURFACES CANNOT DRIFT APART AGAIN.
 * The wording lived only inside `EntityBrowser.tsx`, so the picker could not have
 * reused it without copying it — and a copied string is a string that diverges.
 * These builders produce output BYTE-IDENTICAL to what the browser rendered
 * before this module existed, so lifting them changed no pixel and broke no test.
 *
 * ⚠ Pure and dependency-free, like its siblings in `src/utils/` — it takes
 * numbers and returns sentences, so every branch is unit-testable without
 * rendering anything.
 */

/**
 * The one label for the diagnostic/config escape hatch.
 *
 * ⚠ Referenced INSIDE the empty-state sentences below, so a control and the
 * message that tells you to use that control can never name it differently.
 */
export const SHOW_DIAGNOSTIC_LABEL = 'Show diagnostic & config';

/** "Showing 438 of 725 (287 hidden)", or plain "Showing 438" when nothing is cut. */
export const describeVisibleCount = (visible: number, total: number): string => {
  const hidden = total - visible;
  return hidden > 0 ? `Showing ${visible} of ${total} (${hidden} hidden)` : `Showing ${visible}`;
};

/**
 * Every candidate in scope was cut by the diagnostic/config filter.
 * The Entity Browser's wording, verbatim.
 */
export const describeAllHiddenHere = (hiddenCount: number): string =>
  `All ${hiddenCount} entities here are marked diagnostic or config by Home Assistant. ` +
  `Tick "${SHOW_DIAGNOSTIC_LABEL}" to see them.`;

export interface PickerEmptyInput {
  /** Everything the picker could know about, before any filtering. */
  totalEntities: number;
  /**
   * Survivors of every constraint EXCEPT the diagnostic/config cut — i.e. what
   * would be on offer if the user ticked the box.
   *
   * ⚠⚠ NOT "survivors of the card-type filter". An earlier draft used that, and
   * it was WRONG for the single most important case: `PropertiesPanel.tsx:2303`
   * renders the Light card's picker as `filterDomains={['light']}` with NO
   * `cardType` at all, so the card-type stage removed nothing and the message
   * blamed the diagnostic cut — "All 5 entities here are marked diagnostic or
   * config" — for an instance that simply has no lights. The integration test
   * caught it. What matters is not WHICH constraint narrowed the list but
   * whether the cut is the reason there is nothing left.
   */
  eligible: number;
  /** Survivors of the cut too — i.e. what is actually offered. */
  offered: number;
  /** Of the entities the registry cut removed, how many match the current query. */
  hiddenMatchingSearch: number;
  /** What the user has typed, if anything. */
  searchText: string;
  /** Human name of the card being edited, e.g. "Light". Null when unconstrained. */
  cardLabel?: string | null;
  /** Explicit domain restriction on the field, when it has one. */
  domains?: string[] | null;
}

/**
 * Why is this picker showing nothing?
 *
 * ⭐⭐⭐ FOUR DISTINCT CAUSES THE USER COULD NOT PREVIOUSLY TELL APART — antd's
 * bare default renders "No data" for all four. Measured on the reference
 * instance (725 entities, 1397 registry rows), every one of them is reachable:
 *
 *  1. Nothing cached at all — never connected.
 *  2. The CARD admits nothing here. A Light card offers a pool of ZERO because
 *     the instance has no `light` domain at all. **This is the case the owner
 *     actually hit**, and the old UI's answer to it was "No data".
 *  3. The registry cut removed everything in scope.
 *  4. The search matched nothing visible — but WOULD have matched entities the
 *     cut removed. On the reference instance, typing "light" matches exactly 3
 *     entities and all 3 are `entity_category: diagnostic`, so the picker
 *     returned nothing while holding the answer.
 *
 * ⚠ Order matters: the causes are checked outermost-first, because a Light card
 * on an instance with no lights is ALSO a case where the search found nothing,
 * and naming the narrower reason would be true but useless.
 */
export const describePickerEmpty = ({
  totalEntities,
  eligible,
  offered,
  hiddenMatchingSearch,
  searchText,
  cardLabel,
  domains,
}: PickerEmptyInput): string => {
  if (totalEntities === 0) {
    return 'No entities cached. Connect to Home Assistant and click Refresh.';
  }

  // (2) The FIELD's own constraint, not the cut, is why there is nothing here —
  // and unticking the box would not produce a single extra option.
  if (eligible === 0) {
    if (cardLabel) {
      return `No entity on this Home Assistant can be shown by a ${cardLabel} card.`;
    }
    if (domains && domains.length > 0) {
      const list =
        domains.length === 1
          ? domains[0]
          : `${domains.slice(0, -1).join(', ')} or ${domains[domains.length - 1]}`;
      return `No entity on this Home Assistant is in the ${list} domain.`;
    }
    return 'No entity on this Home Assistant can be shown by this card.';
  }

  // (3) Everything this field could have used is marked diagnostic or config.
  if (offered === 0) {
    return describeAllHiddenHere(eligible);
  }

  // (4) The search came up empty, but the answer is sitting behind the cut.
  const query = searchText.trim();
  if (query && hiddenMatchingSearch > 0) {
    const isOne = hiddenMatchingSearch === 1;
    return (
      `No visible entity matches "${query}". ` +
      `${hiddenMatchingSearch} ${isOne ? 'entity that matches is' : 'entities that match are'} ` +
      `marked diagnostic or config by Home Assistant. Tick "${SHOW_DIAGNOSTIC_LABEL}" to ` +
      `${isOne ? 'see it' : 'see them'}.`
    );
  }

  return 'No entities match your search.';
};
