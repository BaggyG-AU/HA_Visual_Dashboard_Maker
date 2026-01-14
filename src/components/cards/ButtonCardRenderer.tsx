import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { ButtonCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { triggerHapticForAction } from '../../services/hapticService';
import { playSoundForAction } from '../../services/soundService';
import { resolveTapAction } from '../../services/smartActions';

const { Text } = Typography;

interface ButtonCardRendererProps {
  card: ButtonCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Button card type
 * Displays a button-style card for entity control
 */
export const ButtonCardRenderer: React.FC<ButtonCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const displayName = card.name || card.entity?.split('.')[1]?.replace(/_/g, ' ') || 'Button';
  const showName = card.show_name !== false;
  const showState = card.show_state !== false;
  const showIcon = card.show_icon !== false;
  const backgroundStyle = getCardBackgroundStyle(card.style, isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f');
  const { action: tapAction } = resolveTapAction(card);

  const handleClick = () => {
    triggerHapticForAction(tapAction, card.haptic);
    void playSoundForAction(tapAction, card.sound);
    onClick?.();
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
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: '12px',
        },
      }}
      onClick={handleClick}
      hoverable
    >
      {showIcon && (
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 217, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(0, 217, 255, 0.3)',
          }}
        >
          <ThunderboltOutlined style={{ fontSize: '32px', color: '#00d9ff' }} />
        </div>
      )}

      {showName && (
        <Text
          strong
          style={{
            color: '#e6e6e6',
            fontSize: '14px',
            textAlign: 'center',
            textTransform: 'capitalize',
          }}
        >
          {displayName}
        </Text>
      )}

      {showState && card.entity && (
        <div>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {card.entity}
          </Text>
        </div>
      )}
    </AntCard>
  );
};
