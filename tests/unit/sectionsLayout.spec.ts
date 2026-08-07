import { describe, it, expect } from 'vitest';
import {
  resolveViewCards,
  sectionsColumnCount,
  sectionColumnSpan,
  updateSectionCard,
  addCardToSection,
  insertCardIntoSectionAt,
  resolveTargetSectionIndex,
  removeSectionCards,
  insertCardsIntoSection,
  moveSectionCard,
  setSectionCardGridOptions,
  sectionCardColumnSpan,
  sectionCardRowSpan,
  SECTION_GRID_COLUMNS,
  addSection,
  removeSection,
  moveSection,
  setSectionTitle,
  setViewMaxColumns,
  convertViewToSections,
  buildSectionsView,
  flattenSectionsView,
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

  /**
   * F5 leg U1 — `insertCardIntoSectionAt`.
   *
   * ⭐ RED-BEFORE-GREEN BY HISTORICAL BEHAVIOUR, SAME CHECKOUT. This helper is a
   * new export, but that is NOT why it would resist a red leg — a real
   * discriminating one exists and was run. The production module could only
   * APPEND before F5 (`addCardToSection`), and that append IS the pre-F5
   * palette-add semantics. So the red leg is: expose `insertCardIntoSectionAt`
   * delegating to `addCardToSection`, run these cases, and watch the insert-at-0
   * and insert-in-the-middle cases fail ON BEHAVIOUR — the module imports
   * cleanly and the assertion is about WHERE the card went, not about a missing
   * symbol. The observed failure is recorded in the implementation PR.
   */
  describe('insertCardIntoSectionAt (F5)', () => {
    const newCard = () => ({ type: 'button', entity: 'switch.new' }) as unknown as Card;

    it('inserts at index 0, pushing the existing cards down', () => {
      const view = sectionsView();
      const card = newCard();
      const updated = insertCardIntoSectionAt(view, 0, 0, card);

      const target = (updated.sections as ViewSection[])[0].cards!;
      expect(target).toHaveLength(2);
      expect(target[0]).toEqual(card);
      expect(target[1]).toEqual(view.sections![0].cards![0]);
    });

    it('inserts in the middle, taking that slot', () => {
      const view = {
        type: 'sections',
        sections: [
          {
            type: 'grid',
            cards: [
              { type: 'markdown', content: 'a' },
              { type: 'markdown', content: 'b' },
              { type: 'markdown', content: 'c' },
            ],
          },
        ],
      } as unknown as View;
      const card = newCard();

      const target = (insertCardIntoSectionAt(view, 0, 1, card).sections as ViewSection[])[0]
        .cards!;
      expect(
        target.map((c) => (c as { content?: string; type: string }).content ?? c.type),
      ).toEqual(['a', 'button', 'b', 'c']);
    });

    it('appends when the index equals the card count', () => {
      const view = sectionsView();
      const card = newCard();
      const existing = view.sections![0].cards!.length;

      const target = (insertCardIntoSectionAt(view, 0, existing, card).sections as ViewSection[])[0]
        .cards!;
      expect(target).toHaveLength(existing + 1);
      expect(target[existing]).toEqual(card);
    });

    it('clamps an index below 0 and above the card count', () => {
      const view = sectionsView();
      const existing = view.sections![0].cards!.length;

      const low = (insertCardIntoSectionAt(view, 0, -5, newCard()).sections as ViewSection[])[0]
        .cards!;
      expect(low[0]).toEqual(newCard());

      const high = (insertCardIntoSectionAt(view, 0, 99, newCard()).sections as ViewSection[])[0]
        .cards!;
      expect(high[existing]).toEqual(newCard());
      expect(high).toHaveLength(existing + 1);
    });

    it('appends for a non-finite index rather than dropping the card', () => {
      const view = sectionsView();
      const existing = view.sections![0].cards!.length;
      const target = (insertCardIntoSectionAt(view, 0, NaN, newCard()).sections as ViewSection[])[0]
        .cards!;
      expect(target).toHaveLength(existing + 1);
      expect(target[existing]).toEqual(newCard());
    });

    it('returns the input view reference-equal for an out-of-range section', () => {
      const view = sectionsView();
      expect(insertCardIntoSectionAt(view, 9, 0, newCard())).toBe(view);
      expect(
        insertCardIntoSectionAt({ type: 'sections' } as unknown as View, 0, 0, newCard()),
      ).toEqual({ type: 'sections' });
    });

    it('does not mutate the source view, and leaves sibling sections reference-equal', () => {
      const view = sectionsView();
      const before = view.sections![0].cards!.length;

      const updated = insertCardIntoSectionAt(view, 0, 0, newCard());

      expect(updated).not.toBe(view);
      expect(view.sections![0].cards).toHaveLength(before);
      expect((updated.sections as ViewSection[])[1]).toBe(view.sections![1]);
    });
  });

  /**
   * F5 leg U2 — `resolveTargetSectionIndex`.
   *
   * ⚠ NO VALID RED LEG EXISTS, and the reason is NOT that the export is new.
   * This is a BEHAVIOUR-PRESERVING EXTRACTION of the decision `handleCardAdd`
   * already made inline, so there is no behaviour change for a red leg to
   * refute: any historical-behaviour stand-in would be the same function, and
   * the test would pass before and after.
   *
   * ALTERNATIVE EVIDENCE, per OPERATING_AGREEMENT.md §2: control leg C1 (the
   * double-click path that already worked still lands in the same section, on
   * base AND on the branch), plus e2e legs L8 and L9, which exercise this
   * resolver through the production path where its result becomes VISIBLE.
   */
  describe('resolveTargetSectionIndex (F5)', () => {
    it('returns null when the view has no sections', () => {
      expect(
        resolveTargetSectionIndex({ type: 'sections', sections: [] } as unknown as View, 0),
      ).toBeNull();
      expect(resolveTargetSectionIndex({ type: 'sections' } as unknown as View, null)).toBeNull();
      expect(resolveTargetSectionIndex(null, 2)).toBeNull();
      expect(resolveTargetSectionIndex(undefined, 2)).toBeNull();
    });

    it('returns the selected index when it addresses an existing section', () => {
      expect(resolveTargetSectionIndex(sectionsView(), 1)).toBe(1);
      expect(resolveTargetSectionIndex(sectionsView(), 0)).toBe(0);
    });

    it('falls back to 0 for a null selection', () => {
      expect(resolveTargetSectionIndex(sectionsView(), null)).toBe(0);
    });

    it('falls back to 0 for a selection past the end', () => {
      expect(resolveTargetSectionIndex(sectionsView(), 9)).toBe(0);
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

  // --- Tier 4 slice 4.4: SECTION-level authoring -----------------------------

  describe('addSection', () => {
    it('appends a new empty grid section by default, immutably', () => {
      const v = sectionsView();
      const updated = addSection(v);

      expect(updated).not.toBe(v);
      expect(v.sections).toHaveLength(2); // original untouched
      const next = updated.sections as ViewSection[];
      expect(next).toHaveLength(3);
      expect(next[2]).toEqual({ type: 'grid', cards: [] });
      // existing sections carried reference-equal
      expect(next[0]).toBe(v.sections![0]);
      expect(next[1]).toBe(v.sections![1]);
    });

    it('inserts at a given index, clamped to [0, length]', () => {
      const v = sectionsView();
      const atFront = addSection(v, 0);
      expect((atFront.sections as ViewSection[])[0]).toEqual({ type: 'grid', cards: [] });
      expect((atFront.sections as ViewSection[])[1]).toBe(v.sections![0]);

      const atNegative = addSection(v, -5);
      expect((atNegative.sections as ViewSection[])[0]).toEqual({ type: 'grid', cards: [] });

      const past = addSection(v, 99);
      expect((past.sections as ViewSection[])[2]).toEqual({ type: 'grid', cards: [] });
    });

    it('creates the sections array when the view has none', () => {
      const v = { type: 'sections' } as unknown as View;
      const updated = addSection(v);
      expect(updated.sections).toEqual([{ type: 'grid', cards: [] }]);
    });
  });

  describe('removeSection', () => {
    it('removes the section at the index, leaving siblings intact', () => {
      const v = sectionsView();
      const updated = removeSection(v, 0);

      expect(updated).not.toBe(v);
      expect(v.sections).toHaveLength(2); // original untouched
      const next = updated.sections as ViewSection[];
      expect(next).toHaveLength(1);
      expect(next[0]).toBe(v.sections![1]); // remaining section reference-equal
    });

    it('returns the input view unchanged for an out-of-range section', () => {
      const v = sectionsView();
      expect(removeSection(v, 9)).toBe(v);
      expect(removeSection(v, -1)).toBe(v);
    });

    it('can remove the last remaining section (empty sections array)', () => {
      const v = { type: 'sections', sections: [{ type: 'grid', cards: [] }] } as unknown as View;
      expect(removeSection(v, 0).sections as ViewSection[]).toEqual([]);
    });
  });

  describe('moveSection', () => {
    it('reorders sections (move first to the end), immutably', () => {
      const v = sectionsView();
      const updated = moveSection(v, 0, 1);

      expect(updated).not.toBe(v);
      const next = updated.sections as ViewSection[];
      expect(next[0]).toBe(v.sections![1]);
      expect(next[1]).toBe(v.sections![0]);
    });

    it('clamps the target index and appends when past the end', () => {
      const v = sectionsView();
      const next = moveSection(v, 0, 99).sections as ViewSection[];
      expect(next[1]).toBe(v.sections![0]);
    });

    it('returns the input view unchanged for a no-op or out-of-range source', () => {
      const v = sectionsView();
      expect(moveSection(v, 1, 1)).toBe(v);
      expect(moveSection(v, 9, 0)).toBe(v);
    });
  });

  describe('setSectionTitle', () => {
    it('sets a section title immutably, leaving siblings intact', () => {
      const v = sectionsView();
      const updated = setSectionTitle(v, 1, 'Climate');

      expect(updated).not.toBe(v);
      expect((updated.sections as ViewSection[])[1].title).toBe('Climate');
      expect((updated.sections as ViewSection[])[0]).toBe(v.sections![0]); // sibling ref-equal
      expect(v.sections![1].title).toBeUndefined(); // original untouched
    });

    it('removes the title key when set to an empty string', () => {
      const v = sectionsView(); // section 0 title = 'Lights'
      const updated = setSectionTitle(v, 0, '');
      expect('title' in (updated.sections as ViewSection[])[0]).toBe(false);
    });

    it('returns the input view unchanged for a no-op or out-of-range section', () => {
      const v = sectionsView();
      expect(setSectionTitle(v, 0, 'Lights')).toBe(v); // same title
      expect(setSectionTitle(v, 1, '')).toBe(v); // already untitled -> empty is a no-op
      expect(setSectionTitle(v, 9, 'x')).toBe(v);
    });
  });

  describe('setViewMaxColumns', () => {
    it('sets max_columns immutably, clamped to >= 1', () => {
      const v = sectionsView(); // max_columns 3
      const updated = setViewMaxColumns(v, 5);

      expect(updated).not.toBe(v);
      expect(updated.max_columns).toBe(5);
      expect(v.max_columns).toBe(3); // original untouched
      expect(setViewMaxColumns(v, 0).max_columns).toBe(1);
      expect(setViewMaxColumns(v, -2).max_columns).toBe(1);
    });

    it('preserves the sections array reference when only max_columns changes', () => {
      const v = sectionsView();
      expect(setViewMaxColumns(v, 6).sections).toBe(v.sections);
    });

    it('returns the input view unchanged for a no-op', () => {
      const v = sectionsView();
      expect(setViewMaxColumns(v, 3)).toBe(v); // already 3
    });
  });

  // --- Tier 4 slice 4.5: view-type authoring (create/convert to sections) -----

  describe('buildSectionsView', () => {
    it('builds a blank sections view with one empty grid section and default max_columns', () => {
      const v = buildSectionsView();
      expect(v.type).toBe('sections');
      expect(v.max_columns).toBe(4);
      expect(v.sections).toEqual([{ type: 'grid', cards: [] }]);
      expect(v.title).toBe('Home');
      expect(v.path).toBe('home');
    });

    it('honours a supplied title and path', () => {
      const v = buildSectionsView({ title: 'Kitchen', path: 'kitchen' });
      expect(v.title).toBe('Kitchen');
      expect(v.path).toBe('kitchen');
    });
  });

  describe('convertViewToSections', () => {
    it('migrates flat cards into one starter grid section, preserving them', () => {
      const view = {
        title: 'Home',
        path: 'home',
        type: 'custom:grid-layout',
        layout: { grid_template_columns: 'repeat(12, 1fr)' },
        cards: [
          { type: 'markdown', content: 'a' },
          { type: 'button', entity: 'light.x' },
        ],
      } as unknown as View;
      const next = convertViewToSections(view);

      expect(next).not.toBe(view);
      expect(next.type).toBe('sections');
      expect(next.cards).toEqual([]); // flat cards emptied (sections is now canonical)
      const sections = next.sections as ViewSection[];
      expect(sections).toHaveLength(1);
      expect(sections[0].type).toBe('grid');
      expect(sections[0].cards).toEqual([
        { type: 'markdown', content: 'a' },
        { type: 'button', entity: 'light.x' },
      ]);
      // original untouched
      expect(view.type).toBe('custom:grid-layout');
      expect(view.cards).toHaveLength(2);
    });

    it('drops the internal custom:grid-layout scaffold (layout/layout_type) and defaults max_columns', () => {
      const view = {
        type: 'masonry',
        layout: { grid_template_columns: 'x' },
        layout_type: 'grid',
        cards: [],
      } as unknown as View;
      const next = convertViewToSections(view);
      expect('layout' in next).toBe(false);
      expect('layout_type' in next).toBe(false);
      expect(next.max_columns).toBe(4);
    });

    it('preserves an existing max_columns', () => {
      const view = { type: 'masonry', max_columns: 3, cards: [] } as unknown as View;
      expect(convertViewToSections(view).max_columns).toBe(3);
    });

    it('is a no-op (reference-equal) when the view is already a sections view', () => {
      const view = {
        type: 'sections',
        sections: [{ type: 'grid', cards: [] }],
      } as unknown as View;
      expect(convertViewToSections(view)).toBe(view);
    });

    it('treats a view with no cards array as an empty starter section', () => {
      const view = { type: 'masonry' } as unknown as View;
      const sections = convertViewToSections(view).sections as ViewSection[];
      expect(sections[0].cards).toEqual([]);
    });
  });

  // Slice 4.6b: the inverse of convertViewToSections — flatten a sections view
  // back to a flat view. Cards are PRESERVED; section headings are preserved as
  // markdown cards (user chose "never silently destroy user data").
  describe('flattenSectionsView', () => {
    it("concatenates every section's cards into flat view.cards (preserved, in order)", () => {
      const view = {
        title: 'Home',
        type: 'sections',
        max_columns: 3,
        sections: [
          { type: 'grid', cards: [{ type: 'button', entity: 'light.a' }] },
          { type: 'grid', cards: [{ type: 'button', entity: 'light.b' }] },
        ],
      } as unknown as View;
      const next = flattenSectionsView(view);
      expect(next.cards).toEqual([
        { type: 'button', entity: 'light.a' },
        { type: 'button', entity: 'light.b' },
      ]);
    });

    it('preserves each section heading as a "## Title" markdown card prepended to that section', () => {
      const view = {
        type: 'sections',
        sections: [
          { type: 'grid', title: 'Lights', cards: [{ type: 'button', entity: 'light.a' }] },
          { type: 'grid', cards: [{ type: 'button', entity: 'light.b' }] },
        ],
      } as unknown as View;
      const cards = flattenSectionsView(view).cards as Array<Record<string, unknown>>;
      expect(cards[0]).toEqual({ type: 'markdown', content: '## Lights' });
      expect(cards[1]).toEqual({ type: 'button', entity: 'light.a' });
      expect(cards[2]).toEqual({ type: 'button', entity: 'light.b' });
    });

    it('sets the target type (default masonry) and drops sections/max_columns', () => {
      const view = {
        type: 'sections',
        max_columns: 4,
        dense_section_placement: true,
        sections: [{ type: 'grid', cards: [] }],
      } as unknown as View;
      const asMasonry = flattenSectionsView(view);
      expect(asMasonry.type).toBe('masonry');
      expect(asMasonry).not.toHaveProperty('sections');
      expect(asMasonry).not.toHaveProperty('max_columns');
      expect(asMasonry).not.toHaveProperty('dense_section_placement');
      expect(flattenSectionsView(view, 'panel').type).toBe('panel');
    });

    it('carries the view identity props through (title/path/icon/panel)', () => {
      const view = {
        title: 'Home',
        path: 'home',
        icon: 'mdi:home',
        panel: true,
        type: 'sections',
        sections: [{ type: 'grid', cards: [] }],
      } as unknown as View;
      const next = flattenSectionsView(view);
      expect(next.title).toBe('Home');
      expect(next.path).toBe('home');
      expect(next.icon).toBe('mdi:home');
      expect(next.panel).toBe(true);
    });

    it('is a reference-equal no-op for a non-sections view', () => {
      const view = { type: 'masonry', cards: [] } as unknown as View;
      expect(flattenSectionsView(view)).toBe(view);
    });
  });
});
