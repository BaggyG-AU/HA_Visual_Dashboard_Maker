import { describe, it, expect } from 'vitest';
import {
  resolveViewCards,
  sectionsColumnCount,
  sectionColumnSpan,
  updateSectionCard,
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
});
