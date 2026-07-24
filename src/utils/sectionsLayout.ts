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

/**
 * HA lays each section out on a 12-column grid (developers.home-assistant.io
 * custom-card "Sizing in Sections view": cell ≈ section-width/12 wide, 56px
 * tall, 8px gap). A card's horizontal size is `grid_options.columns`.
 */
export const SECTION_GRID_COLUMNS = 12;

type GridOptions = { columns?: number | 'full'; rows?: number | 'auto' };

const readGridOptions = (card: Card): GridOptions => {
  const raw = (card as Record<string, unknown>).grid_options;
  return raw && typeof raw === 'object' ? (raw as GridOptions) : {};
};

/**
 * How many of the section's 12 columns a card spans (Tier 4, slice 4.3b).
 * `grid_options.columns` = 'full' OR absent -> full width (12); a number is
 * clamped to [1, 12]. Defaulting a card with NO grid_options to full width is
 * deliberate: it makes the 12-col section render identical to the old
 * vertical-stack render for every existing dashboard (full-width cards stack),
 * so only cards that explicitly set columns<12 sit side by side.
 */
export const sectionCardColumnSpan = (card: Card): number => {
  const columns = readGridOptions(card).columns;
  if (columns === 'full' || columns === undefined) return SECTION_GRID_COLUMNS;
  if (typeof columns !== 'number' || !Number.isFinite(columns)) return SECTION_GRID_COLUMNS;
  return Math.min(Math.max(1, Math.floor(columns)), SECTION_GRID_COLUMNS);
};

/**
 * Move a card within a section (reorder) or between sections, addressed by
 * (sectionIndex, cardIndex). Same-section move splices the card out and back in
 * at the target index; cross-section move removes it from the source and inserts
 * it into the target (clamped/appended when the target index is past the end).
 * A no-op (same position), an out-of-range source, or an out-of-range target
 * section returns the input view unchanged (reference-equal).
 */
export const moveSectionCard = (
  view: View,
  from: { sectionIndex: number; cardIndex: number },
  to: { sectionIndex: number; cardIndex: number },
): View => {
  const fromCards = sectionCardsAt(view, from.sectionIndex);
  if (fromCards === null || !fromCards[from.cardIndex]) return view;
  const toCards = sectionCardsAt(view, to.sectionIndex);
  if (toCards === null) return view;

  const card = fromCards[from.cardIndex];

  if (from.sectionIndex === to.sectionIndex) {
    if (from.cardIndex === to.cardIndex) return view;
    const next = fromCards.slice();
    next.splice(from.cardIndex, 1);
    const insertAt = Math.min(Math.max(0, to.cardIndex), next.length);
    next.splice(insertAt, 0, card);
    return replaceSectionCards(view, from.sectionIndex, next);
  }

  // Cross-section: build both new arrays, then swap both sections in one pass so
  // sibling sections stay reference-equal.
  const nextFrom = fromCards.filter((_, i) => i !== from.cardIndex);
  const insertAt = Math.min(Math.max(0, to.cardIndex), toCards.length);
  const nextTo = toCards.slice();
  nextTo.splice(insertAt, 0, card);

  const sections = view.sections as ViewSection[];
  const nextSections = sections.map((s, i) => {
    if (i === from.sectionIndex) return { ...s, cards: nextFrom };
    if (i === to.sectionIndex) return { ...s, cards: nextTo };
    return s;
  });
  return { ...view, sections: nextSections };
};

/**
 * Merge `grid_options` (columns/rows) onto a single section card, immutably
 * (Tier 4, slice 4.3b — the write path for canvas drag-resize). Existing
 * grid_options keys are preserved; only the passed keys are overwritten.
 * Out-of-range section/card returns the input view unchanged (reference-equal).
 */
export const setSectionCardGridOptions = (
  view: View,
  sectionIndex: number,
  cardIndex: number,
  gridOptions: GridOptions,
): View => {
  const cards = sectionCardsAt(view, sectionIndex);
  if (cards === null || !cards[cardIndex]) return view;

  const card = cards[cardIndex];
  const merged = { ...readGridOptions(card), ...gridOptions };
  const nextCard = { ...card, grid_options: merged } as Card;
  const nextCards = cards.map((c, i) => (i === cardIndex ? nextCard : c));
  return replaceSectionCards(view, sectionIndex, nextCards);
};
