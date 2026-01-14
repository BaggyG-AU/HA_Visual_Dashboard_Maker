import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { DashboardOutlined, BulbOutlined } from '@ant-design/icons';
import { GlanceCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useEntityContextResolver } from '../../hooks/useEntityContext';

const { Text } = Typography;

interface GlanceCardRendererProps {
  card: GlanceCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Glance card type
 * Displays entities in a compact grid layout
 */
export const GlanceCardRenderer: React.FC<GlanceCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const resolveContext = useEntityContextResolver();
  const defaultEntityId = Array.isArray(card.entities)
    ? (typeof card.entities[0] === 'string' ? card.entities[0] : card.entities[0]?.entity)
    : null;
  const resolvedTitle = card.title ? resolveContext(card.title, defaultEntityId ?? null) : '';
  const title = (card.title ? resolvedTitle : '') || 'Glance';
  const entityCount = Array.isArray(card.entities) ? card.entities.length : 0;
  const columns = card.columns || 5;
  const backgroundStyle = getCardBackgroundStyle(card.style, isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f');

  // Extract entity IDs for display
  const getEntityId = (entity: any): string => {
    if (typeof entity === 'string') return entity;
    if (typeof entity === 'object' && entity?.entity) return entity.entity;
    return 'unknown';
  };

  const getEntityName = (entity: any): string => {
    if (typeof entity === 'object' && entity?.name) {
      const entityId = getEntityId(entity);
      return resolveContext(entity.name, entityId);
    }
    const id = getEntityId(entity);
    return id.split('.')[1]?.replace(/_/g, ' ') || id;
  };

  return (
    <AntCard
      size="small"
      title={
        card.title && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DashboardOutlined style={{ color: '#00d9ff' }} />
            <span style={{ fontSize: '14px' }}>{title}</span>
          </div>
        )
      }
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        ...backgroundStyle,
        transition: 'all 0.3s ease',
      }}
      styles={{
        body: {
        padding: '12px',
        maxHeight: card.title ? 'calc(100% - 46px)' : '100%',
        overflowY: 'auto',
      },
      }}
      onClick={onClick}
      hoverable
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(columns, entityCount)}, 1fr)`,
          gap: '12px',
        }}
      >
        {Array.isArray(card.entities) &&
          card.entities.map((entity, idx) => {
            const entityName = getEntityName(entity);

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '4px',
                }}
              >
                <BulbOutlined style={{ fontSize: '20px', color: '#00d9ff' }} />
                {card.show_name !== false && (
                  <Text
                    style={{
                      color: '#e6e6e6',
                      fontSize: '11px',
                      textAlign: 'center',
                      textTransform: 'capitalize',
                      lineHeight: '1.2',
                    }}
                    ellipsis={{ tooltip: entityName }}
                  >
                    {entityName}
                  </Text>
                )}
                {card.show_state !== false && (
                  <Text type="secondary" style={{ fontSize: '10px' }}>
                    --
                  </Text>
                )}
              </div>
            );
          })}
      </div>
    </AntCard>
  );
};
