import React, { useMemo } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import { View, Card } from '../types/dashboard';
import { BaseCard } from './BaseCard';
import { generateMasonryLayout } from '../utils/cardDimensions';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './GridCanvas.css';

interface GridCanvasProps {
  view: View;
  selectedCardIndex: number | null;
  onCardSelect: (cardIndex: number) => void;
  onLayoutChange: (layout: Layout[]) => void;
  onCardDrop?: (cardType: string, x: number, y: number) => void;
}

// Generate layout positions for cards
// Uses smart masonry-like layout based on card content
const generateLayout = (cards: Card[]): Layout[] => {
  // Check if cards already have layout information
  const hasExistingLayout = cards.some(card => 'layout' in card && card.layout);

  if (hasExistingLayout) {
    // Use existing layout information
    const layouts = cards.map((card, index) => {
      if ('layout' in card && card.layout) {
        const layout = card.layout as any;
        return {
          i: `card-${index}`,
          x: layout.x || 0,
          y: layout.y || 0,
          w: layout.w || 6,
          h: layout.h || 4,
        };
      }
      // Fallback for cards without layout
      return {
        i: `card-${index}`,
        x: 0,
        y: index * 4,
        w: 6,
        h: 4,
      };
    });
    console.log('generateLayout: Using existing layout information');
    return layouts;
  }

  // Generate smart masonry layout based on card content
  const masonryLayout = generateMasonryLayout(cards);
  console.log('generateLayout: Generated masonry layout:', masonryLayout);
  return masonryLayout;
};

export const GridCanvas: React.FC<GridCanvasProps> = ({
  view,
  selectedCardIndex,
  onCardSelect,
  onLayoutChange,
  onCardDrop,
}) => {
  const cards = view.cards || [];

  console.log('GridCanvas render - cards:', cards);

  // Generate layout for all cards
  const layout = useMemo(() => {
    console.log('useMemo running - generating layout for', cards.length, 'cards');
    return generateLayout(cards);
  }, [cards]);

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

      console.log('=== DROP EVENT ===');
      console.log('Card type:', cardType);
      console.log('Adding card at default position (will go to bottom)');

      // Just add at 0,0 - react-grid-layout will auto-position to bottom with compactType="vertical"
      onCardDrop(cardType, 0, 0);
    } catch (error) {
      console.error('Failed to parse drop data:', error);
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
          rowHeight={30}
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
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={1200}
        onLayoutChange={handleLayoutChange}
        onDragStop={handleLayoutChange}
        onResizeStop={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
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
            <BaseCard
              card={card}
              isSelected={selectedCardIndex === index}
              onClick={() => onCardSelect(index)}
            />
          </div>
        ))}
      </GridLayout>
    </div>
  );
};
