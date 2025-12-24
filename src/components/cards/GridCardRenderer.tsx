import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { GridCard } from '../../types/dashboard';
import { BaseCard } from '../BaseCard';

const { Text } = Typography;

interface GridCardRendererProps {
  card: GridCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Grid card type
 * Displays child cards in a grid layout
 * Matches Home Assistant's grid card behavior
 */
export const GridCardRenderer: React.FC<GridCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const childCards = card.cards || [];
  const columns = card.columns || 3; // Default to 3 columns
  const square = card.square !== false; // Default to square cells
  const hasTitle = !!card.title;

  // If no child cards, show placeholder
  if (childCards.length === 0) {
    return (
      <AntCard
        size="small"
        style={{
          height: '100%',
          cursor: 'pointer',
          border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
          backgroundColor: isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
          transition: 'all 0.3s ease',
        }}
        styles={{
        body: {
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: '8px',
        },
      }}
        onClick={onClick}
        hoverable
      >
        <AppstoreOutlined style={{ fontSize: '32px', color: '#666' }} />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Grid Card
        </Text>
        <Text type="secondary" style={{ fontSize: '11px' }}>
          (No cards)
        </Text>
      </AntCard>
    );
  }

  return (
    <AntCard
      size="small"
      title={hasTitle ? card.title : undefined}
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        backgroundColor: isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
        transition: 'all 0.3s ease',
      }}
      headStyle={{
        borderBottom: '1px solid #434343',
        color: '#e6e6e6',
        fontSize: '14px',
        fontWeight: 'bold',
      }}
      bodyStyle={{
        padding: '12px',
        height: hasTitle ? 'calc(100% - 48px)' : '100%',
        overflow: 'auto',
      }}
      onClick={onClick}
      hoverable
    >
      {/* Grid layout container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '12px',
        height: '100%',
        gridAutoRows: square ? '1fr' : 'auto',
      }}>
        {childCards.map((childCard, index) => (
          <div
            key={index}
            style={{
              minHeight: square ? '0' : '100px',
              aspectRatio: square ? '1 / 1' : 'auto',
            }}
          >
            <BaseCard
              card={childCard}
              isSelected={false}
              onClick={(e) => {
                e?.stopPropagation();
              }}
            />
          </div>
        ))}
      </div>

      {/* Grid indicator overlay when selected */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          padding: '4px 8px',
          backgroundColor: 'rgba(0, 217, 255, 0.2)',
          border: '1px solid #00d9ff',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#00d9ff',
          fontWeight: 'bold',
          pointerEvents: 'none',
        }}>
          <AppstoreOutlined style={{ marginRight: '4px' }} />
          GRID ({columns} cols)
        </div>
      )}
    </AntCard>
  );
};
