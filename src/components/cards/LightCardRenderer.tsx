import React from 'react';
import { Card as AntCard, Typography, Slider } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import { LightCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';

const { Text } = Typography;

interface LightCardRendererProps {
  card: LightCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Light card type
 * Displays light entity with brightness control
 */
export const LightCardRenderer: React.FC<LightCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;

  // Extract light properties
  const state = entity?.state || 'off';
  const attributes = entity?.attributes || {};
  const brightness = attributes.brightness || 0; // 0-255
  const brightnessPercent = Math.round((brightness / 255) * 100);
  const isOn = state === 'on';

  const displayName = card.name || attributes.friendly_name || card.entity?.split('.')[1]?.replace(/_/g, ' ') || 'Light';

  // Color based on RGB if available, otherwise yellow for on
  const getLightColor = () => {
    if (!isOn) return '#666';

    // Check for RGB color
    if (attributes.rgb_color && Array.isArray(attributes.rgb_color)) {
      const [r, g, b] = attributes.rgb_color;
      return `rgb(${r}, ${g}, ${b})`;
    }

    // Check for HS color
    if (attributes.hs_color && Array.isArray(attributes.hs_color)) {
      const [h, s] = attributes.hs_color;
      return `hsl(${h}, ${s}%, 50%)`;
    }

    // Default warm white/yellow for lights
    return '#ffc107';
  };

  const lightColor = getLightColor();
  const backgroundStyle = getCardBackgroundStyle(card.style, isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f');

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
      {/* Header with icon and state */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Text strong style={{ color: '#e6e6e6', fontSize: '14px' }}>
          {displayName}
        </Text>

        {/* Light bulb icon */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: isOn ? `${lightColor}33` : 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${isOn ? lightColor : '#434343'}`,
            boxShadow: isOn ? `0 0 20px ${lightColor}66` : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          <BulbOutlined
            style={{
              fontSize: '24px',
              color: isOn ? lightColor : '#666',
              transition: 'all 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* State and brightness */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: 1,
      }}>
        {/* State */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Text
            style={{
              color: isOn ? lightColor : '#666',
              fontSize: '13px',
              fontWeight: 500,
              textTransform: 'capitalize',
            }}
          >
            {state}
          </Text>

          {isOn && brightness > 0 && (
            <Text
              style={{
                color: lightColor,
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {brightnessPercent}%
            </Text>
          )}
        </div>

        {/* Brightness slider */}
        {isOn && attributes.supported_color_modes?.includes('brightness') && (
          <div style={{ marginTop: 'auto' }}>
            <Slider
              value={brightnessPercent}
              disabled
              trackStyle={{ backgroundColor: lightColor }}
              handleStyle={{ borderColor: lightColor }}
              railStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            />
          </div>
        )}

        {/* Color indicator */}
        {isOn && (attributes.rgb_color || attributes.hs_color) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: 'auto',
          }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: lightColor,
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: `0 0 10px ${lightColor}88`,
              }}
            />
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Color Mode
            </Text>
          </div>
        )}
      </div>

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
