import React, { useRef } from 'react';
import type { View } from '../types/dashboard';
import type { SelectionMode } from '../utils/bulkSelection';
import { BaseCard } from './BaseCard';
import { CardContextMenu } from './CardContextMenu';
import { sectionsColumnCount, sectionColumnSpan } from '../utils/sectionsLayout';

interface SectionsCanvasProps {
  view: View;
  selectedSectionIndex: number | null;
  selectedCardIndex: number | null;
  selectedCardIndices?: number[];
  onCardSelect: (
    cardIndex: number | null,
    options?: { sectionIndex?: number | null; mode?: SelectionMode },
  ) => void;
  onCardCut?: () => void;
  onCardCopy?: () => void;
  onCardPaste?: () => void;
  onCardDelete?: () => void;
  canPaste?: boolean;
}

/**
 * Renders a Home Assistant "sections" view on the canvas (Tier 4, slices
 * 4.1+4.2 render/select, 4.3a authoring). A sections view keeps its cards under
 * `section.cards`, not the view's top-level `cards`, so the flat GridCanvas path
 * renders it blank; this component lays each section out as a titled column of
 * cards in a `max_columns` CSS grid, reusing BaseCard so every card type renders
 * exactly as on the flat canvas.
 *
 * Sections are an ORDERED LIST, not a {x,y,w,h} grid, so there is no drag or
 * resize here: authoring is add (appends to the section), delete, and clipboard.
 * Multi-select works WITHIN one section — `selectedSectionIndex` is a single
 * scalar, so a selection cannot span sections.
 *
 * Deferred to 4.3b: drag-to-reorder within/between sections and `grid_options`
 * sizing. Deferred to 4.4: section authoring (add/remove/reorder, headings,
 * max_columns).
 */
export const SectionsCanvas: React.FC<SectionsCanvasProps> = ({
  view,
  selectedSectionIndex,
  selectedCardIndex,
  selectedCardIndices,
  onCardSelect,
  onCardCut,
  onCardCopy,
  onCardPaste,
  onCardDelete,
  canPaste,
}) => {
  const sections = Array.isArray(view.sections) ? view.sections : [];
  const columns = sectionsColumnCount(view);

  // A card is selected only when its section is the selected one — the same
  // index in another section must not light up.
  const isSelected = (sectionIndex: number, cardIndex: number): boolean => {
    if (selectedSectionIndex !== sectionIndex) return false;
    if (selectedCardIndices && selectedCardIndices.length > 0) {
      return selectedCardIndices.includes(cardIndex);
    }
    return selectedCardIndex === cardIndex;
  };

  // Mirror GridCanvas: capture the modifier on mousedown into a ref rather than
  // reading it off the click event, which does not carry the modifier reliably
  // through BaseCard's nested card content. `consumeSelectionMode` prefers the
  // ref and falls back to the click event.
  const pendingModeRef = useRef<{ si: number; ci: number; mode: SelectionMode } | null>(null);

  const rememberMode = (si: number, ci: number, event: React.MouseEvent): void => {
    if (event.shiftKey) pendingModeRef.current = { si, ci, mode: 'range' };
    else if (event.ctrlKey || event.metaKey) pendingModeRef.current = { si, ci, mode: 'toggle' };
    else pendingModeRef.current = null;
  };

  const consumeSelectionMode = (
    si: number,
    ci: number,
    event?: React.MouseEvent,
  ): SelectionMode => {
    const pending = pendingModeRef.current;
    if (pending && pending.si === si && pending.ci === ci) {
      pendingModeRef.current = null;
      return pending.mode;
    }
    if (event?.shiftKey) return 'range';
    if (event?.ctrlKey || event?.metaKey) return 'toggle';
    return 'replace';
  };

  return (
    <div
      data-testid="sections-canvas"
      style={{ height: '100%', overflow: 'auto', padding: 16, backgroundColor: '#141414' }}
      onMouseDown={(event) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest('[data-testid="canvas-card"]')) return;
        if (selectedCardIndex !== null) onCardSelect(null, { sectionIndex: null });
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: 16,
          alignItems: 'start',
        }}
      >
        {sections.map((section, si) => {
          const cards = Array.isArray(section.cards) ? section.cards : [];
          const span = sectionColumnSpan(view, section);
          return (
            <div
              key={`section-${si}`}
              data-testid={`sections-canvas-section-${si}`}
              style={{
                gridColumn: `span ${span}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {section.title ? (
                <div
                  data-testid={`section-heading-${si}`}
                  style={{ color: '#fff', fontWeight: 600, fontSize: 16, padding: '4px 2px' }}
                >
                  {section.title}
                </div>
              ) : null}
              {cards.map((card, ci) => (
                <div
                  key={`section-${si}-card-${ci}`}
                  data-testid="canvas-card"
                  data-section-index={si}
                  data-card-index={ci}
                  style={{ position: 'relative' }}
                  onMouseDownCapture={(event) => rememberMode(si, ci, event)}
                >
                  <CardContextMenu
                    onCut={() => {
                      if (!isSelected(si, ci)) onCardSelect(ci, { sectionIndex: si });
                      onCardCut?.();
                    }}
                    onCopy={() => {
                      if (!isSelected(si, ci)) onCardSelect(ci, { sectionIndex: si });
                      onCardCopy?.();
                    }}
                    onPaste={() => {
                      if (!isSelected(si, ci)) onCardSelect(ci, { sectionIndex: si });
                      onCardPaste?.();
                    }}
                    onDelete={() => {
                      if (!isSelected(si, ci)) onCardSelect(ci, { sectionIndex: si });
                      onCardDelete?.();
                    }}
                    canPaste={canPaste ?? false}
                  >
                    <BaseCard
                      card={card}
                      isSelected={isSelected(si, ci)}
                      onClick={(event) =>
                        onCardSelect(ci, {
                          sectionIndex: si,
                          mode: consumeSelectionMode(si, ci, event),
                        })
                      }
                    />
                  </CardContextMenu>
                </div>
              ))}
              {cards.length === 0 ? (
                <div
                  data-testid={`section-empty-${si}`}
                  style={{ color: '#8c8c8c', fontStyle: 'italic', padding: 8 }}
                >
                  Empty section
                </div>
              ) : null}
            </div>
          );
        })}
        {sections.length === 0 ? (
          <div data-testid="sections-canvas-empty" style={{ color: '#8c8c8c', padding: 16 }}>
            This sections view has no sections.
          </div>
        ) : null}
      </div>
    </div>
  );
};
