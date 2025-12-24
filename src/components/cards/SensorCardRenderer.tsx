import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';
import { SensorCard } from '../../types/dashboard';
import { useHAEntities } from '../../contexts/HAEntityContext';

const { Text } = Typography;

interface SensorCardRendererProps {
  card: SensorCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Sensor card type
 * Displays a single sensor value with optional graph
 */
export const SensorCardRenderer: React.FC<SensorCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;

  // Extract sensor properties
  const state = entity?.state || '--';
  const attributes = entity?.attributes || {};
  const unit = attributes.unit_of_measurement || '';
  const deviceClass = attributes.device_class || '';

  const displayName = card.name || attributes.friendly_name || card.entity?.split('.')[1]?.replace(/_/g, ' ') || 'Sensor';
  const showGraph = card.graph !== 'none';

  // Get icon based on device class
  const getIcon = () => {
    switch (deviceClass) {
      case 'temperature':
        return '🌡️';
      case 'humidity':
        return '💧';
      case 'pressure':
        return '🔽';
      case 'battery':
        return '🔋';
      case 'power':
        return '⚡';
      case 'energy':
        return '⚡';
      default:
        return <DashboardOutlined />;
    }
  };

  // Generate simple trend line for visualization
  const generateTrendLine = () => {
    const points: { x: number; y: number }[] = [];
    const numericState = parseFloat(state);

    if (isNaN(numericState)) return '';

    // Generate simplified trend data
    for (let i = 0; i < 20; i++) {
      const variance = (Math.sin(i / 3) + Math.random() - 0.5) * 5;
      points.push({
        x: (i / 19) * 100,
        y: 50 + variance,
      });
    }

    return points.map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${p.x} ${100 - p.y}`
    ).join(' ');
  };

  const icon = getIcon();

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
        height: '100%',
        gap: '12px',
      },
      }}
      onClick={onClick}
      hoverable
    >
      {/* Header with icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{ fontSize: '28px', lineHeight: 1 }}>
          {icon}
        </div>
        <Text strong style={{ color: '#e6e6e6', fontSize: '14px' }}>
          {displayName}
        </Text>
      </div>

      {/* Large value display */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: '4px',
      }}>
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#e6e6e6',
          lineHeight: 1,
        }}>
          {state}
        </div>
        {unit && (
          <Text style={{ fontSize: '16px', color: '#999' }}>
            {unit}
          </Text>
        )}
      </div>

      {/* Optional graph */}
      {showGraph && !isNaN(parseFloat(state)) && (
        <div style={{
          height: '40px',
          position: 'relative',
          marginTop: 'auto',
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
            <path
              d={generateTrendLine()}
              fill="none"
              stroke="#03a9f4"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}

      {/* Entity ID (when no entity data) */}
      {!entity && card.entity && (
        <div style={{ textAlign: 'center', marginTop: 'auto' }}>
          <Text type="secondary" style={{ fontSize: '10px' }}>
            {card.entity}
          </Text>
        </div>
      )}
    </AntCard>
  );
};
