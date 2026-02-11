import React, { useEffect, useState } from 'react';
import { Button, Modal, Space, Typography } from 'antd';
import { BaseCard } from '../../components/BaseCard';
import type { PopupStackItem } from './types';
import { getPopupModalDimensions } from './popupService';

const { Text } = Typography;

interface PopupCardModalProps {
  item: PopupStackItem;
  index: number;
  onClose: () => void;
}

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  return prefersReducedMotion;
};

export const PopupCardModal: React.FC<PopupCardModalProps> = ({
  item,
  index,
  onClose,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const dimensions = getPopupModalDimensions(item.config);
  const isFullscreen = item.config.size === 'fullscreen';
  const modalBodyHeight = isFullscreen ? 'calc(100vh - 140px)' : dimensions.bodyMaxHeight ?? '70vh';

  const footer = item.config.show_footer ? (
    <Space wrap>
      {item.config.footer_actions.map((action, actionIndex) => (
        <Button
          key={`${item.id}-footer-action-${actionIndex}`}
          type={action.button_type}
          onClick={() => {
            if (action.action === 'close') onClose();
          }}
          data-testid={`popup-footer-action-${actionIndex}`}
        >
          {action.label}
        </Button>
      ))}
      <Button onClick={onClose} data-testid="popup-footer-close">
        {item.config.close_label}
      </Button>
    </Space>
  ) : null;

  return (
    <Modal
      open
      title={item.config.show_header ? item.config.title : null}
      onCancel={onClose}
      footer={footer}
      centered={!isFullscreen}
      keyboard
      maskClosable={item.config.close_on_backdrop}
      width={isFullscreen ? '100vw' : dimensions.width}
      style={isFullscreen ? { top: 0, paddingBottom: 0 } : undefined}
      styles={{
        mask: {
          backgroundColor: `rgba(0, 0, 0, ${item.config.backdrop_opacity})`,
        },
        content: isFullscreen
          ? { height: '100vh', borderRadius: 0, paddingBottom: 0 }
          : undefined,
        body: {
          maxHeight: modalBodyHeight,
          overflow: 'auto',
        },
      }}
      transitionName={prefersReducedMotion ? '' : undefined}
      maskTransitionName={prefersReducedMotion ? '' : undefined}
      zIndex={1200 + (index * 10)}
      destroyOnClose
      data-testid={`popup-modal-${index}`}
    >
      <div
        data-testid="popup-modal-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {item.config.cards.length > 0 ? item.config.cards.map((popupCard, cardIndex) => (
          <div key={`${item.id}-card-${cardIndex}`} style={{ minHeight: 0 }}>
            <BaseCard
              card={popupCard}
              isSelected={false}
              onClick={(event) => {
                event?.stopPropagation?.();
              }}
            />
          </div>
        )) : (
          <div
            style={{
              minHeight: '42px',
              border: '1px dashed #3b3b3b',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text type="secondary" style={{ fontSize: '12px' }}>
              (No popup cards configured)
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
};
