import React from 'react';
import { Card as AntCard } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import { PictureCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';

interface PictureCardRendererProps {
  card: PictureCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Picture card type
 * Displays a static image
 */
export const PictureCardRenderer: React.FC<PictureCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const hasImage = card.image && card.image.length > 0;
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
        padding: 0,
      }}
      styles={{
        body: {
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      },
      }}
      onClick={onClick}
      hoverable
    >
      {hasImage ? (
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <img
            src={card.image}
            alt="Picture card"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => {
              // Replace with placeholder on error
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
              }
            }}
          />
          {/* Error placeholder */}
          <div style={{
            display: 'none',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#666',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <PictureOutlined style={{ fontSize: '48px' }} />
            <div style={{ fontSize: '12px' }}>Image not found</div>
          </div>
        </div>
      ) : (
        // No image placeholder
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: '#666',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <PictureOutlined style={{ fontSize: '48px' }} />
          <div style={{ fontSize: '12px' }}>No image configured</div>
        </div>
      )}
    </AntCard>
  );
};
