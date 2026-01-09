import React from 'react';
import { Card as AntCard, Typography, Space, Tag } from 'antd';
import { FireOutlined, CloudOutlined, PoweroffOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { CustomCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';

const { Text } = Typography;

interface BetterThermostatCardRendererProps {
  card: CustomCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Better Thermostat UI Card (custom HACS card)
 * Repository: https://github.com/KartoffelToby/better-thermostat-ui-card
 *
 * This custom card provides an enhanced UI for climate entities with:
 * - Multiple HVAC mode buttons
 * - Window/door sensor integration
 * - Eco mode display
 * - Better visual feedback
 */
export const BetterThermostatCardRenderer: React.FC<BetterThermostatCardRendererProps> = ({
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
  const hvacModes = attributes.hvac_modes || ['heat', 'cool', 'auto', 'off'];
  const unit = attributes.unit_of_measurement || '°C';

  // Better Thermostat specific attributes
  const windowOpen = card.window_sensors ? true : false;
  const ecoMode = attributes.preset_mode === 'eco';

  // Determine display name
  const displayName = card.name || attributes.friendly_name || card.entity?.split('.')[1]?.replace(/_/g, ' ') || 'Climate';

  // Color based on HVAC mode
  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'heat':
        return '#ff9800'; // Orange
      case 'cool':
        return '#03a9f4'; // Blue
      case 'auto':
        return '#ffc107'; // Yellow
      case 'heat_cool':
        return '#9c27b0'; // Purple
      case 'dry':
        return '#00bcd4'; // Cyan
      case 'fan_only':
        return '#4caf50'; // Green
      case 'off':
        return '#666'; // Gray
      default:
        return '#666';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'heat':
        return <FireOutlined />;
      case 'cool':
        return <CloudOutlined />; // Using CloudOutlined instead of SnowflakeOutlined
      case 'off':
        return <PoweroffOutlined />;
      case 'auto':
      case 'heat_cool':
        return <ThunderboltOutlined />;
      default:
        return <FireOutlined />;
    }
  };

  const currentColor = getModeColor(hvacMode);
  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
  );

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
        height: '100%',
        gap: '16px',
      },
      }}
      onClick={onClick}
      hoverable
    >
      {/* Header with name and status indicators */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text strong style={{ color: '#e6e6e6', fontSize: '14px' }}>
          {displayName}
        </Text>
        <Space size={4}>
          {ecoMode && (
            <Tag color="green" style={{ margin: 0, fontSize: '10px' }}>ECO</Tag>
          )}
          {windowOpen && (
            <Tag color="orange" style={{ margin: 0, fontSize: '10px' }}>WINDOW</Tag>
          )}
        </Space>
      </div>

      {/* Temperature display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        {/* Current temperature */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>
            Current
          </Text>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: currentColor,
            lineHeight: 1,
          }}>
            {entity ? currentTemp.toFixed(1) : '--'}
            <span style={{ fontSize: '16px', marginLeft: '2px' }}>{unit}</span>
          </div>
        </div>

        {/* Target temperature */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>
            Target
          </Text>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#e6e6e6',
            lineHeight: 1,
          }}>
            {entity ? targetTemp.toFixed(1) : '--'}
            <span style={{ fontSize: '16px', marginLeft: '2px' }}>{unit}</span>
          </div>
        </div>
      </div>

      {/* HVAC Mode buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
        gap: '8px',
      }}>
        {hvacModes.map((mode) => {
          const isActive = hvacMode === mode;
          const modeColor = getModeColor(mode);

          return (
            <div
              key={mode}
              style={{
                padding: '8px',
                backgroundColor: isActive ? `${modeColor}33` : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isActive ? modeColor : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '16px', color: isActive ? modeColor : '#999' }}>
                {getModeIcon(mode)}
              </div>
              <Text
                style={{
                  fontSize: '10px',
                  color: isActive ? modeColor : '#999',
                  textTransform: 'capitalize',
                  fontWeight: isActive ? 'bold' : 'normal',
                }}
              >
                {mode.replace('_', ' ')}
              </Text>
            </div>
          );
        })}
      </div>

      {/* Entity ID (when no entity data) */}
      {!entity && card.entity && (
        <div style={{ textAlign: 'center', marginTop: 'auto' }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {card.entity}
          </Text>
        </div>
      )}
    </AntCard>
  );
};
