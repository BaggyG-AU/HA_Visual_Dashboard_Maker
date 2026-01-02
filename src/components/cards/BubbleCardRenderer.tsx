import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import {
  BulbOutlined,
  PlayCircleOutlined,
  UpOutlined,
  DownOutlined,
  FireOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { CustomCard } from '../../types/dashboard';
import { useHAEntities } from '../../contexts/HAEntityContext';

const { Text } = Typography;

interface BubbleCardRendererProps {
  card: CustomCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Bubble Card (custom HACS card)
 * Repository: https://github.com/Clooos/Bubble-Card
 *
 * Supports bubble card types:
 * - bubble-card (main card type with card_type property)
 * - Subtypes: button, cover, empty-column, horizontal-buttons-stack, media-player, pop-up, separator, slider
 *
 * Known for its modern, minimalist bubble-style design
 */
export const BubbleCardRenderer: React.FC<BubbleCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;

  // Extract bubble card configuration
  const cardType = card.card_type || 'button'; // button, cover, media-player, slider, separator, pop-up, etc.
  const state = entity?.state || 'unknown';
  const attributes = entity?.attributes || {};

  // Determine display properties
  const displayName = card.name || attributes.friendly_name || card.entity?.split('.')[1]?.replace(/_/g, ' ') || 'Entity';
  const showName = card.show_name !== false;
  const showIcon = card.show_icon !== false;
  const showState = card.show_state !== false;

  // Get icon based on entity type
  const getIcon = () => {
    if (card.icon) return card.icon;

    const domain = card.entity?.split('.')[0];
    switch (domain) {
      case 'light':
        return <BulbOutlined />;
      case 'media_player':
        return <PlayCircleOutlined />;
      case 'cover':
        return state === 'open' ? <UpOutlined /> : <DownOutlined />;
      case 'climate':
        return <FireOutlined />;
      default:
        return <MoreOutlined />;
    }
  };

  // Get color based on state
  const getStateColor = () => {
    if (!entity) return '#666';

    const domain = card.entity?.split('.')[0];
    switch (domain) {
      case 'light':
        return state === 'on' ? '#ffc107' : '#666';
      case 'media_player':
        return state === 'playing' ? '#52c41a' : '#666';
      case 'cover':
        return state === 'open' ? '#52c41a' : '#666';
      case 'climate':
        return state === 'heat' ? '#ff9800' : state === 'cool' ? '#03a9f4' : '#666';
      default:
        return state === 'on' ? '#52c41a' : '#666';
    }
  };

  const stateColor = getStateColor();
  const icon = getIcon();

  // Handle separator card type
  if (cardType === 'separator') {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 16px',
          cursor: 'pointer',
        }}
        onClick={onClick}
      >
        <div style={{
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          borderRadius: '1px',
        }} />
        {card.name && (
          <Text
            style={{
              color: '#999',
              fontSize: '11px',
              margin: '0 16px',
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {card.name}
          </Text>
        )}
        <div style={{
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          borderRadius: '1px',
        }} />
      </div>
    );
  }

  // Handle pop-up card type
  if (cardType === 'pop-up') {
    return (
      <AntCard
        size="small"
        style={{
          height: '100%',
          cursor: 'pointer',
          border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
          backgroundColor: isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
        }}
        styles={{
        body: {
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: '8px',
        },
      }}
        onClick={onClick}
        hoverable
      >
        <div style={{
          fontSize: '32px',
          color: '#00d9ff',
        }}>
          {icon}
        </div>
        <Text strong style={{ color: '#e6e6e6', fontSize: '14px', textAlign: 'center' }}>
          {displayName}
        </Text>
        <Tag color="cyan" style={{ fontSize: '10px' }}>POP-UP</Tag>
      </AntCard>
    );
  }

  // Default bubble button/slider style
  return (
    <div
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        borderRadius: '24px', // Bubble style rounded corners
        backgroundColor: isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        transition: 'all 0.3s ease',
      }}
      onClick={onClick}
    >
      {/* Icon bubble */}
      {showIcon && (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: `${stateColor}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${stateColor}`,
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '24px', color: stateColor }}>
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
        {showName && (
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

        {showState && (
          <Text
            style={{
              color: stateColor,
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'capitalize',
            }}
          >
            {state}
          </Text>
        )}
      </div>

      {/* Bubble badge */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '8px',
          padding: '2px 8px',
          backgroundColor: 'rgba(102, 187, 255, 0.2)',
          border: '1px solid #66bbff',
          borderRadius: '12px', // Bubble style
          fontSize: '9px',
          color: '#66bbff',
          fontWeight: 'bold',
          pointerEvents: 'none',
        }}>
          BUBBLE
        </div>
      )}

      {/* Entity ID (when no entity data) */}
      {!entity && card.entity && (
        <Text type="secondary" style={{ fontSize: '10px', marginLeft: 'auto' }}>
          {card.entity}
        </Text>
      )}
    </div>
  );
};
