import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { BorderHorizontalOutlined } from '@ant-design/icons';
import { HorizontalStackCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { BaseCard } from '../BaseCard';

const { Text } = Typography;

interface HorizontalStackCardRendererProps {
  card: HorizontalStackCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Horizontal Stack card type
 * Displays child cards in a horizontal row
 * Matches Home Assistant's horizontal-stack behavior
 */
export const HorizontalStackCardRenderer: React.FC<HorizontalStackCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const childCards = card.cards || [];
  const hasTitle = !!card.title;
  const backgroundStyle = getCardBackgroundStyle(card.style, isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f');

  // If no child cards, show placeholder
  if (childCards.length === 0) {
    return (
      <AntCard
        size="small"
        style={{
          height: '100%',
          cursor: 'pointer',
          border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
          ...backgroundStyle,
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
        <BorderHorizontalOutlined style={{ fontSize: '32px', color: '#666' }} />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Horizontal Stack
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
        ...backgroundStyle,
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
        overflow: 'hidden',
      }}
      onClick={onClick}
      hoverable
    >
      {/* Horizontal layout container */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        height: '100%',
        overflow: 'auto',
      }}>
        {childCards.map((childCard, index) => (
          <div
            key={index}
            style={{
              flex: '1 1 0',
              minWidth: '150px',
              height: '100%',
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

      {/* Stack indicator overlay when selected */}
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
          <BorderHorizontalOutlined style={{ marginRight: '4px' }} />
          HORIZONTAL STACK
        </div>
      )}
    </AntCard>
  );
};
