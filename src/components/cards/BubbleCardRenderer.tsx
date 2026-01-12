import React from 'react';
import { Card as AntCard, Typography, Tag, Slider, Select } from 'antd';
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
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';

const { Text } = Typography;

interface BubbleCardRendererProps {
  card: CustomCard;
  isSelected?: boolean;
  onClick?: () => void;
}

// Sub-button configuration (Bubble Card v3.1.0+)
interface SubButton {
  entity?: string;
  name?: string;
  icon?: string;
  show_name?: boolean;
  show_icon?: boolean;
  show_state?: boolean;
  tap_action?: any;
  type?: 'button' | 'slider' | 'select';
  icon_position?: 'top' | 'bottom' | 'left' | 'right';
  position?: 'default' | 'footer';
  slider_config?: {
    always_visible?: boolean;
    show_on_tap?: boolean;
    orientation?: 'horizontal' | 'vertical';
    fill_direction?: 'left' | 'right' | 'top' | 'bottom';
    value_position?: 'right' | 'left' | 'center' | 'hidden';
    inverted?: boolean;
  };
  select_config?: {
    options?: string[];
  };
}

/**
 * Visual renderer for Bubble Card (custom HACS card)
 * Repository: https://github.com/Clooos/Bubble-Card
 * Version Support: v3.1.0+
 *
 * Supports bubble card types:
 * - bubble-card (main card type with card_type property)
 * - Subtypes: button, cover, empty-column, horizontal-buttons-stack, media-player, pop-up, separator, slider, sub_button
 *
 * v3.1.0 Features:
 * - Sub-buttons with type system (button, slider, select)
 * - Enhanced layout control (icon positioning, footer placement)
 * - Entity picture support
 * - Timer countdown display
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
  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
  );

  // Sub-buttons support (v3.1.0+)
  const subButtons: SubButton[] = Array.isArray(card.sub_button) ? card.sub_button : [];

  // Render a single sub-button (supports button, slider, and select types)
  const renderSubButton = (subButton: SubButton, index: number) => {
    const subEntity = subButton.entity ? getEntity(subButton.entity) : null;
    const subState = subEntity?.state || 'unknown';
    const subName = subButton.name || subEntity?.attributes?.friendly_name || subButton.entity?.split('.')[1]?.replace(/_/g, ' ') || 'Sub-button';
    const showSubIcon = subButton.show_icon !== false;
    const showSubName = subButton.show_name !== false;
    const showSubState = subButton.show_state !== false;
    const subType = subButton.type || 'button';

    // Get numeric value for slider (brightness, temperature, etc.)
    const getNumericValue = (): number => {
      if (!subEntity) return 0;

      // Try to parse state as number
      const stateValue = parseFloat(subState);
      if (!isNaN(stateValue)) return stateValue;

      // Check common attributes for numeric values
      if (subEntity.attributes?.brightness) {
        return Math.round((subEntity.attributes.brightness / 255) * 100);
      }
      if (subEntity.attributes?.temperature) {
        return subEntity.attributes.temperature;
      }
      if (subEntity.attributes?.position) {
        return subEntity.attributes.position;
      }

      return 0;
    };

    const numericValue = getNumericValue();
    const sliderConfig = subButton.slider_config || {};
    const orientation = sliderConfig.orientation || 'horizontal';
    const valuePosition = sliderConfig.value_position || 'right';
    const inverted = sliderConfig.inverted || false;

    // Get select options
    const getSelectOptions = (): string[] => {
      if (subButton.select_config?.options) {
        return subButton.select_config.options;
      }
      // Try to get options from entity attributes
      if (subEntity?.attributes?.options) {
        return subEntity.attributes.options;
      }
      return ['Option 1', 'Option 2', 'Option 3'];
    };

    const selectOptions = getSelectOptions();

    // Render slider type
    if (subType === 'slider') {
      return (
        <div
          key={`sub-${index}`}
          style={{
            display: 'flex',
            flexDirection: orientation === 'horizontal' ? 'column' : 'row',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minHeight: '40px',
          }}
        >
          {/* Header with icon and name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {showSubIcon && (
              <div style={{ fontSize: '18px', color: '#999' }}>
                <MoreOutlined />
              </div>
            )}
            {showSubName && (
              <Text
                style={{
                  color: '#e6e6e6',
                  fontSize: '12px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {subName}
              </Text>
            )}
            {valuePosition === 'right' && showSubState && (
              <Text
                style={{
                  color: '#00d9ff',
                  fontSize: '12px',
                  fontWeight: 500,
                  marginLeft: 'auto',
                }}
              >
                {numericValue}%
              </Text>
            )}
          </div>

          {/* Slider control */}
          <div style={{ paddingRight: orientation === 'horizontal' ? '8px' : '0' }}>
            <Slider
              value={inverted ? 100 - numericValue : numericValue}
              min={0}
              max={100}
              vertical={orientation === 'vertical'}
              style={{
                margin: 0,
                width: orientation === 'horizontal' ? '100%' : 'auto',
              }}
              styles={{
                track: { backgroundColor: '#00d9ff' },
                rail: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
              }}
            />
          </div>
        </div>
      );
    }

    // Render select type
    if (subType === 'select') {
      return (
        <div
          key={`sub-${index}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minHeight: '40px',
          }}
        >
          {showSubIcon && (
            <div style={{ fontSize: '18px', color: '#999' }}>
              <MoreOutlined />
            </div>
          )}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
            {showSubName && (
              <Text
                style={{
                  color: '#e6e6e6',
                  fontSize: '12px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {subName}
              </Text>
            )}
            <Select
              value={subState}
              size="small"
              style={{ width: '100%' }}
              dropdownStyle={{ backgroundColor: '#2a2a2a' }}
              options={selectOptions.map(opt => ({ label: opt, value: opt }))}
            />
          </div>
        </div>
      );
    }

    // Default button type
    return (
      <div
        key={`sub-${index}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          minHeight: '40px',
        }}
      >
        {showSubIcon && (
          <div style={{ fontSize: '18px', color: '#999' }}>
            <MoreOutlined />
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
          {showSubName && (
            <Text
              style={{
                color: '#e6e6e6',
                fontSize: '12px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {subName}
            </Text>
          )}
          {showSubState && subEntity && (
            <Text
              style={{
                color: '#999',
                fontSize: '10px',
                textTransform: 'capitalize',
              }}
            >
              {subState}
            </Text>
          )}
        </div>
      </div>
    );
  };

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

  // Handle sub_button card type (v3.1.0+ - sub-buttons only, no main content)
  if (cardType === 'sub_button') {
    return (
      <div
        style={{
          height: '100%',
          cursor: 'pointer',
          border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
          borderRadius: '24px',
          ...backgroundStyle,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflow: 'auto',
        }}
        onClick={onClick}
      >
        {subButtons.length > 0 ? (
          subButtons.map((subBtn, idx) => renderSubButton(subBtn, idx))
        ) : (
          <Text style={{ color: '#666', fontSize: '12px', textAlign: 'center' }}>
            No sub-buttons configured
          </Text>
        )}
        {isSelected && (
          <div style={{
            position: 'absolute',
            top: '4px',
            right: '8px',
            padding: '2px 8px',
            backgroundColor: 'rgba(102, 187, 255, 0.2)',
            border: '1px solid #66bbff',
            borderRadius: '12px',
            fontSize: '9px',
            color: '#66bbff',
            fontWeight: 'bold',
            pointerEvents: 'none',
          }}>
            SUB-BUTTONS
          </div>
        )}
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
          ...backgroundStyle,
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

  // Default bubble button/slider style (with sub-buttons support)
  return (
    <div
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        borderRadius: '24px', // Bubble style rounded corners
        ...backgroundStyle,
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.3s ease',
        overflow: 'auto',
      }}
      onClick={onClick}
    >
      {/* Main card content */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
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

        {/* Entity ID (when no entity data) */}
        {!entity && card.entity && (
          <Text type="secondary" style={{ fontSize: '10px', marginLeft: 'auto' }}>
            {card.entity}
          </Text>
        )}
      </div>

      {/* Sub-buttons (v3.1.0+) */}
      {subButtons.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          {subButtons.map((subBtn, idx) => renderSubButton(subBtn, idx))}
        </div>
      )}

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
    </div>
  );
};
