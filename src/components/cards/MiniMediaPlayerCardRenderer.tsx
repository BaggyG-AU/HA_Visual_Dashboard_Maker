import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import { getCardBackgroundStyle } from '../../utils/backgroundStyle';
import { useHAEntities } from '../../contexts/HAEntityContext';
import { useEntityContextValue } from '../../hooks/useEntityContext';
import { MdiIcon } from '../MdiIcon';

const { Text } = Typography;

export interface MiniMediaPlayerCardConfig {
  type: string;
  entity?: string;
  name?: string;
  icon?: string;
  artwork?: 'none' | 'cover' | 'full-cover' | 'material' | 'default';
  hide?: Record<string, boolean>;
  volume_stateless?: boolean;
  style?: string;
  [key: string]: unknown;
}

interface MiniMediaPlayerCardRendererProps {
  card: MiniMediaPlayerCardConfig;
  isSelected?: boolean;
  onClick?: () => void;
}

const PLAYING_STATES = new Set(['playing', 'on']);

/**
 * Visual renderer for `custom:mini-media-player` (HACS).
 *
 * ⚠ It was offered in HAVDM's palette with no renderer AND already had a
 * dedicated property form at `PropertiesPanel.tsx:6138` — so HAVDM would let
 * you configure, in detail, a card it then drew as a question mark.
 *
 * ⭐ The card's whole point is being COMPACT — one row of artwork, title and
 * transport, with an optional volume bar — so this is deliberately not a copy
 * of `MediaPlayerCardRenderer`'s full-size layout.
 */
export const MiniMediaPlayerCardRenderer: React.FC<MiniMediaPlayerCardRendererProps> = ({
  card,
  isSelected = false,
  onClick,
}) => {
  const { getEntity } = useHAEntities();
  const entity = card.entity ? getEntity(card.entity) : null;
  const state = entity?.state ?? 'unavailable';
  const attributes = entity?.attributes ?? {};

  const resolvedName = useEntityContextValue(card.name ?? '', card.entity ?? null);
  const displayName =
    (card.name ? resolvedName : '') ||
    (attributes.friendly_name as string | undefined) ||
    card.entity?.split('.')[1]?.replace(/_/g, ' ') ||
    'Media player';

  const title = (attributes.media_title as string | undefined) ?? '';
  const artist =
    (attributes.media_artist as string | undefined) ??
    (attributes.media_series_title as string | undefined) ??
    (attributes.app_name as string | undefined) ??
    '';
  const artwork =
    card.artwork !== 'none' && typeof attributes.entity_picture === 'string'
      ? (attributes.entity_picture as string)
      : undefined;

  const isPlaying = PLAYING_STATES.has(state);
  // `hide:` is the card's own map of suppressed sections; honouring it is what
  // makes a configured mini player look like the user's configuration.
  const hide = card.hide ?? {};
  const showVolume = hide.volume !== true;
  const showControls = hide.controls !== true;

  const volumeLevel = Number(attributes.volume_level);
  const volumePercent = Number.isFinite(volumeLevel)
    ? Math.min(100, Math.max(0, volumeLevel * 100))
    : undefined;

  const backgroundStyle = getCardBackgroundStyle(
    card.style,
    isSelected ? 'rgba(0, 217, 255, 0.1)' : '#1f1f1f',
  );

  return (
    <AntCard
      size="small"
      data-testid="ha-mini-media-player-card"
      data-playing={isPlaying ? 'true' : 'false'}
      style={{
        height: '100%',
        cursor: 'pointer',
        border: isSelected ? '2px solid #00d9ff' : '1px solid #434343',
        ...backgroundStyle,
        transition: 'all 0.3s ease',
      }}
      styles={{
        body: {
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100%',
          gap: 8,
          overflow: 'hidden',
        },
      }}
      onClick={onClick}
      hoverable
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div
          data-testid="mini-media-player-artwork"
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            flexShrink: 0,
            background: 'rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {artwork ? (
            <img
              src={artwork}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <MdiIcon
              icon={card.icon || 'mdi:speaker'}
              color={isPlaying ? '#00d9ff' : '#8a8a8a'}
              size={18}
            />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Text
            ellipsis
            strong
            data-testid="mini-media-player-name"
            style={{
              display: 'block',
              color: '#e6e6e6',
              fontSize: 13,
              textTransform: 'capitalize',
            }}
          >
            {displayName}
          </Text>
          <Text
            ellipsis
            type="secondary"
            data-testid="mini-media-player-media"
            style={{ display: 'block', fontSize: 11 }}
          >
            {/* Falling back to the STATE rather than blank keeps an idle player
                readable — "idle" is information, an empty line is not. */}
            {title ? (artist ? `${title} · ${artist}` : title) : state}
          </Text>
        </div>

        {showControls && (
          <div style={{ display: 'flex', gap: 6 }} data-testid="mini-media-player-controls">
            {['mdi:skip-previous', isPlaying ? 'mdi:pause' : 'mdi:play', 'mdi:skip-next'].map(
              (icon) => (
                <MdiIcon key={icon} icon={icon} color="#c4c4c4" size={16} />
              ),
            )}
          </div>
        )}
      </div>

      {showVolume && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MdiIcon icon="mdi:volume-high" color="#8a8a8a" size={13} />
          <div
            data-testid="mini-media-player-volume"
            style={{ flex: 1, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.12)' }}
          >
            <div
              style={{
                width: `${volumePercent ?? 0}%`,
                height: '100%',
                borderRadius: 999,
                background: '#00d9ff',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}
    </AntCard>
  );
};
