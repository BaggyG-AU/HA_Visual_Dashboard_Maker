import type { Card } from '../types/dashboard';

export type SelectionMode = 'replace' | 'toggle' | 'range';

export interface SelectionState {
  selectedCardIndex: number | null;
  selectedCardIndices: number[];
  anchorCardIndex: number | null;
}

interface ResolveSelectionParams {
  previous: SelectionState;
  clickedCardIndex: number | null;
  mode?: SelectionMode;
  cardCount?: number;
}

const isValidIndex = (value: number, cardCount?: number): boolean => {
  if (!Number.isInteger(value) || value < 0) {
    return false;
  }
  if (typeof cardCount === 'number') {
    return value < cardCount;
  }
  return true;
};

export const normalizeCardIndices = (indices: number[], cardCount?: number): number[] => {
  const unique = new Set<number>();
  for (const index of indices) {
    if (isValidIndex(index, cardCount)) {
      unique.add(index);
    }
  }
  return Array.from(unique).sort((a, b) => a - b);
};

const resolvePrimaryCardIndex = (indices: number[], preferred: number | null): number | null => {
  if (indices.length === 0) {
    return null;
  }
  if (preferred !== null && indices.includes(preferred)) {
    return preferred;
  }
  return indices[0];
};

export const resolveSelectionState = ({
  previous,
  clickedCardIndex,
  mode = 'replace',
  cardCount,
}: ResolveSelectionParams): SelectionState => {
  if (clickedCardIndex === null || !isValidIndex(clickedCardIndex, cardCount)) {
    return {
      selectedCardIndex: null,
      selectedCardIndices: [],
      anchorCardIndex: null,
    };
  }

  const current = normalizeCardIndices(previous.selectedCardIndices, cardCount);

  if (mode === 'range') {
    const anchor = previous.anchorCardIndex ?? previous.selectedCardIndex ?? clickedCardIndex;
    const start = Math.min(anchor, clickedCardIndex);
    const end = Math.max(anchor, clickedCardIndex);
    const range = Array.from({ length: end - start + 1 }, (_, offset) => start + offset).filter(
      (index) => isValidIndex(index, cardCount),
    );

    return {
      selectedCardIndex: resolvePrimaryCardIndex(range, clickedCardIndex),
      selectedCardIndices: range,
      anchorCardIndex: anchor,
    };
  }

  if (mode === 'toggle') {
    const exists = current.includes(clickedCardIndex);
    const next = exists
      ? current.filter((index) => index !== clickedCardIndex)
      : [...current, clickedCardIndex];
    const normalized = normalizeCardIndices(next, cardCount);
    const selectedCardIndex = resolvePrimaryCardIndex(
      normalized,
      exists ? previous.selectedCardIndex : clickedCardIndex,
    );

    return {
      selectedCardIndex,
      selectedCardIndices: normalized,
      anchorCardIndex: clickedCardIndex,
    };
  }

  return {
    selectedCardIndex: clickedCardIndex,
    selectedCardIndices: [clickedCardIndex],
    anchorCardIndex: clickedCardIndex,
  };
};

export const resolveOperationSelection = (
  selectedCardIndex: number | null,
  selectedCardIndices: number[],
  cardCount: number,
): number[] => {
  const normalized = normalizeCardIndices(selectedCardIndices, cardCount);
  if (normalized.length > 0) {
    return normalized;
  }

  if (selectedCardIndex !== null && isValidIndex(selectedCardIndex, cardCount)) {
    return [selectedCardIndex];
  }

  return [];
};

export interface BulkUpdateResult {
  cards: Card[];
  updatedCount: number;
}

/**
 * Per-card geometry. NEVER part of a bulk delta: each card owns its own place
 * on the canvas, and propagating the edited card's layout would stack the whole
 * selection on top of it.
 */
const LAYOUT_KEYS = ['_havdm_layout', 'view_layout'] as const;

/** Structural equality over YAML-derived plain data (the only shape a Card holds). */
const isDeepEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (typeof a !== 'object') return false;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, i) => isDeepEqual(item, b[i]));
  }

  const aRec = a as Record<string, unknown>;
  const bRec = b as Record<string, unknown>;
  const aKeys = Object.keys(aRec);
  if (aKeys.length !== Object.keys(bRec).length) return false;
  return aKeys.every((key) => key in bRec && isDeepEqual(aRec[key], bRec[key]));
};

interface CardFieldDelta {
  set: Record<string, unknown>;
  removed: string[];
}

/**
 * What the user actually CHANGED — the keys that differ between the card as it
 * was and the card the form produced, excluding per-card geometry.
 */
const diffCardFields = (before: Card, after: Card): CardFieldDelta => {
  const beforeRec = before as unknown as Record<string, unknown>;
  const afterRec = after as unknown as Record<string, unknown>;
  const skip = new Set<string>(LAYOUT_KEYS);

  const set: Record<string, unknown> = {};
  for (const key of Object.keys(afterRec)) {
    if (skip.has(key)) continue;
    if (!isDeepEqual(afterRec[key], beforeRec[key])) {
      set[key] = afterRec[key];
    }
  }

  const removed = Object.keys(beforeRec).filter((key) => !skip.has(key) && !(key in afterRec));

  return { set, removed };
};

/**
 * Apply one card's edit across a multi-selection.
 *
 * ⚠⚠⚠ WHY THIS APPLIES A DELTA AND NOT THE WHOLE CARD — the v1.0.0 UAT round-2
 * defect CLIP-04 (High).
 *
 * This function used to return `{...updatedCard, _havdm_layout, view_layout}`
 * for every matching target. That does NOT apply the edited property — it
 * replaces each selected card with a WHOLESALE CLONE of the edited one,
 * preserving only geometry. Measured on `37e9dc8` with three button cards
 * carrying distinct `entity`, `name` and `icon`:
 *
 *   before: sensor.alpha/Alpha/mdi:alpha · sensor.beta/Beta/mdi:beta · sensor.gamma/Gamma/mdi:gamma
 *   user changes ONLY the name, with all three selected
 *   after:  sensor.gamma/CLONED/mdi:gamma  ×3
 *
 * One field changed; two entities and two icons destroyed — and the app
 * reported "Updated 3 cards". That is the vision's structural "never silently
 * destroy user data", broken by a feature that announces success.
 *
 * ⭐ Neither bulk spec caught it because BOTH bulk-edit cards that are identical
 * and blank, so an over-broad write is invisible by construction. A bulk
 * fixture built from identical items cannot detect an over-broad write — vary
 * the fixture on the axis the code is supposed to preserve.
 *
 * `primaryIndex` is the card the user is looking at. It takes the form
 * wholesale (they are editing it directly); every OTHER selected card of the
 * same type takes only what changed.
 */
export const applyBulkCardUpdate = (
  cards: Card[],
  targetIndices: number[],
  updatedCard: Card,
  primaryIndex: number | null,
): BulkUpdateResult => {
  const normalizedTargets = new Set(normalizeCardIndices(targetIndices, cards.length));
  if (normalizedTargets.size === 0) {
    return { cards, updatedCount: 0 };
  }

  const primaryOriginal =
    primaryIndex !== null && isValidIndex(primaryIndex, cards.length)
      ? cards[primaryIndex]
      : undefined;
  const delta = primaryOriginal ? diffCardFields(primaryOriginal, updatedCard) : null;

  let updatedCount = 0;

  const nextCards = cards.map((card, index) => {
    if (!normalizedTargets.has(index)) {
      return card;
    }

    // Keep bulk property updates type-safe by applying only across cards
    // matching the actively edited card type. Silently skipping used to be the
    // whole story; `describeBulkTypeSkip` now tells the user it happened.
    if (card.type !== updatedCard.type) {
      return card;
    }

    updatedCount += 1;

    const existingLayout = card._havdm_layout;
    const existingViewLayout = card.view_layout;

    // The card under the form takes the edit wholesale. So does every target
    // when we have no primary to diff against — that is the old behaviour, kept
    // only for the case where the primary is not resolvable.
    if (delta === null || index === primaryIndex) {
      return {
        ...updatedCard,
        _havdm_layout: existingLayout,
        view_layout: existingViewLayout,
      } as Card;
    }

    // `next` starts as a copy of THIS card and the delta excludes the layout
    // keys, so its own geometry is already correct — reassigning it here would
    // only risk INTRODUCING an `_havdm_layout: undefined` on a card that never
    // had one, which is the defect class `mergeFormValuesIntoCard` exists to
    // prevent (presence survives what `JSON.stringify` hides).
    const next = { ...(card as unknown as Record<string, unknown>) };
    for (const key of delta.removed) {
      delete next[key];
    }
    Object.assign(next, delta.set);

    return next as unknown as Card;
  });

  return { cards: nextCards, updatedCount };
};

export const removeCardsByIndices = (cards: Card[], indicesToRemove: number[]): Card[] => {
  const normalized = new Set(normalizeCardIndices(indicesToRemove, cards.length));
  if (normalized.size === 0) {
    return cards;
  }

  return cards.filter((_, index) => !normalized.has(index));
};
