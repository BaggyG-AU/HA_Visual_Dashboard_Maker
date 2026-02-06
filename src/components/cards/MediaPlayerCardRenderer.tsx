import React from 'react';
import { Card as AntCard, Typography, Progress } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  SoundOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import { MediaPlayerCard } from '../../types/dashboard';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { useEntityContextValue } from '../../hooks/useEntityContext';

const { Text } = Typography;

interface MediaPlayerCardRendererProps {
  card: MediaPlayerCard;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Visual renderer for Media Player card type (media-control)
 * Displays media player controls and current playback info
 */
export const MediaPlayerCardRenderer: React.FC<MediaPlayerCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;

  // Extract media player properties
  const state = entity?.state || 'off';
  const attributes = entity?.attributes || {};

  const mediaTitle = attributes.media_title || 'No media';
  const mediaArtist = attributes.media_artist || '';
  const mediaAlbum = attributes.media_album_name || '';
  const volumeLevel = attributes.volume_level ? Math.round(attributes.volume_level * 100) : 0;
  const mediaDuration = attributes.media_duration || 0;
  const mediaPosition = attributes.media_position || 0;
  const entityPicture = attributes.entity_picture;

  const resolvedName = useEntityContextValue(card.name ?? '', card.entity ?? null);
  const displayName =
    (card.name ? resolvedName : '') ||
    attributes.friendly_name ||
    card.entity?.split('.')[1]?.replace(/_/g, ' ') ||
    'Media Player';
  const backgroundStyle = getCardBackgroundStyle(card.style, isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f');

  // Determine if player is playing
  const isPlaying = state === 'playing';
  const isPaused = state === 'paused';
  const isIdle = state === 'idle';
  const isOff = state === 'off' || state === 'unavailable' || state === 'unknown';

  // Calculate progress percentage
  const progressPercent = mediaDuration > 0 ? (mediaPosition / mediaDuration) * 100 : 0;

  // Format time (seconds to mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get state color
  const getStateColor = () => {
    if (isPlaying) return '#4caf50'; // Green
    if (isPaused) return '#ff9800'; // Orange
    if (isIdle) return '#03a9f4'; // Blue
    return '#666'; // Gray (off)
  };

  const stateColor = getStateColor();

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
        height: '100%',
        gap: '12px',
      },
      }}
      onClick={onClick}
      hoverable
    >
      {/* Header with name and state */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Text strong style={{ color: '#e6e6e6', fontSize: '14px' }}>
          {displayName}
        </Text>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
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
              fontSize: '12px',
              color: stateColor,
              textTransform: 'capitalize',
            }}
          >
            {state}
          </Text>
        </div>
      </div>

      {/* Album art and media info */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flex: 1,
      }}>
        {/* Album art */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {entityPicture ? (
            <img
              src={entityPicture}
              alt="Album art"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              color: '#666',
            }}>
              🎵
            </div>
          )}
        </div>

        {/* Media info */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '4px',
          minWidth: 0,
        }}>
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
            {mediaTitle}
          </Text>
          {mediaArtist && (
            <Text
              style={{
                color: '#999',
                fontSize: '12px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {mediaArtist}
            </Text>
          )}
          {mediaAlbum && (
            <Text
              type="secondary"
              style={{
                fontSize: '11px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {mediaAlbum}
            </Text>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {!isOff && mediaDuration > 0 && (
        <div style={{ marginTop: 'auto' }}>
          <Progress
            percent={progressPercent}
            showInfo={false}
            strokeColor={stateColor}
            trailColor="rgba(255, 255, 255, 0.1)"
            size="small"
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '4px',
          }}>
            <Text type="secondary" style={{ fontSize: '10px' }}>
              {formatTime(mediaPosition)}
            </Text>
            <Text type="secondary" style={{ fontSize: '10px' }}>
              {formatTime(mediaDuration)}
            </Text>
          </div>
        </div>
      )}

      {/* Control buttons */}
      {!isOff && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '8px',
          marginTop: 'auto',
        }}>
          <StepBackwardOutlined
            style={{
              fontSize: '20px',
              color: '#999',
              cursor: 'not-allowed',
            }}
          />
          {isPlaying ? (
            <PauseCircleOutlined
              style={{
                fontSize: '32px',
                color: stateColor,
                cursor: 'not-allowed',
              }}
            />
          ) : (
            <PlayCircleOutlined
              style={{
                fontSize: '32px',
                color: stateColor,
                cursor: 'not-allowed',
              }}
            />
          )}
          <StepForwardOutlined
            style={{
              fontSize: '20px',
              color: '#999',
              cursor: 'not-allowed',
            }}
          />
        </div>
      )}

      {/* Volume indicator */}
      {!isOff && volumeLevel > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <SoundOutlined style={{ fontSize: '14px', color: '#999' }} />
          <Progress
            percent={volumeLevel}
            showInfo={false}
            strokeColor="#03a9f4"
            trailColor="rgba(255, 255, 255, 0.1)"
            size="small"
            style={{ flex: 1 }}
          />
          <Text type="secondary" style={{ fontSize: '11px', minWidth: '35px' }}>
            {volumeLevel}%
          </Text>
        </div>
      )}

      {/* Off state */}
      {isOff && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: '#666',
        }}>
          <PoweroffOutlined style={{ fontSize: '48px' }} />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {state === 'unavailable' ? 'Unavailable' : 'Off'}
          </Text>
        </div>
      )}

      {/* No entity warning */}
      {!entity && card.entity && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#666',
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {card.entity}
          </Text>
        </div>
      )}
    </AntCard>
  );
};
