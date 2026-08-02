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
  { type: 'button', name: 'A', _havdm_layout: { x: 0, y: 0, w: 3, h: 2 } },
  { type: 'button', name: 'B', _havdm_layout: { x: 3, y: 0, w: 3, h: 2 } },
  { type: 'markdown', content: 'C', _havdm_layout: { x: 6, y: 0, w: 3, h: 2 } },
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
    const result = applyBulkCardUpdate(baseCards, [0, 1, 2], updatedCard, 0);

    expect(result.updatedCount).toBe(2);
    expect((result.cards[0] as Card & { name?: string }).name).toBe('Renamed');
    expect((result.cards[1] as Card & { name?: string }).name).toBe('Renamed');
    expect(result.cards[2].type).toBe('markdown');
    expect(result.cards[0]._havdm_layout).toEqual(baseCards[0]._havdm_layout);
  });

  // ⚠⚠⚠ THE CLIP-04 REGRESSION GUARD. `applyBulkCardUpdate` used to return
  // `{...updatedCard}` for every target, which does not apply the edited
  // PROPERTY — it replaces each selected card with a wholesale CLONE of the
  // edited one. Measured on `37e9dc8`: three buttons with distinct entity/name/
  // icon, edit the name only, and all three ended up on the last-clicked card's
  // entity AND icon. One field changed, four values destroyed.
  //
  // ⭐ Note the fixture: the cards DIFFER on the axis the code must preserve.
  // Both pre-existing bulk specs used identical blank cards, which is exactly
  // why neither could ever have caught this.
  it('applies ONLY the changed fields to the other selected cards', () => {
    const distinctCards: Card[] = [
      { type: 'button', entity: 'sensor.alpha', name: 'Alpha', icon: 'mdi:alpha' },
      { type: 'button', entity: 'sensor.beta', name: 'Beta', icon: 'mdi:beta' },
      { type: 'button', entity: 'sensor.gamma', name: 'Gamma', icon: 'mdi:gamma' },
    ] as Card[];

    // The user is looking at card 2 and changes ONLY its name.
    const edited: Card = {
      type: 'button',
      entity: 'sensor.gamma',
      name: 'CLONED',
      icon: 'mdi:gamma',
    } as Card;
    const result = applyBulkCardUpdate(distinctCards, [0, 1, 2], edited, 2);

    expect(result.updatedCount).toBe(3);

    // The edit lands everywhere...
    expect(result.cards.map((c) => (c as Card & { name?: string }).name)).toEqual([
      'CLONED',
      'CLONED',
      'CLONED',
    ]);

    // ...and nothing else moves.
    expect(result.cards.map((c) => (c as Card & { entity?: string }).entity)).toEqual([
      'sensor.alpha',
      'sensor.beta',
      'sensor.gamma',
    ]);
    expect(result.cards.map((c) => (c as Card & { icon?: string }).icon)).toEqual([
      'mdi:alpha',
      'mdi:beta',
      'mdi:gamma',
    ]);
  });

  it('keeps each non-primary card its own layout, never the edited card’s', () => {
    const edited: Card = { type: 'button', name: 'Renamed' };
    const result = applyBulkCardUpdate(baseCards, [0, 1], edited, 0);

    expect(result.cards[1]._havdm_layout).toEqual(baseCards[1]._havdm_layout);
    expect(result.cards[1]._havdm_layout).not.toEqual(baseCards[0]._havdm_layout);
  });

  it('propagates a field the user CLEARED, and does not invent layout keys', () => {
    const withIcons: Card[] = [
      { type: 'button', name: 'A', icon: 'mdi:a' },
      { type: 'button', name: 'B', icon: 'mdi:b' },
    ] as Card[];

    // Card 0 edited so that `icon` is gone entirely.
    const edited: Card = { type: 'button', name: 'A' } as Card;
    const result = applyBulkCardUpdate(withIcons, [0, 1], edited, 0);

    expect('icon' in result.cards[1]).toBe(false);
    expect((result.cards[1] as Card & { name?: string }).name).toBe('B');
    // These cards never had geometry; the bulk write must not introduce it.
    expect('_havdm_layout' in result.cards[1]).toBe(false);
  });

  it('falls back to the whole-card write when there is no resolvable primary', () => {
    const updatedCard: Card = { type: 'button', name: 'Renamed' };
    const result = applyBulkCardUpdate(baseCards, [0, 1], updatedCard, null);

    expect(result.updatedCount).toBe(2);
    expect((result.cards[1] as Card & { name?: string }).name).toBe('Renamed');
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

    const view = baseConfig.views[0] as DashboardConfig['views'][number];
    state.applyBatchedConfig({
      ...baseConfig,
      views: [
        {
          ...view,
          cards: [...(view.cards ?? []), { type: 'button', name: 'New' }],
        } as DashboardConfig['views'][number],
      ],
    });
    state.applyBatchedConfig({
      ...baseConfig,
      views: [
        {
          ...view,
          cards: [...(view.cards ?? []), { type: 'button', name: 'Newer' }],
        } as DashboardConfig['views'][number],
      ],
    });
    state.endBatchUpdate();

    const after = useDashboardStore.getState();
    expect(after.past).toHaveLength(1);

    after.undo();
    expect(useDashboardStore.getState().future).toHaveLength(1);
  });
});
