import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { BorderVerticleOutlined } from '@ant-design/icons';
import { CustomCard } from '../../types/dashboard';
import { useEntityContextResolver } from '../../hooks/useEntityContext';

const { Text } = Typography;

interface VerticalStackInCardRendererProps {
  card: CustomCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Vertical Stack in Card (custom HACS card)
 * Repository: https://github.com/ofekashery/vertical-stack-in-card
 *
 * Vertical-stack-in-card displays multiple cards in a vertical stack
 * within a single bordered container, unlike the standard vertical-stack
 * which doesn't have a surrounding card border.
 *
 * Supports:
 * - `cards` array property
 * - `title` property for optional header
 * - `horizontal` property for horizontal layout variant
 */
export const VerticalStackInCardRenderer: React.FC<VerticalStackInCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  // Extract configuration
  const cards = (card as any).cards || [];
  const resolveContext = useEntityContextResolver();
  const defaultEntityId = cards.find((child: any) => typeof child?.entity === 'string')?.entity ?? null;
  const titleTemplate = (card as any).title as string | undefined;
  const resolvedTitle = titleTemplate ? resolveContext(titleTemplate, defaultEntityId) : '';
  const title = titleTemplate ? resolvedTitle : undefined;
  const horizontal = (card as any).horizontal;

  const cardCount = cards.length;

  // Get card type summary
  const getCardTypeSummary = () => {
    const types: Record<string, number> = {};
    cards.forEach((c: any) => {
      const type = c.type || 'unknown';
      types[type] = (types[type] || 0) + 1;
    });
    return Object.entries(types)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  const cardTypes = getCardTypeSummary();

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
        title={
          title && (
            <Text strong style={{ color: '#fff', fontSize: '13px' }}>
              {title}
            </Text>
          )
        }
        style={{
          height: '100%',
          border: isSelected ? '2px solid #1890ff' : '1px solid #434343',
          backgroundColor: '#1a1a1a',
          boxShadow: isSelected ? '0 0 10px rgba(24, 144, 255, 0.3)' : 'none',
        }}
        bodyStyle={{
          padding: '12px',
          height: title ? 'calc(100% - 48px)' : '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        headStyle={{
          backgroundColor: '#252525',
          border: 'none',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <BorderVerticleOutlined style={{ fontSize: '20px', color: '#722ed1' }} />
          <Text strong style={{ color: '#fff', fontSize: '14px' }}>
            {horizontal ? 'Horizontal' : 'Vertical'} Stack in Card
          </Text>
        </div>

        {/* Card Count */}
        <div style={{ marginBottom: '12px' }}>
          <Text style={{ color: '#888', fontSize: '12px' }}>
            Contains: <Text strong style={{ color: '#fff' }}>{cardCount}</Text> card{cardCount !== 1 ? 's' : ''}
          </Text>
        </div>

        {/* Card Type Summary */}
        {cardTypes.length > 0 ? (
          <div
            style={{
              flex: 1,
              backgroundColor: '#0a0a0a',
              border: '1px solid #333',
              borderRadius: '4px',
              padding: '12px',
              overflow: 'auto',
            }}
          >
            <Text style={{ color: '#888', fontSize: '11px', marginBottom: '8px', display: 'block' }}>
              Card Types:
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {cardTypes.map(([type, count], idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '4px',
                      height: '24px',
                      backgroundColor: '#722ed1',
                      borderRadius: '2px',
                    }}
                  />
                  <Text code style={{ fontSize: '11px', color: '#fff' }}>
                    {type}
                  </Text>
                  <div style={{ flex: 1 }} />
                  <Text style={{ color: '#888', fontSize: '11px' }}>×{count}</Text>
                </div>
              ))}
              {cardCount > 3 && (
                <Text style={{ color: '#666', fontSize: '11px', fontStyle: 'italic', marginTop: '4px' }}>
                  ... and {cardCount - cardTypes.reduce((sum, [, count]) => sum + count, 0)} more
                </Text>
              )}
            </div>
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
            No cards configured
          </div>
        )}

        {/* Footer Note */}
        <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #333' }}>
          <Text style={{ color: '#666', fontSize: '10px' }}>
            Stacks cards {horizontal ? 'horizontally' : 'vertically'} in a single bordered container
          </Text>
        </div>
      </AntCard>
    </div>
  );
};
