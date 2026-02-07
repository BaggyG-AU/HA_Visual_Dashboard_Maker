import React, { useMemo } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
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

interface GridCanvasProps {
  view: View;
  selectedCardIndex: number | null;
  onCardSelect: (cardIndex: number | null) => void;
  onLayoutChange: (layout: Layout[]) => void;
  onCardDrop?: (cardType: string, x: number, y: number) => void;
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
const generateLayout = (view: View, cards: Card[]): Layout[] => {
  // Mode 1: Check if using layout-card grid system
  if (isLayoutCardGrid(view)) {
    const gridLayout = convertLayoutCardToGridLayout(view);
    return gridLayout;
  }

  // Mode 2: Check if cards have internal layout property
  const hasExistingLayout = cards.some(card => 'layout' in card && card.layout);

  if (hasExistingLayout) {
    // Use existing layout information with constraints
    const layouts = cards.map((card, index) => {
      if ('layout' in card && card.layout) {
        const layout = card.layout as any;
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

  // Generate layout for all cards
  const layout = useMemo(() => {
    return generateLayout(view, cards);
  }, [view, cards]);

  const handleLayoutChange = (newLayout: Layout[]) => {
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

      // Just add at 0,0 - react-grid-layout will auto-position to bottom with compactType="vertical"
      onCardDrop(cardType, 0, 0);
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
          cols={12}
          rowHeight={56}
          width={1200}
          onLayoutChange={handleLayoutChange}
          isDraggable={false}
          isResizable={false}
          compactType="vertical"
          useCSSTransforms={true}
          margin={[16, 16]}
          containerPadding={[0, 0]}
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
        if (selectedCardIndex !== null) {
          onCardSelect(null);
        }
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={56}
        width={1200}
        onLayoutChange={handleLayoutChange}
        onDragStop={handleLayoutChange}
        onResizeStop={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
        draggableCancel=".swiper"
        compactType="vertical"
        preventCollision={false}
        allowOverlap={false}
        useCSSTransforms={true}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        style={{
          backgroundColor: '#141414',
          minHeight: '100%',
        }}
      >
        {cards.map((card, index) => (
          <div key={`card-${index}`} style={{ overflow: 'hidden' }}>
            <div data-testid="canvas-card" style={{ height: '100%', width: '100%', position: 'relative' }}>
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
                <CardContextMenu
                  onCut={() => {
                    onCardSelect(index);
                    onCardCut?.();
                  }}
                  onCopy={() => {
                    onCardSelect(index);
                    onCardCopy?.();
                  }}
                  onPaste={() => {
                    onCardSelect(index);
                    onCardPaste?.();
                  }}
                  onDelete={() => {
                    onCardSelect(index);
                    onCardDelete?.();
                  }}
                  canPaste={canPaste ?? false}
                >
                  <BaseCard
                    card={card}
                    isSelected={selectedCardIndex === index}
                    onClick={() => onCardSelect(index)}
                  />
                </CardContextMenu>
              </div>
            </div>
          </div>
        ))}
      </GridLayout>
    </div>
  );
};
