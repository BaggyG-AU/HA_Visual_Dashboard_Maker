import { describe, it, expect } from 'vitest';
import {
  resolveViewCards,
  sectionsColumnCount,
  sectionColumnSpan,
  updateSectionCard,
  addCardToSection,
  removeSectionCards,
  insertCardsIntoSection,
} from '../../src/utils/sectionsLayout';
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
});
