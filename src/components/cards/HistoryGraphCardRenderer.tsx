import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import { HistoryGraphCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { useEntityContextResolver } from '../../hooks/useEntityContext';

const { Text } = Typography;

interface HistoryGraphCardRendererProps {
  card: HistoryGraphCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for History Graph card type
 * Displays historical data for multiple entities as a timeline graph
 */
export const HistoryGraphCardRenderer: React.FC<HistoryGraphCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const resolveContext = useEntityContextResolver();

  // Extract card properties
  const entities = card.entities || [];
  const hoursToShow = card.hours_to_show || 24;
  const backgroundStyle = getCardBackgroundStyle(card.style, isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f');
  const defaultEntityId = entities.length > 0 ? (typeof entities[0] === 'string' ? entities[0] : entities[0].entity) : null;
  const resolvedTitle = card.title ? resolveContext(card.title, defaultEntityId ?? null) : '';
  const title = (card.title ? resolvedTitle : '') || 'History';

  // Get entity data
  const entityData = entities.map(entityConfig => {
    const entityId = typeof entityConfig === 'string' ? entityConfig : entityConfig.entity;
    const entity = getEntity(entityId);
    const attributes = entity?.attributes || {};
    const nameTemplate = typeof entityConfig === 'object' && entityConfig.name ? entityConfig.name : '';
    const name = nameTemplate
      ? resolveContext(nameTemplate, entityId)
      : attributes.friendly_name || entityId.split('.')[1]?.replace(/_/g, ' ') || entityId;

    return {
      entityId,
      name,
      state: entity?.state || '0',
      unit: attributes.unit_of_measurement || '',
      color: getEntityColor(entityId, entities.indexOf(entityConfig)),
    };
  });

  // Generate colors for entities
  function getEntityColor(entityId: string, index: number): string {
    const colors = [
      '#03a9f4', // Blue
      '#4caf50', // Green
      '#ff9800', // Orange
      '#e91e63', // Pink
      '#9c27b0', // Purple
      '#00bcd4', // Cyan
      '#ffc107', // Amber
      '#f44336', // Red
    ];
    return colors[index % colors.length];
  }

  // Generate simple mock historical data for visualization
  const generateHistoryData = (entityData: typeof entityData[0]) => {
    const points: { x: number; y: number }[] = [];
    const numericState = parseFloat(entityData.state);

    if (isNaN(numericState)) return '';

    // Generate simplified historical trend
    for (let i = 0; i < 50; i++) {
      const variance = (Math.sin(i / 5) * 20 + (Math.random() - 0.5) * 10);
      points.push({
        x: (i / 49) * 100,
        y: Math.max(0, Math.min(100, 50 + variance)),
      });
    }

    return points.map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${p.x} ${100 - p.y}`
    ).join(' ');
  };

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
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '12px',
      },
      }}
      onClick={onClick}
      hoverable
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Text strong style={{ color: '#e6e6e6', fontSize: '14px' }}>
          {title}
        </Text>
        <LineChartOutlined style={{ fontSize: '16px', color: '#999' }} />
      </div>

      {/* Time range indicator */}
      <Text type="secondary" style={{ fontSize: '11px' }}>
        Last {hoursToShow} hours
      </Text>

      {/* Graph area */}
      <div style={{
        flex: 1,
        position: 'relative',
        minHeight: '100px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '4px',
        padding: '8px',
      }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {/* Grid lines */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

          {/* Entity history lines */}
          {entityData.map((entity) => (
            <path
              key={entity.entityId}
              d={generateHistoryData(entity)}
              fill="none"
              stroke={entity.color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              opacity="0.8"
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: 'auto',
      }}>
        {entityData.map((entity) => (
          <div
            key={entity.entityId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: entity.color,
              }}
            />
            <Text style={{ fontSize: '11px', color: '#999' }}>
              {entity.name}
            </Text>
            <Text strong style={{ fontSize: '11px', color: entity.color }}>
              {entity.state}{entity.unit}
            </Text>
          </div>
        ))}
      </div>

      {/* No entities warning */}
      {entities.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#666',
        }}>
          <LineChartOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
          <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
            No entities configured
          </Text>
        </div>
      )}
    </AntCard>
  );
};
