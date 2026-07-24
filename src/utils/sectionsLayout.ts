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
  const nextSections = sections.map((s, i) =>
    i === sectionIndex ? { ...s, cards: nextCards } : s,
  );
  return { ...view, sections: nextSections };
};
