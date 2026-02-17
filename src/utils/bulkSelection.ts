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
    const range = Array.from({ length: end - start + 1 }, (_, offset) => start + offset)
      .filter((index) => isValidIndex(index, cardCount));

    return {
      selectedCardIndex: resolvePrimaryCardIndex(range, clickedCardIndex),
      selectedCardIndices: range,
      anchorCardIndex: anchor,
    };
  }

  if (mode === 'toggle') {
    const exists = current.includes(clickedCardIndex);
    const next = exists ? current.filter((index) => index !== clickedCardIndex) : [...current, clickedCardIndex];
    const normalized = normalizeCardIndices(next, cardCount);
    const selectedCardIndex = resolvePrimaryCardIndex(normalized, exists ? previous.selectedCardIndex : clickedCardIndex);

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

export const applyBulkCardUpdate = (
  cards: Card[],
  targetIndices: number[],
  updatedCard: Card,
): BulkUpdateResult => {
  const normalizedTargets = new Set(normalizeCardIndices(targetIndices, cards.length));
  if (normalizedTargets.size === 0) {
    return { cards, updatedCount: 0 };
  }

  let updatedCount = 0;

  const nextCards = cards.map((card, index) => {
    if (!normalizedTargets.has(index)) {
      return card;
    }

    // Keep bulk property updates type-safe by applying only across cards
    // matching the actively edited card type.
    if (card.type !== updatedCard.type) {
      return card;
    }

    updatedCount += 1;

    const existingLayout = card.layout;
    const existingViewLayout = card.view_layout;

    return {
      ...updatedCard,
      layout: existingLayout,
      view_layout: existingViewLayout,
    } as Card;
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
