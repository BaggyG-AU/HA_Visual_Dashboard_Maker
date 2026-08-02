import type { Card, View, ViewSection } from '../types/dashboard';
import { getCardSizeConstraints } from './cardSizingContract';

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
 * Immutably swap one section's whole `cards` array.
 *
 * ⭐ The public counterpart of `updateSectionCard`, for callers that have
 * already computed the next array themselves — specifically a BULK multi-select
 * edit, which has to rewrite several of a section's cards at once.
 *
 * ⚠ Added for the v1.0.0 UAT round-2 defect CLIP-04. `App.tsx` used to take a
 * `selectedSectionIndex !== null` early return commented "sections are
 * single-select this slice, so no bulk apply" and never reached
 * `applyBulkCardUpdate` at all — so on a sections view the selection model
 * advertised three selected cards and the edit landed on exactly one.
 */
export const setSectionCards = (view: View, sectionIndex: number, nextCards: Card[]): View => {
  const sections = view.sections;
  if (!Array.isArray(sections) || !sections[sectionIndex]) return view;
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
 * How many 56px grid rows a card spans (Tier 4, slice 4.3c). An explicit numeric
 * `grid_options.rows` wins (clamped to >= 1); otherwise we fall back to the
 * per-card content-height ESTIMATE (getCardSizeConstraints().h, already in 56px
 * units) so a card that never declared rows still gets a sensible fixed height on
 * the true 56px grid instead of clipping to a single row. Always >= 1.
 */
export const sectionCardRowSpan = (card: Card): number => {
  const rows = readGridOptions(card).rows;
  if (typeof rows === 'number' && Number.isFinite(rows)) {
    return Math.max(1, Math.floor(rows));
  }
  return Math.max(1, getCardSizeConstraints(card).h);
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

// --- Tier 4 slice 4.4: SECTION-level authoring -------------------------------
// Section-level twins of the card helpers above: same immutable,
// reference-equal-on-no-op contract, so App handlers stay thin and every
// operation is one undoable edit. The canvas wiring is covered by e2e.

/**
 * Append (default) or insert an empty grid section into a sections view. A new
 * section is a bare `{ type: 'grid', cards: [] }` — HA auto-adds a heading CARD
 * to new sections, but HAVDM has no heading-card renderer yet, so a new section
 * starts empty and untitled (its heading is set later via setSectionTitle).
 * `atIndex` is clamped to [0, length]; omitted appends. Existing sections are
 * carried through reference-equal. Always returns a NEW View.
 */
export const addSection = (view: View, atIndex?: number): View => {
  const sections = Array.isArray(view.sections) ? view.sections : [];
  const newSection: ViewSection = { type: 'grid', cards: [] };
  const insertAt =
    atIndex === undefined
      ? sections.length
      : Math.min(Math.max(0, Math.floor(atIndex)), sections.length);
  const nextSections = sections.slice();
  nextSections.splice(insertAt, 0, newSection);
  return { ...view, sections: nextSections };
};

/**
 * Remove the section at `sectionIndex`. Out-of-range returns the input view
 * unchanged (reference-equal); surviving sections are carried reference-equal.
 * Returns a NEW View (possibly with an empty `sections` array when the last
 * section is removed).
 */
export const removeSection = (view: View, sectionIndex: number): View => {
  const sections = view.sections;
  if (!Array.isArray(sections) || !sections[sectionIndex]) return view;
  return { ...view, sections: sections.filter((_, i) => i !== sectionIndex) };
};

/**
 * Move a section from one index to another (the section drag-reorder write
 * path). Splices the section out and reinserts it at the clamped target index. A
 * no-op (same index) or an out-of-range source returns the input view unchanged
 * (reference-equal). Returns a NEW View otherwise.
 */
export const moveSection = (view: View, fromIndex: number, toIndex: number): View => {
  const sections = view.sections;
  if (!Array.isArray(sections) || !sections[fromIndex]) return view;
  if (fromIndex === toIndex) return view;
  const next = sections.slice();
  const [moved] = next.splice(fromIndex, 1);
  const insertAt = Math.min(Math.max(0, Math.floor(toIndex)), next.length);
  next.splice(insertAt, 0, moved);
  return { ...view, sections: next };
};

/**
 * Set (or clear) a section's heading title. A non-empty string sets
 * `section.title`; an empty string REMOVES the key so an untitled section
 * round-trips clean. A no-op (title already equal, or already absent and
 * cleared) or an out-of-range section returns the input view unchanged
 * (reference-equal). Sibling sections are carried reference-equal.
 */
export const setSectionTitle = (view: View, sectionIndex: number, title: string): View => {
  const sections = view.sections;
  if (!Array.isArray(sections) || !sections[sectionIndex]) return view;
  const section = sections[sectionIndex];
  const current = typeof section.title === 'string' ? section.title : undefined;
  const nextTitle = title === '' ? undefined : title;
  if (current === nextTitle) return view;

  let nextSection: ViewSection;
  if (nextTitle === undefined) {
    nextSection = { ...section };
    delete (nextSection as { title?: string }).title;
  } else {
    nextSection = { ...section, title: nextTitle };
  }
  const nextSections = sections.map((s, i) => (i === sectionIndex ? nextSection : s));
  return { ...view, sections: nextSections };
};

/**
 * Set a sections view's `max_columns` (view-level), clamped to >= 1. A no-op
 * (already equal) or a non-finite input returns the input view unchanged
 * (reference-equal); otherwise only the view-level key changes and the
 * `sections` array is carried through by reference. Returns a NEW View.
 */
export const setViewMaxColumns = (view: View, maxColumns: number): View => {
  if (!Number.isFinite(maxColumns)) return view;
  const clamped = Math.max(1, Math.floor(maxColumns));
  if (view.max_columns === clamped) return view;
  return { ...view, max_columns: clamped };
};

// --- Tier 4 slice 4.5: view-type authoring (create / convert to sections) -----

/** HA's Sections view default width (max_columns) when we don't have one. */
const SECTIONS_DEFAULT_MAX_COLUMNS = 4;

/**
 * Build a blank HA "sections" view (the New-Sections-dashboard template). One
 * empty grid section, HA's default max_columns, and a title/path (default
 * Home/home). This is what "create a Sections view" produces.
 */
export const buildSectionsView = (opts: { title?: string; path?: string } = {}): View => ({
  title: opts.title ?? 'Home',
  path: opts.path ?? 'home',
  type: 'sections',
  max_columns: SECTIONS_DEFAULT_MAX_COLUMNS,
  sections: [{ type: 'grid', cards: [] }],
});

/**
 * Convert a non-sections view into a Sections view (slice 4.5, the FR-026
 * conversion). VISUAL-FIRST + "never silently destroy user data": the view's flat
 * `cards` are MIGRATED verbatim into ONE starter grid section (their content is
 * preserved; only the layout container changes), then the flat `cards` is
 * emptied so the sections payload is canonical. The internal custom:grid-layout
 * scaffold (`layout` / `layout_type`) is dropped — it is meaningless for a real
 * sections view (and only ever the HAVDM canvas scaffold on a HAVDM-created
 * view). An existing `max_columns` is kept; otherwise defaulted. Already a
 * sections view -> returned unchanged (reference-equal). Conversion is
 * ONE-DIRECTIONAL here (-> sections); geometry is NOT translated (migrated cards
 * fall back to the full-width span-12 default and are re-sized with the section
 * card tools).
 */
export const convertViewToSections = (view: View): View => {
  if (view.type === 'sections') return view;
  const flatCards = Array.isArray(view.cards) ? view.cards : [];
  const next: View = {
    ...view,
    type: 'sections',
    cards: [],
    sections: [{ type: 'grid', cards: flatCards }],
    max_columns:
      typeof view.max_columns === 'number' ? view.max_columns : SECTIONS_DEFAULT_MAX_COLUMNS,
  };
  delete next.layout;
  delete next.layout_type;
  return next;
};

/**
 * The inverse of {@link convertViewToSections} (slice 4.6b): flatten a Sections
 * view back into a flat (`targetType`, default masonry) view. VISUAL-FIRST +
 * "never silently destroy user data": every section's cards are concatenated
 * into the flat `view.cards` in order (PRESERVED), and each section HEADING —
 * which has no flat equivalent, since HAVDM has no heading-card renderer — is
 * preserved as a `## Title` markdown card prepended to that section's cards
 * (rather than dropped). The sections payload and its view-level layout keys
 * (`sections` / `max_columns` / `dense_section_placement`) are removed. A
 * non-sections view is returned unchanged (reference-equal). Identity props
 * (title/path/icon/panel/…) are carried through.
 */
export const flattenSectionsView = (view: View, targetType: string = 'masonry'): View => {
  if (view.type !== 'sections') return view;
  const sections = Array.isArray(view.sections) ? view.sections : [];
  const flatCards: Card[] = [];
  for (const section of sections) {
    if (typeof section.title === 'string' && section.title.length > 0) {
      flatCards.push({ type: 'markdown', content: `## ${section.title}` } as Card);
    }
    if (Array.isArray(section.cards)) flatCards.push(...section.cards);
  }
  const next: View = { ...view, type: targetType, cards: flatCards };
  delete next.sections;
  delete next.max_columns;
  delete next.dense_section_placement;
  return next;
};
