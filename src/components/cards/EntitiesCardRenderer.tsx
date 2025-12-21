import React from 'react';
import { Card as AntCard, Typography, Space, Tag } from 'antd';
import { AppstoreOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { EntitiesCard } from '../../types/dashboard';

const { Text } = Typography;

interface EntitiesCardRendererProps {
  card: EntitiesCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Entities card type
 * Displays a list of entities with their current states
 */
export const EntitiesCardRenderer: React.FC<EntitiesCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const title = card.title || card.name || 'Entities';
  const entityCount = Array.isArray(card.entities) ? card.entities.length : 0;

  // Extract entity IDs for display
  const getEntityId = (entity: any): string => {
    if (typeof entity === 'string') return entity;
    if (typeof entity === 'object' && entity?.entity) return entity.entity;
    return 'unknown';
  };

  return (
    <AntCard
      size="small"
      title={
        card.title ? (
          <div style={{
            fontSize: '16px',
            fontWeight: 500,
            color: '#e1e1e1',
            padding: '0',
          }}>
            {title}
          </div>
        ) : undefined
      }
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        backgroundColor: isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
        transition: 'all 0.3s ease',
        borderRadius: '12px',
      }}
      headStyle={{
        padding: card.title ? '12px 16px 8px 16px' : '0',
        minHeight: card.title ? '40px' : '0',
        borderBottom: 'none',
      }}
      bodyStyle={{
        padding: '0 16px 12px 16px',
        paddingTop: card.title ? '0' : '12px',
        height: card.title ? 'calc(100% - 40px)' : '100%',
        overflowY: 'auto',
      }}
      onClick={onClick}
      hoverable
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        {Array.isArray(card.entities) && card.entities.slice(0, 10).map((entity, idx) => {
          const entityId = getEntityId(entity);
          const entityName =
            typeof entity === 'object' && entity?.name
              ? entity.name
              : entityId.split('.')[1]?.replace(/_/g, ' ');

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: '40px',
                padding: '0 8px',
                gap: '12px',
                borderBottom: idx < (Array.isArray(card.entities) ? Math.min(card.entities.length, 10) - 1 : 0) ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px', flexShrink: 0 }} />
                <Text
                  style={{
                    color: '#e1e1e1',
                    fontSize: '14px',
                    textTransform: 'capitalize',
                    fontWeight: 400,
                  }}
                  ellipsis={{ tooltip: entityName }}
                >
                  {entityName}
                </Text>
              </div>
              <Text style={{
                color: '#9e9e9e',
                fontSize: '14px',
                flexShrink: 0,
              }}>
                on
              </Text>
            </div>
          );
        })}
        {entityCount > 10 && (
          <Text type="secondary" style={{ fontSize: '12px', padding: '8px' }}>
            +{entityCount - 10} more
          </Text>
        )}
      </div>
    </AntCard>
  );
};
