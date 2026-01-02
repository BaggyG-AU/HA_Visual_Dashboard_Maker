import React from 'react';
import { Card as AntCard, Typography, Alert } from 'antd';
import { FormatPainterOutlined, WarningOutlined } from '@ant-design/icons';
import { CustomCard } from '../../types/dashboard';

const { Text } = Typography;

interface CardModCardRendererProps {
  card: CustomCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Card-mod (custom HACS card)
 * Repository: https://github.com/thomasloven/lovelace-card-mod
 *
 * Card-mod applies custom CSS styling to any Home Assistant card.
 * Supports:
 * - `style` property: CSS string or object
 * - Wrapped card via `card` property
 * - `card_mod` property on any card type
 *
 * Security Note: This renderer displays CSS as text only.
 * No actual CSS injection occurs in the editor preview.
 */
export const CardModCardRenderer: React.FC<CardModCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  // Extract style information
  const style = card.style || '';
  const wrappedCard = card.card;
  const cardMod = (card as any).card_mod;

  // Determine if this is a standalone card-mod or an inline card_mod property
  const isStandalone = card.type === 'custom:card-mod';
  const hasStyle = !!(style || cardMod);

  // Get preview text for styles
  const getStylePreview = (): string => {
    if (typeof style === 'string') {
      return style.substring(0, 100) + (style.length > 100 ? '...' : '');
    }
    if (cardMod && typeof cardMod === 'object') {
      return JSON.stringify(cardMod, null, 2).substring(0, 100) + '...';
    }
    if (typeof style === 'object') {
      return JSON.stringify(style, null, 2).substring(0, 100) + '...';
    }
    return 'No styles defined';
  };

  const stylePreview = getStylePreview();

  return (
    <div
      style={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onClick={onClick}
    >
      <AntCard
        bordered
        style={{
          height: '100%',
          border: isSelected ? '2px solid #1890ff' : '1px solid #434343',
          backgroundColor: '#1a1a1a',
          boxShadow: isSelected ? '0 0 10px rgba(24, 144, 255, 0.3)' : 'none',
        }}
        bodyStyle={{
          padding: '12px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <FormatPainterOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          <Text strong style={{ color: '#fff', fontSize: '14px' }}>
            Card-mod Styling
          </Text>
        </div>

        {/* Security Warning */}
        {hasStyle && (
          <Alert
            message="Preview Only"
            description="Custom CSS styles are shown as text. They will only apply in Home Assistant."
            type="info"
            showIcon
            icon={<WarningOutlined />}
            style={{ marginBottom: '12px', fontSize: '11px' }}
          />
        )}

        {/* Wrapped Card Info */}
        {wrappedCard && (
          <div style={{ marginBottom: '12px' }}>
            <Text style={{ color: '#888', fontSize: '12px' }}>
              Wraps: <Text code style={{ fontSize: '11px' }}>{wrappedCard.type || 'unknown'}</Text>
            </Text>
          </div>
        )}

        {/* Style Preview */}
        {hasStyle ? (
          <div
            style={{
              flex: 1,
              backgroundColor: '#0a0a0a',
              border: '1px solid #333',
              borderRadius: '4px',
              padding: '8px',
              overflow: 'auto',
            }}
          >
            <Text
              code
              style={{
                color: '#52c41a',
                fontSize: '11px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {stylePreview}
            </Text>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: '12px',
              fontStyle: 'italic',
            }}
          >
            No custom styles defined
          </div>
        )}

        {/* Footer Note */}
        {isStandalone && (
          <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #333' }}>
            <Text style={{ color: '#666', fontSize: '10px' }}>
              Custom CSS styling layer for Home Assistant cards
            </Text>
          </div>
        )}
      </AntCard>
    </div>
  );
};
