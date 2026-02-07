import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useEntityContextResolver } from '../../hooks/useEntityContext';
import type { SwiperCardConfig } from '../../features/carousel/types';
import { SwiperCarousel } from '../../features/carousel/SwiperCarousel';

const { Text } = Typography;

interface SwiperCardRendererProps {
  card: SwiperCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Swiper carousel card type
 * Displays child cards inside Swiper slides
 */
export const SwiperCardRenderer: React.FC<SwiperCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const resolveContext = useEntityContextResolver();
  const resolvedTitle = card.title ? resolveContext(card.title, null) : '';
  const hasTitle = Boolean(card.title);
  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f'
  );

  return (
    <AntCard
      size="small"
      title={hasTitle ? resolvedTitle : undefined}
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        ...backgroundStyle,
        transition: 'all 0.3s ease',
      }}
      headStyle={{
        borderBottom: '1px solid #434343',
        color: '#e6e6e6',
        fontSize: '14px',
        fontWeight: 'bold',
      }}
      bodyStyle={{
        padding: 0,
        height: hasTitle ? 'calc(100% - 48px)' : '100%',
        overflow: 'hidden',
      }}
      onClick={onClick}
      hoverable
      data-testid="swiper-card"
    >
      <SwiperCarousel card={card} isSelected={isSelected} onCardClick={onClick} />

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
          fontWeight: 'bold',
          pointerEvents: 'none',
        }}>
          <SwapOutlined style={{ marginRight: '4px' }} />
          CAROUSEL
        </div>
      )}

      {!card.cards?.length && !card.slides?.length && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          padding: '4px 8px',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          borderRadius: '4px',
        }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Add cards to slides in YAML or Properties Panel
          </Text>
        </div>
      )}
    </AntCard>
  );
};
