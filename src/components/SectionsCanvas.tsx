import React, { useRef, useState } from 'react';
import { Slider } from 'antd';
import type { Card, View } from '../types/dashboard';
import type { SelectionMode } from '../utils/bulkSelection';
import { BaseCard } from './BaseCard';
import { CardContextMenu } from './CardContextMenu';
import {
  sectionsColumnCount,
  sectionColumnSpan,
  sectionCardColumnSpan,
  sectionCardRowSpan,
  SECTION_GRID_COLUMNS,
} from '../utils/sectionsLayout';

/** A (section, card) address for a drag-move. */
export interface SectionCardAddress {
  sectionIndex: number;
  cardIndex: number;
}

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
  onCardMove?: (from: SectionCardAddress, to: SectionCardAddress) => void;
  onCardResize?: (
    address: SectionCardAddress,
    gridOptions: { columns?: number; rows?: number },
  ) => void;
  canPaste?: boolean;
}

/** HA's section grid cell is ~56px tall with an 8px gap. */
const SECTION_ROW_HEIGHT = 56;
const SECTION_GRID_GAP = 8;
const DRAG_MIME = 'application/x-havdm-section-card';

/**
 * Renders a Home Assistant "sections" view on the canvas (Tier 4).
 *
 * 4.1+4.2 render/select, 4.3a authoring (add/delete/clipboard/multi-select),
 * 4.3b drag-to-move + drag-to-resize. A sections view keeps its cards under
 * `section.cards`, not the view's top-level `cards`, so the flat GridCanvas path
 * renders it blank; this component lays each section out on HA's 12-column grid.
 *
 * Sizing: each section is a 12-column CSS grid; a card spans
 * `grid_options.columns` of the 12 (`full`/absent -> 12, so an existing
 * dashboard whose cards have no grid_options renders as a full-width stack,
 * identical to the pre-4.3b vertical layout). `grid_options.rows` maps to an
 * APPROXIMATE min-height (rows x 56px) — content may grow past it rather than
 * clip (exact 56px row parity is a separate, deferred concern).
 *
 * Drag-move (native HTML5 DnD): drag a card's body to reorder within a section
 * or move it between sections. Drag-resize: drag a card's right edge to change
 * its column span, its bottom edge to change rows; the handles sit on the outer
 * wrapper and stopPropagation so they never trigger move or select.
 *
 * Deferred: dense/Z-grid auto-reflow (cards flow in array order); exact 56px row
 * parity; HA "Precise mode". Section authoring (add/remove/reorder, headings,
 * max_columns) is slice 4.4.
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
  onCardMove,
  onCardResize,
  canPaste,
}) => {
  const sections = Array.isArray(view.sections) ? view.sections : [];
  const columns = sectionsColumnCount(view);
  const sectionRefs = useRef<Array<HTMLDivElement | null>>([]);

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

  // --- drag-to-move (native HTML5 DnD) ---------------------------------------
  const dragSourceRef = useRef<SectionCardAddress | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const onCardDragStart = (from: SectionCardAddress, event: React.DragEvent): void => {
    dragSourceRef.current = from;
    setDragActive(true);
    event.dataTransfer.effectAllowed = 'move';
    // A payload is required for Firefox to start the drag; the real source is the ref.
    event.dataTransfer.setData(DRAG_MIME, `${from.sectionIndex}:${from.cardIndex}`);
  };

  const onCardDragEnd = (): void => {
    dragSourceRef.current = null;
    setDragActive(false);
  };

  const dropOn = (to: SectionCardAddress, event: React.DragEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    const from = dragSourceRef.current;
    dragSourceRef.current = null;
    setDragActive(false);
    if (!from || !onCardMove) return;
    onCardMove(from, to);
  };

  // --- drag-to-resize (pointer gesture on edge handles) ----------------------
  // Live-preview the span/height LOCALLY during the drag (no store writes, so no
  // undo-history spam and no stale-closure hazard), then commit ONCE on mouseup.
  const resizeRef = useRef<{
    address: SectionCardAddress;
    axis: 'columns' | 'rows';
    startX: number;
    startY: number;
    startColumns: number;
    startRows: number;
    cellWidth: number;
    latestColumns: number;
    latestRows: number;
  } | null>(null);
  const [resizePreview, setResizePreview] = useState<{
    address: SectionCardAddress;
    columns?: number;
    rows?: number;
  } | null>(null);

  const beginResize = (
    address: SectionCardAddress,
    axis: 'columns' | 'rows',
    card: Card,
    event: React.MouseEvent,
  ): void => {
    // Never let a resize also select the card or start a move drag.
    event.preventDefault();
    event.stopPropagation();
    const sectionEl = sectionRefs.current[address.sectionIndex];
    const cellWidth = sectionEl
      ? (sectionEl.clientWidth + SECTION_GRID_GAP) / SECTION_GRID_COLUMNS
      : 0;
    const startColumns = sectionCardColumnSpan(card);
    const startRows = sectionCardRowSpan(card);
    resizeRef.current = {
      address,
      axis,
      startX: event.clientX,
      startY: event.clientY,
      startColumns,
      startRows,
      cellWidth,
      latestColumns: startColumns,
      latestRows: startRows,
    };
    window.addEventListener('mousemove', onResizeMove);
    window.addEventListener('mouseup', onResizeEnd);
  };

  const onResizeMove = (event: MouseEvent): void => {
    const state = resizeRef.current;
    if (!state) return;
    if (state.axis === 'columns') {
      if (state.cellWidth <= 0) return;
      const delta = Math.round((event.clientX - state.startX) / state.cellWidth);
      const columns = Math.min(Math.max(1, state.startColumns + delta), SECTION_GRID_COLUMNS);
      state.latestColumns = columns;
      setResizePreview({ address: state.address, columns });
    } else {
      const delta = Math.round(
        (event.clientY - state.startY) / (SECTION_ROW_HEIGHT + SECTION_GRID_GAP),
      );
      const rows = Math.max(1, state.startRows + delta);
      state.latestRows = rows;
      setResizePreview({ address: state.address, rows });
    }
  };

  const onResizeEnd = (): void => {
    const state = resizeRef.current;
    resizeRef.current = null;
    window.removeEventListener('mousemove', onResizeMove);
    window.removeEventListener('mouseup', onResizeEnd);
    setResizePreview(null);
    if (!state || !onCardResize) return;
    if (state.axis === 'columns' && state.latestColumns !== state.startColumns) {
      onCardResize(state.address, { columns: state.latestColumns });
    } else if (state.axis === 'rows' && state.latestRows !== state.startRows) {
      onCardResize(state.address, { rows: state.latestRows });
    }
  };

  const previewFor = (si: number, ci: number): { columns?: number; rows?: number } | null => {
    if (!resizePreview) return null;
    return resizePreview.address.sectionIndex === si && resizePreview.address.cardIndex === ci
      ? resizePreview
      : null;
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
              ref={(el) => {
                sectionRefs.current[si] = el;
              }}
              style={{
                gridColumn: `span ${span}`,
                display: 'grid',
                gridTemplateColumns: `repeat(${SECTION_GRID_COLUMNS}, minmax(0, 1fr))`,
                // 4.3c: true HA sections grid — fixed 56px rows + dense packing
                // so smaller cards backfill gaps (HA's Z-grid default). Dense is
                // CSS-only: DOM order stays array order, so drag-reorder (which
                // addresses by array index) is unaffected.
                gridAutoRows: `${SECTION_ROW_HEIGHT}px`,
                gridAutoFlow: 'row dense',
                gap: SECTION_GRID_GAP,
                alignContent: 'start',
              }}
              // Dropping on the section's own area (not a card) appends to the end.
              onDragOver={(event) => {
                if (dragActive) event.preventDefault();
              }}
              onDrop={(event) => dropOn({ sectionIndex: si, cardIndex: cards.length }, event)}
            >
              {section.title ? (
                <div
                  data-testid={`section-heading-${si}`}
                  style={{
                    gridColumn: `1 / -1`,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 16,
                    padding: '4px 2px',
                  }}
                >
                  {section.title}
                </div>
              ) : null}
              {cards.map((card, ci) => {
                const preview = previewFor(si, ci);
                const cardSpan = preview?.columns ?? sectionCardColumnSpan(card);
                // 4.3c: on the true 56px grid a card always spans a whole number
                // of rows (explicit grid_options.rows, else the content estimate).
                const rowSpan = preview?.rows ?? sectionCardRowSpan(card);
                const selected = isSelected(si, ci);
                return (
                  <div
                    key={`section-${si}-card-${ci}`}
                    data-testid="canvas-card"
                    data-section-index={si}
                    data-card-index={ci}
                    data-grid-columns={cardSpan}
                    data-grid-rows={rowSpan}
                    style={{
                      gridColumn: `span ${cardSpan}`,
                      gridRow: `span ${rowSpan}`,
                      position: 'relative',
                    }}
                    onMouseDownCapture={(event) => rememberMode(si, ci, event)}
                    // Drop onto a card inserts at that card's position.
                    onDragOver={(event) => {
                      if (dragActive) {
                        event.preventDefault();
                        event.stopPropagation();
                      }
                    }}
                    onDrop={(event) => dropOn({ sectionIndex: si, cardIndex: ci }, event)}
                  >
                    {/* Content clips to the card's allotted 56px cell (HA-faithful);
                        the resize handles + precise panel are SIBLINGS of this
                        clipping wrapper so they are never clipped. */}
                    <div style={{ height: '100%', overflow: 'hidden' }}>
                      <CardContextMenu
                        onCut={() => {
                          if (!selected) onCardSelect(ci, { sectionIndex: si });
                          onCardCut?.();
                        }}
                        onCopy={() => {
                          if (!selected) onCardSelect(ci, { sectionIndex: si });
                          onCardCopy?.();
                        }}
                        onPaste={() => {
                          if (!selected) onCardSelect(ci, { sectionIndex: si });
                          onCardPaste?.();
                        }}
                        onDelete={() => {
                          if (!selected) onCardSelect(ci, { sectionIndex: si });
                          onCardDelete?.();
                        }}
                        canPaste={canPaste ?? false}
                      >
                        {/* Inner element is the drag-MOVE source; the outer wrapper
                            hosts the resize handles so a resize never starts a move. */}
                        <div
                          data-testid={`section-card-body-${si}-${ci}`}
                          draggable
                          onDragStart={(event) =>
                            onCardDragStart({ sectionIndex: si, cardIndex: ci }, event)
                          }
                          onDragEnd={onCardDragEnd}
                          style={{ cursor: 'grab', height: '100%' }}
                        >
                          <BaseCard
                            card={card}
                            isSelected={selected}
                            onClick={(event) =>
                              onCardSelect(ci, {
                                sectionIndex: si,
                                mode: consumeSelectionMode(si, ci, event),
                              })
                            }
                          />
                        </div>
                      </CardContextMenu>
                    </div>

                    {selected ? (
                      <>
                        <div
                          data-testid={`section-resize-columns-${si}-${ci}`}
                          role="separator"
                          aria-label="Resize card width"
                          title="Drag to resize width"
                          onMouseDown={(event) =>
                            beginResize({ sectionIndex: si, cardIndex: ci }, 'columns', card, event)
                          }
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: -3,
                            width: 8,
                            height: '100%',
                            cursor: 'ew-resize',
                            background: 'transparent',
                          }}
                        />
                        <div
                          data-testid={`section-resize-rows-${si}-${ci}`}
                          role="separator"
                          aria-label="Resize card height"
                          title="Drag to resize height"
                          onMouseDown={(event) =>
                            beginResize({ sectionIndex: si, cardIndex: ci }, 'rows', card, event)
                          }
                          style={{
                            position: 'absolute',
                            bottom: -3,
                            left: 0,
                            width: '100%',
                            height: 8,
                            cursor: 'ns-resize',
                            background: 'transparent',
                          }}
                        />
                        {/* 4.3c: precise-mode numeric sliders (exact columns/rows). */}
                        <div
                          data-testid={`section-precise-panel-${si}-${ci}`}
                          onMouseDown={(event) => event.stopPropagation()}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 148,
                            padding: '6px 10px',
                            background: 'rgba(20,20,20,0.92)',
                            border: '1px solid #434343',
                            borderRadius: 6,
                            zIndex: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                          }}
                        >
                          <div style={{ color: '#bbb', fontSize: 11 }}>Width {cardSpan}/12</div>
                          <div data-testid={`section-precise-columns-${si}-${ci}`}>
                            <Slider
                              min={1}
                              max={SECTION_GRID_COLUMNS}
                              value={cardSpan}
                              onChange={(value) =>
                                setResizePreview({
                                  address: { sectionIndex: si, cardIndex: ci },
                                  columns: value as number,
                                })
                              }
                              onChangeComplete={(value) => {
                                setResizePreview(null);
                                onCardResize?.(
                                  { sectionIndex: si, cardIndex: ci },
                                  { columns: value as number },
                                );
                              }}
                            />
                          </div>
                          <div style={{ color: '#bbb', fontSize: 11 }}>Height {rowSpan}</div>
                          <div data-testid={`section-precise-rows-${si}-${ci}`}>
                            <Slider
                              min={1}
                              max={20}
                              value={rowSpan}
                              onChange={(value) =>
                                setResizePreview({
                                  address: { sectionIndex: si, cardIndex: ci },
                                  rows: value as number,
                                })
                              }
                              onChangeComplete={(value) => {
                                setResizePreview(null);
                                onCardResize?.(
                                  { sectionIndex: si, cardIndex: ci },
                                  { rows: value as number },
                                );
                              }}
                            />
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                );
              })}
              {cards.length === 0 ? (
                <div
                  data-testid={`section-empty-${si}`}
                  style={{
                    gridColumn: `1 / -1`,
                    color: '#8c8c8c',
                    fontStyle: 'italic',
                    padding: 8,
                  }}
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
