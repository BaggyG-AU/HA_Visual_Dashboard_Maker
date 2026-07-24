import { describe, it, expect } from 'vitest';
import {
  resolveViewCards,
  sectionsColumnCount,
  sectionColumnSpan,
  updateSectionCard,
  addCardToSection,
  removeSectionCards,
  insertCardsIntoSection,
  moveSectionCard,
  setSectionCardGridOptions,
  sectionCardColumnSpan,
  sectionCardRowSpan,
  SECTION_GRID_COLUMNS,
} from '../../src/utils/sectionsLayout';
import { getCardSizeConstraints } from '../../src/utils/cardSizingContract';
import type { Card, View, ViewSection } from '../../src/types/dashboard';

const sectionsView = (): View =>
  ({
    title: 'Home',
    type: 'sections',
    max_columns: 3,
    sections: [
      {
        type: 'grid',
        title: 'Lights',
        column_span: 2,
        cards: [{ type: 'entity', entity: 'light.a' }],
      },
      { type: 'grid', cards: [{ type: 'markdown', content: 'x' }] },
    ],
  }) as unknown as View;

describe('sectionsLayout', () => {
  describe('resolveViewCards', () => {
    it('returns the flat view.cards when sectionIndex is null', () => {
      const view = { cards: [{ type: 'markdown', content: 'flat' }] } as unknown as View;
      expect(resolveViewCards(view, null)).toEqual([{ type: 'markdown', content: 'flat' }]);
    });

    it('returns the section cards when sectionIndex is a number', () => {
      expect(resolveViewCards(sectionsView(), 0)).toEqual([{ type: 'entity', entity: 'light.a' }]);
    });

    it('returns [] for an out-of-range section, a view without sections, or a null view', () => {
      expect(resolveViewCards(sectionsView(), 9)).toEqual([]);
      expect(resolveViewCards({ type: 'sections' } as unknown as View, 0)).toEqual([]);
      expect(resolveViewCards(null, 0)).toEqual([]);
    });
  });

  describe('sectionsColumnCount', () => {
    it('uses max_columns when set', () => {
      expect(sectionsColumnCount(sectionsView())).toBe(3);
    });

    it('defaults to 4 and clamps to >= 1', () => {
      expect(sectionsColumnCount({} as unknown as View)).toBe(4);
      expect(sectionsColumnCount({ max_columns: 0 } as unknown as View)).toBe(1);
    });
  });

  describe('sectionColumnSpan', () => {
    it('uses column_span clamped to [1, max_columns]', () => {
      const view = sectionsView();
      expect(sectionColumnSpan(view, view.sections![0] as ViewSection)).toBe(2);
    });

    it('defaults to 1 when unset', () => {
      const view = sectionsView();
      expect(sectionColumnSpan(view, view.sections![1] as ViewSection)).toBe(1);
    });

    it('clamps a span larger than max_columns down to max_columns', () => {
      const view = { max_columns: 2 } as unknown as View;
      expect(sectionColumnSpan(view, { column_span: 5 } as unknown as ViewSection)).toBe(2);
    });
  });

  describe('updateSectionCard', () => {
    it('immutably replaces one card in the right section, leaving others intact', () => {
      const view = sectionsView();
      const updated = updateSectionCard(view, 0, 0, {
        type: 'entity',
        entity: 'light.NEW',
      } as unknown as Card);

      // new view returned; original untouched
      expect(updated).not.toBe(view);
      expect(view.sections![0].cards![0]).toEqual({ type: 'entity', entity: 'light.a' });
      // target replaced
      expect((updated.sections as ViewSection[])[0].cards![0]).toEqual({
        type: 'entity',
        entity: 'light.NEW',
      });
      // sibling section untouched (reference-equal)
      expect((updated.sections as ViewSection[])[1]).toBe(view.sections![1]);
    });

    it('returns the input view unchanged for an out-of-range section or card index', () => {
      const view = sectionsView();
      const card = { type: 'markdown', content: 'z' } as unknown as Card;
      expect(updateSectionCard(view, 9, 0, card)).toBe(view);
      expect(updateSectionCard(view, 0, 9, card)).toBe(view);
    });
  });

  describe('addCardToSection', () => {
    it('appends the card to the target section, leaving siblings intact', () => {
      const view = sectionsView();
      const card = { type: 'button', entity: 'switch.new' } as unknown as Card;
      const updated = addCardToSection(view, 0, card);

      expect(updated).not.toBe(view);
      // original untouched
      expect(view.sections![0].cards).toHaveLength(1);
      // appended at the end of the target section
      const target = (updated.sections as ViewSection[])[0].cards!;
      expect(target).toHaveLength(2);
      expect(target[1]).toEqual(card);
      // sibling section untouched (reference-equal)
      expect((updated.sections as ViewSection[])[1]).toBe(view.sections![1]);
    });

    it('treats a section with no cards array as empty', () => {
      const view = {
        type: 'sections',
        sections: [{ type: 'grid', title: 'Empty' }],
      } as unknown as View;
      const card = { type: 'markdown', content: 'first' } as unknown as Card;

      expect((addCardToSection(view, 0, card).sections as ViewSection[])[0].cards).toEqual([card]);
    });

    it('returns the input view unchanged for an out-of-range section', () => {
      const view = sectionsView();
      const card = { type: 'markdown', content: 'z' } as unknown as Card;
      expect(addCardToSection(view, 9, card)).toBe(view);
      expect(addCardToSection({ type: 'sections' } as unknown as View, 0, card)).toEqual({
        type: 'sections',
      });
    });
  });

  describe('removeSectionCards', () => {
    const threeCardView = (): View =>
      ({
        type: 'sections',
        sections: [
          {
            type: 'grid',
            cards: [
              { type: 'entity', entity: 'light.a' },
              { type: 'entity', entity: 'light.b' },
              { type: 'entity', entity: 'light.c' },
            ],
          },
          { type: 'grid', cards: [{ type: 'markdown', content: 'x' }] },
        ],
      }) as unknown as View;

    it('removes the given indices from the target section', () => {
      const view = threeCardView();
      const updated = removeSectionCards(view, 0, [0, 2]);

      expect(updated).not.toBe(view);
      expect(view.sections![0].cards).toHaveLength(3); // original untouched
      expect((updated.sections as ViewSection[])[0].cards).toEqual([
        { type: 'entity', entity: 'light.b' },
      ]);
      expect((updated.sections as ViewSection[])[1]).toBe(view.sections![1]);
    });

    it('ignores out-of-range and duplicate indices', () => {
      const view = threeCardView();
      const updated = removeSectionCards(view, 0, [1, 1, 99, -1]);
      expect((updated.sections as ViewSection[])[0].cards).toEqual([
        { type: 'entity', entity: 'light.a' },
        { type: 'entity', entity: 'light.c' },
      ]);
    });

    it('can empty a section entirely', () => {
      const view = threeCardView();
      expect((removeSectionCards(view, 0, [0, 1, 2]).sections as ViewSection[])[0].cards).toEqual(
        [],
      );
    });

    it('returns the input view unchanged for an out-of-range section or a no-op index list', () => {
      const view = threeCardView();
      expect(removeSectionCards(view, 9, [0])).toBe(view);
      expect(removeSectionCards(view, 0, [])).toBe(view);
      expect(removeSectionCards(view, 0, [99])).toBe(view);
    });
  });

  describe('insertCardsIntoSection', () => {
    it('appends every card, in order, to the target section', () => {
      const view = sectionsView();
      const cards = [
        { type: 'markdown', content: 'one' },
        { type: 'markdown', content: 'two' },
      ] as unknown as Card[];
      const updated = insertCardsIntoSection(view, 1, cards);

      expect(updated).not.toBe(view);
      expect((updated.sections as ViewSection[])[1].cards).toEqual([
        { type: 'markdown', content: 'x' },
        { type: 'markdown', content: 'one' },
        { type: 'markdown', content: 'two' },
      ]);
      // sibling section untouched (reference-equal)
      expect((updated.sections as ViewSection[])[0]).toBe(view.sections![0]);
    });

    it('returns the input view unchanged for an out-of-range section or an empty card list', () => {
      const view = sectionsView();
      expect(insertCardsIntoSection(view, 9, [{ type: 'markdown' } as unknown as Card])).toBe(view);
      expect(insertCardsIntoSection(view, 0, [])).toBe(view);
    });
  });

  describe('moveSectionCard', () => {
    const twoSectionView = (): View =>
      ({
        type: 'sections',
        sections: [
          {
            type: 'grid',
            cards: [
              { type: 'entity', entity: 'a' },
              { type: 'entity', entity: 'b' },
              { type: 'entity', entity: 'c' },
            ],
          },
          { type: 'grid', cards: [{ type: 'markdown', content: 'x' }] },
        ],
      }) as unknown as View;

    it('reorders WITHIN a section (move first card to the end)', () => {
      const view = twoSectionView();
      const updated = moveSectionCard(
        view,
        { sectionIndex: 0, cardIndex: 0 },
        { sectionIndex: 0, cardIndex: 2 },
      );

      expect(updated).not.toBe(view);
      expect(view.sections![0].cards).toHaveLength(3); // original untouched
      expect((updated.sections as ViewSection[])[0].cards).toEqual([
        { type: 'entity', entity: 'b' },
        { type: 'entity', entity: 'c' },
        { type: 'entity', entity: 'a' },
      ]);
      // sibling section untouched (reference-equal)
      expect((updated.sections as ViewSection[])[1]).toBe(view.sections![1]);
    });

    it('reorders WITHIN a section (move last card before the first)', () => {
      const view = twoSectionView();
      const updated = moveSectionCard(
        view,
        { sectionIndex: 0, cardIndex: 2 },
        { sectionIndex: 0, cardIndex: 0 },
      );
      expect((updated.sections as ViewSection[])[0].cards).toEqual([
        { type: 'entity', entity: 'c' },
        { type: 'entity', entity: 'a' },
        { type: 'entity', entity: 'b' },
      ]);
    });

    it('moves a card BETWEEN sections, inserting at the target index', () => {
      const view = twoSectionView();
      const updated = moveSectionCard(
        view,
        { sectionIndex: 0, cardIndex: 1 },
        { sectionIndex: 1, cardIndex: 0 },
      );

      expect((updated.sections as ViewSection[])[0].cards).toEqual([
        { type: 'entity', entity: 'a' },
        { type: 'entity', entity: 'c' },
      ]);
      expect((updated.sections as ViewSection[])[1].cards).toEqual([
        { type: 'entity', entity: 'b' },
        { type: 'markdown', content: 'x' },
      ]);
    });

    it('moves a card BETWEEN sections, appending when the target index is past the end', () => {
      const view = twoSectionView();
      const updated = moveSectionCard(
        view,
        { sectionIndex: 0, cardIndex: 0 },
        { sectionIndex: 1, cardIndex: 99 },
      );
      expect((updated.sections as ViewSection[])[1].cards).toEqual([
        { type: 'markdown', content: 'x' },
        { type: 'entity', entity: 'a' },
      ]);
    });

    it('returns the input view unchanged for a no-op (same position) or out-of-range source', () => {
      const view = twoSectionView();
      expect(
        moveSectionCard(view, { sectionIndex: 0, cardIndex: 1 }, { sectionIndex: 0, cardIndex: 1 }),
      ).toBe(view);
      expect(
        moveSectionCard(view, { sectionIndex: 9, cardIndex: 0 }, { sectionIndex: 0, cardIndex: 0 }),
      ).toBe(view);
      expect(
        moveSectionCard(view, { sectionIndex: 0, cardIndex: 9 }, { sectionIndex: 1, cardIndex: 0 }),
      ).toBe(view);
      expect(
        moveSectionCard(view, { sectionIndex: 0, cardIndex: 0 }, { sectionIndex: 9, cardIndex: 0 }),
      ).toBe(view);
    });
  });

  describe('sectionCardColumnSpan', () => {
    it('defaults a card with no grid_options to a full-width span (SECTION_GRID_COLUMNS)', () => {
      expect(SECTION_GRID_COLUMNS).toBe(12);
      expect(sectionCardColumnSpan({ type: 'markdown' } as unknown as Card)).toBe(12);
    });

    it("treats grid_options.columns === 'full' as a full-width span", () => {
      expect(
        sectionCardColumnSpan({ type: 'x', grid_options: { columns: 'full' } } as unknown as Card),
      ).toBe(12);
    });

    it('uses a numeric grid_options.columns clamped to [1, 12]', () => {
      expect(
        sectionCardColumnSpan({ type: 'x', grid_options: { columns: 6 } } as unknown as Card),
      ).toBe(6);
      expect(
        sectionCardColumnSpan({ type: 'x', grid_options: { columns: 0 } } as unknown as Card),
      ).toBe(1);
      expect(
        sectionCardColumnSpan({ type: 'x', grid_options: { columns: 99 } } as unknown as Card),
      ).toBe(12);
    });
  });

  describe('sectionCardRowSpan', () => {
    it('uses a numeric grid_options.rows, clamped to >= 1', () => {
      expect(sectionCardRowSpan({ type: 'x', grid_options: { rows: 3 } } as unknown as Card)).toBe(
        3,
      );
      expect(sectionCardRowSpan({ type: 'x', grid_options: { rows: 0 } } as unknown as Card)).toBe(
        1,
      );
      expect(
        sectionCardRowSpan({ type: 'x', grid_options: { rows: 2.9 } } as unknown as Card),
      ).toBe(2);
    });

    it('falls back to the content-height estimate (getCardSizeConstraints.h) when rows is absent', () => {
      const card = { type: 'markdown', content: 'a\nb\nc\nd\ne' } as unknown as Card;
      expect(sectionCardRowSpan(card)).toBe(getCardSizeConstraints(card).h);
    });

    it("falls back to the estimate when rows is 'auto' or non-numeric", () => {
      const card = {
        type: 'entities',
        entities: ['a', 'b'],
        grid_options: { rows: 'auto' },
      } as unknown as Card;
      expect(sectionCardRowSpan(card)).toBe(getCardSizeConstraints(card).h);
    });

    it('always returns at least 1', () => {
      expect(sectionCardRowSpan({ type: 'markdown' } as unknown as Card)).toBeGreaterThanOrEqual(1);
    });
  });

  describe('setSectionCardGridOptions', () => {
    const view = (): View =>
      ({
        type: 'sections',
        sections: [
          {
            type: 'grid',
            cards: [
              { type: 'entity', entity: 'a' },
              { type: 'entity', entity: 'b' },
            ],
          },
          { type: 'grid', cards: [{ type: 'markdown', content: 'x' }] },
        ],
      }) as unknown as View;

    it('merges grid_options onto the target card immutably, leaving siblings intact', () => {
      const v = view();
      const updated = setSectionCardGridOptions(v, 0, 1, { columns: 6 });

      expect(updated).not.toBe(v);
      expect(v.sections![0].cards![1]).toEqual({ type: 'entity', entity: 'b' }); // original untouched
      const target = (updated.sections as ViewSection[])[0].cards![1] as Record<string, unknown>;
      expect(target.grid_options).toEqual({ columns: 6 });
      expect(target.type).toBe('entity');
      // sibling section + sibling card untouched (reference-equal)
      expect((updated.sections as ViewSection[])[1]).toBe(v.sections![1]);
      expect((updated.sections as ViewSection[])[0].cards![0]).toBe(v.sections![0].cards![0]);
    });

    it('merges into an existing grid_options rather than replacing it', () => {
      const v = {
        type: 'sections',
        sections: [{ type: 'grid', cards: [{ type: 'x', grid_options: { columns: 4, rows: 2 } }] }],
      } as unknown as View;
      const updated = setSectionCardGridOptions(v, 0, 0, { rows: 5 });
      expect(
        ((updated.sections as ViewSection[])[0].cards![0] as Record<string, unknown>).grid_options,
      ).toEqual({ columns: 4, rows: 5 });
    });

    it('returns the input view unchanged for an out-of-range section or card', () => {
      const v = view();
      expect(setSectionCardGridOptions(v, 9, 0, { columns: 3 })).toBe(v);
      expect(setSectionCardGridOptions(v, 0, 9, { columns: 3 })).toBe(v);
    });
  });
});
