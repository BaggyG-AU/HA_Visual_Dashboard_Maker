import React from 'react';
import type { View } from '../types/dashboard';
import { BaseCard } from './BaseCard';
import { sectionsColumnCount, sectionColumnSpan } from '../utils/sectionsLayout';

interface SectionsCanvasProps {
  view: View;
  selectedSectionIndex: number | null;
  selectedCardIndex: number | null;
  onCardSelect: (cardIndex: number | null, options?: { sectionIndex?: number | null }) => void;
}

/**
 * Renders a Home Assistant "sections" view on the canvas (Tier 4, slice
 * 4.1+4.2). A sections view keeps its cards under `section.cards`, not the
 * view's top-level `cards`, so the flat GridCanvas path renders it blank; this
 * component lays each section out as a titled column of cards in a
 * `max_columns` CSS grid, reusing BaseCard so every card type renders exactly
 * as on the flat canvas.
 *
 * Scope (this slice): read-only layout + single-click SELECT a section card to
 * edit it in the Properties panel. Drag / add / move / delete / clipboard
 * within sections, and section authoring (add/remove/reorder/headings), are
 * deferred to later Tier-4 slices.
 */
export const SectionsCanvas: React.FC<SectionsCanvasProps> = ({
  view,
  selectedSectionIndex,
  selectedCardIndex,
  onCardSelect,
}) => {
  const sections = Array.isArray(view.sections) ? view.sections : [];
  const columns = sectionsColumnCount(view);

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
                  style={{ position: 'relative' }}
                >
                  <BaseCard
                    card={card}
                    isSelected={selectedSectionIndex === si && selectedCardIndex === ci}
                    onClick={() => onCardSelect(ci, { sectionIndex: si })}
                  />
                </div>
              ))}
              {cards.length === 0 ? (
                <div style={{ color: '#8c8c8c', fontStyle: 'italic', padding: 8 }}>
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
