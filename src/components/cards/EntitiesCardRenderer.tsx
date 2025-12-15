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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AppstoreOutlined style={{ color: '#00d9ff' }} />
          <span style={{ fontSize: '14px' }}>{title}</span>
          <Tag color="blue" style={{ fontSize: '10px', marginLeft: 'auto' }}>
            {entityCount} {entityCount === 1 ? 'entity' : 'entities'}
          </Tag>
        </div>
      }
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        backgroundColor: isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
        transition: 'all 0.3s ease',
      }}
      bodyStyle={{
        padding: '8px 12px',
        maxHeight: 'calc(100% - 46px)',
        overflowY: 'auto',
      }}
      onClick={onClick}
      hoverable
    >
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
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
                gap: '8px',
                padding: '6px 8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            >
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <Text
                  style={{ color: '#e6e6e6', fontSize: '12px', textTransform: 'capitalize' }}
                  ellipsis={{ tooltip: entityName }}
                >
                  {entityName}
                </Text>
                <div>
                  <Text type="secondary" style={{ fontSize: '10px' }} ellipsis>
                    {entityId}
                  </Text>
                </div>
              </div>
            </div>
          );
        })}
        {entityCount > 10 && (
          <Text type="secondary" style={{ fontSize: '11px', paddingLeft: '8px' }}>
            +{entityCount - 10} more {entityCount - 10 === 1 ? 'entity' : 'entities'}
          </Text>
        )}
      </Space>
    </AntCard>
  );
};
