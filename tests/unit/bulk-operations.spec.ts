import { beforeEach, describe, expect, it } from 'vitest';
import { useDashboardStore } from '../../src/store/dashboardStore';
import type { Card, DashboardConfig } from '../../src/types/dashboard';
import {
  applyBulkCardUpdate,
  removeCardsByIndices,
  resolveOperationSelection,
  resolveSelectionState,
} from '../../src/utils/bulkSelection';

const baseCards: Card[] = [
  { type: 'button', name: 'A', layout: { x: 0, y: 0, w: 3, h: 2 } },
  { type: 'button', name: 'B', layout: { x: 3, y: 0, w: 3, h: 2 } },
  { type: 'markdown', content: 'C', layout: { x: 6, y: 0, w: 3, h: 2 } },
];

const baseConfig: DashboardConfig = {
  title: 'Bulk Test',
  views: [{ title: 'Main', path: 'main', cards: baseCards } as DashboardConfig['views'][number]],
};

const resetStore = () => {
  useDashboardStore.setState({
    config: null,
    filePath: null,
    isLoading: false,
    error: null,
    isDirty: false,
    selectedViewIndex: null,
    selectedCardIndex: null,
    selectedCardIndices: [],
    selectionAnchorCardIndex: null,
    isBatching: false,
    past: [],
    future: [],
  });
};

describe('bulk selection utilities', () => {
  it('resolves replace, toggle, and range selection deterministically', () => {
    const replaced = resolveSelectionState({
      previous: { selectedCardIndex: null, selectedCardIndices: [], anchorCardIndex: null },
      clickedCardIndex: 1,
      mode: 'replace',
      cardCount: 5,
    });
    expect(replaced.selectedCardIndices).toEqual([1]);

    const toggled = resolveSelectionState({
      previous: replaced,
      clickedCardIndex: 3,
      mode: 'toggle',
      cardCount: 5,
    });
    expect(toggled.selectedCardIndices).toEqual([1, 3]);
    expect(toggled.selectedCardIndex).toBe(3);

    const ranged = resolveSelectionState({
      previous: toggled,
      clickedCardIndex: 4,
      mode: 'range',
      cardCount: 5,
    });
    expect(ranged.selectedCardIndices).toEqual([3, 4]);
    expect(ranged.selectedCardIndex).toBe(4);
  });

  it('resolves operation targets with fallback to primary selection', () => {
    expect(resolveOperationSelection(2, [], 4)).toEqual([2]);
    expect(resolveOperationSelection(null, [0, 2], 4)).toEqual([0, 2]);
    expect(resolveOperationSelection(10, [1, 8], 3)).toEqual([1]);
  });

  it('applies bulk updates only to selected cards of the same type', () => {
    const updatedCard: Card = { type: 'button', name: 'Renamed' };
    const result = applyBulkCardUpdate(baseCards, [0, 1, 2], updatedCard);

    expect(result.updatedCount).toBe(2);
    expect((result.cards[0] as Card & { name?: string }).name).toBe('Renamed');
    expect((result.cards[1] as Card & { name?: string }).name).toBe('Renamed');
    expect(result.cards[2].type).toBe('markdown');
    expect(result.cards[0].layout).toEqual(baseCards[0].layout);
  });

  it('removes cards by normalized indices', () => {
    const next = removeCardsByIndices(baseCards, [2, 0, 2]);
    expect(next).toHaveLength(1);
    expect((next[0] as Card & { name?: string }).name).toBe('B');
  });
});

describe('dashboard store bulk selection state', () => {
  beforeEach(() => {
    resetStore();
    useDashboardStore.setState({ config: baseConfig });
  });

  it('tracks multi-select in store with mode transitions', () => {
    const state = useDashboardStore.getState();

    state.selectCardWithMode(0, 0, 'replace', 3);
    state.selectCardWithMode(0, 2, 'toggle', 3);

    let after = useDashboardStore.getState();
    expect(after.selectedCardIndices).toEqual([0, 2]);
    expect(after.selectedCardIndex).toBe(2);

    state.selectCardWithMode(0, 1, 'range', 3);
    after = useDashboardStore.getState();
    expect(after.selectedCardIndices).toEqual([1, 2]);
    expect(after.selectedCardIndex).toBe(1);
  });

  it('keeps batched history granularity to one undo entry for bulk update path', () => {
    const state = useDashboardStore.getState();
    state.beginBatchUpdate();

    const view = (baseConfig.views[0] as DashboardConfig['views'][number]);
    state.applyBatchedConfig({
      ...baseConfig,
      views: [{ ...view, cards: [...(view.cards ?? []), { type: 'button', name: 'New' }] } as DashboardConfig['views'][number]],
    });
    state.applyBatchedConfig({
      ...baseConfig,
      views: [{ ...view, cards: [...(view.cards ?? []), { type: 'button', name: 'Newer' }] } as DashboardConfig['views'][number]],
    });
    state.endBatchUpdate();

    const after = useDashboardStore.getState();
    expect(after.past).toHaveLength(1);

    after.undo();
    expect(useDashboardStore.getState().future).toHaveLength(1);
  });
});
