import React from 'react';
import { Card as AntCard, Typography, Space } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';
import { CustomCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { useEntityContextValue } from '../../hooks/useEntityContext';

const { Text } = Typography;

interface MiniGraphCardRendererProps {
  card: CustomCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Mini Graph Card (custom HACS card)
 * Repository: https://github.com/kalkih/mini-graph-card
 * Version Support: v0.13.0+
 *
 * A compact graph card that shows entity history with many customization options
 * v0.12.0+: icon_image support (image URL override for icon)
 * v0.13.0+: show_legend_state option, loader component
 */
export const MiniGraphCardRenderer: React.FC<MiniGraphCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();

  // Mini graph card supports multiple entities
  const entities = card.entities || (card.entity ? [card.entity] : []);
  const primaryEntity = entities[0];
  const entity = typeof primaryEntity === 'string' ? getEntity(primaryEntity) : getEntity(primaryEntity?.entity);
  const primaryEntityId = typeof primaryEntity === 'string' ? primaryEntity : primaryEntity?.entity;

  // Extract properties
  const state = entity?.state || '--';
  const attributes = entity?.attributes || {};
  const unit = attributes.unit_of_measurement || '';
  const resolvedName = useEntityContextValue(card.name ?? '', primaryEntityId ?? null);
  const displayName =
    (card.name ? resolvedName : '') ||
    attributes.friendly_name ||
    (typeof primaryEntity === 'string' ? primaryEntity.split('.')[1]?.replace(/_/g, ' ') : '') ||
    'Sensor';

  // Card configuration
  const showName = card.show?.name !== false;
  const showState = card.show?.state !== false;
  const showGraph = card.show?.graph !== 'false';
  const showIcon = card.show?.icon !== false;
  const iconImage = card.icon_image; // v0.12.0: Image URL to override icon
  const hours = card.hours_to_show || 24;
  const points = card.points_per_hour || 0.5;
  const lineColor = card.color || '#03a9f4';
  const backgroundStyle = getCardBackgroundStyle(card.style, isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f');

  // Generate simple graph visualization
  const generateGraphPoints = () => {
    const numPoints = Math.floor(hours * points);
    const dataPoints: { x: number; y: number }[] = [];

    // Generate random-ish data for visualization (in real app, would come from history)
    const baseValue = parseFloat(state) || 50;
    for (let i = 0; i < Math.min(numPoints, 48); i++) {
      const variance = (Math.sin(i / 5) + Math.random() - 0.5) * 10;
      dataPoints.push({
        x: (i / numPoints) * 100,
        y: 50 + (baseValue - 50) / 2 + variance,
      });
    }
    return dataPoints;
  };

  const graphPoints = generateGraphPoints();
  const pathData = graphPoints.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${100 - p.y}`
  ).join(' ');

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
        gap: '8px',
      },
      }}
      onClick={onClick}
      hoverable
    >
      {/* Header with name and state */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '4px',
      }}>
        <Space size={8}>
          {showIcon && (
            iconImage ? (
              <img
                src={iconImage}
                alt="icon"
                style={{
                  width: '16px',
                  height: '16px',
                  objectFit: 'contain',
                  borderRadius: '2px',
                }}
              />
            ) : (
              <DashboardOutlined style={{ fontSize: '16px', color: lineColor }} />
            )
          )}
          {showName && (
            <Text strong style={{ color: '#e6e6e6', fontSize: '13px' }}>
              {displayName}
            </Text>
          )}
        </Space>

        {showState && (
          <Text
            strong
            style={{
              color: lineColor,
              fontSize: '16px',
            }}
          >
            {state} {unit}
          </Text>
        )}
      </div>

      {/* Graph visualization */}
      {showGraph && (
        <div style={{
          flex: 1,
          position: 'relative',
          minHeight: '60px',
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
            }}
          >
            {/* Fill area under line */}
            <path
              d={`${pathData} L 100 100 L 0 100 Z`}
              fill={`${lineColor}22`}
              stroke="none"
            />

            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke={lineColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}

      {/* Entity count indicator for multiple entities */}
      {entities.length > 1 && (
        <div style={{ marginTop: 'auto' }}>
          <Text type="secondary" style={{ fontSize: '10px' }}>
            {entities.length} entities • {hours}h
          </Text>
        </div>
      )}

      {/* Mini Graph badge indicator */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          padding: '2px 6px',
          backgroundColor: 'rgba(3, 169, 244, 0.2)',
          border: '1px solid #03a9f4',
          borderRadius: '4px',
          fontSize: '9px',
          color: '#03a9f4',
          fontWeight: 'bold',
          pointerEvents: 'none',
        }}>
          MINI-GRAPH
        </div>
      )}

      {/* Entity ID (when no entity data) */}
      {!entity && primaryEntity && (
        <div style={{ textAlign: 'center', marginTop: 'auto' }}>
          <Text type="secondary" style={{ fontSize: '10px' }}>
            {typeof primaryEntity === 'string' ? primaryEntity : primaryEntity.entity}
          </Text>
        </div>
      )}
    </AntCard>
  );
};
