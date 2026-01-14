import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { PictureOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { PictureEntityCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { useEntityContextValue } from '../../hooks/useEntityContext';

const { Text } = Typography;

interface PictureEntityCardRendererProps {
  card: PictureEntityCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Picture Entity card type
 * Displays an image with entity state overlay
 */
export const PictureEntityCardRenderer: React.FC<PictureEntityCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;

  // Extract entity properties
  const state = entity?.state || 'unknown';
  const attributes = entity?.attributes || {};
  const resolvedName = useEntityContextValue(card.name ?? '', card.entity ?? null);
  const displayName =
    (card.name ? resolvedName : '') ||
    attributes.friendly_name ||
    card.entity?.split('.')[1]?.replace(/_/g, ' ') ||
    'Entity';

  const showName = card.show_name !== false;
  const showState = card.show_state !== false;
  const hasImage = card.image && card.image.length > 0;
  const hasCameraImage = card.camera_image && card.camera_image.length > 0;
  const cameraView = card.camera_view || 'auto';

  // Determine state color
  const getStateColor = () => {
    if (!entity) return '#666';

    switch (state.toLowerCase()) {
      case 'on':
      case 'open':
      case 'active':
      case 'home':
        return '#4caf50'; // Green
      case 'off':
      case 'closed':
      case 'inactive':
      case 'away':
        return '#666'; // Gray
      case 'unavailable':
      case 'unknown':
        return '#f44336'; // Red
      default:
        return '#03a9f4'; // Blue
    }
  };

  const stateColor = getStateColor();
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
        position: 'relative',
      },
      }}
      onClick={onClick}
      hoverable
    >
      {/* Background image */}
      {hasImage ? (
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <img
            src={card.image}
            alt={displayName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => {
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
        // No image placeholder - show camera icon if camera is configured
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: hasCameraImage ? '#1890ff' : '#666',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {hasCameraImage ? (
            <>
              <VideoCameraOutlined style={{ fontSize: '48px' }} />
              <div style={{ fontSize: '12px' }}>
                Camera: {card.camera_image?.split('.')[1]?.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: '11px', color: '#888' }}>
                View: {cameraView === 'live' ? 'Live Stream' : 'Auto (Snapshot)'}
              </div>
            </>
          ) : (
            <>
              <PictureOutlined style={{ fontSize: '48px' }} />
              <div style={{ fontSize: '12px' }}>No image configured</div>
            </>
          )}
        </div>
      )}

      {/* Overlay with name and state */}
      {(showName || showState) && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {showName && (
            <Text strong style={{ color: '#fff', fontSize: '16px' }}>
              {displayName}
            </Text>
          )}
          {showState && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: stateColor,
                  boxShadow: `0 0 8px ${stateColor}`,
                }}
              />
              <Text
                style={{
                  color: stateColor,
                  fontSize: '14px',
                  textTransform: 'capitalize',
                  fontWeight: 500,
                }}
              >
                {state}
              </Text>
            </div>
          )}
        </div>
      )}

      {/* No entity warning (top corner) */}
      {!entity && card.entity && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          backgroundColor: 'rgba(244, 67, 54, 0.9)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
        }}>
          Entity not found
        </div>
      )}
    </AntCard>
  );
};
