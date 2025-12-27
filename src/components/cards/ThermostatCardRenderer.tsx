import React from 'react';
import { Card as AntCard, Typography, Space } from 'antd';
import { FireOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { ThermostatCard } from '../../types/dashboard';
import { useHAEntities } from '../../contexts/HAEntityContext';

const { Text } = Typography;

interface ThermostatCardRendererProps {
  card: ThermostatCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Thermostat card type
 * Displays climate entity with temperature control
 * Matches Home Assistant's thermostat card styling
 */
export const ThermostatCardRenderer: React.FC<ThermostatCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;

  // Extract climate entity data
  const state = entity?.state || 'unknown';
  const attributes = entity?.attributes || {};
  const currentTemp = attributes.current_temperature || 0;
  const targetTemp = attributes.temperature || 0;
  const hvacMode = state;
  const hvacAction = attributes.hvac_action || 'idle';
  const unit = attributes.unit_of_measurement || '°C';
  const minTemp = attributes.min_temp || 50;
  const maxTemp = attributes.max_temp || 90;

  // Determine display name
  const displayName = card.name || attributes.friendly_name || card.entity?.split('.')[1]?.replace(/_/g, ' ') || 'Climate';

  // Color based on HVAC action/mode
  const getStatusColor = () => {
    if (!entity) return '#666';

    switch (hvacAction) {
      case 'heating':
        return '#ff9800'; // Orange for heating
      case 'cooling':
        return '#03a9f4'; // Blue for cooling
      case 'idle':
        return '#52c41a'; // Green for idle
      case 'off':
        return '#666'; // Gray for off
      default:
        if (hvacMode === 'heat') return '#ff9800';
        if (hvacMode === 'cool') return '#03a9f4';
        if (hvacMode === 'off') return '#666';
        return '#ffc107'; // Yellow for auto/other
    }
  };

  const getStatusText = () => {
    if (!entity) return 'Unavailable';
    if (hvacAction && hvacAction !== 'idle') {
      return hvacAction.charAt(0).toUpperCase() + hvacAction.slice(1);
    }
    return hvacMode.charAt(0).toUpperCase() + hvacMode.slice(1);
  };

  const statusColor = getStatusColor();

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
      {/* Header with name and icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text strong style={{ color: '#e6e6e6', fontSize: '14px' }}>
          {displayName}
        </Text>
        <FireOutlined style={{ fontSize: '18px', color: statusColor }} />
      </div>

      {/* Current temperature (large display) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: statusColor,
          lineHeight: 1,
        }}>
          {entity ? currentTemp.toFixed(1) : '--'}
          <span style={{ fontSize: '24px', marginLeft: '4px' }}>{unit}</span>
        </div>

        {/* Status text */}
        <Text style={{
          color: statusColor,
          fontSize: '12px',
          textTransform: 'capitalize',
        }}>
          {getStatusText()}
        </Text>
      </div>

      {/* Target temperature control */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        {/* Minus button */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 217, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(0, 217, 255, 0.3)',
          cursor: 'pointer',
        }}>
          <MinusOutlined style={{ fontSize: '14px', color: '#00d9ff' }} />
        </div>

        {/* Target temperature */}
        <Space orientation="vertical" size={0} style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '10px' }}>
            Target
          </Text>
          <Text strong style={{ color: '#e6e6e6', fontSize: '16px' }}>
            {entity ? targetTemp.toFixed(1) : '--'} {unit}
          </Text>
        </Space>

        {/* Plus button */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 217, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(0, 217, 255, 0.3)',
          cursor: 'pointer',
        }}>
          <PlusOutlined style={{ fontSize: '14px', color: '#00d9ff' }} />
        </div>
      </div>

      {/* Entity ID (when no entity data) */}
      {!entity && card.entity && (
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {card.entity}
          </Text>
        </div>
      )}
    </AntCard>
  );
};
