import React, { useMemo } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import { View, Card } from '../types/dashboard';
import { BaseCard } from './BaseCard';
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
// If cards don't have layout info, we'll position them in a 2-column grid
const generateLayout = (cards: Card[]): Layout[] => {
  const layouts = cards.map((card, index) => {
    // Check if card has layout information
    const hasLayout = 'layout' in card && card.layout;

    if (hasLayout) {
      const layout = card.layout as any;
      const result = {
        i: `card-${index}`,
        x: layout.x || 0,
        y: layout.y || 0,
        w: layout.w || 6,
        h: layout.h || 4,
      };
      console.log(`generateLayout: card-${index} (${card.type}) has layout:`, result);
      return result;
    }

    // Auto-layout: 2 cards per row, 6 columns each (12-column grid)
    const row = Math.floor(index / 2);
    const col = (index % 2) * 6;

    const result = {
      i: `card-${index}`,
      x: col,
      y: row * 4,
      w: 6, // Half of 12 columns
      h: 4, // 4 rows high
    };
    console.log(`generateLayout: card-${index} (${card.type}) auto-layout:`, result);
    return result;
  });

  console.log('generateLayout: total layouts generated:', layouts);
  return layouts;
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
