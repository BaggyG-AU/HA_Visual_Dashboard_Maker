import React from 'react';
import { Card as AntCard, Typography, Space } from 'antd';
import {
  BulbOutlined,
  FireOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  UpOutlined,
  DownOutlined,
  PlayCircleOutlined,
  LockOutlined,
  BellOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { CustomCard } from '../../types/dashboard';
import { useHAEntities } from '../../contexts/HAEntityContext';

const { Text } = Typography;

interface MushroomCardRendererProps {
  card: CustomCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Mushroom Cards (custom HACS cards)
 * Repository: https://github.com/piitaya/lovelace-mushroom
 *
 * Supports multiple Mushroom card types:
 * - mushroom-entity-card: Generic entity display
 * - mushroom-light-card: Light control
 * - mushroom-fan-card: Fan control
 * - mushroom-cover-card: Cover/blind control
 * - mushroom-climate-card: Climate control
 * - mushroom-media-player-card: Media player
 * - mushroom-lock-card: Lock control
 * - mushroom-alarm-control-panel-card: Alarm panel
 * - mushroom-template-card: Custom template
 */
export const MushroomCardRenderer: React.FC<MushroomCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;

  // Extract common properties
  const state = entity?.state || 'unknown';
  const attributes = entity?.attributes || {};
  const cardType = card.type.replace('custom:mushroom-', '').replace('-card', '');

  // Determine display properties
  const displayName = card.name || attributes.friendly_name || card.entity?.split('.')[1]?.replace(/_/g, ' ') || 'Entity';
  const layout = card.layout || 'default'; // 'default' or 'horizontal'
  const fillContainer = card.fill_container !== false;
  const hideState = card.hide_state === true;
  const hideIcon = card.hide_icon === true;
  const hideName = card.hide_name === true;

  // Get icon based on card type and entity domain
  const getIcon = () => {
    const domain = card.entity?.split('.')[0];

    if (card.icon) return card.icon; // Custom icon from config

    switch (cardType) {
      case 'light':
        return <BulbOutlined />;
      case 'climate':
        return <FireOutlined />;
      case 'fan':
        return <ThunderboltOutlined />;
      case 'cover':
        return state === 'open' ? <UpOutlined /> : <DownOutlined />;
      case 'media-player':
        return <PlayCircleOutlined />;
      case 'lock':
        return <LockOutlined />;
      case 'alarm-control-panel':
        return <BellOutlined />;
      default:
        // Use domain-based icons
        switch (domain) {
          case 'light': return <BulbOutlined />;
          case 'climate': return <FireOutlined />;
          case 'weather': return <CloudOutlined />;
          default: return <DashboardOutlined />;
        }
    }
  };

  // Get color based on state
  const getStateColor = () => {
    if (!entity) return '#666';

    const domain = card.entity?.split('.')[0];

    switch (domain) {
      case 'light':
        return state === 'on' ? '#ffc107' : '#666';
      case 'climate':
        const hvacAction = attributes.hvac_action;
        if (hvacAction === 'heating') return '#ff9800';
        if (hvacAction === 'cooling') return '#03a9f4';
        return state === 'off' ? '#666' : '#52c41a';
      case 'fan':
        return state === 'on' ? '#03a9f4' : '#666';
      case 'cover':
        return state === 'open' ? '#52c41a' : '#666';
      case 'lock':
        return state === 'locked' ? '#52c41a' : '#ff9800';
      case 'switch':
      case 'input_boolean':
        return state === 'on' ? '#52c41a' : '#666';
      default:
        return state === 'on' || state === 'active' ? '#52c41a' : '#666';
    }
  };

  const stateColor = getStateColor();
  const icon = getIcon();

  // Format state text
  const getStateText = () => {
    if (card.entity?.startsWith('climate.')) {
      const temp = attributes.current_temperature || attributes.temperature;
      const unit = attributes.unit_of_measurement || '°C';
      if (temp !== undefined) return `${temp}${unit}`;
    }

    if (card.entity?.startsWith('sensor.')) {
      const value = state;
      const unit = attributes.unit_of_measurement || '';
      return `${value} ${unit}`.trim();
    }

    return state.charAt(0).toUpperCase() + state.slice(1);
  };

  const isHorizontal = layout === 'horizontal';

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
        padding: '16px',
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        alignItems: isHorizontal ? 'center' : 'flex-start',
        justifyContent: 'space-between',
        height: '100%',
        gap: isHorizontal ? '16px' : '12px',
      },
      }}
      onClick={onClick}
      hoverable
    >
      {/* Icon */}
      {!hideIcon && (
        <div
          style={{
            width: isHorizontal ? '40px' : '48px',
            height: isHorizontal ? '40px' : '48px',
            borderRadius: '50%',
            backgroundColor: `${stateColor}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: `2px solid ${stateColor}`,
          }}
        >
          <div style={{ fontSize: isHorizontal ? '20px' : '24px', color: stateColor }}>
            {icon}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: 0,
      }}>
        {/* Name */}
        {!hideName && (
          <Text
            strong
            style={{
              color: '#e6e6e6',
              fontSize: '14px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayName}
          </Text>
        )}

        {/* State */}
        {!hideState && (
          <Text
            style={{
              color: stateColor,
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {getStateText()}
          </Text>
        )}
      </div>

      {/* Mushroom badge indicator */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          padding: '2px 6px',
          backgroundColor: 'rgba(168, 100, 253, 0.2)',
          border: '1px solid #a864fd',
          borderRadius: '4px',
          fontSize: '9px',
          color: '#a864fd',
          fontWeight: 'bold',
          pointerEvents: 'none',
        }}>
          MUSHROOM
        </div>
      )}

      {/* Entity ID (when no entity data) */}
      {!entity && card.entity && (
        <div style={{ marginTop: 'auto' }}>
          <Text type="secondary" style={{ fontSize: '10px' }}>
            {card.entity}
          </Text>
        </div>
      )}
    </AntCard>
  );
};
