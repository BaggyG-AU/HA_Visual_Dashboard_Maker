import React, { useMemo, useRef } from 'react';
import GridLayout, { getCompactor } from 'react-grid-layout';
import type { Layout, LayoutItem } from 'react-grid-layout';
import { View, Card } from '../types/dashboard';
import { getBackgroundLayerStyle } from '../utils/backgroundStyle';
import { BaseCard } from './BaseCard';
import { CardContextMenu } from './CardContextMenu';
import { generateMasonryLayout, getCardSizeConstraints } from '../utils/cardSizingContract';
import { isLayoutCardGrid, convertLayoutCardToGridLayout } from '../utils/layoutCardParser';
import { logger } from '../services/logger';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './GridCanvas.css';

// Canvas geometry. react-grid-layout v2 replaced the flat v1 props
// (cols/rowHeight/margin/containerPadding) with a single `gridConfig` object,
// and reads geometry ONLY from it — flat props are silently ignored.
//
// These values are react-grid-layout's own defaults, stated explicitly. Until
// this was migrated, the flat props below were being dropped and the canvas had
// been rendering on these defaults for real, so pinning them here keeps the
// canvas pixel-identical to what users see today.
//
// NOTE: this is deliberately NOT the 56px row that cardSizingContract.ts
// documents ("1 row = 56px in HA sections grid"). Honouring 56 is the correct
// end state for Home-Assistant-Sections parity, but it makes every card ~2.7x
// shorter and the card `h` heuristics need re-tuning first (content currently
// clips, and the fixed-size icon circles lack flex-shrink: 0). Tracked
// separately — do not change these numbers without re-baselining
// tests/e2e/layout.visual.spec.ts.
//
// MUST stay identical between the empty and populated grids below.
const GRID_CONFIG = {
  cols: 12,
  rowHeight: 150,
  margin: [10, 10],
  containerPadding: null,
} as const;

// Equivalent of v1's compactType="vertical" + allowOverlap/preventCollision=false.
// Built via getCompactor() rather than the bare `verticalCompactor` export, which
// is the raw compaction pass without the collision handling those flags implied.
// (This matches v2's own default; stated explicitly so the intent survives.)
const COMPACTOR = getCompactor('vertical', false, false);

// v2 defaults to a 3px drag threshold; v1 had none, and the legacy shim pins 0
// for compatibility. Kept at 0 so a click still registers as a click (card
// selection) rather than being swallowed as a micro-drag.
const DRAG_THRESHOLD = 0;

interface GridCanvasProps {
  view: View;
  selectedCardIndex: number | null;
  selectedCardIndices?: number[];
  onCardSelect: (
    cardIndex: number | null,
    options?: { mode?: 'replace' | 'toggle' | 'range' },
  ) => void;
  onLayoutChange: (layout: Layout) => void;
  onCardDrop?: (cardType: string, x?: number, y?: number) => void;
  onCardCut?: () => void;
  onCardCopy?: () => void;
  onCardPaste?: () => void;
  onCardDelete?: () => void;
  canPaste?: boolean;
}

// Generate layout positions for cards
// Supports three layout modes:
// 1. Layout-card grid (view_layout with grid positioning)
// 2. Internal layout (custom layout property)
// 3. Smart masonry (auto-calculated based on content)
const generateLayout = (view: View, cards: Card[]): Layout => {
  // Mode 1: Check if using layout-card grid system
  if (isLayoutCardGrid(view)) {
    const gridLayout = convertLayoutCardToGridLayout(view);
    return gridLayout;
  }

  // Mode 2: Check if cards have internal geometry (_havdm_layout)
  const hasExistingLayout = cards.some((card) => '_havdm_layout' in card && card._havdm_layout);

  if (hasExistingLayout) {
    // Use existing layout information with constraints
    const layouts = cards.map((card, index) => {
      if ('_havdm_layout' in card && card._havdm_layout) {
        const layout = card._havdm_layout as any;
        const constraints = getCardSizeConstraints(card);
        return {
          i: `card-${index}`,
          x: layout.x || 0,
          y: layout.y || 0,
          w: layout.w || constraints.w,
          h: layout.h || constraints.h,
          minW: constraints.minW,
          maxW: constraints.maxW,
          minH: constraints.minH,
          maxH: constraints.maxH,
        };
      }
      // Fallback for cards without layout - use constraints
      const constraints = getCardSizeConstraints(card);
      return {
        i: `card-${index}`,
        x: 0,
        y: index * 4,
        w: constraints.w,
        h: constraints.h,
        minW: constraints.minW,
        maxW: constraints.maxW,
        minH: constraints.minH,
        maxH: constraints.maxH,
      };
    });
    return layouts;
  }

  // Mode 3: Generate smart masonry layout based on card content with constraints
  const masonryLayout = generateMasonryLayout(cards);
  return masonryLayout;
};

export const GridCanvas: React.FC<GridCanvasProps> = ({
  view,
  selectedCardIndex,
  selectedCardIndices = [],
  onCardSelect,
  onLayoutChange,
  onCardDrop,
  onCardCut,
  onCardCopy,
  onCardPaste,
  onCardDelete,
  canPaste,
}) => {
  const cards = view.cards || [];
  const selectedCardSet = useMemo(() => new Set(selectedCardIndices), [selectedCardIndices]);
  const pendingSelectionModeRef = useRef<{ index: number; mode: 'toggle' | 'range' } | null>(null);

  const consumeSelectionMode = (
    index: number,
    event?: React.MouseEvent<HTMLElement>,
  ): 'replace' | 'toggle' | 'range' => {
    const pending = pendingSelectionModeRef.current;
    if (pending && pending.index === index) {
      pendingSelectionModeRef.current = null;
      return pending.mode;
    }

    if (event?.shiftKey) return 'range';
    if (event?.ctrlKey || event?.metaKey) return 'toggle';
    return 'replace';
  };

  // Generate layout for all cards
  const layout = useMemo(() => {
    return generateLayout(view, cards);
  }, [view, cards]);

  const handleLayoutChange = (newLayout: Layout) => {
    onLayoutChange(newLayout);
  };

  // DRAG_THRESHOLD is 0 so that a click still selects a card, which means every
  // click also completes a zero-distance drag and fires onDragStop. Committing
  // that would push a junk undo entry and clear the redo stack purely from
  // selecting a card, so ignore stops where the item did not actually move.
  const handleDragStop = (
    newLayout: Layout,
    oldItem: LayoutItem | null,
    newItem: LayoutItem | null,
  ) => {
    if (
      oldItem &&
      newItem &&
      oldItem.x === newItem.x &&
      oldItem.y === newItem.y &&
      oldItem.w === newItem.w &&
      oldItem.h === newItem.h
    ) {
      return;
    }
    onLayoutChange(newLayout);
  };

  // Simple drop handler - just adds card at bottom of layout
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!onCardDrop) return;

    const payload = e.dataTransfer.getData('text/plain');
    if (!payload) return;

    try {
      const data = JSON.parse(payload);
      const cardType = data.cardType;
      if (!cardType) return;

      // No explicit position: let the caller place the card below existing
      // content, matching where the vertical compactor renders it. Passing
      // (0, 0) here instead would store a position the grid never uses.
      onCardDrop(cardType);
    } catch (error) {
      logger.warn('Failed to parse drop data', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  if (cards.length === 0) {
    return (
      <div
        style={{ height: '100%', padding: '16px' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <GridLayout
          className="layout"
          layout={[]}
          width={1200}
          gridConfig={GRID_CONFIG}
          dragConfig={{ enabled: false, threshold: DRAG_THRESHOLD }}
          resizeConfig={{ enabled: false }}
          compactor={COMPACTOR}
          style={{
            backgroundColor: '#141414',
            minHeight: 'calc(100% - 32px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            key="empty-message"
            style={{
              color: '#666',
              fontSize: '16px',
              textAlign: 'center',
              width: '100%',
              pointerEvents: 'none',
            }}
          >
            No cards in this view. Drag cards from the palette to add them.
          </div>
        </GridLayout>
      </div>
    );
  }

  return (
    <div
      style={{ height: '100%', overflow: 'auto', padding: '16px' }}
      onMouseDown={(event) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;
        if (target.closest('[data-testid="canvas-card"]')) return;
        if (selectedCardIndex !== null || selectedCardIndices.length > 0) {
          onCardSelect(null, { mode: 'replace' });
        }
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <GridLayout
        className="layout"
        layout={layout}
        width={1200}
        gridConfig={GRID_CONFIG}
        onDragStop={handleDragStop}
        onResizeStop={handleLayoutChange}
        dragConfig={{ enabled: true, cancel: '.swiper', threshold: DRAG_THRESHOLD }}
        resizeConfig={{ enabled: true }}
        compactor={COMPACTOR}
        style={{
          backgroundColor: '#141414',
          minHeight: '100%',
        }}
      >
        {cards.map((card, index) => (
          <div key={`card-${index}`} style={{ overflow: 'hidden' }}>
            <div
              data-testid="canvas-card"
              style={{ height: '100%', width: '100%', position: 'relative' }}
            >
              {(() => {
                const backgroundStyle = getBackgroundLayerStyle((card as { style?: string }).style);
                if (!backgroundStyle) return null;
                return (
                  <div
                    data-testid="card-background-layer"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 8,
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      data-testid="card-background-layer-visual"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 8,
                        overflow: 'hidden',
                        ...backgroundStyle,
                      }}
                    />
                  </div>
                );
              })()}
              <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <div
                  style={{ height: '100%' }}
                  onMouseDownCapture={(event) => {
                    if (event.shiftKey) {
                      pendingSelectionModeRef.current = { index, mode: 'range' };
                      return;
                    }
                    if (event.ctrlKey || event.metaKey) {
                      pendingSelectionModeRef.current = { index, mode: 'toggle' };
                      return;
                    }
                    pendingSelectionModeRef.current = null;
                  }}
                >
                  <CardContextMenu
                    onCut={() => {
                      if (!selectedCardSet.has(index)) {
                        onCardSelect(index, { mode: 'replace' });
                      }
                      onCardCut?.();
                    }}
                    onCopy={() => {
                      if (!selectedCardSet.has(index)) {
                        onCardSelect(index, { mode: 'replace' });
                      }
                      onCardCopy?.();
                    }}
                    onPaste={() => {
                      if (!selectedCardSet.has(index)) {
                        onCardSelect(index, { mode: 'replace' });
                      }
                      onCardPaste?.();
                    }}
                    onDelete={() => {
                      if (!selectedCardSet.has(index)) {
                        onCardSelect(index, { mode: 'replace' });
                      }
                      onCardDelete?.();
                    }}
                    canPaste={canPaste ?? false}
                  >
                    <BaseCard
                      card={card}
                      isSelected={selectedCardSet.has(index)}
                      onClick={(event) => {
                        onCardSelect(index, { mode: consumeSelectionMode(index, event) });
                      }}
                    />
                  </CardContextMenu>
                </div>
              </div>
            </div>
          </div>
        ))}
      </GridLayout>
    </div>
  );
};
