import React from 'react';
import { Button, Card as AntCard, Typography } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';
import { MdiIcon } from '../MdiIcon';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { popupStackService, resolvePopupFromCard } from '../../features/popup/popupService';
import type { PopupCardConfig } from '../../features/popup/types';

const { Text } = Typography;

interface PopupTriggerCardRendererProps {
  card: PopupCardConfig;
  isSelected?: boolean;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
}

export const PopupTriggerCardRenderer: React.FC<PopupTriggerCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const backgroundStyle = getCardBackgroundStyle(card.style, isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f');
  const label = typeof card.trigger_label === 'string' && card.trigger_label.trim().length > 0
    ? card.trigger_label
    : 'Open Popup';
  const icon = typeof card.trigger_icon === 'string' && card.trigger_icon.trim().length > 0
    ? card.trigger_icon
    : 'mdi:open-in-new';

  const openPopup = () => {
    const popupConfig = resolvePopupFromCard(card);
    if (!popupConfig) return;
    popupStackService.open(popupConfig);
  };

  return (
    <AntCard
      size="small"
      title={card.title || 'Popup Trigger'}
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        ...backgroundStyle,
        transition: 'all 0.3s ease',
      }}
      data-testid="popup-trigger-card"
      onClick={onClick}
      hoverable
    >
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <Button
          type="primary"
          icon={<MdiIcon icon={icon} size={16} />}
          onClick={(event) => {
            event.stopPropagation();
            onClick?.(event);
            openPopup();
          }}
          data-testid="popup-trigger-open"
        >
          {label}
        </Button>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Opens modal popup content
        </Text>
      </div>

      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          padding: '4px 8px',
          backgroundColor: 'rgba(0, 217, 255, 0.2)',
          border: '1px solid #00d9ff',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#00d9ff',
          fontWeight: 700,
          pointerEvents: 'none',
        }}>
          <ExpandOutlined style={{ marginRight: '4px' }} />
          POPUP
        </div>
      )}
    </AntCard>
  );
};
