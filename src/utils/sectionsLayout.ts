import type { Card, View, ViewSection } from '../types/dashboard';

/**
 * Pure helpers for rendering + editing Home Assistant "sections" views on the
 * canvas (Tier 4, slice 4.1+4.2). A sections view keeps its cards under
 * `view.sections[i].cards`, not the flat `view.cards`. These functions
 * centralise the `(sectionIndex, cardIndex)` addressing so App/GridCanvas stay
 * thin, and are directly unit-testable (the canvas wiring is covered by e2e).
 */

/**
 * Resolve the target cards array for a selection. `sectionIndex === null`
 * selects the flat `view.cards` (existing behaviour for every non-sections
 * view); a number selects that section's cards. Always returns an array.
 */
export const resolveViewCards = (
  view: View | undefined | null,
  sectionIndex: number | null,
): Card[] => {
  if (!view) return [];
  if (sectionIndex === null) return view.cards ?? [];
  return view.sections?.[sectionIndex]?.cards ?? [];
};

/**
 * Column count for a sections view's grid. HA lays sections out in up to
 * `max_columns` columns (default 4 upstream). Clamped to >= 1.
 */
export const sectionsColumnCount = (view: View | undefined | null): number => {
  const raw = view?.max_columns;
  const n = typeof raw === 'number' && Number.isFinite(raw) ? Math.floor(raw) : 4;
  return Math.max(1, n);
};

/**
 * How many grid columns a section spans. HA's `column_span` defaults to 1 and
 * cannot exceed the view's `max_columns`; clamped to [1, max_columns].
 */
export const sectionColumnSpan = (
  view: View | undefined | null,
  section: ViewSection | undefined | null,
): number => {
  const maxColumns = sectionsColumnCount(view);
  const raw = section?.column_span;
  const span = typeof raw === 'number' && Number.isFinite(raw) ? Math.floor(raw) : 1;
  return Math.min(Math.max(1, span), maxColumns);
};

/**
 * Immutably replace a single card inside a section, returning a NEW View (the
 * original is untouched). Used by the edit path so PropertiesPanel writes land
 * in the correct section. Out-of-range section/card indices return the input
 * view unchanged (reference-equal), which callers can use to skip a no-op write.
 */
export const updateSectionCard = (
  view: View,
  sectionIndex: number,
  cardIndex: number,
  updatedCard: Card,
): View => {
  const sections = view.sections;
  if (!Array.isArray(sections) || !sections[sectionIndex]) return view;
  const section = sections[sectionIndex];
  const cards = Array.isArray(section.cards) ? section.cards : [];
  if (!cards[cardIndex]) return view;

  const nextCards = cards.map((card, i) => (i === cardIndex ? updatedCard : card));
  return replaceSectionCards(view, sectionIndex, nextCards);
};

/**
 * Immutably swap one section's `cards` array, returning a NEW View. Sibling
 * sections are carried through reference-equal so React can skip them.
 */
const replaceSectionCards = (view: View, sectionIndex: number, nextCards: Card[]): View => {
  const sections = view.sections as ViewSection[];
  const nextSections = sections.map((s, i) =>
    i === sectionIndex ? { ...s, cards: nextCards } : s,
  );
  return { ...view, sections: nextSections };
};

/**
 * Read a section's cards, or null when the section does not exist. Callers use
 * the null to return the input view unchanged (reference-equal no-op).
 */
const sectionCardsAt = (view: View, sectionIndex: number): Card[] | null => {
  const sections = view.sections;
  if (!Array.isArray(sections) || !sections[sectionIndex]) return null;
  const cards = sections[sectionIndex].cards;
  return Array.isArray(cards) ? cards : [];
};

/**
 * Append a card to a section (Tier 4, slice 4.3a). Sections are an ORDERED LIST
 * — unlike the flat canvas there is no {x,y,w,h} geometry, so a new card simply
 * goes at the end and carries no `_havdm_layout`. Out-of-range section returns
 * the input view unchanged (reference-equal).
 */
export const addCardToSection = (view: View, sectionIndex: number, card: Card): View => {
  const cards = sectionCardsAt(view, sectionIndex);
  if (cards === null) return view;
  return replaceSectionCards(view, sectionIndex, [...cards, card]);
};

/**
 * Remove cards at the given indices from a section (delete / the cut half of a
 * move). Out-of-range and duplicate indices are ignored; a no-op index list or
 * an out-of-range section returns the input view unchanged (reference-equal).
 */
export const removeSectionCards = (view: View, sectionIndex: number, indices: number[]): View => {
  const cards = sectionCardsAt(view, sectionIndex);
  if (cards === null) return view;

  const doomed = new Set(indices.filter((i) => Number.isInteger(i) && i >= 0 && i < cards.length));
  if (doomed.size === 0) return view;

  return replaceSectionCards(
    view,
    sectionIndex,
    cards.filter((_, i) => !doomed.has(i)),
  );
};

/**
 * Append several cards to a section, in order (the paste half of a move). An
 * empty card list or an out-of-range section returns the input view unchanged
 * (reference-equal).
 */
export const insertCardsIntoSection = (view: View, sectionIndex: number, cards: Card[]): View => {
  if (cards.length === 0) return view;
  const existing = sectionCardsAt(view, sectionIndex);
  if (existing === null) return view;
  return replaceSectionCards(view, sectionIndex, [...existing, ...cards]);
};
