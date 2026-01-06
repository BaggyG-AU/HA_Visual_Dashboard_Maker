import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { BorderOutlined, BulbOutlined, PoweroffOutlined, ApiOutlined } from '@ant-design/icons';
import { CustomCard } from '../../types/dashboard';
import { useHAEntities } from '../../contexts/HAEntityContext';

const { Text } = Typography;

interface CustomButtonCardRendererProps {
  card: CustomCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Custom Button Card (custom HACS card)
 * Repository: https://github.com/custom-cards/button-card
 *
 * A highly customizable button card with advanced features beyond the standard button card.
 * Supports:
 * - Custom icons, colors, and sizes
 * - Templates and variables
 * - State-dependent styling
 * - Tap, hold, and double-tap actions
 * - Custom layouts and grids
 *
 * Note: This is distinct from the built-in 'button' card type.
 */
export const CustomButtonCardRenderer: React.FC<CustomButtonCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;

  // Extract configuration
  const name = card.name || entity?.attributes?.friendly_name || card.entity?.split('.')[1]?.replace(/_/g, ' ') || 'Button';
  const icon = card.icon || card.icon_template;
  const colorProp = card.color;
  const iconColorProp = card.icon_color;
  const colorType = card.color_type;
  const showName = card.show_name !== false;
  const showIcon = card.show_icon !== false;
  const showState = card.show_state;
  const size = card.size || '40px';
  const template = card.template;

  // Determine state
  const state = entity?.state || 'unknown';
  const isOn = state === 'on' || state === 'playing' || state === 'open';

  // Get icon component
  const getIcon = () => {
    if (icon) {
      // Icon string would be used in real implementation
      return <ApiOutlined />;
    }

    const domain = card.entity?.split('.')[0];
    switch (domain) {
      case 'light':
        return <BulbOutlined />;
      case 'switch':
        return <PoweroffOutlined />;
      default:
        return <BorderOutlined />;
    }
  };

  const iconComponent = getIcon();

  // Determine button color
  const getButtonColor = () => {
    if (colorProp === 'auto' || colorType === 'auto') {
      return isOn ? '#ffc107' : '#666';
    }
    if (typeof colorProp === 'string' && colorProp.trim().length > 0) {
      return colorProp;
    }
    return isOn ? '#1890ff' : '#666';
  };

  const buttonColor = getButtonColor();
  const iconColor = typeof iconColorProp === 'string' && iconColorProp.trim().length > 0
    ? iconColorProp
    : buttonColor;

  return (
    <div
      style={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onClick={onClick}
    >
      <AntCard
        bordered
        style={{
          height: '100%',
          border: isSelected ? '2px solid #1890ff' : '1px solid #434343',
          backgroundColor: '#1a1a1a',
          boxShadow: isSelected ? '0 0 10px rgba(24, 144, 255, 0.3)' : 'none',
        }}
        bodyStyle={{
          padding: '16px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Button Visual */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '16px',
            backgroundColor: '#252525',
            borderRadius: '8px',
            border: `2px solid ${buttonColor}`,
            minWidth: '120px',
            transition: 'all 0.3s ease',
          }}
          data-testid="custom-button-card-visual"
        >
          {/* Icon */}
          {showIcon && (
            <div style={{ fontSize: size, color: iconColor }} data-testid="custom-button-card-icon">
              {iconComponent}
            </div>
          )}

          {/* Name */}
          {showName && (
            <Text strong style={{ color: '#fff', fontSize: '13px', textAlign: 'center' }}>
              {name}
            </Text>
          )}

          {/* State */}
          {showState && entity && (
            <Text style={{ color: '#888', fontSize: '11px' }}>
              {state}
            </Text>
          )}
        </div>

        {/* Template Indicator */}
        {template && (
          <div style={{ marginTop: '12px' }}>
            <Text code style={{ color: '#52c41a', fontSize: '10px' }}>
              Template: {template}
            </Text>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
          <Text style={{ color: '#666', fontSize: '10px' }}>
            Custom Button Card{card.entity ? ` • ${card.entity}` : ''}
          </Text>
        </div>
      </AntCard>
    </div>
  );
};
